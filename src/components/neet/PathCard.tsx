import Link from "@/components/neet/AppLink";
import { DISCIPLINES, pathMinutes } from "@/lib/neet/content";
import { pathProgress } from "@/lib/neet/derive";
import { useProgress } from "@/lib/neet/store";
import type { Path } from "@/lib/neet/types";
import ProgressBar from "./ProgressBar";

export default function PathCard({ path }: { path: Path }) {
  const { completed } = useProgress();
  const p = pathProgress(path, completed);
  const hours = Math.max(1, Math.round(pathMinutes(path) / 60));
  const pct = Math.round(p.ratio * 100);

  return (
    <Link href={`/paths/${path.slug}`} className="folder-card group mt-2 flex flex-col p-6 pt-7">
      <span className="folder-tab">{DISCIPLINES[path.discipline].label}</span>

      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-xl font-bold leading-snug text-text transition-colors group-hover:text-accent">
          {path.title}
        </h3>
        <span
          aria-hidden
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-line bg-surface-1 text-sm text-muted transition-colors group-hover:border-accent group-hover:bg-accent group-hover:text-bg"
        >
          ↗
        </span>
      </div>

      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{path.tagline}</p>

      <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
        <span>{path.level}</span>
        <span aria-hidden>·</span>
        <span>{p.total} lessons</span>
        <span aria-hidden>·</span>
        <span>~{hours}h</span>
      </div>

      <div className="mt-4 flex items-center gap-3 border-t border-line pt-4">
        <ProgressBar value={p.ratio} label={`${path.title} progress`} className="flex-1" />
        <span className="font-mono text-xs tabular-nums text-muted">
          {pct}% ({p.done}/{p.total})
        </span>
      </div>
    </Link>
  );
}
