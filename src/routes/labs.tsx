import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { pageHead } from "@/lib/neet/meta";
import { DISCIPLINES, LABS, skillById } from "@/lib/neet/content";
import { competencyById } from "@/lib/neet/competencies";
import {
  CAPSTONE_PROJECT,
  SCENARIOS,
  evaluateRubric,
  type CapstoneMilestone,
  type ScenarioChallenge,
} from "@/lib/neet/rubrics";
import { actions, useProgress } from "@/lib/neet/store";
import { Chip } from "@/components/neet/ui";
import LabCard from "@/components/neet/LabCard";
import type { Discipline } from "@/lib/neet/types";

type StudioTab = "labs" | "scenarios" | "capstone";

function ScenarioCard({ scenario }: { scenario: ScenarioChallenge }) {
  const { scenarios } = useProgress();
  const saved = scenarios[scenario.id];
  const [selected, setSelected] = useState(saved?.optionId ?? "");
  const [invalidation, setInvalidation] = useState(saved?.invalidationNote ?? "");
  const [editing, setEditing] = useState(!saved);

  const comp = competencyById(scenario.skillId);
  const skill = skillById(scenario.skillId);
  const chosenOpt = scenario.options.find((o) => o.id === (saved?.optionId ?? selected));
  const bestOpt = scenario.options.reduce(
    (a, b) => (b.score > a.score ? b : a),
    scenario.options[0]!,
  );

  return (
    <article className="rounded-3xl border border-line bg-surface p-6">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-label text-xs uppercase tracking-widest">
        <span className="text-accent">Trade-Off Scenario</span>
        {comp && <span className="font-mono text-text">{comp.code}</span>}
        <span className="text-muted">{skill?.title}</span>
        {saved && (
          <span className="ml-auto rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            Evaluated · {Math.round(saved.score * 100)}%
          </span>
        )}
      </div>

      <p className="mt-2 text-xs text-muted">{scenario.domainContext}</p>
      <h2 className="mt-1 font-display text-2xl text-text">{scenario.title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">{scenario.situation}</p>

      <div className="mt-4 rounded-2xl bg-bg p-4">
        <p className="font-label text-xs uppercase tracking-widest text-muted">Hard constraints</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-text">
          {scenario.constraints.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </div>

      <p className="mt-4 font-medium text-text">{scenario.question}</p>

      {editing ? (
        <div className="mt-3 space-y-3">
          {scenario.options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              aria-pressed={selected === opt.id}
              onClick={() => setSelected(opt.id)}
              className={`block w-full rounded-2xl border p-4 text-left text-sm transition ${
                selected === opt.id
                  ? "border-accent bg-accent/10 text-text"
                  : "border-line bg-bg text-muted hover:text-text"
              }`}
            >
              <span className="font-medium text-text">{opt.label}</span>
              <span className="mt-1 block text-xs text-muted">Trade-off: {opt.tradeoff}</span>
            </button>
          ))}

          <div>
            <label htmlFor={`inv-${scenario.id}`} className="block text-xs font-medium text-muted">
              {scenario.invalidationPrompt}
            </label>
            <textarea
              id={`inv-${scenario.id}`}
              value={invalidation}
              onChange={(e) => setInvalidation(e.target.value)}
              rows={2}
              placeholder="Write the specific metric, load, or operational condition that would invalidate your chosen option (min 25 chars for full credit)…"
              className="mt-1 w-full rounded-xl border border-line bg-bg p-3 text-sm text-text placeholder:text-muted"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              disabled={!selected}
              onClick={() => {
                actions.answerScenario(scenario.id, selected, invalidation);
                setEditing(false);
              }}
              className="btn-ink text-sm disabled:opacity-40"
            >
              Evaluate engineering decision
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-3 rounded-2xl bg-surface-2 p-4 text-sm">
          {chosenOpt && (
            <>
              <p className="font-semibold text-text">Your choice: {chosenOpt.label}</p>
              <p className="text-muted">{chosenOpt.feedback}</p>
            </>
          )}
          {saved?.invalidationNote && (
            <p className="rounded-xl bg-bg p-3 text-xs text-muted">
              <strong className="text-text">Your invalidation condition:</strong>{" "}
              {saved.invalidationNote}
            </p>
          )}
          {chosenOpt?.id !== bestOpt.id && (
            <div className="rounded-xl border border-accent/25 bg-bg p-3 text-xs">
              <p className="font-semibold text-accent">Strongest systems trade-off</p>
              <p className="mt-1 font-medium text-text">{bestOpt.label}</p>
              <p className="mt-1 leading-relaxed text-muted">{bestOpt.feedback}</p>
            </div>
          )}
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-xs text-accent underline underline-offset-4"
          >
            Re-evaluate scenario
          </button>
        </div>
      )}
    </article>
  );
}

function CapstoneMilestoneCard({ milestone }: { milestone: CapstoneMilestone }) {
  const { capstone } = useProgress();
  const attempts = capstone[milestone.id] ?? [];
  const latest = attempts[attempts.length - 1];
  const comps = milestone.skillIds.map((id) => competencyById(id)).filter(Boolean);

  const [note, setNote] = useState("");
  const [url, setUrl] = useState("");
  const [scores, setScores] = useState<Record<string, number>>({});
  const [open, setOpen] = useState(!latest);

  const allScored = milestone.rubric.criteria.every((c) => typeof scores[c.id] === "number");
  const evalPreview = allScored ? evaluateRubric(milestone.rubric, scores) : null;
  const urlValid = !url.trim() || /^https?:\/\/\S+/i.test(url.trim()) || url.trim().startsWith("/");

  return (
    <article className="rounded-3xl border border-line bg-surface p-6">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full bg-ink px-2.5 py-0.5 font-mono font-semibold text-bg">
          {milestone.traceStage}
        </span>
        {comps.map((comp) => (
          <span key={comp!.code} className="font-mono text-accent">
            {comp!.code}
          </span>
        ))}
        {latest && (
          <span className="ml-auto rounded-full bg-emerald-500/10 px-2.5 py-0.5 font-medium text-emerald-600 dark:text-emerald-400">
            {Math.round(latest.weightedScore * 100)}% · Rev {attempts.length}
          </span>
        )}
      </div>

      <h3 className="mt-2 font-display text-xl text-text">{milestone.title}</h3>
      <p className="mt-1.5 text-sm text-muted">{milestone.prompt}</p>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-text">
        {milestone.deliverables.map((d) => (
          <li key={d}>{d}</li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-accent">Traceability: {milestone.traceabilityLink}</p>

      {open ? (
        <div className="mt-4 space-y-3 border-t border-line pt-4">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Artifact URL (optional — GitHub, diagram, or spec link)"
            className="w-full rounded-xl border border-line bg-bg px-3 py-2 text-sm text-text placeholder:text-muted"
          />
          {!urlValid && (
            <p className="text-xs text-rose-600 dark:text-rose-400">
              URL must begin with http://, https://, or /.
            </p>
          )}
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            placeholder="Document your milestone artifact, traceable IDs (e.g. REQ-01 -> ADR-01 -> HAZ-01), and key engineering rationale (min 40 chars)…"
            className="w-full rounded-xl border border-line bg-bg p-3 text-sm text-text placeholder:text-muted"
          />

          <div className="rounded-2xl border border-line bg-bg/70 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-label uppercase tracking-wider text-accent">
                Milestone Rubric (pass ≥ {Math.round(milestone.rubric.passThreshold * 100)}%)
              </span>
              {evalPreview && (
                <span
                  className={
                    evalPreview.passedThreshold
                      ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                      : "text-amber-600 font-semibold"
                  }
                >
                  {Math.round(evalPreview.weightedScore * 100)}%
                </span>
              )}
            </div>
            {milestone.rubric.criteria.map((c) => (
              <div key={c.id}>
                <p className="text-xs font-medium text-text">{c.label}</p>
                <div className="mt-1.5 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-4">
                  {([1, 2, 3, 4] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      aria-pressed={scores[c.id] === lvl}
                      onClick={() => setScores((prev) => ({ ...prev, [c.id]: lvl }))}
                      className={`rounded-lg border p-2 text-left text-[11px] ${
                        scores[c.id] === lvl
                          ? "border-accent bg-accent/15 text-text"
                          : "border-line bg-surface text-muted hover:text-text"
                      }`}
                    >
                      <strong className="font-mono">{lvl}/4</strong> — {c.descriptors[lvl]}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            {latest && (
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-line px-4 py-1.5 text-xs text-muted"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              disabled={note.trim().length < 40 || !allScored || !urlValid}
              onClick={() => {
                actions.submitCapstoneMilestone(milestone.id, {
                  note: note.trim(),
                  ...(url.trim() ? { artifactUrl: url.trim() } : {}),
                  criterionScores: scores,
                });
                setOpen(false);
                setNote("");
                setUrl("");
              }}
              className="btn-ink text-xs disabled:opacity-40"
            >
              Submit milestone artifact
            </button>
          </div>
        </div>
      ) : (
        latest && (
          <div className="mt-4 space-y-2 rounded-2xl bg-surface-2 p-4 text-sm">
            {latest.artifactUrl && (
              <a
                href={latest.artifactUrl}
                target="_blank"
                rel="noreferrer"
                className="block font-mono text-xs text-accent hover:underline"
              >
                {latest.artifactUrl} ↗
              </a>
            )}
            <p className="whitespace-pre-wrap text-text">{latest.note}</p>
            <div className="flex items-center justify-between pt-1 text-xs text-muted">
              <span>Rubric-evaluated · {new Date(latest.at).toLocaleDateString()}</span>
              <button
                type="button"
                onClick={() => {
                  setNote(latest.note);
                  setUrl(latest.artifactUrl ?? "");
                  setScores(latest.rubricScores);
                  setOpen(true);
                }}
                className="text-accent underline underline-offset-4"
              >
                Revise milestone
              </button>
            </div>
          </div>
        )
      )}
    </article>
  );
}

function LabsPage() {
  const [tab, setTab] = useState<StudioTab>("labs");
  const [discipline, setDiscipline] = useState<Discipline | null>(null);
  const { capstone } = useProgress();

  const filteredLabs = discipline
    ? LABS.filter((l) => skillById(l.skillId)?.discipline === discipline)
    : LABS;

  const completedMilestones = CAPSTONE_PROJECT.milestones.filter(
    (m) => (capstone[m.id]?.length ?? 0) > 0,
  ).length;

  return (
    <div className="mx-auto max-w-5xl px-5 py-16">
      <p className="font-label text-sm uppercase tracking-widest text-accent">
        Practice &amp; Assessment Studio
      </p>
      <h1 className="mt-2 font-display text-5xl">Prove judgment with real artifacts.</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">
        Completion does not equal mastery. Produce rubric-evaluated labs, defend trade-offs under
        constraint twists, and assemble a traceable end-to-end systems engineering capstone.
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        <Chip active={tab === "labs"} onClick={() => setTab("labs")}>
          Practice Labs ({LABS.length})
        </Chip>
        <Chip active={tab === "scenarios"} onClick={() => setTab("scenarios")}>
          Worked Trade-Off Scenarios ({SCENARIOS.length})
        </Chip>
        <Chip active={tab === "capstone"} onClick={() => setTab("capstone")}>
          Cumulative Capstone ({completedMilestones}/{CAPSTONE_PROJECT.milestones.length})
        </Chip>
      </div>

      {tab === "labs" && (
        <>
          <div className="mt-6 flex flex-wrap gap-2">
            <Chip active={!discipline} onClick={() => setDiscipline(null)}>
              All disciplines
            </Chip>
            {(Object.keys(DISCIPLINES) as Discipline[]).map((d) => (
              <Chip
                key={d}
                active={discipline === d}
                onClick={() => setDiscipline(discipline === d ? null : d)}
              >
                {DISCIPLINES[d].label}
              </Chip>
            ))}
          </div>
          <div className="mt-8 space-y-6">
            {filteredLabs.map((l) => (
              <LabCard key={l.id} lab={l} />
            ))}
          </div>
        </>
      )}

      {tab === "scenarios" && (
        <div className="mt-8 space-y-6">
          {SCENARIOS.map((sc) => (
            <ScenarioCard key={sc.id} scenario={sc} />
          ))}
        </div>
      )}

      {tab === "capstone" && (
        <div className="mt-8 space-y-6">
          <div className="rounded-3xl border border-accent/30 bg-surface p-6 sm:p-8">
            <p className="font-label text-xs uppercase tracking-widest text-accent">
              Traceable Systems Engineering Capstone
            </p>
            <h2 className="mt-2 font-display text-3xl text-text">{CAPSTONE_PROJECT.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{CAPSTONE_PROJECT.summary}</p>
            <p className="mt-2 text-xs text-muted">{CAPSTONE_PROJECT.disclaimer}</p>
            <p className="mt-3 text-xs font-medium text-accent">
              Progress: {completedMilestones} of {CAPSTONE_PROJECT.milestones.length} milestones
              submitted.
            </p>
          </div>
          {CAPSTONE_PROJECT.milestones.map((m) => (
            <CapstoneMilestoneCard key={m.id} milestone={m} />
          ))}
        </div>
      )}
    </div>
  );
}

export const Route = createFileRoute("/labs")({
  head: () =>
    pageHead(
      "Practice Studio — Labs, Scenarios & Capstone",
      "Rubric-evaluated labs, worked engineering trade-off scenarios, and a traceable 6-milestone systems engineering capstone.",
    ),
  component: LabsPage,
});
