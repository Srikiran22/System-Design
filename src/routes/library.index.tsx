import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import Link from "@/components/neet/AppLink";
import { Chip, Empty, LoadError, PageHeader, SearchField } from "@/components/neet/ui";
import { listArticles, searchArticles } from "@/lib/neet/library.functions";
import { pageHead } from "@/lib/neet/meta";

type Search = { q?: string | undefined; track?: string | undefined };

export const Route = createFileRoute("/library/")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    q: typeof s["q"] === "string" ? s["q"] : undefined,
    track: typeof s["track"] === "string" ? s["track"] : undefined,
  }),
  loader: () => listArticles(),
  head: () =>
    pageHead("Library", "Browse articles by subject."),
  errorComponent: ({ error }) => <LoadError error={error} />,
  component: Library,
});

function Library() {
  const articles = Route.useLoaderData();
  const { q = "", track } = Route.useSearch();
  const navigate = useNavigate({ from: "/library/" });
  const [input, setInput] = useState(q);
  const [bodyHits, setBodyHits] = useState<string[] | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      if (input !== q) {
        navigate({ search: (p) => ({ ...p, q: input || undefined }), replace: true });
      }
      if (input.trim().length >= 3)
        searchArticles({ data: input })
          .then(setBodyHits)
          .catch(() => setBodyHits(null));
      else setBodyHits(null);
    }, 250);
    return () => clearTimeout(t);
  }, [input, q, navigate]);

  const tracks = useMemo(
    () =>
      Array.from(new Map(articles.map((a) => [a.track, a.track_order])).entries())
        .sort((a, b) => a[1] - b[1])
        .map((x) => x[0]),
    [articles],
  );
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return articles.filter(
      (a) =>
        (!track || a.track === track) &&
        (!t ||
          a.title.toLowerCase().includes(t) ||
          a.summary.toLowerCase().includes(t) ||
          bodyHits?.includes(a.slug)),
    );
  }, [articles, q, track, bodyHits]);
  const groups = tracks
    .map((t) => ({ t, items: filtered.filter((a) => a.track === t) }))
    .filter((g) => g.items.length);
  const [openSet, setOpenSet] = useState<Set<string>>(() => new Set());
  const toggle = (t: string) =>
    setOpenSet((s) => {
      const n = new Set(s);
      if (n.has(t)) {
        n.delete(t);
      } else {
        n.add(t);
      }
      return n;
    });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-5 md:py-16">
      <PageHeader eyebrow="Library" title="Browse by track">
        {articles.length} volumes across {tracks.length} tracks.
      </PageHeader>

      <div className="sticky top-16 z-20 -mx-4 mt-8 bg-bg/90 px-4 py-3 backdrop-blur sm:-mx-5 sm:px-5">
        <SearchField
          value={input}
          onChange={setInput}
          placeholder="Search titles, summaries and full text…"
        />
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          <Chip
            active={!track}
            onClick={() => navigate({ search: (p) => ({ ...p, track: undefined }) })}
          >
            All
          </Chip>
          {tracks.map((t) => (
            <Chip
              key={t}
              active={track === t}
              onClick={() => navigate({ search: (p) => ({ ...p, track: t }) })}
            >
              {t}
            </Chip>
          ))}
        </div>
      </div>

      <p className="mt-10 text-xs font-medium uppercase tracking-[0.2em] text-accent">
        TRACKS: {tracks.length} / VOLUMES: {articles.length}
      </p>
      <p className="mt-2 text-muted">Open a folder to view its readings.</p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {groups.length === 0 && (
          <div className="pt-8">
            <Empty>No volumes match “{q}”.</Empty>
          </div>
        )}
        {groups.map(({ t, items }) => {
          const isOpen = !!q || !!track || openSet.has(t);
          const mins = items.reduce((n, a) => n + Math.max(1, Math.round(a.word_count / 220)), 0);
          return (
            <section key={t} className="folder-card p-5 pt-7">
              <span className="folder-tab">TRACK</span>
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => toggle(t)}
                className="group flex w-full items-center justify-between gap-3 text-left"
              >
                <span className="min-w-0 flex-1 font-display text-lg font-bold tracking-tight text-text transition group-hover:text-accent">
                  {t}
                </span>
                <span className="whitespace-nowrap text-xs text-muted">
                  {items.length} {items.length === 1 ? "volume" : "volumes"} · ~
                  {mins < 60 ? `${mins} min` : `${Math.round(mins / 60)}h`}
                </span>
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full bg-surface text-muted transition ${isOpen ? "rotate-45 bg-text text-bg" : ""}`}
                  aria-hidden
                >
                  +
                </span>
              </button>
              {isOpen && (
                <ol className="mt-4 border-t border-line pt-2">
                  {items.map((a) => (
                    <li key={a.slug}>
                      <Link
                        href={`/library/${a.slug}`}
                        className="group grid grid-cols-[2rem_1fr_auto] items-baseline gap-3 rounded-md px-2 py-3 transition hover:bg-surface-3"
                      >
                        <span className="text-xs tabular-nums text-muted">
                          {a.number === null ? "—" : String(a.number).padStart(2, "0")}
                        </span>
                        <span className="min-w-0">
                          <span className="block font-medium text-text group-hover:text-accent">
                            {a.title}
                          </span>
                          <span className="mt-0.5 line-clamp-1 block text-sm text-muted">
                            {a.summary}
                          </span>
                        </span>
                        <span className="whitespace-nowrap text-xs text-muted">
                          {Math.max(1, Math.round(a.word_count / 220))} min
                        </span>
                      </Link>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
