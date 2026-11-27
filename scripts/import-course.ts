/**
 * Dynamic Course Bundle CLI Importer & Exporter
 *
 * Usage:
 *   npm run import:course -- --file docs/curriculum/COURSE_BUNDLE_TEMPLATE.json --dry-run
 *   npm run import:course -- --file my-course.json
 *   npm run import:course -- --export custom-distributed-observability --out exported.json
 *
 * Validates every bundle strictly via `courseBundleSchema` (Zod), checks competency DAG
 * acyclicity, and imports atomically into SQLite (or exports any stored course to JSON).
 */
import fs from "node:fs";
import path from "node:path";
import type { DatabaseSync } from "node:sqlite";
import {
  courseBundleSchema,
  detectCompetencyCycles,
  type CourseBundleInput,
} from "../src/lib/neet/curriculum-schemas.ts";
import { getDatabase } from "../src/lib/neet/db.server.ts";

function parseArgs(argv: string[]) {
  const args: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;
    if (a === "--dry-run") {
      args["dryRun"] = true;
    } else if (a === "--file" && argv[i + 1]) {
      args["file"] = argv[++i]!;
    } else if (a === "--export" && argv[i + 1]) {
      args["exportSlug"] = argv[++i]!;
    } else if (a === "--out" && argv[i + 1]) {
      args["out"] = argv[++i]!;
    } else if (a === "--actor" && argv[i + 1]) {
      args["actor"] = argv[++i]!;
    } else if (a === "--help" || a === "-h") {
      args["help"] = true;
    }
  }
  return args;
}

function printUsage() {
  console.log(`Course Bundle CLI (Dynamic Database Curriculum)

Import a course bundle JSON into the database:
  npm run import:course -- --file <path.json> [--dry-run] [--actor <id>]

Export an existing course from the database to portable JSON:
  npm run import:course -- --export <course-slug> [--out <path.json>]

Tip: Set NEET_SKIP_DEFAULT_CURRICULUM_SEED=1 to run against a blank database with only your own courses.
`);
}

function safeJson<T>(raw: unknown, fallback: T): T {
  if (typeof raw !== "string" || !raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function importBundleAtomic(db: DatabaseSync, bundle: CourseBundleInput, actor: string) {
  const existingComps = db
    .prepare("SELECT id, prerequisites_json FROM curriculum_competencies")
    .all() as Array<{ id: string; prerequisites_json: string }>;

  if (bundle.competencies && bundle.competencies.length > 0) {
    const incomingIds = new Set(bundle.competencies.map((c) => c.id));
    const combined = [
      ...existingComps
        .filter((c) => !incomingIds.has(c.id))
        .map((c) => ({ id: c.id, prerequisites: safeJson<string[]>(c.prerequisites_json, []) })),
      ...bundle.competencies.map((c) => ({ id: c.id, prerequisites: c.prerequisites })),
    ];
    const cycles = detectCompetencyCycles(combined);
    if (cycles.length > 0) {
      throw new Error(`Competency DAG cycle detected: ${cycles[0]}`);
    }
  }

  const now = new Date().toISOString();
  db.exec("BEGIN IMMEDIATE;");
  try {
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
        actor,
        now,
        courseId,
      );
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
        actor,
        actor,
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
          actor,
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
    return {
      courseId,
      courseSlug: bundle.course.slug,
      moduleCount: bundle.modules.length,
      lessonCount,
      competencyCount: bundle.competencies?.length ?? 0,
      labCount: bundle.labs?.length ?? 0,
      scenarioCount: bundle.scenarios?.length ?? 0,
    };
  } catch (err) {
    try {
      db.exec("ROLLBACK;");
    } catch {
      /* ignore */
    }
    throw err;
  }
}

function exportBundle(db: DatabaseSync, slug: string): CourseBundleInput {
  const course = db.prepare("SELECT * FROM courses WHERE slug = ?").get(slug) as
    Record<string, unknown> | undefined;
  if (!course) throw new Error(`Course "${slug}" not found in database.`);

  const mods = db
    .prepare("SELECT * FROM course_modules WHERE course_id = ? ORDER BY sort_order ASC")
    .all(String(course["id"])) as Array<Record<string, unknown>>;
  const lessons = db
    .prepare("SELECT * FROM course_lessons WHERE course_id = ? ORDER BY sort_order ASC")
    .all(String(course["id"])) as Array<Record<string, unknown>>;

  return {
    schemaVersion: "1.0",
    course: {
      id: String(course["id"]),
      slug: String(course["slug"]),
      discipline: String(course["discipline"]) as CourseBundleInput["course"]["discipline"],
      title: String(course["title"]),
      tagline: String(course["tagline"]),
      level: String(course["level"]) as CourseBundleInput["course"]["level"],
      status: String(course["status"]) as CourseBundleInput["course"]["status"],
      about: safeJson<string[]>(course["about_json"], []),
      outcomes: safeJson<string[]>(course["outcomes_json"], []),
      artifact: String(course["artifact"]),
      sortOrder: Number(course["sort_order"] ?? 100),
    },
    modules: mods.map((m) => ({
      id: String(m["id"]),
      slug: String(m["slug"]),
      title: String(m["title"]),
      summary: String(m["summary"] ?? ""),
      sortOrder: Number(m["sort_order"] ?? 0),
      lessons: lessons
        .filter((l) => String(l["module_id"]) === String(m["id"]))
        .map((l) => ({
          id: String(l["id"]),
          slug: String(l["slug"]),
          title: String(l["title"]),
          summary: String(l["summary"]),
          minutes: Number(l["minutes"] ?? 10),
          skillIds: safeJson<string[]>(l["skill_ids_json"], []),
          blocks: safeJson(l["blocks_json"], []),
          keep: safeJson<string[]>(l["keep_json"], []),
          status: String(l["status"]) as "draft" | "published" | "archived",
          sortOrder: Number(l["sort_order"] ?? 0),
        })),
    })),
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args["help"] || (!args["file"] && !args["exportSlug"])) {
    printUsage();
    process.exit(args["help"] ? 0 : 1);
  }

  if (typeof args["exportSlug"] === "string") {
    const db = getDatabase();
    const exported = exportBundle(db, args["exportSlug"]);
    const json = JSON.stringify(exported, null, 2) + "\n";
    if (typeof args["out"] === "string") {
      const target = path.resolve(process.cwd(), args["out"]);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, json, "utf-8");
      console.log(`Exported course "${args["exportSlug"]}" to ${target}`);
    } else {
      process.stdout.write(json);
    }
    process.exit(0);
  }

  const filePath = path.resolve(process.cwd(), String(args["file"]));
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch (err) {
    console.error(`Invalid JSON in ${filePath}: ${(err as Error).message}`);
    process.exit(1);
  }

  const validation = courseBundleSchema.safeParse(parsedJson);
  if (!validation.success) {
    console.error("Schema validation failed:");
    for (const issue of validation.error.issues) {
      console.error(`  - ${issue.path.join(".") || "(root)"}: ${issue.message}`);
    }
    process.exit(1);
  }

  const bundle = validation.data;
  if (bundle.competencies && bundle.competencies.length > 0) {
    const cycles = detectCompetencyCycles(
      bundle.competencies.map((c) => ({ id: c.id, prerequisites: c.prerequisites })),
    );
    if (cycles.length > 0) {
      console.error("Competency DAG validation failed:");
      for (const c of cycles) console.error(`  - ${c}`);
      process.exit(1);
    }
  }

  const totalLessons = bundle.modules.reduce((acc, m) => acc + m.lessons.length, 0);
  if (args["dryRun"]) {
    console.log(
      `[DRY RUN OK] Valid course bundle "${bundle.course.slug}" (${bundle.course.title}): ` +
        `${bundle.modules.length} module(s), ${totalLessons} lesson(s), ` +
        `${bundle.competencies?.length ?? 0} competency(ies), ` +
        `${bundle.labs?.length ?? 0} lab(s), ${bundle.scenarios?.length ?? 0} scenario(s).`,
    );
    process.exit(0);
  }

  const db = getDatabase();
  const actor = typeof args["actor"] === "string" ? args["actor"] : "cli-importer";
  const summary = importBundleAtomic(db, bundle, actor);
  console.log(
    `Imported course "${summary.courseSlug}" (id=${summary.courseId}): ` +
      `${summary.moduleCount} module(s), ${summary.lessonCount} lesson(s), ` +
      `${summary.competencyCount} competency(ies), ${summary.labCount} lab(s), ` +
      `${summary.scenarioCount} scenario(s).`,
  );
}

main();
