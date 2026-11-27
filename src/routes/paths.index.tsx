import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/neet/meta";
import PathCard from "@/components/neet/PathCard";
import SkillMap from "@/components/neet/SkillMap";
import { DISCIPLINES } from "@/lib/neet/content";
import { listCourses } from "@/lib/neet/curriculum.functions";
import type { Discipline } from "@/lib/neet/types";

function PathsPage() {
  const { courses: paths } = Route.useLoaderData();
  const groups = (Object.keys(DISCIPLINES) as Discipline[]).map((d) => ({
    d,
    items: paths.filter((p) => p.discipline === d),
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <p className="section-label text-accent">Curriculum Paths</p>
      <h1 className="section-title text-4xl text-text sm:text-5xl">Explore learning paths</h1>
      <p className="mt-4 max-w-2xl text-base text-muted sm:text-lg">
        Three disciplines, one thread: how things behave, how to design them, and how to build them.
      </p>

      <div className="mt-12 space-y-16">
        {groups.map(({ d, items }) => (
          <section key={d} aria-labelledby={`g-${d}`}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id={`g-${d}`} className="font-display text-2xl font-bold text-text">
                {DISCIPLINES[d].label}
              </h2>
              <span className="font-mono text-xs text-muted">
                {items.length} {items.length === 1 ? "path" : "paths"}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted">{DISCIPLINES[d].blurb}</p>
            <div className="mt-6 grid gap-6 pt-2 md:grid-cols-2 lg:grid-cols-3">
              {items.map((p) => (
                <PathCard key={p.slug} path={p} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="mt-20 border-t border-line pt-16" aria-labelledby="map-h">
        <p className="section-label text-accent">Competency Graph</p>
        <h2 id="map-h" className="section-title text-3xl text-text">
          The curriculum map
        </h2>
        <p className="mb-8 mt-2 max-w-2xl text-sm text-muted sm:text-base">
          Every skill, its prerequisites, and where you stand. Rings fill from Search to Proceed as
          you submit evidence. Locked skills open once you have started what they build on.
        </p>
        <SkillMap />
      </section>
    </div>
  );
}

export const Route = createFileRoute("/paths/")({
  loader: async () => listCourses({ data: {} }),
  head: () =>
    pageHead("Paths", "Explore learning paths in systems thinking, system design and engineering."),
  component: PathsPage,
});
