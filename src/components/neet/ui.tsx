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
      <p className="text-sm font-medium text-accent">{eyebrow}</p>
      <h1 className="mt-1 text-4xl font-semibold leading-tight md:text-5xl">{title}</h1>
      {children && <div className="mt-4 text-lg leading-8 text-muted">{children}</div>}
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
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
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
        className="w-full rounded-full border border-line bg-surface py-3 pl-11 pr-4 text-text outline-none transition placeholder:text-muted focus:border-accent focus:bg-bg"
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
      className={`shrink-0 rounded-full px-4 py-1.5 text-sm transition ${active ? "bg-ink text-bg" : "bg-surface-2 text-text hover:bg-line"}`}
    >
      {children}
    </button>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  if (!children) return null;
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-0.5 text-sm leading-6 text-text">{children}</dd>
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-3xl bg-surface p-10 text-center text-muted">{children}</p>;
}

export function LoadError({ error }: { error: unknown }) {
  return (
    <div role="alert" className="mx-auto max-w-xl px-5 py-24 text-center">
      <h1 className="text-3xl font-semibold">Couldn&apos;t load this page</h1>
      <p className="mt-3 text-muted">
        {error instanceof Error ? error.message : "Please try again."}
      </p>
    </div>
  );
}
