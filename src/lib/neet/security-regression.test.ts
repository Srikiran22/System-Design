// @vitest-environment node
import crypto from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import { afterEach, describe, expect, it } from "vitest";
import {
  claimFirstLocalAdmin,
  getDatabase,
  getLearnerSnapshot,
  getUserRole,
  initTablesSync,
  listLearnerEvidencePaginated,
  listProgressEventsPaginated,
  recordEvents,
  recordLearnerEvidence,
  saveLearnerSnapshotWithVersion,
  verifyLearnerEvidence,
} from "./db.server";
import { hasRoleAtLeast, isAdminEmail } from "./auth-server";
import { sanitizeLearnerVerificationTier } from "./sync-outbox";
import { checkRateLimit, RATE_LIMIT_POLICIES, resetRateLimitsForTest } from "./rate-limit.server";
import { formatLogPayload } from "./logger";
import { isSafeHref } from "./curriculum-schemas";

describe("security regression & authorization invariants", () => {
  afterEach(() => {
    resetRateLimitsForTest();
  });

  it("enforces role hierarchy strictly (learner < reviewer < author < admin)", () => {
    expect(hasRoleAtLeast("learner", "learner")).toBe(true);
    expect(hasRoleAtLeast("learner", "reviewer")).toBe(false);
    expect(hasRoleAtLeast("learner", "author")).toBe(false);
    expect(hasRoleAtLeast("reviewer", "reviewer")).toBe(true);
    expect(hasRoleAtLeast("reviewer", "author")).toBe(false);
    expect(hasRoleAtLeast("author", "reviewer")).toBe(true);
    expect(hasRoleAtLeast("author", "admin")).toBe(false);
    expect(hasRoleAtLeast("admin", "admin")).toBe(true);
  });

  it("checks ADMIN_EMAILS allowlist case-insensitively and fails closed when unset", () => {
    const prev = process.env["ADMIN_EMAILS"];
    try {
      delete process.env["ADMIN_EMAILS"];
      expect(isAdminEmail("admin@example.com")).toBe(false);

      process.env["ADMIN_EMAILS"] = "ops@example.com, Lead@Example.ORG ";
      expect(isAdminEmail("lead@example.org")).toBe(true);
      expect(isAdminEmail("user@example.org")).toBe(false);
    } finally {
      if (prev === undefined) delete process.env["ADMIN_EMAILS"];
      else process.env["ADMIN_EMAILS"] = prev;
    }
  });

  it("prevents learners from self-assigning rubric-evaluated or reviewer-verified tiers", () => {
    expect(sanitizeLearnerVerificationTier("lab", "reviewer-verified")).toBe("self-assessed");
    expect(sanitizeLearnerVerificationTier("artifact", "rubric-evaluated")).toBe("self-assessed");
    expect(sanitizeLearnerVerificationTier("explain", "reviewer-verified")).toBe("self-assessed");
    expect(sanitizeLearnerVerificationTier("quiz", "reviewer-verified")).toBe("automated-check");
    expect(sanitizeLearnerVerificationTier("variant", "automated-check")).toBe("automated-check");
  });

  it("enforces BOLA/IDOR isolation and bounded pagination between distinct users", () => {
    const userA = crypto.randomUUID();
    const userB = crypto.randomUUID();

    recordEvents(userA, [
      { kind: "lesson", ref: "p1/l1", discipline: "st", occurred_on: "2026-11-01" },
      { kind: "lesson", ref: "p1/l2", discipline: "st", occurred_on: "2026-11-02" },
    ]);
    recordEvents(userB, [
      { kind: "lab", ref: "lab-only-b", discipline: "sd", occurred_on: "2026-11-03" },
    ]);

    const pageA = listProgressEventsPaginated(userA, 1, 0);
    expect(pageA.total).toBe(2);
    expect(pageA.items).toHaveLength(1);
    expect(pageA.hasMore).toBe(true);
    expect(pageA.items.every((e) => e.ref !== "lab-only-b")).toBe(true);

    // Limit is strictly clamped to 100 even if caller asks for 999999
    const clamped = listProgressEventsPaginated(userB, 999_999, 0);
    expect(clamped.limit).toBe(100);
    expect(clamped.total).toBe(1);
    expect(clamped.items[0]?.ref).toBe("lab-only-b");
  });

  it("enforces optimistic concurrency on learner_state_snapshots (stale version rejected without clobbering)", () => {
    const userId = crypto.randomUUID();

    const first = saveLearnerSnapshotWithVersion(userId, JSON.stringify({ v: 1 }), 0);
    expect(first.error).toBeNull();
    expect(first.data?.conflict).toBe(false);
    expect(first.data?.version).toBe(1);

    const second = saveLearnerSnapshotWithVersion(userId, JSON.stringify({ v: 2 }), 1);
    expect(second.data?.conflict).toBe(false);
    expect(second.data?.version).toBe(2);

    // Stale client still passing expectedVersion=1 must trigger conflict and preserve v2
    const stale = saveLearnerSnapshotWithVersion(userId, JSON.stringify({ v: "stale" }), 1);
    expect(stale.data?.conflict).toBe(true);
    expect(stale.data?.currentVersion).toBe(2);

    const persisted = getLearnerSnapshot(userId);
    expect(persisted?.version).toBe(2);
    expect(persisted?.stateJson).toBe(JSON.stringify({ v: 2 }));
  });

  it("supports reviewer-only evidence verification with reviewer_id & reviewed_at", () => {
    const learnerId = crypto.randomUUID();
    const reviewerId = crypto.randomUUID();
    const key = `ev-${crypto.randomUUID()}`;

    recordLearnerEvidence(learnerId, [
      {
        idempotency_key: key,
        skill_id: "sd-reliability",
        evidence_type: "artifact",
        ref: "cap-m2-requirements",
        score: 0.72,
        weight: 2.0,
        confidence: 0.7,
        verification_tier: "self-assessed",
        rubric_version: "2.0.0",
        rubric_scores_json: JSON.stringify({ framing: 3 }),
        artifact_url: "https://example.com/spec",
        artifact_notes: "Initial draft artifact",
        occurred_at: new Date().toISOString(),
      },
    ]);

    const verified = verifyLearnerEvidence(
      learnerId,
      key,
      "reviewer-verified",
      reviewerId,
      0.88,
      "Verified quantitative SLO bounds.",
    );
    expect(verified.error).toBeNull();
    expect(verified.data?.updated).toBe(true);

    const evPage = listLearnerEvidencePaginated(learnerId, 10, 0);
    expect(evPage.items[0]?.verification_tier).toBe("reviewer-verified");
    expect(evPage.items[0]?.score).toBe(0.88);
    expect(evPage.items[0]?.artifact_notes).toContain("Verified quantitative SLO bounds.");
  });

  it("enforces sliding-window rate limits per bucket and key", () => {
    const key = `rl-test-${crypto.randomUUID()}`;
    const max = RATE_LIMIT_POLICIES.export.maxRequests;
    for (let i = 0; i < max; i++) {
      expect(checkRateLimit("export", key).allowed).toBe(true);
    }
    const blocked = checkRateLimit("export", key);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("redacts secrets, tokens, emails, snapshots, and learner notes from structured log payloads", () => {
    const payload = formatLogPayload(
      "warn",
      "account",
      "sync_failed",
      {
        authorization: "Bearer super-secret-jwt",
        email: "victim@example.com",
        passwordHash: "scrypt:abc:def",
        snapshotJson: '{"huge":"private"}',
        artifact_notes: "confidential note",
        safeField: "keep-me",
      },
      "req-12345678",
    );
    const meta = payload["meta"] as Record<string, unknown>;
    expect(payload["requestId"]).toBe("req-12345678");
    expect(meta["authorization"]).toBe("[redacted]");
    expect(meta["email"]).toBe("[redacted]");
    expect(meta["passwordHash"]).toBe("[redacted]");
    expect(meta["snapshotJson"]).toBe("[redacted]");
    expect(meta["artifact_notes"]).toBe("[redacted]");
    expect(meta["safeField"]).toBe("keep-me");
  });

  it("blocks javascript:, data:, vbscript:, and protocol-relative URLs via isSafeHref", () => {
    expect(isSafeHref("https://example.com/doc")).toBe(true);
    expect(isSafeHref("http://localhost:3000/paths")).toBe(true);
    expect(isSafeHref("/library/01-definitions")).toBe(true);

    expect(isSafeHref("javascript:alert(1)")).toBe(false);
    expect(isSafeHref("DATA:text/html,<script>alert(1)</script>")).toBe(false);
    expect(isSafeHref("vbscript:msgbox(1)")).toBe(false);
    expect(isSafeHref("//evil.example/phish")).toBe(false);
    expect(isSafeHref("")).toBe(false);
  });

  it("allows one-time atomic local admin bootstrap ONLY once", () => {
    // Ensure a clean admin slate in test DB if none exists, or test against current DB behavior
    const db = getDatabase();
    const prevAdmins = db
      .prepare("SELECT user_id, role, granted_by, granted_at FROM user_roles WHERE role = 'admin'")
      .all() as Array<{
      user_id: string;
      role: string;
      granted_by: string | null;
      granted_at: string;
    }>;
    try {
      db.prepare("DELETE FROM user_roles WHERE role = 'admin'").run();
      const firstUser = crypto.randomUUID();
      const secondUser = crypto.randomUUID();

      const claim1 = claimFirstLocalAdmin(firstUser);
      expect(claim1.data?.claimed).toBe(true);
      expect(getUserRole(firstUser)).toBe("admin");

      const claim2 = claimFirstLocalAdmin(secondUser);
      expect(claim2.data?.claimed).toBe(false);
      expect(getUserRole(secondUser)).toBe("learner");
    } finally {
      db.prepare("DELETE FROM user_roles WHERE role = 'admin'").run();
      const restore = db.prepare(
        "INSERT OR REPLACE INTO user_roles (user_id, role, granted_by, granted_at) VALUES (?, ?, ?, ?)",
      );
      for (const a of prevAdmins) {
        restore.run(a.user_id, a.role, a.granted_by, a.granted_at);
      }
    }
  });

  it("safely initializes schema on fresh in-memory database without errors", () => {
    const fresh = new DatabaseSync(":memory:");
    expect(() => initTablesSync(fresh)).not.toThrow();
    // Re-running initTablesSync must be idempotent (column migrations don't throw)
    expect(() => initTablesSync(fresh)).not.toThrow();
  });
});
