import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/neet/meta";
import Link from "@/components/neet/AppLink";
import Dashboard from "@/components/neet/Dashboard";
import ProgressHeatmap from "@/components/neet/ProgressHeatmap";
import { useMe } from "@/hooks/use-me";
import { exportDossier } from "@/lib/neet/account.functions";
import { computeAll } from "@/lib/neet/scale";
import { readProgressSnapshot } from "@/lib/neet/store";
import { requestManualSyncRetry, useSyncStatus } from "@/lib/neet/sync-outbox";
import { useState } from "react";

function SyncBadge() {
  const sync = useSyncStatus();
  const pending = sync.pendingEvents + sync.pendingEvidence;

  const badge = (() => {
    switch (sync.state) {
      case "synced":
        return {
          dot: "bg-emerald-500",
          cls: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
          label: sync.lastSyncedAt ? "Synced to account" : "Account connected",
          canRetry: false,
        };
      case "syncing":
        return {
          dot: "bg-sky-500 animate-pulse",
          cls: "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-400",
          label: pending > 0 ? `Syncing ${pending} item${pending === 1 ? "" : "s"}…` : "Syncing…",
          canRetry: false,
        };
      case "pending":
        return {
          dot: "bg-sky-500",
          cls: "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-400",
          label: `Pending sync (${pending} queued)`,
          canRetry: true,
        };
      case "partially_synced":
        return {
          dot: "bg-amber-500",
          cls: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-400",
          label: `Partially synced · ${pending} kept locally`,
          canRetry: true,
        };
      case "offline":
        return {
          dot: "bg-amber-500",
          cls: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400",
          label: pending > 0 ? `Offline · ${pending} queued safely` : "Offline mode",
          canRetry: false,
        };
      case "needs_attention":
        return {
          dot: "bg-rose-500",
          cls: "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-400",
          label: `Sync needs attention (${pending} queued)`,
          canRetry: true,
        };
      default:
        return {
          dot: "bg-muted",
          cls: "border-line bg-surface text-muted",
          label: "Local session",
          canRetry: false,
        };
    }
  })();

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <span
        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${badge.cls}`}
        title={sync.lastNotice ?? sync.lastError ?? undefined}
      >
        <span className={`h-2 w-2 rounded-full ${badge.dot}`} />
        {badge.label}
      </span>
      {badge.canRetry && (
        <button
          type="button"
          onClick={requestManualSyncRetry}
          className="text-xs font-medium text-accent underline underline-offset-4 hover:text-text"
        >
          Retry
        </button>
      )}
    </span>
  );
}

function MePage() {
  const { me, error, loading, refetch } = useMe();
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await exportDossier();
      const localSnap = readProgressSnapshot();
      const competencySummary = computeAll(localSnap.evidence);
      if (res.data) {
        const bundle = {
          ...res.data,
          targetRoleId: localSnap.targetRoleId ?? null,
          competencySnapshot: competencySummary,
          artifacts: {
            rubricLabs: localSnap.labAttempts,
            scenarios: localSnap.scenarios,
            capstoneMilestones: localSnap.capstone,
            capstoneChangeImpact: localSnap.capstoneChangeImpact ?? null,
          },
        };
        const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `systems-engineering-portfolio-${new Date().toISOString().split("T")[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="font-label text-sm uppercase tracking-widest text-accent">
              Learner Portfolio &amp; Progress
            </p>
            <SyncBadge />
          </div>
          <h1 className="mt-2 font-display text-5xl">Your Proceed Scale</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            Evidence-backed mastery synced to your verified account.{" "}
            <Link href="/me/calibration" className="text-accent underline underline-offset-4">
              Calibration curve →
            </Link>
          </p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          disabled={exporting}
          className="rounded-full border border-line bg-surface px-4 py-2 text-sm text-text transition hover:border-accent hover:bg-surface-2"
        >
          {exporting ? "Exporting Portfolio…" : "Export Learning Record (JSON) ↓"}
        </button>
      </div>

      <section aria-labelledby="heat-h" className="mt-10 rounded-3xl bg-surface p-5 sm:p-7">
        <h2 id="heat-h" className="font-label text-sm uppercase tracking-widest text-accent">
          Daily practice cadence
        </h2>
        <div className="mt-4">
          {error ? (
            <p className="text-sm text-muted">
              {error}{" "}
              <button className="text-accent underline" onClick={() => refetch()}>
                Retry
              </button>
            </p>
          ) : loading || !me ? (
            <div className="h-32 animate-pulse rounded-2xl bg-surface-2" />
          ) : (
            <ProgressHeatmap events={me.events} />
          )}
        </div>
      </section>

      <div className="mt-10">
        <Dashboard goalTexts={me?.goals.map((g) => g.text) ?? []} />
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/me/")({
  head: () =>
    pageHead(
      "My progress & portfolio",
      "Your evidence-backed Proceed Scale, skill gaps, and artifact portfolio.",
    ),
  component: MePage,
});
