import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/integrations/supabase/types";
import type {
  CoverageDeepRecord,
  CoverageResearchRecord,
  PublicHealthStatus,
  ScrapeAuditRecord,
  SourceRecord,
} from "./db.server";
import { CITATION_ALIASES, type CitationTooltipData } from "./citationAliases";
import {
  ALL_ENRICHED_SOURCES,
  ENRICHED_SOURCES,
  PACK_FRESHNESS_AS_OF,
  getSourcesForArticleSplit,
  type EnrichedSource,
} from "./sourceEnrichment";
import { checkRateLimit, extractClientKey } from "./rate-limit.server";
import { measureOperation } from "./metrics.server";

export type ArticleListItem = {
  slug: string;
  number: number | null;
  title: string;
  track: string;
  track_order: number;
  summary: string;
  word_count: number;
};

type CachedArticleManifest = {
  expiresAt: number;
  nav: Array<{ slug: string; title: string; number: number | null; track_order: number }>;
  fileMap: Record<string, string>;
};

let manifestCache: CachedArticleManifest | null = null;
const MANIFEST_TTL_MS = 5 * 60_000;

function hasSupabase(): boolean {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  return Boolean(url && key && url.trim().length > 0 && key.trim().length > 0);
}

/** Public read-only client for the knowledge pack (anon SELECT policies). */
function db() {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`)
          h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

function must<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

/** Build a compact per-article citation map so Markdown never bundles the 932 KB source registry on the client. */
function buildArticleCitationMap(
  body: string,
  explicitSources: EnrichedSource[],
  relatedSources: EnrichedSource[],
): Record<string, CitationTooltipData> {
  const ids = new Set<string>();
  for (const s of explicitSources) ids.add(s.source_id);
  for (const s of relatedSources) ids.add(s.source_id);

  // Extract any [Sxx] or verified alias citations appearing in the markdown body
  const sMatches = body.match(/S\d{2,3}/g) ?? [];
  for (const sid of sMatches) ids.add(sid);
  for (const [alias, canonical] of Object.entries(CITATION_ALIASES)) {
    if (body.includes(alias)) ids.add(canonical);
  }

  const map: Record<string, CitationTooltipData> = {};
  for (const id of ids) {
    const src = ENRICHED_SOURCES[id];
    if (!src) continue;
    map[id] = {
      source_id: src.source_id,
      title: src.title,
      authority_tier: src.authority_tier,
      provenance_status: src.provenance_status,
      relevance: src.relevance,
      freshness_as_of: src.freshness_as_of,
    };
  }
  return map;
}

async function getSupabaseArticleManifest() {
  const now = Date.now();
  if (manifestCache && manifestCache.expiresAt > now) {
    return manifestCache;
  }
  const client = db();
  const rows = must(
    await client
      .from("articles")
      .select("slug,filename,title,number,track_order")
      .order("track_order")
      .order("number", { nullsFirst: false }),
  );
  manifestCache = {
    expiresAt: now + MANIFEST_TTL_MS,
    nav: rows.map((r) => ({
      slug: r.slug,
      title: r.title,
      number: r.number,
      track_order: r.track_order,
    })),
    fileMap: Object.fromEntries(rows.map((r) => [r.filename, r.slug])),
  };
  return manifestCache;
}

export const listArticles = createServerFn({ method: "GET" }).handler(
  async (): Promise<ArticleListItem[]> => {
    if (!hasSupabase()) {
      const { localDb } = await import("./db.server");
      return localDb.listArticles();
    }
    return must(
      await db()
        .from("articles")
        .select("slug,number,title,track,track_order,summary,word_count")
        .order("track_order")
        .order("number", { nullsFirst: false }),
    );
  },
);

export const searchArticles = createServerFn({ method: "GET" })
  .validator((q: string) => String(q ?? "").slice(0, 120))
  .handler(async ({ data: q }): Promise<string[]> =>
    measureOperation("library.searchArticles", async () => {
      const term = q.trim();
      if (!term) return [];
      const rl = checkRateLimit("search", extractClientKey(getRequest()));
      if (!rl.allowed) return [];
      if (!hasSupabase()) {
        const { localDb } = await import("./db.server");
        return localDb.searchArticles(term);
      }
      const sanitized = term.replace(/[%,()]/g, " ");
      const rows = must(
        await db()
          .from("articles")
          .select("slug")
          .or(`title.ilike.%${sanitized}%,summary.ilike.%${sanitized}%,body.ilike.%${sanitized}%`)
          .limit(200),
      );
      return rows.map((r) => r.slug);
    }),
  );

export const getArticle = createServerFn({ method: "GET" })
  .validator((slug: string) => String(slug))
  .handler(async ({ data: slug }) => {
    const { explicitSources, relatedSources } = getSourcesForArticleSplit(slug);

    if (!hasSupabase()) {
      const { localDb } = await import("./db.server");
      const localRes = await localDb.getArticle(slug);
      if (!localRes) return null;
      return {
        ...localRes,
        citedSources: explicitSources,
        explicitSources,
        relatedSources,
        citationMap: buildArticleCitationMap(
          localRes.article.body,
          explicitSources,
          relatedSources,
        ),
      };
    }

    const client = db();
    const [res, manifest] = await Promise.all([
      client
        .from("articles")
        .select("slug,filename,number,title,track,track_order,summary,body,word_count")
        .eq("slug", slug)
        .maybeSingle(),
      getSupabaseArticleManifest(),
    ]);
    if (res.error) throw new Error(res.error.message);
    const article = res.data;
    if (!article) return null;
    const i = manifest.nav.findIndex((n) => n.slug === slug);
    return {
      article,
      prev: i > 0 ? manifest.nav[i - 1]! : null,
      next: i < manifest.nav.length - 1 ? manifest.nav[i + 1]! : null,
      fileMap: manifest.fileMap,
      citedSources: explicitSources,
      explicitSources,
      relatedSources,
      citationMap: buildArticleCitationMap(article.body, explicitSources, relatedSources),
    };
  });

export const listSources = createServerFn({ method: "GET" }).handler(
  async (): Promise<EnrichedSource[]> => {
    let raw: SourceRecord[] = [];
    if (!hasSupabase()) {
      const { localDb } = await import("./db.server");
      raw = await localDb.listSources();
    } else {
      raw = must(
        await db()
          .from("sources")
          .select(
            "sort, source_id, title, url, source_type, relevance, quality_signal, limitations",
          )
          .order("sort")
          .limit(1000),
      );
    }

    if (!raw || raw.length === 0) {
      return ALL_ENRICHED_SOURCES;
    }

    return raw.map((s): EnrichedSource => {
      const enriched = ENRICHED_SOURCES[s.source_id];
      return {
        source_id: s.source_id,
        title: s.title || enriched?.title || "",
        url: s.url || enriched?.url || null,
        url_valid: enriched?.url_valid ?? Boolean(s.url && /^https?:\/\//i.test(s.url)),
        source_type: s.source_type || enriched?.source_type || "Reference",
        authority_tier: enriched?.authority_tier ?? "secondary-reference",
        provenance_status: enriched?.provenance_status ?? "unaudited",
        freshness_as_of: enriched?.freshness_as_of ?? PACK_FRESHNESS_AS_OF,
        licensing_note:
          enriched?.licensing_note ??
          "External reference — verify current edition and license terms at the publisher URL.",
        relevance: s.relevance || enriched?.relevance || "",
        quality_signal: s.quality_signal || enriched?.quality_signal || "",
        limitations: s.limitations || enriched?.limitations || "",
        ...(enriched?.audit ? { audit: enriched.audit } : {}),
        domain_topics: enriched?.domain_topics || [],
        summary: enriched?.summary || s.relevance || "",
        takeaways: enriched?.takeaways || "",
        cited_in_articles: enriched?.cited_in_articles || [],
        related_articles: enriched?.related_articles || [],
      };
    });
  },
);

export const listPrompts = createServerFn({ method: "GET" }).handler(async () => {
  if (!hasSupabase()) {
    const { localDb } = await import("./db.server");
    return localDb.listPrompts();
  }
  return must(
    await db()
      .from("practice_prompts")
      .select("sort, prompt_id, exercise, primary_concepts, required_artifacts")
      .order("sort")
      .limit(500),
  );
});

export const listRoles = createServerFn({ method: "GET" }).handler(async () => {
  if (!hasSupabase()) {
    const { localDb } = await import("./db.server");
    return localDb.listRoles();
  }
  return must(
    await db()
      .from("roles")
      .select(
        "id, sort, role, career_level, competency_areas, typical_deliverables, source_anchors, portfolio_project",
      )
      .order("sort")
      .limit(200),
  );
});

export const getCoverage = createServerFn({ method: "GET" }).handler(async () => {
  if (!hasSupabase()) {
    const { localDb } = await import("./db.server");
    return localDb.getCoverage() as {
      deep: CoverageDeepRecord[];
      research: CoverageResearchRecord[];
      audit: ScrapeAuditRecord[];
      meta: Record<string, Json>;
    };
  }
  const c = db();
  const [deep, research, audit, meta] = await Promise.all([
    c
      .from("coverage_deep")
      .select(
        "id, sort, domain, depth_in_repository, new_deep_volumes, primary_source_anchors, evidence_status, remaining_gap, next_validation_action",
      )
      .order("sort")
      .limit(200),
    c
      .from("coverage_research")
      .select(
        "id, sort, domain, knowledge_files, source_anchors, known_limitations_or_gaps, coverage_status",
      )
      .order("sort")
      .limit(200),
    c
      .from("scrape_audit")
      .select(
        "id, sort, research_ref, canonical_source_id, title, url, status, tools, extraction_extent, limitations",
      )
      .order("sort")
      .limit(1000),
    c.from("pack_meta").select("key, value").limit(100),
  ]);
  return {
    deep: must(deep) as unknown as CoverageDeepRecord[],
    research: must(research) as unknown as CoverageResearchRecord[],
    audit: must(audit) as unknown as ScrapeAuditRecord[],
    meta: Object.fromEntries(must(meta).map((m) => [m.key, m.value])) as Record<string, Json>,
  };
});

export interface LivenessResponse {
  status: "alive";
  timestamp: string;
  runtime: "edge_or_node";
}

/** Pure process liveness probe: zero database imports or external network calls. */
export const getLiveness = createServerFn({ method: "GET" }).handler(
  async (): Promise<LivenessResponse> => ({
    status: "alive",
    timestamp: new Date().toISOString(),
    runtime: "edge_or_node",
  }),
);

export interface PublicHealthResponse extends PublicHealthStatus {
  authMode: "supabase" | "local_dev";
  supabaseReadiness: "connected" | "degraded" | "not_configured";
  freshnessAsOf: string;
}

function summarizeStaticProvenance() {
  let fullExtraction = 0;
  let targetedExtraction = 0;
  let partialExtraction = 0;
  let discoveryOnly = 0;
  let inaccessible = 0;
  let unverifiedRegistry = 0;
  for (const s of ALL_ENRICHED_SOURCES) {
    switch (s.provenance_status) {
      case "full-extraction":
        fullExtraction++;
        break;
      case "targeted-extraction":
        targetedExtraction++;
        break;
      case "partial-or-blocked":
        if (s.audit?.status?.toLowerCase().includes("partial")) partialExtraction++;
        else inaccessible++;
        break;
      case "discovery-only":
        discoveryOnly++;
        break;
      default:
        unverifiedRegistry++;
        break;
    }
  }
  return {
    totalRegistered: ALL_ENRICHED_SOURCES.length,
    auditedCount: Math.max(0, ALL_ENRICHED_SOURCES.length - unverifiedRegistry),
    fullExtraction,
    targetedExtraction,
    partialExtraction,
    discoveryOnly,
    inaccessible,
    unverifiedRegistry,
  };
}

/**
 * Public redacted readiness check:
 * - Never exposes server file paths, runtime internals, or user counts.
 * - Never imports node:sqlite (`db.server`) when Supabase is configured.
 */
export const getHealth = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicHealthResponse> => {
    const configured = hasSupabase();

    if (!configured) {
      const { localDb } = await import("./db.server");
      const pub = localDb.getPublicHealth("local_sqlite_dev");
      return {
        ...pub,
        authMode: "local_dev",
        supabaseReadiness: "not_configured",
        freshnessAsOf: PACK_FRESHNESS_AS_OF,
      };
    }

    // Cloud/Supabase path: zero db.server / node:sqlite import
    const sourcesBreakdown = summarizeStaticProvenance();
    try {
      const client = db();
      const [metaRes, articlesRes, promptsRes, rolesRes, covDeepRes, covResearchRes] =
        await Promise.all([
          client.from("pack_meta").select("key").limit(1),
          client.from("articles").select("slug", { count: "exact", head: true }),
          client.from("practice_prompts").select("id", { count: "exact", head: true }),
          client.from("roles").select("id", { count: "exact", head: true }),
          client.from("coverage_deep").select("id", { count: "exact", head: true }),
          client.from("coverage_research").select("id", { count: "exact", head: true }),
        ]);
      const connected = !metaRes.error && !articlesRes.error;
      const volumes = articlesRes.count ?? 0;

      return {
        status: connected && volumes >= 119 ? "healthy" : "degraded",
        timestamp: new Date().toISOString(),
        version: "2.1.0",
        storageMode: "supabase",
        knowledgePack: {
          volumes,
          sources: sourcesBreakdown,
          practicePrompts: promptsRes.count ?? 0,
          careerRoles: rolesRes.count ?? 0,
          deepCoverageDomains: covDeepRes.count ?? 0,
          researchCoverageDomains: covResearchRes.count ?? 0,
        },
        authMode: "supabase",
        supabaseReadiness: connected ? "connected" : "degraded",
        freshnessAsOf: PACK_FRESHNESS_AS_OF,
      };
    } catch {
      return {
        status: "degraded",
        timestamp: new Date().toISOString(),
        version: "2.1.0",
        storageMode: "supabase",
        knowledgePack: {
          volumes: 0,
          sources: sourcesBreakdown,
          practicePrompts: 0,
          careerRoles: 0,
          deepCoverageDomains: 0,
          researchCoverageDomains: 0,
        },
        authMode: "supabase",
        supabaseReadiness: "degraded",
        freshnessAsOf: PACK_FRESHNESS_AS_OF,
      };
    }
  },
);
