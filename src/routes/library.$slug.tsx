import { createFileRoute, notFound } from "@tanstack/react-router";
import Link from "@/components/neet/AppLink";
import Breadcrumbs from "@/components/neet/Breadcrumbs";
import Markdown from "@/components/neet/Markdown";
import { slugify } from "@/components/neet/LessonBlocks";
import { LoadError } from "@/components/neet/ui";
import { getArticle } from "@/lib/neet/library.functions";
import type { EnrichedSource } from "@/lib/neet/sourceEnrichment";
import { pageHead } from "@/lib/neet/meta";

export const Route = createFileRoute("/library/$slug")({
  loader: async ({ params }) => {
    const data = await getArticle({ data: params.slug });
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) =>
    pageHead(
      loaderData?.article.title ?? "Library",
      loaderData?.article.summary.slice(0, 160) || "A volume from the knowledge pack.",
    ),
  errorComponent: ({ error }) => <LoadError error={error} />,
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl px-5 py-24 text-center">
      <h1 className="text-3xl font-semibold">Volume not found</h1>
      <Link href="/library" className="btn-ink mt-6">
        Back to library
      </Link>
    </div>
  ),
  component: ArticlePage,
});

function provenanceTone(status: EnrichedSource["provenance_status"]): string {
  switch (status) {
    case "full-extraction":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
    case "targeted-extraction":
      return "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20";
    case "discovery-only":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
    case "partial-or-blocked":
      return "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20";
    default:
      return "bg-surface-2 text-muted border-line";
  }
}

function SourceReferenceCard({ s }: { s: EnrichedSource }) {
  return (
    <div className="group flex flex-col justify-between rounded-2xl border border-line bg-surface p-4 hover:border-accent/40 hover:bg-surface-2 transition-all shadow-xs">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="rounded-full bg-ink px-2.5 py-0.5 font-mono text-[11px] font-semibold text-bg">
              {s.source_id}
            </span>
            <span className="text-[11px] text-muted capitalize">
              {s.authority_tier.replace(/-/g, " ")}
            </span>
          </div>
          <span
            className={`rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize ${provenanceTone(s.provenance_status)}`}
          >
            {s.provenance_status.replace(/-/g, " ")}
          </span>
        </div>
        <h3 className="mt-2.5 font-semibold leading-snug text-text group-hover:text-accent transition-colors">
          {s.title}
        </h3>
        {s.relevance && (
          <p className="mt-1.5 text-xs text-muted line-clamp-2 leading-relaxed">{s.relevance}</p>
        )}
        <p className="mt-2 text-[10px] text-muted">As of {s.freshness_as_of}</p>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-line/60 pt-3 text-xs">
        <Link
          href={`/sources#${s.source_id}`}
          className="font-medium text-accent hover:underline flex items-center gap-1"
        >
          Source register <span>→</span>
        </Link>
        {s.url && s.url_valid && (
          <a
            href={s.url}
            target="_blank"
            rel="noreferrer"
            className="text-muted hover:text-text transition-colors flex items-center gap-0.5"
          >
            Publisher <span>↗</span>
          </a>
        )}
      </div>
    </div>
  );
}

function ArticlePage() {
  const { article, prev, next, fileMap, explicitSources, relatedSources } = Route.useLoaderData();
  const headings = Array.from(article.body.matchAll(/^##\s+(.+)$/gm)).map((m) =>
    m[1]!.replace(/[*_`]/g, "").trim(),
  );

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-5 lg:grid-cols-[minmax(0,1fr)_15rem]">
      <article className="min-w-0">
        <Breadcrumbs
          items={[
            { label: "Library", href: "/library" },
            { label: article.track, href: `/library?track=${encodeURIComponent(article.track)}` },
            { label: article.number === null ? "Guide" : `No. ${article.number}` },
          ]}
        />
        <p className="mt-8 text-sm text-muted">
          {article.track} · {Math.max(1, Math.round(article.word_count / 220))} min read ·{" "}
          {article.word_count.toLocaleString()} words
        </p>
        <h1 className="mt-2 text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl">
          {article.title}
        </h1>

        {headings.length > 2 && (
          <details className="mt-6 rounded-2xl bg-surface p-4 lg:hidden">
            <summary className="cursor-pointer text-sm font-medium">On this page</summary>
            <ul className="mt-3 space-y-2 text-sm">
              {headings.map((h) => (
                <li key={h}>
                  <a href={`#${slugify(h)}`} className="text-muted hover:text-accent">
                    {h}
                  </a>
                </li>
              ))}
              {explicitSources.length > 0 && (
                <li>
                  <a href="#cited-sources" className="font-medium text-accent">
                    Explicitly cited ({explicitSources.length})
                  </a>
                </li>
              )}
              {relatedSources.length > 0 && (
                <li>
                  <a href="#related-sources" className="text-muted hover:text-accent">
                    Related reading ({relatedSources.length})
                  </a>
                </li>
              )}
            </ul>
          </details>
        )}

        <div className="mt-6 max-w-[72ch]">
          <Markdown body={article.body} fileMap={fileMap} />
        </div>

        {explicitSources.length > 0 && (
          <section id="cited-sources" className="mt-16 border-t border-line pt-10">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-2xl font-semibold leading-tight">
                Explicitly cited in this volume
              </h2>
              <span className="text-xs font-mono font-medium text-accent">
                {explicitSources.length}{" "}
                {explicitSources.length === 1 ? "direct citation" : "direct citations"}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted">
              Sources directly referenced by canonical ID in this volume&apos;s text, with authority
              tier and extraction provenance status.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {explicitSources.map((s) => (
                <SourceReferenceCard key={s.source_id} s={s} />
              ))}
            </div>
          </section>
        )}

        {relatedSources.length > 0 && (
          <section id="related-sources" className="mt-12 border-t border-line/70 pt-8">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-xl font-semibold leading-tight">
                Related reference reading (topic-matched)
              </h2>
              <span className="text-xs font-mono text-muted">
                {relatedSources.length} suggested
              </span>
            </div>
            <p className="mt-1.5 text-xs text-muted">
              Not explicitly cited in this volume&apos;s prose — surfaced from the source register
              by shared domain topic for further verification.
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {relatedSources.map((s) => (
                <SourceReferenceCard key={s.source_id} s={s} />
              ))}
            </div>
          </section>
        )}

        <nav
          className="mt-16 grid gap-3 border-t border-line pt-8 sm:grid-cols-2"
          aria-label="Volume navigation"
        >
          {prev ? (
            <Link
              href={`/library/${prev.slug}`}
              className="rounded-3xl bg-surface p-5 hover:bg-surface-2"
            >
              <span className="text-xs text-muted">← Previous</span>
              <span className="mt-1 block font-medium">{prev.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              href={`/library/${next.slug}`}
              className="rounded-3xl bg-surface p-5 text-right hover:bg-surface-2"
            >
              <span className="text-xs text-muted">Next →</span>
              <span className="mt-1 block font-medium">{next.title}</span>
            </Link>
          )}
        </nav>
      </article>

      <aside className="hidden lg:sticky lg:top-24 lg:block lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-auto">
        <nav aria-label="On this page">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">On this page</p>
          <ul className="mt-3 space-y-2 border-l border-line pl-4 text-sm">
            {headings.map((h) => (
              <li key={h}>
                <a href={`#${slugify(h)}`} className="text-muted hover:text-accent">
                  {h}
                </a>
              </li>
            ))}
            {explicitSources.length > 0 && (
              <li key="cited-sources">
                <a href="#cited-sources" className="font-medium text-accent hover:underline">
                  Explicitly cited ({explicitSources.length})
                </a>
              </li>
            )}
            {relatedSources.length > 0 && (
              <li key="related-sources">
                <a href="#related-sources" className="text-muted hover:text-accent">
                  Related reading ({relatedSources.length})
                </a>
              </li>
            )}
          </ul>
        </nav>
      </aside>
    </div>
  );
}
