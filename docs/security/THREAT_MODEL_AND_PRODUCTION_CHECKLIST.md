# Threat Model & Production Readiness Checklist

## Trust Boundaries & Key Defenses

1. **Authentication & Identity (`src/lib/neet/auth-server.ts`)**
   - Production verifies every bearer JWT via Supabase `auth.getClaims()` and validates UUID subject format; never decodes unverified payloads.
   - Local development auth (`local-auth.functions.ts`) is strictly blocked when `NODE_ENV === "production"` or when Supabase credentials are configured.
   - Passwords in local dev use `crypto.scryptSync` with 16-byte random salts and `crypto.timingSafeEqual`.
   - Roles are resolved ONLY from server-side `ADMIN_EMAILS`, verified JWT `app_metadata.role` (never client-editable `user_metadata`), or `user_roles`.

2. **Data Isolation & Integrity (`src/lib/neet/account.functions.ts`, `docs/database/SUPABASE_SCHEMA_BLUEPRINT.sql`)**
   - Every learner table (`profiles`, `learning_goals`, `progress_events`, `learner_evidence`, `learner_state_snapshots`) is protected by PostgreSQL Row-Level Security (RLS) scoped to `auth.uid()` and server-side `context.userId` filtering.
   - Learners cannot self-assign `rubric-evaluated` or `reviewer-verified` verification tiers (`sanitizeLearnerVerificationTier` + PostgreSQL `CHECK`/RLS policies).
   - Cross-device state snapshots support optimistic concurrency (`expectedServerVersion`) to prevent silent multi-tab/multi-device clobbering.
   - List endpoints enforce explicit column projections (no `select("*")`) and strict page bounds (`1..100`).

3. **Dynamic Curriculum Integrity (`src/lib/neet/curriculum-schemas.ts`, `src/lib/neet/curriculum.functions.ts`)**
   - All CMS writes validate strictly with Zod schemas, reject unsafe URL protocols (`javascript:`, `data:`, `vbscript:`), enforce rubric criterion weights summing to `1.0 ± 0.01`, require optimal scenario options (`score === 1`), and run `detectCompetencyCycles` to keep prerequisite graphs acyclic.
   - Draft courses, lessons, labs, and scenarios are hidden from `anon` and `learner` roles.

4. **HTTP Transport, CSRF & Telemetry (`src/start.ts`, `src/lib/neet/logger.ts`, `src/lib/neet/rate-limit.server.ts`)**
   - TanStack Start CSRF middleware enabled globally alongside security headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, Report-Only CSP, HSTS on HTTPS, `Cache-Control: private, no-store` on authenticated/mutating endpoints).
   - `X-Request-Id` correlation on every response and structured log line.
   - Automatic recursive log redaction strips tokens, cookies, passwords, emails, raw snapshots, and learner notes.
   - Sliding-window rate limiting guards auth, sync, account writes, exports, search, and admin/CMS mutations.

## Production Launch Checklist

- [ ] Provision `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` in production secrets.
- [ ] Apply `docs/database/SUPABASE_SCHEMA_BLUEPRINT.sql` via Lovable Cloud / Supabase SQL Editor.
- [ ] Run `docs/database/rls_pgtap_tests.sql` against staging PostgreSQL and confirm 10/10 assertions pass.
- [ ] Set `ADMIN_EMAILS` (or assign initial admin via `user_roles`) so production has a verified administrator.
- [ ] Decide whether to start blank (`NEET_SKIP_DEFAULT_CURRICULUM_SEED=1`) or keep starter seed courses.
- [ ] Verify `/health` reports `status: "healthy"`, `authMode: "supabase"`, `supabaseReadiness: "connected"`.
- [ ] Confirm `CSP_REPORT_ONLY` violation reports are clean in staging before enforcing blocking CSP.
- [ ] Confirm CI passes (`format`, `typecheck`, `lint`, `test`, `validate:pack`, `import:course --dry-run`, `build`).
