import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import Link from "@/components/neet/AppLink";
import { Chip, Empty, Field, LoadError, PageHeader, SearchField } from "@/components/neet/ui";
import { listSources } from "@/lib/neet/library.functions";
import type { SourceAuthorityTier, SourceProvenanceStatus } from "@/lib/neet/sourceEnrichment";
import { pageHead } from "@/lib/neet/meta";

export const Route = createFileRoute("/sources")({
  loader: () => listSources(),
  head: () =>
    pageHead(
      "Source register",
      "Every referenced standard, handbook, paper, and tool with authority tier, extraction provenance, freshness date, and exact volume citations.",
    ),
  errorComponent: ({ error }) => <LoadError error={error} />,
  component: Sources,
});

const AUTHORITY_LABELS: Record<SourceAuthorityTier, string> = {
  "primary-standard": "Primary standard",
  "authoritative-handbook": "Authoritative handbook",
  "peer-reviewed-paper": "Peer-reviewed paper",
  "engineering-practice": "Engineering practice",
  "secondary-reference": "Secondary reference",
};

const PROVENANCE_LABELS: Record<SourceProvenanceStatus, string> = {
  "full-extraction": "Full extraction",
  "targeted-extraction": "Targeted extraction",
  "discovery-only": "Discovery only",
  "partial-or-blocked": "Partial / blocked",
  unaudited: "Unaudited",
};

function provenanceBadgeClass(status: SourceProvenanceStatus): string {
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

function Sources() {
  const sources = Route.useLoaderData();
  const [q, setQ] = useState("");
  const [authority, setAuthority] = useState<SourceAuthorityTier | null>(null);
  const [provenance, setProvenance] = useState<SourceProvenanceStatus | null>(null);
  const [topic, setTopic] = useState<string | null>(null);
  const [citedOnly, setCitedOnly] = useState(false);
  const [limit, setLimit] = useState(50);
  const [activeHash, setActiveHash] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const applyHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (!hash) return;
      setActiveHash(hash);
      const idx = sources.findIndex((s) => s.source_id.toLowerCase() === hash.toLowerCase());
      if (idx >= 0) {
        setLimit((prev) => (idx >= prev ? idx + 20 : prev));
      }
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 200);
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
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

  const stats = useMemo(() => {
    let explicit = 0;
    let full = 0;
    let primary = 0;
    for (const s of sources) {
      if (s.cited_in_articles.length > 0) explicit++;
      if (s.provenance_status === "full-extraction") full++;
      if (
        s.authority_tier === "primary-standard" ||
        s.authority_tier === "authoritative-handbook"
      ) {
        primary++;
      }
    }
    return { explicit, full, primary };
  }, [sources]);

  const list = useMemo(() => {
    const t = q.toLowerCase().trim();
    return sources.filter((s) => {
      if (authority && s.authority_tier !== authority) return false;
      if (provenance && s.provenance_status !== provenance) return false;
      if (topic && !s.domain_topics?.includes(topic)) return false;
      if (citedOnly && s.cited_in_articles.length === 0) return false;
      if (!t) return true;

      const articleTitles = s.cited_in_articles?.map((a) => a.title).join(" ") || "";
      const topicsStr = s.domain_topics?.join(" ") || "";
      const fullSearch = [
        s.source_id,
        s.title,
        s.relevance,
        s.source_type,
        s.authority_tier,
        s.provenance_status,
        s.limitations,
        s.takeaways,
        s.audit?.status,
        topicsStr,
        articleTitles,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return fullSearch.includes(t);
    });
  }, [sources, q, authority, provenance, topic, citedOnly]);

  const hasFilters = Boolean(authority || provenance || topic || citedOnly || q);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-5 md:py-16">
      <PageHeader eyebrow="Research Provenance" title="Source register">
        {sources.length} registered references ({stats.explicit} explicitly cited in pack prose,{" "}
        {stats.primary} primary standards &amp; authoritative handbooks, {stats.full} with full
        extraction audit). Copyrighted standards are summarized with attribution only — always
        consult official publisher editions for compliance.
      </PageHeader>

      <div className="mt-8 space-y-4">
        <SearchField
          value={q}
          onChange={(v) => {
            setQ(v);
            setLimit(50);
          }}
          placeholder="Search by ID (e.g. S01), title, standard, domain, or cited volume…"
        />

        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            Authority Tier
          </span>
          <div className="mt-1.5 flex flex-wrap gap-2">
            <Chip active={!authority} onClick={() => setAuthority(null)}>
              All tiers
            </Chip>
            {(Object.keys(AUTHORITY_LABELS) as SourceAuthorityTier[]).map((tier) => (
              <Chip
                key={tier}
                active={authority === tier}
                onClick={() => setAuthority(authority === tier ? null : tier)}
              >
                {AUTHORITY_LABELS[tier]}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            Extraction Provenance
          </span>
          <div className="mt-1.5 flex flex-wrap gap-2">
            <Chip active={!provenance} onClick={() => setProvenance(null)}>
              All statuses
            </Chip>
            {(Object.keys(PROVENANCE_LABELS) as SourceProvenanceStatus[]).map((st) => (
              <Chip
                key={st}
                active={provenance === st}
                onClick={() => setProvenance(provenance === st ? null : st)}
              >
                {PROVENANCE_LABELS[st]}
              </Chip>
            ))}
            <Chip active={citedOnly} onClick={() => setCitedOnly((v) => !v)}>
              Explicitly cited only ({stats.explicit})
            </Chip>
          </div>
        </div>

        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            Domain Topic
          </span>
          <div className="mt-1.5 flex flex-wrap gap-2">
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
      </div>

      <div className="mt-6 flex items-center justify-between text-sm text-muted">
        <p>
          {list.length} shown of {sources.length}
        </p>
        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setAuthority(null);
              setProvenance(null);
              setTopic(null);
              setCitedOnly(false);
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
            <Empty>No sources match your filters.</Empty>
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
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-ink px-2.5 py-1 font-mono font-medium text-bg">
                    {s.source_id}
                  </span>
                  <span className="rounded-md bg-surface-2 px-2 py-0.5 font-medium text-text">
                    {AUTHORITY_LABELS[s.authority_tier]}
                  </span>
                </div>

                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${provenanceBadgeClass(s.provenance_status)}`}
                >
                  {s.audit?.status || PROVENANCE_LABELS[s.provenance_status]}
                </span>
              </div>

              <h2 className="mt-3 text-lg font-semibold leading-snug">
                {s.url && s.url_valid ? (
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-accent transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>{s.title}</span>
                    <span className="text-xs text-muted">↗</span>
                  </a>
                ) : (
                  s.title
                )}
              </h2>

              <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted">
                <span>{s.source_type}</span>
                <span>·</span>
                <span>Snapshot {s.freshness_as_of}</span>
                {!s.url_valid && s.url && (
                  <>
                    <span>·</span>
                    <span className="text-rose-600 dark:text-rose-400">URL needs review</span>
                  </>
                )}
              </div>

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
                {s.takeaways && <Field label="Guidance">{s.takeaways}</Field>}
                <Field label="Quality signal">{s.quality_signal}</Field>
                <Field label="Limitations">{s.limitations}</Field>
                <Field label="Licensing & currency">{s.licensing_note}</Field>
                {s.audit?.extraction_extent && (
                  <Field label="Extraction extent">{s.audit.extraction_extent}</Field>
                )}
              </dl>

              {s.cited_in_articles.length > 0 ? (
                <div className="mt-4 pt-3 border-t border-line/60">
                  <span className="text-xs font-semibold text-text uppercase tracking-wider">
                    Explicitly cited in {s.cited_in_articles.length}{" "}
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
              ) : (
                <div className="mt-4 pt-3 border-t border-line/60">
                  <span className="text-xs font-medium text-muted uppercase tracking-wider">
                    Register reference (not directly cited in prose) — related volumes:
                  </span>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {s.related_articles.slice(0, 3).map((art) => (
                      <Link
                        key={art.slug}
                        href={`/library/${art.slug}`}
                        className="inline-flex items-center gap-1 rounded-md bg-bg px-2 py-0.5 text-xs text-muted hover:text-accent transition-colors border border-line"
                      >
                        <span className="font-mono text-[10px]">
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
