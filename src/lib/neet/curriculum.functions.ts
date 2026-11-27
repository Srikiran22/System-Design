import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import {
  hasRoleAtLeast,
  isLocalDevAuthAllowed,
  isSupabaseServerConfigured,
  requireAdmin,
  requireAuthorOrAdmin,
  requireVerifiedAuth,
  tryVerifyRequestPrincipal,
  type AppRole,
} from "./auth-server";
import { enforceRateLimit, RateLimitError } from "./rate-limit.server";
import { getOperationalMetricsSnapshot, measureOperation } from "./metrics.server";
import { logEvent, safeUserRef } from "./logger";
import {
  capstoneUpsertSchema,
  competencyUpsertSchema,
  courseBundleSchema,
  courseUpsertSchema,
  detectCompetencyCycles,
  disciplineSchema,
  labUpsertSchema,
  lessonUpsertSchema,
  moduleUpsertSchema,
  publishStatusSchema,
  roleProfileUpsertSchema,
  scenarioUpsertSchema,
  type ApiErrorCode,
  type ApiResult,
  type CurriculumDataSource,
  type DynamicCapstoneRecord,
  type DynamicCompetencyRecord,
  type DynamicCourseRecord,
  type DynamicCurriculumOverview,
  type DynamicLabRecord,
  type DynamicModuleRecord,
} from "./curriculum-schemas";
import { LABS, PATHS, SKILLS } from "./content";
import { COMPETENCIES, INCOSE_CROSSWALK, ROLE_PROFILES, type RoleProfile } from "./competencies";
import { CAPSTONE_PROJECT, LAB_RUBRICS, SCENARIOS, type ScenarioChallenge } from "./rubrics";
import type { Block, Discipline, Lesson } from "./types";
import {
  CANONICAL_COMPETENCY_IDS,
  findCompetencyReferences,
  validateCompetencyGraphReferences,
  validateCourseBundleReferences,
  validateRoleProfileReferences,
  validateSkillReferences,
  validateSupportedCompetencyIds,
} from "./curriculum-integrity";
import type { AuditLogRecord, PaginatedResult, UserRoleRecord } from "./db.server";

/**
 * Dynamic Curriculum & Course Authoring Server Functions (Dual-Mode: Supabase + SQLite).
 *
 * Cloud / Supabase runtime NEVER imports `db.server` or `curriculum-db.server` (`node:sqlite`).
 * Local dev runtime persists all courses, modules, lessons, competencies, labs, scenarios,
 * capstones, role profiles, RBAC roles, and audit logs to SQLite.
 */

const ok = <T>(data: T): ApiResult<T> => ({ data, error: null });
const fail = (error: string, errorCode: ApiErrorCode = "internal_error"): ApiResult<never> => ({
  data: null,
  error,
  errorCode,
});

function createPublicSupabaseClient(): SupabaseClient<Database> {
  const url = (process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"])!;
  const key = (process.env["SUPABASE_PUBLISHABLE_KEY"] ??
    process.env["VITE_SUPABASE_PUBLISHABLE_KEY"])!;
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

type SupaRes<T = Record<string, unknown>[]> = Promise<{
  data: T | null;
  error: { message: string; code?: string } | null;
  count?: number | null;
}>;

interface DynamicSupaQuery {
  select(columns: string, opts?: { count?: "exact"; head?: boolean }): DynamicSupaQuery;
  eq(col: string, val: unknown): DynamicSupaQuery;
  order(col: string, opts?: { ascending?: boolean }): DynamicSupaQuery;
  range(from: number, to: number): SupaRes;
  limit(n: number): DynamicSupaQuery & SupaRes;
  maybeSingle(): SupaRes<Record<string, unknown>>;
  upsert(
    rows: Record<string, unknown> | Record<string, unknown>[],
    opts?: { onConflict?: string },
  ): SupaRes;
  update(patch: Record<string, unknown>): DynamicSupaQuery;
  insert(rows: Record<string, unknown> | Record<string, unknown>[]): SupaRes;
  delete(): DynamicSupaQuery;
  then: SupaRes["then"];
}

function supaTable(client: SupabaseClient<Database>, table: string): DynamicSupaQuery {
  return (client as unknown as { from: (t: string) => DynamicSupaQuery }).from(table);
}

/**
 * Seed the 16 canonical competency rows on the first authoring write.
 * Reads may safely use bundled fallback data, but write paths must materialize
 * the same IDs first because labs/scenarios have database-level foreign keys.
 */
async function ensureCanonicalCompetencyRows(
  supabase: SupabaseClient<Database>,
): Promise<string | null> {
  const current = await supaTable(supabase, "curriculum_competencies").select("id");
  if (current.error || !Array.isArray(current.data)) {
    return "Cannot verify the canonical competency catalogue in Supabase. Check the managed curriculum schema.";
  }

  const existingIds = new Set(current.data.map((row) => String(row["id"])));
  const blurbs = new Map(SKILLS.map((skill) => [skill.id, skill.blurb]));
  const crosswalk = new Map(INCOSE_CROSSWALK.map((item) => [item.neetCompetencyId, item]));
  const missing = COMPETENCIES.filter((competency) => !existingIds.has(competency.id)).map(
    (competency, index) => {
      const mapped = crosswalk.get(competency.id);
      return {
        id: competency.id,
        code: competency.code,
        domain: competency.domain,
        title: competency.title,
        blurb: blurbs.get(competency.id) ?? competency.definition.slice(0, 140),
        definition: competency.definition,
        bloom_target: competency.bloomTarget,
        prerequisites_json: competency.prerequisites,
        relations_json: competency.relations,
        framework_anchors_json: competency.frameworkAnchors,
        level_descriptors_json: competency.levelDescriptors,
        mapped_volumes_json: competency.mappedVolumes,
        role_tags_json: competency.roleTags,
        crosswalk_json: mapped ? { neetCompetencyId: competency.id, ...mapped } : null,
        version: competency.version,
        sort_order: (index + 1) * 10,
        updated_at: new Date().toISOString(),
      };
    },
  );

  if (missing.length === 0) return null;
  const seeded = await supaTable(supabase, "curriculum_competencies").upsert(missing, {
    onConflict: "id",
  });
  if (seeded.error) {
    return "Cannot initialize the canonical competency catalogue: " + seeded.error.message;
  }
  return null;
}

/** Seed fallback converters (ONLY used if Supabase cloud curriculum tables are not yet provisioned). */
function seedFallbackCourses(discipline?: Discipline): DynamicCourseRecord[] {
  if (process.env["NEET_SKIP_DEFAULT_CURRICULUM_SEED"] === "1") return [];
  const filtered = discipline ? PATHS.filter((p) => p.discipline === discipline) : PATHS;
  return filtered.map((p, idx) => ({
    ...p,
    id: `course-${p.slug}`,
    status: "published",
    sortOrder: (idx + 1) * 10,
    version: 1,
    updatedAt: new Date(0).toISOString(),
    modules: p.modules.map((m, mIdx) => ({
      ...m,
      id: `mod-${p.slug}-${m.slug}`,
      sortOrder: (mIdx + 1) * 10,
    })),
  }));
}

function seedFallbackCompetencies(): DynamicCompetencyRecord[] {
  if (process.env["NEET_SKIP_DEFAULT_CURRICULUM_SEED"] === "1") return [];
  const blurbs = new Map(SKILLS.map((s) => [s.id, s.blurb]));
  const crosswalk = new Map(INCOSE_CROSSWALK.map((c) => [c.neetCompetencyId, c]));
  return COMPETENCIES.map((c, idx) => {
    const cw = crosswalk.get(c.id);
    return {
      ...c,
      blurb: blurbs.get(c.id) ?? c.definition.slice(0, 140),
      sortOrder: (idx + 1) * 10,
      ...(cw ? { crosswalk: cw } : {}),
    };
  });
}

function seedFallbackLabs(): DynamicLabRecord[] {
  if (process.env["NEET_SKIP_DEFAULT_CURRICULUM_SEED"] === "1") return [];
  const discMap = new Map(SKILLS.map((s) => [s.id, s.discipline]));
  return LABS.map((lab, idx) => ({
    ...lab,
    discipline: discMap.get(lab.skillId) ?? "design",
    rubric: LAB_RUBRICS[lab.id] ?? LAB_RUBRICS["default"]!,
    status: "published",
    sortOrder: (idx + 1) * 10,
    version: 1,
  }));
}

async function canReadDrafts(requested: boolean | undefined): Promise<boolean> {
  if (!requested) return false;
  const principal = await tryVerifyRequestPrincipal(getRequest());
  return Boolean(principal && hasRoleAtLeast(principal.role, "author"));
}

async function recordAudit(
  context: {
    supabase: SupabaseClient<Database> | null;
    userId: string;
    authMode: "supabase" | "local_dev";
    requestId: string;
  },
  entry: {
    action: string;
    resourceType: string;
    resourceId?: string | null;
    outcome: "ok" | "denied" | "error";
    meta?: Record<string, unknown>;
  },
): Promise<void> {
  logEvent(
    entry.outcome === "ok" ? "info" : "warn",
    "audit",
    entry.action,
    {
      actorRef: safeUserRef(context.userId),
      resourceType: entry.resourceType,
      resourceId: entry.resourceId ?? null,
      outcome: entry.outcome,
      ...(entry.meta ?? {}),
    },
    context.requestId,
  );

  if (context.authMode === "local_dev" || !context.supabase) {
    const { localDb } = await import("./db.server");
    localDb.writeAuditLog({
      actorUserId: context.userId,
      action: entry.action,
      resourceType: entry.resourceType,
      resourceId: entry.resourceId ?? null,
      outcome: entry.outcome,
      requestId: context.requestId,
      ...(entry.meta ? { meta: entry.meta } : {}),
    });
    return;
  }

  try {
    await supaTable(context.supabase, "audit_log").insert({
      actor_user_id: context.userId,
      action: entry.action,
      resource_type: entry.resourceType,
      resource_id: entry.resourceId ?? null,
      outcome: entry.outcome,
      request_id: context.requestId,
      meta_json: entry.meta ?? null,
    });
  } catch {
    /* ignore if audit_log table not yet provisioned in cloud */
  }
}

async function fetchSupabaseCourses(
  client: SupabaseClient<Database>,
  opts: { includeDrafts: boolean; discipline?: Discipline; slug?: string },
): Promise<{ courses: DynamicCourseRecord[]; source: CurriculumDataSource }> {
  try {
    let q = supaTable(client, "courses").select(
      "id, slug, discipline, title, tagline, level, status, about_json, outcomes_json, artifact, sort_order, version, updated_at",
    );
    if (!opts.includeDrafts) q = q.eq("status", "published");
    if (opts.discipline) q = q.eq("discipline", opts.discipline);
    if (opts.slug) q = q.eq("slug", opts.slug);
    const cRes = await q.order("sort_order", { ascending: true });
    if (cRes.error || !Array.isArray(cRes.data)) {
      const fb = seedFallbackCourses(opts.discipline);
      return {
        courses: opts.slug ? fb.filter((c) => c.slug === opts.slug) : fb,
        source: "seed_fallback",
      };
    }

    const [mRes, lRes] = await Promise.all([
      supaTable(client, "course_modules")
        .select("id, course_id, slug, title, summary, sort_order")
        .order("sort_order", { ascending: true }),
      (opts.includeDrafts
        ? supaTable(client, "course_lessons").select(
            "id, module_id, course_id, slug, title, summary, minutes, skill_ids_json, blocks_json, keep_json, status, sort_order",
          )
        : supaTable(client, "course_lessons")
            .select(
              "id, module_id, course_id, slug, title, summary, minutes, skill_ids_json, blocks_json, keep_json, status, sort_order",
            )
            .eq("status", "published")
      ).order("sort_order", { ascending: true }),
    ]);

    const lessonsByMod = new Map<string, Lesson[]>();
    for (const lr of lRes.data ?? []) {
      const modId = String(lr["module_id"]);
      const arr = lessonsByMod.get(modId) ?? [];
      arr.push({
        slug: String(lr["slug"]),
        title: String(lr["title"]),
        summary: String(lr["summary"]),
        minutes: Number(lr["minutes"] ?? 10),
        skillIds: (lr["skill_ids_json"] as string[]) ?? [],
        keep: (lr["keep_json"] as string[]) ?? [],
        blocks: (lr["blocks_json"] as Block[]) ?? [],
      });
      lessonsByMod.set(modId, arr);
    }

    const modsByCourse = new Map<string, DynamicModuleRecord[]>();
    for (const mr of mRes.data ?? []) {
      const cid = String(mr["course_id"]);
      const arr = modsByCourse.get(cid) ?? [];
      arr.push({
        id: String(mr["id"]),
        slug: String(mr["slug"]),
        title: String(mr["title"]),
        summary: String(mr["summary"] ?? ""),
        sortOrder: Number(mr["sort_order"] ?? 0),
        lessons: lessonsByMod.get(String(mr["id"])) ?? [],
      });
      modsByCourse.set(cid, arr);
    }

    const courses: DynamicCourseRecord[] = cRes.data.map((r) => ({
      id: String(r["id"]),
      slug: String(r["slug"]),
      discipline: String(r["discipline"]) as Discipline,
      title: String(r["title"]),
      tagline: String(r["tagline"]),
      level: String(r["level"]) as DynamicCourseRecord["level"],
      status: String(r["status"]) as DynamicCourseRecord["status"],
      sortOrder: Number(r["sort_order"] ?? 100),
      version: Number(r["version"] ?? 1),
      updatedAt: String(r["updated_at"] ?? new Date().toISOString()),
      about: (r["about_json"] as string[]) ?? [],
      outcomes: (r["outcomes_json"] as string[]) ?? [],
      artifact: String(r["artifact"] ?? ""),
      modules: modsByCourse.get(String(r["id"])) ?? [],
    }));
    return { courses, source: "database" };
  } catch {
    const fb = seedFallbackCourses(opts.discipline);
    return {
      courses: opts.slug ? fb.filter((c) => c.slug === opts.slug) : fb,
      source: "seed_fallback",
    };
  }
}

/* ============================================================================
 * 1. PUBLIC READ SERVER FUNCTIONS (DYNAMIC DB-BACKED)
 * ========================================================================== */

export const listCourses = createServerFn({ method: "GET" })
  .validator((input: unknown) =>
    z
      .object({
        discipline: disciplineSchema.optional(),
        includeDrafts: z.boolean().optional(),
      })
      .optional()
      .parse(input),
  )
  .handler(
    async ({ data }): Promise<{ courses: DynamicCourseRecord[]; source: CurriculumDataSource }> =>
      measureOperation("curriculum.listCourses", async () => {
        const allowDrafts = await canReadDrafts(data?.includeDrafts);
        if (!isSupabaseServerConfigured()) {
          const cdb = await import("./curriculum-db.server");
          return {
            courses: cdb.listCoursesDb({
              includeDrafts: allowDrafts,
              ...(data?.discipline ? { discipline: data.discipline } : {}),
            }),
            source: "database",
          };
        }
        const principal = allowDrafts ? await tryVerifyRequestPrincipal(getRequest()) : null;
        const client = principal?.supabase ?? createPublicSupabaseClient();
        return fetchSupabaseCourses(client, {
          includeDrafts: allowDrafts,
          ...(data?.discipline ? { discipline: data.discipline } : {}),
        });
      }),
  );

export const getCourse = createServerFn({ method: "GET" })
  .validator((input: unknown) =>
    z
      .object({
        slug: z.string().trim().min(1).max(120),
        includeDrafts: z.boolean().optional(),
      })
      .parse(input),
  )
  .handler(
    async ({
      data,
    }): Promise<{ course: DynamicCourseRecord | null; source: CurriculumDataSource }> =>
      measureOperation("curriculum.getCourse", async () => {
        const allowDrafts = await canReadDrafts(data.includeDrafts);
        if (!isSupabaseServerConfigured()) {
          const cdb = await import("./curriculum-db.server");
          return {
            course: cdb.getCourseBySlugDb(data.slug, { includeDrafts: allowDrafts }),
            source: "database",
          };
        }
        const principal = allowDrafts ? await tryVerifyRequestPrincipal(getRequest()) : null;
        const client = principal?.supabase ?? createPublicSupabaseClient();
        const res = await fetchSupabaseCourses(client, {
          includeDrafts: allowDrafts,
          slug: data.slug,
        });
        return { course: res.courses[0] ?? null, source: res.source };
      }),
  );

export const getLesson = createServerFn({ method: "GET" })
  .validator((input: unknown) =>
    z
      .object({
        courseSlug: z.string().trim().min(1).max(120),
        lessonSlug: z.string().trim().min(1).max(120),
        includeDrafts: z.boolean().optional(),
      })
      .parse(input),
  )
  .handler(
    async ({
      data,
    }): Promise<{
      data: {
        path: DynamicCourseRecord;
        module: DynamicModuleRecord;
        lesson: Lesson;
        prev: { path: string; lesson: Lesson } | null;
        next: { path: string; lesson: Lesson } | null;
      } | null;
      source: CurriculumDataSource;
    }> =>
      measureOperation("curriculum.getLesson", async () => {
        const allowDrafts = await canReadDrafts(data.includeDrafts);
        if (!isSupabaseServerConfigured()) {
          const cdb = await import("./curriculum-db.server");
          return {
            data: cdb.getLessonBySlugDb(data.courseSlug, data.lessonSlug, {
              includeDrafts: allowDrafts,
            }),
            source: "database",
          };
        }
        const principal = allowDrafts ? await tryVerifyRequestPrincipal(getRequest()) : null;
        const client = principal?.supabase ?? createPublicSupabaseClient();
        const res = await fetchSupabaseCourses(client, {
          includeDrafts: allowDrafts,
          slug: data.courseSlug,
        });
        const course = res.courses[0];
        if (!course) return { data: null, source: res.source };
        const flat: Array<{ module: DynamicModuleRecord; lesson: Lesson }> = [];
        for (const mod of course.modules) {
          for (const les of mod.lessons) flat.push({ module: mod, lesson: les });
        }
        const idx = flat.findIndex((x) => x.lesson.slug === data.lessonSlug);
        if (idx === -1) return { data: null, source: res.source };
        const curr = flat[idx]!;
        return {
          data: {
            path: course,
            module: curr.module,
            lesson: curr.lesson,
            prev: idx > 0 ? { path: course.slug, lesson: flat[idx - 1]!.lesson } : null,
            next:
              idx < flat.length - 1 ? { path: course.slug, lesson: flat[idx + 1]!.lesson } : null,
          },
          source: res.source,
        };
      }),
  );

export const listCompetencies = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ competencies: DynamicCompetencyRecord[]; source: CurriculumDataSource }> =>
    measureOperation("curriculum.listCompetencies", async () => {
      if (!isSupabaseServerConfigured()) {
        const cdb = await import("./curriculum-db.server");
        return { competencies: cdb.listCompetenciesDb(), source: "database" };
      }
      try {
        const res = await supaTable(createPublicSupabaseClient(), "curriculum_competencies")
          .select(
            "id, code, domain, title, blurb, definition, bloom_target, prerequisites_json, relations_json, framework_anchors_json, level_descriptors_json, mapped_volumes_json, role_tags_json, crosswalk_json, version, sort_order",
          )
          .order("sort_order", { ascending: true });
        if (res.error || !Array.isArray(res.data)) {
          return { competencies: seedFallbackCompetencies(), source: "seed_fallback" };
        }
        return {
          source: "database",
          competencies: res.data.map((r) => ({
            id: String(r["id"]),
            code: String(r["code"]),
            domain: String(r["domain"]) as Discipline,
            title: String(r["title"]),
            blurb: String(r["blurb"]),
            definition: String(r["definition"]),
            bloomTarget: String(r["bloom_target"]) as DynamicCompetencyRecord["bloomTarget"],
            prerequisites: (r["prerequisites_json"] as string[]) ?? [],
            relations: (r["relations_json"] as DynamicCompetencyRecord["relations"]) ?? [],
            frameworkAnchors:
              (r["framework_anchors_json"] as DynamicCompetencyRecord["frameworkAnchors"]) ?? [],
            levelDescriptors: r[
              "level_descriptors_json"
            ] as DynamicCompetencyRecord["levelDescriptors"],
            mappedVolumes: (r["mapped_volumes_json"] as string[]) ?? [],
            roleTags: (r["role_tags_json"] as string[]) ?? [],
            version: String(r["version"] ?? "2.0.0"),
            sortOrder: Number(r["sort_order"] ?? 100),
            ...(r["crosswalk_json"]
              ? { crosswalk: r["crosswalk_json"] as DynamicCompetencyRecord["crosswalk"] }
              : {}),
          })),
        };
      } catch {
        return { competencies: seedFallbackCompetencies(), source: "seed_fallback" };
      }
    }),
);

export const listLabs = createServerFn({ method: "GET" })
  .validator((input: unknown) =>
    z.object({ includeDrafts: z.boolean().optional() }).optional().parse(input),
  )
  .handler(async ({ data }): Promise<{ labs: DynamicLabRecord[]; source: CurriculumDataSource }> =>
    measureOperation("curriculum.listLabs", async () => {
      const allowDrafts = await canReadDrafts(data?.includeDrafts);
      if (!isSupabaseServerConfigured()) {
        const cdb = await import("./curriculum-db.server");
        return { labs: cdb.listLabsDb({ includeDrafts: allowDrafts }), source: "database" };
      }
      try {
        let q = supaTable(createPublicSupabaseClient(), "curriculum_labs").select(
          "id, discipline, skill_id, title, brief, minutes, steps_json, twist, artifact, evidence_type, rubric_json, status, sort_order, version",
        );
        if (!allowDrafts) q = q.eq("status", "published");
        const res = await q.order("sort_order", { ascending: true });
        if (res.error || !Array.isArray(res.data)) {
          return { labs: seedFallbackLabs(), source: "seed_fallback" };
        }
        return {
          source: "database",
          labs: res.data.map((r) => ({
            id: String(r["id"]),
            discipline: String(r["discipline"]) as Discipline,
            skillId: String(r["skill_id"]),
            title: String(r["title"]),
            brief: String(r["brief"]),
            minutes: Number(r["minutes"] ?? 30),
            steps: (r["steps_json"] as string[]) ?? [],
            twist: String(r["twist"]),
            artifact: String(r["artifact"]),
            evidenceType: String(r["evidence_type"]) as DynamicLabRecord["evidenceType"],
            rubric: (r["rubric_json"] as DynamicLabRecord["rubric"]) ?? LAB_RUBRICS["default"]!,
            status: String(r["status"]) as DynamicLabRecord["status"],
            sortOrder: Number(r["sort_order"] ?? 100),
            version: Number(r["version"] ?? 1),
          })),
        };
      } catch {
        return { labs: seedFallbackLabs(), source: "seed_fallback" };
      }
    }),
  );

export const listScenarios = createServerFn({ method: "GET" })
  .validator((input: unknown) =>
    z.object({ includeDrafts: z.boolean().optional() }).optional().parse(input),
  )
  .handler(
    async ({ data }): Promise<{ scenarios: ScenarioChallenge[]; source: CurriculumDataSource }> =>
      measureOperation("curriculum.listScenarios", async () => {
        const allowDrafts = await canReadDrafts(data?.includeDrafts);
        if (!isSupabaseServerConfigured()) {
          const cdb = await import("./curriculum-db.server");
          return {
            scenarios: cdb.listScenariosDb({ includeDrafts: allowDrafts }),
            source: "database",
          };
        }
        try {
          let q = supaTable(createPublicSupabaseClient(), "curriculum_scenarios").select(
            "id, skill_id, title, domain_context, situation, constraints_json, question, options_json, invalidation_prompt",
          );
          if (!allowDrafts) q = q.eq("status", "published");
          const res = await q.order("sort_order", { ascending: true });
          if (res.error || !Array.isArray(res.data)) {
            return {
              scenarios: process.env["NEET_SKIP_DEFAULT_CURRICULUM_SEED"] === "1" ? [] : SCENARIOS,
              source: "seed_fallback",
            };
          }
          return {
            source: "database",
            scenarios: res.data.map((r) => ({
              id: String(r["id"]),
              skillId: String(r["skill_id"]),
              title: String(r["title"]),
              domainContext: String(r["domain_context"]),
              situation: String(r["situation"]),
              constraints: (r["constraints_json"] as string[]) ?? [],
              question: String(r["question"]),
              options: (r["options_json"] as ScenarioChallenge["options"]) ?? [],
              invalidationPrompt: String(r["invalidation_prompt"]),
            })),
          };
        } catch {
          return {
            scenarios: process.env["NEET_SKIP_DEFAULT_CURRICULUM_SEED"] === "1" ? [] : SCENARIOS,
            source: "seed_fallback",
          };
        }
      }),
  );

export const getActiveCapstone = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ capstone: DynamicCapstoneRecord | null; source: CurriculumDataSource }> =>
    measureOperation("curriculum.getActiveCapstone", async () => {
      if (!isSupabaseServerConfigured()) {
        const cdb = await import("./curriculum-db.server");
        return { capstone: cdb.getActiveCapstoneDb(), source: "database" };
      }
      try {
        const res = await supaTable(createPublicSupabaseClient(), "curriculum_capstones")
          .select(
            "id, version, title, summary, disclaimer, change_impact_json, milestones_json, status",
          )
          .eq("status", "published")
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (res.error || !res.data) {
          return {
            capstone:
              process.env["NEET_SKIP_DEFAULT_CURRICULUM_SEED"] === "1"
                ? null
                : { ...CAPSTONE_PROJECT, status: "published" },
            source: "seed_fallback",
          };
        }
        return {
          source: "database",
          capstone: {
            id: String(res.data["id"]),
            version: String(res.data["version"]),
            title: String(res.data["title"]),
            summary: String(res.data["summary"]),
            disclaimer: String(res.data["disclaimer"]),
            status: String(res.data["status"]) as DynamicCapstoneRecord["status"],
            changeImpactChallenge: res.data[
              "change_impact_json"
            ] as DynamicCapstoneRecord["changeImpactChallenge"],
            milestones: res.data["milestones_json"] as DynamicCapstoneRecord["milestones"],
          },
        };
      } catch {
        return {
          capstone:
            process.env["NEET_SKIP_DEFAULT_CURRICULUM_SEED"] === "1"
              ? null
              : { ...CAPSTONE_PROJECT, status: "published" },
          source: "seed_fallback",
        };
      }
    }),
);

export const listRoleProfiles = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ roleProfiles: RoleProfile[]; source: CurriculumDataSource }> =>
    measureOperation("curriculum.listRoleProfiles", async () => {
      if (!isSupabaseServerConfigured()) {
        const cdb = await import("./curriculum-db.server");
        return { roleProfiles: cdb.listRoleProfilesDb(), source: "database" };
      }
      try {
        const res = await supaTable(createPublicSupabaseClient(), "curriculum_role_profiles")
          .select("id, title, status, disclaimer, summary, required_levels_json")
          .order("sort_order", { ascending: true });
        if (res.error || !Array.isArray(res.data)) {
          return {
            roleProfiles:
              process.env["NEET_SKIP_DEFAULT_CURRICULUM_SEED"] === "1" ? [] : ROLE_PROFILES,
            source: "seed_fallback",
          };
        }
        return {
          source: "database",
          roleProfiles: res.data.map((r) => ({
            id: String(r["id"]),
            title: String(r["title"]),
            status: "provisional",
            disclaimer: String(r["disclaimer"]),
            summary: String(r["summary"]),
            requiredLevels: (r["required_levels_json"] as RoleProfile["requiredLevels"]) ?? {},
          })),
        };
      } catch {
        return {
          roleProfiles:
            process.env["NEET_SKIP_DEFAULT_CURRICULUM_SEED"] === "1" ? [] : ROLE_PROFILES,
          source: "seed_fallback",
        };
      }
    }),
);

export const getCurriculumOverview = createServerFn({ method: "GET" }).handler(
  async (): Promise<DynamicCurriculumOverview> => {
    const [coursesRes, compsRes, labsRes, scenRes, capRes, rolesRes] = await Promise.all([
      listCourses({ data: {} }),
      listCompetencies(),
      listLabs({ data: {} }),
      listScenarios({ data: {} }),
      getActiveCapstone(),
      listRoleProfiles(),
    ]);
    return {
      source: coursesRes.source,
      courses: coursesRes.courses,
      competencies: compsRes.competencies,
      labs: labsRes.labs,
      scenarios: scenRes.scenarios,
      capstone: capRes.capstone,
      roleProfiles: rolesRes.roleProfiles,
    };
  },
);

/* ============================================================================
 * 2. AUTHOR / ADMIN CMS MUTATION SERVER FUNCTIONS (RBAC + ZOD + AUDIT + RATE LIMIT)
 * ========================================================================== */

function guardAdminRateLimit(userId: string): ApiResult<never> | null {
  try {
    enforceRateLimit("admin", userId);
    return null;
  } catch (err) {
    if (err instanceof RateLimitError) {
      return fail(err.message, "rate_limited");
    }
    throw err;
  }
}

export const upsertCourse = createServerFn({ method: "POST" })
  .middleware([requireAuthorOrAdmin])
  .validator((input: unknown) => courseUpsertSchema.parse(input))
  .handler(async ({ data, context }): Promise<ApiResult<DynamicCourseRecord>> =>
    measureOperation("cms.upsertCourse", async () => {
      const rl = guardAdminRateLimit(context.userId);
      if (rl) return rl;

      if (context.authMode === "local_dev" || !context.supabase) {
        const cdb = await import("./curriculum-db.server");
        const res = cdb.upsertCourseDb(data, context.userId);
        await recordAudit(context, {
          action: "course.upsert",
          resourceType: "course",
          resourceId: res.data?.id ?? data.slug,
          outcome: res.error ? "error" : "ok",
          meta: { slug: data.slug, status: data.status },
        });
        return res;
      }

      const id = data.id ?? `course-${data.slug}`;
      const up = await supaTable(context.supabase, "courses").upsert(
        {
          id,
          slug: data.slug,
          discipline: data.discipline,
          title: data.title,
          tagline: data.tagline,
          level: data.level,
          status: data.status,
          about_json: data.about,
          outcomes_json: data.outcomes,
          artifact: data.artifact,
          sort_order: data.sortOrder,
          updated_by: context.userId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "slug" },
      );
      if (up.error) {
        await recordAudit(context, {
          action: "course.upsert",
          resourceType: "course",
          resourceId: data.slug,
          outcome: "error",
        });
        return fail(
          "Could not save course to Supabase. Ensure docs/database/SUPABASE_SCHEMA_BLUEPRINT.sql is applied.",
          "internal_error",
        );
      }
      const fetched = await fetchSupabaseCourses(context.supabase, {
        includeDrafts: true,
        slug: data.slug,
      });
      const course = fetched.courses[0];
      await recordAudit(context, {
        action: "course.upsert",
        resourceType: "course",
        resourceId: course?.id ?? id,
        outcome: "ok",
        meta: { slug: data.slug, status: data.status },
      });
      return course ? ok(course) : fail("Saved course could not be reloaded.");
    }),
  );

export const setCourseStatus = createServerFn({ method: "POST" })
  .middleware([requireAuthorOrAdmin])
  .validator((input: unknown) =>
    z
      .object({ courseId: z.string().trim().min(1).max(120), status: publishStatusSchema })
      .parse(input),
  )
  .handler(
    async ({
      data,
      context,
    }): Promise<ApiResult<{ id: string; status: string; version: number }>> =>
      measureOperation("cms.setCourseStatus", async () => {
        const rl = guardAdminRateLimit(context.userId);
        if (rl) return rl;
        if (context.authMode === "local_dev" || !context.supabase) {
          const cdb = await import("./curriculum-db.server");
          const res = cdb.setCourseStatusDb(data.courseId, data.status, context.userId);
          await recordAudit(context, {
            action: "course.status",
            resourceType: "course",
            resourceId: data.courseId,
            outcome: res.error ? "error" : "ok",
            meta: { status: data.status },
          });
          return res;
        }
        const res = await supaTable(context.supabase, "courses")
          .update({
            status: data.status,
            updated_by: context.userId,
            updated_at: new Date().toISOString(),
          })
          .eq("id", data.courseId);
        if (res.error) return fail("Failed to update course status.", "internal_error");
        await recordAudit(context, {
          action: "course.status",
          resourceType: "course",
          resourceId: data.courseId,
          outcome: "ok",
          meta: { status: data.status },
        });
        return ok({ id: data.courseId, status: data.status, version: 1 });
      }),
  );

export const deleteCourse = createServerFn({ method: "POST" })
  .middleware([requireAuthorOrAdmin])
  .validator((input: unknown) =>
    z.object({ courseId: z.string().trim().min(1).max(120) }).parse(input),
  )
  .handler(async ({ data, context }): Promise<ApiResult<{ deleted: boolean }>> =>
    measureOperation("cms.deleteCourse", async () => {
      const rl = guardAdminRateLimit(context.userId);
      if (rl) return rl;
      if (context.authMode === "local_dev" || !context.supabase) {
        const cdb = await import("./curriculum-db.server");
        const res = cdb.deleteCourseDb(data.courseId);
        await recordAudit(context, {
          action: "course.delete",
          resourceType: "course",
          resourceId: data.courseId,
          outcome: res.error ? "error" : "ok",
        });
        return res;
      }
      const res = await supaTable(context.supabase, "courses").delete().eq("id", data.courseId);
      if (res.error) return fail("Failed to delete course.", "internal_error");
      await recordAudit(context, {
        action: "course.delete",
        resourceType: "course",
        resourceId: data.courseId,
        outcome: "ok",
      });
      return ok({ deleted: true });
    }),
  );

export const upsertModule = createServerFn({ method: "POST" })
  .middleware([requireAuthorOrAdmin])
  .validator((input: unknown) => moduleUpsertSchema.parse(input))
  .handler(async ({ data, context }) =>
    measureOperation("cms.upsertModule", async () => {
      const rl = guardAdminRateLimit(context.userId);
      if (rl) return rl;
      if (context.authMode === "local_dev" || !context.supabase) {
        const cdb = await import("./curriculum-db.server");
        const res = cdb.upsertModuleDb(data);
        await recordAudit(context, {
          action: "module.upsert",
          resourceType: "course_module",
          resourceId: res.data?.id ?? data.slug,
          outcome: res.error ? "error" : "ok",
          meta: { courseId: data.courseId },
        });
        return res;
      }
      const id = data.id ?? `mod-${data.courseId}-${data.slug}`;
      const res = await supaTable(context.supabase, "course_modules").upsert(
        {
          id,
          course_id: data.courseId,
          slug: data.slug,
          title: data.title,
          summary: data.summary,
          sort_order: data.sortOrder,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "course_id,slug" },
      );
      if (res.error) return fail("Failed to save module.", "internal_error");
      await recordAudit(context, {
        action: "module.upsert",
        resourceType: "course_module",
        resourceId: id,
        outcome: "ok",
      });
      return ok({
        id,
        courseId: data.courseId,
        slug: data.slug,
        title: data.title,
        summary: data.summary,
        sortOrder: data.sortOrder,
      });
    }),
  );

export const deleteModule = createServerFn({ method: "POST" })
  .middleware([requireAuthorOrAdmin])
  .validator((input: unknown) =>
    z.object({ moduleId: z.string().trim().min(1).max(120) }).parse(input),
  )
  .handler(async ({ data, context }): Promise<ApiResult<{ deleted: boolean }>> =>
    measureOperation("cms.deleteModule", async () => {
      const rl = guardAdminRateLimit(context.userId);
      if (rl) return rl;
      if (context.authMode === "local_dev" || !context.supabase) {
        const cdb = await import("./curriculum-db.server");
        const res = cdb.deleteModuleDb(data.moduleId);
        await recordAudit(context, {
          action: "module.delete",
          resourceType: "course_module",
          resourceId: data.moduleId,
          outcome: res.error ? "error" : "ok",
        });
        return res;
      }
      const res = await supaTable(context.supabase, "course_modules")
        .delete()
        .eq("id", data.moduleId);
      if (res.error) return fail("Failed to delete module.", "internal_error");
      await recordAudit(context, {
        action: "module.delete",
        resourceType: "course_module",
        resourceId: data.moduleId,
        outcome: "ok",
      });
      return ok({ deleted: true });
    }),
  );

export const reorderModules = createServerFn({ method: "POST" })
  .middleware([requireAuthorOrAdmin])
  .validator((input: unknown) =>
    z
      .object({
        courseId: z.string().trim().min(1).max(120),
        orderedModuleIds: z.array(z.string().trim().min(1).max(120)).min(1).max(50),
      })
      .parse(input),
  )
  .handler(async ({ data, context }): Promise<ApiResult<{ updated: number }>> =>
    measureOperation("cms.reorderModules", async () => {
      const rl = guardAdminRateLimit(context.userId);
      if (rl) return rl;
      if (context.authMode === "local_dev" || !context.supabase) {
        const cdb = await import("./curriculum-db.server");
        const res = cdb.reorderModulesDb(data.courseId, data.orderedModuleIds);
        await recordAudit(context, {
          action: "module.reorder",
          resourceType: "course",
          resourceId: data.courseId,
          outcome: res.error ? "error" : "ok",
        });
        return res;
      }
      for (let i = 0; i < data.orderedModuleIds.length; i++) {
        await supaTable(context.supabase, "course_modules")
          .update({ sort_order: (i + 1) * 10, updated_at: new Date().toISOString() })
          .eq("id", data.orderedModuleIds[i]!)
          .eq("course_id", data.courseId);
      }
      await recordAudit(context, {
        action: "module.reorder",
        resourceType: "course",
        resourceId: data.courseId,
        outcome: "ok",
      });
      return ok({ updated: data.orderedModuleIds.length });
    }),
  );

export const upsertLesson = createServerFn({ method: "POST" })
  .middleware([requireAuthorOrAdmin])
  .validator((input: unknown) => lessonUpsertSchema.parse(input))
  .handler(async ({ data, context }) =>
    measureOperation("cms.upsertLesson", async () => {
      const rl = guardAdminRateLimit(context.userId);
      if (rl) return rl;
      if (context.authMode === "local_dev" || !context.supabase) {
        const cdb = await import("./curriculum-db.server");
        const res = cdb.upsertLessonDb(data, context.userId);
        await recordAudit(context, {
          action: "lesson.upsert",
          resourceType: "course_lesson",
          resourceId: res.data?.id ?? data.slug,
          outcome: res.error ? "error" : "ok",
          meta: { courseId: data.courseId, moduleId: data.moduleId },
        });
        return res;
      }
      const seedError = await ensureCanonicalCompetencyRows(context.supabase);
      if (seedError) return fail(seedError, "internal_error");
      const referenceErrors = validateSkillReferences(
        CANONICAL_COMPETENCY_IDS,
        [{ source: "Lesson " + data.courseId + "/" + data.slug, skillIds: data.skillIds }],
      );
      if (referenceErrors.length > 0) return fail(referenceErrors.join(" "), "validation_error");
      const id = data.id ?? `les-${data.courseId}-${data.slug}`;
      const res = await supaTable(context.supabase, "course_lessons").upsert(
        {
          id,
          course_id: data.courseId,
          module_id: data.moduleId,
          slug: data.slug,
          title: data.title,
          summary: data.summary,
          minutes: data.minutes,
          skill_ids_json: data.skillIds,
          blocks_json: data.blocks,
          keep_json: data.keep,
          status: data.status,
          sort_order: data.sortOrder,
          updated_by: context.userId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "course_id,slug" },
      );
      if (res.error) return fail("Failed to save lesson.", "internal_error");
      await recordAudit(context, {
        action: "lesson.upsert",
        resourceType: "course_lesson",
        resourceId: id,
        outcome: "ok",
      });
      return ok({ id, courseId: data.courseId, moduleId: data.moduleId, slug: data.slug });
    }),
  );

export const deleteLesson = createServerFn({ method: "POST" })
  .middleware([requireAuthorOrAdmin])
  .validator((input: unknown) =>
    z.object({ lessonId: z.string().trim().min(1).max(120) }).parse(input),
  )
  .handler(async ({ data, context }): Promise<ApiResult<{ deleted: boolean }>> =>
    measureOperation("cms.deleteLesson", async () => {
      const rl = guardAdminRateLimit(context.userId);
      if (rl) return rl;
      if (context.authMode === "local_dev" || !context.supabase) {
        const cdb = await import("./curriculum-db.server");
        const res = cdb.deleteLessonDb(data.lessonId);
        await recordAudit(context, {
          action: "lesson.delete",
          resourceType: "course_lesson",
          resourceId: data.lessonId,
          outcome: res.error ? "error" : "ok",
        });
        return res;
      }
      const res = await supaTable(context.supabase, "course_lessons")
        .delete()
        .eq("id", data.lessonId);
      if (res.error) return fail("Failed to delete lesson.", "internal_error");
      await recordAudit(context, {
        action: "lesson.delete",
        resourceType: "course_lesson",
        resourceId: data.lessonId,
        outcome: "ok",
      });
      return ok({ deleted: true });
    }),
  );

export const upsertCompetency = createServerFn({ method: "POST" })
  .middleware([requireAuthorOrAdmin])
  .validator((input: unknown) => competencyUpsertSchema.parse(input))
  .handler(async ({ data, context }): Promise<ApiResult<DynamicCompetencyRecord>> =>
    measureOperation("cms.upsertCompetency", async () => {
      const rl = guardAdminRateLimit(context.userId);
      if (rl) return rl;
      if (context.authMode === "local_dev" || !context.supabase) {
        const cdb = await import("./curriculum-db.server");
        const res = cdb.upsertCompetencyDb(data);
        await recordAudit(context, {
          action: "competency.upsert",
          resourceType: "competency",
          resourceId: data.id,
          outcome: res.error ? "error" : "ok",
        });
        return res;
      }

      const supportedErrors = validateSupportedCompetencyIds([data.id]);
      if (supportedErrors.length > 0) {
        return fail(supportedErrors.join(" "), "validation_error");
      }
      const seedError = await ensureCanonicalCompetencyRows(context.supabase);
      if (seedError) return fail(seedError, "internal_error");
      const current = await listCompetencies();
      const referenceErrors = validateCompetencyGraphReferences(current.competencies, [data]);
      if (referenceErrors.length > 0) {
        return fail(referenceErrors.join(" "), "validation_error");
      }
      const cycles = detectCompetencyCycles([
        ...current.competencies
          .filter((c) => c.id !== data.id)
          .map((c) => ({ id: c.id, prerequisites: c.prerequisites })),
        { id: data.id, prerequisites: data.prerequisites },
      ]);
      if (cycles.length > 0) {
        return fail(`Circular prerequisite graph rejected: ${cycles[0]}`, "cycle_detected");
      }

      const res = await supaTable(context.supabase, "curriculum_competencies").upsert(
        {
          id: data.id,
          code: data.code,
          domain: data.domain,
          title: data.title,
          blurb: data.blurb,
          definition: data.definition,
          bloom_target: data.bloomTarget,
          prerequisites_json: data.prerequisites,
          relations_json: data.relations,
          framework_anchors_json: data.frameworkAnchors,
          level_descriptors_json: data.levelDescriptors,
          mapped_volumes_json: data.mappedVolumes,
          role_tags_json: data.roleTags,
          crosswalk_json: data.crosswalk ? { neetCompetencyId: data.id, ...data.crosswalk } : null,
          version: data.version,
          sort_order: data.sortOrder,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );
      if (res.error) return fail("Failed to save competency.", "internal_error");
      await recordAudit(context, {
        action: "competency.upsert",
        resourceType: "competency",
        resourceId: data.id,
        outcome: "ok",
      });
      return ok({
        id: data.id,
        code: data.code,
        domain: data.domain,
        title: data.title,
        blurb: data.blurb,
        definition: data.definition,
        bloomTarget: data.bloomTarget,
        prerequisites: data.prerequisites,
        relations: data.relations,
        frameworkAnchors: data.frameworkAnchors,
        levelDescriptors: data.levelDescriptors,
        mappedVolumes: data.mappedVolumes,
        roleTags: data.roleTags,
        version: data.version,
        sortOrder: data.sortOrder,
        ...(data.crosswalk ? { crosswalk: { neetCompetencyId: data.id, ...data.crosswalk } } : {}),
      });
    }),
  );

export const deleteCompetency = createServerFn({ method: "POST" })
  .middleware([requireAuthorOrAdmin])
  .validator((input: unknown) => z.object({ id: z.string().trim().min(1).max(100) }).parse(input))
  .handler(async ({ data, context }): Promise<ApiResult<{ deleted: boolean }>> =>
    measureOperation("cms.deleteCompetency", async () => {
      const rl = guardAdminRateLimit(context.userId);
      if (rl) return rl;
      if (context.authMode === "local_dev" || !context.supabase) {
        const cdb = await import("./curriculum-db.server");
        const res = cdb.deleteCompetencyDb(data.id);
        await recordAudit(context, {
          action: "competency.delete",
          resourceType: "competency",
          resourceId: data.id,
          outcome: res.error ? "error" : "ok",
        });
        return res;
      }
      if (CANONICAL_COMPETENCY_IDS.has(data.id)) {
        return fail(
          "Core competency " + data.id + " cannot be deleted; the learner model and scoring UI depend on the canonical 16-skill catalogue.",
          "conflict",
        );
      }
      const [current, courses, labs, scenarios, capstone, roleProfiles] = await Promise.all([
        listCompetencies(),
        listCourses({ data: { includeDrafts: true } }),
        listLabs({ data: { includeDrafts: true } }),
        listScenarios({ data: { includeDrafts: true } }),
        getActiveCapstone(),
        listRoleProfiles(),
      ]);
      const references = findCompetencyReferences(data.id, {
        competencies: current.competencies,
        courses: courses.courses,
        labs: labs.labs,
        scenarios: scenarios.scenarios,
        capstone: capstone.capstone,
        roleProfiles: roleProfiles.roleProfiles,
      });
      if (references.length > 0) {
        return fail(
          "Cannot delete competency " + data.id + "; it is still referenced by: " + references.join(", ") + ".",
          "conflict",
        );
      }
      const res = await supaTable(context.supabase, "curriculum_competencies")
        .delete()
        .eq("id", data.id);
      if (res.error) return fail("Failed to delete competency.", "internal_error");
      return ok({ deleted: true });
    }),
  );

export const upsertLab = createServerFn({ method: "POST" })
  .middleware([requireAuthorOrAdmin])
  .validator((input: unknown) => labUpsertSchema.parse(input))
  .handler(async ({ data, context }): Promise<ApiResult<DynamicLabRecord>> =>
    measureOperation("cms.upsertLab", async () => {
      const rl = guardAdminRateLimit(context.userId);
      if (rl) return rl;
      if (context.authMode === "local_dev" || !context.supabase) {
        const cdb = await import("./curriculum-db.server");
        const res = cdb.upsertLabDb(data);
        await recordAudit(context, {
          action: "lab.upsert",
          resourceType: "lab",
          resourceId: data.id,
          outcome: res.error ? "error" : "ok",
        });
        return res;
      }
      const seedError = await ensureCanonicalCompetencyRows(context.supabase);
      if (seedError) return fail(seedError, "internal_error");
      const referenceErrors = validateSkillReferences(
        CANONICAL_COMPETENCY_IDS,
        [{ source: "Lab " + data.id, skillIds: [data.skillId] }],
      );
      if (referenceErrors.length > 0) return fail(referenceErrors.join(" "), "validation_error");
      const res = await supaTable(context.supabase, "curriculum_labs").upsert(
        {
          id: data.id,
          discipline: data.discipline,
          skill_id: data.skillId,
          title: data.title,
          brief: data.brief,
          minutes: data.minutes,
          steps_json: data.steps,
          twist: data.twist,
          artifact: data.artifact,
          evidence_type: data.evidenceType,
          rubric_json: data.rubric,
          status: data.status,
          sort_order: data.sortOrder,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );
      if (res.error) return fail("Failed to save lab.", "internal_error");
      await recordAudit(context, {
        action: "lab.upsert",
        resourceType: "lab",
        resourceId: data.id,
        outcome: "ok",
      });
      return ok({ ...data, version: 1 });
    }),
  );

export const deleteLab = createServerFn({ method: "POST" })
  .middleware([requireAuthorOrAdmin])
  .validator((input: unknown) => z.object({ id: z.string().trim().min(1).max(120) }).parse(input))
  .handler(async ({ data, context }): Promise<ApiResult<{ deleted: boolean }>> =>
    measureOperation("cms.deleteLab", async () => {
      const rl = guardAdminRateLimit(context.userId);
      if (rl) return rl;
      if (context.authMode === "local_dev" || !context.supabase) {
        const cdb = await import("./curriculum-db.server");
        const res = cdb.deleteLabDb(data.id);
        await recordAudit(context, {
          action: "lab.delete",
          resourceType: "lab",
          resourceId: data.id,
          outcome: res.error ? "error" : "ok",
        });
        return res;
      }
      const res = await supaTable(context.supabase, "curriculum_labs").delete().eq("id", data.id);
      if (res.error) return fail("Failed to delete lab.", "internal_error");
      return ok({ deleted: true });
    }),
  );

export const upsertScenario = createServerFn({ method: "POST" })
  .middleware([requireAuthorOrAdmin])
  .validator((input: unknown) => scenarioUpsertSchema.parse(input))
  .handler(async ({ data, context }): Promise<ApiResult<ScenarioChallenge>> =>
    measureOperation("cms.upsertScenario", async () => {
      const rl = guardAdminRateLimit(context.userId);
      if (rl) return rl;
      if (context.authMode === "local_dev" || !context.supabase) {
        const cdb = await import("./curriculum-db.server");
        const res = cdb.upsertScenarioDb(data);
        await recordAudit(context, {
          action: "scenario.upsert",
          resourceType: "scenario",
          resourceId: data.id,
          outcome: res.error ? "error" : "ok",
        });
        return res;
      }
      const seedError = await ensureCanonicalCompetencyRows(context.supabase);
      if (seedError) return fail(seedError, "internal_error");
      const referenceErrors = validateSkillReferences(
        CANONICAL_COMPETENCY_IDS,
        [{ source: "Scenario " + data.id, skillIds: [data.skillId] }],
      );
      if (referenceErrors.length > 0) return fail(referenceErrors.join(" "), "validation_error");
      const res = await supaTable(context.supabase, "curriculum_scenarios").upsert(
        {
          id: data.id,
          skill_id: data.skillId,
          title: data.title,
          domain_context: data.domainContext,
          situation: data.situation,
          constraints_json: data.constraints,
          question: data.question,
          options_json: data.options,
          invalidation_prompt: data.invalidationPrompt,
          status: data.status,
          sort_order: data.sortOrder,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );
      if (res.error) return fail("Failed to save scenario.", "internal_error");
      await recordAudit(context, {
        action: "scenario.upsert",
        resourceType: "scenario",
        resourceId: data.id,
        outcome: "ok",
      });
      return ok({
        id: data.id,
        skillId: data.skillId,
        title: data.title,
        domainContext: data.domainContext,
        situation: data.situation,
        constraints: data.constraints,
        question: data.question,
        options: data.options,
        invalidationPrompt: data.invalidationPrompt,
      });
    }),
  );

export const deleteScenario = createServerFn({ method: "POST" })
  .middleware([requireAuthorOrAdmin])
  .validator((input: unknown) => z.object({ id: z.string().trim().min(1).max(120) }).parse(input))
  .handler(async ({ data, context }): Promise<ApiResult<{ deleted: boolean }>> =>
    measureOperation("cms.deleteScenario", async () => {
      const rl = guardAdminRateLimit(context.userId);
      if (rl) return rl;
      if (context.authMode === "local_dev" || !context.supabase) {
        const cdb = await import("./curriculum-db.server");
        return cdb.deleteScenarioDb(data.id);
      }
      const res = await supaTable(context.supabase, "curriculum_scenarios")
        .delete()
        .eq("id", data.id);
      if (res.error) return fail("Failed to delete scenario.", "internal_error");
      return ok({ deleted: true });
    }),
  );

export const upsertCapstone = createServerFn({ method: "POST" })
  .middleware([requireAuthorOrAdmin])
  .validator((input: unknown) => capstoneUpsertSchema.parse(input))
  .handler(async ({ data, context }): Promise<ApiResult<DynamicCapstoneRecord>> =>
    measureOperation("cms.upsertCapstone", async () => {
      const rl = guardAdminRateLimit(context.userId);
      if (rl) return rl;
      if (context.authMode === "local_dev" || !context.supabase) {
        const cdb = await import("./curriculum-db.server");
        const res = cdb.upsertCapstoneDb(data);
        await recordAudit(context, {
          action: "capstone.upsert",
          resourceType: "capstone",
          resourceId: data.id,
          outcome: res.error ? "error" : "ok",
        });
        return res;
      }
      const seedError = await ensureCanonicalCompetencyRows(context.supabase);
      if (seedError) return fail(seedError, "internal_error");
      const referenceErrors = validateSkillReferences(
        CANONICAL_COMPETENCY_IDS,
        data.milestones.map((milestone) => ({
          source: "Capstone milestone " + milestone.id,
          skillIds: milestone.skillIds,
        })),
      );
      if (referenceErrors.length > 0) return fail(referenceErrors.join(" "), "validation_error");
      const res = await supaTable(context.supabase, "curriculum_capstones").upsert(
        {
          id: data.id,
          version: data.version,
          title: data.title,
          summary: data.summary,
          disclaimer: data.disclaimer,
          change_impact_json: data.changeImpactChallenge,
          milestones_json: data.milestones,
          status: data.status,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );
      if (res.error) return fail("Failed to save capstone.", "internal_error");
      await recordAudit(context, {
        action: "capstone.upsert",
        resourceType: "capstone",
        resourceId: data.id,
        outcome: "ok",
      });
      return ok(data);
    }),
  );

export const upsertRoleProfile = createServerFn({ method: "POST" })
  .middleware([requireAuthorOrAdmin])
  .validator((input: unknown) => roleProfileUpsertSchema.parse(input))
  .handler(async ({ data, context }): Promise<ApiResult<RoleProfile>> =>
    measureOperation("cms.upsertRoleProfile", async () => {
      const rl = guardAdminRateLimit(context.userId);
      if (rl) return rl;
      if (context.authMode === "local_dev" || !context.supabase) {
        const cdb = await import("./curriculum-db.server");
        return cdb.upsertRoleProfileDb(data);
      }
      const seedError = await ensureCanonicalCompetencyRows(context.supabase);
      if (seedError) return fail(seedError, "internal_error");
      const referenceErrors = validateRoleProfileReferences(
        CANONICAL_COMPETENCY_IDS,
        data.requiredLevels,
        "Role profile " + data.id,
      );
      if (referenceErrors.length > 0) return fail(referenceErrors.join(" "), "validation_error");
      const res = await supaTable(context.supabase, "curriculum_role_profiles").upsert(
        {
          id: data.id,
          title: data.title,
          status: data.status,
          disclaimer: data.disclaimer,
          summary: data.summary,
          required_levels_json: data.requiredLevels,
          sort_order: data.sortOrder,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );
      if (res.error) return fail("Failed to save role profile.", "internal_error");
      return ok({
        id: data.id,
        title: data.title,
        status: "provisional",
        disclaimer: data.disclaimer,
        summary: data.summary,
        requiredLevels: data.requiredLevels,
      });
    }),
  );

export const deleteRoleProfile = createServerFn({ method: "POST" })
  .middleware([requireAuthorOrAdmin])
  .validator((input: unknown) => z.object({ id: z.string().trim().min(1).max(100) }).parse(input))
  .handler(async ({ data, context }): Promise<ApiResult<{ deleted: boolean }>> =>
    measureOperation("cms.deleteRoleProfile", async () => {
      const rl = guardAdminRateLimit(context.userId);
      if (rl) return rl;
      if (context.authMode === "local_dev" || !context.supabase) {
        const cdb = await import("./curriculum-db.server");
        return cdb.deleteRoleProfileDb(data.id);
      }
      const res = await supaTable(context.supabase, "curriculum_role_profiles")
        .delete()
        .eq("id", data.id);
      if (res.error) return fail("Failed to delete role profile.", "internal_error");
      return ok({ deleted: true });
    }),
  );

export const importCourseBundle = createServerFn({ method: "POST" })
  .middleware([requireAuthorOrAdmin])
  .validator((input: unknown) => courseBundleSchema.parse(input))
  .handler(async ({ data, context }) =>
    measureOperation("cms.importCourseBundle", async () => {
      const rl = guardAdminRateLimit(context.userId);
      if (rl) return rl;
      if (context.authMode === "local_dev" || !context.supabase) {
        const cdb = await import("./curriculum-db.server");
        const res = cdb.importCourseBundleDb(data, context.userId);
        await recordAudit(context, {
          action: "course.bundle.import",
          resourceType: "course",
          resourceId: data.course.slug,
          outcome: res.error ? "error" : "ok",
          ...(res.data ? { meta: res.data } : {}),
        });
        return res;
      }

      // Validate the complete bundle before the first cloud write.
      const seedError = await ensureCanonicalCompetencyRows(context.supabase);
      if (seedError) return fail(seedError, "internal_error");
      const current = await listCompetencies();
      const integrityErrors = validateCourseBundleReferences(data, current.competencies, CANONICAL_COMPETENCY_IDS);
      if (integrityErrors.length > 0) {
        return fail(integrityErrors.join(" "), "validation_error");
      }
      // Cloud Supabase sequential upsert with DAG validation upfront
      if (data.competencies && data.competencies.length > 0) {
        const incomingIds = new Set(data.competencies.map((c) => c.id));
        const cycles = detectCompetencyCycles([
          ...current.competencies
            .filter((c) => !incomingIds.has(c.id))
            .map((c) => ({ id: c.id, prerequisites: c.prerequisites })),
          ...data.competencies.map((c) => ({ id: c.id, prerequisites: c.prerequisites })),
        ]);
        if (cycles.length > 0) {
          return fail(`Bundle rejected due to competency cycle: ${cycles[0]}`, "cycle_detected");
        }
        for (const comp of data.competencies) {
          const r = await supaTable(context.supabase, "curriculum_competencies").upsert(
            {
              id: comp.id,
              code: comp.code,
              domain: comp.domain,
              title: comp.title,
              blurb: comp.blurb,
              definition: comp.definition,
              bloom_target: comp.bloomTarget,
              prerequisites_json: comp.prerequisites,
              relations_json: comp.relations,
              framework_anchors_json: comp.frameworkAnchors,
              level_descriptors_json: comp.levelDescriptors,
              mapped_volumes_json: comp.mappedVolumes,
              role_tags_json: comp.roleTags,
              crosswalk_json: comp.crosswalk
                ? { neetCompetencyId: comp.id, ...comp.crosswalk }
                : null,
              version: comp.version,
              sort_order: comp.sortOrder,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "id" },
          );
          if (r.error) return fail(`Failed importing competency ${comp.id}.`, "internal_error");
        }
      }

      const courseId = data.course.id ?? `course-${data.course.slug}`;
      const cUp = await supaTable(context.supabase, "courses").upsert(
        {
          id: courseId,
          slug: data.course.slug,
          discipline: data.course.discipline,
          title: data.course.title,
          tagline: data.course.tagline,
          level: data.course.level,
          status: data.course.status,
          about_json: data.course.about,
          outcomes_json: data.course.outcomes,
          artifact: data.course.artifact,
          sort_order: data.course.sortOrder,
          updated_by: context.userId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "slug" },
      );
      if (cUp.error) return fail("Failed importing course to Supabase.", "internal_error");

      let lessonCount = 0;
      for (let mIdx = 0; mIdx < data.modules.length; mIdx++) {
        const mod = data.modules[mIdx]!;
        const modId = mod.id ?? `mod-${data.course.slug}-${mod.slug}`;
        const mUp = await supaTable(context.supabase, "course_modules").upsert(
          {
            id: modId,
            course_id: courseId,
            slug: mod.slug,
            title: mod.title,
            summary: mod.summary,
            sort_order: mod.sortOrder ?? (mIdx + 1) * 10,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "course_id,slug" },
        );
        if (mUp.error) return fail(`Failed importing module ${mod.slug}.`, "internal_error");
        for (let lIdx = 0; lIdx < mod.lessons.length; lIdx++) {
          lessonCount++;
          const les = mod.lessons[lIdx]!;
          const lesId = les.id ?? `les-${data.course.slug}-${les.slug}`;
          const lUp = await supaTable(context.supabase, "course_lessons").upsert(
            {
              id: lesId,
              course_id: courseId,
              module_id: modId,
              slug: les.slug,
              title: les.title,
              summary: les.summary,
              minutes: les.minutes,
              skill_ids_json: les.skillIds,
              blocks_json: les.blocks,
              keep_json: les.keep,
              status: les.status,
              sort_order: les.sortOrder || (lIdx + 1) * 10,
              updated_by: context.userId,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "course_id,slug" },
          );
          if (lUp.error) return fail(`Failed importing lesson ${les.slug}.`, "internal_error");
        }
      }

      for (const lab of data.labs ?? []) {
        const labUp = await supaTable(context.supabase, "curriculum_labs").upsert(
          {
            id: lab.id,
            discipline: lab.discipline,
            skill_id: lab.skillId,
            title: lab.title,
            brief: lab.brief,
            minutes: lab.minutes,
            steps_json: lab.steps,
            twist: lab.twist,
            artifact: lab.artifact,
            evidence_type: lab.evidenceType,
            rubric_json: lab.rubric,
            status: lab.status,
            sort_order: lab.sortOrder,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" },
        );
        if (labUp.error) return fail("Failed importing lab " + lab.id + ".", "internal_error");
      }

      for (const scen of data.scenarios ?? []) {
        const scenarioUp = await supaTable(context.supabase, "curriculum_scenarios").upsert(
          {
            id: scen.id,
            skill_id: scen.skillId,
            title: scen.title,
            domain_context: scen.domainContext,
            situation: scen.situation,
            constraints_json: scen.constraints,
            question: scen.question,
            options_json: scen.options,
            invalidation_prompt: scen.invalidationPrompt,
            status: scen.status,
            sort_order: scen.sortOrder,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" },
        );
        if (scenarioUp.error) {
          return fail("Failed importing scenario " + scen.id + ".", "internal_error");
        }
      }

      const summary = {
        courseId,
        courseSlug: data.course.slug,
        moduleCount: data.modules.length,
        lessonCount,
        competencyCount: data.competencies?.length ?? 0,
        labCount: data.labs?.length ?? 0,
        scenarioCount: data.scenarios?.length ?? 0,
      };
      await recordAudit(context, {
        action: "course.bundle.import",
        resourceType: "course",
        resourceId: data.course.slug,
        outcome: "ok",
        meta: summary,
      });
      return ok(summary);
    }),
  );

export const exportCourseBundle = createServerFn({ method: "GET" })
  .middleware([requireAuthorOrAdmin])
  .validator((input: unknown) =>
    z.object({ courseSlug: z.string().trim().min(1).max(120) }).parse(input),
  )
  .handler(async ({ data, context }) =>
    measureOperation("cms.exportCourseBundle", async () => {
      const rl = guardAdminRateLimit(context.userId);
      if (rl) return rl;
      if (context.authMode === "local_dev" || !context.supabase) {
        const cdb = await import("./curriculum-db.server");
        return cdb.exportCourseBundleDb(data.courseSlug);
      }
      const res = await fetchSupabaseCourses(context.supabase, {
        includeDrafts: true,
        slug: data.courseSlug,
      });
      const course = res.courses[0];
      if (!course) return fail(`Course "${data.courseSlug}" not found.`, "not_found");
      return ok({
        schemaVersion: "1.0" as const,
        course: {
          id: course.id,
          slug: course.slug,
          discipline: course.discipline,
          title: course.title,
          tagline: course.tagline,
          level: course.level,
          status: course.status,
          about: course.about,
          outcomes: course.outcomes,
          artifact: course.artifact,
          sortOrder: course.sortOrder,
        },
        modules: course.modules.map((m) => ({
          id: m.id,
          slug: m.slug,
          title: m.title,
          summary: m.summary,
          sortOrder: m.sortOrder,
          lessons: m.lessons.map((l, idx) => ({
            slug: l.slug,
            title: l.title,
            summary: l.summary,
            minutes: l.minutes,
            skillIds: l.skillIds,
            blocks: l.blocks,
            keep: l.keep,
            status: "published" as const,
            sortOrder: (idx + 1) * 10,
          })),
        })),
      });
    }),
  );

/* ============================================================================
 * 3. RBAC, AUDIT LOG & OPERATIONAL TELEMETRY SERVER FUNCTIONS
 * ========================================================================== */

export const getMyRole = createServerFn({ method: "GET" })
  .middleware([requireVerifiedAuth])
  .handler(
    async ({
      context,
    }): Promise<ApiResult<{ role: AppRole; authMode: "supabase" | "local_dev" }>> =>
      ok({ role: context.role, authMode: context.authMode }),
  );

/**
 * One-time local-dev admin bootstrap.
 * Strictly disabled in production and whenever Supabase is configured.
 * Succeeds ONLY when zero admins currently exist in local SQLite `user_roles`.
 */
export const claimLocalAdmin = createServerFn({ method: "POST" })
  .middleware([requireVerifiedAuth])
  .handler(async ({ context }): Promise<ApiResult<{ claimed: boolean; role: AppRole }>> => {
    if (!isLocalDevAuthAllowed() || context.authMode !== "local_dev") {
      return fail(
        "Local admin bootstrap is disabled in production/Supabase mode. Configure ADMIN_EMAILS or user_roles in Supabase.",
        "forbidden",
      );
    }
    const { localDb } = await import("./db.server");
    const res = localDb.claimFirstLocalAdmin(context.userId);
    if (res.error || !res.data) return fail(res.error ?? "Bootstrap failed.", "internal_error");
    await recordAudit(context, {
      action: "rbac.claim_local_admin",
      resourceType: "user_role",
      resourceId: context.userId,
      outcome: res.data.claimed ? "ok" : "denied",
    });
    if (!res.data.claimed) {
      return fail("An administrator has already been configured.", "conflict");
    }
    return ok({ claimed: true, role: "admin" });
  });

export const listUserRoles = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async ({ context }): Promise<ApiResult<UserRoleRecord[]>> => {
    if (context.authMode === "local_dev" || !context.supabase) {
      const { localDb } = await import("./db.server");
      return ok(localDb.listUserRoles());
    }
    const res = await supaTable(context.supabase, "user_roles")
      .select("user_id, role, granted_by, granted_at")
      .order("granted_at", { ascending: false })
      .limit(500);
    if (res.error || !Array.isArray(res.data)) {
      return fail("Could not load user roles.", "internal_error");
    }
    return ok(res.data as unknown as UserRoleRecord[]);
  });

export const setUserRole = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .validator((input: unknown) =>
    z
      .object({
        targetUserId: z.string().uuid(),
        role: z.enum(["learner", "reviewer", "author", "admin"]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }): Promise<ApiResult<UserRoleRecord>> => {
    const rl = guardAdminRateLimit(context.userId);
    if (rl) return rl;
    if (context.authMode === "local_dev" || !context.supabase) {
      const { localDb } = await import("./db.server");
      const res = localDb.setUserRole(data.targetUserId, data.role, context.userId);
      await recordAudit(context, {
        action: "rbac.set_role",
        resourceType: "user_role",
        resourceId: data.targetUserId,
        outcome: res.error ? "error" : "ok",
        meta: { role: data.role },
      });
      if (res.error || !res.data) return fail(res.error ?? "Could not set role.", "internal_error");
      return ok(res.data);
    }
    const now = new Date().toISOString();
    const res = await supaTable(context.supabase, "user_roles").upsert(
      {
        user_id: data.targetUserId,
        role: data.role,
        granted_by: context.userId,
        granted_at: now,
      },
      { onConflict: "user_id" },
    );
    if (res.error) return fail("Could not set user role in Supabase.", "internal_error");
    await recordAudit(context, {
      action: "rbac.set_role",
      resourceType: "user_role",
      resourceId: data.targetUserId,
      outcome: "ok",
      meta: { role: data.role },
    });
    return ok({
      user_id: data.targetUserId,
      role: data.role,
      granted_by: context.userId,
      granted_at: now,
    });
  });

export const listAuditLogs = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .validator((input: unknown) =>
    z
      .object({
        limit: z.number().int().min(1).max(100).default(50),
        offset: z.number().int().min(0).max(50_000).default(0),
      })
      .optional()
      .parse(input),
  )
  .handler(async ({ data, context }): Promise<ApiResult<PaginatedResult<AuditLogRecord>>> => {
    const limit = data?.limit ?? 50;
    const offset = data?.offset ?? 0;
    if (context.authMode === "local_dev" || !context.supabase) {
      const { localDb } = await import("./db.server");
      return ok(localDb.listAuditLogsPaginated(limit, offset));
    }
    const res = await supaTable(context.supabase, "audit_log")
      .select(
        "id, actor_user_id, action, resource_type, resource_id, outcome, request_id, meta_json, created_at",
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);
    if (res.error || !Array.isArray(res.data)) {
      return fail("Could not load audit log.", "internal_error");
    }
    const total = res.count ?? res.data.length;
    return ok({
      items: res.data as unknown as AuditLogRecord[],
      total,
      limit,
      offset,
      hasMore: offset + res.data.length < total,
    });
  });

/** Admin-only redacted operational latency, error-rate, auth, and sync SLO telemetry. */
export const getOperationalMetrics = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async () => ok(getOperationalMetricsSnapshot()));
