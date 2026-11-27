/**
 * Low-cardinality server-side operational telemetry collector.
 * Tracks operation latency, errors, sync acceptance/rejection rates, auth outcomes,
 * and rate-limit hits without ever storing emails, tokens, or raw learner evidence.
 */

interface OperationStats {
  calls: number;
  errors: number;
  durationsMs: number[];
  lastErrorAt: string | null;
}

const MAX_LATENCY_SAMPLES = 200;
const startedAt = Date.now();
const operations = new Map<string, OperationStats>();

const counters = {
  authSignInSuccess: 0,
  authSignInFailure: 0,
  authDenied: 0,
  syncEventsAccepted: 0,
  syncEventsRejected: 0,
  syncEvidenceAccepted: 0,
  syncEvidenceRejected: 0,
  syncSnapshotsSaved: 0,
  syncSnapshotConflicts: 0,
  syncPartialFailures: 0,
  rateLimitHits: {} as Record<string, number>,
};

function percentile(samples: number[], p: number): number {
  if (samples.length === 0) return 0;
  const sorted = [...samples].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return Math.round((sorted[idx] ?? 0) * 10) / 10;
}

export function recordOperation(operation: string, durationMs: number, ok: boolean): void {
  let stat = operations.get(operation);
  if (!stat) {
    stat = { calls: 0, errors: 0, durationsMs: [], lastErrorAt: null };
    operations.set(operation, stat);
  }
  stat.calls++;
  if (!ok) {
    stat.errors++;
    stat.lastErrorAt = new Date().toISOString();
  }
  stat.durationsMs.push(durationMs);
  if (stat.durationsMs.length > MAX_LATENCY_SAMPLES) {
    stat.durationsMs.shift();
  }
}

export async function measureOperation<T>(operation: string, fn: () => Promise<T>): Promise<T> {
  const t0 = performance.now();
  try {
    const res = await fn();
    recordOperation(operation, performance.now() - t0, true);
    return res;
  } catch (err) {
    recordOperation(operation, performance.now() - t0, false);
    throw err;
  }
}

export function recordAuthOutcome(kind: "signin_success" | "signin_failure" | "denied"): void {
  if (kind === "signin_success") counters.authSignInSuccess++;
  else if (kind === "signin_failure") counters.authSignInFailure++;
  else counters.authDenied++;
}

export function recordSyncMetrics(delta: {
  eventsAccepted?: number;
  eventsRejected?: number;
  evidenceAccepted?: number;
  evidenceRejected?: number;
  snapshotSaved?: boolean;
  snapshotConflict?: boolean;
  partialFailure?: boolean;
}): void {
  counters.syncEventsAccepted += delta.eventsAccepted ?? 0;
  counters.syncEventsRejected += delta.eventsRejected ?? 0;
  counters.syncEvidenceAccepted += delta.evidenceAccepted ?? 0;
  counters.syncEvidenceRejected += delta.evidenceRejected ?? 0;
  if (delta.snapshotSaved) counters.syncSnapshotsSaved++;
  if (delta.snapshotConflict) counters.syncSnapshotConflicts++;
  if (delta.partialFailure) counters.syncPartialFailures++;
}

export function recordRateLimitHit(bucket: string): void {
  counters.rateLimitHits[bucket] = (counters.rateLimitHits[bucket] ?? 0) + 1;
}

export interface OperationalMetricsSnapshot {
  capturedAt: string;
  uptimeSeconds: number;
  auth: {
    signInSuccess: number;
    signInFailure: number;
    denied: number;
  };
  sync: {
    eventsAccepted: number;
    eventsRejected: number;
    evidenceAccepted: number;
    evidenceRejected: number;
    snapshotsSaved: number;
    snapshotConflicts: number;
    partialFailures: number;
  };
  rateLimitHits: Record<string, number>;
  operations: Record<
    string,
    {
      calls: number;
      errors: number;
      errorRate: number;
      p50Ms: number;
      p95Ms: number;
      lastErrorAt: string | null;
    }
  >;
}

export function getOperationalMetricsSnapshot(): OperationalMetricsSnapshot {
  const ops: OperationalMetricsSnapshot["operations"] = {};
  for (const [name, stat] of operations.entries()) {
    ops[name] = {
      calls: stat.calls,
      errors: stat.errors,
      errorRate: stat.calls > 0 ? Math.round((stat.errors / stat.calls) * 10000) / 10000 : 0,
      p50Ms: percentile(stat.durationsMs, 50),
      p95Ms: percentile(stat.durationsMs, 95),
      lastErrorAt: stat.lastErrorAt,
    };
  }

  return {
    capturedAt: new Date().toISOString(),
    uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
    auth: {
      signInSuccess: counters.authSignInSuccess,
      signInFailure: counters.authSignInFailure,
      denied: counters.authDenied,
    },
    sync: {
      eventsAccepted: counters.syncEventsAccepted,
      eventsRejected: counters.syncEventsRejected,
      evidenceAccepted: counters.syncEvidenceAccepted,
      evidenceRejected: counters.syncEvidenceRejected,
      snapshotsSaved: counters.syncSnapshotsSaved,
      snapshotConflicts: counters.syncSnapshotConflicts,
      partialFailures: counters.syncPartialFailures,
    },
    rateLimitHits: { ...counters.rateLimitHits },
    operations: ops,
  };
}

export function resetMetricsForTest(): void {
  operations.clear();
  counters.authSignInSuccess = 0;
  counters.authSignInFailure = 0;
  counters.authDenied = 0;
  counters.syncEventsAccepted = 0;
  counters.syncEventsRejected = 0;
  counters.syncEvidenceAccepted = 0;
  counters.syncEvidenceRejected = 0;
  counters.syncSnapshotsSaved = 0;
  counters.syncSnapshotConflicts = 0;
  counters.syncPartialFailures = 0;
  counters.rateLimitHits = {};
}
