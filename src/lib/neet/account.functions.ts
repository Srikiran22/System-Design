import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  requireReviewerOrAdmin,
  requireVerifiedAuth,
  type VerifiedAuthContext,
} from "./auth-server";
import { logEvent, safeUserRef } from "./logger";
import { MAX_PG_INT4 } from "./progress-math";
import {
  eventOutboxKey,
  sanitizeLearnerVerificationTier,
  type RecordEventsAck,
} from "./sync-outbox";
import { enforceRateLimit, RateLimitError } from "./rate-limit.server";
import { measureOperation, recordSyncMetrics } from "./metrics.server";
import type {
  LearnerDossier,
  LearnerEvidenceRecord,
  PaginatedResult,
  UserEvent,
} from "./db.server";

export { sanitizeLearnerVerificationTier, type RecordEventsAck };

const EVIDENCE_COLUMNS =
  "idempotency_key, skill_id, evidence_type, ref, score, weight, confidence, verification_tier, rubric_version, rubric_scores_json, artifact_url, artifact_notes, occurred_at";

/** Every account call returns a typed result instead of throwing, so the UI can always degrade gracefully. */
export type Result<T> = { data: T; error: null } | { data: null; error: string };

const ok = <T>(data: T): Result<T> => ({ data, error: null });
const fail = (msg: string, detail?: unknown, requestId?: string): Result<never> => {
  if (detail) logEvent("error", "account", msg, { detail }, requestId);
  return { data: null, error: msg };
};

function checkBucket(
  bucket: "write" | "sync" | "export" | "admin",
  userId: string,
): Result<never> | null {
  try {
    enforceRateLimit(bucket, userId);
    return null;
  } catch (err) {
    if (err instanceof RateLimitError) {
      return { data: null, error: err.message };
    }
    throw err;
  }
}

export interface Me {
  profile: {
    display_name: string;
    initials: string;
    signature_seed: number;
    signed_at: string | null;
  };
  goals: { id: string; text: string }[];
  events: { kind: string; ref: string; discipline: string | null; occurred_on: string }[];
  evidence: LearnerEvidenceRecord[];
  authMode: "supabase" | "local_dev";
}

export type AccountAuthContext = VerifiedAuthContext;

/** Fail-closed verified auth middleware (kept under both names for import compatibility). */
export const resilientAuth = requireVerifiedAuth;
export { requireVerifiedAuth };

/** Validates YYYY-MM-DD represents a real Gregorian calendar date. */
export function isValidCalendarDate(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const [yStr, mStr, dStr] = dateStr.split("-");
  const y = Number(yStr);
  const m = Number(mStr);
  const d = Number(dStr);
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

/**
 * Minimal typed escape hatch for tables managed via Lovable Cloud migrations
 * (`learner_evidence`, `learner_state_snapshots`, `audit_log`) that are not yet
 * reflected in auto-generated `src/integrations/supabase/types.ts`.
 */
type DynamicQueryResult<T = unknown> = Promise<{
  data: T | null;
  error: { message: string; code?: string } | null;
  count?: number | null;
}>;

interface DynamicTableBuilder {
  select(
    columns?: string,
    opts?: { count?: "exact"; head?: boolean },
  ): DynamicTableBuilder & DynamicQueryResult<Record<string, unknown>[]>;
  eq(
    col: string,
    val: unknown,
  ): DynamicTableBuilder & DynamicQueryResult<Record<string, unknown>[]>;
  order(
    col: string,
    opts?: { ascending?: boolean },
  ): DynamicTableBuilder & DynamicQueryResult<Record<string, unknown>[]>;
  range(from: number, to: number): DynamicQueryResult<Record<string, unknown>[]>;
  limit(n: number): DynamicQueryResult<Record<string, unknown>[]>;
  maybeSingle(): DynamicQueryResult<Record<string, unknown>>;
  upsert(
    rows: Record<string, unknown> | Record<string, unknown>[],
    opts?: { onConflict?: string; ignoreDuplicates?: boolean },
  ): DynamicQueryResult;
  update(patch: Record<string, unknown>): DynamicTableBuilder & DynamicQueryResult;
  insert(rows: Record<string, unknown> | Record<string, unknown>[]): DynamicQueryResult;
}

function dynamicFrom(supabase: NonNullable<VerifiedAuthContext["supabase"]>, table: string) {
  return (supabase as unknown as { from: (t: string) => DynamicTableBuilder }).from(table);
}

function safeProcessUptimeSeconds(): number {
  return typeof process !== "undefined" && typeof process.uptime === "function"
    ? Math.floor(process.uptime())
    : 0;
}

function mapSupabaseEvidenceRow(row: Record<string, unknown>): LearnerEvidenceRecord {
  return {
    idempotency_key: String(row["idempotency_key"] ?? ""),
    skill_id: String(row["skill_id"] ?? ""),
    evidence_type: String(row["evidence_type"] ?? "lab"),
    ref: String(row["ref"] ?? ""),
    score: Number(row["score"] ?? 0),
    weight: Number(row["weight"] ?? 1),
    confidence:
      row["confidence"] === null || row["confidence"] === undefined
        ? null
        : Number(row["confidence"]),
    verification_tier: String(row["verification_tier"] ?? "self-assessed"),
    rubric_version: row["rubric_version"] ? String(row["rubric_version"]) : null,
    rubric_scores_json: row["rubric_scores_json"]
      ? typeof row["rubric_scores_json"] === "string"
        ? row["rubric_scores_json"]
        : JSON.stringify(row["rubric_scores_json"])
      : null,
    artifact_url: row["artifact_url"] ? String(row["artifact_url"]) : null,
    artifact_notes: row["artifact_notes"] ? String(row["artifact_notes"]) : null,
    occurred_at: String(row["occurred_at"] ?? new Date().toISOString()),
  };
}

export const getMe = createServerFn({ method: "GET" })
  .middleware([requireVerifiedAuth])
  .handler(async ({ context }): Promise<Result<Me>> =>
    measureOperation("account.getMe", async () => {
      const { supabase, userId, authMode, requestId } = context;

      if (authMode === "local_dev" || !supabase) {
        const { localDb } = await import("./db.server");
        const r = localDb.getMe(userId);
        if (r.error || !r.data) return fail(r.error || "Couldn't load your profile.");
        return ok({
          ...r.data,
          evidence: localDb.listLearnerEvidence(userId),
          authMode: "local_dev",
        });
      }

      // Production canonical path: Supabase ONLY (never imports db.server / node:sqlite)
      try {
        const [p, g, e, evRes] = await Promise.all([
          supabase
            .from("profiles")
            .select("display_name, initials, signature_seed, signed_at")
            .eq("id", userId)
            .maybeSingle(),
          supabase
            .from("learning_goals")
            .select("id, text")
            .eq("user_id", userId)
            .order("created_at"),
          supabase
            .from("progress_events")
            .select("kind, ref, discipline, occurred_on")
            .eq("user_id", userId)
            .order("occurred_on")
            .limit(5000),
          dynamicFrom(supabase, "learner_evidence")
            .select(EVIDENCE_COLUMNS)
            .eq("user_id", userId)
            .order("occurred_at", { ascending: true })
            .limit(2000)
            .catch(() => ({ data: null, error: { message: "unavailable" } })),
        ]);
        if (p.error || g.error || e.error) {
          return fail(
            "Account service temporarily unavailable.",
            p.error ?? g.error ?? e.error,
            requestId,
          );
        }
        let profile = p.data;
        if (!profile) {
          const ins = await supabase
            .from("profiles")
            .insert({ id: userId, display_name: "", initials: "U" })
            .select("display_name, initials, signature_seed, signed_at")
            .single();
          if (ins.error) return fail("Couldn't initialize your profile.", ins.error, requestId);
          profile = ins.data;
        }
        const evidence =
          !evRes.error && Array.isArray(evRes.data) ? evRes.data.map(mapSupabaseEvidenceRow) : [];
        return ok({
          profile,
          goals: g.data ?? [],
          events: e.data ?? [],
          evidence,
          authMode: "supabase",
        });
      } catch (err) {
        return fail("Account service temporarily unavailable.", err, requestId);
      }
    }),
  );

const signSchema = z.object({
  displayName: z.string().trim().min(1).max(80),
  initials: z
    .string()
    .trim()
    .regex(/^[A-Z]{1,3}$/),
  seed: z.number().int().min(1).max(MAX_PG_INT4),
  goal: z.string().trim().min(1).max(200),
});

export const signCommitment = createServerFn({ method: "POST" })
  .middleware([requireVerifiedAuth])
  .validator((input: unknown) => signSchema.parse(input))
  .handler(async ({ data, context }): Promise<Result<true>> =>
    measureOperation("account.signCommitment", async () => {
      const { supabase, userId, authMode, requestId } = context;
      const rl = checkBucket("write", userId);
      if (rl) return rl;

      if (authMode === "local_dev" || !supabase) {
        const { localDb } = await import("./db.server");
        return localDb.signCommitment(userId, data);
      }

      try {
        const up = await supabase.from("profiles").upsert({
          id: userId,
          display_name: data.displayName,
          initials: data.initials,
          signature_seed: data.seed,
          signed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        if (up.error) return fail("Couldn't save your signature.", up.error, requestId);

        const existing = await supabase
          .from("learning_goals")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId);
        if ((existing.count ?? 0) < 3) {
          const g = await supabase
            .from("learning_goals")
            .insert({ user_id: userId, text: data.goal });
          if (g.error) {
            logEvent(
              "warn",
              "account",
              "goal_insert_after_sign_failed",
              { detail: g.error },
              requestId,
            );
          }
        }
        return ok(true);
      } catch (err) {
        return fail("Couldn't save your signature.", err, requestId);
      }
    }),
  );

export const addGoal = createServerFn({ method: "POST" })
  .middleware([requireVerifiedAuth])
  .validator((input: unknown) => z.object({ text: z.string().trim().min(1).max(200) }).parse(input))
  .handler(async ({ data, context }): Promise<Result<true>> =>
    measureOperation("account.addGoal", async () => {
      const { supabase, userId, authMode, requestId } = context;
      const rl = checkBucket("write", userId);
      if (rl) return rl;

      if (authMode === "local_dev" || !supabase) {
        const { localDb } = await import("./db.server");
        return localDb.addGoal(userId, data.text);
      }

      try {
        const r = await supabase
          .from("learning_goals")
          .insert({ user_id: userId, text: data.text });
        if (r.error) {
          if (r.error.message.includes("up to 3")) {
            return fail("You can keep up to 3 learning goals.");
          }
          return fail("Couldn't add that goal.", r.error, requestId);
        }
        return ok(true);
      } catch (err) {
        return fail("Couldn't add that goal.", err, requestId);
      }
    }),
  );

export const removeGoal = createServerFn({ method: "POST" })
  .middleware([requireVerifiedAuth])
  .validator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }): Promise<Result<true>> =>
    measureOperation("account.removeGoal", async () => {
      const { supabase, userId, authMode, requestId } = context;
      const rl = checkBucket("write", userId);
      if (rl) return rl;

      if (authMode === "local_dev" || !supabase) {
        const { localDb } = await import("./db.server");
        return localDb.removeGoal(userId, data.id);
      }

      try {
        const r = await supabase
          .from("learning_goals")
          .delete()
          .eq("id", data.id)
          .eq("user_id", userId);
        if (r.error) return fail("Couldn't remove that goal.", r.error, requestId);
        return ok(true);
      } catch (err) {
        return fail("Couldn't remove that goal.", err, requestId);
      }
    }),
  );

const eventSchema = z.object({
  kind: z.enum(["lesson", "lab", "quiz", "explain", "article"]),
  ref: z.string().trim().min(1).max(200),
  discipline: z.enum(["st", "sd", "en"]).nullable(),
  occurred_on: z.string().refine(isValidCalendarDate, "Invalid calendar date (YYYY-MM-DD)"),
});

const evidenceInputSchema = z.object({
  idempotency_key: z.string().trim().min(1).max(200),
  skill_id: z.string().trim().min(1).max(100),
  evidence_type: z.enum(["quiz", "explain", "variant", "lab", "artifact", "review"]),
  ref: z.string().trim().min(1).max(200),
  score: z.number().min(0).max(1),
  weight: z.number().min(0.1).max(10),
  confidence: z.number().min(0).max(1).nullable(),
  verification_tier: z.enum([
    "self-assessed",
    "automated-check",
    "rubric-evaluated",
    "reviewer-verified",
  ]),
  rubric_version: z.string().max(40).nullable(),
  rubric_scores_json: z.string().max(4000).nullable(),
  artifact_url: z
    .string()
    .max(500)
    .refine(
      (u) => !u || /^https?:\/\//i.test(u) || (u.startsWith("/") && !u.startsWith("//")),
      "Artifact URL must use http(s) or a relative path",
    )
    .nullable(),
  artifact_notes: z.string().max(8000).nullable(),
  occurred_at: z.string().datetime({ offset: true }).or(z.string().min(10).max(40)),
});

export const recordEvents = createServerFn({ method: "POST" })
  .middleware([requireVerifiedAuth])
  .validator((input: unknown) =>
    z
      .object({
        events: z.array(eventSchema).max(500),
        evidence: z.array(evidenceInputSchema).max(500).optional(),
        snapshotJson: z.string().max(250_000).optional(),
        expectedServerVersion: z.number().int().min(0).optional(),
      })
      .refine(
        (d) => d.events.length > 0 || (d.evidence?.length ?? 0) > 0 || Boolean(d.snapshotJson),
        "At least one event, evidence item, or snapshot is required.",
      )
      .parse(input),
  )
  .handler(async ({ data, context }): Promise<Result<RecordEventsAck>> =>
    measureOperation("account.recordEvents", async () => {
      const { supabase, userId, authMode, requestId } = context;
      const rl = checkBucket("sync", userId);
      if (rl) return rl;

      const serverVersion = Date.now();

      // Server-authoritative tier sanitization: clients can NEVER self-claim reviewer-verified
      const sanitizedEvidence = (data.evidence ?? []).map((ev) => ({
        ...ev,
        verification_tier: sanitizeLearnerVerificationTier(ev.evidence_type, ev.verification_tier),
      }));

      const eventKeys = data.events.map(eventOutboxKey);
      const evidenceKeys = sanitizedEvidence.map((ev) => ev.idempotency_key);

      if (authMode === "local_dev" || !supabase) {
        const { localDb } = await import("./db.server");
        if (data.events.length > 0) {
          const evRes = localDb.recordEvents(userId, data.events);
          if (evRes.error) return fail(evRes.error, undefined, requestId);
        }

        if (sanitizedEvidence.length > 0) {
          const res = localDb.recordLearnerEvidence(userId, sanitizedEvidence);
          if (res.error) return fail(res.error, undefined, requestId);
        }

        let snapshotSaved = false;
        let snapshotConflict = false;
        let snapshotVersion: number | undefined;
        let notice: string | undefined;

        if (data.snapshotJson) {
          const snapRes = localDb.saveLearnerSnapshotWithVersion(
            userId,
            data.snapshotJson,
            data.expectedServerVersion,
          );
          if (snapRes.error || !snapRes.data) {
            return fail(
              snapRes.error ?? "Couldn't persist learner snapshot.",
              undefined,
              requestId,
            );
          }
          snapshotVersion = snapRes.data.currentVersion;
          if (snapRes.data.conflict) {
            snapshotConflict = true;
            snapshotSaved = false;
            notice =
              "A newer progress snapshot exists on the server; refresh to merge before overwriting.";
          } else {
            snapshotSaved = true;
          }
        }

        recordSyncMetrics({
          eventsAccepted: eventKeys.length,
          evidenceAccepted: evidenceKeys.length,
          snapshotSaved,
          snapshotConflict,
          partialFailure: snapshotConflict,
        });

        return ok({
          acceptedEventKeys: eventKeys,
          rejectedEventKeys: [],
          acceptedEvidenceKeys: evidenceKeys,
          rejectedEvidenceKeys: [],
          snapshotSaved,
          ...(snapshotConflict ? { snapshotConflict: true } : {}),
          ...(snapshotVersion !== undefined ? { snapshotVersion } : {}),
          serverVersion,
          partialFailure: snapshotConflict,
          syncedEvents: eventKeys.length,
          syncedEvidence: evidenceKeys.length,
          ...(notice ? { notice } : {}),
        });
      }

      // Production canonical path: Supabase ONLY (never silently acknowledges unpersisted data)
      const acceptedEventKeys: string[] = [];
      const rejectedEventKeys: string[] = [];
      const acceptedEvidenceKeys: string[] = [];
      const rejectedEvidenceKeys: string[] = [];
      let snapshotSaved = false;
      let snapshotConflict = false;
      let snapshotVersion: number | undefined;
      const notices: string[] = [];

      try {
        if (data.events.length > 0) {
          const rows = data.events.map((e) => ({ ...e, user_id: userId }));
          const r = await supabase
            .from("progress_events")
            .upsert(rows, { onConflict: "user_id,kind,ref", ignoreDuplicates: true });
          if (r.error) {
            return fail(
              "Couldn't sync progress events to account. Retrying automatically.",
              r.error,
              requestId,
            );
          }
          acceptedEventKeys.push(...eventKeys);
        }

        if (sanitizedEvidence.length > 0) {
          const evRows = sanitizedEvidence.map((ev) => ({
            user_id: userId,
            idempotency_key: ev.idempotency_key,
            skill_id: ev.skill_id,
            evidence_type: ev.evidence_type,
            ref: ev.ref,
            score: ev.score,
            weight: ev.weight,
            confidence: ev.confidence,
            verification_tier: ev.verification_tier,
            rubric_version: ev.rubric_version,
            rubric_scores_json: ev.rubric_scores_json,
            artifact_url: ev.artifact_url,
            artifact_notes: ev.artifact_notes,
            occurred_at: ev.occurred_at,
          }));
          const evRes = await dynamicFrom(supabase, "learner_evidence").upsert(evRows, {
            onConflict: "user_id,idempotency_key",
          });
          if (evRes.error) {
            rejectedEvidenceKeys.push(...evidenceKeys);
            notices.push(
              "Cloud evidence table unavailable; evidence stays safely queued on this device until provisioned.",
            );
            logEvent(
              "warn",
              "account",
              "cloud_evidence_upsert_failed",
              { detail: evRes.error },
              requestId,
            );
          } else {
            acceptedEvidenceKeys.push(...evidenceKeys);
          }
        }

        if (data.snapshotJson) {
          const now = new Date().toISOString();
          if (data.expectedServerVersion !== undefined) {
            const curr = await dynamicFrom(supabase, "learner_state_snapshots")
              .select("version")
              .eq("user_id", userId)
              .maybeSingle();
            const currentVersion = Number(curr.data?.["version"] ?? 0);
            if (!curr.error && currentVersion !== data.expectedServerVersion) {
              snapshotConflict = true;
              snapshotVersion = currentVersion;
              notices.push(
                "A newer progress snapshot exists on the server; refresh to merge before overwriting.",
              );
            } else if (!curr.error) {
              const nextVersion = currentVersion + 1;
              const snapRes = await dynamicFrom(supabase, "learner_state_snapshots").upsert(
                {
                  user_id: userId,
                  state_json: data.snapshotJson,
                  version: nextVersion,
                  updated_at: now,
                },
                { onConflict: "user_id" },
              );
              if (snapRes.error) {
                notices.push(
                  "Cross-device snapshot table unavailable; local progress remains intact.",
                );
              } else {
                snapshotSaved = true;
                snapshotVersion = nextVersion;
              }
            }
          } else {
            const snapRes = await dynamicFrom(supabase, "learner_state_snapshots").upsert(
              {
                user_id: userId,
                state_json: data.snapshotJson,
                updated_at: now,
              },
              { onConflict: "user_id" },
            );
            if (snapRes.error) {
              snapshotSaved = false;
              notices.push(
                "Cross-device snapshot table unavailable; local progress remains intact.",
              );
              logEvent(
                "warn",
                "account",
                "cloud_snapshot_upsert_failed",
                { detail: snapRes.error },
                requestId,
              );
            } else {
              snapshotSaved = true;
            }
          }
        }

        const partialFailure =
          rejectedEventKeys.length > 0 ||
          rejectedEvidenceKeys.length > 0 ||
          snapshotConflict ||
          (Boolean(data.snapshotJson) && !snapshotSaved);

        recordSyncMetrics({
          eventsAccepted: acceptedEventKeys.length,
          eventsRejected: rejectedEventKeys.length,
          evidenceAccepted: acceptedEvidenceKeys.length,
          evidenceRejected: rejectedEvidenceKeys.length,
          snapshotSaved,
          snapshotConflict,
          partialFailure,
        });

        return ok({
          acceptedEventKeys,
          rejectedEventKeys,
          acceptedEvidenceKeys,
          rejectedEvidenceKeys,
          snapshotSaved,
          ...(snapshotConflict ? { snapshotConflict: true } : {}),
          ...(snapshotVersion !== undefined ? { snapshotVersion } : {}),
          serverVersion,
          partialFailure,
          syncedEvents: acceptedEventKeys.length,
          syncedEvidence: acceptedEvidenceKeys.length,
          ...(notices.length > 0 ? { notice: notices.join(" ") } : {}),
        });
      } catch (err) {
        return fail("Couldn't sync progress to account. Retrying automatically.", err, requestId);
      }
    }),
  );

export const getLearnerSnapshotFn = createServerFn({ method: "GET" })
  .middleware([requireVerifiedAuth])
  .handler(
    async ({
      context,
    }): Promise<
      Result<{
        stateJson: string | null;
        updatedAt: string | null;
        serverVersion: number;
        snapshotVersion: number;
        cloudEvidenceReady: boolean;
        evidence: LearnerEvidenceRecord[];
      }>
    > =>
      measureOperation("account.getLearnerSnapshot", async () => {
        const { userId, authMode, supabase, requestId } = context;
        if (authMode === "local_dev" || !supabase) {
          const { localDb } = await import("./db.server");
          const snap = localDb.getLearnerSnapshot(userId);
          const evidence = localDb.listLearnerEvidence(userId);
          return ok({
            stateJson: snap?.stateJson ?? null,
            updatedAt: snap?.updatedAt ?? null,
            serverVersion: snap?.updatedAt ? Date.parse(snap.updatedAt) || Date.now() : Date.now(),
            snapshotVersion: snap?.version ?? 0,
            cloudEvidenceReady: true,
            evidence,
          });
        }

        try {
          const [snapRes, evRes] = await Promise.all([
            dynamicFrom(supabase, "learner_state_snapshots")
              .select("state_json, updated_at, version")
              .eq("user_id", userId)
              .maybeSingle(),
            dynamicFrom(supabase, "learner_evidence")
              .select(EVIDENCE_COLUMNS)
              .eq("user_id", userId)
              .order("occurred_at", { ascending: true })
              .limit(2000),
          ]);

          const cloudReady = !snapRes.error && !evRes.error;
          const stateJson =
            !snapRes.error && snapRes.data?.["state_json"]
              ? typeof snapRes.data["state_json"] === "string"
                ? snapRes.data["state_json"]
                : JSON.stringify(snapRes.data["state_json"])
              : null;
          const updatedAt =
            !snapRes.error && snapRes.data?.["updated_at"]
              ? String(snapRes.data["updated_at"])
              : null;
          const snapshotVersion =
            !snapRes.error && snapRes.data?.["version"] !== undefined
              ? Number(snapRes.data["version"])
              : 0;
          const evidence =
            !evRes.error && Array.isArray(evRes.data) ? evRes.data.map(mapSupabaseEvidenceRow) : [];

          return ok({
            stateJson,
            updatedAt,
            serverVersion: updatedAt ? Date.parse(updatedAt) || Date.now() : Date.now(),
            snapshotVersion,
            cloudEvidenceReady: cloudReady,
            evidence,
          });
        } catch (err) {
          logEvent("warn", "account", "cloud_snapshot_read_failed", { detail: err }, requestId);
          return ok({
            stateJson: null,
            updatedAt: null,
            serverVersion: Date.now(),
            snapshotVersion: 0,
            cloudEvidenceReady: false,
            evidence: [],
          });
        }
      }),
  );

const paginationSchema = z
  .object({
    limit: z.number().int().min(1).max(100).default(50),
    offset: z.number().int().min(0).max(50_000).default(0),
  })
  .optional();

/** Bounded paginated progress events endpoint (max 100 rows per page). */
export const listProgressEventsPage = createServerFn({ method: "GET" })
  .middleware([requireVerifiedAuth])
  .validator((input: unknown) => paginationSchema.parse(input))
  .handler(async ({ data, context }): Promise<Result<PaginatedResult<UserEvent>>> =>
    measureOperation("account.listProgressEventsPage", async () => {
      const limit = data?.limit ?? 50;
      const offset = data?.offset ?? 0;
      const { supabase, userId, authMode, requestId } = context;

      if (authMode === "local_dev" || !supabase) {
        const { localDb } = await import("./db.server");
        return ok(localDb.listProgressEventsPaginated(userId, limit, offset));
      }

      try {
        const res = await supabase
          .from("progress_events")
          .select("kind, ref, discipline, occurred_on", { count: "exact" })
          .eq("user_id", userId)
          .order("occurred_on", { ascending: false })
          .range(offset, offset + limit - 1);
        if (res.error) return fail("Couldn't load progress history.", res.error, requestId);
        const items = res.data ?? [];
        const total = res.count ?? items.length;
        return ok({
          items,
          total,
          limit,
          offset,
          hasMore: offset + items.length < total,
        });
      } catch (err) {
        return fail("Couldn't load progress history.", err, requestId);
      }
    }),
  );

/** Bounded paginated learner evidence endpoint (max 100 rows per page, explicit columns). */
export const listLearnerEvidencePage = createServerFn({ method: "GET" })
  .middleware([requireVerifiedAuth])
  .validator((input: unknown) => paginationSchema.parse(input))
  .handler(async ({ data, context }): Promise<Result<PaginatedResult<LearnerEvidenceRecord>>> =>
    measureOperation("account.listLearnerEvidencePage", async () => {
      const limit = data?.limit ?? 50;
      const offset = data?.offset ?? 0;
      const { supabase, userId, authMode, requestId } = context;

      if (authMode === "local_dev" || !supabase) {
        const { localDb } = await import("./db.server");
        return ok(localDb.listLearnerEvidencePaginated(userId, limit, offset));
      }

      try {
        const res = await dynamicFrom(supabase, "learner_evidence")
          .select(EVIDENCE_COLUMNS, { count: "exact" })
          .eq("user_id", userId)
          .order("occurred_at", { ascending: false })
          .range(offset, offset + limit - 1);
        if (res.error || !Array.isArray(res.data)) {
          return fail("Couldn't load learning evidence.", res.error, requestId);
        }
        const items = res.data.map(mapSupabaseEvidenceRow);
        const total = res.count ?? items.length;
        return ok({
          items,
          total,
          limit,
          offset,
          hasMore: offset + items.length < total,
        });
      } catch (err) {
        return fail("Couldn't load learning evidence.", err, requestId);
      }
    }),
  );

/**
 * Reviewer / Admin-only evidence verification endpoint.
 * Strictly separated from learner self-submission so ONLY verified reviewers or admins
 * can promote evidence to "rubric-evaluated" or "reviewer-verified" with audit tracking.
 */
export const recordReviewerVerification = createServerFn({ method: "POST" })
  .middleware([requireReviewerOrAdmin])
  .validator((input: unknown) =>
    z
      .object({
        targetUserId: z.string().uuid(),
        idempotencyKey: z.string().trim().min(1).max(200),
        verificationTier: z.enum(["rubric-evaluated", "reviewer-verified"]),
        scoreOverride: z.number().min(0).max(1).optional(),
        reviewerNote: z.string().trim().min(3).max(2000).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }): Promise<Result<{ updated: boolean; reviewedAt: string }>> =>
    measureOperation("account.recordReviewerVerification", async () => {
      const { supabase, userId, authMode, requestId } = context;
      const rl = checkBucket("admin", userId);
      if (rl) return rl;

      if (data.targetUserId === userId && context.role !== "admin") {
        return fail("Reviewers cannot independently verify their own evidence artifacts.");
      }

      if (authMode === "local_dev" || !supabase) {
        const { localDb } = await import("./db.server");
        const res = localDb.verifyLearnerEvidence(
          data.targetUserId,
          data.idempotencyKey,
          data.verificationTier,
          userId,
          data.scoreOverride,
          data.reviewerNote,
        );
        localDb.writeAuditLog({
          actorUserId: userId,
          action: "evidence.reviewer_verify",
          resourceType: "learner_evidence",
          resourceId: `${data.targetUserId}:${data.idempotencyKey}`,
          outcome: res.error ? "error" : "ok",
          requestId,
          meta: { tier: data.verificationTier },
        });
        return res;
      }

      try {
        const now = new Date().toISOString();
        const patch: Record<string, unknown> = {
          verification_tier: data.verificationTier,
          reviewer_id: userId,
          reviewed_at: now,
        };
        if (typeof data.scoreOverride === "number") {
          patch["score"] = data.scoreOverride;
        }
        const res = await dynamicFrom(supabase, "learner_evidence")
          .update(patch)
          .eq("user_id", data.targetUserId)
          .eq("idempotency_key", data.idempotencyKey);
        if (res.error) return fail("Couldn't record reviewer verification.", res.error, requestId);

        logEvent(
          "info",
          "audit",
          "evidence.reviewer_verify",
          {
            reviewerRef: safeUserRef(userId),
            targetRef: safeUserRef(data.targetUserId),
            tier: data.verificationTier,
          },
          requestId,
        );
        return ok({ updated: true, reviewedAt: now });
      } catch (err) {
        return fail("Couldn't record reviewer verification.", err, requestId);
      }
    }),
  );

export const exportDossier = createServerFn({ method: "GET" })
  .middleware([requireVerifiedAuth])
  .handler(async ({ context }): Promise<Result<LearnerDossier>> =>
    measureOperation("account.exportDossier", async () => {
      const { supabase, userId, authMode, requestId } = context;
      const rl = checkBucket("export", userId);
      if (rl) return rl;

      if (authMode === "local_dev" || !supabase) {
        const { localDb } = await import("./db.server");
        return ok(localDb.exportLearnerDossier(userId));
      }

      try {
        const [p, g, e, evRes] = await Promise.all([
          supabase
            .from("profiles")
            .select("display_name, initials, signature_seed, signed_at")
            .eq("id", userId)
            .maybeSingle(),
          supabase
            .from("learning_goals")
            .select("id, text, created_at")
            .eq("user_id", userId)
            .order("created_at"),
          supabase
            .from("progress_events")
            .select("kind, ref, discipline, occurred_on")
            .eq("user_id", userId)
            .order("occurred_on")
            .limit(5000),
          dynamicFrom(supabase, "learner_evidence")
            .select(EVIDENCE_COLUMNS)
            .eq("user_id", userId)
            .order("occurred_at", { ascending: true })
            .limit(2000)
            .catch(() => ({ data: null, error: { message: "unavailable" } })),
        ]);
        if (p.error || g.error || e.error) {
          return fail(
            "Couldn't export your portfolio right now.",
            p.error ?? g.error ?? e.error,
            requestId,
          );
        }
        const events = e.data ?? [];
        const evidence =
          !evRes.error && Array.isArray(evRes.data) ? evRes.data.map(mapSupabaseEvidenceRow) : [];
        const disciplines = Array.from(
          new Set(events.map((ev) => ev.discipline).filter(Boolean)),
        ) as string[];

        return ok({
          exportDate: new Date().toISOString(),
          dossierVersion: "2.1.0",
          disclaimer:
            "Self-directed engineering learning portfolio exported from account records. Learner self-assessments are provisional until independently reviewed; not a formal INCOSE, ISO, NASA, or regulatory certification.",
          userId,
          profile: p.data ?? null,
          goals: g.data ?? [],
          events,
          evidence,
          metrics: {
            totalEvents: events.length,
            totalEvidenceItems: evidence.length,
            distinctDisciplines: disciplines,
            lessonsDone: events.filter((ev) => ev.kind === "lesson").length,
            labsDone: events.filter((ev) => ev.kind === "lab").length,
            rubricEvaluatedCount: evidence.filter(
              (ev) =>
                ev.verification_tier === "rubric-evaluated" ||
                ev.verification_tier === "reviewer-verified",
            ).length,
          },
        });
      } catch (err) {
        return fail("Couldn't export your portfolio right now.", err, requestId);
      }
    }),
  );

export type AuthenticatedDiagnostics = {
  authMode: "supabase" | "local_dev";
  storageEngine: string;
  walMode: boolean;
  uptimeSeconds: number;
  packCounts: {
    articles: number;
    sources: number;
    practice_prompts: number;
    roles: number;
    coverage_deep: number;
    coverage_research: number;
    scrape_audit: number;
    pack_meta: number;
  };
  yourAccountCounts: {
    goals: number;
    events: number;
    evidenceItems: number;
  };
};

/** Authenticated-only diagnostics — never exposes file paths, host OS internals, or other users' counts. */
export const getAuthenticatedDiagnostics = createServerFn({ method: "GET" })
  .middleware([requireVerifiedAuth])
  .handler(async ({ context }): Promise<Result<AuthenticatedDiagnostics>> =>
    measureOperation("account.getAuthenticatedDiagnostics", async () => {
      const { supabase, userId, authMode, requestId } = context;

      if (authMode === "local_dev" || !supabase) {
        const { localDb } = await import("./db.server");
        const sys = localDb.getSystemHealth();
        const me = localDb.getMe(userId);
        const evidence = localDb.listLearnerEvidence(userId);
        return ok({
          authMode: "local_dev",
          storageEngine: "node:sqlite (local dev)",
          walMode: sys.database.walMode,
          uptimeSeconds: sys.uptimeSeconds,
          packCounts: {
            articles: sys.database.counts.articles,
            sources: sys.database.counts.sources,
            practice_prompts: sys.database.counts.practice_prompts,
            roles: sys.database.counts.roles,
            coverage_deep: sys.database.counts.coverage_deep,
            coverage_research: sys.database.counts.coverage_research,
            scrape_audit: sys.database.counts.scrape_audit,
            pack_meta: sys.database.counts.pack_meta,
          },
          yourAccountCounts: {
            goals: me.data?.goals.length ?? 0,
            events: me.data?.events.length ?? 0,
            evidenceItems: evidence.length,
          },
        });
      }

      // Cloud/Supabase path: NEVER imports db.server / node:sqlite
      try {
        const [
          g,
          e,
          evCount,
          articles,
          sources,
          prompts,
          roles,
          covDeep,
          covResearch,
          scrapeAudit,
          packMeta,
        ] = await Promise.all([
          supabase
            .from("learning_goals")
            .select("id", { count: "exact", head: true })
            .eq("user_id", userId),
          supabase
            .from("progress_events")
            .select("id", { count: "exact", head: true })
            .eq("user_id", userId),
          dynamicFrom(supabase, "learner_evidence")
            .select("idempotency_key", { count: "exact", head: true })
            .eq("user_id", userId)
            .catch(() => ({ data: null, error: { message: "unavailable" }, count: 0 })),
          supabase.from("articles").select("slug", { count: "exact", head: true }),
          supabase.from("sources").select("source_id", { count: "exact", head: true }),
          supabase.from("practice_prompts").select("id", { count: "exact", head: true }),
          supabase.from("roles").select("id", { count: "exact", head: true }),
          supabase.from("coverage_deep").select("id", { count: "exact", head: true }),
          supabase.from("coverage_research").select("id", { count: "exact", head: true }),
          supabase.from("scrape_audit").select("id", { count: "exact", head: true }),
          supabase.from("pack_meta").select("key", { count: "exact", head: true }),
        ]);

        return ok({
          authMode: "supabase",
          storageEngine: "Supabase PostgreSQL (RLS-enforced)",
          walMode: true,
          uptimeSeconds: safeProcessUptimeSeconds(),
          packCounts: {
            articles: articles.count ?? 0,
            sources: sources.count ?? 0,
            practice_prompts: prompts.count ?? 0,
            roles: roles.count ?? 0,
            coverage_deep: covDeep.count ?? 0,
            coverage_research: covResearch.count ?? 0,
            scrape_audit: scrapeAudit.count ?? 0,
            pack_meta: packMeta.count ?? 0,
          },
          yourAccountCounts: {
            goals: g.count ?? 0,
            events: e.count ?? 0,
            evidenceItems: evCount.count ?? 0,
          },
        });
      } catch (err) {
        return fail("Diagnostics temporarily unavailable.", err, requestId);
      }
    }),
  );
