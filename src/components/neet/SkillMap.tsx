import { useState } from "react";
import Link from "@/components/neet/AppLink";
import { DISCIPLINES, SKILLS, STAGES, lessonHref, skillById } from "@/lib/neet/content";
import {
  COMPETENCY_MODEL_VERSION,
  competencyById,
  labsForCompetency,
  lessonsForCompetency,
} from "@/lib/neet/competencies";
import { computeAll } from "@/lib/neet/scale";
import { useProgress } from "@/lib/neet/store";
import type { Discipline } from "@/lib/neet/types";
import StageRing from "./StageRing";

const ORDER: Discipline[] = ["thinking", "design", "engineering"];

const TIER_LABEL = {
  none: "Unverified",
  "self-assessed": "Self-assessed",
  "automated-check": "Automated check",
  "rubric-evaluated": "Rubric-evaluated",
  "reviewer-verified": "Reviewer-verified",
} as const;

/** The whole curriculum as an interactive competency map: skills, prerequisites, standards anchors, and evidence state. */
export default function SkillMap({ compact = false }: { compact?: boolean }) {
  const { evidence } = useProgress();
  const progress = computeAll(evidence);
  const byId = new Map(progress.map((p) => [p.skillId, p]));
  const [selectedId, setSelectedId] = useState<string | null>(
    compact ? null : (SKILLS[0]?.id ?? null),
  );

  const lvl = (id: string) => byId.get(id)?.level ?? 0;
  const selectedSkill = selectedId ? skillById(selectedId) : null;
  const selectedComp = selectedId ? competencyById(selectedId) : null;
  const selectedProg = selectedId ? byId.get(selectedId) : null;

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-3">
        {ORDER.map((d) => (
          <section key={d} aria-labelledby={`map-${d}`}>
            <h3
              id={`map-${d}`}
              className="font-label text-sm uppercase tracking-widest text-accent"
            >
              {DISCIPLINES[d].label}
            </h3>
            <ol className="mt-4 space-y-0">
              {SKILLS.filter((s) => s.discipline === d).map((s, i, arr) => {
                const locked = s.prerequisites.some((p) => lvl(p) < 1);
                const comp = competencyById(s.id);
                const prog = byId.get(s.id);
                const isSelected = selectedId === s.id;
                return (
                  <li key={s.id} className="relative flex gap-4 pb-5 last:pb-0">
                    {i < arr.length - 1 && (
                      <span
                        aria-hidden
                        className="absolute left-7 top-14 h-[calc(100%-3rem)] w-px bg-line"
                      />
                    )}
                    <StageRing
                      level={lvl(s.id) as 0}
                      size={56}
                      locked={locked && lvl(s.id) === 0}
                    />
                    <button
                      type="button"
                      onClick={() => setSelectedId(isSelected ? null : s.id)}
                      aria-expanded={isSelected}
                      className={`flex-1 rounded-2xl p-2.5 text-left transition ${
                        isSelected ? "bg-surface-2 ring-1 ring-accent" : "hover:bg-surface-2/70"
                      }`}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        {comp && (
                          <span className="font-mono text-[11px] font-medium text-accent">
                            {comp.code}
                          </span>
                        )}
                        <span className="text-[11px] text-muted">
                          {prog && prog.level > 0
                            ? `L${prog.level} · ${STAGES[prog.level - 1]!.label}`
                            : "L0 · Not yet assessed"}
                        </span>
                      </div>
                      <p
                        className={`mt-0.5 font-display text-lg ${locked && lvl(s.id) === 0 ? "text-muted" : "text-text"}`}
                      >
                        {s.title}
                      </p>
                      {!compact && <p className="text-sm text-muted">{s.blurb}</p>}
                      {s.prerequisites.length > 0 && (
                        <p className="mt-1 font-label text-xs text-muted">
                          {locked && lvl(s.id) === 0 ? "Locked · needs " : "Builds on "}
                          {s.prerequisites.map((p) => skillById(p)?.title).join(", ")}
                        </p>
                      )}
                    </button>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>

      {selectedSkill && selectedComp && selectedProg && (
        <section
          aria-label="Competency specification"
          className="rounded-3xl border border-line bg-surface p-6 sm:p-8"
        >
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-5">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full bg-ink px-2.5 py-0.5 font-mono font-semibold text-bg">
                  {selectedComp.code}
                </span>
                <span className="font-label uppercase tracking-wider text-accent">
                  {DISCIPLINES[selectedSkill.discipline].label}
                </span>
                <span className="text-muted">·</span>
                <span className="text-muted capitalize">
                  Target Bloom: {selectedComp.bloomTarget}
                </span>
                <span className="text-muted">·</span>
                <span className="text-muted">Model v{COMPETENCY_MODEL_VERSION}</span>
              </div>
              <h3 className="mt-2 font-display text-2xl sm:text-3xl text-text">
                {selectedSkill.title}
              </h3>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
                {selectedComp.definition}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="rounded-full border border-line px-3 py-1 text-xs text-muted hover:text-text"
            >
              Close
            </button>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-bg p-4">
              <p className="text-[11px] uppercase tracking-wider text-muted">Evidence Quality</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {selectedProg.evidenceCount > 0
                  ? `${Math.round(selectedProg.quality * 100)}%`
                  : "—"}
              </p>
              <p className="mt-0.5 text-xs text-muted">
                {selectedProg.evidenceCount} item{selectedProg.evidenceCount === 1 ? "" : "s"}{" "}
                logged
              </p>
            </div>
            <div className="rounded-2xl bg-bg p-4">
              <p className="text-[11px] uppercase tracking-wider text-muted">Evidence Coverage</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {Math.round(selectedProg.coverage * 100)}%
              </p>
              <p className="mt-0.5 text-xs text-muted">Toward target weight (6.0)</p>
            </div>
            <div className="rounded-2xl bg-bg p-4">
              <p className="text-[11px] uppercase tracking-wider text-muted">Freshness</p>
              <p className="mt-1 text-xl font-semibold capitalize">
                {selectedProg.freshness.replace(/-/g, " ")}
              </p>
              <p className="mt-0.5 text-xs text-muted">
                Mastery index: {Math.round(selectedProg.mastery * 100)}%
              </p>
            </div>
            <div className="rounded-2xl bg-bg p-4">
              <p className="text-[11px] uppercase tracking-wider text-muted">Verification Tier</p>
              <p className="mt-1 text-xl font-semibold">
                {TIER_LABEL[selectedProg.verificationTier]}
              </p>
              <p className="mt-0.5 text-xs text-muted">
                {selectedProg.gate ?? "Top level reached"}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div>
              <h4 className="font-label text-xs uppercase tracking-widest text-accent">
                Observable Proficiency Descriptors (L1–L4)
              </h4>
              <ol className="mt-3 space-y-2.5 text-sm">
                {selectedComp.levelDescriptors.map((desc) => {
                  const reached = selectedProg.level >= desc.level;
                  const isNext = selectedProg.level + 1 === desc.level;
                  return (
                    <li
                      key={desc.level}
                      className={`rounded-2xl border p-3 ${
                        reached
                          ? "border-emerald-500/30 bg-emerald-500/5"
                          : isNext
                            ? "border-accent/40 bg-bg"
                            : "border-line bg-bg/50"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="font-mono">
                          L{desc.level} · {desc.stage}
                        </span>
                        <span
                          className={
                            reached
                              ? "text-emerald-600 dark:text-emerald-400"
                              : isNext
                                ? "text-accent"
                                : "text-muted"
                          }
                        >
                          {reached ? "Demonstrated" : isNext ? "Next target" : "Upcoming"}
                        </span>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-muted">
                        {desc.observableOutcome}
                      </p>
                      <p className="mt-1 font-mono text-[10px] text-muted">
                        Evidence: {desc.requiredEvidence.join(", ")}
                      </p>
                    </li>
                  );
                })}
              </ol>
            </div>

            <div className="space-y-5">
              <div>
                <h4 className="font-label text-xs uppercase tracking-widest text-accent">
                  Authoritative Standards Anchors
                </h4>
                <ul className="mt-2.5 space-y-2 text-sm">
                  {selectedComp.frameworkAnchors.map((st) => (
                    <li key={`${st.framework}-${st.reference}`} className="rounded-xl bg-bg p-3">
                      <span className="font-medium text-text">{st.framework}</span>
                      <span className="text-muted"> — {st.reference}</span>
                      <p className="mt-0.5 text-xs text-muted">{st.note}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-label text-xs uppercase tracking-widest text-accent">
                  Mapped Learning &amp; Evidence
                </h4>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {lessonsForCompetency(selectedSkill.id).map((l) => (
                    <Link
                      key={l.key}
                      href={lessonHref(l.pathSlug, l.lessonSlug)}
                      className="rounded-lg border border-line bg-bg px-3 py-1.5 text-xs hover:border-accent hover:text-accent"
                    >
                      Lesson: {l.lessonTitle}
                    </Link>
                  ))}
                  {labsForCompetency(selectedSkill.id).map((lab) => (
                    <Link
                      key={lab.id}
                      href={`/labs#${lab.id}`}
                      className="rounded-lg border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent hover:text-bg"
                    >
                      Lab: {lab.title}
                    </Link>
                  ))}
                  {selectedComp.mappedVolumes.map((slug) => (
                    <Link
                      key={slug}
                      href={`/library/${slug}`}
                      className="rounded-lg bg-surface-2 px-3 py-1.5 text-xs text-muted hover:text-text"
                    >
                      Volume: {slug.slice(0, 32)}…
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
