import { z } from "zod";
import type { Block, Discipline, Lab, Module, Path } from "./types";
import type { CompetencyDefinition, IncoseCrosswalkEntry, RoleProfile } from "./competencies";
import type {
  CapstoneChangeImpact,
  CapstoneMilestone,
  RubricDefinition,
  ScenarioChallenge,
} from "./rubrics";

/**
 * Shared Zod validation schemas & machine-readable API contracts for dynamic
 * curriculum authoring, course management, and full-stack ingestion.
 * Client-safe: contains zero Node/server imports.
 */

export type ApiErrorCode =
  | "validation_error"
  | "unauthenticated"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "rate_limited"
  | "cycle_detected"
  | "internal_error";

export type ApiResult<T> =
  | { data: T; error: null; errorCode?: undefined }
  | { data: null; error: string; errorCode: ApiErrorCode };

export type PublishStatus = "draft" | "published" | "archived";
export type CurriculumDataSource = "database" | "seed_fallback";

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Safe URL validator blocking javascript:, data:, vbscript: and other dangerous schemes. */
export function isSafeHref(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return true;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export const safeUrlSchema = z
  .string()
  .trim()
  .min(1)
  .max(600)
  .refine(isSafeHref, "URL must use http(s):// or a relative /path");

export const disciplineSchema = z.enum(["thinking", "design", "engineering"]);
export const publishStatusSchema = z.enum(["draft", "published", "archived"]);
export const courseLevelSchema = z.enum(["Beginner", "Intermediate", "Advanced", "Expert"]);

export const lessonBlockSchema: z.ZodType<Block> = z.discriminatedUnion("t", [
  z.object({ t: z.literal("h2"), text: z.string().trim().min(1).max(200) }),
  z.object({ t: z.literal("p"), text: z.string().trim().min(1).max(8000) }),
  z.object({
    t: z.literal("ul"),
    items: z.array(z.string().trim().min(1).max(1000)).min(1).max(30),
  }),
  z.object({
    t: z.literal("callout"),
    title: z.string().trim().min(1).max(160),
    text: z.string().trim().min(1).max(4000),
    tone: z.enum(["note", "warn"]).optional(),
  }),
  z.object({
    t: z.literal("code"),
    text: z.string().min(1).max(12000),
    label: z.string().trim().max(120).optional(),
  }),
  z.object({
    t: z.literal("flow"),
    steps: z.array(z.string().trim().min(1).max(300)).min(1).max(20),
    caption: z.string().trim().max(500).optional(),
    loop: z.boolean().optional(),
  }),
  z.object({
    t: z.literal("pause"),
    id: z.string().trim().min(1).max(120),
    skillId: z.string().trim().min(2).max(100).regex(SLUG_RE, "Skill IDs must be lowercase kebab-case"),
    q: z.string().trim().min(5).max(1000),
    options: z.array(z.string().trim().min(1).max(500)).min(2).max(6),
    answer: z.number().int().min(0).max(5),
    why: z.string().trim().min(5).max(2000),
  }),
]) as z.ZodType<Block>;

export const courseUpsertSchema = z.object({
  id: z.string().trim().min(1).max(100).optional(),
  slug: z.string().trim().min(2).max(120).regex(SLUG_RE, "Slug must be lowercase kebab-case"),
  discipline: disciplineSchema,
  title: z.string().trim().min(2).max(200),
  tagline: z.string().trim().min(2).max(400),
  level: courseLevelSchema,
  status: publishStatusSchema.default("draft"),
  about: z.array(z.string().trim().min(1).max(2000)).min(1).max(12),
  outcomes: z.array(z.string().trim().min(1).max(500)).min(1).max(15),
  artifact: z.string().trim().min(2).max(500),
  sortOrder: z.number().int().min(0).max(10_000).default(100),
});
export type CourseUpsertInput = z.infer<typeof courseUpsertSchema>;

export const moduleUpsertSchema = z.object({
  id: z.string().trim().min(1).max(100).optional(),
  courseId: z.string().trim().min(1).max(100),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(SLUG_RE, "Module slug must be lowercase kebab-case"),
  title: z.string().trim().min(2).max(200),
  summary: z.string().trim().max(600).default(""),
  sortOrder: z.number().int().min(0).max(10_000).default(0),
});
export type ModuleUpsertInput = z.infer<typeof moduleUpsertSchema>;

export const lessonUpsertSchema = z.object({
  id: z.string().trim().min(1).max(100).optional(),
  courseId: z.string().trim().min(1).max(100),
  moduleId: z.string().trim().min(1).max(100),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(SLUG_RE, "Lesson slug must be lowercase kebab-case"),
  title: z.string().trim().min(2).max(200),
  summary: z.string().trim().min(2).max(600),
  minutes: z.number().int().min(1).max(600),
  skillIds: z.array(z.string().trim().min(2).max(100).regex(SLUG_RE, "Skill IDs must be lowercase kebab-case")).min(1).max(10),
  blocks: z.array(lessonBlockSchema).min(1).max(120),
  keep: z.array(z.string().trim().min(1).max(400)).max(12).default([]),
  status: publishStatusSchema.default("published"),
  sortOrder: z.number().int().min(0).max(10_000).default(0),
});
export type LessonUpsertInput = z.infer<typeof lessonUpsertSchema>;

export const rubricCriterionSchema = z.object({
  id: z.string().trim().min(1).max(80),
  label: z.string().trim().min(2).max(160),
  weight: z.number().min(0.05).max(1),
  rationale: z.string().trim().min(5).max(600),
  evidenceRequired: z.string().trim().min(5).max(600),
  typicalFailureModes: z.array(z.string().trim().min(2).max(300)).min(1).max(8),
  descriptors: z.object({
    1: z.string().trim().min(5).max(600),
    2: z.string().trim().min(5).max(600),
    3: z.string().trim().min(5).max(600),
    4: z.string().trim().min(5).max(600),
  }),
  revisionHint: z.string().trim().min(5).max(600),
});

export const rubricDefinitionSchema: z.ZodType<RubricDefinition> = z
  .object({
    id: z.string().trim().min(2).max(120),
    version: z.string().trim().min(1).max(40),
    labTitle: z.string().trim().max(200).optional(),
    passThreshold: z.number().min(0.4).max(1),
    criteria: z.array(rubricCriterionSchema).min(2).max(10),
  })
  .refine(
    (r) => {
      const sum = r.criteria.reduce((acc, c) => acc + c.weight, 0);
      return Math.abs(sum - 1.0) <= 0.01;
    },
    { message: "Rubric criterion weights must sum to 1.0 (±0.01)." },
  ) as z.ZodType<RubricDefinition>;

export const labUpsertSchema = z.object({
  id: z.string().trim().min(2).max(120).regex(SLUG_RE, "Lab ID must be lowercase kebab-case"),
  discipline: disciplineSchema.default("design"),
  skillId: z.string().trim().min(1).max(100),
  title: z.string().trim().min(2).max(200),
  brief: z.string().trim().min(5).max(1000),
  minutes: z.number().int().min(5).max(600),
  steps: z.array(z.string().trim().min(2).max(600)).min(1).max(20),
  twist: z.string().trim().min(5).max(600),
  artifact: z.string().trim().min(5).max(600),
  evidenceType: z.enum(["lab", "variant", "artifact"]),
  rubric: rubricDefinitionSchema,
  status: publishStatusSchema.default("published"),
  sortOrder: z.number().int().min(0).max(10_000).default(100),
});
export type LabUpsertInput = z.infer<typeof labUpsertSchema>;

export const scenarioOptionSchema = z.object({
  id: z.string().trim().min(1).max(40),
  label: z.string().trim().min(5).max(600),
  score: z.number().min(0).max(1),
  tradeoff: z.string().trim().min(5).max(600),
  feedback: z.string().trim().min(5).max(1000),
});

export const scenarioUpsertSchema = z
  .object({
    id: z
      .string()
      .trim()
      .min(2)
      .max(120)
      .regex(SLUG_RE, "Scenario ID must be lowercase kebab-case"),
    skillId: z.string().trim().min(1).max(100),
    title: z.string().trim().min(3).max(200),
    domainContext: z.string().trim().min(3).max(300),
    situation: z.string().trim().min(10).max(2000),
    constraints: z.array(z.string().trim().min(3).max(400)).min(1).max(10),
    question: z.string().trim().min(5).max(500),
    options: z.array(scenarioOptionSchema).min(2).max(6),
    invalidationPrompt: z.string().trim().min(5).max(600),
    status: publishStatusSchema.default("published"),
    sortOrder: z.number().int().min(0).max(10_000).default(100),
  })
  .refine((s) => s.options.some((o) => o.score === 1), {
    message: "Scenario must include at least one optimal option with score === 1.",
  });
export type ScenarioUpsertInput = z.infer<typeof scenarioUpsertSchema>;

export const competencyUpsertSchema = z.object({
  id: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .regex(SLUG_RE, "Competency ID must be lowercase kebab-case"),
  code: z.string().trim().min(2).max(40),
  domain: disciplineSchema,
  title: z.string().trim().min(2).max(160),
  blurb: z.string().trim().min(2).max(400),
  definition: z.string().trim().min(10).max(1200),
  bloomTarget: z.enum(["apply", "analyze", "evaluate", "create"]),
  prerequisites: z.array(z.string().trim().min(2).max(100).regex(SLUG_RE, "Prerequisite IDs must be lowercase kebab-case")).max(12).default([]),
  relations: z
    .array(
      z.object({
        targetId: z.string().trim().min(2).max(100).regex(SLUG_RE, "Related competency IDs must be lowercase kebab-case"),
        kind: z.enum(["assumes", "extends", "related"]),
      }),
    )
    .max(20)
    .default([]),
  frameworkAnchors: z
    .array(
      z.object({
        framework: z.enum(["INCOSE SECF 2e", "SEBoK", "NASA SE Handbook", "ISO/IEC/IEEE"]),
        reference: z.string().trim().min(1).max(200),
        note: z.string().trim().min(1).max(500),
      }),
    )
    .max(10)
    .default([]),
  levelDescriptors: z.tuple([
    z.object({
      level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
      stage: z.enum(["Search", "Know", "Adapt", "Proceed"]),
      observableOutcome: z.string().trim().min(5).max(500),
      requiredEvidence: z
        .array(z.enum(["quiz", "explain", "variant", "lab", "artifact", "review"]))
        .min(1),
    }),
    z.object({
      level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
      stage: z.enum(["Search", "Know", "Adapt", "Proceed"]),
      observableOutcome: z.string().trim().min(5).max(500),
      requiredEvidence: z
        .array(z.enum(["quiz", "explain", "variant", "lab", "artifact", "review"]))
        .min(1),
    }),
    z.object({
      level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
      stage: z.enum(["Search", "Know", "Adapt", "Proceed"]),
      observableOutcome: z.string().trim().min(5).max(500),
      requiredEvidence: z
        .array(z.enum(["quiz", "explain", "variant", "lab", "artifact", "review"]))
        .min(1),
    }),
    z.object({
      level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
      stage: z.enum(["Search", "Know", "Adapt", "Proceed"]),
      observableOutcome: z.string().trim().min(5).max(500),
      requiredEvidence: z
        .array(z.enum(["quiz", "explain", "variant", "lab", "artifact", "review"]))
        .min(1),
    }),
  ]).superRefine((descriptors, ctx) => {
    const expectedStages = ["Search", "Know", "Adapt", "Proceed"] as const;
    descriptors.forEach((descriptor, index) => {
      if (descriptor.level !== index + 1) {
        ctx.addIssue({
          code: "custom",
          path: [index, "level"],
          message: "Competency level descriptors must be ordered exactly 1, 2, 3, 4.",
        });
      }
      if (descriptor.stage !== expectedStages[index]) {
        ctx.addIssue({
          code: "custom",
          path: [index, "stage"],
          message: "Level " + (index + 1) + " must use the matching progression stage.",
        });
      }
    });
  }),
  mappedVolumes: z.array(z.string().trim().min(1).max(200)).max(20).default([]),
  roleTags: z.array(z.string().trim().min(1).max(120)).max(15).default([]),
  version: z.string().trim().min(1).max(40).default("2.0.0"),
  crosswalk: z
    .object({
      incoseCompetencyId: z.string().trim().min(2).max(60),
      incoseDomain: z.enum(["Core", "Technical", "Management", "Professional", "Integrating"]),
      incoseTitle: z.string().trim().min(2).max(160),
      mappingType: z.enum(["direct", "partial", "supporting", "unmapped"]),
      rationale: z.string().trim().min(10).max(600),
      indicatorRefs: z.array(z.string().trim().min(2).max(200)).min(1).max(8),
      sourceEdition: z.literal("INCOSE SECF 2e"),
      reviewedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    })
    .optional(),
  sortOrder: z.number().int().min(0).max(10_000).default(100),
});
export type CompetencyUpsertInput = z.infer<typeof competencyUpsertSchema>;

export const roleProfileUpsertSchema = z.object({
  id: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .regex(SLUG_RE, "Role profile ID must be lowercase kebab-case"),
  title: z.string().trim().min(2).max(160),
  status: z.literal("provisional").default("provisional"),
  disclaimer: z.string().trim().min(10).max(600),
  summary: z.string().trim().min(10).max(800),
  requiredLevels: z.record(
    z.string().trim().min(2).max(100).regex(SLUG_RE, "Required competency IDs must be lowercase kebab-case"),
    z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  ),
  sortOrder: z.number().int().min(0).max(10_000).default(100),
});
export type RoleProfileUpsertInput = z.infer<typeof roleProfileUpsertSchema>;

export const capstoneUpsertSchema = z.object({
  id: z.string().trim().min(2).max(120).regex(SLUG_RE, "Capstone ID must be lowercase kebab-case"),
  version: z.string().trim().min(1).max(40).default("2.0.0"),
  title: z.string().trim().min(3).max(200),
  summary: z.string().trim().min(10).max(1500),
  disclaimer: z.string().trim().min(10).max(800),
  status: publishStatusSchema.default("published"),
  changeImpactChallenge: z.object({
    id: z.string().trim().min(2).max(120),
    title: z.string().trim().min(3).max(240),
    triggerAfterMilestoneId: z.string().trim().min(2).max(120),
    scenario: z.string().trim().min(10).max(2000),
    affectedMilestones: z.array(z.string().trim().min(1).max(120)).min(1).max(12),
    prompt: z.string().trim().min(10).max(1500),
    checklist: z.array(z.string().trim().min(5).max(400)).min(1).max(15),
  }),
  milestones: z
    .array(
      z.object({
        id: z.string().trim().min(2).max(120),
        order: z.number().int().min(1).max(20),
        title: z.string().trim().min(3).max(200),
        traceStage: z.string().trim().min(2).max(120),
        designReviewGate: z.string().trim().min(2).max(160),
        upstreamMilestoneIds: z.array(z.string().trim().min(1).max(120)).max(10),
        skillIds: z.array(z.string().trim().min(1).max(100)).min(1).max(10),
        evidenceType: z.literal("artifact"),
        deliverables: z.array(z.string().trim().min(3).max(400)).min(1).max(12),
        traceabilityLink: z.string().trim().min(3).max(300),
        prompt: z.string().trim().min(10).max(2000),
        rubric: rubricDefinitionSchema,
      }),
    )
    .min(1)
    .max(12),
});
export type CapstoneUpsertInput = z.infer<typeof capstoneUpsertSchema>;

/** Complete portable course bundle schema for programmatic / CLI / CMS import & export. */
export const courseBundleSchema = z.object({
  schemaVersion: z.literal("1.0").default("1.0"),
  course: courseUpsertSchema,
  modules: z
    .array(
      z.object({
        id: z.string().trim().min(1).max(100).optional(),
        slug: z
          .string()
          .trim()
          .min(2)
          .max(120)
          .regex(SLUG_RE, "Module slug must be lowercase kebab-case"),
        title: z.string().trim().min(2).max(200),
        summary: z.string().trim().max(600).default(""),
        sortOrder: z.number().int().min(0).max(10_000).optional(),
        lessons: z
          .array(lessonUpsertSchema.omit({ courseId: true, moduleId: true }))
          .min(1)
          .max(50),
      }),
    )
    .min(1)
    .max(30),
  competencies: z.array(competencyUpsertSchema).max(50).optional(),
  labs: z.array(labUpsertSchema).max(50).optional(),
  scenarios: z.array(scenarioUpsertSchema).max(50).optional(),
}).superRefine((bundle, ctx) => {
  const checkUnique = (values: Array<{ value: string; path: (string | number)[] }>, label: string) => {
    const seen = new Set<string>();
    for (const item of values) {
      if (seen.has(item.value)) {
        ctx.addIssue({
          code: "custom",
          path: item.path,
          message: "Duplicate " + label + " " + item.value + " in course bundle.",
        });
      }
      seen.add(item.value);
    }
  };
  checkUnique(
    bundle.modules.map((module, index) => ({ value: module.slug, path: ["modules", index, "slug"] })),
    "module slug",
  );
  checkUnique(
    bundle.modules.flatMap((module, moduleIndex) =>
      module.lessons.map((lesson, lessonIndex) => ({
        value: lesson.slug,
        path: ["modules", moduleIndex, "lessons", lessonIndex, "slug"],
      })),
    ),
    "lesson slug",
  );
  checkUnique(
    bundle.competencies?.map((item, index) => ({ value: item.id, path: ["competencies", index, "id"] })) ?? [],
    "competency ID",
  );
  checkUnique(
    bundle.competencies?.map((item, index) => ({ value: item.code, path: ["competencies", index, "code"] })) ?? [],
    "competency code",
  );
  checkUnique(
    bundle.labs?.map((item, index) => ({ value: item.id, path: ["labs", index, "id"] })) ?? [],
    "lab ID",
  );
  checkUnique(
    bundle.scenarios?.map((item, index) => ({ value: item.id, path: ["scenarios", index, "id"] })) ?? [],
    "scenario ID",
  );
});
export type CourseBundleInput = z.infer<typeof courseBundleSchema>;

export interface DynamicModuleRecord extends Module {
  id: string;
  sortOrder: number;
}

export interface DynamicCourseRecord extends Path {
  id: string;
  status: PublishStatus;
  sortOrder: number;
  version: number;
  updatedAt: string;
  modules: DynamicModuleRecord[];
}

export interface DynamicLabRecord extends Lab {
  discipline: Discipline;
  rubric: RubricDefinition;
  status: PublishStatus;
  sortOrder: number;
  version: number;
}

export interface DynamicCapstoneRecord {
  id: string;
  version: string;
  title: string;
  summary: string;
  disclaimer: string;
  status: PublishStatus;
  changeImpactChallenge: CapstoneChangeImpact;
  milestones: CapstoneMilestone[];
}

export interface DynamicCompetencyRecord extends CompetencyDefinition {
  blurb: string;
  crosswalk?: IncoseCrosswalkEntry | undefined;
  sortOrder: number;
}

export interface DynamicCurriculumOverview {
  source: CurriculumDataSource;
  courses: DynamicCourseRecord[];
  competencies: DynamicCompetencyRecord[];
  labs: DynamicLabRecord[];
  scenarios: ScenarioChallenge[];
  capstone: DynamicCapstoneRecord | null;
  roleProfiles: RoleProfile[];
}

/**
 * Pure DAG cycle detector for competency prerequisite graphs.
 * Call before committing competency updates so circular prerequisites are always rejected.
 */
export function detectCompetencyCycles(
  nodes: Array<{ id: string; prerequisites: string[] }>,
): string[] {
  const byId = new Map(nodes.map((n) => [n.id, n.prerequisites]));
  const state = new Map<string, 0 | 1 | 2>(); // 0=unvisited, 1=visiting, 2=visited
  const errors: string[] = [];

  const dfs = (id: string, stack: string[]) => {
    const s = state.get(id) ?? 0;
    if (s === 2) return;
    if (s === 1) {
      errors.push(`Cycle detected: ${[...stack, id].join(" -> ")}`);
      return;
    }
    state.set(id, 1);
    for (const pre of byId.get(id) ?? []) {
      if (byId.has(pre)) {
        dfs(pre, [...stack, id]);
      }
    }
    state.set(id, 2);
  };

  for (const n of nodes) {
    if ((state.get(n.id) ?? 0) === 0) dfs(n.id, []);
  }
  return errors;
}

export type DynamicCourseSummary = {
  id: string;
  slug: string;
  discipline: Discipline;
  title: string;
  status: PublishStatus;
  moduleCount: number;
  lessonCount: number;
  version: number;
};
