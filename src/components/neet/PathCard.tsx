import Link from "@/components/neet/AppLink";
import { DISCIPLINES, pathMinutes } from "@/lib/neet/content";
import { pathProgress } from "@/lib/neet/derive";
import { useProgress } from "@/lib/neet/store";
import type { Path } from "@/lib/neet/types";
import ProgressBar from "./ProgressBar";
import { SpotlightCard } from "./fx";

export default function PathCard({ path }: { path: Path }) {
  const { completed } = useProgress();
  const p = pathProgress(path, completed);
  const hours = Math.max(1, Math.round(pathMinutes(path) / 60));
  return (
    <SpotlightCard className="h-full">
      <Link href={`/paths/${path.slug}`} className="flex h-full flex-col p-7">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-bg px-3 py-1 text-xs font-medium text-text shadow-[var(--shadow-soft)]">
            {DISCIPLINES[path.discipline].label}
          </span>
          <span className="grid h-9 w-9 place-items-center rounded-full bg-bg text-text shadow-[var(--shadow-soft)] transition group-hover:bg-ink group-hover:text-bg">
            ↗
          </span>
        </div>
        <h3 className="mt-8 text-2xl font-semibold leading-snug text-text">{path.title}</h3>
        <p className="mt-2 flex-1 text-muted">{path.tagline}</p>
        <div className="mt-6 flex flex-wrap gap-2 text-xs text-muted">
          <span className="rounded-full bg-surface-2 px-2.5 py-1">{path.level}</span>
          <span className="rounded-full bg-surface-2 px-2.5 py-1">{p.total} lessons</span>
          <span className="rounded-full bg-surface-2 px-2.5 py-1">~{hours}h</span>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <ProgressBar value={p.ratio} label={`${path.title} progress`} className="flex-1" />
          <span className="text-xs tabular-nums text-muted">
            {p.done}/{p.total}
          </span>
        </div>
      </Link>
    </SpotlightCard>
  );
}
