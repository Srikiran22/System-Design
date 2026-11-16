export default function Callout({
  title,
  children,
  tone = "note",
}: {
  title: string;
  children: React.ReactNode;
  tone?: "note" | "warn" | undefined;
}) {
  const color = tone === "warn" ? "border-warn text-warn" : "border-accent text-accent";
  return (
    <aside className={`my-6 rounded-lg border-l-4 bg-surface p-5 ${color.split(" ")[0]}`}>
      <p className={`font-label text-sm uppercase tracking-widest ${color.split(" ")[1]}`}>
        {title}
      </p>
      <p className="mt-2 text-text">{children}</p>
    </aside>
  );
}
