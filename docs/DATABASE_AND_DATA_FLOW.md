# Database, Persistence & Synchronization Data Flow

## 1. Canonical Store Separation

- **Production / Cloud (`SUPABASE_URL` + `SUPABASE_PUBLISHABLE_KEY` set)**:
  - Account reads and mutations for `profiles`, `learning_goals`, `progress_events`, `learner_evidence`, and `learner_state_snapshots` use Supabase PostgreSQL under owner-only RLS. The evidence and snapshot tables are Lovable-managed schema dependencies and must be provisioned in staging/production before those capabilities are considered ready.
  - The server acknowledges only confirmed event/evidence keys and a saved snapshot. Missing tables, rejected rows, and snapshot-version conflicts are returned as explicit partial failures so the browser outbox retains unconfirmed work; production code does not silently fall back to local SQLite.
- **Local Development / CI (`node:sqlite`, `.data/system_design.sqlite` by default; server-only `SQLITE_DB_PATH` override)**:
  - Mirrors knowledge pack tables plus account tables (`profiles`, `learning_goals`, `progress_events`) and extended persistence tables (`local_auth_users`, `learner_evidence`, `learner_state_snapshots`).

## 2. Client-to-Server Sync Architecture

1. **Account-Scoped Local State (`src/lib/neet/store.ts`)**:
   - Browser state is strictly namespaced per authenticated user under `neet.progress.v2.<userId>` (and `neet.progress.v2.guest` when signed out).
   - Switching accounts calls `setActiveUser(nextUserId)` and `queryClient.clear()` on sign-out so User A's progress or cached profile never leaks to User B.
2. **Durable User-Scoped Outbox (`src/lib/neet/sync-outbox.ts`)**:
   - Queued events and rich evidence records persist in `neet.outbox.v1.<userId>`, deduplicated by `(kind, ref)` and `idempotency_key`.
   - Backfill markers (`neet.backfilled.v2.<userId>`) are written **only after server ACK**, preventing data loss on offline/transient first-sign-in failures.
   - Failed flushes retry with capped exponential backoff (`2s -> 4s -> 8s -> ... -> 60s`) and automatically resume on the browser `online` event.
   - True completion timestamps (`completedAt[lessonKey]`, lab `at`, evidence `at`) are preserved during backfill instead of collapsing history onto today's date.
3. **Cross-Device Hydration (`ProgressSync.tsx`)**:
   - On sign-in, `ProgressSync` requests `getLearnerSnapshotFn()` and merges remote snapshot state with local state (`mergeStates`) without discarding offline work.

## 3. Recommended Lovable Cloud Schema Migration (Apply via Lovable Editor)

Per repository guardrails (`AGENTS.md`), `drizzle/` and `supabase/migrations/` are managed via Lovable and were not edited directly. To enable full cross-device persistence of rubric-evaluated evidence and snapshots in Supabase Cloud (currently persisted in local dev SQLite and bundled in JSON exports), apply the following tables via Lovable Cloud with owner-only RLS (`auth.uid() = user_id`):

```sql
CREATE TABLE public.learner_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  idempotency_key text NOT NULL,
  skill_id text NOT NULL,
  evidence_type text NOT NULL CHECK (evidence_type IN ('quiz','explain','variant','lab','artifact','review')),
  ref text NOT NULL,
  score double precision NOT NULL CHECK (score >= 0 AND score <= 1),
  weight double precision NOT NULL CHECK (weight > 0 AND weight <= 10),
  confidence double precision NULL CHECK (confidence >= 0 AND confidence <= 1),
  verification_tier text NOT NULL CHECK (verification_tier IN ('self-assessed','automated-check','rubric-evaluated','reviewer-verified')),
  rubric_version text NULL,
  rubric_scores jsonb NULL,
  artifact_url text NULL,
  artifact_notes text NULL,
  occurred_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, idempotency_key)
);

CREATE TABLE public.learner_state_snapshots (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  state_json jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.learner_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learner_state_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_select_evidence" ON public.learner_evidence FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "owner_upsert_evidence" ON public.learner_evidence FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner_update_evidence" ON public.learner_evidence FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "owner_select_snapshot" ON public.learner_state_snapshots FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "owner_upsert_snapshot" ON public.learner_state_snapshots FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner_update_snapshot" ON public.learner_state_snapshots FOR UPDATE USING (auth.uid() = user_id);
```
