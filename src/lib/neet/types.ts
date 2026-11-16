export type Stage = "search" | "know" | "adapt" | "proceed";
export type Discipline = "thinking" | "design" | "engineering";
export type EvidenceType = "quiz" | "explain" | "variant" | "lab" | "artifact" | "review";

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
  /** what produced this evidence (pause id, lab id) */
  ref?: string;
}

export type Level = 0 | 1 | 2 | 3 | 4;

export interface SkillProgress {
  skillId: string;
  level: Level;
  mastery: number;
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
