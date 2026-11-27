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

## 3. Managed Cloud Schema Prerequisites

Production account functions use two Lovable-managed tables in addition to the core account tables:

- `learner_evidence` stores learner evidence with idempotency keys, competency references, scores, verification tiers, rubric metadata, artifact metadata, and reviewer fields.
- `learner_state_snapshots` stores the account-scoped state snapshot and its optimistic-concurrency version.

The canonical schema and row-level security specification is [`docs/database/SUPABASE_SCHEMA_BLUEPRINT.sql`](./database/SUPABASE_SCHEMA_BLUEPRINT.sql). The companion [pgTAP test suite](./database/rls_pgtap_tests.sql) defines 12 positive/negative assertions for published/draft visibility, learner isolation, evidence verification tiers, and author permissions.

**Do not copy an older inline SQL example or edit `drizzle/` / `supabase/migrations/` directly.** Request schema changes through Lovable Cloud, then verify the deployed schema and RLS policies in staging. Repository CI does not connect to a live Supabase project and therefore cannot prove these tables are provisioned. This remains part of [issue #7](https://github.com/Srikiran22/System-Design/issues/7).

When the schema is missing or rejects a write, production account functions return an explicit partial-sync result. `ProgressSync.tsx` removes only server-confirmed event/evidence keys and retains unconfirmed work in the browser outbox for retry. Production does not fall back to local SQLite.

## 4. Curriculum and Competency Data Contract

The current learner map, Proceed Scale, and recommendation engine are versioned against the 16 canonical competency definitions in `src/lib/neet/competencies.ts` and `src/lib/neet/content.ts`. The database table `curriculum_competencies` is a persisted mirror of those definitions, not an independent authoring vocabulary.

- Courses map to existing competency IDs through lesson `skillIds`; labs and scenarios use a single `skillId`; capstone milestones and role profiles reference the same IDs.
- Local SQLite and Supabase authoring reject unknown competency references. The cloud write path seeds missing canonical competency rows before inserting dependent curriculum data.
- Competency rows must match the source catalogue, including code, domain, prerequisite graph, level descriptors, version, and framework crosswalk. New competency IDs or changed definitions require a coordinated source-model, learner-map, scale, recommendation, and migration version update.
- Labs and scenarios have scalar foreign keys to `curriculum_competencies`. JSON-backed links (competency prerequisites/relations, lesson skill arrays, capstone milestone skill arrays, and role required-level maps) are checked by server-side validation and protected by a database delete trigger. SQLite uses corresponding foreign keys/triggers for local development and tests.
- Course bundles are reference-checked before the first cloud write. Supabase's table-by-table REST upserts are sequential rather than one transaction; a network or storage failure after an earlier upsert can leave a partial import. Check the returned import result and reconcile before retrying.

The database source is the Lovable-managed `docs/database/SUPABASE_SCHEMA_BLUEPRINT.sql`; tests for the constraints are included in `docs/database/rls_pgtap_tests.sql`. Do not edit `drizzle/` or `supabase/migrations/` outside the Lovable-managed workflow. The blueprint has not been applied to a production Supabase instance by repository CI.
