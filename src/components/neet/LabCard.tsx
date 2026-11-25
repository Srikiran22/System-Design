import { useMemo, useState } from "react";
import { skillById } from "@/lib/neet/content";
import { competencyById } from "@/lib/neet/competencies";
import { evaluateRubric, getRubricForLab } from "@/lib/neet/rubrics";
import { actions, useProgress } from "@/lib/neet/store";
import type { Lab } from "@/lib/neet/types";

const TYPE_LABEL = { lab: "Lab", variant: "Variant problem", artifact: "Artifact" } as const;

function isValidOptionalUrl(raw: string): boolean {
  const trimmed = raw.trim();
  if (!trimmed) return true;
  return /^https?:\/\/\S+/i.test(trimmed) || trimmed.startsWith("/");
}

export default function LabCard({ lab }: { lab: Lab }) {
  const { labs, labAttempts } = useProgress();
  const sub = labs[lab.id];
  const attempts = labAttempts[lab.id] ?? [];
  const latestAttempt = attempts[attempts.length - 1];
  const rubric = useMemo(() => getRubricForLab(lab.id), [lab.id]);

  const [note, setNote] = useState("");
  const [twistResponse, setTwistResponse] = useState("");
  const [artifactUrl, setArtifactUrl] = useState("");
  const [scores, setScores] = useState<Record<string, number>>({});
  const [editing, setEditing] = useState(false);

  const skill = skillById(lab.skillId);
  const comp = competencyById(lab.skillId);
  const showForm = !sub || editing;

  const allCriteriaScored = rubric.criteria.every((c) => typeof scores[c.id] === "number");
  const preview = useMemo(
    () => (allCriteriaScored ? evaluateRubric(rubric, scores) : null),
    [allCriteriaScored, rubric, scores],
  );
  const urlValid = isValidOptionalUrl(artifactUrl);
  const canSubmit = note.trim().length >= 30 && allCriteriaScored && urlValid;

  const startRevision = () => {
    setNote(latestAttempt?.note ?? sub?.note ?? "");
    setTwistResponse(latestAttempt?.twistResponse ?? "");
    setArtifactUrl(latestAttempt?.artifactUrl ?? sub?.artifactUrl ?? "");
    setScores(latestAttempt?.rubricScores ?? {});
    setEditing(true);
  };

  return (
    <article id={lab.id} className="scroll-mt-24 rounded-3xl border border-line bg-surface p-6">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-label text-xs uppercase tracking-widest">
        <span className="text-accent">{TYPE_LABEL[lab.evidenceType]}</span>
        {comp && <span className="font-mono text-text">{comp.code}</span>}
        <span className="text-muted">{skill?.title}</span>
        <span className="text-muted">~{lab.minutes} min</span>
        {latestAttempt ? (
          <span className="ml-auto rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            Rubric v{latestAttempt.rubricVersion} · {Math.round(latestAttempt.weightedScore * 100)}%
            ({attempts.length} rev{attempts.length === 1 ? "" : "s"})
          </span>
        ) : sub ? (
          <span className="ml-auto text-ok">Submitted (self-rated)</span>
        ) : null}
      </div>

      <h2 className="mt-3 font-display text-2xl text-text">{lab.title}</h2>
      <p className="mt-2 text-muted">{lab.brief}</p>

      <ol className="mt-4 list-decimal space-y-1.5 pl-6 text-sm marker:font-label marker:text-accent">
        {lab.steps.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>

      <div className="mt-4 rounded-2xl border border-accent/25 bg-surface-2 p-4 text-sm">
        <span className="font-label text-xs uppercase tracking-widest text-accent">
          Constraint twist ·{" "}
        </span>
        <span className="text-text">{lab.twist}</span>
      </div>

      <div className="mt-5 border-t border-line pt-5">
        <p className="font-label text-xs uppercase tracking-widest text-muted">
          Required engineering artifact
        </p>
        <p className="mt-1 text-sm text-text">{lab.artifact}</p>

        {showForm ? (
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor={`${lab.id}-url`} className="block text-xs font-medium text-muted">
                Artifact link (optional — GitHub PR, diagram, ADR, or design doc URL)
              </label>
              <input
                id={`${lab.id}-url`}
                type="url"
                value={artifactUrl}
                onChange={(e) => setArtifactUrl(e.target.value)}
                placeholder="https://github.com/your-org/system-adr or /local/reference"
                className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2 text-sm text-text placeholder:text-muted"
              />
              {!urlValid && (
                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                  Enter a valid http(s):// URL or leave blank.
                </p>
              )}
            </div>

            <div>
              <label htmlFor={`${lab.id}-note`} className="block text-xs font-medium text-muted">
                Engineering artifact summary &amp; evidence (min 30 characters)
              </label>
              <textarea
                id={`${lab.id}-note`}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                placeholder="Summarize your architecture, quantitative assumptions, failure modes, and key trade-offs…"
                className="mt-1 w-full rounded-xl border border-line bg-bg p-3 text-sm text-text placeholder:text-muted"
              />
            </div>

            <div>
              <label htmlFor={`${lab.id}-twist`} className="block text-xs font-medium text-muted">
                How your design adapts to the constraint twist (recommended)
              </label>
              <textarea
                id={`${lab.id}-twist`}
                value={twistResponse}
                onChange={(e) => setTwistResponse(e.target.value)}
                rows={2}
                placeholder="Explain what changes and what breaks when the twist constraint hits…"
                className="mt-1 w-full rounded-xl border border-line bg-bg p-3 text-sm text-text placeholder:text-muted"
              />
            </div>

            <div className="rounded-2xl border border-line bg-bg/70 p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-label text-xs uppercase tracking-widest text-accent">
                  Rubric evaluation (v{rubric.version} · pass ≥{" "}
                  {Math.round(rubric.passThreshold * 100)}%)
                </p>
                {preview && (
                  <span
                    className={`text-xs font-semibold ${
                      preview.passedThreshold
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    Score: {Math.round(preview.weightedScore * 100)}% (
                    {preview.passedThreshold ? "Meets bar" : "Needs revision"})
                  </span>
                )}
              </div>

              <div className="mt-3 space-y-4">
                {rubric.criteria.map((c) => {
                  const chosen = scores[c.id];
                  return (
                    <div
                      key={c.id}
                      className="border-t border-line/60 pt-3 first:border-t-0 first:pt-0"
                    >
                      <p className="text-sm font-medium text-text">
                        {c.label}{" "}
                        <span className="text-xs font-normal text-muted">
                          (weight {Math.round(c.weight * 100)}%)
                        </span>
                      </p>
                      <div className="mt-2 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-4">
                        {([1, 2, 3, 4] as const).map((lvl) => (
                          <button
                            key={lvl}
                            type="button"
                            aria-pressed={chosen === lvl}
                            onClick={() => setScores((prev) => ({ ...prev, [c.id]: lvl }))}
                            className={`rounded-xl border p-2 text-left text-xs transition ${
                              chosen === lvl
                                ? "border-accent bg-accent/15 text-text"
                                : "border-line bg-surface text-muted hover:text-text"
                            }`}
                          >
                            <span className="font-mono font-semibold">{lvl}/4</span>
                            <span className="mt-0.5 block leading-snug">{c.descriptors[lvl]}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-muted">
                Recorded as <strong className="text-text">rubric-evaluated</strong> evidence toward{" "}
                {lab.evidenceType === "artifact" ? "Proceed (L4)" : "Adapt (L3)"}.
              </p>
              <div className="flex items-center gap-2">
                {editing && (
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="rounded-full border border-line px-4 py-2 text-xs text-muted hover:text-text"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="button"
                  disabled={!canSubmit}
                  onClick={() => {
                    actions.submitLabRubric(lab, {
                      note: note.trim(),
                      ...(twistResponse.trim() ? { twistResponse: twistResponse.trim() } : {}),
                      ...(artifactUrl.trim() ? { artifactUrl: artifactUrl.trim() } : {}),
                      criterionScores: scores,
                    });
                    setEditing(false);
                    setNote("");
                    setTwistResponse("");
                    setArtifactUrl("");
                  }}
                  className="btn-ink text-sm disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Submit rubric-evaluated evidence
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-3 space-y-3 rounded-2xl bg-surface-2 p-4">
            {latestAttempt?.artifactUrl && (
              <p className="text-xs">
                <span className="text-muted">Artifact URL: </span>
                <a
                  href={latestAttempt.artifactUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-accent hover:underline"
                >
                  {latestAttempt.artifactUrl} ↗
                </a>
              </p>
            )}
            <p className="whitespace-pre-wrap break-words text-sm text-text">{sub.note}</p>

            {latestAttempt && latestAttempt.feedbackSummary.length > 0 && (
              <div className="rounded-xl border border-line bg-bg/70 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-accent">
                  Rubric feedback ({Math.round(latestAttempt.weightedScore * 100)}%)
                </p>
                <ul className="mt-1.5 list-disc space-y-1 pl-4 text-xs text-muted">
                  {latestAttempt.feedbackSummary.map((fb) => (
                    <li key={fb}>{fb}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 font-label text-xs text-muted">
              <span>
                {latestAttempt
                  ? `Verification: Rubric-evaluated · Revision ${attempts.length} · ${new Date(latestAttempt.at).toLocaleDateString()}`
                  : `Verification: Self-assessed · Rating: ${["", "Shaky", "OK", "Solid"][sub.rating]}`}
              </span>
              <button
                type="button"
                onClick={startRevision}
                className="text-accent underline underline-offset-4"
              >
                Revise &amp; resubmit
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
