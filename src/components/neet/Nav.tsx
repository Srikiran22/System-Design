import Link from "@/components/neet/AppLink";
import { useLocation } from "@tanstack/react-router";
import { useState } from "react";
import TextSizeToggle from "./TextSizeToggle";
import ProfileMenu from "./ProfileCard";
import { useSession } from "@/hooks/use-session";

const LINKS = [
  { href: "/library", label: "Library" },
  { href: "/paths", label: "Paths" },
  { href: "/sources", label: "Sources" },
  { href: "/coverage", label: "Coverage" },
  { href: "/exercises", label: "Exercises" },
  { href: "/careers", label: "Careers" },
  { href: "/me", label: "Progress" },
];

export default function Nav() {
  const pathname = useLocation({ select: (l) => l.pathname });
  const [open, setOpen] = useState(false);
  const { user, ready } = useSession();
  const openPalette = () => window.dispatchEvent(new Event("neet:palette"));

  return (
    <header className="sticky top-0 z-40 border-b border-line glass">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <Link href="/" className="flex items-baseline gap-3" onClick={() => setOpen(false)}>
          <span className="font-label text-xl font-bold tracking-[0.25em] text-accent">NEET</span>
          <span className="hidden font-display text-sm italic text-muted xl:inline">
            we ain&apos;t an academy
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-0.5 lg:flex">
          {LINKS.map((l) => {
            const active = pathname === l.href || pathname.startsWith(l.href + "/");
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-md px-2.5 py-2 text-sm ${active ? "text-accent" : "text-muted hover:text-text"}`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openPalette}
            aria-label="Search (Command K)"
            className="flex items-center gap-2 rounded-md border border-line px-3 py-1.5 text-sm text-muted hover:border-accent-dim hover:text-text"
          >
            <svg
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
            <span className="hidden font-label sm:inline">⌘K</span>
          </button>
          <div className="hidden xl:block">
            <TextSizeToggle />
          </div>
          {ready &&
            (user ? (
              <ProfileMenu />
            ) : (
              <Link href="/auth" className="btn-ink text-sm">
                Sign in
              </Link>
            ))}
          <button
            type="button"
            className="rounded-md border border-line p-2 text-muted lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-menu" className="border-t border-line bg-surface px-5 py-4 lg:hidden">
          <nav aria-label="Mobile" className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-3 text-text hover:bg-surface-2"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 flex items-center justify-between gap-3">
            <TextSizeToggle />
            {ready && !user && (
              <Link href="/auth" onClick={() => setOpen(false)} className="btn-ink text-sm">
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
