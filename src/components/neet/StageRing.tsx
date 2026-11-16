import type { Level } from "@/lib/neet/types";

const NAMES = ["Search", "Know", "Adapt", "Proceed"];

/** Four-segment ring. Level 0..4 fills segments clockwise from the top. */
export default function StageRing({
  level,
  size = 56,
  locked = false,
}: {
  level: Level;
  size?: number;
  locked?: boolean;
}) {
  const r = 20;
  const c = 2 * Math.PI * r;
  const gap = 4;
  const seg = c / 4 - gap;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role="img"
      aria-label={
        locked ? "Locked" : level === 0 ? "Unseen" : `Level ${level}: ${NAMES[level - 1]}`
      }
    >
      {[0, 1, 2, 3].map((i) => (
        <circle
          key={i}
          cx="24"
          cy="24"
          r={r}
          fill="none"
          strokeWidth="4"
          strokeLinecap="butt"
          stroke={locked ? "var(--line)" : i < level ? "var(--accent)" : "var(--line)"}
          strokeDasharray={`${seg} ${c - seg}`}
          strokeDashoffset={-(i * (c / 4) + gap / 2)}
          transform="rotate(-90 24 24)"
          strokeOpacity={locked ? 0.5 : 1}
        />
      ))}
      <text
        x="24"
        y="28.5"
        textAnchor="middle"
        fontSize="12"
        fontFamily="ui-monospace, monospace"
        fill={
          locked ? "var(--muted-foreground)" : level ? "var(--accent)" : "var(--muted-foreground)"
        }
      >
        {locked ? "🔒" : level}
      </text>
    </svg>
  );
}
