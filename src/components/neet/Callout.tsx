export default function Callout({
  title,
  children,
  tone = "note",
}: {
  title: string;
  children: React.ReactNode;
  tone?: "note" | "warn" | undefined;
}) {
  const borderColor = tone === "warn" ? "border-warn/50" : "border-line";
  const labelColor = tone === "warn" ? "text-warn" : "text-accent";
  return (
    <aside className={`my-6 rounded-lg border bg-surface-2 p-5 ${borderColor}`}>
      <p className={`section-label mb-1 ${labelColor}`}>{title}</p>
      <p className="text-sm leading-relaxed text-text">{children}</p>
    </aside>
  );
}
