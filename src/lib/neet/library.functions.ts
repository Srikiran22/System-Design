import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/integrations/supabase/types";
import type {
  CoverageDeepRecord,
  CoverageResearchRecord,
  ScrapeAuditRecord,
  SourceRecord,
} from "./db.server";
import {
  ALL_ENRICHED_SOURCES,
  ENRICHED_SOURCES,
  getSourcesForArticle,
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
    } catch (err) {
      console.warn("[library.functions] Supabase query failed, falling back to local SQLite:", err);
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
      const rows = must(
        await db()
          .from("articles")
          .select("slug")
          .or(
            `title.ilike.%${term.replace(/[%,()]/g, " ")}%,summary.ilike.%${term.replace(/[%,()]/g, " ")}%,body.ilike.%${term.replace(/[%,()]/g, " ")}%`,
          )
          .limit(200),
      );
      return rows.map((r) => r.slug);
    } catch (err) {
      console.warn(
        "[library.functions] Supabase search failed, falling back to local SQLite:",
        err,
      );
      return localDb.searchArticles(term);
    }
  });

export const getArticle = createServerFn({ method: "GET" })
  .validator((slug: string) => String(slug))
  .handler(async ({ data: slug }) => {
    const { localDb } = await import("./db.server");
    if (!hasSupabase()) {
      const localRes = await localDb.getArticle(slug);
      if (!localRes) return null;
      return {
        ...localRes,
        citedSources: getSourcesForArticle(slug, localRes.article.body),
      };
    }
    try {
      const client = db();
      const res = await client
        .from("articles")
        .select("slug,filename,number,title,track,track_order,summary,body,word_count")
        .eq("slug", slug)
        .maybeSingle();
      if (res.error) throw new Error(res.error.message);
      const article = res.data;
      if (!article) return null;
      const nav = must(
        await client
          .from("articles")
          .select("slug,title,number,track_order")
          .order("track_order")
          .order("number", { nullsFirst: false }),
      );
      const i = nav.findIndex((n) => n.slug === slug);
      const files = must(await client.from("articles").select("slug,filename"));
      return {
        article,
        prev: i > 0 ? nav[i - 1]! : null,
        next: i < nav.length - 1 ? nav[i + 1]! : null,
        fileMap: Object.fromEntries(files.map((f) => [f.filename, f.slug])) as Record<
          string,
          string
        >,
        citedSources: getSourcesForArticle(slug, article.body),
      };
    } catch (err) {
      console.warn(
        "[library.functions] Supabase getArticle failed, falling back to local SQLite:",
        err,
      );
      const fallbackRes = await localDb.getArticle(slug);
      if (!fallbackRes) return null;
      return {
        ...fallbackRes,
        citedSources: getSourcesForArticle(slug, fallbackRes.article.body),
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
      } catch (err) {
        console.warn(
          "[library.functions] Supabase listSources failed, falling back to local SQLite:",
          err,
        );
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
        source_type: s.source_type || enriched?.source_type || "Reference",
        relevance: s.relevance || enriched?.relevance || "",
        quality_signal: s.quality_signal || enriched?.quality_signal || "",
        limitations: s.limitations || enriched?.limitations || "",
        ...(enriched?.audit ? { audit: enriched.audit } : {}),
        domain_topics: enriched?.domain_topics || [],
        summary: enriched?.summary || s.relevance || "",
        takeaways: enriched?.takeaways || "",
        cited_in_articles: enriched?.cited_in_articles || [],
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
  } catch (err) {
    console.warn(
      "[library.functions] Supabase listPrompts failed, falling back to local SQLite:",
      err,
    );
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
  } catch (err) {
    console.warn(
      "[library.functions] Supabase listRoles failed, falling back to local SQLite:",
      err,
    );
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
  } catch (err) {
    console.warn(
      "[library.functions] Supabase getCoverage failed, falling back to local SQLite:",
      err,
    );
    return localDb.getCoverage() as {
      deep: CoverageDeepRecord[];
      research: CoverageResearchRecord[];
      audit: ScrapeAuditRecord[];
      meta: Record<string, Json>;
    };
  }
});

export const getHealth = createServerFn({ method: "GET" }).handler(async () => {
  const { localDb } = await import("./db.server");
  return localDb.getSystemHealth();
});
