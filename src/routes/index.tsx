import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import Link from "@/components/neet/AppLink";
import {
  DISCIPLINES,
  LABS,
  flatLessons,
  lessonHref,
  lessonKey,
  pathMinutes,
} from "@/lib/neet/content";
import { listCourses } from "@/lib/neet/curriculum.functions";
import { firstOpenLesson, pathProgress } from "@/lib/neet/derive";
import { bucketByDay, streaks } from "@/lib/neet/progress-math";
import { useProgress } from "@/lib/neet/store";
import type { Discipline, Path } from "@/lib/neet/types";

export const Route = createFileRoute("/")({
  loader: async () => listCourses({ data: {} }),
  head: () => ({
    meta: [
      { title: "NEET — Learn by building" },
      {
        name: "description",
        content:
          "A hands-on, self-directed curriculum for building real distributed systems, engineering trade-offs, and production-ready artifacts.",
      },
      { property: "og:title", content: "NEET — Learn by building" },
      {
        property: "og:description",
        content:
          "Explore courses, exercises, and projects in systems thinking and design.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const JOURNEY_STEPS = [
  {
    num: "01",
    title: "Understand",
    body: "Start with core concepts, terminology, and mental models.",
    meta: "Read / Understand",
    href: "/paths/orientation-and-grounding",
    activeDots: 1,
  },
  {
    num: "02",
    title: "Learn",
    body: "Study architecture, data, networks, and distributed systems.",
    meta: "Study / Connect",
    href: "/paths",
    activeDots: 2,
  },
  {
    num: "03",
    title: "Practise",
    body: "Compare design choices and test trade-offs with exercises.",
    meta: "Apply / Evaluate",
    href: "/exercises",
    activeDots: 3,
  },
  {
    num: "04",
    title: "Build",
    body: "Turn what you learn into projects and engineering decisions.",
    meta: "Build / Review",
    href: "/labs",
    activeDots: 4,
  },
] as const;

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

function buildWeeklyActivity(dates: string[]): { day: string; count: number }[] {
  const now = new Date();
  const buckets = bucketByDay(dates);
  const result: { day: string; count: number }[] = [];
  for (let offset = 6; offset >= 0; offset -= 1) {
    const d = new Date(now);
    d.setDate(now.getDate() - offset);
    const iso = d.toISOString().slice(0, 10);
    const label = DAY_LABELS[(d.getDay() + 6) % 7]!;
    result.push({ day: label, count: buckets.get(iso) ?? 0 });
  }
  return result;
}

function Home() {
  const { courses } = Route.useLoaderData();
  const progress = useProgress();

  const [workspaceTab, setWorkspaceTab] = useState<"current" | "all">("current");
  const [selectedCourseSlug, setSelectedCourseSlug] = useState<string>(courses[0]?.slug ?? "");
  const [selectedDomain, setSelectedDomain] = useState<"all" | Discipline>("all");

  const activeCourse: Path | undefined =
    courses.find((c) => c.slug === selectedCourseSlug) ?? courses[0];

  const activeCourseLessons = useMemo(
    () => (activeCourse ? flatLessons(activeCourse) : []),
    [activeCourse],
  );

  const currentLessonEntry = useMemo(
    () => (activeCourse ? firstOpenLesson(activeCourse, progress.completed) : undefined),
    [activeCourse, progress.completed],
  );

  const upNextLessons = useMemo(() => {
    if (!currentLessonEntry) return activeCourseLessons.slice(0, 2);
    const idx = activeCourseLessons.findIndex(
      (item) => item.lesson.slug === currentLessonEntry.lesson.slug,
    );
    return activeCourseLessons.slice(idx + 1, idx + 3);
  }, [activeCourseLessons, currentLessonEntry]);

  const featuredLab = useMemo(() => {
    if (!currentLessonEntry) return LABS[0];
    const lessonSkills = new Set(currentLessonEntry.lesson.skillIds);
    return LABS.find((l) => lessonSkills.has(l.skillId)) ?? LABS[0];
  }, [currentLessonEntry]);

  const filteredCourses = useMemo(
    () =>
      selectedDomain === "all" ? courses : courses.filter((c) => c.discipline === selectedDomain),
    [courses, selectedDomain],
  );

  const stats = useMemo(() => {
    const allLessonKeys = courses.flatMap((c) =>
      flatLessons(c).map((x) => lessonKey(c.slug, x.lesson.slug)),
    );
    const totalLessons = allLessonKeys.length;
    const completedLessons = allLessonKeys.filter((k) => progress.completed.includes(k)).length;
    const pct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    const activityDates = [
      ...Object.values(progress.completedAt),
      ...progress.evidence.map((e) => e.at),
    ]
      .filter((iso): iso is string => typeof iso === "string" && iso.length >= 10)
      .map((iso) => iso.slice(0, 10));

    const streak = streaks(bucketByDay(activityDates), new Date());
    const weekly = buildWeeklyActivity(activityDates);
    const totalArtifacts =
      Object.keys(progress.labs).length +
      Object.keys(progress.scenarios).length +
      Object.keys(progress.capstone).length;

    return {
      pct,
      completedLessons,
      totalLessons,
      streak: streak.current,
      totalArtifacts,
      weekly,
      maxWeekly: Math.max(1, ...weekly.map((w) => w.count)),
    };
  }, [courses, progress]);

  const quickTabs = courses.slice(0, 2);

  return (
    <>
      {/* Hero & Interactive Workspace Section */}
      <section className="px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 text-center">
            <span className="section-label">SYSTEMS / DESIGN / ENGINEERING</span>
            <h1 className="section-title mx-auto max-w-4xl text-4xl text-text sm:text-5xl lg:text-6xl">
              Learn how systems work. Learn to design them.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-muted sm:text-lg">
              Study systems through lessons, exercises, and practical projects.
            </p>
          </div>

          {/* 4 Step Folder Cards */}
          <div className="mb-16 grid grid-cols-1 gap-6 pt-3 md:grid-cols-2 lg:grid-cols-4">
            {JOURNEY_STEPS.map((step) => (
              <Link
                key={step.num}
                href={step.href}
                className="folder-card group p-6 pt-7 text-left"
              >
                <span className="folder-tab">{step.num}</span>
                <h2 className="font-display text-lg font-bold text-text transition-colors group-hover:text-accent">
                  {step.title}
                </h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{step.body}</p>
                <div className="mt-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent">
                  <span className="flex items-center gap-1" aria-hidden>
                    {[1, 2, 3, 4].map((dot) => (
                      <span
                        key={dot}
                        className={`progress-segment ${dot <= step.activeDots ? "active" : ""}`}
                      />
                    ))}
                  </span>
                  <span className="truncate">{step.meta}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Interactive Curriculum Workspace */}
          {activeCourse && (
            <div className="overflow-hidden rounded-lg border border-line bg-surface-1">
              <div
                role="tablist"
                aria-label="Curriculum workspace views"
                className="flex flex-wrap items-center border-b border-line"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={workspaceTab === "current"}
                  onClick={() => setWorkspaceTab("current")}
                  className={`whitespace-nowrap px-5 py-3 text-sm font-medium transition-colors ${
                    workspaceTab === "current"
                      ? "border-b-2 border-accent bg-surface-2 text-accent"
                      : "text-muted hover:text-text"
                  }`}
                >
                  Current Lesson
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={workspaceTab === "all"}
                  onClick={() => setWorkspaceTab("all")}
                  className={`whitespace-nowrap px-5 py-3 text-sm font-medium transition-colors ${
                    workspaceTab === "all"
                      ? "border-b-2 border-accent bg-surface-2 text-accent"
                      : "text-muted hover:text-text"
                  }`}
                >
                  All Lessons ({activeCourseLessons.length})
                </button>

                {quickTabs.length > 0 && (
                  <div className="ml-auto flex flex-wrap items-center border-t border-line sm:border-l sm:border-t-0">
                    {quickTabs.map((course) => {
                      const isSelected = course.slug === activeCourse.slug;
                      return (
                        <button
                          key={course.slug}
                          type="button"
                          onClick={() => setSelectedCourseSlug(course.slug)}
                          className={`whitespace-nowrap px-4 py-3 text-xs font-medium transition-colors sm:text-sm ${
                            isSelected ? "bg-surface-2 text-text" : "text-muted hover:text-text"
                          }`}
                        >
                          Path: {course.title}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {workspaceTab === "current" ? (
                <div className="p-6">
                  <div className="flex flex-col gap-6 lg:flex-row">
                    {/* Left Column: Active Lesson + Up Next */}
                    <div className="flex flex-col gap-6 lg:w-1/3">
                      {currentLessonEntry && (
                        <div className="rounded-lg border border-line bg-surface-2 p-6">
                          <div className="mb-4 flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-surface-3 font-mono text-sm text-muted">
                              {String(
                                activeCourseLessons.findIndex(
                                  (item) => item.lesson.slug === currentLessonEntry.lesson.slug,
                                ) + 1,
                              ).padStart(2, "0")}
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-ui text-base font-bold text-text">
                                {currentLessonEntry.lesson.title}
                              </h3>
                              <p className="mt-1 text-xs text-muted">
                                {currentLessonEntry.module.title} ·{" "}
                                {currentLessonEntry.lesson.minutes} min read
                              </p>
                            </div>
                          </div>
                          <p className="mb-6 text-sm leading-relaxed text-muted">
                            {currentLessonEntry.lesson.summary}
                          </p>
                          <Link
                            href={lessonHref(activeCourse.slug, currentLessonEntry.lesson.slug)}
                            className="btn-ink w-full justify-center text-sm"
                          >
                            Start Lesson
                          </Link>
                        </div>
                      )}

                      <div className="rounded-lg border border-line bg-surface-2 p-6">
                        <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted">
                          Up Next
                        </h4>
                        <div className="space-y-3">
                          {upNextLessons.length === 0 ? (
                            <p className="text-sm text-muted">
                              You&apos;re at the final lesson in this path.
                            </p>
                          ) : (
                            upNextLessons.map((item, idx) => (
                              <Link
                                key={item.lesson.slug}
                                href={lessonHref(activeCourse.slug, item.lesson.slug)}
                                className="flex items-start gap-3 rounded border border-line bg-surface-1 p-3 transition-colors hover:border-accent"
                              >
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-surface-3 font-mono text-xs text-muted">
                                  {String(idx + 2).padStart(2, "0")}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="truncate text-sm font-semibold text-text">
                                    {item.lesson.title}
                                  </div>
                                  <div className="mt-0.5 text-xs text-muted">
                                    {item.lesson.minutes} min · {activeCourse.level}
                                  </div>
                                </div>
                                <span aria-hidden className="self-center text-muted">
                                  →
                                </span>
                              </Link>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Lesson & Path Overview */}
                    <div className="flex lg:w-2/3">
                      <div className="flex w-full flex-col justify-between rounded-lg border border-line bg-surface-2 p-6">
                        <div>
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h2 className="font-display text-2xl font-bold text-text">
                              Lesson Overview
                            </h2>
                            <Link
                              href={`/paths/${activeCourse.slug}`}
                              className="text-xs font-semibold uppercase tracking-wider text-accent hover:underline"
                            >
                              Full syllabus →
                            </Link>
                          </div>
                          <div className="dot-grid my-5 h-2 w-full" aria-hidden />
                          <p className="text-sm leading-relaxed text-muted">
                            {activeCourse.about[0] ?? activeCourse.tagline}
                          </p>

                          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="rounded border border-line bg-surface-3 p-4">
                              <div className="text-xs uppercase tracking-wider text-muted">
                                Difficulty
                              </div>
                              <div className="mt-1 text-sm font-semibold text-text">
                                {activeCourse.level} · {DISCIPLINES[activeCourse.discipline].label}
                              </div>
                            </div>
                            <div className="rounded border border-line bg-surface-3 p-4">
                              <div className="text-xs uppercase tracking-wider text-muted">
                                Estimated Time
                              </div>
                              <div className="mt-1 text-sm font-semibold tabular-nums text-text">
                                {currentLessonEntry
                                  ? `${currentLessonEntry.lesson.minutes} min lesson · ~${Math.max(1, Math.round(pathMinutes(activeCourse) / 60))}h path`
                                  : `~${Math.max(1, Math.round(pathMinutes(activeCourse) / 60))}h total`}
                              </div>
                            </div>
                          </div>

                          {activeCourse.outcomes.length > 0 && (
                            <div className="mt-6">
                              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                                Outcomes you build
                              </p>
                              <ul className="mt-2.5 space-y-1.5 text-sm text-text/90">
                                {activeCourse.outcomes.slice(0, 3).map((outcome) => (
                                  <li key={outcome} className="flex items-start gap-2.5">
                                    <span aria-hidden className="text-accent">
                                      →
                                    </span>
                                    <span>{outcome}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {featuredLab && (
                          <div className="mt-8 border-t border-line pt-6">
                            <div className="flex flex-wrap items-center gap-4">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-surface-3 font-mono text-xs font-bold text-accent">
                                LAB
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-sm font-semibold text-text">
                                  Exercise: {featuredLab.title}
                                </div>
                                <div className="mt-0.5 text-xs text-muted">
                                  ~{featuredLab.minutes} min · Rubric-scored engineering artifact
                                </div>
                              </div>
                              <Link href={`/labs#${featuredLab.id}`} className="btn-soft text-sm">
                                Open Lab
                              </Link>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="font-display text-xl font-bold text-text">
                        {activeCourse.title}
                      </h3>
                      <p className="text-sm text-muted">{activeCourse.tagline}</p>
                    </div>
                    <Link href={`/paths/${activeCourse.slug}`} className="btn-soft text-xs">
                      Course details
                    </Link>
                  </div>
                  <ol className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {activeCourseLessons.map((item, idx) => {
                      const done = progress.completed.includes(
                        lessonKey(activeCourse.slug, item.lesson.slug),
                      );
                      return (
                        <li key={item.lesson.slug}>
                          <Link
                            href={lessonHref(activeCourse.slug, item.lesson.slug)}
                            className="flex items-start gap-3 rounded-lg border border-line bg-surface-2 p-4 transition-colors hover:border-accent"
                          >
                            <span
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded font-mono text-xs font-semibold ${
                                done ? "bg-accent text-bg" : "bg-surface-3 text-muted"
                              }`}
                            >
                              {done ? "✓" : String(idx + 1).padStart(2, "0")}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-semibold text-text">
                                {item.lesson.title}
                              </div>
                              <div className="mt-0.5 line-clamp-1 text-xs text-muted">
                                {item.module.title} · {item.lesson.minutes} min
                              </div>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Curriculum Explorer Section */}
      <section
        id="curriculum"
        className="border-y border-line bg-surface-1 px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <span className="section-label">COURSES</span>
              <h2 className="section-title text-3xl text-text sm:text-4xl">
                Choose a subject
              </h2>
              <p className="mt-2 max-w-xl text-sm text-muted sm:text-base">
                Browse the available courses by subject.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label htmlFor="domain-filter" className="sr-only">
                Filter curriculum by domain
              </label>
              <select
                id="domain-filter"
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value as "all" | Discipline)}
                className="rounded-md border border-line bg-surface-2 px-4 py-2.5 text-sm text-text focus:border-accent focus:outline-none"
              >
                <option value="all">All domains ({courses.length})</option>
                {(Object.keys(DISCIPLINES) as Discipline[]).map((d) => (
                  <option key={d} value={d}>
                    {DISCIPLINES[d].label}
                  </option>
                ))}
              </select>
              <Link href="/paths" className="btn-ink text-sm">
                View all courses
              </Link>
            </div>
          </div>

          {filteredCourses.length === 0 ? (
            <div className="rounded-lg border border-line bg-surface-2 p-10 text-center">
              <p className="text-sm text-muted">
                No published paths in this domain yet. Import a course bundle or switch domain.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 pt-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCourses.map((course) => {
                const prog = pathProgress(course, progress.completed);
                const pct = Math.round(prog.ratio * 100);
                return (
                  <Link
                    key={course.slug}
                    href={`/paths/${course.slug}`}
                    className="folder-card group block p-6 pt-7"
                  >
                    <span className="folder-tab">{DISCIPLINES[course.discipline].label}</span>
                    <h3 className="font-display text-lg font-bold text-text transition-colors group-hover:text-accent">
                      {course.title}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                      {course.tagline}
                    </p>
                    <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-accent">
                        {course.modules.length} {course.modules.length === 1 ? "module" : "modules"}{" "}
                        · {prog.total} lessons
                      </span>
                      <span className="text-xs tabular-nums text-muted">{pct}% complete</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Stats & Weekly Activity Section */}
      <section id="analytics" className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-line bg-surface-2 p-6">
              <div className="text-xs font-bold uppercase tracking-wider text-muted">
                Total Progress
              </div>
              <div className="dot-matrix mt-1 text-3xl font-bold text-text">{stats.pct}%</div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface-3">
                <div
                  className="h-full bg-accent transition-[width] duration-300"
                  style={{ width: `${stats.pct}%` }}
                />
              </div>
            </div>

            <div className="rounded-lg border border-line bg-surface-2 p-6">
              <div className="text-xs font-bold uppercase tracking-wider text-muted">
                Lessons Complete
              </div>
              <div className="dot-matrix mt-1 text-3xl font-bold text-text">
                {stats.completedLessons}
              </div>
              <div className="mt-2 text-xs tabular-nums text-muted">
                of {stats.totalLessons} total
              </div>
            </div>

            <div className="rounded-lg border border-line bg-surface-2 p-6">
              <div className="text-xs font-bold uppercase tracking-wider text-muted">
                Current Streak
              </div>
              <div className="dot-matrix mt-1 text-3xl font-bold text-electric">{stats.streak}</div>
              <div className="mt-2 text-xs text-muted">
                {stats.streak === 1 ? "day active" : "days active"}
              </div>
            </div>

            <div className="rounded-lg border border-line bg-surface-2 p-6">
              <div className="text-xs font-bold uppercase tracking-wider text-muted">
                Artifacts Logged
              </div>
              <div className="dot-matrix mt-1 text-3xl font-bold text-text">
                {stats.totalArtifacts}
              </div>
              <div className="mt-2 text-xs text-muted">labs, scenarios &amp; capstone</div>
            </div>
          </div>

          <div className="rounded-lg border border-line bg-surface-2 p-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="section-label">Activity</span>
                <h3 className="font-display text-xl font-bold text-text">Weekly Activity</h3>
              </div>
              <Link href="/me" className="text-sm font-medium text-accent hover:underline">
                View full analytics →
              </Link>
            </div>

            <div
              className="flex h-48 items-end gap-3 pt-4"
              role="img"
              aria-label="Weekly learning activity chart for the past 7 days"
            >
              {stats.weekly.map((entry) => {
                const heightPct =
                  entry.count > 0
                    ? Math.max(18, Math.round((entry.count / stats.maxWeekly) * 100))
                    : 6;
                return (
                  <div
                    key={entry.day}
                    className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                  >
                    <div className="flex w-full flex-1 items-end">
                      <div
                        className={`w-full rounded-t rounded-b-sm transition-all duration-300 ${
                          entry.count > 0 ? "bg-accent hover:opacity-85" : "bg-surface-3"
                        }`}
                        style={{ height: `${heightPct}%` }}
                        title={`${entry.day}: ${entry.count} ${entry.count === 1 ? "activity" : "activities"}`}
                      />
                    </div>
                    <div className="font-mono text-[11px] tabular-nums text-text/70">
                      {entry.count}
                    </div>
                    <div className="text-[11px] text-muted">{entry.day}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
