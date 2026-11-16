import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/neet/meta";
import Link from "@/components/neet/AppLink";
import Dashboard from "@/components/neet/Dashboard";
import ProgressHeatmap from "@/components/neet/ProgressHeatmap";
import { useMe } from "@/hooks/use-me";
import { exportDossier } from "@/lib/neet/account.functions";
import { useState } from "react";

function MePage() {
  const { me, error, loading, refetch } = useMe();
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await exportDossier();
      if (res.data) {
        const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
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
          <p className="font-label text-sm uppercase tracking-widest text-accent">My progress</p>
          <h1 className="mt-2 font-display text-5xl">Your Proceed Scale</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            Synced to your account.{" "}
            <Link href="/me/calibration" className="text-accent underline underline-offset-4">
              Calibration →
            </Link>
          </p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          disabled={exporting}
          className="rounded-full border border-line bg-surface px-4 py-2 text-sm text-text transition hover:border-accent hover:bg-surface-2"
        >
          {exporting ? "Generating Dossier…" : "Export Verified Portfolio (JSON) ↓"}
        </button>
      </div>
      <section aria-labelledby="heat-h" className="mt-10 rounded-3xl bg-surface p-5 sm:p-7">
        <h2 id="heat-h" className="font-label text-sm uppercase tracking-widest text-accent">
          Daily progress
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
        <Dashboard />
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/me/")({
  head: () => pageHead("My progress", "Your daily progress, streaks and Proceed Scale."),
  component: MePage,
});
