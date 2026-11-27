import Link from "@/components/neet/AppLink";
import { useLocation } from "@tanstack/react-router";
import { useState } from "react";
import ProfileMenu from "./ProfileCard";
import { useSession } from "@/hooks/use-session";

const LINKS = [
  { href: "/paths", label: "Courses" },
  { href: "/library", label: "Library" },
  { href: "/exercises", label: "Exercises" },
  { href: "/labs", label: "Projects" },
  { href: "/me", label: "Progress" },
];

export default function Nav() {
  const pathname = useLocation({ select: (l) => l.pathname });
  const [open, setOpen] = useState(false);
  const { user, ready } = useSession();
  const openPalette = () => window.dispatchEvent(new Event("neet:palette"));

  return (
    <header className="sticky top-0 z-50 border-b border-line glass">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-8">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-3 whitespace-nowrap"
            onClick={() => setOpen(false)}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded bg-accent font-display text-xs font-bold text-bg">
              N
            </span>
            <span className="font-display text-lg font-bold tracking-tight text-text">NEET</span>
          </Link>

          <nav
            aria-label="Primary"
            className="hidden items-center gap-8 text-sm font-medium md:flex"
          >
            {LINKS.map((l) => {
              const active = pathname === l.href || pathname.startsWith(l.href + "/");
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={`shrink-0 whitespace-nowrap transition-colors ${
                    active ? "text-accent" : "text-text/85 hover:text-accent"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={openPalette}
              aria-label="Search (Command K)"
              className="hidden items-center gap-2 whitespace-nowrap rounded-md border border-line px-3 py-1.5 text-sm text-muted transition-all hover:border-accent hover:bg-surface-2 hover:text-text sm:flex"
            >
              <span>Search</span>
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

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
              className="rounded-md border border-line p-2 text-muted transition-colors hover:border-accent hover:text-text md:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label="Toggle navigation menu"
              onClick={() => setOpen((v) => !v)}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                {open ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div
          id="mobile-menu"
          className="fixed inset-x-0 top-16 z-50 border-b border-line bg-bg px-6 py-6 shadow-2xl md:hidden"
        >
          <nav aria-label="Mobile" className="flex flex-col">
            {LINKS.map((l) => {
              const active = pathname === l.href || pathname.startsWith(l.href + "/");
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={`block border-b border-line py-3 text-base font-medium transition-colors ${
                    active ? "text-accent" : "text-text hover:text-accent"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-5 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                openPalette();
              }}
              className="btn-soft flex-1 justify-center text-sm"
            >
              Search (⌘K)
            </button>
            {ready && !user && (
              <Link
                href="/auth"
                onClick={() => setOpen(false)}
                className="btn-ink flex-1 justify-center text-sm"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
