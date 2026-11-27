import { useSyncExternalStore } from "react";
import type { EvidenceType, VerificationTier } from "./types";

export const MAX_SYNC_RETRIES = 6;

export interface QueuedEventRow {
  kind: "lesson" | "lab" | "quiz" | "explain" | "article";
  ref: string;
  discipline: "st" | "sd" | "en" | null;
  occurred_on: string;
}

export interface QueuedEvidenceRow {
  idempotency_key: string;
  skill_id: string;
  evidence_type: EvidenceType;
  ref: string;
  score: number;
  weight: number;
  confidence: number | null;
  verification_tier: VerificationTier;
  rubric_version: string | null;
  rubric_scores_json: string | null;
  artifact_url: string | null;
  artifact_notes: string | null;
  occurred_at: string;
}

export interface UserOutbox {
  events: QueuedEventRow[];
  evidence: QueuedEvidenceRow[];
  includeSnapshot: boolean;
}

export interface RecordEventsAck {
  acceptedEventKeys: string[];
  rejectedEventKeys: string[];
  acceptedEvidenceKeys: string[];
  rejectedEvidenceKeys: string[];
  snapshotSaved: boolean;
  snapshotConflict?: boolean;
  snapshotVersion?: number;
  serverVersion: number;
  partialFailure: boolean;
  syncedEvents: number;
  syncedEvidence: number;
  notice?: string;
}

export type SyncStateKind =
  | "guest"
  | "idle"
  | "pending"
  | "syncing"
  | "synced"
  | "partially_synced"
  | "offline"
  | "needs_attention";

export interface SyncStatus {
  state: SyncStateKind;
  pendingEvents: number;
  pendingEvidence: number;
  snapshotPending: boolean;
  lastSyncedAt: string | null;
  lastServerVersion: number | null;
  lastError: string | null;
  lastNotice: string | null;
  retryCount: number;
}

const OUTBOX_PREFIX = "neet.outbox.v1.";
const BACKFILL_PREFIX = "neet.backfilled.v2.";

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function defaultStorage(): StorageLike | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function eventOutboxKey(e: Pick<QueuedEventRow, "kind" | "ref">): string {
  return `${e.kind}::${e.ref}`;
}

/**
 * Server-authoritative verification tier sanitization for learner-submitted evidence.
 * Learners can NEVER self-assign "reviewer-verified" or elevate self-scored rubrics
 * to "rubric-evaluated" on the server.
 */
export function sanitizeLearnerVerificationTier(
  evidenceType: EvidenceType,
  requestedTier: VerificationTier,
): VerificationTier {
  if (evidenceType === "quiz") return "automated-check";
  if (evidenceType === "variant" && requestedTier === "automated-check") {
    return "automated-check";
  }
  return "self-assessed";
}

export function outboxKey(userId: string): string {
  return `${OUTBOX_PREFIX}${userId}`;
}

export function backfillKey(userId: string): string {
  return `${BACKFILL_PREFIX}${userId}`;
}

const EMPTY_OUTBOX: UserOutbox = { events: [], evidence: [], includeSnapshot: false };

export function readOutbox(
  userId: string,
  storage: StorageLike | null = defaultStorage(),
): UserOutbox {
  if (!storage || !userId) return { ...EMPTY_OUTBOX, events: [], evidence: [] };
  try {
    const raw = storage.getItem(outboxKey(userId));
    if (!raw) return { ...EMPTY_OUTBOX, events: [], evidence: [] };
    const parsed = JSON.parse(raw) as Partial<UserOutbox>;
    return {
      events: Array.isArray(parsed.events) ? parsed.events : [],
      evidence: Array.isArray(parsed.evidence) ? parsed.evidence : [],
      includeSnapshot: Boolean(parsed.includeSnapshot),
    };
  } catch {
    return { ...EMPTY_OUTBOX, events: [], evidence: [] };
  }
}

export function writeOutbox(
  userId: string,
  outbox: UserOutbox,
  storage: StorageLike | null = defaultStorage(),
): void {
  if (!storage || !userId) return;
  try {
    if (outbox.events.length === 0 && outbox.evidence.length === 0 && !outbox.includeSnapshot) {
      storage.removeItem(outboxKey(userId));
    } else {
      storage.setItem(outboxKey(userId), JSON.stringify(outbox));
    }
  } catch {
    /* ignore quota errors */
  }
}

/** Enqueue events and/or evidence into a strictly user-namespaced durable outbox with deduplication. */
export function enqueueOutboxItems(
  userId: string,
  items: {
    events?: QueuedEventRow[];
    evidence?: QueuedEvidenceRow[];
    includeSnapshot?: boolean;
  },
  storage: StorageLike | null = defaultStorage(),
): UserOutbox {
  const current = readOutbox(userId, storage);

  // Deduplicate events by (kind, ref), keeping the earliest occurred_on date if already queued
  const evMap = new Map<string, QueuedEventRow>();
  for (const e of current.events) {
    evMap.set(eventOutboxKey(e), e);
  }
  for (const e of items.events ?? []) {
    const k = eventOutboxKey(e);
    if (!evMap.has(k)) {
      evMap.set(k, {
        kind: e.kind,
        ref: e.ref.slice(0, 200),
        discipline: e.discipline,
        occurred_on: e.occurred_on,
      });
    }
  }

  // Deduplicate evidence by idempotency_key (latest wins)
  const evidenceMap = new Map<string, QueuedEvidenceRow>();
  for (const ev of current.evidence) {
    evidenceMap.set(ev.idempotency_key, ev);
  }
  for (const ev of items.evidence ?? []) {
    evidenceMap.set(ev.idempotency_key, ev);
  }

  const next: UserOutbox = {
    events: Array.from(evMap.values()).slice(-1000),
    evidence: Array.from(evidenceMap.values()).slice(-1000),
    includeSnapshot: current.includeSnapshot || Boolean(items.includeSnapshot),
  };
  writeOutbox(userId, next, storage);
  return next;
}

/**
 * Remove ONLY server-confirmed event keys, evidence idempotency keys, and snapshot flag.
 * Unconfirmed / rejected keys stay safely queued for retry.
 */
export function acknowledgeOutboxByKeys(
  userId: string,
  acked: {
    acceptedEventKeys: string[];
    acceptedEvidenceKeys: string[];
    snapshotAcked: boolean;
  },
  storage: StorageLike | null = defaultStorage(),
): UserOutbox {
  const current = readOutbox(userId, storage);
  const ackedEventSet = new Set(acked.acceptedEventKeys);
  const ackedEvidenceSet = new Set(acked.acceptedEvidenceKeys);

  const next: UserOutbox = {
    events: current.events.filter((e) => !ackedEventSet.has(eventOutboxKey(e))),
    evidence: current.evidence.filter((e) => !ackedEvidenceSet.has(e.idempotency_key)),
    includeSnapshot: acked.snapshotAcked ? false : current.includeSnapshot,
  };
  writeOutbox(userId, next, storage);
  return next;
}

/** Backward-compatible wrapper accepting row arrays. */
export function acknowledgeOutboxBatch(
  userId: string,
  acked: {
    events: QueuedEventRow[];
    evidence: QueuedEvidenceRow[];
    snapshotAcked?: boolean;
  },
  storage: StorageLike | null = defaultStorage(),
): UserOutbox {
  return acknowledgeOutboxByKeys(
    userId,
    {
      acceptedEventKeys: acked.events.map(eventOutboxKey),
      acceptedEvidenceKeys: acked.evidence.map((e) => e.idempotency_key),
      snapshotAcked: Boolean(acked.snapshotAcked),
    },
    storage,
  );
}

export function isUserBackfilled(
  userId: string,
  storage: StorageLike | null = defaultStorage(),
): boolean {
  if (!storage || !userId) return false;
  try {
    return storage.getItem(backfillKey(userId)) === "1";
  } catch {
    return false;
  }
}

export function markUserBackfilled(
  userId: string,
  storage: StorageLike | null = defaultStorage(),
): void {
  if (!storage || !userId) return;
  try {
    storage.setItem(backfillKey(userId), "1");
  } catch {
    /* ignore */
  }
}

/**
 * Bounded exponential backoff with ±20% jitter (2s, 4s, 8s, 16s, 32s, max 60s).
 * Accepts optional jitterUnit in [0, 1] for deterministic unit testing.
 */
export function nextBackoffMs(retryCount: number, jitterUnit = Math.random()): number {
  const clamped = Math.max(0, Math.min(retryCount, MAX_SYNC_RETRIES));
  const base = Math.min(60_000, 2_000 * 2 ** clamped);
  const unit = Math.max(0, Math.min(1, jitterUnit));
  const jitterFactor = 0.8 + unit * 0.4; // 0.8 .. 1.2
  return Math.max(1_000, Math.min(60_000, Math.round(base * jitterFactor)));
}

// --- Reactive Sync Status store for UI components ---

const DEFAULT_STATUS: SyncStatus = {
  state: "guest",
  pendingEvents: 0,
  pendingEvidence: 0,
  snapshotPending: false,
  lastSyncedAt: null,
  lastServerVersion: null,
  lastError: null,
  lastNotice: null,
  retryCount: 0,
};

let statusSnapshot: SyncStatus = DEFAULT_STATUS;
const statusListeners = new Set<() => void>();

export function setSyncStatus(patch: Partial<SyncStatus>): void {
  statusSnapshot = { ...statusSnapshot, ...patch };
  statusListeners.forEach((l) => l());
}

export function resetSyncStatus(state: SyncStateKind = "guest"): void {
  statusSnapshot = { ...DEFAULT_STATUS, state };
  statusListeners.forEach((l) => l());
}

export function getSyncStatus(): SyncStatus {
  return statusSnapshot;
}

export function useSyncStatus(): SyncStatus {
  return useSyncExternalStore(
    (cb) => {
      statusListeners.add(cb);
      return () => statusListeners.delete(cb);
    },
    getSyncStatus,
    () => DEFAULT_STATUS,
  );
}

/** Trigger an immediate retry flush from UI controls (e.g., SyncBadge). */
export function requestManualSyncRetry(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("neet:sync-retry"));
  }
}
