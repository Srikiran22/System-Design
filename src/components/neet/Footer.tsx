import Link from "@/components/neet/AppLink";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-line bg-surface-1 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded bg-accent font-display text-xs font-bold text-bg">
              N
            </span>
            <div>
              <span className="font-display text-sm font-bold tracking-tight text-text">
                NEET
              </span>
            </div>
          </div>

          <nav
            aria-label="Footer navigation"
            className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted"
          >
            <Link href="/paths" className="transition-colors hover:text-accent">
              Courses
            </Link>
            <Link href="/library" className="transition-colors hover:text-accent">
              Library
            </Link>
            <Link href="/sources" className="transition-colors hover:text-accent">
              Sources
            </Link>
            <Link href="/coverage" className="transition-colors hover:text-accent">
              Coverage
            </Link>
            <Link href="/careers" className="transition-colors hover:text-accent">
              Careers
            </Link>
            <Link href="/method" className="transition-colors hover:text-accent">
              Method
            </Link>
            <Link href="/me/calibration" className="transition-colors hover:text-accent">
              Calibration
            </Link>
            <Link href="/health" className="transition-colors hover:text-accent">
              Status
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
