import { ClientOnly, createFileRoute, Link } from "@tanstack/react-router";
import { AsciiParticles } from "@/components/neet/ascii";
import PathCard from "@/components/neet/PathCard";
import { BlurText, SpotlightCard } from "@/components/neet/fx";
import { LABS, PATHS, STAGES, allLessons } from "@/lib/neet/content";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NEET: we ain't an academy, we're a group" },
      {
        name: "description",
        content:
          "Learn systems thinking, system design and engineering by building. Short lessons, honest progress, real artifacts.",
      },
      { property: "og:title", content: "NEET: we ain't an academy, we're a group" },
      {
        property: "og:description",
        content: "Learn systems thinking, system design and engineering by building.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const FILTERS = ["Systems thinking", "System design", "Engineering", "Labs", "Calibration"];

function Home() {
  const stats = [
    { k: String(PATHS.length), v: "Curriculum Paths" },
    { k: "120", v: "Knowledge Volumes" },
    { k: "320", v: "Primary Sources" },
    { k: "73", v: "Design Exercises" },
  ];
  return (
    <>
      <section className="relative overflow-hidden bg-warm">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
        >
          <ClientOnly fallback={null}>
            <AsciiParticles />
          </ClientOnly>
        </div>
        <div className="relative mx-auto max-w-4xl px-5 pb-20 pt-24 text-center md:pt-32">
          <span className="animate-rise inline-flex items-center gap-2 rounded-full border border-line bg-bg px-4 py-1.5 text-sm text-text shadow-[var(--shadow-soft)]">
            <span className="h-1.5 w-1.5 rounded-full bg-ok" />
            <span className="shiny-text">Not in Education, Employment, or Training</span>
          </span>
          <h1 className="mt-7 text-5xl font-semibold leading-[1.05] text-text md:text-7xl">
            <BlurText text="We ain't an academy." />
            <br />
            <BlurText text="We're a group." delay={300} className="text-muted" />
          </h1>
          <p className="animate-rise mx-auto mt-7 max-w-xl text-lg leading-8 text-muted [animation-delay:500ms]">
            A self-built curriculum in <span className="text-text">systems thinking</span>,{" "}
            <span className="text-text">system design</span> and{" "}
            <span className="text-text">engineering</span>. Learn, build, and leave with work you
            can show.
          </p>
          <div className="animate-rise mt-9 flex flex-wrap justify-center gap-3 [animation-delay:650ms]">
            <Link to="/paths" className="btn-ink">
              Start learning →
            </Link>
            <Link to="/library" className="btn-soft">
              Browse the library
            </Link>
          </div>
          <p className="mt-10 text-xs uppercase tracking-[0.25em] text-muted">
            Search · Know · Adapt · Proceed
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5">
        <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.v} className="rounded-3xl bg-surface p-6">
              <dt className="text-sm text-muted">{s.v}</dt>
              <dd className="mt-1 text-4xl font-semibold tabular-nums text-text">{s.k}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mx-auto max-w-6xl px-5 pt-24" aria-labelledby="paths-h">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-accent">Paths</p>
            <h2 id="paths-h" className="mt-1 text-4xl font-semibold">
              Start anywhere. They connect.
            </h2>
          </div>
          <Link to="/library" className="btn-soft text-sm">
            Open the library
          </Link>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <span key={f} className="rounded-full bg-surface-2 px-4 py-1.5 text-sm text-text">
              {f}
            </span>
          ))}
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {PATHS.map((p) => (
            <PathCard key={p.slug} path={p} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pt-24" aria-labelledby="method-h">
        <p className="text-sm font-medium text-accent">The method</p>
        <h2 id="method-h" className="mt-1 text-4xl font-semibold">
          Four stages, for every skill.
        </h2>
        <ol className="mt-8 grid gap-4 md:grid-cols-4">
          {STAGES.map((s) => (
            <li key={s.id}>
              <SpotlightCard className="h-full p-6">
                <div className="flex items-center gap-1.5" aria-hidden>
                  {STAGES.map((x) => (
                    <span
                      key={x.id}
                      className={`h-1.5 flex-1 rounded-full ${x.level <= s.level ? "bg-accent" : "bg-surface-2"}`}
                    />
                  ))}
                </div>
                <p className="mt-6 text-sm tabular-nums text-muted">Level {s.level}</p>
                <h3 className="mt-1 text-2xl font-semibold">{s.label}</h3>
                <p className="mt-2 text-muted">{s.meaning}</p>
              </SpotlightCard>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-6xl px-5 pt-24">
        <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
          <div className="rounded-3xl bg-ink p-10 text-bg md:p-12">
            <p className="text-sm opacity-60">Why NEET</p>
            <h2 className="mt-2 max-w-md text-4xl font-semibold leading-tight">
              The label, taken back.
            </h2>
            <p className="mt-4 max-w-lg opacity-75">
              NEET describes who is outside the system, not what they can do. No gatekeepers: every
              lesson is short, every question asks how sure you are, and every path ends with
              something you made.
            </p>
          </div>
          <div className="flex flex-col justify-between rounded-3xl bg-surface p-10">
            <div>
              <h2 className="text-3xl font-semibold leading-tight">Show work, not badges.</h2>
              <p className="mt-3 text-muted">
                Mastery comes from evidence and fades when unused, so it stays true.
              </p>
            </div>
            <Link to="/me" className="btn-ink mt-8 self-start">
              See my scale
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
