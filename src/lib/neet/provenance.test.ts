// @vitest-environment node
import { describe, it, expect } from "vitest";
import {
  ALL_ENRICHED_SOURCES,
  CITATION_ALIASES,
  ENRICHED_SOURCES,
  getSourcesForArticleSplit,
} from "./sourceEnrichment";
import { getPublicHealth } from "./db.server";

describe("Knowledge & Research Provenance Governance (Phase 4)", () => {
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
    // At least 200 sources are explicitly cited; uncited sources stay out of cited_in_articles
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
});
