import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getLearnerSnapshotFn, recordEvents } from "@/lib/neet/account.functions";
import { useSession } from "@/hooks/use-session";
import {
  claimGuestProgressForUser,
  hydrateFromServerSnapshot,
  lessonSkill,
  readProgressSnapshot,
  setActiveUser,
  type ProgressSignal,
} from "@/lib/neet/store";
import { disciplineOf, isoDay } from "@/lib/neet/progress-math";
import { LABS } from "@/lib/neet/content";
import type { Evidence } from "@/lib/neet/types";
import {
  acknowledgeOutboxBatch,
  enqueueOutboxItems,
  isUserBackfilled,
  markUserBackfilled,
  nextBackoffMs,
  readOutbox,
  resetSyncStatus,
  setSyncStatus,
  type QueuedEventRow,
  type QueuedEvidenceRow,
} from "@/lib/neet/sync-outbox";

function toEventRow(s: ProgressSignal, fallbackDay?: string): QueuedEventRow {
  const day = s.occurredAt ? isoDay(new Date(s.occurredAt)) : (fallbackDay ?? isoDay(new Date()));
  return {
    kind: s.kind,
    ref: s.ref.slice(0, 200),
    discipline: disciplineOf(s.skillId),
    occurred_on: day,
  };
}

function toEvidenceRow(ev: Evidence): QueuedEvidenceRow {
  return {
    idempotency_key: (ev.idempotencyKey || `${ev.type}:${ev.skillId}:${ev.ref ?? ev.at}`).slice(
      0,
      200,
    ),
    skill_id: ev.skillId.slice(0, 100),
    evidence_type: ev.type,
    ref: (ev.ref ?? `${ev.type}:${ev.skillId}`).slice(0, 200),
    score: Math.max(0, Math.min(1, ev.score)),
    weight: Math.max(0.1, Math.min(10, ev.weight)),
    confidence: typeof ev.confidence === "number" ? ev.confidence : null,
    verification_tier: ev.verificationTier ?? "self-assessed",
    rubric_version: ev.rubricVersion ?? null,
    rubric_scores_json: ev.rubricScores ? JSON.stringify(ev.rubricScores) : null,
    artifact_url: ev.artifactUrl ?? null,
    artifact_notes: ev.artifactNotes ? ev.artifactNotes.slice(0, 8000) : null,
    occurred_at: ev.at,
  };
}

/**
 * Account-isolated, durable progress and evidence synchronizer.
 * - Namespaces local progress and outbox strictly by userId (never mixes accounts)
 * - Hydrates cross-device learner snapshot on sign-in
 * - Queues offline work durably in localStorage and retries with capped exponential backoff
 * - Marks backfill complete ONLY after server acknowledgement
 */
export default function ProgressSync() {
  const { user, ready } = useSession();
  const send = useServerFn(recordEvents);
  const fetchSnapshot = useServerFn(getLearnerSnapshotFn);
  const qc = useQueryClient();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCount = useRef(0);
  const flushing = useRef(false);

  useEffect(() => {
    if (!ready) return;

    const userId = user?.id ?? null;
    setActiveUser(userId);

    if (!userId) {
      if (timer.current) clearTimeout(timer.current);
      timer.current = null;
      retryCount.current = 0;
      resetSyncStatus("guest");
      return;
    }

    let cancelled = false;
    let needsBackfillMark = false;

    const updatePendingCounts = (
      stateOverride?: "idle" | "syncing" | "synced" | "offline" | "error",
    ) => {
      const box = readOutbox(userId);
      const offline = typeof navigator !== "undefined" && !navigator.onLine;
      setSyncStatus({
        ...(stateOverride ? { state: offline ? "offline" : stateOverride } : {}),
        pendingEvents: box.events.length,
        pendingEvidence: box.evidence.length,
      });
    };

    const flush = async () => {
      if (cancelled || flushing.current) return;
      timer.current = null;

      if (typeof navigator !== "undefined" && !navigator.onLine) {
        updatePendingCounts("offline");
        return;
      }

      const box = readOutbox(userId);
      const eventsBatch = box.events.slice(0, 500);
      const evidenceBatch = box.evidence.slice(0, 500);
      if (eventsBatch.length === 0 && evidenceBatch.length === 0) {
        if (needsBackfillMark) {
          markUserBackfilled(userId);
          needsBackfillMark = false;
        }
        setSyncStatus({
          state: "synced",
          pendingEvents: 0,
          pendingEvidence: 0,
          lastError: null,
          retryCount: 0,
        });
        return;
      }

      // recordEvents requires >=1 event; if we only have evidence, synthesize a matching event
      const payloadEvents: QueuedEventRow[] =
        eventsBatch.length > 0
          ? eventsBatch
          : evidenceBatch.slice(0, 1).map((ev) => ({
              kind:
                ev.evidence_type === "quiz"
                  ? "quiz"
                  : ev.evidence_type === "explain"
                    ? "explain"
                    : "lab",
              ref: ev.ref,
              discipline: disciplineOf(ev.skill_id),
              occurred_on: isoDay(new Date(ev.occurred_at)),
            }));

      flushing.current = true;
      setSyncStatus({
        state: "syncing",
        pendingEvents: box.events.length,
        pendingEvidence: box.evidence.length,
      });

      try {
        const snapshotJson = box.includeSnapshot
          ? JSON.stringify(readProgressSnapshot())
          : undefined;
        const r = await send({
          data: {
            events: payloadEvents,
            ...(evidenceBatch.length > 0 ? { evidence: evidenceBatch } : {}),
            ...(snapshotJson ? { snapshotJson } : {}),
          },
        });
        if (cancelled) return;
        if (r.error) throw new Error(r.error);

        const remaining = acknowledgeOutboxBatch(userId, {
          events: eventsBatch,
          evidence: evidenceBatch,
          snapshotAcked: Boolean(snapshotJson),
        });

        retryCount.current = 0;
        if (needsBackfillMark && remaining.events.length === 0 && remaining.evidence.length === 0) {
          markUserBackfilled(userId);
          needsBackfillMark = false;
        }

        setSyncStatus({
          state:
            remaining.events.length > 0 || remaining.evidence.length > 0 ? "syncing" : "synced",
          pendingEvents: remaining.events.length,
          pendingEvidence: remaining.evidence.length,
          lastSyncedAt: new Date().toISOString(),
          lastError: null,
          retryCount: 0,
        });

        qc.invalidateQueries({ queryKey: ["me"] });

        if (remaining.events.length > 0 || remaining.evidence.length > 0) {
          timer.current = setTimeout(flush, 500);
        }
      } catch (err) {
        if (cancelled) return;
        retryCount.current += 1;
        const delay = nextBackoffMs(retryCount.current);
        const boxNow = readOutbox(userId);
        setSyncStatus({
          state: typeof navigator !== "undefined" && !navigator.onLine ? "offline" : "error",
          pendingEvents: boxNow.events.length,
          pendingEvidence: boxNow.evidence.length,
          lastError: err instanceof Error ? err.message : "Sync failed; retrying automatically.",
          retryCount: retryCount.current,
        });
        timer.current = setTimeout(flush, delay);
      } finally {
        flushing.current = false;
      }
    };

    const schedule = (delayMs = 700) => {
      if (cancelled) return;
      if (!timer.current) {
        timer.current = setTimeout(flush, delayMs);
      }
    };

    // Step 1: Hydrate cross-device state from server, then claim guest work & enqueue backfill if needed
    void (async () => {
      try {
        const snapRes = await fetchSnapshot();
        if (cancelled) return;
        if (!snapRes.error && snapRes.data?.stateJson) {
          hydrateFromServerSnapshot(snapRes.data.stateJson);
        }
      } catch {
        /* offline or transient failure: continue with local user store */
      }
      if (cancelled) return;

      // Claim any guest work created before sign-in into this user's isolated namespace
      claimGuestProgressForUser(userId);

      // One-time backfill of this user's local history using TRUE historical timestamps
      if (!isUserBackfilled(userId)) {
        const s = readProgressSnapshot();
        const today = isoDay(new Date());
        const backfillEvents: QueuedEventRow[] = [];
        const backfillEvidence: QueuedEvidenceRow[] = [];

        s.completed.forEach((k) => {
          const day = s.completedAt[k] ? isoDay(new Date(s.completedAt[k]!)) : today;
          backfillEvents.push(toEventRow({ kind: "lesson", ref: k, skillId: lessonSkill(k) }, day));
        });

        Object.entries(s.labs).forEach(([id, v]) => {
          backfillEvents.push(
            toEventRow(
              { kind: "lab", ref: id, skillId: LABS.find((l) => l.id === id)?.skillId },
              isoDay(new Date(v.at)),
            ),
          );
        });

        s.evidence
          .filter((e) => !e.ref?.startsWith("demo-"))
          .forEach((e) => {
            backfillEvidence.push(toEvidenceRow(e));
            if (e.type === "quiz" && e.ref) {
              backfillEvents.push(
                toEventRow(
                  { kind: "quiz", ref: e.ref, skillId: e.skillId },
                  isoDay(new Date(e.at)),
                ),
              );
            } else if (e.type === "explain" && e.ref) {
              backfillEvents.push(
                toEventRow(
                  { kind: "explain", ref: e.ref.replace(/^explain:/, ""), skillId: e.skillId },
                  isoDay(new Date(e.at)),
                ),
              );
            }
          });

        if (backfillEvents.length > 0 || backfillEvidence.length > 0) {
          needsBackfillMark = true;
          enqueueOutboxItems(userId, {
            events: backfillEvents,
            evidence: backfillEvidence,
            includeSnapshot: true,
          });
        } else {
          markUserBackfilled(userId);
        }
      }

      const pending = readOutbox(userId);
      if (pending.events.length > 0 || pending.evidence.length > 0) {
        updatePendingCounts("syncing");
        schedule(300);
      } else {
        setSyncStatus({
          state: typeof navigator !== "undefined" && !navigator.onLine ? "offline" : "synced",
          pendingEvents: 0,
          pendingEvidence: 0,
          lastError: null,
          retryCount: 0,
        });
      }
    })();

    const onSig = (e: Event) => {
      const sig = (e as CustomEvent<ProgressSignal>).detail;
      enqueueOutboxItems(userId, {
        events: [toEventRow(sig)],
        ...(sig.evidence ? { evidence: [toEvidenceRow(sig.evidence)] } : {}),
        includeSnapshot: true,
      });
      updatePendingCounts("syncing");
      schedule(700);
    };

    const onOnline = () => {
      retryCount.current = 0;
      updatePendingCounts("syncing");
      schedule(300);
    };

    const onOffline = () => {
      updatePendingCounts("offline");
    };

    window.addEventListener("neet:progress", onSig);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      cancelled = true;
      window.removeEventListener("neet:progress", onSig);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      if (timer.current) clearTimeout(timer.current);
      timer.current = null;
    };
  }, [user?.id, ready, send, fetchSnapshot, qc]);

  return null;
}
