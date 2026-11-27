import { useState } from "react";
import Link from "@/components/neet/AppLink";
import { DISCIPLINES, LABS, PATHS, STAGES, SKILLS } from "@/lib/neet/content";
import { ROLE_PROFILES, competencyById, roleProfileById } from "@/lib/neet/competencies";
import { pathProgress } from "@/lib/neet/derive";
import { CAPSTONE_PROJECT, SCENARIOS } from "@/lib/neet/rubrics";
import {
  calibration,
  computeAll,
  disciplineScores,
  nextBestStep,
  recommendLearningPath,
  resolveEvidenceTier,
} from "@/lib/neet/scale";
import { actions, useHydrated, useProgress } from "@/lib/neet/store";
import ProgressBar from "./ProgressBar";
import SkillMap from "./SkillMap";
import SkillRadar from "./SkillRadar";

const TIER_LABEL = {
  none: "Unverified",
  "self-assessed": "Self-assessed",
  "automated-check": "Automated check",
  "rubric-evaluated": "Peer/Rubric reviewed",
  "reviewer-verified": "Reviewer-verified",
} as const;

const PRIORITY_LABEL = {
  high: "High priority",
  medium: "Recommended",
  low: "Next foundation",
} as const;

export default function Dashboard({ goalTexts = [] }: { goalTexts?: string[] }) {
  const hydrated = useHydrated();
  const { evidence, completed, saved, labAttempts, scenarios, capstone, targetRoleId } =
    useProgress();
  const [confirmingReset, setConfirmingReset] = useState(false);

  if (!hydrated) {
    return (
      <div
        className="grid gap-6 md:grid-cols-2"
        aria-busy="true"
        aria-label="Loading your progress"
      >
        <div className="skeleton h-72" />
        <div className="skeleton h-72" />
        <div className="skeleton h-48 md:col-span-2" />
      </div>
    );
  }

  const now = Date.now();
  const activeRole = roleProfileById(targetRoleId);
  const progress = computeAll(evidence, now);
  const scores = disciplineScores(progress);
  const next = nextBestStep(progress, completed, now, goalTexts, targetRoleId);
  const recommendations = recommendLearningPath(progress, completed, goalTexts, now, targetRoleId);
  const cal = calibration(evidence);
  const empty =
    evidence.length === 0 &&
    completed.length === 0 &&
    Object.keys(labAttempts).length === 0 &&
    Object.keys(scenarios).length === 0 &&
    Object.keys(capstone).length === 0;

  const rubricLabEntries = Object.entries(labAttempts)
    .filter(([, list]) => list.length > 0)
    .map(([labId, list]) => ({
      labId,
      lab: LABS.find((l) => l.id === labId),
      latest: list[list.length - 1]!,
      revisions: list.length,
    }));

  const scenarioEntries = Object.entries(scenarios).map(([id, attempt]) => ({
    id,
    scenario: SCENARIOS.find((s) => s.id === id),
    attempt,
  }));

  const capstoneEntries = Object.entries(capstone)
    .filter(([, list]) => list.length > 0)
    .map(([id, list]) => ({
      id,
      milestone: CAPSTONE_PROJECT.milestones.find((m) => m.id === id),
      latest: list[list.length - 1]!,
      revisions: list.length,
    }));

  const totalArtifacts = rubricLabEntries.length + scenarioEntries.length + capstoneEntries.length;
  const recentEvidence = [...evidence].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 8);

  return (
    <div className="space-y-8">
      {empty && (
        <div className="rounded-3xl border border-dashed border-accent-dim bg-surface p-8 text-center">
          <h2 className="font-display text-2xl">No evidence recorded yet.</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            Completion checkboxes do not grant competency. Answer pause-and-think checks, evaluate a
            deterministic trade-off scenario, or submit a structured lab artifact to build your
            Proceed Scale.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link href="/paths" className="btn-ink">
              Start a learning path
            </Link>
            <Link
              href="/labs"
              className="rounded-full border border-line px-5 py-2.5 text-sm text-text hover:border-accent"
            >
              Open Practice Studio
            </Link>
            <button
              type="button"
              onClick={actions.loadDemo}
              className="rounded-full border border-line px-5 py-2.5 text-sm text-muted hover:text-text"
            >
              Load sample evidence
            </button>
          </div>
        </div>
      )}

      {/* Provisional Target Role Profile Selector */}
      <section
        aria-labelledby="role-profile-h"
        className="rounded-3xl border border-line bg-surface p-6"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2
              id="role-profile-h"
              className="font-label text-sm uppercase tracking-widest text-accent"
            >
              Target Role Profile (Provisional)
            </h2>
            <p className="mt-1 text-xs text-muted">
              Select a provisional study focus to prioritize competency gaps and explain why each
              next step is recommended.
            </p>
          </div>
          {activeRole && (
            <button
              type="button"
              onClick={() => actions.setTargetRole(undefined)}
              className="text-xs text-muted underline underline-offset-4 hover:text-text"
            >
              Clear role filter
            </button>
          )}
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {ROLE_PROFILES.map((role) => {
            const selected = targetRoleId === role.id;
            const reqKeys = Object.keys(role.requiredLevels);
            const met = reqKeys.filter(
              (sid) =>
                (progress.find((p) => p.skillId === sid)?.level ?? 0) >= role.requiredLevels[sid]!,
            ).length;
            return (
              <button
                key={role.id}
                type="button"
                aria-pressed={selected}
                onClick={() => actions.setTargetRole(selected ? undefined : role.id)}
                className={`rounded-2xl border p-4 text-left transition ${
                  selected
                    ? "border-accent bg-accent/10"
                    : "border-line bg-bg hover:border-accent/50"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono uppercase text-accent">Provisional</span>
                  <span className="text-xs font-mono text-muted">
                    {met}/{reqKeys.length} targets met
                  </span>
                </div>
                <p className="mt-1.5 font-semibold text-sm text-text">{role.title}</p>
                <p className="mt-1 text-xs text-muted line-clamp-2">{role.summary}</p>
              </button>
            );
          })}
        </div>
        {activeRole && <p className="mt-3 text-[11px] text-muted">{activeRole.disclaimer}</p>}
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <section aria-labelledby="radar-h" className="rounded-3xl bg-surface p-6">
          <div className="flex items-baseline justify-between gap-2">
            <h2 id="radar-h" className="font-label text-sm uppercase tracking-widest text-accent">
              Evidence-backed discipline index
            </h2>
            <span className="text-[11px] text-muted">Recency-weighted · not lesson %</span>
          </div>
          <SkillRadar scores={scores} />
          <ul className="mt-4 grid grid-cols-3 gap-2 text-center">
            {(Object.keys(DISCIPLINES) as (keyof typeof DISCIPLINES)[]).map((d) => (
              <li key={d}>
                <p className="font-display text-3xl text-text">{Math.round(scores[d])}</p>
                <p className="text-xs text-muted">{DISCIPLINES[d].label}</p>
              </li>
            ))}
          </ul>
        </section>

        <div className="space-y-6">
          <section
            aria-labelledby="next-h"
            className="rounded-3xl bg-surface ring-1 ring-accent-dim p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 id="next-h" className="font-label text-sm uppercase tracking-widest text-accent">
                Recommended next step
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {activeRole && (
                  <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-[11px] font-medium text-accent">
                    {activeRole.title}
                  </span>
                )}
                {goalTexts.length > 0 && (
                  <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-[11px] font-medium text-muted">
                    {goalTexts.length} goal{goalTexts.length === 1 ? "" : "s"}
                  </span>
                )}
              </div>
            </div>
            <p className="mt-3 font-display text-2xl text-text">{next.title}</p>
            <p className="mt-1 text-sm text-muted">{next.reason}</p>
            <Link href={next.href} className="mt-4 inline-block btn-ink">
              {next.kind === "lab"
                ? "Open domain lab"
                : next.kind === "review"
                  ? "Refresh evidence"
                  : "Open lesson"}{" "}
              →
            </Link>
          </section>

          <section aria-labelledby="cal-h" className="rounded-3xl bg-surface p-6">
            <h2 id="cal-h" className="font-label text-sm uppercase tracking-widest text-accent">
              Judgment calibration
            </h2>
            {cal.n === 0 ? (
              <p className="mt-3 text-sm text-muted">
                Answer pause-and-think checks with confidence ratings to measure whether your
                engineering judgment is well calibrated.
              </p>
            ) : (
              <>
                <p className="mt-3 text-text">
                  <span className="font-display text-3xl">
                    {cal.gap >= 0 ? "+" : ""}
                    {Math.round(cal.gap * 100)}
                  </span>
                  <span className="ml-2 text-sm text-muted">
                    points ({cal.n} checks).{" "}
                    {Math.abs(cal.gap) < 0.1
                      ? "Well calibrated."
                      : cal.gap > 0
                        ? "Overconfident — test assumptions before committing."
                        : "Underconfident — your reasoning is stronger than you estimate."}
                  </span>
                </p>
                <Link
                  href="/me/calibration"
                  className="mt-3 inline-block text-sm text-accent underline underline-offset-4"
                >
                  Inspect calibration curve →
                </Link>
              </>
            )}
          </section>

          <section aria-labelledby="paths-h" className="rounded-3xl bg-surface p-6">
            <div className="flex items-baseline justify-between gap-2">
              <h2 id="paths-h" className="font-label text-sm uppercase tracking-widest text-accent">
                Reading completion (place tracking)
              </h2>
              <span className="text-[11px] text-muted">Separate from mastery</span>
            </div>
            <ul className="mt-4 space-y-4">
              {PATHS.map((p) => {
                const pr = pathProgress(p, completed);
                return (
                  <li key={p.slug}>
                    <Link
                      href={`/paths/${p.slug}`}
                      className="flex items-baseline justify-between gap-3 text-sm hover:text-accent"
                    >
                      <span>{p.title}</span>
                      <span className="font-label text-xs text-muted">
                        {pr.done}/{pr.total} read
                      </span>
                    </Link>
                    <ProgressBar
                      value={pr.ratio}
                      label={`${p.title} reading progress`}
                      className="mt-2"
                    />
                  </li>
                );
              })}
            </ul>
            {saved.length > 0 && (
              <p className="mt-4 text-xs text-muted">
                {saved.length} bookmarked lesson{saved.length > 1 ? "s" : ""}.
              </p>
            )}
          </section>
        </div>
      </div>

      {/* Personalized Skill Gap Prioritization */}
      <section aria-labelledby="gaps-h" className="rounded-3xl border border-line bg-surface p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 id="gaps-h" className="font-label text-sm uppercase tracking-widest text-accent">
              Personalized learning path &amp; skill gaps
            </h2>
            <p className="mt-1 text-xs text-muted">
              Ordered by prerequisite readiness, stale evidence decay, target role requirements, and
              saved learning goals.
            </p>
          </div>
          <Link href="/labs" className="text-xs font-medium text-accent hover:underline">
            Go to Practice Studio →
          </Link>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {recommendations.map((rec) => (
            <Link
              key={`${rec.skillId}-${rec.actionHref}`}
              href={rec.actionHref}
              className="flex flex-col justify-between rounded-2xl border border-line bg-bg p-4 transition hover:border-accent"
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="font-mono text-accent">
                    {rec.code} · L{rec.currentLevel}
                    {rec.targetLevel ? ` → L${rec.targetLevel}` : ""}
                  </span>
                  <span className="rounded-full bg-surface-2 px-2 py-0.5 text-muted">
                    {PRIORITY_LABEL[rec.priority]}
                  </span>
                </div>
                <p className="mt-2 font-medium text-text">{rec.title}</p>
                <p className="mt-1 text-xs text-muted">{rec.reason}</p>
              </div>
              <span className="mt-3 text-xs font-medium text-accent">{rec.actionLabel} →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Evidence-backed Competency Matrix */}
      <section aria-labelledby="skills-h" className="rounded-3xl bg-surface p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="skills-h" className="font-label text-sm uppercase tracking-widest text-accent">
            Competency evidence matrix (Proceed Scale v2.1)
          </h2>
          <span className="text-xs text-muted">
            Separate coverage, quality, freshness &amp; verification tier
          </span>
        </div>
        <ul className="mt-4 divide-y divide-line">
          {SKILLS.map((s) => {
            const p = progress.find((x) => x.skillId === s.id)!;
            const comp = competencyById(s.id);
            const stage = p.level > 0 ? STAGES[p.level - 1]!.label : "Not yet assessed";
            const roleTarget = activeRole?.requiredLevels[s.id];
            return (
              <li
                key={s.id}
                className="grid items-center gap-2 py-3.5 sm:grid-cols-[1.3fr_0.9fr_1fr_1.6fr]"
              >
                <div>
                  <span className="font-mono text-[11px] text-accent">{comp?.code}</span>
                  <p className="text-sm font-medium text-text">
                    {s.title}
                    {roleTarget ? (
                      <span className="ml-2 font-mono text-[10px] text-muted">
                        (Target L{roleTarget})
                      </span>
                    ) : null}
                  </p>
                </div>
                <div>
                  <span className="font-label text-sm text-accent">
                    L{p.level} · {stage}
                  </span>
                  <p className="text-[11px] text-muted">{TIER_LABEL[p.verificationTier]}</p>
                </div>
                <div className="text-xs text-muted tabular-nums">
                  <p>
                    Quality: {p.evidenceCount > 0 ? `${Math.round(p.quality * 100)}%` : "—"} ·
                    Coverage: {Math.round(p.coverage * 100)}%
                  </p>
                  <p className="capitalize">Freshness: {p.freshness.replace(/-/g, " ")}</p>
                </div>
                <span className="text-xs text-muted">
                  {p.gate ?? "Top of scale reached — maintain freshness with periodic review."}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Evidence Timeline & Verification Ledger */}
      {recentEvidence.length > 0 && (
        <section
          aria-labelledby="ledger-h"
          className="rounded-3xl border border-line bg-surface p-6"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="ledger-h" className="font-label text-sm uppercase tracking-widest text-accent">
              Recent Evidence Ledger ({evidence.length} total)
            </h2>
            <span className="text-xs text-muted">
              Distinguishes self-assessed submissions from automated checks &amp; verified review
            </span>
          </div>
          <ul className="mt-4 divide-y divide-line text-xs">
            {recentEvidence.map((ev) => {
              const tier = resolveEvidenceTier(ev);
              const comp = competencyById(ev.skillId);
              return (
                <li
                  key={ev.idempotencyKey ?? `${ev.skillId}-${ev.at}-${ev.ref ?? ""}`}
                  className="flex flex-wrap items-center justify-between gap-2 py-2.5"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-accent">{comp?.code ?? ev.skillId}</span>
                    <span className="font-medium capitalize text-text">{ev.type}</span>
                    {ev.ref && <span className="text-muted">({ev.ref})</span>}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-line bg-bg px-2 py-0.5 text-[11px] text-muted">
                      {TIER_LABEL[tier]}
                    </span>
                    <span className="font-mono font-medium text-text">
                      {Math.round(ev.score * 100)}%
                    </span>
                    <span className="text-muted">{new Date(ev.at).toLocaleDateString()}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Demonstrable Engineering Portfolio */}
      <section
        aria-labelledby="portfolio-h"
        className="rounded-3xl border border-line bg-surface p-6"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2
              id="portfolio-h"
              className="font-label text-sm uppercase tracking-widest text-accent"
            >
              Engineering artifact portfolio ({totalArtifacts})
            </h2>
            <p className="mt-1 text-xs text-muted">
              Self-directed engineering work log of self-assessed labs, deterministic trade-off
              checks, and traceable capstone artifacts. Provisional until independently reviewed;
              not a formal INCOSE, ISO, or regulatory certification.
            </p>
          </div>
          <Link href="/labs" className="text-xs font-medium text-accent hover:underline">
            Add artifact →
          </Link>
        </div>

        {totalArtifacts === 0 ? (
          <p className="mt-4 rounded-2xl bg-bg p-4 text-sm text-muted">
            No lab or capstone artifacts submitted yet. Complete a practice lab, trade-off scenario,
            or capstone milestone to build a demonstrable engineering record.
          </p>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {rubricLabEntries.map(({ labId, lab, latest, revisions }) => (
              <div
                key={`${labId}-${latest.attemptNumber}`}
                className="rounded-2xl border border-line bg-bg p-4"
              >
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-mono text-accent">
                    Lab · {lab ? competencyById(lab.skillId)?.code : labId}
                  </span>
                  <span className="font-medium text-amber-700 dark:text-amber-400">
                    Self-assessed · {Math.round(latest.weightedScore * 100)}% · Rev {revisions}
                  </span>
                </div>
                <p className="mt-1.5 font-medium text-text">{lab?.title ?? labId}</p>
                <p className="mt-1 text-xs text-muted line-clamp-2">{latest.note}</p>
                {latest.artifactUrl && (
                  <a
                    href={latest.artifactUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block font-mono text-[11px] text-accent hover:underline"
                  >
                    {latest.artifactUrl} ↗
                  </a>
                )}
              </div>
            ))}

            {scenarioEntries.map(({ id, scenario, attempt }) => (
              <div key={`sc-${id}`} className="rounded-2xl border border-line bg-bg p-4">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-mono text-accent">
                    Scenario · {scenario ? competencyById(scenario.skillId)?.code : id}
                  </span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                    Automated check · {Math.round(attempt.score * 100)}%
                  </span>
                </div>
                <p className="mt-1.5 font-medium text-text">
                  {scenario?.title ?? "Trade-Off Scenario"}
                </p>
                {attempt.invalidationNote && (
                  <p className="mt-1 text-xs text-muted line-clamp-2">
                    Invalidation condition: {attempt.invalidationNote}
                  </p>
                )}
              </div>
            ))}

            {capstoneEntries.map(({ id, milestone, latest, revisions }) => (
              <div
                key={`cap-${id}-${latest.attemptNumber}`}
                className="rounded-2xl border border-accent/30 bg-bg p-4"
              >
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-mono text-accent">
                    Capstone M{milestone?.order ?? "?"} ·{" "}
                    {milestone?.skillIds[0] ? competencyById(milestone.skillIds[0])?.code : id}
                  </span>
                  <span className="font-medium text-amber-700 dark:text-amber-400">
                    Self-assessed · {Math.round(latest.weightedScore * 100)}% · Rev {revisions}
                  </span>
                </div>
                <p className="mt-1.5 font-medium text-text">{milestone?.title ?? id}</p>
                <p className="mt-1 text-xs text-muted line-clamp-2">{latest.note}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="map-h">
        <h2 id="map-h" className="mb-5 font-display text-2xl">
          Interactive competency graph
        </h2>
        <SkillMap compact />
      </section>

      {!empty && (
        <div className="flex flex-wrap gap-3 text-sm">
          <button
            type="button"
            onClick={actions.loadDemo}
            className="text-muted underline underline-offset-4 hover:text-text"
          >
            Load sample evidence
          </button>
          {confirmingReset ? (
            <span className="inline-flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  actions.reset();
                  setConfirmingReset(false);
                }}
                className="font-medium text-warn underline underline-offset-4"
              >
                Confirm erase local progress
              </button>
              <button
                type="button"
                onClick={() => setConfirmingReset(false)}
                className="text-muted underline underline-offset-4 hover:text-text"
              >
                Cancel
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingReset(true)}
              className="text-warn underline underline-offset-4"
            >
              Reset local progress
            </button>
          )}
        </div>
      )}
    </div>
  );
}
