import { useSyncExternalStore } from "react";
import { PATHS, flatLessons, lessonKey } from "./content";
import { CAPSTONE_PROJECT, SCENARIOS, evaluateRubric, getRubricForLab } from "./rubrics";
import type { ArtifactAttempt, Evidence, Lab } from "./types";

export interface ScenarioAttempt {
  optionId: string;
  score: number;
  invalidationNote: string;
  at: string;
}

export interface State {
  completed: string[];
  completedAt: Record<string, string>;
  saved: string[];
  evidence: Evidence[];
  answers: Record<string, { choice: number; confidence: number; at?: string }>;
  labs: Record<string, { note: string; rating: number; at: string; artifactUrl?: string }>;
  labAttempts: Record<string, ArtifactAttempt[]>;
  explains: Record<string, { text: string; rating: number; at?: string; revisions?: number }>;
  scenarios: Record<string, ScenarioAttempt>;
  capstone: Record<string, ArtifactAttempt[]>;
}

const LEGACY_KEY = "neet.progress.v1";
const KEY_PREFIX = "neet.progress.v2.";

const EMPTY: State = {
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

let activeUserId: string | null = null;
let cache: State = EMPTY;
let loadedKey: string | null = null;
const listeners = new Set<() => void>();

export function storageKeyForUser(userId: string | null): string {
  return `${KEY_PREFIX}${userId ?? "guest"}`;
}

function normalizeState(raw: unknown): State {
  if (!raw || typeof raw !== "object") return EMPTY;
  const r = raw as Partial<State>;
  return {
    completed: Array.isArray(r.completed) ? r.completed : [],
    completedAt: r.completedAt && typeof r.completedAt === "object" ? r.completedAt : {},
    saved: Array.isArray(r.saved) ? r.saved : [],
    evidence: Array.isArray(r.evidence) ? r.evidence : [],
    answers: r.answers && typeof r.answers === "object" ? r.answers : {},
    labs: r.labs && typeof r.labs === "object" ? r.labs : {},
    labAttempts: r.labAttempts && typeof r.labAttempts === "object" ? r.labAttempts : {},
    explains: r.explains && typeof r.explains === "object" ? r.explains : {},
    scenarios: r.scenarios && typeof r.scenarios === "object" ? r.scenarios : {},
    capstone: r.capstone && typeof r.capstone === "object" ? r.capstone : {},
  };
}

function readKey(key: string): State {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw) return normalizeState(JSON.parse(raw));
    // One-time migration of legacy un-scoped key into guest namespace
    if (key === storageKeyForUser(null)) {
      const legacy = window.localStorage.getItem(LEGACY_KEY);
      if (legacy) {
        const migrated = normalizeState(JSON.parse(legacy));
        window.localStorage.setItem(key, JSON.stringify(migrated));
        return migrated;
      }
    }
  } catch {
    return EMPTY;
  }
  return EMPTY;
}

function read(): State {
  if (typeof window === "undefined") return EMPTY;
  const key = storageKeyForUser(activeUserId);
  if (loadedKey !== key) {
    loadedKey = key;
    cache = readKey(key);
  }
  return cache;
}

function write(next: State) {
  const key = storageKeyForUser(activeUserId);
  cache = next;
  loadedKey = key;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(key, JSON.stringify(next));
    } catch {
      /* storage unavailable: keep in memory */
    }
  }
  listeners.forEach((l) => l());
}

/** Switch the active learner namespace so account progress never leaks across users. */
export function setActiveUser(userId: string | null): void {
  const normalized = userId || null;
  if (activeUserId === normalized && loadedKey === storageKeyForUser(normalized)) return;
  activeUserId = normalized;
  loadedKey = null;
  cache = read();
  listeners.forEach((l) => l());
}

export function getActiveUserId(): string | null {
  return activeUserId;
}

/** True when guest storage holds non-demo learner progress that can be migrated on sign-in. */
export function hasGuestProgress(): boolean {
  if (typeof window === "undefined") return false;
  const guest = readKey(storageKeyForUser(null));
  const realEvidence = guest.evidence.filter((e) => !e.ref?.startsWith("demo-"));
  return (
    guest.completed.length > 0 ||
    realEvidence.length > 0 ||
    Object.keys(guest.labs).length > 0 ||
    Object.keys(guest.scenarios).length > 0 ||
    Object.keys(guest.capstone).length > 0
  );
}

/** Merge two State objects cleanly (union completed/saved/evidence, newest wins on records). */
export function mergeStates(local: State, incoming: State): State {
  const completed = Array.from(new Set([...incoming.completed, ...local.completed]));
  const completedAt: Record<string, string> = { ...incoming.completedAt };
  for (const [k, ts] of Object.entries(local.completedAt)) {
    if (!completedAt[k] || ts < completedAt[k]!) completedAt[k] = ts;
  }
  const saved = Array.from(new Set([...incoming.saved, ...local.saved]));

  // Deduplicate evidence by idempotencyKey or (type + ref + skillId)
  const evMap = new Map<string, Evidence>();
  const keyOf = (e: Evidence) => e.idempotencyKey || `${e.type}::${e.skillId}::${e.ref ?? e.at}`;
  for (const e of incoming.evidence) evMap.set(keyOf(e), e);
  for (const e of local.evidence) {
    const k = keyOf(e);
    const existing = evMap.get(k);
    if (!existing || e.at >= existing.at) evMap.set(k, e);
  }

  const mergeAttempts = (
    a: Record<string, ArtifactAttempt[]>,
    b: Record<string, ArtifactAttempt[]>,
  ): Record<string, ArtifactAttempt[]> => {
    const out: Record<string, ArtifactAttempt[]> = { ...a };
    for (const [id, list] of Object.entries(b)) {
      const merged = new Map<string, ArtifactAttempt>();
      for (const item of out[id] ?? []) merged.set(`${item.attemptNumber}:${item.at}`, item);
      for (const item of list) merged.set(`${item.attemptNumber}:${item.at}`, item);
      out[id] = Array.from(merged.values()).sort((x, y) => x.at.localeCompare(y.at));
    }
    return out;
  };

  return {
    completed,
    completedAt,
    saved,
    evidence: Array.from(evMap.values()).sort((a, b) => a.at.localeCompare(b.at)),
    answers: { ...incoming.answers, ...local.answers },
    labs: { ...incoming.labs, ...local.labs },
    labAttempts: mergeAttempts(incoming.labAttempts, local.labAttempts),
    explains: { ...incoming.explains, ...local.explains },
    scenarios: { ...incoming.scenarios, ...local.scenarios },
    capstone: mergeAttempts(incoming.capstone, local.capstone),
  };
}

/** Hydrate the current signed-in user's store from a server snapshot without wiping newer local work. */
export function hydrateFromServerSnapshot(stateJson: string | null): void {
  if (!stateJson) return;
  try {
    const serverState = normalizeState(JSON.parse(stateJson));
    const current = read();
    write(mergeStates(current, serverState));
  } catch {
    /* ignore malformed snapshot */
  }
}

/** Merge non-demo guest progress into the signed-in user's scoped store once and clear guest progress. */
export function claimGuestProgressForUser(userId: string): boolean {
  if (typeof window === "undefined" || !userId) return false;
  const guestKey = storageKeyForUser(null);
  const guest = readKey(guestKey);
  const realEvidence = guest.evidence.filter((e) => !e.ref?.startsWith("demo-"));
  const hasReal =
    guest.completed.length > 0 ||
    realEvidence.length > 0 ||
    Object.keys(guest.labs).length > 0 ||
    Object.keys(guest.scenarios).length > 0 ||
    Object.keys(guest.capstone).length > 0;
  if (!hasReal) return false;

  const cleanedGuest: State = {
    ...guest,
    evidence: realEvidence,
  };
  const userKey = storageKeyForUser(userId);
  const existingUser = readKey(userKey);
  const merged = mergeStates(existingUser, cleanedGuest);
  try {
    window.localStorage.setItem(userKey, JSON.stringify(merged));
    window.localStorage.removeItem(guestKey);
  } catch {
    /* ignore */
  }
  if (activeUserId === userId) {
    cache = merged;
    loadedKey = userKey;
    listeners.forEach((l) => l());
  }
  return true;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === storageKeyForUser(activeUserId)) {
      loadedKey = null;
      cb();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function useProgress(): State {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

/** True once running in the browser, so UIs can avoid flashing empty states. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export type ProgressKind = "lesson" | "lab" | "quiz" | "explain" | "article";
export interface ProgressSignal {
  kind: ProgressKind;
  ref: string;
  skillId?: string | undefined;
  occurredAt?: string | undefined;
  evidence?: Evidence | undefined;
}

/** Broadcast a finished activity; ProgressSync forwards it to the account when signed in. */
export function emitProgress(sig: ProgressSignal) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<ProgressSignal>("neet:progress", { detail: sig }));
}

export function lessonSkill(key: string): string | undefined {
  for (const p of PATHS)
    for (const { lesson } of flatLessons(p))
      if (lessonKey(p.slug, lesson.slug) === key) return lesson.skillIds[0];
  return undefined;
}

export function readProgressSnapshot(): State {
  return read();
}

const toggle = (list: string[], v: string) =>
  list.includes(v) ? list.filter((x) => x !== v) : [...list, v];

function validateArtifactUrl(raw?: string): string | undefined {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return undefined;
  if (/^https?:\/\/\S+/i.test(trimmed) || trimmed.startsWith("/")) {
    return trimmed.slice(0, 500);
  }
  return undefined;
}

export const actions = {
  toggleComplete(key: string) {
    const s = read();
    const done = !s.completed.includes(key);
    const now = new Date().toISOString();
    const nextCompletedAt = { ...s.completedAt };
    if (done) {
      nextCompletedAt[key] = now;
    } else {
      delete nextCompletedAt[key];
    }
    write({
      ...s,
      completed: toggle(s.completed, key),
      completedAt: nextCompletedAt,
    });
    if (done) {
      emitProgress({
        kind: "lesson",
        ref: key,
        skillId: lessonSkill(key),
        occurredAt: now,
      });
    }
  },
  toggleSaved(key: string) {
    const s = read();
    write({ ...s, saved: toggle(s.saved, key) });
  },
  answerPause(id: string, skillId: string, choice: number, correct: boolean, confidence: number) {
    const s = read();
    if (s.answers[id]) return;
    const now = new Date().toISOString();
    const ev: Evidence = {
      idempotencyKey: `quiz:${id}`,
      skillId,
      type: "quiz",
      score: correct ? 1 : 0,
      weight: 1,
      at: now,
      confidence,
      ref: id,
      verificationTier: "automated-check",
    };
    write({
      ...s,
      answers: { ...s.answers, [id]: { choice, confidence, at: now } },
      evidence: [...s.evidence, ev],
    });
    emitProgress({ kind: "quiz", ref: id, skillId, occurredAt: now, evidence: ev });
  },
  explainBack(lessonKeyStr: string, skillId: string, text: string, rating: number) {
    const s = read();
    const now = new Date().toISOString();
    const prior = s.evidence.filter((e) => e.ref !== `explain:${lessonKeyStr}`);
    const revisions = (s.explains[lessonKeyStr]?.revisions ?? 0) + 1;
    const ev: Evidence = {
      idempotencyKey: `explain:${lessonKeyStr}:v${revisions}`,
      skillId,
      type: "explain",
      score: rating / 3,
      weight: 1.5,
      at: now,
      ref: `explain:${lessonKeyStr}`,
      verificationTier: "self-assessed",
      artifactNotes: text.slice(0, 4000),
    };
    write({
      ...s,
      evidence: [...prior, ev],
      explains: {
        ...s.explains,
        [lessonKeyStr]: { text, rating, at: now, revisions },
      },
    });
    emitProgress({ kind: "explain", ref: lessonKeyStr, skillId, occurredAt: now, evidence: ev });
  },
  /** Backward-compatible self-rated lab submission. */
  submitLab(lab: Lab, note: string, rating: number) {
    const s = read();
    const now = new Date().toISOString();
    const weight = lab.evidenceType === "artifact" ? 3 : lab.evidenceType === "lab" ? 2.5 : 2;
    const prior = s.evidence.filter((e) => e.ref !== lab.id);
    const ev: Evidence = {
      idempotencyKey: `lab:${lab.id}:${now}`,
      skillId: lab.skillId,
      type: lab.evidenceType,
      score: rating / 3,
      weight,
      at: now,
      ref: lab.id,
      verificationTier: "self-assessed",
      artifactNotes: note.slice(0, 6000),
    };
    write({
      ...s,
      evidence: [...prior, ev],
      labs: { ...s.labs, [lab.id]: { note, rating, at: ev.at } },
    });
    emitProgress({ kind: "lab", ref: lab.id, skillId: lab.skillId, occurredAt: now, evidence: ev });
  },
  /** Rubric-evaluated lab submission with revision history and instant criterion feedback. */
  submitLabRubric(
    lab: Lab,
    params: {
      note: string;
      twistResponse?: string;
      artifactUrl?: string;
      criterionScores: Record<string, number>;
    },
  ): ArtifactAttempt {
    const s = read();
    const now = new Date().toISOString();
    const rubric = getRubricForLab(lab.id);
    const evalResult = evaluateRubric(rubric, params.criterionScores);
    const safeUrl = validateArtifactUrl(params.artifactUrl);
    const prevAttempts = s.labAttempts[lab.id] ?? [];
    const attemptNumber = prevAttempts.length + 1;

    const fullNotes = [
      params.note.trim(),
      params.twistResponse?.trim()
        ? `\n\n[Constraint twist response]\n${params.twistResponse.trim()}`
        : "",
    ]
      .join("")
      .trim();

    const attempt: ArtifactAttempt = {
      attemptNumber,
      at: now,
      note: fullNotes,
      ...(safeUrl ? { artifactUrl: safeUrl } : {}),
      ...(params.twistResponse?.trim() ? { twistResponse: params.twistResponse.trim() } : {}),
      rubricVersion: rubric.version,
      rubricScores: params.criterionScores,
      weightedScore: evalResult.weightedScore,
      passedThreshold: evalResult.passedThreshold,
      feedbackSummary: evalResult.feedbackSummary,
      verificationTier: "rubric-evaluated",
    };

    const weight = lab.evidenceType === "artifact" ? 3 : lab.evidenceType === "lab" ? 2.5 : 2;
    const prior = s.evidence.filter((e) => e.ref !== lab.id);
    const ev: Evidence = {
      idempotencyKey: `lab:${lab.id}:v${attemptNumber}`,
      skillId: lab.skillId,
      type: lab.evidenceType,
      score: evalResult.weightedScore,
      weight,
      at: now,
      ref: lab.id,
      verificationTier: "rubric-evaluated",
      rubricVersion: rubric.version,
      rubricScores: params.criterionScores,
      ...(safeUrl ? { artifactUrl: safeUrl } : {}),
      artifactNotes: fullNotes.slice(0, 6000),
    };

    const ratingEquivalent =
      evalResult.weightedScore >= 0.8 ? 3 : evalResult.weightedScore >= 0.55 ? 2 : 1;

    write({
      ...s,
      evidence: [...prior, ev],
      labs: {
        ...s.labs,
        [lab.id]: {
          note: fullNotes,
          rating: ratingEquivalent,
          at: now,
          ...(safeUrl ? { artifactUrl: safeUrl } : {}),
        },
      },
      labAttempts: {
        ...s.labAttempts,
        [lab.id]: [...prevAttempts, attempt],
      },
    });
    emitProgress({ kind: "lab", ref: lab.id, skillId: lab.skillId, occurredAt: now, evidence: ev });
    return attempt;
  },
  /** Record a worked engineering trade-off scenario evaluation. */
  answerScenario(scenarioId: string, optionId: string, invalidationNote: string) {
    const scenario = SCENARIOS.find((sc) => sc.id === scenarioId);
    if (!scenario) return;
    const option = scenario.options.find((o) => o.id === optionId);
    if (!option) return;

    const s = read();
    const now = new Date().toISOString();
    const hasJustification = invalidationNote.trim().length >= 25;
    // Credit full option score when learner also writes an invalidation condition; otherwise cap slightly
    const finalScore = hasJustification
      ? option.score
      : Math.round(Math.max(0, option.score - 0.1) * 100) / 100;

    const ref = `scenario:${scenarioId}`;
    const prior = s.evidence.filter((e) => e.ref !== ref);
    const ev: Evidence = {
      idempotencyKey: `scenario:${scenarioId}:${optionId}`,
      skillId: scenario.skillId,
      type: "variant",
      score: finalScore,
      weight: 2.25,
      at: now,
      ref,
      verificationTier: "rubric-evaluated",
      artifactNotes:
        `Selected option ${optionId}: ${option.label}\nInvalidation condition: ${invalidationNote.trim()}`.slice(
          0,
          4000,
        ),
    };

    write({
      ...s,
      evidence: [...prior, ev],
      scenarios: {
        ...s.scenarios,
        [scenarioId]: {
          optionId,
          score: finalScore,
          invalidationNote: invalidationNote.trim(),
          at: now,
        },
      },
    });
    emitProgress({
      kind: "lab",
      ref,
      skillId: scenario.skillId,
      occurredAt: now,
      evidence: ev,
    });
  },
  /** Submit or revise a traceable Capstone milestone artifact. */
  submitCapstoneMilestone(
    milestoneId: string,
    params: {
      note: string;
      artifactUrl?: string;
      criterionScores: Record<string, number>;
    },
  ): ArtifactAttempt | null {
    const milestone = CAPSTONE_PROJECT.milestones.find((m) => m.id === milestoneId);
    if (!milestone) return null;

    const s = read();
    const now = new Date().toISOString();
    const evalResult = evaluateRubric(milestone.rubric, params.criterionScores);
    const safeUrl = validateArtifactUrl(params.artifactUrl);
    const prevAttempts = s.capstone[milestoneId] ?? [];
    const attemptNumber = prevAttempts.length + 1;

    const primarySkillId = milestone.skillIds[0] ?? "sd-requirements";
    const attempt: ArtifactAttempt = {
      attemptNumber,
      at: now,
      note: params.note.trim(),
      ...(safeUrl ? { artifactUrl: safeUrl } : {}),
      rubricVersion: milestone.rubric.version,
      rubricScores: params.criterionScores,
      weightedScore: evalResult.weightedScore,
      passedThreshold: evalResult.passedThreshold,
      feedbackSummary: evalResult.feedbackSummary,
      verificationTier: "rubric-evaluated",
    };

    const ref = `capstone:${milestoneId}`;
    const prior = s.evidence.filter((e) => e.ref !== ref);
    const ev: Evidence = {
      idempotencyKey: `capstone:${milestoneId}:v${attemptNumber}`,
      skillId: primarySkillId,
      type: "artifact",
      score: evalResult.weightedScore,
      weight: 3,
      at: now,
      ref,
      verificationTier: "rubric-evaluated",
      rubricVersion: milestone.rubric.version,
      rubricScores: params.criterionScores,
      ...(safeUrl ? { artifactUrl: safeUrl } : {}),
      artifactNotes: params.note.trim().slice(0, 6000),
    };

    write({
      ...s,
      evidence: [...prior, ev],
      capstone: {
        ...s.capstone,
        [milestoneId]: [...prevAttempts, attempt],
      },
    });
    emitProgress({
      kind: "lab",
      ref,
      skillId: primarySkillId,
      occurredAt: now,
      evidence: ev,
    });
    return attempt;
  },
  loadDemo() {
    const day = 86_400_000;
    const now = Date.now();
    const ago = (d: number) => new Date(now - d * day).toISOString();
    const q = (
      skillId: string,
      d: number,
      score: number,
      confidence: number,
      n: number,
    ): Evidence => ({
      idempotencyKey: `demo-q-${skillId}-${n}`,
      skillId,
      type: "quiz",
      score,
      weight: 1,
      at: ago(d),
      confidence,
      ref: `demo-q-${skillId}-${n}`,
      verificationTier: "automated-check",
    });
    const evidence: Evidence[] = [
      q("st-stocks", 20, 1, 0.66, 1),
      q("st-stocks", 19, 1, 1, 2),
      q("st-stocks", 18, 1, 0.66, 3),
      q("st-stocks", 12, 1, 1, 4),
      q("st-loops", 15, 1, 0.66, 1),
      q("st-loops", 14, 0, 1, 2),
      q("st-loops", 13, 1, 1, 3),
      q("st-loops", 5, 1, 0.66, 4),
      {
        idempotencyKey: "demo-lab-loop-map",
        skillId: "st-loops",
        type: "lab",
        score: 0.9,
        weight: 2.5,
        at: ago(4),
        ref: "lab-loop-map",
        verificationTier: "rubric-evaluated",
      },
      {
        idempotencyKey: "demo-explain-1",
        skillId: "st-loops",
        type: "explain",
        score: 0.66,
        weight: 1.5,
        at: ago(4),
        ref: "demo-explain-1",
        verificationTier: "self-assessed",
      },
      q("st-leverage", 3, 0, 1, 1),
      q("st-leverage", 2, 1, 0.33, 2),
      q("sd-requirements", 30, 1, 1, 1),
      q("sd-requirements", 29, 1, 0.66, 2),
      q("sd-requirements", 28, 0, 1, 3),
      {
        idempotencyKey: "demo-lab-estimate",
        skillId: "sd-requirements",
        type: "variant",
        score: 0.66,
        weight: 2,
        at: ago(27),
        ref: "lab-estimate",
        verificationTier: "rubric-evaluated",
      },
      q("sd-data", 24, 1, 0.66, 1),
      q("sd-data", 23, 1, 0.33, 2),
      q("en-reading", 9, 1, 0.66, 1),
      q("en-reading", 8, 1, 1, 2),
      {
        idempotencyKey: "demo-lab-reading",
        skillId: "en-reading",
        type: "lab",
        score: 1,
        weight: 2.5,
        at: ago(7),
        ref: "lab-reading",
        verificationTier: "rubric-evaluated",
      },
      {
        idempotencyKey: "demo-artifact-1",
        skillId: "en-reading",
        type: "artifact",
        score: 1,
        weight: 3,
        at: ago(6),
        ref: "demo-artifact-1",
        verificationTier: "rubric-evaluated",
      },
      {
        idempotencyKey: "demo-review-1",
        skillId: "en-reading",
        type: "review",
        score: 1,
        weight: 1,
        at: ago(1),
        ref: "demo-review-1",
        verificationTier: "automated-check",
      },
    ];
    const completed = flatLessons(PATHS[0]!)
      .slice(0, 3)
      .map((x) => lessonKey(PATHS[0]!.slug, x.lesson.slug));
    const completedAt: Record<string, string> = {};
    completed.forEach((k, idx) => {
      completedAt[k] = ago(20 - idx * 3);
    });
    const s = read();
    write({ ...s, evidence, completed, completedAt });
  },
  reset() {
    write(EMPTY);
  },
};
