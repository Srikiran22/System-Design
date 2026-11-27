# Service Level Objectives (SLOs) & Incident Runbooks

## Service Level Objectives

| Surface | SLI | Target (30-day rolling) | Error Budget | Telemetry Source |
| --- | --- | --- | --- | --- |
| Public Curriculum & Library Reads | Successful 2xx responses / valid requests | 99.9% | 43.2 min/mo | `getOperationalMetrics` (`curriculum.*`, `library.*`) |
| Account Sync & Evidence Writes | Accepted sync batches without 5xx | 99.5% | 3.6 hrs/mo | `getOperationalMetrics` (`account.recordEvents`, `sync`) |
| Read Latency (p95) | Duration of `curriculum.*` / `library.*` handlers | ≤ 250 ms | — | `getOperationalMetrics.operations[].p95Ms` |
| Write/Sync Latency (p95) | Duration of `account.recordEvents` & `cms.*` | ≤ 500 ms | — | `getOperationalMetrics.operations[].p95Ms` |
| Auth Verification Health | `auth.denied` spike ratio vs. baseline | Alert if > 5× 15m baseline | — | `getOperationalMetrics.auth` |

## Runbooks

### 1. Elevated `account.recordEvents` Partial Failures or Snapshot Conflicts
- **Symptom**: `sync.partialFailures` rises or learners report sync badges stuck in `partially_synced`.
- **Checks**:
  1. Call `/health` to confirm `supabaseReadiness: "connected"`.
  2. Check structured logs filtered by `scope="account"` and `requestId` for `cloud_evidence_upsert_failed` or `cloud_snapshot_upsert_failed`.
  3. Confirm `learner_evidence` and `learner_state_snapshots` (with `version` column) from `docs/database/SUPABASE_SCHEMA_BLUEPRINT.sql` are provisioned in Supabase.
- **Mitigation**: Client durable outbox retains unconfirmed keys automatically and retries with jittered exponential backoff once database connectivity or schema is restored.

### 2. Auth Verification Rejections (`503 auth_unconfigured` or `401 invalid_session`)
- **Symptom**: Authenticated routes return 401/503.
- **Checks**:
  1. Verify `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` are set in server environment (never rely on local dev auth in `NODE_ENV=production`).
  2. Check `scope="auth"` structured logs for `supabase_claims_rejected` or `production_auth_unconfigured`.
- **Mitigation**: Restore Supabase environment secrets and restart server workers; existing client JWTs will validate immediately on next request.

### 3. Dynamic Course Import / Publish Rollback
- **Symptom**: Newly imported or edited course breaks lesson navigation or displays unintended draft content.
- **Checks**:
  1. Query `listAuditLogs` as an admin to identify the exact `course.bundle.import` or `course.upsert` actor and `requestId`.
  2. Call `setCourseStatus({ courseId, status: "archived" })` (or `"draft"`) to immediately hide the course from public routes.
- **Mitigation**: Re-import the previous known-good JSON bundle via `npm run import:course -- --file <backup.json>` or `importCourseBundle`.

### 4. Rate Limit Spike (`429 rate_limited`)
- **Symptom**: `rateLimitHits` spikes in `getOperationalMetrics`.
- **Checks**: Inspect `bucket` (`auth`, `sync`, `search`, `export`, `admin`).
- **Mitigation**: For abusive traffic on `auth` or `search`, block offending IPs at edge WAF/CDN. For legitimate high-concurrency classrooms behind shared NAT, move rate-limit backing store to shared Redis/Upstash and tune bucket thresholds in `src/lib/neet/rate-limit.server.ts`.
