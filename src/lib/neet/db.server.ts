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
  `);
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

export type LearnerDossier = {
  exportDate: string;
  userId: string;
  profile: UserProfile | null;
  goals: { id: string; text: string; created_at: string }[];
  events: { kind: string; ref: string; discipline: string | null; occurred_on: string }[];
  metrics: {
    totalEvents: number;
    distinctDisciplines: string[];
    lessonsDone: number;
    labsDone: number;
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

  const disciplines = Array.from(
    new Set(events.map((e) => e.discipline).filter(Boolean)),
  ) as string[];
  const lessonsDone = events.filter((e) => e.kind === "lesson").length;
  const labsDone = events.filter((e) => e.kind === "lab").length;

  return {
    exportDate: new Date().toISOString(),
    userId,
    profile,
    goals,
    events,
    metrics: {
      totalEvents: events.length,
      distinctDisciplines: disciplines,
      lessonsDone,
      labsDone,
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
  getSystemHealth,
  exportLearnerDossier,
};

export default localDb;
