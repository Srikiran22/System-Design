// @vitest-environment node
import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { initTablesSync } from "./db.server";
import {
  deleteCompetencyDb,
  deleteCourseDb,
  exportCourseBundleDb,
  getCourseBySlugDb,
  getLessonBySlugDb,
  importCourseBundleDb,
  listCompetenciesDb,
  listCoursesDb,
  listLabsDb,
  listScenariosDb,
  setCourseStatusDb,
  upsertCompetencyDb,
  upsertCourseDb,
  upsertLabDb,
  upsertLessonDb,
  upsertModuleDb,
} from "./curriculum-db.server";
import {
  competencyUpsertSchema,
  courseBundleSchema,
  detectCompetencyCycles,
  labUpsertSchema,
  scenarioUpsertSchema,
} from "./curriculum-schemas";
import { validateCompetencyGraphReferences } from "./curriculum-integrity";

function createTestDb(): DatabaseSync {
  const db = new DatabaseSync(":memory:");
  db.exec("PRAGMA foreign_keys = ON;");
  initTablesSync(db);
  return db;
}

function makeValidCompetency(id: string, prerequisites: string[] = []) {
  return {
    id,
    code: `SE-${id.toUpperCase()}`,
    domain: "design" as const,
    title: `Skill ${id}`,
    blurb: `Concise summary for ${id}`,
    definition: `Observable engineering capability definition for ${id}.`,
    bloomTarget: "analyze" as const,
    prerequisites,
    relations: [],
    frameworkAnchors: [],
    levelDescriptors: [
      {
        level: 1 as const,
        stage: "Search" as const,
        observableOutcome: "Identify basic patterns.",
        requiredEvidence: ["quiz" as const],
      },
      {
        level: 2 as const,
        stage: "Know" as const,
        observableOutcome: "Explain causal tradeoffs.",
        requiredEvidence: ["quiz" as const, "explain" as const],
      },
      {
        level: 3 as const,
        stage: "Adapt" as const,
        observableOutcome: "Apply under constraint twists.",
        requiredEvidence: ["lab" as const],
      },
      {
        level: 4 as const,
        stage: "Proceed" as const,
        observableOutcome: "Ship verifiable architecture artifact.",
        requiredEvidence: ["artifact" as const],
      },
    ] as [
      { level: 1; stage: "Search"; observableOutcome: string; requiredEvidence: "quiz"[] },
      {
        level: 2;
        stage: "Know";
        observableOutcome: string;
        requiredEvidence: ("quiz" | "explain")[];
      },
      { level: 3; stage: "Adapt"; observableOutcome: string; requiredEvidence: "lab"[] },
      { level: 4; stage: "Proceed"; observableOutcome: string; requiredEvidence: "artifact"[] },
    ],
    mappedVolumes: [],
    roleTags: ["Architect"],
    version: "2.0.0",
    sortOrder: 10,
  };
}

describe("dynamic database-backed curriculum engine", () => {
  const prevSkip = process.env["NEET_SKIP_DEFAULT_CURRICULUM_SEED"];

  beforeEach(() => {
    process.env["NEET_SKIP_DEFAULT_CURRICULUM_SEED"] = "1";
  });

  afterEach(() => {
    if (prevSkip === undefined) delete process.env["NEET_SKIP_DEFAULT_CURRICULUM_SEED"];
    else process.env["NEET_SKIP_DEFAULT_CURRICULUM_SEED"] = prevSkip;
  });

  it("starts completely blank when NEET_SKIP_DEFAULT_CURRICULUM_SEED=1 (zero hardcoded lock-in)", () => {
    const db = createTestDb();
    expect(listCoursesDb({ includeDrafts: true, db })).toEqual([]);
    expect(listCompetenciesDb(db)).toEqual([]);
    expect(listLabsDb({ includeDrafts: true, db })).toEqual([]);
    expect(listScenariosDb({ includeDrafts: true, db })).toEqual([]);
  });

  it("supports full course -> module -> lesson CRUD, draft isolation, publish, and cascade delete", () => {
    const db = createTestDb();

    const created = upsertCourseDb(
      {
        slug: "custom-systems-101",
        discipline: "engineering",
        title: "Custom Systems 101",
        tagline: "Author-defined engineering track.",
        level: "Intermediate",
        status: "draft",
        about: ["Custom course added dynamically into the database."],
        outcomes: ["Design modular control systems."],
        artifact: "Custom architecture decision dossier.",
        sortOrder: 10,
      },
      "author-1",
      db,
    );
    expect(created.error).toBeNull();
    expect(created.data?.status).toBe("draft");

    // Draft courses MUST NOT appear in public reads
    expect(listCoursesDb({ includeDrafts: false, db })).toHaveLength(0);
    expect(getCourseBySlugDb("custom-systems-101", { includeDrafts: false, db })).toBeNull();
    // Authors can inspect drafts
    expect(listCoursesDb({ includeDrafts: true, db })).toHaveLength(1);

    const mod = upsertModuleDb(
      {
        courseId: created.data!.id,
        slug: "mod-foundations",
        title: "Foundations",
        summary: "Core foundations.",
        sortOrder: 10,
      },
      db,
    );
    expect(mod.error).toBeNull();

    const missingSkillLesson = upsertLessonDb(
      {
        courseId: created.data!.id,
        moduleId: mod.data!.id,
        slug: "missing-skill",
        title: "Missing Skill",
        summary: "This mapping must fail.",
        minutes: 10,
        skillIds: ["missing-skill"],
        blocks: [{ t: "p", text: "This should not be stored." }],
        keep: [],
        status: "published",
        sortOrder: 5,
      },
      "author-1",
      db,
    );
    expect(missingSkillLesson.errorCode).toBe("validation_error");

    delete process.env["NEET_SKIP_DEFAULT_CURRICULUM_SEED"];
    expect(listCompetenciesDb(db).some((competency) => competency.id === "st-stocks")).toBe(true);
    process.env["NEET_SKIP_DEFAULT_CURRICULUM_SEED"] = "1";

    const les = upsertLessonDb(
      {
        courseId: created.data!.id,
        moduleId: mod.data!.id,
        slug: "first-lesson",
        title: "First Dynamic Lesson",
        summary: "Loaded directly from database.",
        minutes: 10,
        skillIds: ["st-stocks"],
        blocks: [
          { t: "h2", text: "Overview" },
          { t: "p", text: "Everything in this lesson is stored dynamically in SQLite/Supabase." },
        ],
        keep: ["Never hardcode course content."],
        status: "published",
        sortOrder: 10,
      },
      "author-1",
      db,
    );
    expect(les.error).toBeNull();

    // Storage-level checks protect existing rows even when a caller bypasses the service layer.
    expect(() =>
      db.prepare(
        "INSERT INTO curriculum_labs (id, discipline, skill_id, title, brief, minutes, steps_json, twist, artifact, evidence_type, rubric_json, status, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      ).run(
        "lab-orphan",
        "design",
        "missing-skill",
        "Orphan Lab",
        "Invalid skill reference.",
        10,
        "[]",
        "Constraint twist.",
        "Artifact",
        "lab",
        "{}",
        "draft",
        1,
      ),
    ).toThrow(/unknown canonical competency/);
    expect(() =>
      db.prepare(
        "INSERT INTO curriculum_scenarios (id, skill_id, title, domain_context, situation, constraints_json, question, options_json, invalidation_prompt, status, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      ).run(
        "scenario-orphan",
        "missing-skill",
        "Orphan Scenario",
        "Test",
        "Invalid reference.",
        "[]",
        "Question?",
        "[]",
        "What invalidates it?",
        "draft",
        1,
      ),
    ).toThrow(/unknown canonical competency/);
    expect(() =>
      db.prepare("DELETE FROM curriculum_competencies WHERE id = ?").run("st-stocks"),
    ).toThrow(/Competency is still referenced/);

    // Publish course -> now visible publicly with lesson navigation
    const pub = setCourseStatusDb(created.data!.id, "published", "author-1", db);
    expect(pub.error).toBeNull();
    expect(listCoursesDb({ includeDrafts: false, db })).toHaveLength(1);

    const fetchedLesson = getLessonBySlugDb("custom-systems-101", "first-lesson", { db });
    expect(fetchedLesson?.lesson.title).toBe("First Dynamic Lesson");
    expect(fetchedLesson?.prev).toBeNull();
    expect(fetchedLesson?.next).toBeNull();

    // Deleting course cascades modules and lessons cleanly
    const del = deleteCourseDb(created.data!.id, db);
    expect(del.data?.deleted).toBe(true);
    expect(getCourseBySlugDb("custom-systems-101", { includeDrafts: true, db })).toBeNull();
  });

  it("detects circular prerequisite graphs and dangling references", () => {
    const cycles = detectCompetencyCycles([
      { id: "comp-a", prerequisites: ["comp-b"] },
      { id: "comp-b", prerequisites: ["comp-a"] },
    ]);
    expect(cycles).toHaveLength(1);

    const dangling = validateCompetencyGraphReferences(
      [{ id: "sd-reliability", prerequisites: [] }],
      [{ id: "sd-reliability", prerequisites: ["missing-skill"] }],
    );
    expect(dangling).toHaveLength(1);
    expect(dangling[0]).toContain("unknown prerequisite");
  });

  it("rejects lab rubrics whose criterion weights do not sum to 1.0 and scenarios without an optimal option", () => {
    const badLab = labUpsertSchema.safeParse({
      id: "lab-bad-weights",
      discipline: "design",
      skillId: "sd-data",
      title: "Invalid Weight Lab",
      brief: "Rubric weights sum to 0.6 instead of 1.0.",
      minutes: 20,
      steps: ["Do step one carefully."],
      twist: "Handle sudden 10x burst load.",
      artifact: "Architecture diagram.",
      evidenceType: "lab",
      rubric: {
        id: "r-bad",
        version: "1.0",
        passThreshold: 0.7,
        criteria: [
          {
            id: "c1",
            label: "Criterion 1",
            weight: 0.3,
            rationale: "Valid rationale text.",
            evidenceRequired: "Required proof text.",
            typicalFailureModes: ["Missing proof"],
            descriptors: {
              1: "Level 1 text.",
              2: "Level 2 text.",
              3: "Level 3 text.",
              4: "Level 4 text.",
            },
            revisionHint: "Add concrete numbers.",
          },
          {
            id: "c2",
            label: "Criterion 2",
            weight: 0.3,
            rationale: "Valid rationale text.",
            evidenceRequired: "Required proof text.",
            typicalFailureModes: ["Missing proof"],
            descriptors: {
              1: "Level 1 text.",
              2: "Level 2 text.",
              3: "Level 3 text.",
              4: "Level 4 text.",
            },
            revisionHint: "Add concrete numbers.",
          },
        ],
      },
    });
    expect(badLab.success).toBe(false);

    const badScenario = scenarioUpsertSchema.safeParse({
      id: "scen-no-optimal",
      skillId: "sd-data",
      title: "Broken Scenario",
      domainContext: "Testing",
      situation: "A scenario missing any option with score 1.",
      constraints: ["Must stay under 50ms p99."],
      question: "Which option wins?",
      options: [
        {
          id: "a",
          label: "Option A choice",
          score: 0.5,
          tradeoff: "Some tradeoff",
          feedback: "Partial credit only.",
        },
        {
          id: "b",
          label: "Option B choice",
          score: 0.2,
          tradeoff: "Other tradeoff",
          feedback: "Low score.",
        },
      ],
      invalidationPrompt: "What would invalidate this choice?",
    });
    expect(badScenario.success).toBe(false);
  });

  it("rejects unknown competency edges and keeps the canonical 16-skill model immutable", () => {
    const db = createTestDb();
    delete process.env["NEET_SKIP_DEFAULT_CURRICULUM_SEED"];
    expect(listCompetenciesDb(db).some((competency) => competency.id === "sd-reliability")).toBe(true);
    process.env["NEET_SKIP_DEFAULT_CURRICULUM_SEED"] = "1";

    const unsupported = upsertCompetencyDb(makeValidCompetency("sd-observability-slo"), db);
    expect(unsupported.errorCode).toBe("validation_error");

    const deletion = deleteCompetencyDb("sd-reliability", db);
    expect(deletion.errorCode).toBe("conflict");
  });

  it("requires ordered Search, Know, Adapt, Proceed competency descriptors", () => {
    const valid = makeValidCompetency("bad-stage-order");
    const swapped = {
      ...valid,
      levelDescriptors: [
        valid.levelDescriptors[1],
        valid.levelDescriptors[0],
        valid.levelDescriptors[2],
        valid.levelDescriptors[3],
      ],
    };
    expect(competencyUpsertSchema.safeParse(swapped).success).toBe(false);
  });

  it("imports and round-trip exports the official COURSE_BUNDLE_TEMPLATE.json atomically", () => {
    const db = createTestDb();
    // The portable template references the starter sd-reliability competency.
    delete process.env["NEET_SKIP_DEFAULT_CURRICULUM_SEED"];
    expect(listCompetenciesDb(db).some((c) => c.id === "sd-reliability")).toBe(true);
    process.env["NEET_SKIP_DEFAULT_CURRICULUM_SEED"] = "1";
    const tplPath = path.resolve(process.cwd(), "docs/curriculum/COURSE_BUNDLE_TEMPLATE.json");
    const raw = JSON.parse(fs.readFileSync(tplPath, "utf-8"));
    const parsed = courseBundleSchema.parse(raw);

    const danglingBundle = {
      ...parsed,
      labs: [{ ...parsed.labs![0]!, skillId: "missing-skill" }],
    };
    const rejectedBundle = importCourseBundleDb(danglingBundle, "author-template", db);
    expect(rejectedBundle.errorCode).toBe("validation_error");

    const invalidLab = upsertLabDb(
      { ...parsed.labs![0]!, skillId: "missing-skill" },
      db,
    );
    expect(invalidLab.errorCode).toBe("validation_error");

    const imported = importCourseBundleDb(parsed, "author-template", db);
    expect(imported.error).toBeNull();
    expect(imported.data?.courseSlug).toBe("custom-distributed-observability");
    expect(imported.data?.moduleCount).toBe(1);
    expect(imported.data?.lessonCount).toBe(1);
    expect(imported.data?.competencyCount).toBe(0);
    expect(imported.data?.labCount).toBe(1);

    const exported = exportCourseBundleDb("custom-distributed-observability", db);
    expect(exported.error).toBeNull();
    expect(courseBundleSchema.safeParse(exported.data).success).toBe(true);
    expect(exported.data?.labs?.[0]?.id).toBe("lab-slo-burn-design");

    // Verify dynamic lab upsert also works cleanly
    const updatedLab = upsertLabDb(
      { ...parsed.labs![0]!, title: "Updated SLO Burn Design Lab" },
      db,
    );
    expect(updatedLab.data?.title).toBe("Updated SLO Burn Design Lab");
    expect(updatedLab.data?.version).toBe(2);
  });
});
