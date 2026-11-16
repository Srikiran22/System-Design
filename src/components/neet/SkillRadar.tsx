import { DISCIPLINES } from "@/lib/neet/content";
import type { Discipline } from "@/lib/neet/types";

const ORDER: Discipline[] = ["thinking", "design", "engineering"];

/** Three-axis radar of discipline scores (0..100). */
export default function SkillRadar({ scores }: { scores: Record<Discipline, number> }) {
  const cx = 150;
  const cy = 150;
  const R = 100;
  const pt = (i: number, v: number) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 3;
    return [cx + Math.cos(a) * R * v, cy + Math.sin(a) * R * v] as const;
  };
  const poly = (v: number[]) => v.map((x, i) => pt(i, x).join(",")).join(" ");
  const vals = ORDER.map((d) => Math.max(0.02, scores[d] / 100));
  const label = ORDER.map(
    (d) => `${DISCIPLINES[d].label} ${Math.round(scores[d])} out of 100`,
  ).join(", ");

  return (
    <svg
      viewBox="0 0 300 300"
      role="img"
      aria-label={`Discipline radar: ${label}`}
      className="mx-auto w-full max-w-xs"
    >
      {[0.25, 0.5, 0.75, 1].map((g) => (
        <polygon
          key={g}
          points={poly([g, g, g])}
          fill="none"
          stroke="var(--line)"
          strokeWidth="1"
        />
      ))}
      {ORDER.map((_, i) => {
        const [x, y] = pt(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--line)" />;
      })}
      <polygon
        points={poly(vals)}
        fill="var(--accent)"
        fillOpacity="0.25"
        stroke="var(--accent)"
        strokeWidth="2"
      />
      {vals.map((v, i) => {
        const [x, y] = pt(i, v);
        return <circle key={i} cx={x} cy={y} r="4" fill="var(--accent)" />;
      })}
      {ORDER.map((d, i) => {
        const [x, y] = pt(i, 1.2);
        return (
          <text
            key={d}
            x={x}
            y={y}
            textAnchor="middle"
            fontSize="11"
            fill="var(--foreground)"
            fontFamily="ui-monospace, monospace"
          >
            {DISCIPLINES[d].label}
          </text>
        );
      })}
    </svg>
  );
}
