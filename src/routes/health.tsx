import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import Link from "@/components/neet/AppLink";
import { PageHeader, Field, LoadError } from "@/components/neet/ui";
import { getHealth, getLiveness } from "@/lib/neet/library.functions";
import { getAuthenticatedDiagnostics } from "@/lib/neet/account.functions";
import { useSession } from "@/hooks/use-session";
import { pageHead } from "@/lib/neet/meta";

export const Route = createFileRoute("/health")({
  loader: async () => {
    const [liveness, health] = await Promise.all([getLiveness(), getHealth()]);
    return { liveness, health };
  },
  head: () =>
    pageHead(
      "Service Status",
      "Separated process liveness, service readiness, knowledge pack provenance summary, and authenticated account diagnostics.",
    ),
  errorComponent: ({ error }) => <LoadError error={error} />,
  component: SystemHealthPage,
});

function SystemHealthPage() {
  const { liveness, health } = Route.useLoaderData();
  const { user } = useSession();
  const fetchDiag = useServerFn(getAuthenticatedDiagnostics);

  const diag = useQuery({
    queryKey: ["authenticated-diagnostics", user?.id],
    queryFn: async () => {
      const r = await fetchDiag();
      if (r.error || !r.data) throw new Error(r.error ?? "Diagnostics unavailable");
      return r.data;
    },
    enabled: Boolean(user),
    retry: false,
  });

  const isHealthy = health.status === "healthy";
  const s = health.knowledgePack.sources;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-5 md:py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageHeader eyebrow="Service Liveness & Readiness" title="Platform Status & Provenance">
          Separated zero-DB process liveness and canonical knowledge pack readiness. Internal
          runtime paths and account totals are intentionally omitted from public telemetry.
        </PageHeader>
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            LIVENESS: {liveness.status.toUpperCase()}
          </span>
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium border ${
              isHealthy
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${isHealthy ? "bg-emerald-500" : "bg-amber-500"}`}
            />
            READINESS: {health.status.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl bg-surface p-6">
          <p className="text-xs uppercase tracking-wide text-muted">Knowledge Pack</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums">
            {health.knowledgePack.volumes} Volumes
          </p>
          <p className="mt-1 text-xs text-muted">Snapshot as of {health.freshnessAsOf}</p>
        </div>

        <div className="rounded-3xl bg-surface p-6">
          <p className="text-xs uppercase tracking-wide text-muted">Source Register</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums">{s.totalRegistered} Records</p>
          <p className="mt-1 text-xs text-muted">
            {s.fullExtraction} full · {s.targetedExtraction} targeted · {s.discoveryOnly} discovery
          </p>
        </div>

        <div className="rounded-3xl bg-surface p-6">
          <p className="text-xs uppercase tracking-wide text-muted">Account Store Mode</p>
          <p className="mt-2 text-2xl font-semibold">
            {health.authMode === "supabase" ? "Supabase Cloud" : "Local Dev Mode"}
          </p>
          <p className="mt-1 text-xs text-muted">
            Cloud status: {health.supabaseReadiness.replace("_", " ")} · Cloud SQLite-free
          </p>
        </div>

        <div className="rounded-3xl bg-surface p-6">
          <p className="text-xs uppercase tracking-wide text-muted">Practice &amp; Roles</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums">
            {health.knowledgePack.practicePrompts} Prompts
          </p>
          <p className="mt-1 text-xs text-muted">
            {health.knowledgePack.careerRoles} engineering role matrices
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl bg-surface p-6">
          <h2 className="text-lg font-semibold">Source Provenance Breakdown</h2>
          <p className="mt-1 text-xs text-muted">
            Exact extraction audit classification across {s.totalRegistered} registered references
            (no blanket &quot;verified&quot; claim).
          </p>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <Field label="Full Extraction / Fetch">{s.fullExtraction}</Field>
            <Field label="Targeted Extraction">{s.targetedExtraction}</Field>
            <Field label="Partial Extraction">{s.partialExtraction}</Field>
            <Field label="Discovery Only">{s.discoveryOnly}</Field>
            <Field label="Blocked / Unreachable">{s.inaccessible}</Field>
            <Field label="Unaudited Register Entries">{s.unverifiedRegistry}</Field>
          </dl>
          <div className="mt-5 flex flex-wrap gap-3 text-xs">
            <Link href="/sources" className="font-medium text-accent hover:underline">
              Inspect source register →
            </Link>
            <Link href="/coverage" className="font-medium text-muted hover:text-text">
              View full extraction audit →
            </Link>
          </div>
        </div>

        <div className="rounded-3xl bg-surface p-6">
          <h2 className="text-lg font-semibold">Authenticated Account Diagnostics</h2>
          <p className="mt-1 text-xs text-muted">
            Scoped strictly to your verified session. Host paths and other learners&apos; metrics
            are never exposed.
          </p>

          {!user ? (
            <div className="mt-6 rounded-2xl border border-line bg-bg/60 p-5">
              <p className="text-sm text-muted">
                Sign in to inspect your verified storage engine, session mode, and synced evidence
                totals.
              </p>
              <Link href="/auth" className="btn-ink mt-4 inline-block text-xs">
                Sign in for account diagnostics
              </Link>
            </div>
          ) : diag.isPending ? (
            <p className="mt-6 text-sm text-muted">Verifying session diagnostics…</p>
          ) : diag.error || !diag.data ? (
            <p className="mt-6 text-sm text-amber-600 dark:text-amber-400">
              {diag.error instanceof Error ? diag.error.message : "Could not load diagnostics."}
            </p>
          ) : (
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <Field label="Storage Engine">{diag.data.storageEngine}</Field>
              <Field label="Auth Verification">
                {diag.data.authMode === "supabase" ? "Supabase JWT" : "Server HMAC (dev)"}
              </Field>
              <Field label="Your Learning Goals">{diag.data.yourAccountCounts.goals}</Field>
              <Field label="Your Activity Events">{diag.data.yourAccountCounts.events}</Field>
              <Field label="Your Synced Evidence">
                {diag.data.yourAccountCounts.evidenceItems}
              </Field>
              <Field label="Service Uptime">
                {Math.floor(diag.data.uptimeSeconds / 60)}m {diag.data.uptimeSeconds % 60}s
              </Field>
            </dl>
          )}
        </div>
      </div>
    </div>
  );
}
