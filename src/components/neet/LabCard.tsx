import { useMemo, useState } from "react";
import { skillById } from "@/lib/neet/content";
import { competencyById } from "@/lib/neet/competencies";
import { evaluateRubric, getRubricForLab, type RubricDefinition } from "@/lib/neet/rubrics";
import { actions, useProgress } from "@/lib/neet/store";
import type { Lab } from "@/lib/neet/types";

const TYPE_LABEL = { lab: "Lab", variant: "Variant problem", artifact: "Artifact" } as const;

function isValidOptionalUrl(raw: string): boolean {
  const trimmed = raw.trim();
  if (!trimmed) return true;
  return /^https?:\/\/\S+/i.test(trimmed) || trimmed.startsWith("/");
}

export default function LabCard({
  lab,
  rubric: providedRubric,
}: {
  lab: Lab;
  rubric?: RubricDefinition;
}) {
  const { labs, labAttempts } = useProgress();
  const sub = labs[lab.id];
  const attempts = labAttempts[lab.id] ?? [];
  const latestAttempt = attempts[attempts.length - 1];
  const rubric = useMemo(() => providedRubric ?? getRubricForLab(lab.id), [lab.id, providedRubric]);

  const [note, setNote] = useState("");
  const [twistResponse, setTwistResponse] = useState("");
  const [feedbackResponse, setFeedbackResponse] = useState("");
  const [artifactUrl, setArtifactUrl] = useState("");
  const [scores, setScores] = useState<Record<string, number>>({});
  const [editing, setEditing] = useState(false);

  const skill = skillById(lab.skillId);
  const comp = competencyById(lab.skillId);
  const showForm = !sub || editing;
  const isRevising = attempts.length > 0 && editing;

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
    setFeedbackResponse("");
    setArtifactUrl(latestAttempt?.artifactUrl ?? sub?.artifactUrl ?? "");
    setScores(latestAttempt?.rubricScores ?? {});
    setEditing(true);
  };

  return (
    <article id={lab.id} className="scroll-mt-24 rounded-lg border border-line bg-surface-2 p-6">
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-semibold uppercase tracking-wider">
        <span className="text-accent">{TYPE_LABEL[lab.evidenceType]}</span>
        {comp && (
          <>
            <span aria-hidden className="text-muted">
              ·
            </span>
            <span className="font-mono text-text">{comp.code}</span>
          </>
        )}
        {skill?.title && (
          <>
            <span aria-hidden className="text-muted">
              ·
            </span>
            <span className="text-muted">{skill.title}</span>
          </>
        )}
        <span aria-hidden className="text-muted">
          ·
        </span>
        <span className="font-mono text-muted">~{lab.minutes} min</span>
        {latestAttempt ? (
          <span className="ml-auto font-mono text-xs font-medium text-warn">
            Self-assessed ({rubric.id}) · {Math.round(latestAttempt.weightedScore * 100)}% (
            {attempts.length} rev{attempts.length === 1 ? "" : "s"})
          </span>
        ) : sub ? (
          <span className="ml-auto text-ok">Submitted (self-assessed)</span>
        ) : null}
      </div>

      <h2 className="mt-3 font-display text-2xl font-bold text-text">{lab.title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">{lab.brief}</p>

      <ol className="mt-4 list-decimal space-y-1.5 pl-6 text-sm marker:font-mono marker:text-accent">
        {lab.steps.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>

      <div className="mt-4 rounded-md border border-accent/35 bg-surface-1 p-4 text-sm">
        <span className="text-xs font-semibold uppercase tracking-wider text-accent">
          Constraint twist ·{" "}
        </span>
        <span className="text-text">{lab.twist}</span>
      </div>

      <div className="mt-5 border-t border-line pt-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
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
                className="mt-1 w-full rounded-md border border-line bg-bg px-3 py-2 text-sm text-text placeholder:text-muted focus:border-accent focus:outline-none"
              />
              {!urlValid && (
                <p className="mt-1 text-xs text-magenta">
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
                className="mt-1 w-full rounded-md border border-line bg-bg p-3 text-sm text-text placeholder:text-muted focus:border-accent focus:outline-none"
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
                className="mt-1 w-full rounded-md border border-line bg-bg p-3 text-sm text-text placeholder:text-muted focus:border-accent focus:outline-none"
              />
            </div>

            {isRevising && (
              <div>
                <label
                  htmlFor={`${lab.id}-feedback`}
                  className="block text-xs font-medium text-accent"
                >
                  What changed in Revision #{attempts.length + 1} (response to prior rubric hints)
                </label>
                <textarea
                  id={`${lab.id}-feedback`}
                  value={feedbackResponse}
                  onChange={(e) => setFeedbackResponse(e.target.value)}
                  rows={2}
                  placeholder="Describe specifically what you corrected or strengthened since the previous attempt…"
                  className="mt-1 w-full rounded-md border border-accent/40 bg-bg p-3 text-sm text-text placeholder:text-muted focus:border-accent focus:outline-none"
                />
              </div>
            )}

            <div className="rounded-lg border border-line bg-surface-1 p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <p className="font-label text-xs uppercase tracking-widest text-accent">
                    Self-Assessment Rubric · {rubric.id} (v{rubric.version} · target ≥{" "}
                    {Math.round(rubric.passThreshold * 100)}%)
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted">
                    Structured self-check against domain criteria. Recorded honestly as{" "}
                    <strong>self-assessed (provisional)</strong> until independently reviewed.
                  </p>
                </div>
                {preview && (
                  <span
                    className={`text-xs font-semibold ${
                      preview.passedThreshold
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    Score: {Math.round(preview.weightedScore * 100)}% (
                    {preview.passedThreshold ? "Meets provisional bar" : "Needs revision"})
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
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="text-sm font-medium text-text">
                          {c.label}{" "}
                          <span className="text-xs font-normal text-muted">
                            (weight {Math.round(c.weight * 100)}%)
                          </span>
                        </p>
                        <span className="text-[11px] text-muted">
                          Evidence: {c.evidenceRequired}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-muted">
                        Why it matters: {c.rationale} · Watch out for:{" "}
                        {c.typicalFailureModes.join("; ")}
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
                Logged as <strong className="text-text">self-assessed</strong> rubric evidence
                (status: submitted, provisional) toward{" "}
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
                      ...(feedbackResponse.trim()
                        ? { feedbackResponse: feedbackResponse.trim() }
                        : {}),
                      ...(artifactUrl.trim() ? { artifactUrl: artifactUrl.trim() } : {}),
                      criterionScores: scores,
                    });
                    setEditing(false);
                    setNote("");
                    setTwistResponse("");
                    setFeedbackResponse("");
                    setArtifactUrl("");
                  }}
                  className="btn-ink text-sm disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Save self-assessed lab artifact
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
                  Rubric feedback ({Math.round(latestAttempt.weightedScore * 100)}% · provisional)
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
                  ? `Verification: Self-assessed (submitted) · ${latestAttempt.rubricId} · Rev ${attempts.length} · ${new Date(latestAttempt.at).toLocaleDateString()}`
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
