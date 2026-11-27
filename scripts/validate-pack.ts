/**
 * Canonical Knowledge Pack Validation Gate (`npm run validate:pack`)
 *
 * Strict CI invariants (all exit non-zero on violation):
 * 1. Canonical content/pack/ directory & required files exist
 * 2. Lower-bound count invariants prevent accidental bulk deletion
 * 3. Every source has a unique source_id, title, and valid http(s) URL syntax
 * 4. Zero dangling [Sxxx] inline citations in pack markdown (prevents fabricated citations)
 * 5. Zero mirror drift between canonical content/pack/ and SS_content/ (when mirror is present)
 * 6. Required PACK_METADATA.json fields (`as_of`) are present and non-empty
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export interface PackValidationBounds {
  minVolumes: number;
  minSources: number;
  minPrompts: number;
  minAuditRows: number;
}

export const DEFAULT_PACK_BOUNDS: PackValidationBounds = {
  minVolumes: 115,
  minSources: 300,
  minPrompts: 70,
  minAuditRows: 150,
};

export interface PackValidationResult {
  valid: boolean;
  errors: string[];
  stats: {
    asOf: string;
    volumes: number;
    sources: number;
    explicitlyCited: number;
    registerOnly: number;
    invalidUrls: number;
    prompts: number;
    auditRows: number;
    danglingCitations: number;
    mirrorDriftFiles: number;
    statusCounts: Record<string, number>;
  };
}

export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    const next = text[i + 1];
    if (ch === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      row.push(field);
      field = "";
    } else if ((ch === "\r" || ch === "\n") && !inQuotes) {
      if (ch === "\r" && next === "\n") i++;
      row.push(field);
      if (row.some((c) => c.length > 0)) rows.push(row);
      row = [];
      field = "";
    } else {
      field += ch;
    }
  }
  if (field || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

export function validatePackAt(
  packRoot: string,
  legacyRoot: string | null = null,
  bounds: PackValidationBounds = DEFAULT_PACK_BOUNDS,
): PackValidationResult {
  const errors: string[] = [];
  const statusCounts: Record<string, number> = {};

  if (!fs.existsSync(packRoot)) {
    return {
      valid: false,
      errors: [`Canonical pack root missing at ${packRoot}`],
      stats: {
        asOf: "unknown",
        volumes: 0,
        sources: 0,
        explicitlyCited: 0,
        registerOnly: 0,
        invalidUrls: 0,
        prompts: 0,
        auditRows: 0,
        danglingCitations: 0,
        mirrorDriftFiles: 0,
        statusCounts,
      },
    };
  }

  // 1. Required metadata & CSV files
  const requiredFiles = [
    "PACK_METADATA.json",
    "sources.csv",
    "DEEP_SCRAPE_AUDIT.csv",
    "practice_prompts.csv",
  ];
  for (const rf of requiredFiles) {
    if (!fs.existsSync(path.join(packRoot, rf))) {
      errors.push(`Missing required canonical pack file: ${rf}`);
    }
  }

  let asOf = "unknown";
  const metaPath = path.join(packRoot, "PACK_METADATA.json");
  if (fs.existsSync(metaPath)) {
    try {
      const meta = JSON.parse(fs.readFileSync(metaPath, "utf8")) as Record<string, unknown>;
      if (typeof meta["as_of"] === "string" && meta["as_of"].trim().length > 0) {
        asOf = meta["as_of"].trim();
      } else {
        errors.push("PACK_METADATA.json is missing a non-empty 'as_of' freshness date.");
      }
    } catch {
      errors.push("PACK_METADATA.json is not valid JSON.");
    }
  }

  // 2. Validate sources.csv
  const sourceIds = new Set<string>();
  let invalidUrls = 0;
  const sourcesPath = path.join(packRoot, "sources.csv");
  if (fs.existsSync(sourcesPath)) {
    const sourceRows = parseCSV(fs.readFileSync(sourcesPath, "utf8")).slice(1);
    for (const row of sourceRows) {
      const [sourceId, title, url] = row;
      const id = (sourceId || "").trim();
      if (!id) {
        errors.push("Blank source_id found in sources.csv");
        continue;
      }
      if (sourceIds.has(id)) {
        errors.push(`Duplicate source_id in sources.csv: ${id}`);
      }
      sourceIds.add(id);
      if (!title?.trim()) {
        errors.push(`Missing title for source ${id}`);
      }
      if (url?.trim()) {
        try {
          const parsed = new URL(url.trim());
          if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
            invalidUrls++;
            errors.push(`Non-HTTP(S) URL for ${id}: ${url}`);
          }
        } catch {
          invalidUrls++;
          errors.push(`Malformed URL for ${id}: ${url}`);
        }
      }
    }
  }
  if (sourceIds.size < bounds.minSources) {
    errors.push(
      `Source count (${sourceIds.size}) is below minimum invariant (${bounds.minSources}).`,
    );
  }

  // 3. Validate practice_prompts.csv & DEEP_SCRAPE_AUDIT.csv
  let promptCount = 0;
  const promptsPath = path.join(packRoot, "practice_prompts.csv");
  if (fs.existsSync(promptsPath)) {
    promptCount = parseCSV(fs.readFileSync(promptsPath, "utf8")).slice(1).length;
  }
  if (promptCount < bounds.minPrompts) {
    errors.push(
      `Practice prompt count (${promptCount}) is below minimum invariant (${bounds.minPrompts}).`,
    );
  }

  let auditRowCount = 0;
  const auditPath = path.join(packRoot, "DEEP_SCRAPE_AUDIT.csv");
  if (fs.existsSync(auditPath)) {
    const auditRows = parseCSV(fs.readFileSync(auditPath, "utf8")).slice(1);
    auditRowCount = auditRows.length;
    for (const row of auditRows) {
      const status = (row[4] || "Unknown").trim();
      statusCounts[status] = (statusCounts[status] ?? 0) + 1;
    }
  }
  if (auditRowCount < bounds.minAuditRows) {
    errors.push(
      `Audit row count (${auditRowCount}) is below minimum invariant (${bounds.minAuditRows}).`,
    );
  }

  // 4. Validate markdown volumes, duplicate numeric prefixes, and dangling [Sxxx] citations
  const mdFiles = fs
    .readdirSync(packRoot)
    .filter((f) => f.endsWith(".md") && f !== "CONTENT_IMPORT_GUIDE.md");
  if (mdFiles.length < bounds.minVolumes) {
    errors.push(
      `Markdown volume count (${mdFiles.length}) is below minimum invariant (${bounds.minVolumes}).`,
    );
  }

  const seenSlugs = new Set<string>();
  const citedIds = new Set<string>();
  const danglingCitations: Array<{ file: string; id: string }> = [];

  for (const f of mdFiles) {
    const slug = f
      .slice(0, -3)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    if (seenSlugs.has(slug)) {
      errors.push(`Duplicate derived article slug: ${slug} (file ${f})`);
    }
    seenSlugs.add(slug);

    const text = fs.readFileSync(path.join(packRoot, f), "utf8");
    const prose = text.replace(/```[\s\S]*?```/g, "");
    const bracketMatches = prose.matchAll(/\[([S\d\s,–—-]+)\](?!\()/g);
    for (const m of bracketMatches) {
      const inner = m[1] || "";
      const ids = inner.match(/\bS\d{2,3}\b/g) || [];
      for (const id of ids) {
        if (sourceIds.has(id)) {
          citedIds.add(id);
        } else {
          danglingCitations.push({ file: f, id });
        }
      }
    }
  }

  if (danglingCitations.length > 0) {
    for (const d of danglingCitations.slice(0, 20)) {
      errors.push(`Dangling unregistered citation [${d.id}] in ${d.file}`);
    }
    if (danglingCitations.length > 20) {
      errors.push(`...and ${danglingCitations.length - 20} additional dangling citations.`);
    }
  }

  // 5. Strict parity check with SS_content mirror when present
  let driftCount = 0;
  if (legacyRoot && fs.existsSync(legacyRoot)) {
    for (const f of mdFiles) {
      const legacyPath = path.join(legacyRoot, f);
      if (!fs.existsSync(legacyPath)) {
        driftCount++;
        errors.push(`Mirror drift: ${f} missing from legacy mirror ${path.basename(legacyRoot)}/`);
      } else {
        const a = fs.readFileSync(path.join(packRoot, f));
        const b = fs.readFileSync(legacyPath);
        if (!a.equals(b)) {
          driftCount++;
          errors.push(`Mirror drift: ${f} differs between canonical pack and mirror.`);
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    stats: {
      asOf,
      volumes: mdFiles.length,
      sources: sourceIds.size,
      explicitlyCited: citedIds.size,
      registerOnly: Math.max(0, sourceIds.size - citedIds.size),
      invalidUrls,
      prompts: promptCount,
      auditRows: auditRowCount,
      danglingCitations: danglingCitations.length,
      mirrorDriftFiles: driftCount,
      statusCounts,
    },
  };
}

function runCli() {
  const packRoot = path.resolve(process.cwd(), "content/pack");
  const legacyRoot = path.resolve(process.cwd(), "SS_content");
  const res = validatePackAt(packRoot, legacyRoot);

  console.log("=== Knowledge Pack Validation Report ===");
  console.log(`Canonical root:        content/pack/`);
  console.log(`Snapshot as_of:        ${res.stats.asOf}`);
  console.log(`Markdown volumes:      ${res.stats.volumes}`);
  console.log(`Registered sources:    ${res.stats.sources}`);
  console.log(
    `Explicitly cited IDs:  ${res.stats.explicitlyCited} (${res.stats.registerOnly} register-only)`,
  );
  console.log(`Invalid source URLs:   ${res.stats.invalidUrls}`);
  console.log(`Practice prompts:      ${res.stats.prompts}`);
  console.log(`Audit records:         ${res.stats.auditRows}`);
  console.log(`Audit status breakdown:`, res.stats.statusCounts);
  console.log(`Dangling [Sxx] cites:  ${res.stats.danglingCitations}`);
  console.log(`Mirror drift files:    ${res.stats.mirrorDriftFiles}`);

  if (!res.valid) {
    console.error(`\nFAILED with ${res.errors.length} error(s):`);
    res.errors.forEach((e) => console.error(`  - ${e}`));
    process.exit(1);
  }

  console.log("\nPASS: Canonical knowledge pack passed all strict integrity gates.");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runCli();
}
