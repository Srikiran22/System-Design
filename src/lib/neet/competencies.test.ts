import { describe, it, expect } from "vitest";
import {
  COMPETENCIES,
  competencyById,
  inferCompetenciesFromText,
  validateCompetencyGraph,
} from "./competencies";
import { CAPSTONE_PROJECT, SCENARIOS, evaluateRubric, getRubricForLab } from "./rubrics";
import { computeAll, computeSkill, recommendLearningPath } from "./scale";
import type { Evidence } from "./types";

describe("Competency Architecture, Rubrics & Proceed Scale v2 (Phases 2, 3, 5)", () => {
  it("passes full competency DAG validation with 16 skills and zero cycles", () => {
    const res = validateCompetencyGraph();
    expect(res.valid).toBe(true);
    expect(res.errors).toEqual([]);
    expect(res.stats.competencyCount).toBe(16);
    expect(res.stats.skillParityOk).toBe(true);
    expect(res.stats.mappedLessonCount).toBe(res.stats.lessonCount);
    expect(res.stats.mappedLabCount).toBe(res.stats.labCount);
  });

  it("maps every scenario and capstone milestone to valid competency IDs", () => {
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
    }
  });

  it("evaluates rubrics deterministically and produces revision hints for weak criteria", () => {
    const rubric = getRubricForLab("lab-mcda-trade-study");

    const strong = evaluateRubric(rubric, { framing: 4, rigor: 4, twist: 3, artifact: 3 });
    expect(strong.passedThreshold).toBe(true);
    expect(strong.weightedScore).toBeGreaterThanOrEqual(rubric.passThreshold);

    const weak = evaluateRubric(rubric, { framing: 3, rigor: 1, twist: 2, artifact: 2 });
    expect(weak.passedThreshold).toBe(false);
    expect(weak.feedbackSummary.length).toBeGreaterThanOrEqual(2);
    expect(weak.feedbackSummary.some((f) => f.includes("Swing Weights"))).toBe(true);
  });

  it("computes separate coverage, quality, freshness, and enforces strict L3/L4 evidence gates", () => {
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
          verificationTier: "rubric-evaluated",
        },
      ],
      now,
    );
    expect(withWeakLab.level).toBe(2);

    // 4. Passing rubric lab (>=0.6) unlocks Adapt (L3); passing artifact (>=0.75) unlocks Proceed (L4)
    const withPassingLab: Evidence[] = [
      ...quizOnly,
      {
        skillId: "st-stocks",
        type: "lab",
        score: 0.85,
        weight: 2.5,
        at: "2026-11-19T12:00:00.000Z",
        ref: "lab-1",
        verificationTier: "rubric-evaluated",
      },
    ];
    const adapt = computeSkill("st-stocks", withPassingLab, now);
    expect(adapt.level).toBe(3);
    expect(adapt.verificationTier).toBe("rubric-evaluated");

    const proceed = computeSkill(
      "st-stocks",
      [
        ...withPassingLab,
        {
          skillId: "st-stocks",
          type: "artifact",
          score: 0.9,
          weight: 3,
          at: "2026-11-20T00:00:00.000Z",
          ref: "capstone:m1",
          verificationTier: "rubric-evaluated",
        },
      ],
      now,
    );
    expect(proceed.level).toBe(4);
    expect(proceed.freshness).toBe("fresh");
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
