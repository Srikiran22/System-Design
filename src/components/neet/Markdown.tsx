import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "./AppLink";
import { slugify } from "./LessonBlocks";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CITATION_ALIASES, type CitationTooltipData } from "@/lib/neet/citationAliases";

function text(children: unknown): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(text).join("");
  if (children && typeof children === "object" && "props" in children)
    return text((children as { props: { children: unknown } }).props.children);
  return "";
}

/** Pre-processes body markdown to convert citations [S01], [S23, S112], [NASA-SP-2016-6105] into cite: links */
function enrichMarkdownCitations(body: string): string {
  const parts = body.split(/(```[\s\S]*?```)/g);
  return parts
    .map((part, idx) => {
      // Don't replace inside code blocks
      if (idx % 2 === 1) return part;

      return part.replace(/\[([A-Za-z0-9\-_/:. ,–—]+)\](?!\()/g, (match, inner) => {
        const trimmed = inner.trim();

        // Check for multiple or single S-id: e.g. S01, S02 or S274, S275
        const sMatches = trimmed.match(/S\d{2,3}/g);
        if (sMatches && sMatches.length > 0 && /^[S\d\s,–—-]+$/.test(trimmed)) {
          return sMatches.map((sid: string) => `[${sid}](/sources#${sid})`).join(" ");
        }

        // Check verified alias table only (never fabricate unmapped standard links)
        if (CITATION_ALIASES[trimmed]) {
          const canonical = CITATION_ALIASES[trimmed];
          return `[${trimmed}](/sources#${canonical})`;
        }

        return match;
      });
    })
    .join("");
}

function CitationPill({
  sourceId,
  label,
  citationMap,
}: {
  sourceId: string;
  label: string;
  citationMap?: Record<string, CitationTooltipData>;
}) {
  const canonicalId = CITATION_ALIASES[sourceId] || sourceId;
  const enriched = citationMap?.[canonicalId];
  const href = `/sources#${canonicalId}`;
  const displayLabel = label.startsWith("[") && label.endsWith("]") ? label : `[${label}]`;

  if (!enriched) {
    return (
      <Link
        href={href}
        className="mx-0.5 rounded bg-surface-2 px-1.5 py-0.5 font-mono text-xs text-muted hover:text-accent"
      >
        {displayLabel}
      </Link>
    );
  }

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={href}
            className="inline-flex items-center gap-1 mx-0.5 px-2 py-0.5 rounded-full font-mono text-xs font-semibold bg-accent/15 text-accent border border-accent/30 hover:bg-accent hover:text-bg transition-colors shadow-xs align-baseline"
          >
            <span>{displayLabel}</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          align="center"
          className="max-w-xs p-3 text-left bg-surface border border-line text-text shadow-xl rounded-xl z-50"
        >
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            <span className="rounded-full bg-ink px-2 py-0.5 text-[10px] font-semibold text-bg">
              {canonicalId}
            </span>
            <span className="text-[10px] font-medium text-muted capitalize">
              {enriched.authority_tier.replace(/-/g, " ")}
            </span>
            <span className="text-[10px] font-medium text-accent capitalize">
              · {enriched.provenance_status.replace(/-/g, " ")}
            </span>
          </div>
          <p className="font-semibold text-xs leading-snug text-text">{enriched.title}</p>
          {enriched.relevance && (
            <p className="mt-1 text-[11px] leading-tight text-muted line-clamp-2">
              {enriched.relevance}
            </p>
          )}
          <p className="mt-2 text-[10px] font-medium text-accent">
            Inspect in Source Register (as of {enriched.freshness_as_of}) →
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/** Renders pack Markdown with the site's type scale; internal .md links route to the library, citations route to sources. */
export default function Markdown({
  body,
  fileMap,
  citationMap,
}: {
  body: string;
  fileMap: Record<string, string>;
  citationMap?: Record<string, CitationTooltipData>;
}) {
  const enrichedBody = useMemo(() => enrichMarkdownCitations(body), [body]);

  return (
    <div className="min-w-0 text-[1.0625rem] leading-8 text-text">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: () => null,
          h2: ({ children }) => (
            <h2
              id={slugify(text(children))}
              className="mb-3 mt-12 scroll-mt-24 text-2xl font-semibold leading-tight md:text-3xl"
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3
              id={slugify(text(children))}
              className="mb-2 mt-8 scroll-mt-24 text-xl font-semibold"
            >
              {children}
            </h3>
          ),
          h4: ({ children }) => <h4 className="mb-2 mt-6 font-semibold">{children}</h4>,
          p: ({ children }) => <p className="my-4">{children}</p>,
          ul: ({ children }) => (
            <ul className="my-4 list-disc space-y-1.5 pl-6 marker:text-accent">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="my-4 list-decimal space-y-1.5 pl-6 marker:text-muted">{children}</ol>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-6 rounded-lg border border-line bg-surface-2 px-5 py-2 text-muted">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-10 border-line" />,
          code: ({ children, className }) =>
            className ? (
              <code className={className}>{children}</code>
            ) : (
              <code className="rounded bg-surface-3 px-1.5 py-0.5 text-[0.9em] text-accent">
                {children}
              </code>
            ),
          pre: ({ children }) => (
            <pre className="my-6 overflow-x-auto rounded-lg border border-line bg-surface-1 p-5 text-sm leading-6">
              {children}
            </pre>
          ),
          table: ({ children }) => (
            <div className="my-6 overflow-x-auto rounded-lg border border-line">
              <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-surface-2 text-xs uppercase tracking-wide text-muted">
              {children}
            </thead>
          ),
          th: ({ children }) => <th className="px-4 py-3 font-semibold">{children}</th>,
          td: ({ children }) => (
            <td className="border-t border-line px-4 py-3 align-top">{children}</td>
          ),
          a: ({ href = "", children }) => {
            if (href.startsWith("cite:")) {
              const rawId = href.replace("cite:", "");
              return (
                <CitationPill
                  sourceId={rawId}
                  label={text(children)}
                  {...(citationMap ? { citationMap } : {})}
                />
              );
            }
            if (/^\/sources#S\d{2,3}$/i.test(href) || /^#S\d{2,3}$/i.test(href)) {
              const rawId = href.split("#")[1]!;
              return (
                <CitationPill
                  sourceId={rawId}
                  label={text(children)}
                  {...(citationMap ? { citationMap } : {})}
                />
              );
            }
            const file = href.split("#")[0]!.split("/").pop()!;
            const slug = fileMap[file];
            if (slug)
              return (
                <Link href={`/library/${slug}`} className="font-medium text-accent hover:underline">
                  {children}
                </Link>
              );
            if (/^https?:/.test(href))
              return (
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="break-words text-accent hover:underline"
                >
                  {children}
                </a>
              );
            return (
              <a href={href} className="text-accent hover:underline">
                {children}
              </a>
            );
          },
        }}
      >
        {enrichedBody}
      </ReactMarkdown>
    </div>
  );
}
