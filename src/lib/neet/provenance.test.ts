// @vitest-environment node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it, expect } from "vitest";
import {
  ALL_ENRICHED_SOURCES,
  CITATION_ALIASES,
  ENRICHED_SOURCES,
  getSourcesForArticleSplit,
} from "./sourceEnrichment";
import { getPublicHealth } from "./db.server";
import { validatePackAt } from "../../../scripts/validate-pack";

function makeTempPackFixture(opts?: {
  asOf?: string | null;
  sourcesCsv?: string;
  markdownBody?: string;
  mirrorBody?: string | null;
}): { root: string; packDir: string; mirrorDir: string | null } {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "neet-pack-test-"));
  const packDir = path.join(root, "pack");
  fs.mkdirSync(packDir, { recursive: true });

  const meta =
    opts?.asOf === null
      ? { version: "1.0" }
      : { version: "1.0", as_of: opts?.asOf ?? "2026-11-05" };
  fs.writeFileSync(path.join(packDir, "PACK_METADATA.json"), JSON.stringify(meta));

  fs.writeFileSync(
    path.join(packDir, "sources.csv"),
    opts?.sourcesCsv ??
      "source_id,title,url\nS01,Valid Standard,https://example.org/s01\nS02,Second Source,https://example.org/s02\n",
  );
  fs.writeFileSync(
    path.join(packDir, "practice_prompts.csv"),
    "id,prompt\nP1,Prompt one\nP2,Prompt two\n",
  );
  fs.writeFileSync(
    path.join(packDir, "DEEP_SCRAPE_AUDIT.csv"),
    "id,title,url,tier,status\nS01,Valid Standard,https://example.org/s01,primary,Full\n",
  );
  fs.writeFileSync(
    path.join(packDir, "01_INTRO.md"),
    opts?.markdownBody ?? "# Intro\nGrounded in [S01] and [S02].\n",
  );

  let mirrorDir: string | null = null;
  if (opts?.mirrorBody !== undefined && opts?.mirrorBody !== null) {
    mirrorDir = path.join(root, "mirror");
    fs.mkdirSync(mirrorDir, { recursive: true });
    fs.writeFileSync(path.join(mirrorDir, "01_INTRO.md"), opts.mirrorBody);
  }
  return { root, packDir, mirrorDir };
}

describe("Knowledge & Research Provenance Governance (Phase 4 & Stage 6)", () => {
  it("registers all 320 sources with valid HTTP(S) URLs and typed authority/provenance status", () => {
    expect(ALL_ENRICHED_SOURCES.length).toBe(320);

    for (const s of ALL_ENRICHED_SOURCES) {
      expect(s.source_id).toBeTruthy();
      expect(s.authority_tier).toMatch(
        /^(primary-standard|authoritative-handbook|peer-reviewed-paper|engineering-practice|secondary-reference)$/,
      );
      expect(s.provenance_status).toMatch(
        /^(full-extraction|targeted-extraction|discovery-only|partial-or-blocked|unaudited)$/,
      );
      expect(s.freshness_as_of).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(s.licensing_note.length).toBeGreaterThan(20);
      if (s.url) {
        expect(s.url_valid).toBe(true);
      }
    }
  });

  it("ensures every CITATION_ALIASES entry resolves to a verified canonical source (no fabricated aliases)", () => {
    for (const [alias, targetId] of Object.entries(CITATION_ALIASES)) {
      const target = ENRICHED_SOURCES[targetId];
      expect(target, `Alias "${alias}" -> ${targetId} missing`).toBeDefined();
    }
    // Verify previously misdirected aliases were fixed
    expect(CITATION_ALIASES["ATAM"]).toBe("S09");
    expect(CITATION_ALIASES["STPA"]).toBe("S77");
    expect(CITATION_ALIASES["MIL-STD-882E"]).toBeUndefined();
    expect(CITATION_ALIASES["NPR 7120.5F"]).toBeUndefined();
  });

  it("strictly separates explicit markdown citations from heuristic topic-related reading", () => {
    let explicitlyCitedCount = 0;
    for (const s of ALL_ENRICHED_SOURCES) {
      const explicitSlugs = new Set(s.cited_in_articles.map((a) => a.slug));
      if (explicitSlugs.size > 0) explicitlyCitedCount++;
      for (const rel of s.related_articles) {
        expect(explicitSlugs.has(rel.slug)).toBe(false);
      }
    }
    expect(explicitlyCitedCount).toBeGreaterThanOrEqual(200);
    expect(explicitlyCitedCount).toBeLessThan(ALL_ENRICHED_SOURCES.length);

    const split = getSourcesForArticleSplit("01-definitions-and-mental-models");
    const expIds = new Set(split.explicitSources.map((s) => s.source_id));
    for (const r of split.relatedSources) {
      expect(expIds.has(r.source_id)).toBe(false);
    }
  });

  it("redacts sensitive internals from public health while reporting accurate source extraction breakdown", () => {
    const pub = getPublicHealth("local_sqlite_dev");
    const serialized = JSON.stringify(pub);

    expect(pub.status).toBe("healthy");
    expect(pub.knowledgePack.volumes).toBe(120);
    expect(pub.knowledgePack.sources.totalRegistered).toBe(320);
    expect(
      pub.knowledgePack.sources.fullExtraction +
        pub.knowledgePack.sources.targetedExtraction +
        pub.knowledgePack.sources.partialExtraction +
        pub.knowledgePack.sources.discoveryOnly +
        pub.knowledgePack.sources.inaccessible +
        pub.knowledgePack.sources.unverifiedRegistry,
    ).toBe(320);

    // Must never leak file paths, memory stats, Node version, or user account counts
    expect(serialized).not.toContain("filePath");
    expect(serialized).not.toContain("nodeVersion");
    expect(serialized).not.toContain("rssMb");
    expect(serialized).not.toContain("profiles");
    expect(serialized).not.toContain("progress_events");
  });

  it("passes strict pack CI validation on the real repository knowledge pack", () => {
    const res = validatePackAt(
      path.resolve(process.cwd(), "content/pack"),
      path.resolve(process.cwd(), "SS_content"),
    );
    expect(res.valid).toBe(true);
    expect(res.errors).toEqual([]);
    expect(res.stats.volumes).toBe(119);
    expect(res.stats.sources).toBe(320);
    expect(res.stats.danglingCitations).toBe(0);
    expect(res.stats.mirrorDriftFiles).toBe(0);
  });

  it("fails CI validation on dangling citations, mirror drift, malformed URLs, missing metadata, and low bounds", () => {
    const smallBounds = { minVolumes: 1, minSources: 2, minPrompts: 1, minAuditRows: 1 };

    // 1. Dangling citation [S999]
    const f1 = makeTempPackFixture({ markdownBody: "# Intro\nUnsupported claim [S999].\n" });
    try {
      const r1 = validatePackAt(f1.packDir, null, smallBounds);
      expect(r1.valid).toBe(false);
      expect(r1.stats.danglingCitations).toBe(1);
      expect(r1.errors.some((e) => e.includes("S999"))).toBe(true);
    } finally {
      fs.rmSync(f1.root, { recursive: true, force: true });
    }

    // 2. Mirror drift between content/pack and SS_content
    const f2 = makeTempPackFixture({
      markdownBody: "# Intro\nCanonical [S01].\n",
      mirrorBody: "# Intro\nDrifted copy [S01].\n",
    });
    try {
      const r2 = validatePackAt(f2.packDir, f2.mirrorDir, smallBounds);
      expect(r2.valid).toBe(false);
      expect(r2.stats.mirrorDriftFiles).toBe(1);
      expect(r2.errors.some((e) => e.toLowerCase().includes("drift"))).toBe(true);
    } finally {
      fs.rmSync(f2.root, { recursive: true, force: true });
    }

    // 3. Malformed / non-HTTP URL
    const f3 = makeTempPackFixture({
      sourcesCsv:
        "source_id,title,url\nS01,Valid,https://example.org/s01\nS02,Bad,javascript:alert(1)\n",
    });
    try {
      const r3 = validatePackAt(f3.packDir, null, smallBounds);
      expect(r3.valid).toBe(false);
      expect(r3.stats.invalidUrls).toBe(1);
    } finally {
      fs.rmSync(f3.root, { recursive: true, force: true });
    }

    // 4. Missing as_of metadata
    const f4 = makeTempPackFixture({ asOf: null });
    try {
      const r4 = validatePackAt(f4.packDir, null, smallBounds);
      expect(r4.valid).toBe(false);
      expect(r4.errors.some((e) => e.includes("as_of"))).toBe(true);
    } finally {
      fs.rmSync(f4.root, { recursive: true, force: true });
    }

    // 5. Below-minimum counts
    const f5 = makeTempPackFixture();
    try {
      const r5 = validatePackAt(f5.packDir, null, {
        minVolumes: 5,
        minSources: 10,
        minPrompts: 5,
        minAuditRows: 5,
      });
      expect(r5.valid).toBe(false);
      expect(r5.errors.length).toBeGreaterThanOrEqual(4);
    } finally {
      fs.rmSync(f5.root, { recursive: true, force: true });
    }
  });
});
