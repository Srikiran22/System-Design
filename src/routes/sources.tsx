import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import Link from "@/components/neet/AppLink";
import { Chip, Empty, Field, LoadError, PageHeader, SearchField } from "@/components/neet/ui";
import { listSources } from "@/lib/neet/library.functions";
import { pageHead } from "@/lib/neet/meta";

export const Route = createFileRoute("/sources")({
  loader: () => listSources(),
  head: () =>
    pageHead(
      "Source library",
      "Every referenced handbook, standard, paper and course with its quality signal, scrape audit and cross-volume citations.",
    ),
  errorComponent: ({ error }) => <LoadError error={error} />,
  component: Sources,
});

function Sources() {
  const sources = Route.useLoaderData();
  const [q, setQ] = useState("");
  const [type, setType] = useState<string | null>(null);
  const [topic, setTopic] = useState<string | null>(null);
  const [limit, setLimit] = useState(50);
  const [activeHash, setActiveHash] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "");
      if (hash) {
        setActiveHash(hash);
        // Find index of targeted source and expand limit if needed
        const idx = sources.findIndex((s) => s.source_id.toLowerCase() === hash.toLowerCase());
        if (idx >= 0 && idx >= limit) {
          setLimit(idx + 20);
        }
        setTimeout(() => {
          const el = document.getElementById(hash);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 200);
      }
    }
  }, [sources, limit]);

  const types = useMemo(() => {
    const c = new Map<string, number>();
    sources.forEach((s) => s.source_type && c.set(s.source_type, (c.get(s.source_type) ?? 0) + 1));
    return [...c.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map((x) => x[0]);
  }, [sources]);

  const domainTopics = useMemo(() => {
    const c = new Map<string, number>();
    sources.forEach((s) => {
      s.domain_topics?.forEach((t) => c.set(t, (c.get(t) ?? 0) + 1));
    });
    return [...c.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map((x) => x[0]);
  }, [sources]);

  const list = useMemo(() => {
    const t = q.toLowerCase().trim();
    return sources.filter((s) => {
      const matchType = !type || s.source_type === type;
      const matchTopic = !topic || s.domain_topics?.includes(topic);
      if (!matchType || !matchTopic) return false;
      if (!t) return true;

      const articleTitles = s.cited_in_articles?.map((a) => a.title).join(" ") || "";
      const topicsStr = s.domain_topics?.join(" ") || "";
      const fullSearch = [
        s.source_id,
        s.title,
        s.relevance,
        s.source_type,
        s.limitations,
        s.takeaways,
        s.audit?.status,
        s.audit?.tools,
        topicsStr,
        articleTitles,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return fullSearch.includes(t);
    });
  }, [sources, q, type, topic]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-5 md:py-16">
      <PageHeader eyebrow="Sources" title="Source register">
        {sources.length} records. Every handbook, standard, paper and tool mapped directly to the
        knowledge pack volumes where it is cited, with verified audit status and practical
        takeaways.
      </PageHeader>

      <div className="mt-8 space-y-4">
        <SearchField
          value={q}
          onChange={(v) => {
            setQ(v);
            setLimit(50);
          }}
          placeholder="Search by ID (e.g. S01), title, domain, standard, or cited volume…"
        />

        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            Filter by Domain Topic
          </span>
          <div className="mt-1.5 flex gap-2 overflow-x-auto pb-1">
            <Chip active={!topic} onClick={() => setTopic(null)}>
              All topics
            </Chip>
            {domainTopics.map((dt) => (
              <Chip
                key={dt}
                active={topic === dt}
                onClick={() => setTopic(dt === topic ? null : dt)}
              >
                {dt}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            Filter by Source Type
          </span>
          <div className="mt-1.5 flex gap-2 overflow-x-auto pb-1">
            <Chip active={!type} onClick={() => setType(null)}>
              All types
            </Chip>
            {types.map((st) => (
              <Chip key={st} active={type === st} onClick={() => setType(st === type ? null : st)}>
                {st}
              </Chip>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between text-sm text-muted">
        <p>
          {list.length} shown of {sources.length}
        </p>
        {(type || topic || q) && (
          <button
            type="button"
            onClick={() => {
              setType(null);
              setTopic(null);
              setQ("");
            }}
            className="text-xs text-accent hover:underline cursor-pointer"
          >
            Clear filters
          </button>
        )}
      </div>

      <ul className="mt-4 grid gap-4 md:grid-cols-2">
        {list.length === 0 && (
          <li className="md:col-span-2">
            <Empty>No sources match your query.</Empty>
          </li>
        )}

        {list.slice(0, limit).map((s) => {
          const isTargeted = activeHash.toUpperCase() === s.source_id.toUpperCase();

          return (
            <li
              key={s.source_id}
              id={s.source_id}
              className={`rounded-3xl bg-surface p-5 transition-all scroll-mt-28 border ${
                isTargeted
                  ? "border-accent ring-2 ring-accent/30 shadow-lg bg-surface-2"
                  : "border-line hover:border-accent/40"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-ink px-2.5 py-1 font-mono font-medium text-bg">
                    {s.source_id}
                  </span>
                  {s.source_type && <span className="font-medium text-muted">{s.source_type}</span>}
                </div>

                {s.audit && (
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
                      s.audit.status.toLowerCase().includes("full")
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        : s.audit.status.toLowerCase().includes("targeted")
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                          : "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20"
                    }`}
                  >
                    {s.audit.status}
                  </span>
                )}
              </div>

              <h2 className="mt-3 text-lg font-semibold leading-snug">
                {s.url ? (
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-accent transition-colors flex items-center gap-1.5"
                  >
                    <span>{s.title}</span>
                    <span className="text-xs text-muted">↗</span>
                  </a>
                ) : (
                  s.title
                )}
              </h2>

              {s.domain_topics && s.domain_topics.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1">
                  {s.domain_topics.map((t) => (
                    <span
                      key={t}
                      className="rounded-md bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-muted"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}

              <dl className="mt-4 grid gap-2.5 text-sm">
                <Field label="Relevance">{s.relevance}</Field>
                {s.takeaways && <Field label="Key takeaway">{s.takeaways}</Field>}
                <Field label="Quality signal">{s.quality_signal}</Field>
                <Field label="Limitations">{s.limitations}</Field>
                {s.audit?.extraction_extent && (
                  <Field label="Extraction extent">{s.audit.extraction_extent}</Field>
                )}
              </dl>

              {s.cited_in_articles && s.cited_in_articles.length > 0 && (
                <div className="mt-4 pt-3 border-t border-line/60">
                  <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                    Cited in {s.cited_in_articles.length}{" "}
                    {s.cited_in_articles.length === 1 ? "volume" : "volumes"}:
                  </span>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {s.cited_in_articles.map((art) => (
                      <Link
                        key={art.slug}
                        href={`/library/${art.slug}`}
                        className="inline-flex items-center gap-1 rounded-md bg-surface-2 px-2 py-0.5 text-xs text-text hover:bg-accent/20 hover:text-accent transition-colors border border-transparent hover:border-accent/30"
                      >
                        <span className="font-mono text-[10px] text-muted">
                          {art.number !== null ? `No. ${art.number}` : "Guide"}
                        </span>
                        <span className="truncate max-w-[200px]">{art.title}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {list.length > limit && (
        <div className="mt-10 text-center">
          <button
            type="button"
            className="btn-soft px-6 py-2.5"
            onClick={() => setLimit((l) => l + 60)}
          >
            Show more ({list.length - limit} remaining)
          </button>
        </div>
      )}
    </div>
  );
}
