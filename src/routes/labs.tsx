import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { pageHead } from "@/lib/neet/meta";
import { DISCIPLINES, skillById } from "@/lib/neet/content";
import { competencyById } from "@/lib/neet/competencies";
import {
  CAPSTONE_PROJECT,
  evaluateRubric,
  type CapstoneMilestone,
  type ScenarioChallenge,
} from "@/lib/neet/rubrics";
import { getActiveCapstone, listLabs, listScenarios } from "@/lib/neet/curriculum.functions";
import type { DynamicCapstoneRecord } from "@/lib/neet/curriculum-schemas";
import { actions, useProgress } from "@/lib/neet/store";
import { Chip } from "@/components/neet/ui";
import LabCard from "@/components/neet/LabCard";
import type { DecisionRecord, Discipline } from "@/lib/neet/types";

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
        <span className="text-accent">Trade-Off Scenario · Automated Check</span>
        {comp && <span className="font-mono text-text">{comp.code}</span>}
        <span className="text-muted">{skill?.title}</span>
        {saved && (
          <span className="ml-auto rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            Checked · {Math.round(saved.score * 100)}%
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
          <div className="flex items-center justify-between text-xs text-muted">
            <span>Verification: Deterministic automated scenario check</span>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-accent underline underline-offset-4"
            >
              Re-evaluate scenario
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

const EMPTY_DECISION: DecisionRecord = {
  selectedDecision: "",
  rejectedAlternatives: "",
  assumptions: "",
  residualRisks: "",
};

function CapstoneMilestoneCard({
  milestone,
  allMilestones,
}: {
  milestone: CapstoneMilestone;
  allMilestones: CapstoneMilestone[];
}) {
  const { capstone } = useProgress();
  const attempts = capstone[milestone.id] ?? [];
  const latest = attempts[attempts.length - 1];
  const comps = milestone.skillIds.map((id) => competencyById(id)).filter(Boolean);

  const availableUpstream = milestone.upstreamMilestoneIds
    .map((uid) => {
      const m = allMilestones.find((x) => x.id === uid);
      const uAttempts = capstone[uid] ?? [];
      return m
        ? { milestone: m, submitted: uAttempts.length > 0, latestRev: uAttempts.length }
        : null;
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x));

  const [note, setNote] = useState("");
  const [url, setUrl] = useState("");
  const [feedbackResponse, setFeedbackResponse] = useState("");
  const [linkedIds, setLinkedIds] = useState<string[]>(
    availableUpstream.filter((u) => u.submitted).map((u) => u.milestone.id),
  );
  const [decision, setDecision] = useState<DecisionRecord>(EMPTY_DECISION);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [open, setOpen] = useState(!latest);

  const allScored = milestone.rubric.criteria.every((c) => typeof scores[c.id] === "number");
  const evalPreview = allScored ? evaluateRubric(milestone.rubric, scores) : null;
  const urlValid = !url.trim() || /^https?:\/\/\S+/i.test(url.trim()) || url.trim().startsWith("/");

  const toggleLinked = (id: string) =>
    setLinkedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <article
      id={milestone.id}
      className="scroll-mt-24 rounded-3xl border border-line bg-surface p-6"
    >
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full bg-ink px-2.5 py-0.5 font-mono font-semibold text-bg">
          {milestone.traceStage}
        </span>
        <span className="rounded-full border border-line bg-bg px-2.5 py-0.5 text-[11px] text-muted">
          {milestone.designReviewGate}
        </span>
        {comps.map((comp) => (
          <span key={comp!.code} className="font-mono text-accent">
            {comp!.code}
          </span>
        ))}
        {latest && (
          <span className="ml-auto rounded-full bg-amber-500/10 px-2.5 py-0.5 font-medium text-amber-700 dark:text-amber-400">
            Self-assessed · {Math.round(latest.weightedScore * 100)}% · Rev {attempts.length}
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
        <div className="mt-4 space-y-4 border-t border-line pt-4">
          {availableUpstream.length > 0 && (
            <div className="rounded-2xl border border-line bg-bg p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                Traceable upstream artifacts referenced
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {availableUpstream.map(({ milestone: um, submitted, latestRev }) => {
                  const checked = linkedIds.includes(um.id);
                  return (
                    <button
                      key={um.id}
                      type="button"
                      onClick={() => toggleLinked(um.id)}
                      className={`rounded-full border px-3 py-1 text-xs transition ${
                        checked
                          ? "border-accent bg-accent/15 text-text"
                          : "border-line bg-surface text-muted hover:text-text"
                      }`}
                    >
                      {checked ? "✓ " : "+ "}M{um.order} ({submitted ? `Rev ${latestRev}` : "Draft"}
                      )
                    </button>
                  );
                })}
              </div>
            </div>
          )}

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
            placeholder="Document your milestone artifact, traceable IDs (e.g. REQ-01 → ADR-01 → HAZ-01), and key engineering rationale (min 40 chars)…"
            className="w-full rounded-xl border border-line bg-bg p-3 text-sm text-text placeholder:text-muted"
          />

          {/* Structured Decision Record */}
          <div className="rounded-2xl border border-line bg-bg/70 p-4 space-y-2.5">
            <p className="font-label text-xs uppercase tracking-wider text-accent">
              Structured Decision Record (recommended for review defense)
            </p>
            <div className="grid gap-2.5 sm:grid-cols-2">
              <input
                type="text"
                value={decision.selectedDecision}
                onChange={(e) => setDecision((d) => ({ ...d, selectedDecision: e.target.value }))}
                placeholder="Selected engineering decision"
                className="rounded-xl border border-line bg-surface px-3 py-2 text-xs text-text placeholder:text-muted"
              />
              <input
                type="text"
                value={decision.rejectedAlternatives}
                onChange={(e) =>
                  setDecision((d) => ({ ...d, rejectedAlternatives: e.target.value }))
                }
                placeholder="Rejected alternatives & why"
                className="rounded-xl border border-line bg-surface px-3 py-2 text-xs text-text placeholder:text-muted"
              />
              <input
                type="text"
                value={decision.assumptions}
                onChange={(e) => setDecision((d) => ({ ...d, assumptions: e.target.value }))}
                placeholder="Explicit assumptions (what must hold true)"
                className="rounded-xl border border-line bg-surface px-3 py-2 text-xs text-text placeholder:text-muted"
              />
              <input
                type="text"
                value={decision.residualRisks}
                onChange={(e) => setDecision((d) => ({ ...d, residualRisks: e.target.value }))}
                placeholder="Residual risks & invalidation triggers"
                className="rounded-xl border border-line bg-surface px-3 py-2 text-xs text-text placeholder:text-muted"
              />
            </div>
          </div>

          {attempts.length > 0 && (
            <textarea
              value={feedbackResponse}
              onChange={(e) => setFeedbackResponse(e.target.value)}
              rows={2}
              placeholder={`Revision #${attempts.length + 1} response: explain what you refined since your previous attempt…`}
              className="w-full rounded-xl border border-accent/40 bg-bg p-3 text-sm text-text placeholder:text-muted"
            />
          )}

          <div className="rounded-2xl border border-line bg-bg/70 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-label uppercase tracking-wider text-accent">
                Milestone Self-Check Rubric · {milestone.rubric.id} (target ≥{" "}
                {Math.round(milestone.rubric.passThreshold * 100)}%)
              </span>
              {evalPreview && (
                <span
                  className={
                    evalPreview.passedThreshold
                      ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                      : "text-amber-600 font-semibold"
                  }
                >
                  {Math.round(evalPreview.weightedScore * 100)}% (provisional)
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
                  ...(feedbackResponse.trim() ? { feedbackResponse: feedbackResponse.trim() } : {}),
                  ...(linkedIds.length > 0 ? { linkedPriorArtifactIds: linkedIds } : {}),
                  decisionRecord: decision,
                  criterionScores: scores,
                });
                setOpen(false);
                setNote("");
                setUrl("");
                setFeedbackResponse("");
              }}
              className="btn-ink text-xs disabled:opacity-40"
            >
              Save milestone artifact (self-assessed)
            </button>
          </div>
        </div>
      ) : (
        latest && (
          <div className="mt-4 space-y-3 rounded-2xl bg-surface-2 p-4 text-sm">
            {latest.linkedPriorArtifactIds && latest.linkedPriorArtifactIds.length > 0 && (
              <p className="font-mono text-[11px] text-accent">
                Linked upstream: {latest.linkedPriorArtifactIds.join(", ")}
              </p>
            )}
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
            {latest.decisionRecord && (
              <dl className="grid gap-2 rounded-xl border border-line bg-bg/70 p-3 text-xs sm:grid-cols-2">
                {latest.decisionRecord.selectedDecision && (
                  <div>
                    <dt className="font-semibold text-text">Decision</dt>
                    <dd className="text-muted">{latest.decisionRecord.selectedDecision}</dd>
                  </div>
                )}
                {latest.decisionRecord.rejectedAlternatives && (
                  <div>
                    <dt className="font-semibold text-text">Rejected alternatives</dt>
                    <dd className="text-muted">{latest.decisionRecord.rejectedAlternatives}</dd>
                  </div>
                )}
                {latest.decisionRecord.assumptions && (
                  <div>
                    <dt className="font-semibold text-text">Assumptions</dt>
                    <dd className="text-muted">{latest.decisionRecord.assumptions}</dd>
                  </div>
                )}
                {latest.decisionRecord.residualRisks && (
                  <div>
                    <dt className="font-semibold text-text">Residual risks</dt>
                    <dd className="text-muted">{latest.decisionRecord.residualRisks}</dd>
                  </div>
                )}
              </dl>
            )}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-muted">
              <span>
                Self-assessed (provisional · pending independent review) · Rev {attempts.length} ·{" "}
                {new Date(latest.at).toLocaleDateString()}
              </span>
              <button
                type="button"
                onClick={() => {
                  setNote(latest.note);
                  setUrl(latest.artifactUrl ?? "");
                  setScores(latest.rubricScores);
                  setDecision(latest.decisionRecord ?? EMPTY_DECISION);
                  setLinkedIds(latest.linkedPriorArtifactIds ?? []);
                  setFeedbackResponse("");
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

function ChangeImpactCard({ capstoneProject }: { capstoneProject: DynamicCapstoneRecord }) {
  const { capstoneChangeImpact } = useProgress();
  const challenge = capstoneProject.changeImpactChallenge;
  const [response, setResponse] = useState(capstoneChangeImpact?.response ?? "");
  const [stages, setStages] = useState<string[]>(
    capstoneChangeImpact?.affectedStages ?? challenge.affectedMilestones,
  );
  const [editing, setEditing] = useState(!capstoneChangeImpact);

  const toggleStage = (id: string) =>
    setStages((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <article className="rounded-3xl border border-amber-500/40 bg-surface p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="rounded-full bg-amber-500/15 px-3 py-0.5 font-label text-xs uppercase tracking-widest text-amber-700 dark:text-amber-400">
          Midway Change-Impact Exercise
        </span>
        {capstoneChangeImpact && (
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            Impact traced ({capstoneChangeImpact.affectedStages.length} milestones affected)
          </span>
        )}
      </div>
      <h3 className="mt-2 font-display text-2xl text-text">{challenge.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-text">{challenge.scenario}</p>
      <p className="mt-2 text-xs text-muted">{challenge.prompt}</p>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-muted">
        {challenge.checklist.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      {editing ? (
        <div className="mt-4 space-y-3 border-t border-line pt-4">
          <div className="flex flex-wrap gap-2">
            {capstoneProject.milestones.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => toggleStage(m.id)}
                className={`rounded-full border px-3 py-1 text-xs ${
                  stages.includes(m.id)
                    ? "border-amber-500 bg-amber-500/15 text-text"
                    : "border-line bg-bg text-muted"
                }`}
              >
                {stages.includes(m.id) ? "✓ " : ""}M{m.order}: {m.traceStage}
              </button>
            ))}
          </div>
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            rows={4}
            placeholder="Trace how 10,000 calls/hr + 60-minute Zone 3 fiber cut propagates across your requirements, architecture, STPA hazards, Markov model, and GSN assumptions (min 40 chars)…"
            className="w-full rounded-xl border border-line bg-bg p-3 text-sm text-text placeholder:text-muted"
          />
          <div className="flex justify-end gap-2">
            {capstoneChangeImpact && (
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-full border border-line px-4 py-1.5 text-xs text-muted"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              disabled={response.trim().length < 40 || stages.length === 0}
              onClick={() => {
                actions.submitCapstoneChangeImpact(response, stages);
                setEditing(false);
              }}
              className="btn-ink text-xs disabled:opacity-40"
            >
              Save change-impact analysis
            </button>
          </div>
        </div>
      ) : (
        capstoneChangeImpact && (
          <div className="mt-4 space-y-2 rounded-2xl bg-surface-2 p-4 text-sm">
            <p className="whitespace-pre-wrap text-text">{capstoneChangeImpact.response}</p>
            <div className="flex items-center justify-between text-xs text-muted">
              <span>Saved {new Date(capstoneChangeImpact.at).toLocaleDateString()}</span>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="text-accent underline underline-offset-4"
              >
                Update impact analysis
              </button>
            </div>
          </div>
        )
      )}
    </article>
  );
}

function LabsPage() {
  const { labs, scenarios, capstone: loadedCapstone } = Route.useLoaderData();
  const capstoneProject: DynamicCapstoneRecord = loadedCapstone ?? {
    ...CAPSTONE_PROJECT,
    status: "published",
  };
  const [tab, setTab] = useState<StudioTab>("labs");
  const [discipline, setDiscipline] = useState<Discipline | null>(null);
  const { capstone, capstoneChangeImpact } = useProgress();

  const filteredLabs = discipline
    ? labs.filter((l) => (l.discipline ?? skillById(l.skillId)?.discipline) === discipline)
    : labs;

  const completedMilestones = capstoneProject.milestones.filter(
    (m) => (capstone[m.id]?.length ?? 0) > 0,
  ).length;

  const exportCapstoneDossier = () => {
    const dossier = {
      projectId: capstoneProject.id,
      projectVersion: capstoneProject.version,
      title: capstoneProject.title,
      exportedAt: new Date().toISOString(),
      disclaimer: capstoneProject.disclaimer,
      milestonesCompleted: completedMilestones,
      totalMilestones: capstoneProject.milestones.length,
      changeImpactExercise: capstoneChangeImpact ?? null,
      milestones: capstoneProject.milestones.map((m) => ({
        id: m.id,
        order: m.order,
        title: m.title,
        traceStage: m.traceStage,
        designReviewGate: m.designReviewGate,
        upstreamMilestoneIds: m.upstreamMilestoneIds,
        attempts: capstone[m.id] ?? [],
      })),
    };
    const blob = new Blob([JSON.stringify(dossier, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `capstone-dossier-${capstoneProject.id}-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-5xl px-5 py-16">
      <p className="font-label text-sm uppercase tracking-widest text-accent">
        Practice &amp; Assessment Studio
      </p>
      <h1 className="mt-2 font-display text-5xl">Prove judgment with real artifacts.</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">
        Completion does not equal mastery. Produce domain-specific lab artifacts with explicit
        rubric criteria, evaluate deterministic trade-off scenarios, and assemble a connected
        6-milestone systems engineering capstone dossier.
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        <Chip active={tab === "labs"} onClick={() => setTab("labs")}>
          Practice Labs ({labs.length})
        </Chip>
        <Chip active={tab === "scenarios"} onClick={() => setTab("scenarios")}>
          Worked Trade-Off Scenarios ({scenarios.length})
        </Chip>
        <Chip active={tab === "capstone"} onClick={() => setTab("capstone")}>
          Cumulative Capstone ({completedMilestones}/{capstoneProject.milestones.length})
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
              <LabCard key={l.id} lab={l} rubric={l.rubric} />
            ))}
          </div>
        </>
      )}

      {tab === "scenarios" && (
        <div className="mt-8 space-y-6">
          {scenarios.map((sc) => (
            <ScenarioCard key={sc.id} scenario={sc} />
          ))}
        </div>
      )}

      {tab === "capstone" && (
        <div className="mt-8 space-y-6">
          <div className="rounded-3xl border border-accent/30 bg-surface p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-label text-xs uppercase tracking-widest text-accent">
                  Connected Systems Engineering Capstone · v{capstoneProject.version}
                </p>
                <h2 className="mt-2 font-display text-3xl text-text">{capstoneProject.title}</h2>
              </div>
              <button
                type="button"
                onClick={exportCapstoneDossier}
                className="rounded-full border border-line bg-bg px-4 py-2 text-xs font-medium text-text hover:border-accent"
              >
                Export Capstone Dossier (JSON) ↓
              </button>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted">{capstoneProject.summary}</p>
            <p className="mt-2 text-xs text-muted">{capstoneProject.disclaimer}</p>

            {/* Visual End-to-End Traceability Chain */}
            <div className="mt-5 grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
              {capstoneProject.milestones.map((m) => {
                const revs = capstone[m.id]?.length ?? 0;
                return (
                  <a
                    key={m.id}
                    href={`#${m.id}`}
                    className={`rounded-2xl border p-2.5 text-xs transition ${
                      revs > 0
                        ? "border-emerald-500/40 bg-emerald-500/5 text-text"
                        : "border-line bg-bg text-muted hover:border-accent"
                    }`}
                  >
                    <p className="font-mono font-semibold text-accent">M{m.order}</p>
                    <p className="mt-0.5 truncate text-[11px]">{m.traceStage}</p>
                    <p className="mt-1 text-[10px]">{revs > 0 ? `Rev ${revs} saved` : "Pending"}</p>
                  </a>
                );
              })}
            </div>
          </div>

          {capstoneProject.milestones.slice(0, 3).map((m) => (
            <CapstoneMilestoneCard
              key={m.id}
              milestone={m}
              allMilestones={capstoneProject.milestones}
            />
          ))}

          <ChangeImpactCard capstoneProject={capstoneProject} />

          {capstoneProject.milestones.slice(3).map((m) => (
            <CapstoneMilestoneCard
              key={m.id}
              milestone={m}
              allMilestones={capstoneProject.milestones}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export const Route = createFileRoute("/labs")({
  loader: async () => {
    const [labsRes, scenRes, capRes] = await Promise.all([
      listLabs({ data: {} }),
      listScenarios({ data: {} }),
      getActiveCapstone(),
    ]);
    return {
      labs: labsRes.labs,
      scenarios: scenRes.scenarios,
      capstone: capRes.capstone,
    };
  },
  head: () =>
    pageHead(
      "Practice Studio — Labs, Scenarios & Capstone",
      "Domain-specific self-assessment labs, deterministic trade-off scenarios, and a connected 6-milestone systems engineering capstone.",
    ),
  component: LabsPage,
});
