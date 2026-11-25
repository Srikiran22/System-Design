import { useSyncExternalStore } from "react";
import type { EvidenceType, VerificationTier } from "./types";

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

export type SyncStateKind = "guest" | "idle" | "syncing" | "synced" | "offline" | "error";

export interface SyncStatus {
  state: SyncStateKind;
  pendingEvents: number;
  pendingEvidence: number;
  lastSyncedAt: string | null;
  lastError: string | null;
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
    evMap.set(`${e.kind}::${e.ref}`, e);
  }
  for (const e of items.events ?? []) {
    const k = `${e.kind}::${e.ref}`;
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

/** Remove acknowledged batch items from the user's outbox ONLY after server confirmation. */
export function acknowledgeOutboxBatch(
  userId: string,
  acked: {
    events: QueuedEventRow[];
    evidence: QueuedEvidenceRow[];
    snapshotAcked?: boolean;
  },
  storage: StorageLike | null = defaultStorage(),
): UserOutbox {
  const current = readOutbox(userId, storage);
  const ackedEventKeys = new Set(acked.events.map((e) => `${e.kind}::${e.ref}`));
  const ackedEvidenceKeys = new Set(acked.evidence.map((e) => e.idempotency_key));

  const next: UserOutbox = {
    events: current.events.filter((e) => !ackedEventKeys.has(`${e.kind}::${e.ref}`)),
    evidence: current.evidence.filter((e) => !ackedEvidenceKeys.has(e.idempotency_key)),
    includeSnapshot: acked.snapshotAcked ? false : current.includeSnapshot,
  };
  writeOutbox(userId, next, storage);
  return next;
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

/** Capped exponential backoff (2s, 4s, 8s, 16s, 32s, max 60s). */
export function nextBackoffMs(retryCount: number): number {
  const clamped = Math.max(0, Math.min(retryCount, 6));
  return Math.min(60_000, 2_000 * 2 ** clamped);
}

// --- Reactive Sync Status store for UI components ---

const DEFAULT_STATUS: SyncStatus = {
  state: "guest",
  pendingEvents: 0,
  pendingEvidence: 0,
  lastSyncedAt: null,
  lastError: null,
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
