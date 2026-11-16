import { useEffect, useSyncExternalStore } from "react";

const SIZES = ["md", "lg", "xl"] as const;
type Size = (typeof SIZES)[number];
const KEY = "neet.text";
const listeners = new Set<() => void>();

function readSize(): Size {
  const v = window.localStorage.getItem(KEY) as Size | null;
  return v && SIZES.includes(v) ? v : "md";
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function applySize(s: Size) {
  document.documentElement.dataset["text"] = s;
}

function saveSize(s: Size) {
  window.localStorage.setItem(KEY, s);
  applySize(s);
  listeners.forEach((l) => l());
}

export default function TextSizeToggle() {
  const size = useSyncExternalStore(subscribe, readSize, () => "md" as Size);

  useEffect(() => {
    applySize(size);
  }, [size]);

  return (
    <div
      role="group"
      aria-label="Text size"
      className="flex items-center rounded-md border border-line"
    >
      {SIZES.map((s, i) => (
        <button
          key={s}
          type="button"
          onClick={() => saveSize(s)}
          aria-pressed={size === s}
          aria-label={`Text size ${s === "md" ? "normal" : s === "lg" ? "large" : "extra large"}`}
          className={`px-2.5 py-1 font-label ${size === s ? "bg-accent text-bg" : "text-muted hover:text-text"} ${i === 0 ? "rounded-l-md" : ""} ${i === 2 ? "rounded-r-md" : ""}`}
          style={{ fontSize: `${0.8 + i * 0.15}rem` }}
        >
          A
        </button>
      ))}
    </div>
  );
}
