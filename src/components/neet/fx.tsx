import { useRef, type ReactNode, type MouseEvent } from "react";

/** Word-by-word blur-in headline. */
export function BlurText({
  text,
  className = "",
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  return (
    <span className={className} aria-label={text}>
      {text.split(" ").map((w, i) => (
        <span
          key={i}
          aria-hidden
          className="blur-word"
          style={{ animationDelay: `${delay + i * 70}ms` }}
        >
          {w}&nbsp;
        </span>
      ))}
    </span>
  );
}

/** Card with a subtle mint hover spotlight for the NEET dark theme. */
export function SpotlightCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--x", `${e.clientX - r.left}px`);
    el.style.setProperty("--y", `${e.clientY - r.top}px`);
  };
  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      className={`group relative overflow-hidden rounded-lg border border-line bg-surface-2 transition duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-[var(--shadow-lift)] ${className}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(360px circle at var(--x) var(--y), rgba(184, 230, 183, 0.08), transparent 60%)",
        }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
}
