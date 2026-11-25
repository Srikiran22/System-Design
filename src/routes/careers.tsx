import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import Link from "@/components/neet/AppLink";
import { Chip, Field, LoadError, PageHeader } from "@/components/neet/ui";
import { listRoles } from "@/lib/neet/library.functions";
import { inferCompetenciesFromText } from "@/lib/neet/competencies";
import { computeAll } from "@/lib/neet/scale";
import { useProgress } from "@/lib/neet/store";
import { pageHead } from "@/lib/neet/meta";

export const Route = createFileRoute("/careers")({
  loader: () => listRoles(),
  head: () =>
    pageHead(
      "Career roles",
      "Systems roles mapped to atomic platform competencies, typical deliverables, and portfolio projects.",
    ),
  errorComponent: ({ error }) => <LoadError error={error} />,
  component: Careers,
});

function Careers() {
  const roles = Route.useLoaderData();
  const { evidence } = useProgress();
  const progressMap = new Map(computeAll(evidence).map((p) => [p.skillId, p]));
  const levels = Array.from(new Set(roles.map((r) => r.career_level).filter(Boolean))) as string[];
  const [level, setLevel] = useState<string | null>(null);
  const list = roles.filter((r) => !level || r.career_level === level);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-5 md:py-16">
      <PageHeader eyebrow="Careers & Competency Mapping" title="Roles & competencies">
        {roles.length} systems engineering &amp; architecture roles mapped directly to our 16 atomic
        competencies, real deliverables, and portfolio artifacts.
      </PageHeader>
      <div className="mt-8 flex gap-2 overflow-x-auto pb-1">
        <Chip active={!level} onClick={() => setLevel(null)}>
          All levels
        </Chip>
        {levels.map((l) => (
          <Chip key={l} active={level === l} onClick={() => setLevel(l)}>
            {l}
          </Chip>
        ))}
      </div>
      <ul className="mt-6 grid gap-3 md:grid-cols-2">
        {list.map((r) => {
          const mapped = inferCompetenciesFromText(
            `${r.role} ${r.competency_areas ?? ""} ${r.typical_deliverables ?? ""}`,
          );
          return (
            <li key={r.id} className="rounded-3xl border border-line bg-surface p-6">
              <p className="text-xs text-muted">{r.career_level}</p>
              <h2 className="mt-1 text-xl font-semibold leading-snug">{r.role}</h2>

              {mapped.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {mapped.map((c) => {
                    const lvl = progressMap.get(c.id)?.level ?? 0;
                    return (
                      <Link
                        key={c.code}
                        href="/paths"
                        className="inline-flex items-center gap-1 rounded-full border border-line bg-bg px-2.5 py-0.5 text-[11px] hover:border-accent"
                        title={c.definition}
                      >
                        <span className="font-mono font-semibold text-accent">{c.code}</span>
                        <span className="text-muted">L{lvl}</span>
                      </Link>
                    );
                  })}
                </div>
              )}

              <dl className="mt-4 grid gap-3">
                <Field label="Competency areas">{r.competency_areas}</Field>
                <Field label="Typical deliverables">{r.typical_deliverables}</Field>
                <Field label="Source anchors">{r.source_anchors}</Field>
              </dl>
              {r.portfolio_project && (
                <div className="mt-4 rounded-2xl bg-bg p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-accent">
                      Portfolio project
                    </p>
                    <Link href="/labs" className="text-[11px] text-accent hover:underline">
                      Practice in Studio →
                    </Link>
                  </div>
                  <p className="mt-1 text-sm">{r.portfolio_project}</p>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
