import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import Link from "@/components/neet/AppLink";
import { Empty, LoadError, PageHeader, SearchField } from "@/components/neet/ui";
import { listPrompts } from "@/lib/neet/library.functions";
import { inferCompetenciesFromText } from "@/lib/neet/competencies";
import { pageHead } from "@/lib/neet/meta";

export const Route = createFileRoute("/exercises")({
  loader: () => listPrompts(),
  head: () =>
    pageHead(
      "Design exercises",
      "Practice prompts mapped to atomic competencies and required engineering artifacts.",
    ),
  errorComponent: ({ error }) => <LoadError error={error} />,
  component: Exercises,
});

const split = (s: string | null) => (s ?? "").split(/;\s*/).filter(Boolean);

function Exercises() {
  const prompts = Route.useLoaderData();
  const [q, setQ] = useState("");
  const list = prompts.filter((p) =>
    [p.prompt_id, p.exercise, p.primary_concepts, p.required_artifacts]
      .join(" ")
      .toLowerCase()
      .includes(q.toLowerCase()),
  );
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-5 md:py-16">
      <PageHeader eyebrow="Practice Prompts" title="Design exercises">
        {prompts.length} real-world prompts mapped to atomic competencies. Produce the required
        artifacts, then evaluate them against a rubric in the Practice Studio.
      </PageHeader>
      <div className="mt-8">
        <SearchField value={q} onChange={setQ} placeholder="Search exercises or concepts…" />
      </div>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.length === 0 && (
          <li className="sm:col-span-2 lg:col-span-3">
            <Empty>No exercises match.</Empty>
          </li>
        )}
        {list.map((p) => {
          const mapped = inferCompetenciesFromText(
            `${p.exercise} ${p.primary_concepts ?? ""} ${p.required_artifacts ?? ""}`,
          );
          return (
            <li
              key={p.prompt_id}
              className="flex flex-col rounded-3xl border border-line bg-surface p-5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full bg-bg px-2.5 py-1 font-mono text-xs tabular-nums text-muted">
                  {p.prompt_id}
                </span>
                <div className="flex flex-wrap gap-1">
                  {mapped.slice(0, 2).map((c) => (
                    <span
                      key={c.code}
                      className="rounded-md bg-accent/10 px-1.5 py-0.5 font-mono text-[10px] font-medium text-accent"
                    >
                      {c.code}
                    </span>
                  ))}
                </div>
              </div>
              <h2 className="mt-3 text-lg font-semibold leading-snug">{p.exercise}</h2>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {split(p.primary_concepts).map((c) => (
                  <span key={c} className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs">
                    {c}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-xs font-medium uppercase tracking-wide text-muted">
                Required artifacts
              </p>
              <ul className="mt-1 flex-1 space-y-1 text-sm">
                {split(p.required_artifacts).map((a) => (
                  <li key={a} className="flex gap-2">
                    <span className="text-accent">✓</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 border-t border-line/60 pt-3">
                <Link href="/labs" className="text-xs font-medium text-accent hover:underline">
                  Evaluate artifact in Practice Studio →
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
