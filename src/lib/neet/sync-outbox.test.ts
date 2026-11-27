import { describe, it, expect } from "vitest";
import {
  acknowledgeOutboxBatch,
  acknowledgeOutboxByKeys,
  enqueueOutboxItems,
  eventOutboxKey,
  isUserBackfilled,
  markUserBackfilled,
  nextBackoffMs,
  readOutbox,
  sanitizeLearnerVerificationTier,
  type StorageLike,
} from "./sync-outbox";
import { mergeStates, type State } from "./store";

function createMemoryStorage(): StorageLike {
  const map = new Map<string, string>();
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => {
      map.set(k, v);
    },
    removeItem: (k) => {
      map.delete(k);
    },
  };
}

describe("Durable Account-Isolated Sync Outbox (Stage 1)", () => {
  it("isolates queued events and evidence strictly between accounts", () => {
    const storage = createMemoryStorage();
    enqueueOutboxItems(
      "user-a",
      {
        events: [
          { kind: "lesson", ref: "path/lesson-1", discipline: "st", occurred_on: "2026-11-05" },
        ],
        evidence: [
          {
            idempotency_key: "quiz:q1",
            skill_id: "st-stocks",
            evidence_type: "quiz",
            ref: "q1",
            score: 1,
            weight: 1,
            confidence: 0.66,
            verification_tier: "automated-check",
            rubric_version: null,
            rubric_scores_json: null,
            artifact_url: null,
            artifact_notes: null,
            occurred_at: "2026-11-05T10:00:00.000Z",
          },
        ],
      },
      storage,
    );

    const boxA = readOutbox("user-a", storage);
    const boxB = readOutbox("user-b", storage);

    expect(boxA.events).toHaveLength(1);
    expect(boxA.evidence).toHaveLength(1);
    expect(boxB.events).toHaveLength(0);
    expect(boxB.evidence).toHaveLength(0);
  });

  it("deduplicates events by (kind, ref) and evidence by idempotency_key", () => {
    const storage = createMemoryStorage();
    enqueueOutboxItems(
      "user-a",
      {
        events: [
          { kind: "lesson", ref: "p/l1", discipline: "sd", occurred_on: "2026-11-01" },
          { kind: "lesson", ref: "p/l1", discipline: "sd", occurred_on: "2026-11-05" },
        ],
        evidence: [
          {
            idempotency_key: "lab:lab-estimate:v1",
            skill_id: "sd-requirements",
            evidence_type: "lab",
            ref: "lab-estimate",
            score: 0.6,
            weight: 2,
            confidence: null,
            verification_tier: "self-assessed",
            rubric_version: "2.0.0",
            rubric_scores_json: '{"workload_profile":3}',
            artifact_url: null,
            artifact_notes: "Draft 1",
            occurred_at: "2026-11-01T10:00:00.000Z",
          },
          {
            idempotency_key: "lab:lab-estimate:v1",
            skill_id: "sd-requirements",
            evidence_type: "lab",
            ref: "lab-estimate",
            score: 0.85,
            weight: 2,
            confidence: null,
            verification_tier: "self-assessed",
            rubric_version: "2.0.0",
            rubric_scores_json: '{"workload_profile":4}',
            artifact_url: null,
            artifact_notes: "Revised draft",
            occurred_at: "2026-11-05T10:00:00.000Z",
          },
        ],
      },
      storage,
    );

    const box = readOutbox("user-a", storage);
    expect(box.events).toHaveLength(1);
    expect(box.events[0]!.occurred_on).toBe("2026-11-01"); // earliest date preserved
    expect(box.evidence).toHaveLength(1);
    expect(box.evidence[0]!.score).toBe(0.85); // latest payload wins
  });

  it("retains items until server ACK and marks backfill only when explicitly confirmed", () => {
    const storage = createMemoryStorage();
    const ev = {
      kind: "lab" as const,
      ref: "lab-loop-map",
      discipline: "st" as const,
      occurred_on: "2026-11-04",
    };
    enqueueOutboxItems("user-a", { events: [ev], includeSnapshot: true }, storage);

    expect(isUserBackfilled("user-a", storage)).toBe(false);
    expect(readOutbox("user-a", storage).events).toHaveLength(1);

    // Simulate server ACK
    const after = acknowledgeOutboxBatch(
      "user-a",
      { events: [ev], evidence: [], snapshotAcked: true },
      storage,
    );
    expect(after.events).toHaveLength(0);
    expect(after.includeSnapshot).toBe(false);

    markUserBackfilled("user-a", storage);
    expect(isUserBackfilled("user-a", storage)).toBe(true);
    expect(isUserBackfilled("user-b", storage)).toBe(false);
  });

  it("removes ONLY server-confirmed keys on partial failure and keeps rejected evidence & unacked snapshot queued", () => {
    const storage = createMemoryStorage();
    const ev1 = {
      kind: "lesson" as const,
      ref: "thinking/stocks",
      discipline: "st" as const,
      occurred_on: "2026-11-05",
    };
    const ev2 = {
      kind: "lab" as const,
      ref: "lab-loop-map",
      discipline: "st" as const,
      occurred_on: "2026-11-05",
    };
    const evidenceRow = {
      idempotency_key: "lab:lab-loop-map:v1",
      skill_id: "st-loops",
      evidence_type: "lab" as const,
      ref: "lab-loop-map",
      score: 0.8,
      weight: 2.5,
      confidence: null,
      verification_tier: "self-assessed" as const,
      rubric_version: "2.0.0",
      rubric_scores_json: '{"causal_polarity":4}',
      artifact_url: null,
      artifact_notes: "Draft",
      occurred_at: "2026-11-05T10:00:00.000Z",
    };

    enqueueOutboxItems(
      "user-a",
      { events: [ev1, ev2], evidence: [evidenceRow], includeSnapshot: true },
      storage,
    );

    // Partial failure: ev1 accepted, ev2 rejected, evidence rejected, snapshot NOT saved
    const afterPartial = acknowledgeOutboxByKeys(
      "user-a",
      {
        acceptedEventKeys: [eventOutboxKey(ev1)],
        acceptedEvidenceKeys: [],
        snapshotAcked: false,
      },
      storage,
    );

    expect(afterPartial.events).toHaveLength(1);
    expect(afterPartial.events[0]!.ref).toBe("lab-loop-map");
    expect(afterPartial.evidence).toHaveLength(1);
    expect(afterPartial.evidence[0]!.idempotency_key).toBe("lab:lab-loop-map:v1");
    expect(afterPartial.includeSnapshot).toBe(true);
  });

  it("enforces server-authoritative verification tiers so learners cannot self-assign reviewer-verified or rubric-evaluated", () => {
    expect(sanitizeLearnerVerificationTier("lab", "reviewer-verified")).toBe("self-assessed");
    expect(sanitizeLearnerVerificationTier("lab", "rubric-evaluated")).toBe("self-assessed");
    expect(sanitizeLearnerVerificationTier("artifact", "reviewer-verified")).toBe("self-assessed");
    expect(sanitizeLearnerVerificationTier("explain", "rubric-evaluated")).toBe("self-assessed");
    expect(sanitizeLearnerVerificationTier("quiz", "reviewer-verified")).toBe("automated-check");
    expect(sanitizeLearnerVerificationTier("variant", "automated-check")).toBe("automated-check");
    expect(sanitizeLearnerVerificationTier("variant", "reviewer-verified")).toBe("self-assessed");
  });

  it("computes jittered bounded exponential backoff retries cleanly", () => {
    // Midpoint jitterUnit = 0.5 yields exact unjittered base schedule
    expect(nextBackoffMs(0, 0.5)).toBe(2_000);
    expect(nextBackoffMs(1, 0.5)).toBe(4_000);
    expect(nextBackoffMs(2, 0.5)).toBe(8_000);
    expect(nextBackoffMs(10, 0.5)).toBe(60_000);

    // ±20% jitter bounds (0.8x to 1.2x, capped at 60_000)
    expect(nextBackoffMs(0, 0)).toBe(1_600);
    expect(nextBackoffMs(0, 1)).toBe(2_400);
    expect(nextBackoffMs(10, 0)).toBe(48_000);
    expect(nextBackoffMs(10, 1)).toBe(60_000);
  });

  it("merges cross-device server snapshot with newer local offline state including targetRoleId and capstoneChangeImpact", () => {
    const empty: State = {
      completed: [],
      completedAt: {},
      saved: [],
      evidence: [],
      answers: {},
      labs: {},
      labAttempts: {},
      explains: {},
      scenarios: {},
      capstone: {},
    };

    const serverSnap: State = {
      ...empty,
      completed: ["thinking/stocks"],
      completedAt: { "thinking/stocks": "2026-11-01T10:00:00.000Z" },
      targetRoleId: "early-career-se",
      evidence: [
        {
          idempotencyKey: "quiz:q1",
          skillId: "st-stocks",
          type: "quiz",
          score: 1,
          weight: 1,
          at: "2026-11-01T10:00:00.000Z",
          ref: "q1",
          verificationTier: "automated-check",
        },
      ],
    };

    const localOffline: State = {
      ...empty,
      completed: ["thinking/loops"],
      completedAt: { "thinking/loops": "2026-11-05T12:00:00.000Z" },
      targetRoleId: "software-systems-architect",
      capstoneChangeImpact: {
        at: "2026-11-05T12:00:00.000Z",
        affectedStages: ["cap-m2-requirements", "cap-m4-safety-security"],
        response: "Re-partition telemetry broker across regions and cap retry storms.",
      },
      evidence: [
        {
          idempotencyKey: "lab:lab-loop-map:v1",
          skillId: "st-loops",
          type: "lab",
          score: 0.9,
          weight: 2.5,
          at: "2026-11-05T12:00:00.000Z",
          ref: "lab-loop-map",
          verificationTier: "self-assessed",
          evaluatorRole: "self",
        },
      ],
    };

    const merged = mergeStates(localOffline, serverSnap);
    expect(merged.completed.sort()).toEqual(["thinking/loops", "thinking/stocks"]);
    expect(merged.evidence).toHaveLength(2);
    expect(merged.completedAt["thinking/stocks"]).toBe("2026-11-01T10:00:00.000Z");
    expect(merged.completedAt["thinking/loops"]).toBe("2026-11-05T12:00:00.000Z");
    expect(merged.targetRoleId).toBe("software-systems-architect");
    expect(merged.capstoneChangeImpact?.affectedStages).toEqual([
      "cap-m2-requirements",
      "cap-m4-safety-security",
    ]);
  });
});
