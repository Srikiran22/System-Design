import { describe, it, expect } from "vitest";
import {
  COMPETENCIES,
  INCOSE_CROSSWALK,
  INCOSE_INTENTIONALLY_UNMAPPED,
  ROLE_PROFILES,
  competencyById,
  computeCurriculumGapReport,
  incoseCrosswalkFor,
  inferCompetenciesFromText,
  roleProfileById,
  validateCompetencyGraph,
} from "./competencies";
import { LABS } from "./content";
import {
  CAPSTONE_PROJECT,
  LAB_RUBRICS,
  SCENARIOS,
  evaluateRubric,
  getRubricForLab,
} from "./rubrics";
import { computeAll, computeSkill, nextBestStep, recommendLearningPath } from "./scale";
import type { Evidence } from "./types";

describe("Competency Architecture, 10 Lab Rubrics, INCOSE Crosswalk & Honest Tiers", () => {
  it("passes full competency DAG validation with 16 skills and zero cycles", () => {
    const res = validateCompetencyGraph();
    expect(res.valid).toBe(true);
    expect(res.errors).toEqual([]);
    expect(res.stats.competencyCount).toBe(16);
    expect(res.stats.skillParityOk).toBe(true);
    expect(res.stats.mappedLessonCount).toBe(res.stats.lessonCount);
    expect(res.stats.mappedLabCount).toBe(res.stats.labCount);
  });

  it("maps every scenario and capstone milestone to valid competency IDs with review gates and change-impact challenge", () => {
    expect(SCENARIOS.length).toBeGreaterThanOrEqual(4);
    for (const sc of SCENARIOS) {
      expect(competencyById(sc.skillId)).toBeDefined();
      expect(sc.options.some((o) => o.score === 1)).toBe(true);
    }

    expect(CAPSTONE_PROJECT.milestones).toHaveLength(6);
    for (const m of CAPSTONE_PROJECT.milestones) {
      expect(m.skillIds.length).toBeGreaterThan(0);
      for (const sid of m.skillIds) {
        expect(competencyById(sid)).toBeDefined();
      }
      expect(m.designReviewGate.length).toBeGreaterThan(0);
    }
    expect(CAPSTONE_PROJECT.changeImpactChallenge.id).toBeTruthy();
    expect(CAPSTONE_PROJECT.changeImpactChallenge.affectedMilestones.length).toBeGreaterThan(0);
    expect(CAPSTONE_PROJECT.changeImpactChallenge.checklist.length).toBeGreaterThanOrEqual(3);
  });

  it("provides 10 distinct domain-specific lab rubrics with normalized weights summing to 1.0", () => {
    expect(LABS.length).toBe(10);
    const defaultId = LAB_RUBRICS["default"]!.id;
    const seenRubricIds = new Set<string>();
    const seenCriterionSignatures = new Set<string>();

    for (const lab of LABS) {
      const rubric = getRubricForLab(lab.id);
      expect(rubric.id).not.toBe(defaultId);
      expect(seenRubricIds.has(rubric.id)).toBe(false);
      seenRubricIds.add(rubric.id);

      const weightSum = rubric.criteria.reduce((acc, c) => acc + c.weight, 0);
      expect(weightSum).toBeCloseTo(1.0, 3);

      const sig = rubric.criteria.map((c) => `${c.id}:${c.label}`).join("|");
      expect(seenCriterionSignatures.has(sig)).toBe(false);
      seenCriterionSignatures.add(sig);

      for (const c of rubric.criteria) {
        expect(c.rationale.length).toBeGreaterThan(10);
        expect(c.evidenceRequired.length).toBeGreaterThan(10);
        expect(c.typicalFailureModes.length).toBeGreaterThan(0);
      }
    }
  });

  it("evaluates domain-specific rubrics deterministically and produces revision hints for weak criteria", () => {
    const rubric = getRubricForLab("lab-mcda-trade-study");

    const strong = evaluateRubric(rubric, {
      alternatives_criteria: 4,
      swing_weights_scoring: 4,
      sensitivity_twist: 3,
      artifact: 3,
    });
    expect(strong.passedThreshold).toBe(true);
    expect(strong.weightedScore).toBeGreaterThanOrEqual(rubric.passThreshold);

    const weak = evaluateRubric(rubric, {
      alternatives_criteria: 3,
      swing_weights_scoring: 1,
      sensitivity_twist: 2,
      artifact: 2,
    });
    expect(weak.passedThreshold).toBe(false);
    expect(weak.feedbackSummary.length).toBeGreaterThanOrEqual(2);
    expect(weak.feedbackSummary.some((f) => f.includes("Swing Weights"))).toBe(true);
  });

  it("enforces honest verification tiers: self-scored rubrics stay self-assessed while peer/reviewer reviews unlock higher tiers", () => {
    const now = Date.parse("2026-11-20T12:00:00.000Z");

    // 1. Unassessed skill is L0 with honest wording
    const empty = computeSkill("st-stocks", [], now);
    expect(empty.level).toBe(0);
    expect(empty.freshness).toBe("none");
    expect(empty.verificationTier).toBe("none");
    expect(empty.gate).toContain("Not yet assessed");

    // 2. Quizzes alone cannot unlock Adapt (L3) even with high mastery
    const quizOnly: Evidence[] = Array.from({ length: 6 }, (_, i) => ({
      skillId: "st-stocks",
      type: "quiz",
      score: 1,
      weight: 1,
      at: "2026-11-19T12:00:00.000Z",
      ref: `q-${i}`,
      verificationTier: "automated-check",
      evaluatorRole: "automated",
    }));
    const afterQuizzes = computeSkill("st-stocks", quizOnly, now);
    expect(afterQuizzes.coverage).toBe(1);
    expect(afterQuizzes.quality).toBeGreaterThan(0.95);
    expect(afterQuizzes.level).toBe(2); // gated at Know (L2)
    expect(afterQuizzes.verificationTier).toBe("automated-check");

    // 3. Failing lab (<0.6) does NOT unlock Adapt (L3)
    const withWeakLab = computeSkill(
      "st-stocks",
      [
        ...quizOnly,
        {
          skillId: "st-stocks",
          type: "lab",
          score: 0.4,
          weight: 2.5,
          at: "2026-11-19T12:00:00.000Z",
          ref: "lab-1",
          verificationTier: "self-assessed",
          evaluatorRole: "self",
        },
      ],
      now,
    );
    expect(withWeakLab.level).toBe(2);

    // 4. Learner self-scored lab (>=0.6) unlocks Adapt (L3) but remains honest tier (automated-check / self-assessed, NEVER rubric-evaluated)
    const selfScoredLab: Evidence[] = [
      {
        skillId: "st-stocks",
        type: "lab",
        score: 0.85,
        weight: 2.5,
        at: "2026-11-19T12:00:00.000Z",
        ref: "lab-1",
        verificationTier: "rubric-evaluated", // even if legacy payload claimed rubric-evaluated
        evaluatorRole: "self",
      },
    ];
    const selfOnly = computeSkill("st-stocks", selfScoredLab, now);
    expect(selfOnly.verificationTier).toBe("self-assessed");

    // 5. Peer/reviewer-scored rubric unlocks rubric-evaluated tier; reviewerId unlocks reviewer-verified
    const peerReviewed = computeSkill(
      "st-stocks",
      [
        ...quizOnly,
        {
          skillId: "st-stocks",
          type: "lab",
          score: 0.85,
          weight: 2.5,
          at: "2026-11-19T12:00:00.000Z",
          ref: "lab-1",
          verificationTier: "rubric-evaluated",
          evaluatorRole: "peer",
        },
      ],
      now,
    );
    expect(peerReviewed.level).toBe(3);
    expect(peerReviewed.verificationTier).toBe("rubric-evaluated");

    const reviewerVerified = computeSkill(
      "st-stocks",
      [
        ...quizOnly,
        {
          skillId: "st-stocks",
          type: "lab",
          score: 0.85,
          weight: 2.5,
          at: "2026-11-19T12:00:00.000Z",
          ref: "lab-1",
          verificationTier: "rubric-evaluated",
          evaluatorRole: "peer",
        },
        {
          skillId: "st-stocks",
          type: "artifact",
          score: 0.9,
          weight: 3,
          at: "2026-11-20T00:00:00.000Z",
          ref: "capstone:m1",
          verificationTier: "reviewer-verified",
          evaluatorRole: "reviewer",
          reviewerId: "rev-001",
        },
      ],
      now,
    );
    expect(reviewerVerified.level).toBe(4);
    expect(reviewerVerified.verificationTier).toBe("reviewer-verified");
    expect(reviewerVerified.freshness).toBe("fresh");
  });

  it("provides complete INCOSE SECF 2e crosswalk for all 16 NEET competencies and deterministic gap report", () => {
    expect(INCOSE_CROSSWALK.length).toBe(16);
    expect(INCOSE_INTENTIONALLY_UNMAPPED.length).toBeGreaterThanOrEqual(3);

    for (const c of COMPETENCIES) {
      const entry = incoseCrosswalkFor(c.id);
      expect(entry, `Missing INCOSE crosswalk for ${c.id}`).toBeDefined();
      if (!entry) continue;
      expect(entry.incoseCompetencyId).toMatch(/^INCOSE-/);
      expect(["direct", "partial", "supporting"]).toContain(entry.mappingType);
      expect(entry.rationale.length).toBeGreaterThan(15);
      expect(entry.indicatorRefs.length).toBeGreaterThan(0);
      expect(entry.sourceEdition).toContain("INCOSE SECF");
      expect(entry.reviewedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }

    const reportA = computeCurriculumGapReport();
    const reportB = computeCurriculumGapReport();
    expect(reportA).toEqual(reportB);
    expect(reportA.totalCompetencies).toBe(16);
    expect(reportA.competenciesMissingCrosswalk).toEqual([]);
    expect(reportA.items).toHaveLength(16);
  });

  it("defines 3 provisional role profiles that steer learning path recommendations and nextBestStep", () => {
    expect(ROLE_PROFILES).toHaveLength(3);
    for (const role of ROLE_PROFILES) {
      expect(role.status).toBe("provisional");
      expect(roleProfileById(role.id)?.id).toBe(role.id);
      for (const sid of Object.keys(role.requiredLevels)) {
        expect(competencyById(sid)).toBeDefined();
      }
    }

    const now = Date.parse("2026-11-20T12:00:00.000Z");
    const emptyProgress = computeAll([], now);
    const safetyRecs = recommendLearningPath(
      emptyProgress,
      [],
      [],
      now,
      "safety-reliability-assurance",
    );
    const archRecs = recommendLearningPath(
      emptyProgress,
      [],
      [],
      now,
      "software-systems-architect",
    );

    expect(safetyRecs[0]?.reason).toContain("Safety, Reliability & Assurance Engineer");
    expect(archRecs[0]?.reason).toContain("Software / Systems Architect");
    const safetyIds = safetyRecs.map((r) => r.skillId);
    const archIds = archRecs.map((r) => r.skillId);
    expect(safetyIds).not.toEqual(archIds);

    const step = nextBestStep(emptyProgress, [], now, [], "safety-reliability-assurance");
    expect(step).not.toBeNull();
  });

  it("prioritizes goal-aligned and stale skills in personalized learning path recommendations", () => {
    const now = Date.parse("2026-11-20T12:00:00.000Z");
    const evidence: Evidence[] = [
      {
        skillId: "st-stocks",
        type: "quiz",
        score: 1,
        weight: 2,
        at: "2026-10-01T12:00:00.000Z", // stale (>35 days)
        ref: "q-old",
      },
    ];
    const progress = computeAll(evidence, now);
    const recs = recommendLearningPath(
      progress,
      [],
      ["Master ISO 29148 requirements engineering and latency sizing"],
      now,
    );

    expect(recs.length).toBeGreaterThan(0);
    expect(recs.some((r) => r.skillId === "st-stocks" && r.priority === "high")).toBe(true);
    expect(recs.some((r) => r.skillId === "sd-requirements" && r.priority === "high")).toBe(true);
  });

  it("infers atomic competencies from role and exercise descriptions", () => {
    const mapped = inferCompetenciesFromText(
      "Perform STPA hazard analysis and build a GSN safety case with Markov availability bounds",
    );
    const ids = mapped.map((c) => c.id);
    expect(ids).toContain("en-safety-stpa");
    expect(ids).toContain("en-assurance-gsn");
    expect(ids).toContain("en-dependability-markov");
    expect(COMPETENCIES.length).toBe(16);
  });
});
