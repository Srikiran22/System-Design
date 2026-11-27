import crypto from "node:crypto";
import type { DatabaseSync } from "node:sqlite";
import { getDatabase } from "./db.server";
import {
  CANONICAL_COMPETENCY_IDS,
  findCompetencyReferences,
  validateCompetencyGraphReferences,
  validateCanonicalCompetencyDefinition,
  validateCourseBundleReferences,
  validateRoleProfileReferences,
  validateSkillReferences,
} from "./curriculum-integrity";
import { LABS, PATHS, SKILLS } from "./content";
import { COMPETENCIES, INCOSE_CROSSWALK, ROLE_PROFILES, type RoleProfile } from "./competencies";
import { CAPSTONE_PROJECT, LAB_RUBRICS, SCENARIOS, type ScenarioChallenge } from "./rubrics";
import type { Block, Discipline, Lesson } from "./types";
import {
  detectCompetencyCycles,
  type ApiResult,
  type CapstoneUpsertInput,
  type CompetencyUpsertInput,
  type CourseBundleInput,
  type CourseUpsertInput,
  type DynamicCapstoneRecord,
  type DynamicCompetencyRecord,
  type DynamicCourseRecord,
  type DynamicLabRecord,
  type DynamicModuleRecord,
  type LabUpsertInput,
  type LessonUpsertInput,
  type ModuleUpsertInput,
  type PublishStatus,
  type RoleProfileUpsertInput,
  type ScenarioUpsertInput,
} from "./curriculum-schemas";

const ok = <T>(data: T): ApiResult<T> => ({ data, error: null });
const fail = (
  error: string,
  errorCode:
    | "validation_error"
    | "not_found"
    | "conflict"
    | "cycle_detected"
    | "internal_error" = "internal_error",
): ApiResult<never> => ({ data: null, error, errorCode });

function safeParseJson<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/**
 * Optional one-time starter curriculum seed for local SQLite databases.
 * Skipped automatically when `NEET_SKIP_DEFAULT_CURRICULUM_SEED=1` so teams can
 * start with a 100% blank database and author/import only their own courses.
 */
export function ensureCurriculumSeeded(db: DatabaseSync = getDatabase()): void {
  if (process.env["NEET_SKIP_DEFAULT_CURRICULUM_SEED"] === "1") return;

  const courseCount = (db.prepare("SELECT COUNT(*) as c FROM courses").get() as { c: number }).c;
  const compCount = (
    db.prepare("SELECT COUNT(*) as c FROM curriculum_competencies").get() as { c: number }
  ).c;
  if (courseCount > 0 || compCount > 0) return;

  const skillBlurbs = new Map(SKILLS.map((s) => [s.id, s.blurb]));
  const skillDisciplines = new Map(SKILLS.map((s) => [s.id, s.discipline]));
  const crosswalkMap = new Map(INCOSE_CROSSWALK.map((c) => [c.neetCompetencyId, c]));
  const now = new Date().toISOString();

  try {
    db.exec("BEGIN IMMEDIATE;");

    // 1. Seed starter courses -> modules -> lessons
    const insertCourse = db.prepare(`
      INSERT OR IGNORE INTO courses (
        id, slug, discipline, title, tagline, level, status,
        about_json, outcomes_json, artifact, sort_order, version, created_by, updated_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'published', ?, ?, ?, ?, 1, 'seed', 'seed', ?, ?)
    `);
    const insertModule = db.prepare(`
      INSERT OR IGNORE INTO course_modules (id, course_id, slug, title, summary, sort_order, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertLesson = db.prepare(`
      INSERT OR IGNORE INTO course_lessons (
        id, module_id, course_id, slug, title, summary, minutes,
        skill_ids_json, blocks_json, keep_json, status, sort_order, version, updated_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', ?, 1, 'seed', ?, ?)
    `);

    PATHS.forEach((p, cIdx) => {
      const courseId = `course-${p.slug}`;
      insertCourse.run(
        courseId,
        p.slug,
        p.discipline,
        p.title,
        p.tagline,
        p.level,
        JSON.stringify(p.about),
        JSON.stringify(p.outcomes),
        p.artifact,
        (cIdx + 1) * 10,
        now,
        now,
      );
      p.modules.forEach((m, mIdx) => {
        const moduleId = `mod-${p.slug}-${m.slug}`;
        insertModule.run(moduleId, courseId, m.slug, m.title, m.summary, (mIdx + 1) * 10, now, now);
        m.lessons.forEach((l, lIdx) => {
          const lessonId = `les-${p.slug}-${l.slug}`;
          insertLesson.run(
            lessonId,
            moduleId,
            courseId,
            l.slug,
            l.title,
            l.summary,
            l.minutes,
            JSON.stringify(l.skillIds),
            JSON.stringify(l.blocks),
            JSON.stringify(l.keep),
            (lIdx + 1) * 10,
            now,
            now,
          );
        });
      });
    });

    // 2. Seed starter competencies + INCOSE crosswalk
    const insertComp = db.prepare(`
      INSERT OR IGNORE INTO curriculum_competencies (
        id, code, domain, title, blurb, definition, bloom_target,
        prerequisites_json, relations_json, framework_anchors_json,
        level_descriptors_json, mapped_volumes_json, role_tags_json,
        crosswalk_json, version, sort_order, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    COMPETENCIES.forEach((c, idx) => {
      const cw = crosswalkMap.get(c.id);
      insertComp.run(
        c.id,
        c.code,
        c.domain,
        c.title,
        skillBlurbs.get(c.id) ?? c.definition.slice(0, 140),
        c.definition,
        c.bloomTarget,
        JSON.stringify(c.prerequisites),
        JSON.stringify(c.relations),
        JSON.stringify(c.frameworkAnchors),
        JSON.stringify(c.levelDescriptors),
        JSON.stringify(c.mappedVolumes),
        JSON.stringify(c.roleTags),
        cw ? JSON.stringify(cw) : null,
        c.version,
        (idx + 1) * 10,
        now,
      );
    });

    // 3. Seed starter labs + domain rubrics
    const insertLab = db.prepare(`
      INSERT OR IGNORE INTO curriculum_labs (
        id, discipline, skill_id, title, brief, minutes, steps_json,
        twist, artifact, evidence_type, rubric_json, status, sort_order, version, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', ?, 1, ?)
    `);
    LABS.forEach((lab, idx) => {
      const rubric = LAB_RUBRICS[lab.id] ?? LAB_RUBRICS["default"]!;
      const discipline = skillDisciplines.get(lab.skillId) ?? "design";
      insertLab.run(
        lab.id,
        discipline,
        lab.skillId,
        lab.title,
        lab.brief,
        lab.minutes,
        JSON.stringify(lab.steps),
        lab.twist,
        lab.artifact,
        lab.evidenceType,
        JSON.stringify(rubric),
        (idx + 1) * 10,
        now,
      );
    });

    // 4. Seed starter scenarios
    const insertScenario = db.prepare(`
      INSERT OR IGNORE INTO curriculum_scenarios (
        id, skill_id, title, domain_context, situation, constraints_json,
        question, options_json, invalidation_prompt, status, sort_order, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', ?, ?)
    `);
    SCENARIOS.forEach((s, idx) => {
      insertScenario.run(
        s.id,
        s.skillId,
        s.title,
        s.domainContext,
        s.situation,
        JSON.stringify(s.constraints),
        s.question,
        JSON.stringify(s.options),
        s.invalidationPrompt,
        (idx + 1) * 10,
        now,
      );
    });

    // 5. Seed starter capstone
    db.prepare(
      `
      INSERT OR IGNORE INTO curriculum_capstones (
        id, version, title, summary, disclaimer, change_impact_json, milestones_json, status, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'published', ?)
    `,
    ).run(
      CAPSTONE_PROJECT.id,
      CAPSTONE_PROJECT.version,
      CAPSTONE_PROJECT.title,
      CAPSTONE_PROJECT.summary,
      CAPSTONE_PROJECT.disclaimer,
      JSON.stringify(CAPSTONE_PROJECT.changeImpactChallenge),
      JSON.stringify(CAPSTONE_PROJECT.milestones),
      now,
    );

    // 6. Seed starter role profiles
    const insertRole = db.prepare(`
      INSERT OR IGNORE INTO curriculum_role_profiles (
        id, title, status, disclaimer, summary, required_levels_json, sort_order, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    ROLE_PROFILES.forEach((r, idx) => {
      insertRole.run(
        r.id,
        r.title,
        r.status,
        r.disclaimer,
        r.summary,
        JSON.stringify(r.requiredLevels),
        (idx + 1) * 10,
        now,
      );
    });

    db.exec("COMMIT;");
  } catch (err) {
    try {
      db.exec("ROLLBACK;");
    } catch {
      /* ignore */
    }
    throw err;
  }
}

type CourseRow = {
  id: string;
  slug: string;
  discipline: Discipline;
  title: string;
  tagline: string;
  level: DynamicCourseRecord["level"];
  status: PublishStatus;
  about_json: string;
  outcomes_json: string;
  artifact: string;
  sort_order: number;
  version: number;
  updated_at: string;
};

type ModuleRow = {
  id: string;
  course_id: string;
  slug: string;
  title: string;
  summary: string;
  sort_order: number;
};

type LessonRow = {
  id: string;
  module_id: string;
  course_id: string;
  slug: string;
  title: string;
  summary: string;
  minutes: number;
  skill_ids_json: string;
  blocks_json: string;
  keep_json: string;
  status: PublishStatus;
  sort_order: number;
};

function hydrateCourses(
  db: DatabaseSync,
  courseRows: CourseRow[],
  includeDrafts: boolean,
): DynamicCourseRecord[] {
  if (courseRows.length === 0) return [];
  const modRows = db
    .prepare(
      "SELECT id, course_id, slug, title, summary, sort_order FROM course_modules ORDER BY sort_order ASC, created_at ASC",
    )
    .all() as unknown as ModuleRow[];
  const lessonRows = (includeDrafts
    ? db
        .prepare(
          "SELECT id, module_id, course_id, slug, title, summary, minutes, skill_ids_json, blocks_json, keep_json, status, sort_order FROM course_lessons ORDER BY sort_order ASC, created_at ASC",
        )
        .all()
    : db
        .prepare(
          "SELECT id, module_id, course_id, slug, title, summary, minutes, skill_ids_json, blocks_json, keep_json, status, sort_order FROM course_lessons WHERE status = 'published' ORDER BY sort_order ASC, created_at ASC",
        )
        .all()) as unknown as LessonRow[];

  const lessonsByModule = new Map<string, Lesson[]>();
  for (const lr of lessonRows) {
    const arr = lessonsByModule.get(lr.module_id) ?? [];
    arr.push({
      slug: lr.slug,
      title: lr.title,
      minutes: lr.minutes,
      summary: lr.summary,
      skillIds: safeParseJson<string[]>(lr.skill_ids_json, []),
      keep: safeParseJson<string[]>(lr.keep_json, []),
      blocks: safeParseJson<Block[]>(lr.blocks_json, []),
    });
    lessonsByModule.set(lr.module_id, arr);
  }

  const modulesByCourse = new Map<string, DynamicModuleRecord[]>();
  for (const mr of modRows) {
    const arr = modulesByCourse.get(mr.course_id) ?? [];
    arr.push({
      id: mr.id,
      slug: mr.slug,
      title: mr.title,
      summary: mr.summary,
      sortOrder: mr.sort_order,
      lessons: lessonsByModule.get(mr.id) ?? [],
    });
    modulesByCourse.set(mr.course_id, arr);
  }

  return courseRows.map((c) => ({
    id: c.id,
    slug: c.slug,
    discipline: c.discipline,
    title: c.title,
    tagline: c.tagline,
    level: c.level,
    status: c.status,
    sortOrder: c.sort_order,
    version: c.version,
    updatedAt: c.updated_at,
    about: safeParseJson<string[]>(c.about_json, []),
    outcomes: safeParseJson<string[]>(c.outcomes_json, []),
    artifact: c.artifact,
    modules: modulesByCourse.get(c.id) ?? [],
  }));
}

export function listCoursesDb(opts?: {
  includeDrafts?: boolean;
  discipline?: Discipline;
  db?: DatabaseSync;
}): DynamicCourseRecord[] {
  const db = opts?.db ?? getDatabase();
  ensureCurriculumSeeded(db);
  const includeDrafts = Boolean(opts?.includeDrafts);
  let rows: CourseRow[];
  if (includeDrafts && opts?.discipline) {
    rows = db
      .prepare(
        "SELECT id, slug, discipline, title, tagline, level, status, about_json, outcomes_json, artifact, sort_order, version, updated_at FROM courses WHERE discipline = ? ORDER BY sort_order ASC, created_at ASC",
      )
      .all(opts.discipline) as unknown as CourseRow[];
  } else if (includeDrafts) {
    rows = db
      .prepare(
        "SELECT id, slug, discipline, title, tagline, level, status, about_json, outcomes_json, artifact, sort_order, version, updated_at FROM courses ORDER BY sort_order ASC, created_at ASC",
      )
      .all() as unknown as CourseRow[];
  } else if (opts?.discipline) {
    rows = db
      .prepare(
        "SELECT id, slug, discipline, title, tagline, level, status, about_json, outcomes_json, artifact, sort_order, version, updated_at FROM courses WHERE status = 'published' AND discipline = ? ORDER BY sort_order ASC, created_at ASC",
      )
      .all(opts.discipline) as unknown as CourseRow[];
  } else {
    rows = db
      .prepare(
        "SELECT id, slug, discipline, title, tagline, level, status, about_json, outcomes_json, artifact, sort_order, version, updated_at FROM courses WHERE status = 'published' ORDER BY sort_order ASC, created_at ASC",
      )
      .all() as unknown as CourseRow[];
  }
  return hydrateCourses(db, rows, includeDrafts);
}

export function getCourseBySlugDb(
  slug: string,
  opts?: { includeDrafts?: boolean; db?: DatabaseSync },
): DynamicCourseRecord | null {
  const db = opts?.db ?? getDatabase();
  ensureCurriculumSeeded(db);
  const includeDrafts = Boolean(opts?.includeDrafts);
  const row = (includeDrafts
    ? db
        .prepare(
          "SELECT id, slug, discipline, title, tagline, level, status, about_json, outcomes_json, artifact, sort_order, version, updated_at FROM courses WHERE slug = ?",
        )
        .get(slug)
    : db
        .prepare(
          "SELECT id, slug, discipline, title, tagline, level, status, about_json, outcomes_json, artifact, sort_order, version, updated_at FROM courses WHERE slug = ? AND status = 'published'",
        )
        .get(slug)) as unknown as CourseRow | undefined;
  if (!row) return null;
  return hydrateCourses(db, [row], includeDrafts)[0] ?? null;
}

export function getLessonBySlugDb(
  courseSlug: string,
  lessonSlug: string,
  opts?: { includeDrafts?: boolean; db?: DatabaseSync },
): {
  path: DynamicCourseRecord;
  module: DynamicModuleRecord;
  lesson: Lesson;
  prev: { path: string; lesson: Lesson } | null;
  next: { path: string; lesson: Lesson } | null;
} | null {
  const course = getCourseBySlugDb(courseSlug, opts);
  if (!course) return null;
  const flat: Array<{ module: DynamicModuleRecord; lesson: Lesson }> = [];
  for (const mod of course.modules) {
    for (const les of mod.lessons) {
      flat.push({ module: mod, lesson: les });
    }
  }
  const idx = flat.findIndex((item) => item.lesson.slug === lessonSlug);
  if (idx === -1) return null;
  const current = flat[idx]!;
  return {
    path: course,
    module: current.module,
    lesson: current.lesson,
    prev: idx > 0 ? { path: course.slug, lesson: flat[idx - 1]!.lesson } : null,
    next: idx < flat.length - 1 ? { path: course.slug, lesson: flat[idx + 1]!.lesson } : null,
  };
}

export function upsertCourseDb(
  input: CourseUpsertInput,
  actorUserId: string,
  db: DatabaseSync = getDatabase(),
): ApiResult<DynamicCourseRecord> {
  try {
    const now = new Date().toISOString();
    const existingBySlug = db
      .prepare("SELECT id, version FROM courses WHERE slug = ?")
      .get(input.slug) as { id: string; version: number } | undefined;
    const existingById = input.id
      ? (db.prepare("SELECT id, version FROM courses WHERE id = ?").get(input.id) as
          { id: string; version: number } | undefined)
      : undefined;

    if (existingBySlug && existingById && existingBySlug.id !== existingById.id) {
      return fail(`Course slug "${input.slug}" is already used by another course.`, "conflict");
    }

    const id =
      existingById?.id ?? existingBySlug?.id ?? input.id ?? `course-${crypto.randomUUID()}`;
    const existing = existingById ?? existingBySlug;

    if (existing) {
      db.prepare(
        `
        UPDATE courses
        SET slug = ?, discipline = ?, title = ?, tagline = ?, level = ?, status = ?,
            about_json = ?, outcomes_json = ?, artifact = ?, sort_order = ?,
            version = version + 1, updated_by = ?, updated_at = ?
        WHERE id = ?
      `,
      ).run(
        input.slug,
        input.discipline,
        input.title,
        input.tagline,
        input.level,
        input.status,
        JSON.stringify(input.about),
        JSON.stringify(input.outcomes),
        input.artifact,
        input.sortOrder,
        actorUserId,
        now,
        id,
      );
    } else {
      db.prepare(
        `
        INSERT INTO courses (
          id, slug, discipline, title, tagline, level, status,
          about_json, outcomes_json, artifact, sort_order, version, created_by, updated_by, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?)
      `,
      ).run(
        id,
        input.slug,
        input.discipline,
        input.title,
        input.tagline,
        input.level,
        input.status,
        JSON.stringify(input.about),
        JSON.stringify(input.outcomes),
        input.artifact,
        input.sortOrder,
        actorUserId,
        actorUserId,
        now,
        now,
      );
    }

    const hydrated = getCourseBySlugDb(input.slug, { includeDrafts: true, db });
    if (!hydrated) return fail("Failed to read back saved course.");
    return ok(hydrated);
  } catch (e) {
    return fail((e as Error).message || "Failed to save course.");
  }
}

export function setCourseStatusDb(
  courseId: string,
  status: PublishStatus,
  actorUserId: string,
  db: DatabaseSync = getDatabase(),
): ApiResult<{ id: string; status: PublishStatus; version: number }> {
  try {
    const now = new Date().toISOString();
    const res = db
      .prepare(
        "UPDATE courses SET status = ?, version = version + 1, updated_by = ?, updated_at = ? WHERE id = ?",
      )
      .run(status, actorUserId, now, courseId);
    if (res.changes === 0) return fail("Course not found.", "not_found");
    const row = db
      .prepare("SELECT id, status, version FROM courses WHERE id = ?")
      .get(courseId) as { id: string; status: PublishStatus; version: number };
    return ok(row);
  } catch (e) {
    return fail((e as Error).message || "Failed to update course status.");
  }
}

export function deleteCourseDb(
  courseId: string,
  db: DatabaseSync = getDatabase(),
): ApiResult<{ deleted: boolean }> {
  try {
    const res = db.prepare("DELETE FROM courses WHERE id = ?").run(courseId);
    if (res.changes === 0) return fail("Course not found.", "not_found");
    return ok({ deleted: true });
  } catch (e) {
    return fail((e as Error).message || "Failed to delete course.");
  }
}

export function upsertModuleDb(
  input: ModuleUpsertInput,
  db: DatabaseSync = getDatabase(),
): ApiResult<{
  id: string;
  courseId: string;
  slug: string;
  title: string;
  summary: string;
  sortOrder: number;
}> {
  try {
    const course = db.prepare("SELECT id FROM courses WHERE id = ?").get(input.courseId) as
      { id: string } | undefined;
    if (!course) return fail("Target course not found.", "not_found");

    const now = new Date().toISOString();
    const existing = input.id
      ? (db.prepare("SELECT id FROM course_modules WHERE id = ?").get(input.id) as
          { id: string } | undefined)
      : (db
          .prepare("SELECT id FROM course_modules WHERE course_id = ? AND slug = ?")
          .get(input.courseId, input.slug) as { id: string } | undefined);

    const id = existing?.id ?? input.id ?? `mod-${crypto.randomUUID()}`;
    if (existing) {
      db.prepare(
        "UPDATE course_modules SET slug = ?, title = ?, summary = ?, sort_order = ?, updated_at = ? WHERE id = ?",
      ).run(input.slug, input.title, input.summary, input.sortOrder, now, id);
    } else {
      db.prepare(
        "INSERT INTO course_modules (id, course_id, slug, title, summary, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      ).run(id, input.courseId, input.slug, input.title, input.summary, input.sortOrder, now, now);
    }
    return ok({
      id,
      courseId: input.courseId,
      slug: input.slug,
      title: input.title,
      summary: input.summary,
      sortOrder: input.sortOrder,
    });
  } catch (e) {
    return fail((e as Error).message || "Failed to save module.");
  }
}

export function deleteModuleDb(
  moduleId: string,
  db: DatabaseSync = getDatabase(),
): ApiResult<{ deleted: boolean }> {
  try {
    const res = db.prepare("DELETE FROM course_modules WHERE id = ?").run(moduleId);
    if (res.changes === 0) return fail("Module not found.", "not_found");
    return ok({ deleted: true });
  } catch (e) {
    return fail((e as Error).message || "Failed to delete module.");
  }
}

export function reorderModulesDb(
  courseId: string,
  orderedModuleIds: string[],
  db: DatabaseSync = getDatabase(),
): ApiResult<{ updated: number }> {
  try {
    const now = new Date().toISOString();
    let updated = 0;
    db.exec("BEGIN IMMEDIATE;");
    const stmt = db.prepare(
      "UPDATE course_modules SET sort_order = ?, updated_at = ? WHERE id = ? AND course_id = ?",
    );
    orderedModuleIds.forEach((modId, idx) => {
      const r = stmt.run((idx + 1) * 10, now, modId, courseId);
      updated += Number(r.changes);
    });
    db.exec("COMMIT;");
    return ok({ updated });
  } catch (e) {
    try {
      db.exec("ROLLBACK;");
    } catch {
      /* ignore */
    }
    return fail((e as Error).message || "Failed to reorder modules.");
  }
}

export function upsertLessonDb(
  input: LessonUpsertInput,
  actorUserId: string,
  db: DatabaseSync = getDatabase(),
): ApiResult<{ id: string; courseId: string; moduleId: string; slug: string }> {
  try {
    const mod = db
      .prepare("SELECT id, course_id FROM course_modules WHERE id = ? AND course_id = ?")
      .get(input.moduleId, input.courseId) as { id: string; course_id: string } | undefined;
    if (!mod) return fail("Target module does not belong to course.", "not_found");

    const knownCompetencyIds = new Set(listCompetenciesDb(db).map((competency) => competency.id).filter((id) => CANONICAL_COMPETENCY_IDS.has(id)));
    const referenceErrors = validateSkillReferences(knownCompetencyIds, [
      { source: "Lesson " + input.courseId + "/" + input.slug, skillIds: input.skillIds },
    ]);
    if (referenceErrors.length > 0) return fail(referenceErrors.join(" "), "validation_error");

    const now = new Date().toISOString();
    const existing = input.id
      ? (db.prepare("SELECT id FROM course_lessons WHERE id = ?").get(input.id) as
          { id: string } | undefined)
      : (db
          .prepare("SELECT id FROM course_lessons WHERE course_id = ? AND slug = ?")
          .get(input.courseId, input.slug) as { id: string } | undefined);
    const id = existing?.id ?? input.id ?? `les-${crypto.randomUUID()}`;

    if (existing) {
      db.prepare(
        `
        UPDATE course_lessons
        SET module_id = ?, slug = ?, title = ?, summary = ?, minutes = ?,
            skill_ids_json = ?, blocks_json = ?, keep_json = ?, status = ?,
            sort_order = ?, version = version + 1, updated_by = ?, updated_at = ?
        WHERE id = ?
      `,
      ).run(
        input.moduleId,
        input.slug,
        input.title,
        input.summary,
        input.minutes,
        JSON.stringify(input.skillIds),
        JSON.stringify(input.blocks),
        JSON.stringify(input.keep),
        input.status,
        input.sortOrder,
        actorUserId,
        now,
        id,
      );
    } else {
      db.prepare(
        `
        INSERT INTO course_lessons (
          id, module_id, course_id, slug, title, summary, minutes,
          skill_ids_json, blocks_json, keep_json, status, sort_order, version, updated_by, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
      `,
      ).run(
        id,
        input.moduleId,
        input.courseId,
        input.slug,
        input.title,
        input.summary,
        input.minutes,
        JSON.stringify(input.skillIds),
        JSON.stringify(input.blocks),
        JSON.stringify(input.keep),
        input.status,
        input.sortOrder,
        actorUserId,
        now,
        now,
      );
    }
    return ok({ id, courseId: input.courseId, moduleId: input.moduleId, slug: input.slug });
  } catch (e) {
    return fail((e as Error).message || "Failed to save lesson.");
  }
}

export function deleteLessonDb(
  lessonId: string,
  db: DatabaseSync = getDatabase(),
): ApiResult<{ deleted: boolean }> {
  try {
    const res = db.prepare("DELETE FROM course_lessons WHERE id = ?").run(lessonId);
    if (res.changes === 0) return fail("Lesson not found.", "not_found");
    return ok({ deleted: true });
  } catch (e) {
    return fail((e as Error).message || "Failed to delete lesson.");
  }
}

function ensureCanonicalCompetencyRowsDb(db: DatabaseSync): void {
  if (process.env["NEET_SKIP_DEFAULT_CURRICULUM_SEED"] === "1") return;
  const existing = new Set(
    (db.prepare("SELECT id FROM curriculum_competencies").all() as Array<{ id: string }>).map(
      (row) => row.id,
    ),
  );
  const blurbs = new Map(SKILLS.map((skill) => [skill.id, skill.blurb]));
  const crosswalk = new Map(INCOSE_CROSSWALK.map((item) => [item.neetCompetencyId, item]));
  const now = new Date().toISOString();
  const insert = db.prepare(`
    INSERT OR IGNORE INTO curriculum_competencies (
      id, code, domain, title, blurb, definition, bloom_target,
      prerequisites_json, relations_json, framework_anchors_json,
      level_descriptors_json, mapped_volumes_json, role_tags_json,
      crosswalk_json, version, sort_order, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  COMPETENCIES.forEach((competency, index) => {
    if (existing.has(competency.id)) return;
    const mapped = crosswalk.get(competency.id);
    insert.run(
      competency.id,
      competency.code,
      competency.domain,
      competency.title,
      blurbs.get(competency.id) ?? competency.definition.slice(0, 140),
      competency.definition,
      competency.bloomTarget,
      JSON.stringify(competency.prerequisites),
      JSON.stringify(competency.relations),
      JSON.stringify(competency.frameworkAnchors),
      JSON.stringify(competency.levelDescriptors),
      JSON.stringify(competency.mappedVolumes),
      JSON.stringify(competency.roleTags),
      mapped ? JSON.stringify(mapped) : null,
      competency.version,
      (index + 1) * 10,
      now,
    );
  });
}

export function listCompetenciesDb(db: DatabaseSync = getDatabase()): DynamicCompetencyRecord[] {
  ensureCurriculumSeeded(db);
  // A user-created course may pre-date the starter catalogue. Fill only the missing
  // canonical competencies rather than skipping competency seeding because a course exists.
  ensureCanonicalCompetencyRowsDb(db);
  const rows = db
    .prepare("SELECT * FROM curriculum_competencies ORDER BY sort_order ASC, code ASC")
    .all() as unknown as Array<Record<string, unknown>>;

  return rows.map((r) => {
    const crosswalk = r["crosswalk_json"]
      ? safeParseJson<DynamicCompetencyRecord["crosswalk"]>(String(r["crosswalk_json"]), undefined)
      : undefined;
    return {
      id: String(r["id"]),
      code: String(r["code"]),
      domain: String(r["domain"]) as Discipline,
      title: String(r["title"]),
      blurb: String(r["blurb"]),
      definition: String(r["definition"]),
      bloomTarget: String(r["bloom_target"]) as DynamicCompetencyRecord["bloomTarget"],
      prerequisites: safeParseJson<string[]>(String(r["prerequisites_json"]), []),
      relations: safeParseJson<DynamicCompetencyRecord["relations"]>(
        String(r["relations_json"]),
        [],
      ),
      frameworkAnchors: safeParseJson<DynamicCompetencyRecord["frameworkAnchors"]>(
        String(r["framework_anchors_json"]),
        [],
      ),
      levelDescriptors: safeParseJson<DynamicCompetencyRecord["levelDescriptors"]>(
        String(r["level_descriptors_json"]),
        [] as unknown as DynamicCompetencyRecord["levelDescriptors"],
      ),
      mappedVolumes: safeParseJson<string[]>(String(r["mapped_volumes_json"]), []),
      roleTags: safeParseJson<string[]>(String(r["role_tags_json"]), []),
      version: String(r["version"] ?? "2.0.0"),
      sortOrder: Number(r["sort_order"] ?? 100),
      ...(crosswalk ? { crosswalk } : {}),
    };
  });
}

export function upsertCompetencyDb(
  input: CompetencyUpsertInput,
  db: DatabaseSync = getDatabase(),
): ApiResult<DynamicCompetencyRecord> {
  // The Proceed Scale and learner-facing competency map currently define 16 canonical skills.
  // A new ID requires a coordinated model/UI version update, not an isolated database row.
  const supportedErrors = validateCanonicalCompetencyDefinition(input);
  if (supportedErrors.length > 0) return fail(supportedErrors.join(" "), "validation_error");

  // Validate prerequisite DAG stays acyclic before mutating
  const existing = listCompetenciesDb(db);
  const referenceErrors = validateCompetencyGraphReferences(existing, [input]);
  if (referenceErrors.length > 0) {
    return fail(referenceErrors.join(" "), "validation_error");
  }
  const proposedNodes = [
    ...existing
      .filter((c) => c.id !== input.id)
      .map((c) => ({ id: c.id, prerequisites: c.prerequisites })),
    { id: input.id, prerequisites: input.prerequisites },
  ];
  const cycles = detectCompetencyCycles(proposedNodes);
  if (cycles.length > 0) {
    return fail(`Circular prerequisite graph rejected: ${cycles[0]}`, "cycle_detected");
  }

  try {
    const now = new Date().toISOString();
    const crosswalkPayload = input.crosswalk
      ? JSON.stringify({ neetCompetencyId: input.id, ...input.crosswalk })
      : null;
    db.prepare(
      `
      INSERT INTO curriculum_competencies (
        id, code, domain, title, blurb, definition, bloom_target,
        prerequisites_json, relations_json, framework_anchors_json,
        level_descriptors_json, mapped_volumes_json, role_tags_json,
        crosswalk_json, version, sort_order, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        code = excluded.code,
        domain = excluded.domain,
        title = excluded.title,
        blurb = excluded.blurb,
        definition = excluded.definition,
        bloom_target = excluded.bloom_target,
        prerequisites_json = excluded.prerequisites_json,
        relations_json = excluded.relations_json,
        framework_anchors_json = excluded.framework_anchors_json,
        level_descriptors_json = excluded.level_descriptors_json,
        mapped_volumes_json = excluded.mapped_volumes_json,
        role_tags_json = excluded.role_tags_json,
        crosswalk_json = excluded.crosswalk_json,
        version = excluded.version,
        sort_order = excluded.sort_order,
        updated_at = excluded.updated_at
    `,
    ).run(
      input.id,
      input.code,
      input.domain,
      input.title,
      input.blurb,
      input.definition,
      input.bloomTarget,
      JSON.stringify(input.prerequisites),
      JSON.stringify(input.relations),
      JSON.stringify(input.frameworkAnchors),
      JSON.stringify(input.levelDescriptors),
      JSON.stringify(input.mappedVolumes),
      JSON.stringify(input.roleTags),
      crosswalkPayload,
      input.version,
      input.sortOrder,
      now,
    );
    const saved = listCompetenciesDb(db).find((c) => c.id === input.id);
    if (!saved) return fail("Failed to read back competency.");
    return ok(saved);
  } catch (e) {
    return fail((e as Error).message || "Failed to save competency.");
  }
}

export function deleteCompetencyDb(
  id: string,
  db: DatabaseSync = getDatabase(),
): ApiResult<{ deleted: boolean }> {
  try {
    if (CANONICAL_COMPETENCY_IDS.has(id)) {
      return fail(
        "Core competency " + id + " cannot be deleted; the learner model and scoring UI depend on the canonical 16-skill catalogue.",
        "conflict",
      );
    }
    const inventory = {
      competencies: listCompetenciesDb(db),
      courses: listCoursesDb({ includeDrafts: true, db }),
      labs: listLabsDb({ includeDrafts: true, db }),
      scenarios: listScenariosDb({ includeDrafts: true, db }),
      capstone: getActiveCapstoneDb({ includeDrafts: true, db }),
      roleProfiles: listRoleProfilesDb(db),
    };
    const references = findCompetencyReferences(id, inventory);
    if (references.length > 0) {
      return fail(
        "Cannot delete competency " + id + "; it is still referenced by: " + references.join(", ") + ".",
        "conflict",
      );
    }
    const res = db.prepare("DELETE FROM curriculum_competencies WHERE id = ?").run(id);
    if (res.changes === 0) return fail("Competency not found.", "not_found");
    return ok({ deleted: true });
  } catch (e) {
    return fail((e as Error).message || "Failed to delete competency.");
  }
}

export function listLabsDb(opts?: {
  includeDrafts?: boolean;
  db?: DatabaseSync;
}): DynamicLabRecord[] {
  const db = opts?.db ?? getDatabase();
  ensureCurriculumSeeded(db);
  const rows = (opts?.includeDrafts
    ? db.prepare("SELECT * FROM curriculum_labs ORDER BY sort_order ASC, id ASC").all()
    : db
        .prepare(
          "SELECT * FROM curriculum_labs WHERE status = 'published' ORDER BY sort_order ASC, id ASC",
        )
        .all()) as unknown as Array<Record<string, unknown>>;

  return rows.map((r) => ({
    id: String(r["id"]),
    discipline: String(r["discipline"]) as Discipline,
    skillId: String(r["skill_id"]),
    title: String(r["title"]),
    brief: String(r["brief"]),
    minutes: Number(r["minutes"]),
    steps: safeParseJson<string[]>(String(r["steps_json"]), []),
    twist: String(r["twist"]),
    artifact: String(r["artifact"]),
    evidenceType: String(r["evidence_type"]) as DynamicLabRecord["evidenceType"],
    rubric: safeParseJson<DynamicLabRecord["rubric"]>(
      String(r["rubric_json"]),
      LAB_RUBRICS["default"]!,
    ),
    status: String(r["status"]) as PublishStatus,
    sortOrder: Number(r["sort_order"] ?? 100),
    version: Number(r["version"] ?? 1),
  }));
}

export function upsertLabDb(
  input: LabUpsertInput,
  db: DatabaseSync = getDatabase(),
): ApiResult<DynamicLabRecord> {
  const knownCompetencyIds = new Set(listCompetenciesDb(db).map((competency) => competency.id).filter((id) => CANONICAL_COMPETENCY_IDS.has(id)));
  const referenceErrors = validateSkillReferences(knownCompetencyIds, [
    { source: "Lab " + input.id, skillIds: [input.skillId] },
  ]);
  if (referenceErrors.length > 0) return fail(referenceErrors.join(" "), "validation_error");
  try {
    const now = new Date().toISOString();
    db.prepare(
      `
      INSERT INTO curriculum_labs (
        id, discipline, skill_id, title, brief, minutes, steps_json,
        twist, artifact, evidence_type, rubric_json, status, sort_order, version, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
      ON CONFLICT(id) DO UPDATE SET
        discipline = excluded.discipline,
        skill_id = excluded.skill_id,
        title = excluded.title,
        brief = excluded.brief,
        minutes = excluded.minutes,
        steps_json = excluded.steps_json,
        twist = excluded.twist,
        artifact = excluded.artifact,
        evidence_type = excluded.evidence_type,
        rubric_json = excluded.rubric_json,
        status = excluded.status,
        sort_order = excluded.sort_order,
        version = curriculum_labs.version + 1,
        updated_at = excluded.updated_at
    `,
    ).run(
      input.id,
      input.discipline,
      input.skillId,
      input.title,
      input.brief,
      input.minutes,
      JSON.stringify(input.steps),
      input.twist,
      input.artifact,
      input.evidenceType,
      JSON.stringify(input.rubric),
      input.status,
      input.sortOrder,
      now,
    );
    const saved = listLabsDb({ includeDrafts: true, db }).find((l) => l.id === input.id);
    if (!saved) return fail("Failed to read back lab.");
    return ok(saved);
  } catch (e) {
    return fail((e as Error).message || "Failed to save lab.");
  }
}

export function deleteLabDb(
  id: string,
  db: DatabaseSync = getDatabase(),
): ApiResult<{ deleted: boolean }> {
  try {
    const res = db.prepare("DELETE FROM curriculum_labs WHERE id = ?").run(id);
    if (res.changes === 0) return fail("Lab not found.", "not_found");
    return ok({ deleted: true });
  } catch (e) {
    return fail((e as Error).message || "Failed to delete lab.");
  }
}

export function listScenariosDb(opts?: {
  includeDrafts?: boolean;
  db?: DatabaseSync;
}): ScenarioChallenge[] {
  const db = opts?.db ?? getDatabase();
  ensureCurriculumSeeded(db);
  const rows = (opts?.includeDrafts
    ? db.prepare("SELECT * FROM curriculum_scenarios ORDER BY sort_order ASC, id ASC").all()
    : db
        .prepare(
          "SELECT * FROM curriculum_scenarios WHERE status = 'published' ORDER BY sort_order ASC, id ASC",
        )
        .all()) as unknown as Array<Record<string, unknown>>;

  return rows.map((r) => ({
    id: String(r["id"]),
    skillId: String(r["skill_id"]),
    title: String(r["title"]),
    domainContext: String(r["domain_context"]),
    situation: String(r["situation"]),
    constraints: safeParseJson<string[]>(String(r["constraints_json"]), []),
    question: String(r["question"]),
    options: safeParseJson<ScenarioChallenge["options"]>(String(r["options_json"]), []),
    invalidationPrompt: String(r["invalidation_prompt"]),
  }));
}

export function upsertScenarioDb(
  input: ScenarioUpsertInput,
  db: DatabaseSync = getDatabase(),
): ApiResult<ScenarioChallenge> {
  const knownCompetencyIds = new Set(listCompetenciesDb(db).map((competency) => competency.id).filter((id) => CANONICAL_COMPETENCY_IDS.has(id)));
  const referenceErrors = validateSkillReferences(knownCompetencyIds, [
    { source: "Scenario " + input.id, skillIds: [input.skillId] },
  ]);
  if (referenceErrors.length > 0) return fail(referenceErrors.join(" "), "validation_error");
  try {
    const now = new Date().toISOString();
    db.prepare(
      `
      INSERT INTO curriculum_scenarios (
        id, skill_id, title, domain_context, situation, constraints_json,
        question, options_json, invalidation_prompt, status, sort_order, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        skill_id = excluded.skill_id,
        title = excluded.title,
        domain_context = excluded.domain_context,
        situation = excluded.situation,
        constraints_json = excluded.constraints_json,
        question = excluded.question,
        options_json = excluded.options_json,
        invalidation_prompt = excluded.invalidation_prompt,
        status = excluded.status,
        sort_order = excluded.sort_order,
        updated_at = excluded.updated_at
    `,
    ).run(
      input.id,
      input.skillId,
      input.title,
      input.domainContext,
      input.situation,
      JSON.stringify(input.constraints),
      input.question,
      JSON.stringify(input.options),
      input.invalidationPrompt,
      input.status,
      input.sortOrder,
      now,
    );
    const saved = listScenariosDb({ includeDrafts: true, db }).find((s) => s.id === input.id);
    if (!saved) return fail("Failed to read back scenario.");
    return ok(saved);
  } catch (e) {
    return fail((e as Error).message || "Failed to save scenario.");
  }
}

export function deleteScenarioDb(
  id: string,
  db: DatabaseSync = getDatabase(),
): ApiResult<{ deleted: boolean }> {
  try {
    const res = db.prepare("DELETE FROM curriculum_scenarios WHERE id = ?").run(id);
    if (res.changes === 0) return fail("Scenario not found.", "not_found");
    return ok({ deleted: true });
  } catch (e) {
    return fail((e as Error).message || "Failed to delete scenario.");
  }
}

export function getActiveCapstoneDb(opts?: {
  includeDrafts?: boolean;
  db?: DatabaseSync;
}): DynamicCapstoneRecord | null {
  const db = opts?.db ?? getDatabase();
  ensureCurriculumSeeded(db);
  const row = (opts?.includeDrafts
    ? db.prepare("SELECT * FROM curriculum_capstones ORDER BY updated_at DESC LIMIT 1").get()
    : db
        .prepare(
          "SELECT * FROM curriculum_capstones WHERE status = 'published' ORDER BY updated_at DESC LIMIT 1",
        )
        .get()) as unknown as Record<string, unknown> | undefined;
  if (!row) return null;
  return {
    id: String(row["id"]),
    version: String(row["version"]),
    title: String(row["title"]),
    summary: String(row["summary"]),
    disclaimer: String(row["disclaimer"]),
    status: String(row["status"]) as PublishStatus,
    changeImpactChallenge: safeParseJson<DynamicCapstoneRecord["changeImpactChallenge"]>(
      String(row["change_impact_json"]),
      CAPSTONE_PROJECT.changeImpactChallenge,
    ),
    milestones: safeParseJson<DynamicCapstoneRecord["milestones"]>(
      String(row["milestones_json"]),
      [],
    ),
  };
}

export function upsertCapstoneDb(
  input: CapstoneUpsertInput,
  db: DatabaseSync = getDatabase(),
): ApiResult<DynamicCapstoneRecord> {
  const knownCompetencyIds = new Set(listCompetenciesDb(db).map((competency) => competency.id).filter((id) => CANONICAL_COMPETENCY_IDS.has(id)));
  const referenceErrors = validateSkillReferences(
    knownCompetencyIds,
    input.milestones.map((milestone) => ({
      source: "Capstone milestone " + milestone.id,
      skillIds: milestone.skillIds,
    })),
  );
  if (referenceErrors.length > 0) return fail(referenceErrors.join(" "), "validation_error");
  try {
    const now = new Date().toISOString();
    db.prepare(
      `
      INSERT INTO curriculum_capstones (
        id, version, title, summary, disclaimer, change_impact_json, milestones_json, status, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        version = excluded.version,
        title = excluded.title,
        summary = excluded.summary,
        disclaimer = excluded.disclaimer,
        change_impact_json = excluded.change_impact_json,
        milestones_json = excluded.milestones_json,
        status = excluded.status,
        updated_at = excluded.updated_at
    `,
    ).run(
      input.id,
      input.version,
      input.title,
      input.summary,
      input.disclaimer,
      JSON.stringify(input.changeImpactChallenge),
      JSON.stringify(input.milestones),
      input.status,
      now,
    );
    const saved = getActiveCapstoneDb({ includeDrafts: true, db });
    if (!saved) return fail("Failed to read back capstone.");
    return ok(saved);
  } catch (e) {
    return fail((e as Error).message || "Failed to save capstone.");
  }
}

export function listRoleProfilesDb(db: DatabaseSync = getDatabase()): RoleProfile[] {
  ensureCurriculumSeeded(db);
  const rows = db
    .prepare("SELECT * FROM curriculum_role_profiles ORDER BY sort_order ASC, id ASC")
    .all() as unknown as Array<Record<string, unknown>>;
  return rows.map((r) => ({
    id: String(r["id"]),
    title: String(r["title"]),
    status: "provisional",
    disclaimer: String(r["disclaimer"]),
    summary: String(r["summary"]),
    requiredLevels: safeParseJson<RoleProfile["requiredLevels"]>(
      String(r["required_levels_json"]),
      {},
    ),
  }));
}

export function upsertRoleProfileDb(
  input: RoleProfileUpsertInput,
  db: DatabaseSync = getDatabase(),
): ApiResult<RoleProfile> {
  const knownCompetencyIds = new Set(listCompetenciesDb(db).map((competency) => competency.id).filter((id) => CANONICAL_COMPETENCY_IDS.has(id)));
  const referenceErrors = validateRoleProfileReferences(
    knownCompetencyIds,
    input.requiredLevels,
    "Role profile " + input.id,
  );
  if (referenceErrors.length > 0) return fail(referenceErrors.join(" "), "validation_error");
  try {
    const now = new Date().toISOString();
    db.prepare(
      `
      INSERT INTO curriculum_role_profiles (
        id, title, status, disclaimer, summary, required_levels_json, sort_order, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        status = excluded.status,
        disclaimer = excluded.disclaimer,
        summary = excluded.summary,
        required_levels_json = excluded.required_levels_json,
        sort_order = excluded.sort_order,
        updated_at = excluded.updated_at
    `,
    ).run(
      input.id,
      input.title,
      input.status,
      input.disclaimer,
      input.summary,
      JSON.stringify(input.requiredLevels),
      input.sortOrder,
      now,
    );
    const saved = listRoleProfilesDb(db).find((r) => r.id === input.id);
    if (!saved) return fail("Failed to read back role profile.");
    return ok(saved);
  } catch (e) {
    return fail((e as Error).message || "Failed to save role profile.");
  }
}

export function deleteRoleProfileDb(
  id: string,
  db: DatabaseSync = getDatabase(),
): ApiResult<{ deleted: boolean }> {
  try {
    const res = db.prepare("DELETE FROM curriculum_role_profiles WHERE id = ?").run(id);
    if (res.changes === 0) return fail("Role profile not found.", "not_found");
    return ok({ deleted: true });
  } catch (e) {
    return fail((e as Error).message || "Failed to delete role profile.");
  }
}

/**
 * Atomic course bundle ingestion: validates competency DAG acyclicity across
 * existing + incoming competencies, then imports course, modules, lessons,
 * competencies, labs, and scenarios in a single transaction.
 */
export function importCourseBundleDb(
  bundle: CourseBundleInput,
  actorUserId: string,
  db: DatabaseSync = getDatabase(),
): ApiResult<{
  courseId: string;
  courseSlug: string;
  moduleCount: number;
  lessonCount: number;
  competencyCount: number;
  labCount: number;
  scenarioCount: number;
}> {
  const existing = listCompetenciesDb(db);
  const integrityErrors = validateCourseBundleReferences(bundle, existing, CANONICAL_COMPETENCY_IDS);
  if (integrityErrors.length > 0) {
    return fail(integrityErrors.join(" "), "validation_error");
  }
  if (bundle.competencies && bundle.competencies.length > 0) {
    const incomingIds = new Set(bundle.competencies.map((c) => c.id));
    const combined = [
      ...existing
        .filter((c) => !incomingIds.has(c.id))
        .map((c) => ({ id: c.id, prerequisites: c.prerequisites })),
      ...bundle.competencies.map((c) => ({ id: c.id, prerequisites: c.prerequisites })),
    ];
    const cycles = detectCompetencyCycles(combined);
    if (cycles.length > 0) {
      return fail(`Bundle rejected due to competency cycle: ${cycles[0]}`, "cycle_detected");
    }
  }

  try {
    db.exec("BEGIN IMMEDIATE;");
    const now = new Date().toISOString();

    // Upsert competencies first so skills exist before lessons/labs reference them
    for (const comp of bundle.competencies ?? []) {
      const crosswalkPayload = comp.crosswalk
        ? JSON.stringify({ neetCompetencyId: comp.id, ...comp.crosswalk })
        : null;
      db.prepare(
        `
        INSERT INTO curriculum_competencies (
          id, code, domain, title, blurb, definition, bloom_target,
          prerequisites_json, relations_json, framework_anchors_json,
          level_descriptors_json, mapped_volumes_json, role_tags_json,
          crosswalk_json, version, sort_order, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          code = excluded.code, domain = excluded.domain, title = excluded.title,
          blurb = excluded.blurb, definition = excluded.definition, bloom_target = excluded.bloom_target,
          prerequisites_json = excluded.prerequisites_json, relations_json = excluded.relations_json,
          framework_anchors_json = excluded.framework_anchors_json,
          level_descriptors_json = excluded.level_descriptors_json,
          mapped_volumes_json = excluded.mapped_volumes_json, role_tags_json = excluded.role_tags_json,
          crosswalk_json = excluded.crosswalk_json, version = excluded.version,
          sort_order = excluded.sort_order, updated_at = excluded.updated_at
      `,
      ).run(
        comp.id,
        comp.code,
        comp.domain,
        comp.title,
        comp.blurb,
        comp.definition,
        comp.bloomTarget,
        JSON.stringify(comp.prerequisites),
        JSON.stringify(comp.relations),
        JSON.stringify(comp.frameworkAnchors),
        JSON.stringify(comp.levelDescriptors),
        JSON.stringify(comp.mappedVolumes),
        JSON.stringify(comp.roleTags),
        crosswalkPayload,
        comp.version,
        comp.sortOrder,
        now,
      );
    }

    // Upsert course
    const existingCourse = db
      .prepare("SELECT id FROM courses WHERE slug = ?")
      .get(bundle.course.slug) as { id: string } | undefined;
    const courseId = existingCourse?.id ?? bundle.course.id ?? `course-${bundle.course.slug}`;

    if (existingCourse) {
      db.prepare(
        `
        UPDATE courses
        SET discipline = ?, title = ?, tagline = ?, level = ?, status = ?,
            about_json = ?, outcomes_json = ?, artifact = ?, sort_order = ?,
            version = version + 1, updated_by = ?, updated_at = ?
        WHERE id = ?
      `,
      ).run(
        bundle.course.discipline,
        bundle.course.title,
        bundle.course.tagline,
        bundle.course.level,
        bundle.course.status,
        JSON.stringify(bundle.course.about),
        JSON.stringify(bundle.course.outcomes),
        bundle.course.artifact,
        bundle.course.sortOrder,
        actorUserId,
        now,
        courseId,
      );
      // Replace course modules/lessons cleanly to match bundle structure
      db.prepare("DELETE FROM course_modules WHERE course_id = ?").run(courseId);
    } else {
      db.prepare(
        `
        INSERT INTO courses (
          id, slug, discipline, title, tagline, level, status,
          about_json, outcomes_json, artifact, sort_order, version, created_by, updated_by, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?)
      `,
      ).run(
        courseId,
        bundle.course.slug,
        bundle.course.discipline,
        bundle.course.title,
        bundle.course.tagline,
        bundle.course.level,
        bundle.course.status,
        JSON.stringify(bundle.course.about),
        JSON.stringify(bundle.course.outcomes),
        bundle.course.artifact,
        bundle.course.sortOrder,
        actorUserId,
        actorUserId,
        now,
        now,
      );
    }

    let lessonCount = 0;
    bundle.modules.forEach((mod, mIdx) => {
      const moduleId = mod.id ?? `mod-${bundle.course.slug}-${mod.slug}`;
      db.prepare(
        `
        INSERT INTO course_modules (id, course_id, slug, title, summary, sort_order, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      ).run(
        moduleId,
        courseId,
        mod.slug,
        mod.title,
        mod.summary,
        mod.sortOrder ?? (mIdx + 1) * 10,
        now,
        now,
      );

      mod.lessons.forEach((les, lIdx) => {
        lessonCount++;
        const lessonId = les.id ?? `les-${bundle.course.slug}-${les.slug}`;
        db.prepare(
          `
          INSERT INTO course_lessons (
            id, module_id, course_id, slug, title, summary, minutes,
            skill_ids_json, blocks_json, keep_json, status, sort_order, version, updated_by, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
        `,
        ).run(
          lessonId,
          moduleId,
          courseId,
          les.slug,
          les.title,
          les.summary,
          les.minutes,
          JSON.stringify(les.skillIds),
          JSON.stringify(les.blocks),
          JSON.stringify(les.keep),
          les.status,
          les.sortOrder || (lIdx + 1) * 10,
          actorUserId,
          now,
          now,
        );
      });
    });

    for (const lab of bundle.labs ?? []) {
      db.prepare(
        `
        INSERT INTO curriculum_labs (
          id, discipline, skill_id, title, brief, minutes, steps_json,
          twist, artifact, evidence_type, rubric_json, status, sort_order, version, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
        ON CONFLICT(id) DO UPDATE SET
          discipline = excluded.discipline, skill_id = excluded.skill_id, title = excluded.title,
          brief = excluded.brief, minutes = excluded.minutes, steps_json = excluded.steps_json,
          twist = excluded.twist, artifact = excluded.artifact, evidence_type = excluded.evidence_type,
          rubric_json = excluded.rubric_json, status = excluded.status, sort_order = excluded.sort_order,
          version = curriculum_labs.version + 1, updated_at = excluded.updated_at
      `,
      ).run(
        lab.id,
        lab.discipline,
        lab.skillId,
        lab.title,
        lab.brief,
        lab.minutes,
        JSON.stringify(lab.steps),
        lab.twist,
        lab.artifact,
        lab.evidenceType,
        JSON.stringify(lab.rubric),
        lab.status,
        lab.sortOrder,
        now,
      );
    }

    for (const scen of bundle.scenarios ?? []) {
      db.prepare(
        `
        INSERT INTO curriculum_scenarios (
          id, skill_id, title, domain_context, situation, constraints_json,
          question, options_json, invalidation_prompt, status, sort_order, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          skill_id = excluded.skill_id, title = excluded.title, domain_context = excluded.domain_context,
          situation = excluded.situation, constraints_json = excluded.constraints_json,
          question = excluded.question, options_json = excluded.options_json,
          invalidation_prompt = excluded.invalidation_prompt, status = excluded.status,
          sort_order = excluded.sort_order, updated_at = excluded.updated_at
      `,
      ).run(
        scen.id,
        scen.skillId,
        scen.title,
        scen.domainContext,
        scen.situation,
        JSON.stringify(scen.constraints),
        scen.question,
        JSON.stringify(scen.options),
        scen.invalidationPrompt,
        scen.status,
        scen.sortOrder,
        now,
      );
    }

    db.exec("COMMIT;");
    return ok({
      courseId,
      courseSlug: bundle.course.slug,
      moduleCount: bundle.modules.length,
      lessonCount,
      competencyCount: bundle.competencies?.length ?? 0,
      labCount: bundle.labs?.length ?? 0,
      scenarioCount: bundle.scenarios?.length ?? 0,
    });
  } catch (e) {
    try {
      db.exec("ROLLBACK;");
    } catch {
      /* ignore */
    }
    return fail((e as Error).message || "Atomic course bundle import failed.");
  }
}

export function exportCourseBundleDb(
  courseSlug: string,
  db: DatabaseSync = getDatabase(),
): ApiResult<CourseBundleInput> {
  const course = getCourseBySlugDb(courseSlug, { includeDrafts: true, db });
  if (!course) return fail(`Course "${courseSlug}" not found.`, "not_found");

  const skillIds = new Set<string>();
  for (const mod of course.modules) {
    for (const les of mod.lessons) {
      for (const sid of les.skillIds) skillIds.add(sid);
    }
  }

  const allCompetencies = listCompetenciesDb(db);
  const competencies = allCompetencies.filter((c) => skillIds.has(c.id));
  const labs = listLabsDb({ includeDrafts: true, db }).filter((l) => skillIds.has(l.skillId));
  const scenarios = listScenariosDb({ includeDrafts: true, db }).filter((s) =>
    skillIds.has(s.skillId),
  );

  return ok({
    schemaVersion: "1.0",
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
    ...(competencies.length > 0
      ? {
          competencies: competencies.map((c) => ({
            id: c.id,
            code: c.code,
            domain: c.domain,
            title: c.title,
            blurb: c.blurb,
            definition: c.definition,
            bloomTarget: c.bloomTarget,
            prerequisites: c.prerequisites,
            relations: c.relations,
            frameworkAnchors: c.frameworkAnchors,
            levelDescriptors: c.levelDescriptors,
            mappedVolumes: c.mappedVolumes,
            roleTags: c.roleTags,
            version: c.version,
            sortOrder: c.sortOrder,
            ...(c.crosswalk
              ? {
                  crosswalk: {
                    incoseCompetencyId: c.crosswalk.incoseCompetencyId,
                    incoseDomain: c.crosswalk.incoseDomain,
                    incoseTitle: c.crosswalk.incoseTitle,
                    mappingType: c.crosswalk.mappingType,
                    rationale: c.crosswalk.rationale,
                    indicatorRefs: c.crosswalk.indicatorRefs,
                    sourceEdition: c.crosswalk.sourceEdition,
                    reviewedAt: c.crosswalk.reviewedAt,
                  },
                }
              : {}),
          })),
        }
      : {}),
    ...(labs.length > 0
      ? {
          labs: labs.map((l) => ({
            id: l.id,
            discipline: l.discipline,
            skillId: l.skillId,
            title: l.title,
            brief: l.brief,
            minutes: l.minutes,
            steps: l.steps,
            twist: l.twist,
            artifact: l.artifact,
            evidenceType: l.evidenceType,
            rubric: l.rubric,
            status: l.status,
            sortOrder: l.sortOrder,
          })),
        }
      : {}),
    ...(scenarios.length > 0
      ? {
          scenarios: scenarios.map((s, idx) => ({
            ...s,
            status: "published" as const,
            sortOrder: (idx + 1) * 10,
          })),
        }
      : {}),
  });
}
