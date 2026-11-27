export type Stage = "search" | "know" | "adapt" | "proceed";
export type Discipline = "thinking" | "design" | "engineering";
export type EvidenceType = "quiz" | "explain" | "variant" | "lab" | "artifact" | "review";
export type VerificationTier =
  "self-assessed" | "automated-check" | "rubric-evaluated" | "reviewer-verified";
export type EvaluatorRole = "self" | "automated" | "peer" | "reviewer";
export type ReviewState =
  "draft" | "submitted" | "under_review" | "needs_revision" | "accepted" | "not_met";
export type FreshnessStatus = "fresh" | "aging" | "stale" | "none";
export type BloomLevel = "apply" | "analyze" | "evaluate" | "create";

export interface Skill {
  id: string;
  discipline: Discipline;
  title: string;
  blurb: string;
  prerequisites: string[];
}

export interface Evidence {
  skillId: string;
  type: EvidenceType;
  /** 0..1 */
  score: number;
  weight: number;
  /** ISO timestamp */
  at: string;
  /** self-rated confidence 0..1 (for calibration) */
  confidence?: number;
  /** what produced this evidence (pause id, lab id, capstone milestone) */
  ref?: string;
  /** deterministic idempotency key for durable sync */
  idempotencyKey?: string;
  /** provenance of evaluation — strictly separates self-report from automated checks & verified review */
  verificationTier?: VerificationTier;
  evaluatorRole?: EvaluatorRole;
  reviewState?: ReviewState;
  rubricId?: string;
  rubricVersion?: string;
  rubricScores?: Record<string, number>;
  reviewerId?: string;
  reviewedAt?: string;
  artifactUrl?: string;
  artifactNotes?: string;
}

export type Level = 0 | 1 | 2 | 3 | 4;

export interface SkillProgress {
  skillId: string;
  level: Level;
  mastery: number;
  /** 0..1 evidence coverage toward target weight */
  coverage: number;
  /** 0..1 time-decayed weighted evidence quality */
  quality: number;
  freshness: FreshnessStatus;
  verificationTier: VerificationTier | "none";
  formulaVersion: string;
  lastEvidenceAt?: string | undefined;
  evidenceCount: number;
  gate?: string | undefined;
}

export type Block =
  | { t: "h2"; text: string }
  | { t: "p"; text: string }
  | { t: "ul"; items: string[] }
  | { t: "callout"; title: string; text: string; tone?: "note" | "warn" }
  | { t: "code"; text: string; label?: string }
  | { t: "flow"; steps: string[]; caption?: string; loop?: boolean }
  | {
      t: "pause";
      id: string;
      skillId: string;
      q: string;
      options: string[];
      answer: number;
      why: string;
    };

export interface Lesson {
  slug: string;
  title: string;
  minutes: number;
  summary: string;
  skillIds: string[];
  keep: string[];
  blocks: Block[];
}

export interface Module {
  slug: string;
  title: string;
  summary: string;
  lessons: Lesson[];
}

export interface Path {
  slug: string;
  title: string;
  discipline: Discipline;
  tagline: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  about: string[];
  outcomes: string[];
  artifact: string;
  modules: Module[];
}

export interface Lab {
  id: string;
  title: string;
  skillId: string;
  evidenceType: Extract<EvidenceType, "lab" | "variant" | "artifact">;
  minutes: number;
  brief: string;
  steps: string[];
  twist: string;
  artifact: string;
}

export interface DecisionRecord {
  selectedDecision: string;
  rejectedAlternatives: string;
  assumptions: string;
  residualRisks: string;
}

export interface ArtifactAttempt {
  attemptNumber: number;
  at: string;
  note: string;
  artifactUrl?: string;
  twistResponse?: string;
  feedbackResponse?: string;
  linkedPriorArtifactIds?: string[];
  decisionRecord?: DecisionRecord;
  rubricId: string;
  rubricVersion: string;
  rubricScores: Record<string, number>;
  weightedScore: number;
  passedThreshold: boolean;
  feedbackSummary: string[];
  verificationTier: VerificationTier;
  evaluatorRole: EvaluatorRole;
  reviewState: ReviewState;
}

export interface LearningRepo {
  listPaths(): Promise<Path[]>;
  getPath(slug: string): Promise<Path | null>;
  getLesson(
    pathSlug: string,
    lessonSlug: string,
  ): Promise<{
    path: Path;
    module: Module;
    lesson: Lesson;
    prev: { path: string; lesson: Lesson } | null;
    next: { path: string; lesson: Lesson } | null;
  } | null>;
  listLabs(): Promise<Lab[]>;
}
