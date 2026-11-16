import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Field, LoadError } from "@/components/neet/ui";
import { getHealth } from "@/lib/neet/library.functions";
import { pageHead } from "@/lib/neet/meta";
import { useState } from "react";

export const Route = createFileRoute("/health")({
  loader: () => getHealth(),
  head: () =>
    pageHead(
      "System Health",
      "Live enterprise telemetry, database synchronization status, and system metrics.",
    ),
  errorComponent: ({ error }) => <LoadError error={error} />,
  component: SystemHealthPage,
});

function SystemHealthPage() {
  const health = Route.useLoaderData();
  const [copied, setCopied] = useState(false);

  const copyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(health, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isHealthy = health.status === "healthy";

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-5 md:py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageHeader eyebrow="Enterprise Operations" title="System Telemetry & Health">
          Real-time service indicators, synchronous SQLite database status, and pack integrity.
        </PageHeader>
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium ${
              isHealthy
                ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${isHealthy ? "bg-emerald-500" : "bg-amber-500"}`}
            />
            {health.status.toUpperCase()}
          </span>
          <button
            type="button"
            onClick={copyJson}
            className="rounded-full border border-line bg-surface px-4 py-1.5 text-sm text-text transition hover:border-accent"
          >
            {copied ? "Copied JSON ✓" : "Copy Telemetry JSON"}
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl bg-surface p-6">
          <p className="text-xs uppercase tracking-wide text-muted">Uptime</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums">
            {Math.floor(health.uptimeSeconds / 60)}m {health.uptimeSeconds % 60}s
          </p>
          <p className="mt-1 text-xs text-muted">Continuous process lifetime</p>
        </div>

        <div className="rounded-3xl bg-surface p-6">
          <p className="text-xs uppercase tracking-wide text-muted">Database Engine</p>
          <p className="mt-2 text-3xl font-semibold">{health.database.engine.split(" ")[0]}</p>
          <p className="mt-1 text-xs text-muted">
            WAL mode: {health.database.walMode ? "Enabled" : "Standard"}
          </p>
        </div>

        <div className="rounded-3xl bg-surface p-6">
          <p className="text-xs uppercase tracking-wide text-muted">Knowledge Pack</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums">
            {health.database.counts.articles} Volumes
          </p>
          <p className="mt-1 text-xs text-muted">
            {health.database.counts.sources} verified sources
          </p>
        </div>

        <div className="rounded-3xl bg-surface p-6">
          <p className="text-xs uppercase tracking-wide text-muted">Memory Usage</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums">
            {health.runtime.memory.rssMb} MB
          </p>
          <p className="mt-1 text-xs text-muted">
            Heap: {health.runtime.memory.heapUsedMb} MB / {health.runtime.memory.heapTotalMb} MB
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl bg-surface p-6">
          <h2 className="text-lg font-semibold">Database Tables & Exact Row Counts</h2>
          <p className="mt-1 text-xs text-muted">
            Synchronous SQLite state verified from local pack files
          </p>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <Field label="Articles / Volumes">{health.database.counts.articles}</Field>
            <Field label="Sources Register">{health.database.counts.sources}</Field>
            <Field label="Practice Prompts">{health.database.counts.practice_prompts}</Field>
            <Field label="Roles & Competencies">{health.database.counts.roles}</Field>
            <Field label="Deep Coverage Rows">{health.database.counts.coverage_deep}</Field>
            <Field label="Research Coverage Rows">{health.database.counts.coverage_research}</Field>
            <Field label="Extraction Audits">{health.database.counts.scrape_audit}</Field>
            <Field label="Pack Metadata Records">{health.database.counts.pack_meta}</Field>
            <Field label="User Profiles">{health.database.counts.profiles}</Field>
            <Field label="Learning Goals">{health.database.counts.learning_goals}</Field>
            <Field label="Progress Events">{health.database.counts.progress_events}</Field>
          </dl>
        </div>

        <div className="rounded-3xl bg-surface p-6">
          <h2 className="text-lg font-semibold">Environment & Runtime Topology</h2>
          <p className="mt-1 text-xs text-muted">Enterprise node execution context</p>
          <dl className="mt-4 grid gap-3 text-sm">
            <Field label="Application Version">{health.version}</Field>
            <Field label="Node.js Engine">{health.runtime.nodeVersion}</Field>
            <Field label="Platform Architecture">{health.runtime.platform}</Field>
            <Field label="Database File Path">{health.database.filePath}</Field>
            <Field label="Timestamp">{health.timestamp}</Field>
          </dl>
        </div>
      </div>
    </div>
  );
}
