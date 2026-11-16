const WORDS = ["Search", "Know", "Adapt", "Proceed"];

/** The one motto lockup. "Search. Know. Adapt. Proceed." */
export default function Motto({
  stack = false,
  className = "",
}: {
  stack?: boolean;
  className?: string;
}) {
  return (
    <p
      aria-label="Search. Know. Adapt. Proceed."
      className={`font-label uppercase tracking-[0.18em] text-accent ${stack ? "flex flex-col gap-1" : "flex flex-wrap gap-x-3"} ${className}`}
    >
      {WORDS.map((w) => (
        <span key={w} aria-hidden>
          {w}.
        </span>
      ))}
    </p>
  );
}
