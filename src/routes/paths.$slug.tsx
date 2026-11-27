import { createFileRoute, notFound } from "@tanstack/react-router";
import { pageHead } from "@/lib/neet/meta";
import Breadcrumbs from "@/components/neet/Breadcrumbs";
import RoadmapAccordion from "@/components/neet/RoadmapAccordion";
import StartButton, { PathProgressSummary } from "@/components/neet/StartButton";
import { DISCIPLINES, flatLessons, pathMinutes, skillById } from "@/lib/neet/content";
import { getCourse } from "@/lib/neet/curriculum.functions";

function PathPage() {
  const { path } = Route.useLoaderData();

  const lessons = flatLessons(path);
  const skillIds = Array.from(new Set(lessons.flatMap((x) => x.lesson.skillIds)));

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: "Paths", href: "/paths" }, { label: path.title }]} />

      <header className="mt-8 border-b border-line pb-10">
        <p className="section-label text-accent">{DISCIPLINES[path.discipline].label}</p>
        <h1 className="section-title mt-1 max-w-3xl text-4xl text-text sm:text-5xl">
          {path.title}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">{path.tagline}</p>
        <p className="mt-5 font-mono text-xs text-muted">
          {path.level} · {path.modules.length} modules · {lessons.length} lessons · ~
          {Math.max(1, Math.round(pathMinutes(path) / 60))}h
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-5">
          <StartButton path={path} />
          <PathProgressSummary path={path} />
        </div>
      </header>

      <nav aria-label="On this page" className="mt-6 flex gap-6 text-sm font-medium text-muted">
        <a href="#about-this-course" className="transition-colors hover:text-accent">
          About
        </a>
        <a href="#roadmap" className="transition-colors hover:text-accent">
          Roadmap
        </a>
        <a href="#artifact" className="transition-colors hover:text-accent">
          Artifact
        </a>
      </nav>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-14">
          <section id="about-this-course" aria-labelledby="about-h">
            <h2 id="about-h" className="font-display text-3xl font-bold text-text">
              About this course
            </h2>
            <div className="mt-4 max-w-[68ch] space-y-4 text-base leading-relaxed text-text/90">
              {path.about.map((t) => (
                <p key={t}>{t}</p>
              ))}
            </div>
            <h3 className="section-label mt-8">You will be able to</h3>
            <ul className="mt-3 space-y-2 text-sm text-text/90">
              {path.outcomes.map((o) => (
                <li key={o} className="flex gap-3">
                  <span aria-hidden className="text-accent">
                    →
                  </span>
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </section>

          <section id="roadmap" aria-labelledby="roadmap-h">
            <h2 id="roadmap-h" className="mb-5 font-display text-3xl font-bold text-text">
              Roadmap
            </h2>
            <RoadmapAccordion path={path} />
          </section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <section id="artifact" className="rounded-lg border border-accent/40 bg-surface-2 p-6">
            <h2 className="section-label text-accent">Your artifact</h2>
            <p className="mt-2 font-display text-xl font-bold text-text">{path.artifact}</p>
            <p className="mt-2 text-sm text-muted">
              This is the evidence that moves a skill to Proceed.
            </p>
          </section>
          <section className="rounded-lg border border-line bg-surface-2 p-6">
            <h2 className="section-label">Skills you build</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {skillIds.map((id) => (
                <li key={id} className="text-text">
                  {skillById(id)?.title}
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/paths/$slug")({
  loader: async ({ params }) => {
    const res = await getCourse({ data: { slug: params.slug } });
    if (!res.course) throw notFound();
    return { path: res.course };
  },
  head: ({ loaderData }) =>
    pageHead(loaderData?.path.title ?? "Path", loaderData?.path.tagline ?? "A learning path."),
  component: PathPage,
});
