import { LABS, PATHS, SKILLS, allLessons, lessonHref, lessonKey } from "./content";
import type { Discipline, Evidence, Level, SkillProgress } from "./types";

const HALF_LIFE_DAYS = 45;
const TARGET_WEIGHT = 6;
const DAY = 86_400_000;

export const decay = (days: number) => Math.pow(0.5, Math.max(0, days) / HALF_LIFE_DAYS);

/**
 * v1, explainable:
 *   quality  = sum(weight * score * decay) / sum(weight)
 *   coverage = min(1, sum(weight) / 6)
 *   mastery  = quality * coverage
 * Level 3 needs a variant or lab. Level 4 needs an artifact.
 */
export function computeSkill(
  skillId: string,
  evidence: Evidence[],
  now = Date.now(),
): SkillProgress {
  const ev = evidence.filter((e) => e.skillId === skillId);
  if (ev.length === 0)
    return {
      skillId,
      level: 0,
      mastery: 0,
      evidenceCount: 0,
      gate: "Answer a pause-and-think question to start.",
    };

  const sumW = ev.reduce((n, e) => n + e.weight, 0);
  const num = ev.reduce(
    (n, e) => n + e.weight * e.score * decay((now - Date.parse(e.at)) / DAY),
    0,
  );
  const mastery = (num / sumW) * Math.min(1, sumW / TARGET_WEIGHT);
  const hasApply = ev.some((e) => e.type === "variant" || e.type === "lab");
  const hasArtifact = ev.some((e) => e.type === "artifact");

  let level: Level = 1;
  if (mastery >= 0.25) level = 2;
  if (mastery >= 0.55 && hasApply) level = 3;
  if (mastery >= 0.8 && hasArtifact) level = 4;

  let gate: string | undefined;
  if (level < 3)
    gate =
      mastery >= 0.55 && !hasApply
        ? "Needs a variant or lab to reach Adapt."
        : "Keep answering and explaining to reach Know and Adapt.";
  else if (level < 4)
    gate = hasArtifact
      ? "Raise mastery with spaced review."
      : "Needs an artifact to reach Proceed.";

  const last = ev
    .map((e) => e.at)
    .sort()
    .at(-1);
  return { skillId, level, mastery, lastEvidenceAt: last, evidenceCount: ev.length, gate };
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
  kind: "lesson" | "lab" | "review";
  title: string;
  href: string;
  reason: string;
}

export function nextBestStep(
  progress: SkillProgress[],
  completed: string[],
  now = Date.now(),
): NextStep {
  const byId = new Map(progress.map((p) => [p.skillId, p]));

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
          "Mastery decays without retrieval. This one has not been touched in over two weeks.",
      };
  }

  // 2. Lowest level among skills whose prerequisites are reached.
  const open = SKILLS.filter((s) =>
    s.prerequisites.every((p) => (byId.get(p)?.level ?? 0) >= 1),
  ).sort((a, b) => (byId.get(a.id)?.level ?? 0) - (byId.get(b.id)?.level ?? 0));
  for (const skill of open) {
    const lvl = byId.get(skill.id)?.level ?? 0;
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
        reason: `Builds ${skill.title}, the lowest skill you can reach right now.`,
      };
    const lab = LABS.find((l) => l.skillId === skill.id);
    if (lvl >= 2 && lvl < 4 && lab)
      return {
        kind: "lab",
        title: lab.title,
        href: "/labs",
        reason: `You know ${skill.title}. A lab shows you can adapt it.`,
      };
    if (lesson)
      return {
        kind: "lesson",
        title: lesson.lesson.title,
        href: lessonHref(lesson.path.slug, lesson.lesson.slug),
        reason: `Next in ${skill.title}.`,
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
