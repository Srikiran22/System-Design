import { createFileRoute, notFound } from "@tanstack/react-router";
import { pageHead } from "@/lib/neet/meta";
import PathCard from "@/components/neet/PathCard";
import SkillMap from "@/components/neet/SkillMap";
import { DISCIPLINES, PATHS } from "@/lib/neet/content";
import type { Discipline } from "@/lib/neet/types";

function PathsPage() {
  const paths = PATHS;
  const groups = (Object.keys(DISCIPLINES) as Discipline[]).map((d) => ({
    d,
    items: paths.filter((p) => p.discipline === d),
  }));

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <p className="font-label text-sm uppercase tracking-widest text-accent">Paths</p>
      <h1 className="mt-2 font-display text-5xl">Explore learning paths</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">
        Three disciplines, one thread: how things behave, how to design them, and how to build them.
      </p>

      <div className="mt-12 space-y-14">
        {groups.map(({ d, items }) => (
          <section key={d} aria-labelledby={`g-${d}`}>
            <h2 id={`g-${d}`} className="font-display text-2xl">
              {DISCIPLINES[d].label}
            </h2>
            <p className="text-muted">{DISCIPLINES[d].blurb}</p>
            <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {items.map((p) => (
                <PathCard key={p.slug} path={p} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="mt-24" aria-labelledby="map-h">
        <h2 id="map-h" className="font-display text-3xl">
          The curriculum map
        </h2>
        <p className="mb-8 mt-2 max-w-2xl text-muted">
          Every skill, its prerequisites, and where you stand. Rings fill from Search to Proceed as
          you submit evidence. Locked skills open once you have started what they build on.
        </p>
        <SkillMap />
      </section>
    </div>
  );
}

export const Route = createFileRoute("/paths/")({
  head: () =>
    pageHead("Paths", "Explore learning paths in systems thinking, system design and engineering."),
  component: PathsPage,
});
