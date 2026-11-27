import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <header className="max-w-3xl">
      <p className="section-label text-accent">{eyebrow}</p>
      <h1 className="section-title text-4xl text-text md:text-5xl">{title}</h1>
      {children && (
        <div className="mt-4 text-base leading-relaxed text-muted sm:text-lg">{children}</div>
      )}
    </header>
  );
}

export function SearchField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <label className="relative block w-full">
      <span className="sr-only">{placeholder}</span>
      <svg
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-line bg-surface-2 py-2.5 pl-10 pr-4 text-sm text-text outline-none transition placeholder:text-muted focus:border-accent"
      />
    </label>
  );
}

export function Chip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`shrink-0 whitespace-nowrap rounded-md border px-3.5 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "border-accent bg-accent font-semibold text-bg"
          : "border-line bg-surface-2 text-muted hover:border-accent hover:text-text"
      }`}
    >
      {children}
    </button>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  if (!children) return null;
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</dt>
      <dd className="mt-1 text-sm leading-6 text-text">{children}</dd>
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg border border-line bg-surface-2 p-10 text-center text-sm text-muted">
      {children}
    </p>
  );
}

export function LoadError({ error }: { error: unknown }) {
  return (
    <div role="alert" className="mx-auto max-w-xl px-5 py-24 text-center">
      <h1 className="font-display text-3xl font-bold text-text">Couldn&apos;t load this page</h1>
      <p className="mt-3 text-sm text-muted">
        {error instanceof Error ? error.message : "Please try again."}
      </p>
    </div>
  );
}
