import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { DatabaseSync } from "node:sqlite";

export type ArticleListItem = {
  slug: string;
  number: number | null;
  title: string;
  track: string;
  track_order: number;
  summary: string;
  word_count: number;
};

export type ArticleDetail = {
  slug: string;
  filename: string;
  number: number | null;
  title: string;
  track: string;
  track_order: number;
  summary: string;
  body: string;
  word_count: number;
};

export type ArticleNav = {
  slug: string;
  title: string;
  number: number | null;
  track_order: number;
};

export type SourceRecord = {
  sort: number;
  source_id: string;
  title: string;
  url: string | null;
  source_type: string | null;
  relevance: string | null;
  quality_signal: string | null;
  limitations: string | null;
};

export type PracticePromptRecord = {
  sort: number;
  prompt_id: string;
  exercise: string;
  primary_concepts: string | null;
  required_artifacts: string | null;
};

export type RoleRecord = {
  id: number;
  sort: number;
  role: string;
  career_level: string | null;
  competency_areas: string | null;
  typical_deliverables: string | null;
  source_anchors: string | null;
  portfolio_project: string | null;
};

export type CoverageDeepRecord = {
  id: number;
  sort: number;
  domain: string;
  depth_in_repository: string | null;
  new_deep_volumes: string | null;
  primary_source_anchors: string | null;
  evidence_status: string | null;
  remaining_gap: string | null;
  next_validation_action: string | null;
};

export type CoverageResearchRecord = {
  id: number;
  sort: number;
  domain: string;
  knowledge_files: string | null;
  source_anchors: string | null;
  known_limitations_or_gaps: string | null;
  coverage_status: string | null;
};

export type ScrapeAuditRecord = {
  id: number;
  sort: number;
  research_ref: string | null;
  canonical_source_id: string | null;
  title: string | null;
  url: string | null;
  status: string | null;
  tools: string | null;
  extraction_extent: string | null;
  limitations: string | null;
};

export type UserProfile = {
  display_name: string;
  initials: string;
  signature_seed: number;
  signed_at: string | null;
};

export type UserGoal = {
  id: string;
  text: string;
};

export type UserEvent = {
  kind: string;
  ref: string;
  discipline: string | null;
  occurred_on: string;
};

export type MeData = {
  profile: UserProfile;
  goals: UserGoal[];
  events: UserEvent[];
};

export type ProgressEventInput = {
  kind: string;
  ref: string;
  discipline?: string | null;
  occurred_on: string;
};

export type Result<T> = { data: T; error: null } | { data: null; error: string };

const ok = <T>(data: T): Result<T> => ({ data, error: null });
const fail = (error: string): Result<never> => ({ data: null, error });

function strOrNull(obj: Record<string, string>, key: string): string | null {
  const v = obj[key];
  return v !== undefined && v !== "" ? v : null;
}

function reqStr(obj: Record<string, string>, key: string, fallback = ""): string {
  const v = obj[key];
  return v !== undefined ? v : fallback;
}

/** Parse RFC 4180 CSV text synchronously */
export function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;
  const len = text.length;

  while (i < len) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < len && text[i + 1] === '"') {
          field += '"';
          i += 2;
        } else {
          inQuotes = false;
          i++;
        }
      } else {
        field += char;
        i++;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
        i++;
      } else if (char === ",") {
        row.push(field);
        field = "";
        i++;
      } else if (char === "\r") {
        if (i + 1 < len && text[i + 1] === "\n") i++;
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
        i++;
      } else if (char === "\n") {
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
        i++;
      } else {
        field += char;
        i++;
      }
    }
  }
  if (field || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  if (rows.length === 0 || !rows[0]) return [];
  const headerRow = rows[0];
  const headers = headerRow.map((h) => h.trim());
  const result: Record<string, string>[] = [];
  for (let r = 1; r < rows.length; r++) {
    const values = rows[r];
    if (!values || (values.length === 1 && values[0]?.trim() === "")) continue;
    const obj: Record<string, string> = {};
    for (let c = 0; c < headers.length; c++) {
      const h = headers[c];
      if (h !== undefined) {
        obj[h] = values[c] !== undefined ? (values[c] as string) : "";
      }
    }
    result.push(obj);
  }
  return result;
}

function resolveTrack(n: number | null): [number, string] {
  if (n === null) return [8, "Pack guides"];
  if (n === 0) return [0, "Start here"];
  const ranges: [number, number, number, string][] = [
    [1, 26, 1, "Core foundation"],
    [27, 60, 2, "Advanced expansion"],
    [61, 81, 3, "Deep research"],
    [82, 95, 4, "Expert extension"],
    [96, 102, 5, "Decision & execution"],
    [103, 110, 6, "Fifth-level engineering"],
    [111, 118, 7, "Sixth-level dependability"],
  ];
  for (const [lo, hi, i, name] of ranges) {
    if (n >= lo && n <= hi) return [i, name];
  }
  return [8, "Pack guides"];
}

function getContentPackDir(): string {
  const currentDir = import.meta.dirname ?? process.cwd();
  const candidates = [
    path.join(process.cwd(), "content", "pack"),
    path.resolve(currentDir, "..", "..", "..", "content", "pack"),
    path.resolve(currentDir, "..", "..", "content", "pack"),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return path.join(process.cwd(), "content", "pack");
}

let _db: DatabaseSync | null = null;
let _isMemory = false;

function getDbFilePath(): string {
  if (process.env["SQLITE_DB_PATH"]) return process.env["SQLITE_DB_PATH"];
  const dataDir = path.join(process.cwd(), ".data");
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    return path.join(dataDir, "system_design.sqlite");
  } catch {
    return ":memory:";
  }
}

/** Returns the active synchronous DatabaseSync instance, initializing if needed */
export function getDatabase(): DatabaseSync {
  if (!_db) {
    const dbPath = getDbFilePath();
    try {
      _db = new DatabaseSync(dbPath);
      _isMemory = dbPath === ":memory:";
      if (!_isMemory) {
        _db.exec("PRAGMA journal_mode = WAL;");
        _db.exec("PRAGMA synchronous = NORMAL;");
        _db.exec("PRAGMA busy_timeout = 5000;");
      }
      _db.exec("PRAGMA foreign_keys = ON;");
    } catch (e) {
      console.warn(
        "[db.server] Failed opening file database at",
        dbPath,
        "falling back to :memory:",
        e,
      );
      _isMemory = true;
      _db = new DatabaseSync(":memory:");
      _db.exec("PRAGMA foreign_keys = ON;");
    }
    initTablesSync(_db);
    ensureSeededSync(_db);
  }
  return _db;
}

/** Initialize all table structures synchronously */
export function initTablesSync(db: DatabaseSync): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS articles (
      slug TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      number INTEGER,
      title TEXT NOT NULL,
      track_order INTEGER NOT NULL DEFAULT 0,
      track TEXT NOT NULL,
      summary TEXT NOT NULL DEFAULT '',
      body TEXT NOT NULL,
      word_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS articles_track_idx ON articles(track_order, number);

    CREATE TABLE IF NOT EXISTS sources (
      sort INTEGER NOT NULL DEFAULT 0,
      source_id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      url TEXT,
      source_type TEXT,
      relevance TEXT,
      quality_signal TEXT,
      limitations TEXT
    );

    CREATE TABLE IF NOT EXISTS practice_prompts (
      sort INTEGER NOT NULL DEFAULT 0,
      prompt_id TEXT PRIMARY KEY,
      exercise TEXT NOT NULL,
      primary_concepts TEXT,
      required_artifacts TEXT
    );

    CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sort INTEGER NOT NULL DEFAULT 0,
      role TEXT NOT NULL,
      career_level TEXT,
      competency_areas TEXT,
      typical_deliverables TEXT,
      source_anchors TEXT,
      portfolio_project TEXT
    );

    CREATE TABLE IF NOT EXISTS coverage_deep (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sort INTEGER NOT NULL DEFAULT 0,
      domain TEXT NOT NULL,
      depth_in_repository TEXT,
      new_deep_volumes TEXT,
      primary_source_anchors TEXT,
      evidence_status TEXT,
      remaining_gap TEXT,
      next_validation_action TEXT
    );

    CREATE TABLE IF NOT EXISTS coverage_research (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sort INTEGER NOT NULL DEFAULT 0,
      domain TEXT NOT NULL,
      knowledge_files TEXT,
      source_anchors TEXT,
      known_limitations_or_gaps TEXT,
      coverage_status TEXT
    );

    CREATE TABLE IF NOT EXISTS scrape_audit (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sort INTEGER NOT NULL DEFAULT 0,
      research_ref TEXT,
      canonical_source_id TEXT,
      title TEXT,
      url TEXT,
      status TEXT,
      tools TEXT,
      extraction_extent TEXT,
      limitations TEXT
    );

    CREATE TABLE IF NOT EXISTS pack_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      display_name TEXT NOT NULL DEFAULT '',
      initials TEXT NOT NULL DEFAULT '',
      signature_seed INTEGER NOT NULL DEFAULT 0,
      signed_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS learning_goals (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      text TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS learning_goals_user_id_idx ON learning_goals(user_id);

    CREATE TABLE IF NOT EXISTS progress_events (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      kind TEXT NOT NULL,
      ref TEXT NOT NULL,
      discipline TEXT,
      occurred_on TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, kind, ref)
    );
    CREATE INDEX IF NOT EXISTS progress_events_user_occurred_idx ON progress_events(user_id, occurred_on);

    CREATE VIRTUAL TABLE IF NOT EXISTS articles_fts USING fts5(
      slug UNINDEXED,
      title,
      summary,
      body
    );

    CREATE TABLE IF NOT EXISTS local_auth_users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      display_name TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS learner_evidence (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      idempotency_key TEXT NOT NULL,
      skill_id TEXT NOT NULL,
      evidence_type TEXT NOT NULL,
      ref TEXT NOT NULL,
      score REAL NOT NULL,
      weight REAL NOT NULL,
      confidence REAL,
      verification_tier TEXT NOT NULL DEFAULT 'self-assessed',
      rubric_version TEXT,
      rubric_scores_json TEXT,
      artifact_url TEXT,
      artifact_notes TEXT,
      reviewer_id TEXT,
      reviewed_at TEXT,
      occurred_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, idempotency_key)
    );
    CREATE INDEX IF NOT EXISTS learner_evidence_user_skill_idx ON learner_evidence(user_id, skill_id);

    CREATE TABLE IF NOT EXISTS learner_state_snapshots (
      user_id TEXT PRIMARY KEY,
      state_json TEXT NOT NULL,
      version INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS user_roles (
      user_id TEXT PRIMARY KEY,
      role TEXT NOT NULL CHECK(role IN ('learner','reviewer','author','admin')),
      granted_by TEXT,
      granted_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS audit_log (
      id TEXT PRIMARY KEY,
      actor_user_id TEXT,
      action TEXT NOT NULL,
      resource_type TEXT NOT NULL,
      resource_id TEXT,
      outcome TEXT NOT NULL,
      request_id TEXT,
      meta_json TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS audit_log_created_idx ON audit_log(created_at DESC);

    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      discipline TEXT NOT NULL,
      title TEXT NOT NULL,
      tagline TEXT NOT NULL,
      level TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      about_json TEXT NOT NULL,
      outcomes_json TEXT NOT NULL,
      artifact TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 100,
      version INTEGER NOT NULL DEFAULT 1,
      created_by TEXT,
      updated_by TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS courses_status_sort_idx ON courses(status, sort_order);

    CREATE TABLE IF NOT EXISTS course_modules (
      id TEXT PRIMARY KEY,
      course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      slug TEXT NOT NULL,
      title TEXT NOT NULL,
      summary TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(course_id, slug)
    );
    CREATE INDEX IF NOT EXISTS course_modules_course_sort_idx ON course_modules(course_id, sort_order);

    CREATE TABLE IF NOT EXISTS course_lessons (
      id TEXT PRIMARY KEY,
      module_id TEXT NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
      course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      slug TEXT NOT NULL,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      minutes INTEGER NOT NULL,
      skill_ids_json TEXT NOT NULL,
      blocks_json TEXT NOT NULL,
      keep_json TEXT NOT NULL DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'published',
      sort_order INTEGER NOT NULL DEFAULT 0,
      version INTEGER NOT NULL DEFAULT 1,
      updated_by TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(course_id, slug)
    );
    CREATE INDEX IF NOT EXISTS course_lessons_module_sort_idx ON course_lessons(module_id, sort_order);

    CREATE TABLE IF NOT EXISTS curriculum_competencies (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      domain TEXT NOT NULL,
      title TEXT NOT NULL,
      blurb TEXT NOT NULL,
      definition TEXT NOT NULL,
      bloom_target TEXT NOT NULL,
      prerequisites_json TEXT NOT NULL DEFAULT '[]',
      relations_json TEXT NOT NULL DEFAULT '[]',
      framework_anchors_json TEXT NOT NULL DEFAULT '[]',
      level_descriptors_json TEXT NOT NULL,
      mapped_volumes_json TEXT NOT NULL DEFAULT '[]',
      role_tags_json TEXT NOT NULL DEFAULT '[]',
      crosswalk_json TEXT,
      version TEXT NOT NULL DEFAULT '2.0.0',
      sort_order INTEGER NOT NULL DEFAULT 100,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS curriculum_labs (
      id TEXT PRIMARY KEY,
      discipline TEXT NOT NULL,
      skill_id TEXT NOT NULL,
      title TEXT NOT NULL,
      brief TEXT NOT NULL,
      minutes INTEGER NOT NULL,
      steps_json TEXT NOT NULL,
      twist TEXT NOT NULL,
      artifact TEXT NOT NULL,
      evidence_type TEXT NOT NULL,
      rubric_json TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'published',
      sort_order INTEGER NOT NULL DEFAULT 100,
      version INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS curriculum_labs_status_sort_idx ON curriculum_labs(status, sort_order);

    CREATE TABLE IF NOT EXISTS curriculum_scenarios (
      id TEXT PRIMARY KEY,
      skill_id TEXT NOT NULL,
      title TEXT NOT NULL,
      domain_context TEXT NOT NULL,
      situation TEXT NOT NULL,
      constraints_json TEXT NOT NULL,
      question TEXT NOT NULL,
      options_json TEXT NOT NULL,
      invalidation_prompt TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'published',
      sort_order INTEGER NOT NULL DEFAULT 100,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS curriculum_capstones (
      id TEXT PRIMARY KEY,
      version TEXT NOT NULL DEFAULT '2.0.0',
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      disclaimer TEXT NOT NULL,
      change_impact_json TEXT NOT NULL,
      milestones_json TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'published',
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS curriculum_role_profiles (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'provisional',
      disclaimer TEXT NOT NULL,
      summary TEXT NOT NULL,
      required_levels_json TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 100,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Safe idempotent column additions for pre-existing local SQLite database files
  try {
    db.exec("ALTER TABLE learner_state_snapshots ADD COLUMN version INTEGER NOT NULL DEFAULT 1;");
  } catch {
    /* column already exists */
  }
  try {
    db.exec("ALTER TABLE learner_evidence ADD COLUMN reviewer_id TEXT;");
  } catch {
    /* column already exists */
  }
  try {
    db.exec("ALTER TABLE learner_evidence ADD COLUMN reviewed_at TEXT;");
  } catch {
    /* column already exists */
  }
}

function ensureSeededSync(db: DatabaseSync): void {
  try {
    const row = db.prepare("SELECT COUNT(*) as count FROM articles").get() as
      { count: number } | undefined;
    if (!row || row.count === 0) {
      seedDatabaseSync(db);
    }
  } catch {
    initTablesSync(db);
    seedDatabaseSync(db);
  }
}

export type SeedStats = {
  durationMs: number;
  counts: {
    articles: number;
    sources: number;
    practice_prompts: number;
    roles: number;
    coverage_deep: number;
    coverage_research: number;
    scrape_audit: number;
    pack_meta: number;
  };
};

/** Synchronously loads all pack data from content/pack into SQLite */
export function seedDatabaseSync(db: DatabaseSync, options?: { force?: boolean }): SeedStats {
  const t0 = performance.now();
  const packDir = getContentPackDir();

  initTablesSync(db);

  if (options?.force) {
    db.exec(`
      DELETE FROM articles;
      DELETE FROM sources;
      DELETE FROM practice_prompts;
      DELETE FROM roles;
      DELETE FROM coverage_deep;
      DELETE FROM coverage_research;
      DELETE FROM scrape_audit;
      DELETE FROM pack_meta;
      DELETE FROM articles_fts;
    `);
  }

  db.exec("BEGIN TRANSACTION;");

  // 1. Articles (120 markdown files)
  const files = fs
    .readdirSync(packDir)
    .filter((f) => f.endsWith(".md"))
    .sort();
  const insertArticle = db.prepare(`
    INSERT OR REPLACE INTO articles (slug, filename, number, title, track_order, track, summary, body, word_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertArticleFts = db.prepare(`
    INSERT OR REPLACE INTO articles_fts (slug, title, summary, body)
    VALUES (?, ?, ?, ?)
  `);

  for (const f of files) {
    const body = fs.readFileSync(path.join(packDir, f), "utf-8");
    const m = f.match(/^(\d+)_/);
    const n = m && m[1] ? parseInt(m[1], 10) : null;
    const [trackOrder, trackName] = resolveTrack(n);
    const tm = body.match(/^#\s+(.+)$/m);
    const title =
      tm && tm[1]
        ? tm[1].trim()
        : f
            .slice(0, -3)
            .replace(/_/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());

    let summary = "";
    const paras = body.split(/\n\s*\n/);
    for (const para of paras) {
      const p = para.trim();
      if (p && !/^([#|\-*>`]|```)/.test(p)) {
        summary = p
          .replace(/\]\([^)]*\)/g, "]")
          .replace(/[*_`[\]]/g, "")
          .slice(0, 400);
        break;
      }
    }
    const slug = f
      .slice(0, -3)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const wordCount = body.trim().split(/\s+/).filter(Boolean).length;

    insertArticle.run(slug, f, n, title, trackOrder, trackName, summary, body, wordCount);
    insertArticleFts.run(slug, title, summary, body);
  }

  // 2. Sources (320 items)
  const sourcesFile = path.join(packDir, "sources.csv");
  let sourcesCount = 0;
  if (fs.existsSync(sourcesFile)) {
    const sources = parseCsv(fs.readFileSync(sourcesFile, "utf8"));
    const insertSource = db.prepare(`
      INSERT OR REPLACE INTO sources (sort, source_id, title, url, source_type, relevance, quality_signal, limitations)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    sources.forEach((s, i) => {
      insertSource.run(
        i,
        reqStr(s, "source_id"),
        reqStr(s, "title"),
        strOrNull(s, "url"),
        strOrNull(s, "source_type"),
        strOrNull(s, "relevance"),
        strOrNull(s, "quality_signal"),
        strOrNull(s, "limitations"),
      );
    });
    sourcesCount = sources.length;
  }

  // 3. Practice prompts (73 items)
  const promptsFile = path.join(packDir, "practice_prompts.csv");
  let promptsCount = 0;
  if (fs.existsSync(promptsFile)) {
    const prompts = parseCsv(fs.readFileSync(promptsFile, "utf8"));
    const insertPrompt = db.prepare(`
      INSERT OR REPLACE INTO practice_prompts (sort, prompt_id, exercise, primary_concepts, required_artifacts)
      VALUES (?, ?, ?, ?, ?)
    `);
    prompts.forEach((p, i) => {
      insertPrompt.run(
        i,
        reqStr(p, "prompt_id"),
        reqStr(p, "exercise"),
        strOrNull(p, "primary_concepts"),
        strOrNull(p, "required_artifacts"),
      );
    });
    promptsCount = prompts.length;
  }

  // 4. Roles (28 items)
  const rolesFile = path.join(packDir, "role_competency_matrix.csv");
  let rolesCount = 0;
  if (fs.existsSync(rolesFile)) {
    const roles = parseCsv(fs.readFileSync(rolesFile, "utf8"));
    const insertRole = db.prepare(`
      INSERT INTO roles (sort, role, career_level, competency_areas, typical_deliverables, source_anchors, portfolio_project)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    roles.forEach((r, i) => {
      insertRole.run(
        i,
        reqStr(r, "role"),
        strOrNull(r, "career_level"),
        strOrNull(r, "competency_areas"),
        strOrNull(r, "typical_deliverables"),
        strOrNull(r, "source_anchors"),
        strOrNull(r, "portfolio_project"),
      );
    });
    rolesCount = roles.length;
  }

  // 5. Coverage deep (50 items)
  const deepFile = path.join(packDir, "DEEP_COVERAGE_MATRIX.csv");
  let deepCount = 0;
  if (fs.existsSync(deepFile)) {
    const deep = parseCsv(fs.readFileSync(deepFile, "utf8"));
    const insertDeep = db.prepare(`
      INSERT INTO coverage_deep (sort, domain, depth_in_repository, new_deep_volumes, primary_source_anchors, evidence_status, remaining_gap, next_validation_action)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    deep.forEach((d, i) => {
      insertDeep.run(
        i,
        reqStr(d, "domain"),
        strOrNull(d, "depth_in_repository"),
        strOrNull(d, "new_deep_volumes"),
        strOrNull(d, "primary_source_anchors"),
        strOrNull(d, "evidence_status"),
        strOrNull(d, "remaining_gap"),
        strOrNull(d, "next_validation_action"),
      );
    });
    deepCount = deep.length;
  }

  // 6. Coverage research (28 items)
  const researchFile = path.join(packDir, "RESEARCH_COVERAGE_MATRIX.csv");
  let researchCount = 0;
  if (fs.existsSync(researchFile)) {
    const research = parseCsv(fs.readFileSync(researchFile, "utf8"));
    const insertResearch = db.prepare(`
      INSERT INTO coverage_research (sort, domain, knowledge_files, source_anchors, known_limitations_or_gaps, coverage_status)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    research.forEach((rc, i) => {
      insertResearch.run(
        i,
        reqStr(rc, "domain"),
        strOrNull(rc, "knowledge_files"),
        strOrNull(rc, "source_anchors"),
        strOrNull(rc, "known_limitations_or_gaps"),
        strOrNull(rc, "coverage_status"),
      );
    });
    researchCount = research.length;
  }

  // 7. Scrape audit (162 items)
  const auditFile = path.join(packDir, "DEEP_SCRAPE_AUDIT.csv");
  let auditCount = 0;
  if (fs.existsSync(auditFile)) {
    const audit = parseCsv(fs.readFileSync(auditFile, "utf8"));
    const insertAudit = db.prepare(`
      INSERT INTO scrape_audit (sort, research_ref, canonical_source_id, title, url, status, tools, extraction_extent, limitations)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    audit.forEach((a, i) => {
      insertAudit.run(
        i,
        strOrNull(a, "research_ref"),
        strOrNull(a, "canonical_source_id"),
        strOrNull(a, "title"),
        strOrNull(a, "url"),
        strOrNull(a, "status"),
        strOrNull(a, "tools"),
        strOrNull(a, "extraction_extent"),
        strOrNull(a, "limitations"),
      );
    });
    auditCount = audit.length;
  }

  // 8. Pack metadata (PACK_METADATA.json & portal_entity_schema.json)
  const insertMeta = db.prepare(`
    INSERT OR REPLACE INTO pack_meta (key, value)
    VALUES (?, ?)
  `);
  let metaCount = 0;
  const metaJsonFile = path.join(packDir, "PACK_METADATA.json");
  if (fs.existsSync(metaJsonFile)) {
    insertMeta.run("pack_metadata", fs.readFileSync(metaJsonFile, "utf8"));
    metaCount++;
  }
  const schemaJsonFile = path.join(packDir, "portal_entity_schema.json");
  if (fs.existsSync(schemaJsonFile)) {
    insertMeta.run("portal_entity_schema", fs.readFileSync(schemaJsonFile, "utf8"));
    metaCount++;
  }

  db.exec("COMMIT;");
  const durationMs = performance.now() - t0;

  return {
    durationMs,
    counts: {
      articles: files.length,
      sources: sourcesCount,
      practice_prompts: promptsCount,
      roles: rolesCount,
      coverage_deep: deepCount,
      coverage_research: researchCount,
      scrape_audit: auditCount,
      pack_meta: metaCount,
    },
  };
}

/** Check if Supabase keys are configured in environment */
export function isSupabaseAvailable(): boolean {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"] || process.env["SUPABASE_SERVICE_ROLE_KEY"];
  return Boolean(url && key && url.trim().length > 0 && key.trim().length > 0);
}

// -------------------------------------------------------------
// Synchronous Fast Query Methods
// -------------------------------------------------------------

export function listArticles(): ArticleListItem[] {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT slug, number, title, track, track_order, summary, word_count
    FROM articles
    ORDER BY track_order ASC, CASE WHEN number IS NULL THEN 1 ELSE 0 END, number ASC
  `);
  return stmt.all() as unknown as ArticleListItem[];
}

export function getArticle(slug: string): {
  article: ArticleDetail;
  prev: ArticleNav | null;
  next: ArticleNav | null;
  fileMap: Record<string, string>;
} | null {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT slug, filename, number, title, track, track_order, summary, body, word_count
    FROM articles
    WHERE slug = ?
  `);
  const article = stmt.get(slug) as unknown as ArticleDetail | undefined;
  if (!article) return null;

  const navStmt = db.prepare(`
    SELECT slug, title, number, track_order
    FROM articles
    ORDER BY track_order ASC, CASE WHEN number IS NULL THEN 1 ELSE 0 END, number ASC
  `);
  const nav = navStmt.all() as unknown as ArticleNav[];
  const i = nav.findIndex((n) => n.slug === slug);

  const filesStmt = db.prepare("SELECT slug, filename FROM articles");
  const files = filesStmt.all() as unknown as { slug: string; filename: string }[];
  const fileMap = Object.fromEntries(files.map((f) => [f.filename, f.slug]));

  return {
    article,
    prev: i > 0 && nav[i - 1] ? nav[i - 1]! : null,
    next: i < nav.length - 1 && nav[i + 1] ? nav[i + 1]! : null,
    fileMap,
  };
}

export function searchArticles(query: string): string[] {
  const term = String(query ?? "").trim();
  if (!term) return [];
  const db = getDatabase();

  try {
    const pattern = `%${term.replace(/[%_]/g, "\\$&")}%`;
    const stmt = db.prepare(`
      SELECT slug FROM articles
      WHERE title LIKE ? ESCAPE '\\'
         OR summary LIKE ? ESCAPE '\\'
         OR body LIKE ? ESCAPE '\\'
      LIMIT 200
    `);
    const rows = stmt.all(pattern, pattern, pattern) as unknown as { slug: string }[];
    return rows.map((r) => r.slug);
  } catch {
    return [];
  }
}

export function listSources(): SourceRecord[] {
  const db = getDatabase();
  return db
    .prepare("SELECT * FROM sources ORDER BY sort ASC LIMIT 1000")
    .all() as unknown as SourceRecord[];
}

export function listPrompts(): PracticePromptRecord[] {
  const db = getDatabase();
  return db
    .prepare("SELECT * FROM practice_prompts ORDER BY sort ASC")
    .all() as unknown as PracticePromptRecord[];
}

export function listRoles(): RoleRecord[] {
  const db = getDatabase();
  return db.prepare("SELECT * FROM roles ORDER BY sort ASC").all() as unknown as RoleRecord[];
}

export function getCoverage(): {
  deep: CoverageDeepRecord[];
  research: CoverageResearchRecord[];
  audit: ScrapeAuditRecord[];
  meta: Record<string, unknown>;
} {
  const db = getDatabase();
  const deep = db
    .prepare("SELECT * FROM coverage_deep ORDER BY sort ASC")
    .all() as unknown as CoverageDeepRecord[];
  const research = db
    .prepare("SELECT * FROM coverage_research ORDER BY sort ASC")
    .all() as unknown as CoverageResearchRecord[];
  const audit = db
    .prepare("SELECT * FROM scrape_audit ORDER BY sort ASC")
    .all() as unknown as ScrapeAuditRecord[];
  const metaRows = db.prepare("SELECT key, value FROM pack_meta").all() as unknown as {
    key: string;
    value: string;
  }[];

  const meta: Record<string, unknown> = {};
  for (const row of metaRows) {
    try {
      meta[row.key] = JSON.parse(row.value);
    } catch {
      meta[row.key] = row.value;
    }
  }
  return { deep, research, audit, meta };
}

export function getMe(userId: string): Result<MeData> {
  const db = getDatabase();
  try {
    let profile = db
      .prepare(
        `
      SELECT display_name, initials, signature_seed, signed_at
      FROM profiles
      WHERE id = ?
    `,
      )
      .get(userId) as unknown as UserProfile | undefined;

    if (!profile) {
      db.prepare(
        `
        INSERT INTO profiles (id, display_name, initials, signature_seed)
        VALUES (?, '', 'U', 0)
      `,
      ).run(userId);
      profile = { display_name: "", initials: "U", signature_seed: 0, signed_at: null };
    }

    const goals = db
      .prepare(
        `
      SELECT id, text FROM learning_goals WHERE user_id = ? ORDER BY created_at ASC
    `,
      )
      .all(userId) as unknown as UserGoal[];

    const events = db
      .prepare(
        `
      SELECT kind, ref, discipline, occurred_on FROM progress_events WHERE user_id = ? ORDER BY occurred_on ASC LIMIT 5000
    `,
      )
      .all(userId) as unknown as UserEvent[];

    return ok({ profile, goals, events });
  } catch (e) {
    return fail((e as Error).message || "Couldn't load your profile.");
  }
}

export function signCommitment(
  userId: string,
  data: { displayName: string; initials: string; seed: number; goal: string },
): Result<true> {
  const db = getDatabase();
  try {
    const now = new Date().toISOString();
    db.prepare(
      `
      INSERT INTO profiles (id, display_name, initials, signature_seed, signed_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        display_name = excluded.display_name,
        initials = excluded.initials,
        signature_seed = excluded.signature_seed,
        signed_at = excluded.signed_at,
        updated_at = excluded.updated_at
    `,
    ).run(userId, data.displayName, data.initials, data.seed, now, now);

    const goalCount = (
      db.prepare("SELECT COUNT(*) as c FROM learning_goals WHERE user_id = ?").get(userId) as {
        c: number;
      }
    ).c;
    if (goalCount < 3) {
      db.prepare(
        `
        INSERT INTO learning_goals (id, user_id, text, created_at)
        VALUES (?, ?, ?, ?)
      `,
      ).run(crypto.randomUUID(), userId, data.goal, now);
    }
    return ok(true);
  } catch (e) {
    return fail((e as Error).message || "Couldn't save your signature.");
  }
}

export function addGoal(userId: string, text: string): Result<true> {
  const db = getDatabase();
  try {
    const goalCount = (
      db.prepare("SELECT COUNT(*) as c FROM learning_goals WHERE user_id = ?").get(userId) as {
        c: number;
      }
    ).c;
    if (goalCount >= 3) {
      return fail("You can keep up to 3 learning goals.");
    }
    db.prepare(
      `
      INSERT INTO learning_goals (id, user_id, text, created_at)
      VALUES (?, ?, ?, ?)
    `,
    ).run(crypto.randomUUID(), userId, text.trim(), new Date().toISOString());
    return ok(true);
  } catch (e) {
    return fail((e as Error).message || "Couldn't add that goal.");
  }
}

export function removeGoal(userId: string, id: string): Result<true> {
  const db = getDatabase();
  try {
    db.prepare("DELETE FROM learning_goals WHERE id = ? AND user_id = ?").run(id, userId);
    return ok(true);
  } catch (e) {
    return fail((e as Error).message || "Couldn't remove that goal.");
  }
}

export function recordEvents(userId: string, events: ProgressEventInput[]): Result<number> {
  const db = getDatabase();
  try {
    const now = new Date().toISOString();
    const insert = db.prepare(`
      INSERT OR IGNORE INTO progress_events (id, user_id, kind, ref, discipline, occurred_on, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    db.exec("BEGIN TRANSACTION;");
    for (const e of events) {
      insert.run(
        crypto.randomUUID(),
        userId,
        e.kind,
        e.ref,
        e.discipline || null,
        e.occurred_on,
        now,
      );
    }
    db.exec("COMMIT;");
    return ok(events.length);
  } catch (e) {
    try {
      db.exec("ROLLBACK;");
    } catch {
      // Ignore rollback error if no active transaction
    }
    return fail((e as Error).message || "Couldn't sync progress.");
  }
}

export type SystemHealth = {
  status: "healthy" | "degraded";
  uptimeSeconds: number;
  timestamp: string;
  version: string;
  database: {
    provider: "sqlite_sync";
    engine: "node:sqlite DatabaseSync";
    walMode: boolean;
    filePath: string;
    counts: {
      articles: number;
      sources: number;
      practice_prompts: number;
      roles: number;
      coverage_deep: number;
      coverage_research: number;
      scrape_audit: number;
      pack_meta: number;
      profiles: number;
      learning_goals: number;
      progress_events: number;
    };
  };
  runtime: {
    nodeVersion: string;
    platform: string;
    memory: {
      rssMb: number;
      heapUsedMb: number;
      heapTotalMb: number;
    };
  };
};

export function getSystemHealth(): SystemHealth {
  const db = getDatabase();
  const uptimeSeconds = Math.round(process.uptime());
  const counts = {
    articles: (db.prepare("SELECT COUNT(*) as c FROM articles").get() as { c: number }).c,
    sources: (db.prepare("SELECT COUNT(*) as c FROM sources").get() as { c: number }).c,
    practice_prompts: (
      db.prepare("SELECT COUNT(*) as c FROM practice_prompts").get() as { c: number }
    ).c,
    roles: (db.prepare("SELECT COUNT(*) as c FROM roles").get() as { c: number }).c,
    coverage_deep: (db.prepare("SELECT COUNT(*) as c FROM coverage_deep").get() as { c: number }).c,
    coverage_research: (
      db.prepare("SELECT COUNT(*) as c FROM coverage_research").get() as { c: number }
    ).c,
    scrape_audit: (db.prepare("SELECT COUNT(*) as c FROM scrape_audit").get() as { c: number }).c,
    pack_meta: (db.prepare("SELECT COUNT(*) as c FROM pack_meta").get() as { c: number }).c,
    profiles: (db.prepare("SELECT COUNT(*) as c FROM profiles").get() as { c: number }).c,
    learning_goals: (db.prepare("SELECT COUNT(*) as c FROM learning_goals").get() as { c: number })
      .c,
    progress_events: (
      db.prepare("SELECT COUNT(*) as c FROM progress_events").get() as { c: number }
    ).c,
  };
  const mem = process.memoryUsage();
  return {
    status: counts.articles >= 120 && counts.sources >= 320 ? "healthy" : "degraded",
    uptimeSeconds,
    timestamp: new Date().toISOString(),
    version: "1.0.0-enterprise",
    database: {
      provider: "sqlite_sync",
      engine: "node:sqlite DatabaseSync",
      walMode: !_isMemory,
      filePath: _isMemory ? ":memory:" : getDbFilePath(),
      counts,
    },
    runtime: {
      nodeVersion: process.version,
      platform: process.platform,
      memory: {
        rssMb: Math.round(mem.rss / (1024 * 1024)),
        heapUsedMb: Math.round(mem.heapUsed / (1024 * 1024)),
        heapTotalMb: Math.round(mem.heapTotal / (1024 * 1024)),
      },
    },
  };
}

export type LocalAuthUserRow = {
  id: string;
  email: string;
  password_hash: string;
  display_name: string;
  created_at: string;
};

export function findLocalAuthUserByEmail(email: string): LocalAuthUserRow | null {
  const db = getDatabase();
  const row = db
    .prepare(
      "SELECT id, email, password_hash, display_name, created_at FROM local_auth_users WHERE email = ?",
    )
    .get(email.toLowerCase()) as unknown as LocalAuthUserRow | undefined;
  return row ?? null;
}

export function findLocalAuthUserById(id: string): LocalAuthUserRow | null {
  const db = getDatabase();
  const row = db
    .prepare(
      "SELECT id, email, password_hash, display_name, created_at FROM local_auth_users WHERE id = ?",
    )
    .get(id) as unknown as LocalAuthUserRow | undefined;
  return row ?? null;
}

export function createLocalAuthUser(input: {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string;
  createdAt: string;
}): void {
  const db = getDatabase();
  db.prepare(
    `
    INSERT INTO local_auth_users (id, email, password_hash, display_name, created_at)
    VALUES (?, ?, ?, ?, ?)
  `,
  ).run(
    input.id,
    input.email.toLowerCase(),
    input.passwordHash,
    input.displayName,
    input.createdAt,
  );
}

export function updateLocalAuthPassword(userId: string, passwordHash: string): void {
  const db = getDatabase();
  db.prepare("UPDATE local_auth_users SET password_hash = ? WHERE id = ?").run(
    passwordHash,
    userId,
  );
}

export type LearnerEvidenceRecord = {
  idempotency_key: string;
  skill_id: string;
  evidence_type: string;
  ref: string;
  score: number;
  weight: number;
  confidence: number | null;
  verification_tier: string;
  rubric_version: string | null;
  rubric_scores_json: string | null;
  artifact_url: string | null;
  artifact_notes: string | null;
  occurred_at: string;
};

export function recordLearnerEvidence(
  userId: string,
  items: LearnerEvidenceRecord[],
): Result<number> {
  const db = getDatabase();
  try {
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO learner_evidence (
        id, user_id, idempotency_key, skill_id, evidence_type, ref,
        score, weight, confidence, verification_tier, rubric_version,
        rubric_scores_json, artifact_url, artifact_notes, occurred_at, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, idempotency_key) DO UPDATE SET
        score = excluded.score,
        weight = excluded.weight,
        confidence = excluded.confidence,
        verification_tier = excluded.verification_tier,
        rubric_version = excluded.rubric_version,
        rubric_scores_json = excluded.rubric_scores_json,
        artifact_url = excluded.artifact_url,
        artifact_notes = excluded.artifact_notes,
        occurred_at = excluded.occurred_at
    `);
    db.exec("BEGIN TRANSACTION;");
    for (const item of items) {
      stmt.run(
        crypto.randomUUID(),
        userId,
        item.idempotency_key,
        item.skill_id,
        item.evidence_type,
        item.ref,
        item.score,
        item.weight,
        item.confidence,
        item.verification_tier,
        item.rubric_version,
        item.rubric_scores_json,
        item.artifact_url,
        item.artifact_notes,
        item.occurred_at,
        now,
      );
    }
    db.exec("COMMIT;");
    return ok(items.length);
  } catch (e) {
    try {
      db.exec("ROLLBACK;");
    } catch {
      // ignore
    }
    return fail((e as Error).message || "Couldn't store learning evidence.");
  }
}

export function listLearnerEvidence(userId: string): LearnerEvidenceRecord[] {
  const db = getDatabase();
  return db
    .prepare(
      `
      SELECT idempotency_key, skill_id, evidence_type, ref, score, weight, confidence,
             verification_tier, rubric_version, rubric_scores_json, artifact_url,
             artifact_notes, occurred_at
      FROM learner_evidence
      WHERE user_id = ?
      ORDER BY occurred_at ASC
      LIMIT 5000
    `,
    )
    .all(userId) as unknown as LearnerEvidenceRecord[];
}

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
};

export function listProgressEventsPaginated(
  userId: string,
  limit = 50,
  offset = 0,
): PaginatedResult<UserEvent> {
  const db = getDatabase();
  const safeLimit = Math.max(1, Math.min(100, Math.floor(limit)));
  const safeOffset = Math.max(0, Math.floor(offset));
  const total = (
    db.prepare("SELECT COUNT(*) as c FROM progress_events WHERE user_id = ?").get(userId) as {
      c: number;
    }
  ).c;
  const items = db
    .prepare(
      `
      SELECT kind, ref, discipline, occurred_on
      FROM progress_events
      WHERE user_id = ?
      ORDER BY occurred_on DESC, created_at DESC
      LIMIT ? OFFSET ?
    `,
    )
    .all(userId, safeLimit, safeOffset) as unknown as UserEvent[];
  return {
    items,
    total,
    limit: safeLimit,
    offset: safeOffset,
    hasMore: safeOffset + items.length < total,
  };
}

export function listLearnerEvidencePaginated(
  userId: string,
  limit = 50,
  offset = 0,
): PaginatedResult<LearnerEvidenceRecord> {
  const db = getDatabase();
  const safeLimit = Math.max(1, Math.min(100, Math.floor(limit)));
  const safeOffset = Math.max(0, Math.floor(offset));
  const total = (
    db.prepare("SELECT COUNT(*) as c FROM learner_evidence WHERE user_id = ?").get(userId) as {
      c: number;
    }
  ).c;
  const items = db
    .prepare(
      `
      SELECT idempotency_key, skill_id, evidence_type, ref, score, weight, confidence,
             verification_tier, rubric_version, rubric_scores_json, artifact_url,
             artifact_notes, occurred_at
      FROM learner_evidence
      WHERE user_id = ?
      ORDER BY occurred_at DESC
      LIMIT ? OFFSET ?
    `,
    )
    .all(userId, safeLimit, safeOffset) as unknown as LearnerEvidenceRecord[];
  return {
    items,
    total,
    limit: safeLimit,
    offset: safeOffset,
    hasMore: safeOffset + items.length < total,
  };
}

export function verifyLearnerEvidence(
  targetUserId: string,
  idempotencyKey: string,
  verificationTier: "rubric-evaluated" | "reviewer-verified",
  reviewerId: string,
  scoreOverride?: number,
  reviewerNote?: string,
): Result<{ updated: boolean; reviewedAt: string }> {
  const db = getDatabase();
  try {
    const now = new Date().toISOString();
    const existing = db
      .prepare(
        "SELECT id, score, artifact_notes FROM learner_evidence WHERE user_id = ? AND idempotency_key = ?",
      )
      .get(targetUserId, idempotencyKey) as
      { id: string; score: number; artifact_notes: string | null } | undefined;
    if (!existing) {
      return fail("Evidence record not found for target learner.");
    }
    const nextScore = typeof scoreOverride === "number" ? scoreOverride : existing.score;
    const nextNotes = reviewerNote
      ? [existing.artifact_notes, `[Reviewer verified ${now}]: ${reviewerNote}`]
          .filter(Boolean)
          .join("\n")
          .slice(0, 8000)
      : existing.artifact_notes;

    db.prepare(
      `
      UPDATE learner_evidence
      SET verification_tier = ?,
          score = ?,
          artifact_notes = ?,
          reviewer_id = ?,
          reviewed_at = ?
      WHERE user_id = ? AND idempotency_key = ?
    `,
    ).run(verificationTier, nextScore, nextNotes, reviewerId, now, targetUserId, idempotencyKey);
    return ok({ updated: true, reviewedAt: now });
  } catch (e) {
    return fail((e as Error).message || "Couldn't verify evidence.");
  }
}

export function saveLearnerSnapshot(userId: string, stateJson: string): Result<true> {
  const res = saveLearnerSnapshotWithVersion(userId, stateJson);
  if (res.error) return fail(res.error);
  return ok(true);
}

export function saveLearnerSnapshotWithVersion(
  userId: string,
  stateJson: string,
  expectedVersion?: number,
): Result<{ version: number; conflict: boolean; currentVersion: number }> {
  const db = getDatabase();
  try {
    const now = new Date().toISOString();
    const existing = db
      .prepare("SELECT version FROM learner_state_snapshots WHERE user_id = ?")
      .get(userId) as { version: number } | undefined;

    if (!existing) {
      if (expectedVersion !== undefined && expectedVersion > 0) {
        return ok({ version: 0, conflict: true, currentVersion: 0 });
      }
      db.prepare(
        "INSERT INTO learner_state_snapshots (user_id, state_json, version, updated_at) VALUES (?, ?, 1, ?)",
      ).run(userId, stateJson, now);
      return ok({ version: 1, conflict: false, currentVersion: 1 });
    }

    if (expectedVersion !== undefined && existing.version !== expectedVersion) {
      return ok({
        version: existing.version,
        conflict: true,
        currentVersion: existing.version,
      });
    }

    const nextVersion = existing.version + 1;
    const info = db
      .prepare(
        "UPDATE learner_state_snapshots SET state_json = ?, version = ?, updated_at = ? WHERE user_id = ? AND version = ?",
      )
      .run(stateJson, nextVersion, now, userId, existing.version);

    if (info.changes === 0) {
      const latest = db
        .prepare("SELECT version FROM learner_state_snapshots WHERE user_id = ?")
        .get(userId) as { version: number } | undefined;
      return ok({
        version: latest?.version ?? existing.version,
        conflict: true,
        currentVersion: latest?.version ?? existing.version,
      });
    }
    return ok({ version: nextVersion, conflict: false, currentVersion: nextVersion });
  } catch (e) {
    return fail((e as Error).message || "Couldn't persist learner snapshot.");
  }
}

export function getLearnerSnapshot(
  userId: string,
): { stateJson: string; updatedAt: string; version: number } | null {
  const db = getDatabase();
  const row = db
    .prepare(
      "SELECT state_json, updated_at, version FROM learner_state_snapshots WHERE user_id = ?",
    )
    .get(userId) as unknown as
    { state_json: string; updated_at: string; version: number } | undefined;
  return row
    ? { stateJson: row.state_json, updatedAt: row.updated_at, version: Number(row.version ?? 1) }
    : null;
}

export type UserRoleName = "learner" | "reviewer" | "author" | "admin";

export type UserRoleRecord = {
  user_id: string;
  role: UserRoleName;
  granted_by: string | null;
  granted_at: string;
};

export function getUserRole(userId: string): UserRoleName {
  const db = getDatabase();
  const row = db.prepare("SELECT role FROM user_roles WHERE user_id = ?").get(userId) as
    { role: UserRoleName } | undefined;
  return row?.role ?? "learner";
}

export function setUserRole(
  userId: string,
  role: UserRoleName,
  grantedBy: string | null,
): Result<UserRoleRecord> {
  const db = getDatabase();
  try {
    const now = new Date().toISOString();
    db.prepare(
      `
      INSERT INTO user_roles (user_id, role, granted_by, granted_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        role = excluded.role,
        granted_by = excluded.granted_by,
        granted_at = excluded.granted_at
    `,
    ).run(userId, role, grantedBy, now);
    return ok({ user_id: userId, role, granted_by: grantedBy, granted_at: now });
  } catch (e) {
    return fail((e as Error).message || "Couldn't update user role.");
  }
}

export function listUserRoles(): UserRoleRecord[] {
  const db = getDatabase();
  return db
    .prepare(
      "SELECT user_id, role, granted_by, granted_at FROM user_roles ORDER BY granted_at DESC LIMIT 500",
    )
    .all() as unknown as UserRoleRecord[];
}

/**
 * One-time atomic local-dev admin bootstrap.
 * Only succeeds if zero admin roles exist yet in `user_roles`.
 */
export function claimFirstLocalAdmin(userId: string): Result<{ claimed: boolean }> {
  const db = getDatabase();
  try {
    db.exec("BEGIN IMMEDIATE;");
    const existing = db
      .prepare("SELECT COUNT(*) as c FROM user_roles WHERE role = 'admin'")
      .get() as { c: number };
    if (existing.c > 0) {
      db.exec("COMMIT;");
      return ok({ claimed: false });
    }
    const now = new Date().toISOString();
    db.prepare(
      `
      INSERT INTO user_roles (user_id, role, granted_by, granted_at)
      VALUES (?, 'admin', 'bootstrap', ?)
      ON CONFLICT(user_id) DO UPDATE SET role = 'admin', granted_by = 'bootstrap', granted_at = excluded.granted_at
    `,
    ).run(userId, now);
    db.exec("COMMIT;");
    return ok({ claimed: true });
  } catch (e) {
    try {
      db.exec("ROLLBACK;");
    } catch {
      /* ignore */
    }
    return fail((e as Error).message || "Couldn't claim local admin role.");
  }
}

export type AuditLogRecord = {
  id: string;
  actor_user_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  outcome: "ok" | "denied" | "error";
  request_id: string | null;
  meta_json: string | null;
  created_at: string;
};

export function writeAuditLog(entry: {
  actorUserId?: string | null;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  outcome: "ok" | "denied" | "error";
  requestId?: string | null;
  meta?: Record<string, unknown>;
}): void {
  try {
    const db = getDatabase();
    db.prepare(
      `
      INSERT INTO audit_log (id, actor_user_id, action, resource_type, resource_id, outcome, request_id, meta_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    ).run(
      crypto.randomUUID(),
      entry.actorUserId ?? null,
      entry.action,
      entry.resourceType,
      entry.resourceId ?? null,
      entry.outcome,
      entry.requestId ?? null,
      entry.meta ? JSON.stringify(entry.meta).slice(0, 4000) : null,
      new Date().toISOString(),
    );
  } catch {
    /* never crash business operation on audit log failure */
  }
}

export function listAuditLogsPaginated(limit = 50, offset = 0): PaginatedResult<AuditLogRecord> {
  const db = getDatabase();
  const safeLimit = Math.max(1, Math.min(100, Math.floor(limit)));
  const safeOffset = Math.max(0, Math.floor(offset));
  const total = (db.prepare("SELECT COUNT(*) as c FROM audit_log").get() as { c: number }).c;
  const items = db
    .prepare(
      `
      SELECT id, actor_user_id, action, resource_type, resource_id, outcome, request_id, meta_json, created_at
      FROM audit_log
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `,
    )
    .all(safeLimit, safeOffset) as unknown as AuditLogRecord[];
  return {
    items,
    total,
    limit: safeLimit,
    offset: safeOffset,
    hasMore: safeOffset + items.length < total,
  };
}

export type SourceExtractionBreakdown = {
  totalRegistered: number;
  auditedCount: number;
  fullExtraction: number;
  targetedExtraction: number;
  partialExtraction: number;
  discoveryOnly: number;
  inaccessible: number;
  unverifiedRegistry: number;
};

export function getSourceExtractionBreakdown(): SourceExtractionBreakdown {
  const db = getDatabase();
  const totalRegistered = (db.prepare("SELECT COUNT(*) as c FROM sources").get() as { c: number })
    .c;
  const audits = db
    .prepare("SELECT canonical_source_id, status FROM scrape_audit")
    .all() as unknown as { canonical_source_id: string | null; status: string | null }[];

  const bySource = new Map<string, string>();
  for (const a of audits) {
    if (a.canonical_source_id) {
      bySource.set(a.canonical_source_id, (a.status ?? "").toLowerCase());
    }
  }

  let fullExtraction = 0;
  let targetedExtraction = 0;
  let partialExtraction = 0;
  let discoveryOnly = 0;
  let inaccessible = 0;

  for (const status of bySource.values()) {
    if (status.includes("full")) fullExtraction++;
    else if (status.includes("targeted")) targetedExtraction++;
    else if (status.includes("partial")) partialExtraction++;
    else if (status.includes("discovery")) discoveryOnly++;
    else inaccessible++;
  }

  const auditedCount = bySource.size;
  const unverifiedRegistry = Math.max(0, totalRegistered - auditedCount);

  return {
    totalRegistered,
    auditedCount,
    fullExtraction,
    targetedExtraction,
    partialExtraction,
    discoveryOnly,
    inaccessible,
    unverifiedRegistry,
  };
}

export type PublicHealthStatus = {
  status: "healthy" | "degraded";
  timestamp: string;
  version: string;
  storageMode: "supabase" | "local_sqlite_dev";
  knowledgePack: {
    volumes: number;
    sources: SourceExtractionBreakdown;
    practicePrompts: number;
    careerRoles: number;
    deepCoverageDomains: number;
    researchCoverageDomains: number;
  };
};

/** Redacted public liveness/readiness payload — exposes zero file paths, memory internals, or user counts. */
export function getPublicHealth(storageMode: "supabase" | "local_sqlite_dev"): PublicHealthStatus {
  const db = getDatabase();
  const volumes = (db.prepare("SELECT COUNT(*) as c FROM articles").get() as { c: number }).c;
  const practicePrompts = (
    db.prepare("SELECT COUNT(*) as c FROM practice_prompts").get() as { c: number }
  ).c;
  const careerRoles = (db.prepare("SELECT COUNT(*) as c FROM roles").get() as { c: number }).c;
  const deepCoverageDomains = (
    db.prepare("SELECT COUNT(*) as c FROM coverage_deep").get() as { c: number }
  ).c;
  const researchCoverageDomains = (
    db.prepare("SELECT COUNT(*) as c FROM coverage_research").get() as { c: number }
  ).c;
  const sources = getSourceExtractionBreakdown();

  return {
    status: volumes >= 119 && sources.totalRegistered >= 320 ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    version: "2.0.0",
    storageMode,
    knowledgePack: {
      volumes,
      sources,
      practicePrompts,
      careerRoles,
      deepCoverageDomains,
      researchCoverageDomains,
    },
  };
}

export type LearnerDossier = {
  exportDate: string;
  dossierVersion: string;
  disclaimer: string;
  userId: string;
  profile: UserProfile | null;
  goals: { id: string; text: string; created_at: string }[];
  events: { kind: string; ref: string; discipline: string | null; occurred_on: string }[];
  evidence: LearnerEvidenceRecord[];
  metrics: {
    totalEvents: number;
    totalEvidenceItems: number;
    distinctDisciplines: string[];
    lessonsDone: number;
    labsDone: number;
    rubricEvaluatedCount: number;
  };
};

export function exportLearnerDossier(userId: string): LearnerDossier {
  const db = getDatabase();
  const profile =
    (db
      .prepare(
        "SELECT display_name, initials, signature_seed, signed_at, created_at FROM profiles WHERE id = ?",
      )
      .get(userId) as UserProfile) || null;
  const goals = db
    .prepare(
      "SELECT id, text, created_at FROM learning_goals WHERE user_id = ? ORDER BY created_at",
    )
    .all(userId) as { id: string; text: string; created_at: string }[];
  const events = db
    .prepare(
      "SELECT kind, ref, discipline, occurred_on FROM progress_events WHERE user_id = ? ORDER BY occurred_on",
    )
    .all(userId) as { kind: string; ref: string; discipline: string | null; occurred_on: string }[];
  const evidence = listLearnerEvidence(userId);

  const disciplines = Array.from(
    new Set(events.map((e) => e.discipline).filter(Boolean)),
  ) as string[];
  const lessonsDone = events.filter((e) => e.kind === "lesson").length;
  const labsDone = events.filter((e) => e.kind === "lab").length;
  const rubricEvaluatedCount = evidence.filter(
    (e) =>
      e.verification_tier === "rubric-evaluated" || e.verification_tier === "reviewer-verified",
  ).length;

  return {
    exportDate: new Date().toISOString(),
    dossierVersion: "2.0.0",
    disclaimer:
      "Self-directed engineering learning portfolio. Records learner artifacts, rubric evaluations, and study evidence; not a formal INCOSE, ISO, NASA, or regulatory certification.",
    userId,
    profile,
    goals,
    events,
    evidence,
    metrics: {
      totalEvents: events.length,
      totalEvidenceItems: evidence.length,
      distinctDisciplines: disciplines,
      lessonsDone,
      labsDone,
      rubricEvaluatedCount,
    },
  };
}

/** Alias for recordEvents */
export const saveProgress = recordEvents;

export const localDb = {
  getDatabase,
  initTablesSync,
  seedDatabaseSync,
  isSupabaseAvailable,
  listArticles,
  getArticle,
  searchArticles,
  listSources,
  listPrompts,
  listRoles,
  getCoverage,
  getMe,
  signCommitment,
  addGoal,
  removeGoal,
  recordEvents,
  saveProgress,
  recordLearnerEvidence,
  listLearnerEvidence,
  listProgressEventsPaginated,
  listLearnerEvidencePaginated,
  verifyLearnerEvidence,
  saveLearnerSnapshot,
  saveLearnerSnapshotWithVersion,
  getLearnerSnapshot,
  getUserRole,
  setUserRole,
  listUserRoles,
  claimFirstLocalAdmin,
  writeAuditLog,
  listAuditLogsPaginated,
  findLocalAuthUserByEmail,
  findLocalAuthUserById,
  createLocalAuthUser,
  updateLocalAuthPassword,
  getSourceExtractionBreakdown,
  getPublicHealth,
  getSystemHealth,
  exportLearnerDossier,
};

export default localDb;
