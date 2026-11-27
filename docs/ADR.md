# Architecture Decision Records (ADR)

This log documents architectural decisions for the NEET Systems Engineering Practice Platform.

---

## ADR-001: Canonical Learner Store & Honest Sync Contract
- **Status:** Accepted (2026-11-25)
- **Context:** Browser storage alone loses evidence across devices; silently returning HTTP 200 when cloud tables are missing or unpersisted causes silent data loss.
- **Decision:**
  - **Production:** Supabase/PostgreSQL (owner-scoped RLS) is canonical for signed-in learner `progress_events`, `learner_evidence`, and `learner_state_snapshots`.
  - **Client:** Browser `localStorage` is strictly an account-namespaced cache and durable pending outbox (`neet.outbox.v1.<userId>`).
  - **Local Development / Tests:** `node:sqlite` (`.data/system_design.sqlite`) is strictly development/test infrastructure and is never imported on production cloud paths.
  - **Delivery semantics:** At-least-once delivery with idempotent server writes (`UNIQUE(user_id, idempotency_key)`). The server returns explicit `acceptedEventKeys`, `rejectedEventKeys`, `acceptedEvidenceKeys`, `rejectedEvidenceKeys`, `snapshotSaved`, and `serverVersion`. The browser acknowledges ONLY confirmed keys.
- **Boundary:** Lovable manages `supabase/migrations/` and `drizzle/` per `AGENTS.md`. Application code persists to `learner_evidence` and `learner_state_snapshots` when provisioned and explicitly reports `partialFailure` (retaining outbox items) if cloud tables are unavailable.

## ADR-002: Runtime Portability & Liveness/Readiness Separation
- **Status:** Accepted (2026-11-25)
- **Context:** Target production hosts (e.g., Cloudflare Workers / Nitro edge/serverless runtimes) do not provide a persistent local-file `node:sqlite` engine.
- **Decision:**
  - Separate process liveness (`getLiveness` — zero DB imports) from service readiness (`getHealth` — checks Supabase connectivity when configured without importing `db.server`).
  - Public health responses omit host filesystem paths, OS metadata, and other learners' counts.
  - Clamp `signature_seed` to PostgreSQL signed `INT4` (`[1, 2_147_483_647]`).

## ADR-003: Assessment Truthfulness & Verification Tiers
- **Status:** Accepted (2026-11-25)
- **Context:** Labelling learner self-rated rubrics as independently verified or "rubric-evaluated" misleads learners and portfolio readers.
- **Decision:**
  - Strictly separate four evaluation mechanisms:
    1. `self-assessed` — learner self-ratings, including self-scored rubrics (explicitly tagged `evaluatorRole: "self"`).
    2. `automated-check` — deterministic checks (pause-and-think quizzes, worked trade-off scenario scoring).
    3. `rubric-feedback` — criterion-level structured feedback referencing a versioned domain-specific rubric (all 10 labs have dedicated rubrics).
    4. `reviewer-verified` — server-authoritative human review decision (`draft → submitted → under_review → needs_revision / accepted / not_met`). Learners cannot self-assign `reviewer-verified` from client input.
  - Every attempt stores `rubricId`, `rubricVersion`, immutable revision history, and optional `feedbackResponse`.

## ADR-004: Tailored 16-Competency Model & INCOSE SECF 2e Crosswalk
- **Status:** Accepted (2026-11-25)
- **Context:** INCOSE SECF 2nd Edition defines 37 competencies and expects domain tailoring.
- **Decision:** Retain NEET's 16 instructional competencies (`SE-ST-01`..`SE-EN-06`) as a tailored subset and publish an explicit 16-to-37 crosswalk (`INCOSE_CROSSWALK`) specifying mapping type (`direct`, `partial`, `supporting`, `unmapped`), rationale, indicator references, and edition. Never claim accreditation or formal INCOSE certification.

## ADR-005: Canonical Runtime, Content Integrity Gate & Client Bundle Budget
- **Status:** Accepted (2026-11-25)
- **Context:** Node v22 + npm (`package-lock.json`) is the canonical toolchain; shipping the ~932 KB generated `sourceEnrichment.ts` catalogue directly in `Markdown.tsx` inflates article client bundles.
- **Decision:**
  - Standardize Node 22 + `npm` scripts (`typecheck`, `lint`, `test`, `validate:pack`, `build`).
  - Make `validate:pack` a strict CI gate that fails non-zero on missing files, duplicate IDs, invalid URLs, dangling `[Sxx]` citations, mirror drift, or below-minimum counts.
  - Keep `sourceEnrichment.ts` server-side for article pages by passing a per-article `citationMap` from `getArticle` and keeping only tiny `citationAliases.ts` in client code.
