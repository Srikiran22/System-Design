import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/integrations/supabase/types";
import type {
  CoverageDeepRecord,
  CoverageResearchRecord,
  PublicHealthStatus,
  ScrapeAuditRecord,
  SourceRecord,
} from "./db.server";
import {
  ALL_ENRICHED_SOURCES,
  ENRICHED_SOURCES,
  PACK_FRESHNESS_AS_OF,
  getSourcesForArticleSplit,
  type EnrichedSource,
} from "./sourceEnrichment";

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
    const { localDb } = await import("./db.server");
    if (!hasSupabase()) {
      return localDb.listArticles();
    }
    try {
      return must(
        await db()
          .from("articles")
          .select("slug,number,title,track,track_order,summary,word_count")
          .order("track_order")
          .order("number", { nullsFirst: false }),
      );
    } catch {
      return localDb.listArticles();
    }
  },
);

export const searchArticles = createServerFn({ method: "GET" })
  .validator((q: string) => String(q ?? "").slice(0, 120))
  .handler(async ({ data: q }): Promise<string[]> => {
    const term = q.trim();
    if (!term) return [];
    const { localDb } = await import("./db.server");
    if (!hasSupabase()) {
      return localDb.searchArticles(term);
    }
    try {
      const sanitized = term.replace(/[%,()]/g, " ");
      const rows = must(
        await db()
          .from("articles")
          .select("slug")
          .or(`title.ilike.%${sanitized}%,summary.ilike.%${sanitized}%,body.ilike.%${sanitized}%`)
          .limit(200),
      );
      return rows.map((r) => r.slug);
    } catch {
      return localDb.searchArticles(term);
    }
  });

export const getArticle = createServerFn({ method: "GET" })
  .validator((slug: string) => String(slug))
  .handler(async ({ data: slug }) => {
    const { localDb } = await import("./db.server");
    const { explicitSources, relatedSources } = getSourcesForArticleSplit(slug);

    if (!hasSupabase()) {
      const localRes = await localDb.getArticle(slug);
      if (!localRes) return null;
      return {
        ...localRes,
        citedSources: explicitSources,
        explicitSources,
        relatedSources,
      };
    }
    try {
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
      };
    } catch {
      const fallbackRes = await localDb.getArticle(slug);
      if (!fallbackRes) return null;
      return {
        ...fallbackRes,
        citedSources: explicitSources,
        explicitSources,
        relatedSources,
      };
    }
  });

export const listSources = createServerFn({ method: "GET" }).handler(
  async (): Promise<EnrichedSource[]> => {
    let raw: SourceRecord[] = [];
    const { localDb } = await import("./db.server");
    if (!hasSupabase()) {
      raw = await localDb.listSources();
    } else {
      try {
        raw = must(await db().from("sources").select("*").order("sort").limit(1000));
      } catch {
        raw = await localDb.listSources();
      }
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
  const { localDb } = await import("./db.server");
  if (!hasSupabase()) {
    return localDb.listPrompts();
  }
  try {
    return must(await db().from("practice_prompts").select("*").order("sort"));
  } catch {
    return localDb.listPrompts();
  }
});

export const listRoles = createServerFn({ method: "GET" }).handler(async () => {
  const { localDb } = await import("./db.server");
  if (!hasSupabase()) {
    return localDb.listRoles();
  }
  try {
    return must(await db().from("roles").select("*").order("sort"));
  } catch {
    return localDb.listRoles();
  }
});

export const getCoverage = createServerFn({ method: "GET" }).handler(async () => {
  const { localDb } = await import("./db.server");
  if (!hasSupabase()) {
    return localDb.getCoverage() as {
      deep: CoverageDeepRecord[];
      research: CoverageResearchRecord[];
      audit: ScrapeAuditRecord[];
      meta: Record<string, Json>;
    };
  }
  try {
    const c = db();
    const [deep, research, audit, meta] = await Promise.all([
      c.from("coverage_deep").select("*").order("sort"),
      c.from("coverage_research").select("*").order("sort"),
      c.from("scrape_audit").select("*").order("sort"),
      c.from("pack_meta").select("*"),
    ]);
    return {
      deep: must(deep) as unknown as CoverageDeepRecord[],
      research: must(research) as unknown as CoverageResearchRecord[],
      audit: must(audit) as unknown as ScrapeAuditRecord[],
      meta: Object.fromEntries(must(meta).map((m) => [m.key, m.value])) as Record<string, Json>,
    };
  } catch {
    return localDb.getCoverage() as {
      deep: CoverageDeepRecord[];
      research: CoverageResearchRecord[];
      audit: ScrapeAuditRecord[];
      meta: Record<string, Json>;
    };
  }
});

export interface PublicHealthResponse extends PublicHealthStatus {
  authMode: "supabase" | "local_dev";
  supabaseReadiness: "connected" | "degraded" | "not_configured";
  freshnessAsOf: string;
}

/** Public redacted health check: never exposes server file paths, runtime internals, or user counts. */
export const getHealth = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicHealthResponse> => {
    const { localDb } = await import("./db.server");
    const configured = hasSupabase();
    const pub = localDb.getPublicHealth(configured ? "supabase" : "local_sqlite_dev");
    let supabaseReadiness: "connected" | "degraded" | "not_configured" = configured
      ? "connected"
      : "not_configured";

    if (configured) {
      try {
        const res = await db().from("pack_meta").select("key").limit(1);
        if (res.error) supabaseReadiness = "degraded";
      } catch {
        supabaseReadiness = "degraded";
      }
    }

    return {
      ...pub,
      status: pub.status === "healthy" && supabaseReadiness !== "degraded" ? "healthy" : "degraded",
      authMode: configured ? "supabase" : "local_dev",
      supabaseReadiness,
      freshnessAsOf: PACK_FRESHNESS_AS_OF,
    };
  },
);
