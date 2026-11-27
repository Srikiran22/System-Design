import { LABS, PATHS, SKILLS, allLessons, lessonHref, lessonKey } from "./content";
import { COMPETENCIES, inferCompetenciesFromText, roleProfileById } from "./competencies";
import type {
  Discipline,
  Evidence,
  FreshnessStatus,
  Level,
  SkillProgress,
  VerificationTier,
} from "./types";

export const SCALE_MODEL_VERSION = "2.1.0";
export const HALF_LIFE_DAYS = 45;
export const TARGET_WEIGHT = 6;
const DAY = 86_400_000;

export const decay = (days: number) => Math.pow(0.5, Math.max(0, days) / HALF_LIFE_DAYS);

const TIER_RANK: Record<VerificationTier, number> = {
  "self-assessed": 1,
  "automated-check": 2,
  "rubric-evaluated": 3,
  "reviewer-verified": 4,
};

/**
 * Honest verification tier resolution:
 * Self-scored rubrics (evaluatorRole === "self") NEVER claim rubric-evaluated or reviewer-verified.
 */
export function resolveEvidenceTier(e: Evidence): VerificationTier {
  if (e.evaluatorRole === "self") return "self-assessed";
  if (e.verificationTier === "reviewer-verified" && e.reviewerId) return "reviewer-verified";
  if (
    e.verificationTier === "rubric-evaluated" &&
    (e.evaluatorRole === "peer" || e.evaluatorRole === "reviewer")
  ) {
    return "rubric-evaluated";
  }
  if (e.verificationTier === "automated-check" || e.evaluatorRole === "automated") {
    return "automated-check";
  }
  if (e.type === "quiz") return "automated-check";
  if (e.type === "review" && e.reviewerId) return "reviewer-verified";
  return "self-assessed";
}

function highestTier(evidence: Evidence[]): VerificationTier | "none" {
  if (evidence.length === 0) return "none";
  let best: VerificationTier = "self-assessed";
  for (const e of evidence) {
    const tier = resolveEvidenceTier(e);
    if (TIER_RANK[tier] > TIER_RANK[best]) best = tier;
  }
  return best;
}

function computeFreshness(lastEvidenceAt: string | undefined, now: number): FreshnessStatus {
  if (!lastEvidenceAt) return "none";
  const ageDays = (now - Date.parse(lastEvidenceAt)) / DAY;
  if (Number.isNaN(ageDays) || ageDays <= 14) return "fresh";
  if (ageDays <= 35) return "aging";
  return "stale";
}

/**
 * Proceed Scale v2.1 (explainable & versioned):
 *   quality  = sum(weight * score * decay(age)) / sum(weight)
 *   coverage = min(1, sum(weight) / 6)
 *   mastery  = quality * coverage
 * Strict gates:
 *   Level 0 = Not assessed (explicitly NOT "zero ability")
 *   Level 1 (Search) = initial framing / retrieval evidence
 *   Level 2 (Know) = mastery >= 0.25
 *   Level 3 (Adapt) = mastery >= 0.55 AND qualifying variant/lab evidence (score >= 0.6)
 *   Level 4 (Proceed) = mastery >= 0.80 AND qualifying artifact evidence (score >= 0.75)
 */
export function computeSkill(
  skillId: string,
  evidence: Evidence[],
  now = Date.now(),
): SkillProgress {
  const ev = evidence.filter((e) => e.skillId === skillId);
  if (ev.length === 0) {
    return {
      skillId,
      level: 0,
      mastery: 0,
      coverage: 0,
      quality: 0,
      freshness: "none",
      verificationTier: "none",
      formulaVersion: SCALE_MODEL_VERSION,
      evidenceCount: 0,
      gate: "Not yet assessed. Answer a pause-and-think check or complete a lab to establish baseline evidence.",
    };
  }

  const sumW = ev.reduce((n, e) => n + e.weight, 0);
  const num = ev.reduce(
    (n, e) => n + e.weight * e.score * decay((now - Date.parse(e.at)) / DAY),
    0,
  );
  const quality = sumW > 0 ? num / sumW : 0;
  const coverage = Math.min(1, sumW / TARGET_WEIGHT);
  const mastery = quality * coverage;

  const hasApply = ev.some((e) => (e.type === "variant" || e.type === "lab") && e.score >= 0.6);
  const hasArtifact = ev.some((e) => e.type === "artifact" && e.score >= 0.75);

  let level: Level = 1;
  if (mastery >= 0.25) level = 2;
  if (mastery >= 0.55 && hasApply) level = 3;
  if (mastery >= 0.8 && hasArtifact) level = 4;

  let gate: string | undefined;
  if (level < 3) {
    gate =
      mastery >= 0.55 && !hasApply
        ? "Needs a passing lab or scenario check (>=60%) to reach Adapt."
        : "Build evidence coverage with retrieval checks and structured explain-backs.";
  } else if (level < 4) {
    gate = hasArtifact
      ? "Raise evidence coverage and recency with spaced retrieval or review."
      : "Needs a passing artifact or capstone milestone (>=75% rubric) to reach Proceed.";
  }

  const last = ev
    .map((e) => e.at)
    .sort()
    .at(-1);

  return {
    skillId,
    level,
    mastery,
    coverage,
    quality,
    freshness: computeFreshness(last, now),
    verificationTier: highestTier(ev),
    formulaVersion: SCALE_MODEL_VERSION,
    lastEvidenceAt: last,
    evidenceCount: ev.length,
    gate,
  };
}

export function computeAll(evidence: Evidence[], now = Date.now()): SkillProgress[] {
  return SKILLS.map((s) => computeSkill(s.id, evidence, now));
}

export function disciplineScores(progress: SkillProgress[]): Record<Discipline, number> {
  const out = { thinking: 0, design: 0, engineering: 0 } as Record<Discipline, number>;
  (Object.keys(out) as Discipline[]).forEach((d) => {
    const ids = SKILLS.filter((s) => s.discipline === d).map((s) => s.id);
    const vals = progress.filter((p) => ids.includes(p.skillId)).map((p) => p.mastery);
    out[d] = vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length) * 100 : 0;
  });
  return out;
}

export function calibration(evidence: Evidence[]) {
  const rated = evidence.filter((e) => typeof e.confidence === "number");
  const buckets = [
    { key: "guess", label: "Guessing", conf: 0.33 },
    { key: "fairly", label: "Fairly sure", conf: 0.66 },
    { key: "certain", label: "Certain", conf: 1 },
  ].map((b) => {
    const items = rated.filter((e) => Math.abs((e.confidence ?? 0) - b.conf) < 0.1);
    const accuracy = items.length ? items.reduce((n, e) => n + e.score, 0) / items.length : null;
    return { ...b, n: items.length, accuracy };
  });
  const avgConf = rated.length
    ? rated.reduce((n, e) => n + (e.confidence ?? 0), 0) / rated.length
    : 0;
  const avgScore = rated.length ? rated.reduce((n, e) => n + e.score, 0) / rated.length : 0;
  return { buckets, gap: avgConf - avgScore, n: rated.length, avgConf, avgScore };
}

export interface NextStep {
  kind: "lesson" | "lab" | "review" | "capstone";
  title: string;
  href: string;
  reason: string;
  skillId?: string;
}

export interface SkillGapRecommendation {
  skillId: string;
  code: string;
  title: string;
  currentLevel: Level;
  targetLevel?: Level;
  freshness: FreshnessStatus;
  priority: "high" | "medium" | "low";
  reason: string;
  actionLabel: string;
  actionHref: string;
}

/** Identifies prioritized competency gaps based on prerequisites, staleness, target role, and goals. */
export function recommendLearningPath(
  progress: SkillProgress[],
  completed: string[],
  goals: string[] = [],
  now = Date.now(),
  targetRoleId?: string,
): SkillGapRecommendation[] {
  const byId = new Map(progress.map((p) => [p.skillId, p]));
  const goalSkillIds = new Set(goals.flatMap((g) => inferCompetenciesFromText(g).map((c) => c.id)));
  const role = roleProfileById(targetRoleId);

  const recs: SkillGapRecommendation[] = [];

  for (const comp of COMPETENCIES) {
    const p = byId.get(comp.id);
    if (!p) continue;
    const prereqsMet = comp.prerequisites.every((pid) => (byId.get(pid)?.level ?? 0) >= 1);
    if (!prereqsMet && p.level === 0) continue;

    const roleTarget = role?.requiredLevels[comp.id];
    const hasRoleGap = typeof roleTarget === "number" && p.level < roleTarget;
    const matchesGoal = goalSkillIds.has(comp.id) || hasRoleGap;

    const lab = LABS.find((l) => l.skillId === comp.id);
    const lesson = allLessons().find(
      (x) =>
        x.lesson.skillIds.includes(comp.id) &&
        !completed.includes(lessonKey(x.path.slug, x.lesson.slug)),
    );

    if (
      p.freshness === "stale" ||
      (p.level >= 1 && p.lastEvidenceAt && now - Date.parse(p.lastEvidenceAt) > 14 * DAY)
    ) {
      const anyLesson = allLessons().find((x) => x.lesson.skillIds.includes(comp.id));
      recs.push({
        skillId: comp.id,
        code: comp.code,
        title: comp.title,
        currentLevel: p.level,
        ...(roleTarget ? { targetLevel: roleTarget } : {}),
        freshness: p.freshness,
        priority: "high",
        reason:
          hasRoleGap && role
            ? `Aging evidence on a ${role.title} target competency (L${p.level} → L${roleTarget}). Refresh with a check or lab.`
            : "Evidence is aging — run a retrieval check or scenario variant to verify retention.",
        actionLabel: lab ? "Practice variant" : "Review lesson",
        actionHref: lab
          ? `/labs#${lab.id}`
          : anyLesson
            ? lessonHref(anyLesson.path.slug, anyLesson.lesson.slug)
            : "/paths",
      });
      continue;
    }

    if (p.level >= 2 && p.level < 4 && lab && (p.level === 2 || hasRoleGap)) {
      recs.push({
        skillId: comp.id,
        code: comp.code,
        title: comp.title,
        currentLevel: p.level,
        ...(roleTarget ? { targetLevel: roleTarget } : {}),
        freshness: p.freshness,
        priority: matchesGoal ? "high" : "medium",
        reason:
          hasRoleGap && role
            ? `Required for ${role.title} (currently L${p.level}, target L${roleTarget}). Complete ${lab.title} with structured rubric reflection.`
            : matchesGoal
              ? "Aligned with your stated goal. Complete the domain lab to advance from Know to Adapt."
              : "Conceptual baseline reached; apply it under a constraint twist to reach Adapt.",
        actionLabel: `Open ${lab.title}`,
        actionHref: `/labs#${lab.id}`,
      });
      continue;
    }

    if (p.level < 2 && lesson) {
      recs.push({
        skillId: comp.id,
        code: comp.code,
        title: comp.title,
        currentLevel: p.level,
        ...(roleTarget ? { targetLevel: roleTarget } : {}),
        freshness: p.freshness,
        priority: matchesGoal ? "high" : p.level === 0 ? "medium" : "low",
        reason:
          hasRoleGap && role
            ? `Role gap for ${role.title} (${comp.code}: L${p.level} → target L${roleTarget}).`
            : matchesGoal
              ? `Directly supports your learning goal (${comp.code}).`
              : `Unblocked foundation (${comp.code}) — build baseline evidence.`,
        actionLabel: `Study ${lesson.lesson.title}`,
        actionHref: lessonHref(lesson.path.slug, lesson.lesson.slug),
      });
    }
  }

  const weight = { high: 0, medium: 1, low: 2 };
  return recs.sort((a, b) => weight[a.priority] - weight[b.priority]).slice(0, 6);
}

export function nextBestStep(
  progress: SkillProgress[],
  completed: string[],
  now = Date.now(),
  goals: string[] = [],
  targetRoleId?: string,
): NextStep {
  const byId = new Map(progress.map((p) => [p.skillId, p]));
  const role = roleProfileById(targetRoleId);

  // 1. Review anything that has gone stale.
  const stale = progress
    .filter(
      (p) => p.level >= 1 && p.lastEvidenceAt && now - Date.parse(p.lastEvidenceAt) > 14 * DAY,
    )
    .sort((a, b) => Date.parse(a.lastEvidenceAt ?? "") - Date.parse(b.lastEvidenceAt ?? ""))[0];
  if (stale) {
    const skill = SKILLS.find((s) => s.id === stale.skillId)!;
    const l = allLessons().find((x) => x.lesson.skillIds.includes(stale.skillId));
    if (l)
      return {
        kind: "review",
        title: `Review: ${skill.title}`,
        href: lessonHref(l.path.slug, l.lesson.slug),
        reason:
          "Evidence decays without retrieval. This competency has not been exercised in over two weeks.",
        skillId: stale.skillId,
      };
  }

  // 2. Role-gap & goal-aligned unblocked skill first, then lowest level among unblocked skills.
  const goalSkillIds = new Set(goals.flatMap((g) => inferCompetenciesFromText(g).map((c) => c.id)));
  const open = SKILLS.filter((s) =>
    s.prerequisites.every((p) => (byId.get(p)?.level ?? 0) >= 1),
  ).sort((a, b) => {
    const aRoleGap =
      role?.requiredLevels[a.id] && (byId.get(a.id)?.level ?? 0) < role.requiredLevels[a.id]!
        ? 0
        : 1;
    const bRoleGap =
      role?.requiredLevels[b.id] && (byId.get(b.id)?.level ?? 0) < role.requiredLevels[b.id]!
        ? 0
        : 1;
    if (aRoleGap !== bRoleGap) return aRoleGap - bRoleGap;
    const aGoal = goalSkillIds.has(a.id) ? 0 : 1;
    const bGoal = goalSkillIds.has(b.id) ? 0 : 1;
    if (aGoal !== bGoal) return aGoal - bGoal;
    return (byId.get(a.id)?.level ?? 0) - (byId.get(b.id)?.level ?? 0);
  });

  for (const skill of open) {
    const lvl = byId.get(skill.id)?.level ?? 0;
    const roleTarget = role?.requiredLevels[skill.id];
    const lesson = allLessons().find(
      (x) =>
        x.lesson.skillIds.includes(skill.id) &&
        !completed.includes(lessonKey(x.path.slug, x.lesson.slug)),
    );
    if (lvl < 2 && lesson)
      return {
        kind: "lesson",
        title: lesson.lesson.title,
        href: lessonHref(lesson.path.slug, lesson.lesson.slug),
        reason:
          role && roleTarget && lvl < roleTarget
            ? `Selected role (${role.title}) targets L${roleTarget} in ${skill.title} (currently L${lvl}).`
            : goalSkillIds.has(skill.id)
              ? `Aligned with your goal — builds ${skill.title}.`
              : `Builds ${skill.title}, the lowest unblocked competency right now.`,
        skillId: skill.id,
      };
    const lab = LABS.find((l) => l.skillId === skill.id);
    if (lvl >= 2 && lvl < 4 && lab)
      return {
        kind: "lab",
        title: lab.title,
        href: `/labs#${lab.id}`,
        reason: `You hold a conceptual model for ${skill.title}. Apply it in a hands-on lab with structured rubric criteria to reach Adapt.`,
        skillId: skill.id,
      };
    if (lesson)
      return {
        kind: "lesson",
        title: lesson.lesson.title,
        href: lessonHref(lesson.path.slug, lesson.lesson.slug),
        reason: `Next in ${skill.title}.`,
        skillId: skill.id,
      };
  }

  const first = PATHS[0];
  return {
    kind: "lesson",
    title: first!.modules[0]!.lessons[0]!.title,
    href: lessonHref(first!.slug, first!.modules[0]!.lessons[0]!.slug),
    reason: "Start at the beginning.",
  };
}
