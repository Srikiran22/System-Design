# Access Control Matrix (RBAC & Ownership)

All server functions derive caller identity strictly from verified server-side credentials (`Supabase getClaims()` in production; HMAC-SHA256 `neet_dev_session` in local dev only). Client-supplied user IDs are ignored for ownership scoping.

## Roles

| Role | Precedence | Source of Truth | Capabilities |
| --- | --- | --- | --- |
| `anon` | — | Unauthenticated | Read published courses, lessons, labs, scenarios, capstones, competencies, role profiles, knowledge pack, and redacted `/health` |
| `learner` | 0 | Default authenticated | Own profile, goals (max 3), progress events, self-assessed/automated-check evidence, cross-device snapshots, dossier export |
| `reviewer` | 1 | `user_roles` or JWT `app_metadata.role` | All `learner` capabilities + inspect & independently verify other learners' evidence (`recordReviewerVerification`) |
| `author` | 2 | `user_roles` or JWT `app_metadata.role` | All `reviewer` capabilities + view drafts + create/update/publish/delete courses, modules, lessons, competencies, labs, scenarios, capstones, role profiles + JSON bundle import/export |
| `admin` | 3 | `ADMIN_EMAILS`, `user_roles`, or JWT `app_metadata.role` | All `author` capabilities + manage user roles (`listUserRoles`, `setUserRole`), view audit logs (`listAuditLogs`), view redacted operational metrics (`getOperationalMetrics`) |

## Endpoint Authorization Matrix

| Server Function / Endpoint | Minimum Role | Ownership / Scope Check | Rate Limit Bucket | Audit Logged |
| --- | --- | --- | --- | --- |
| `listCourses`, `getCourse`, `getLesson`, `listLabs`, `listScenarios`, `getActiveCapstone`, `listCompetencies`, `listRoleProfiles` | `anon` | Drafts hidden unless verified `author`+ requests `includeDrafts: true` | — | No |
| `searchArticles` | `anon` | Public read-only | `search` (120/min) | No |
| `localSignUp`, `localSignIn`, `localUpdatePassword` | `anon` / dev-only | Local dev only (`NODE_ENV !== "production"` & no Supabase) | `auth` (15/15m) | Auth outcome |
| `getMe`, `getLearnerSnapshotFn`, `listProgressEventsPage`, `listLearnerEvidencePage`, `getAuthenticatedDiagnostics`, `getMyRole` | `learner` | Strictly scoped to `context.userId` | — | No |
| `signCommitment`, `addGoal`, `removeGoal` | `learner` | Strictly scoped to `context.userId` | `write` (40/min) | No |
| `recordEvents` | `learner` | Strictly scoped to `context.userId`; server strips `reviewer-verified` / `rubric-evaluated` tiers; optimistic concurrency on snapshot `version` | `sync` (60/min) | No |
| `exportDossier` | `learner` | Strictly scoped to `context.userId` | `export` (10/5m) | No |
| `recordReviewerVerification` | `reviewer` | Non-admin reviewers cannot verify their own evidence (`targetUserId !== context.userId`) | `admin` (120/min) | Yes |
| `upsertCourse`, `setCourseStatus`, `deleteCourse`, `upsertModule`, `deleteModule`, `reorderModules`, `upsertLesson`, `deleteLesson`, `upsertCompetency`, `deleteCompetency`, `upsertLab`, `deleteLab`, `upsertScenario`, `deleteScenario`, `upsertCapstone`, `upsertRoleProfile`, `deleteRoleProfile`, `importCourseBundle`, `exportCourseBundle` | `author` | Server-side role middleware + Zod schema + DAG cycle check + rubric weight-sum check | `admin` (120/min) | Yes |
| `claimLocalAdmin` | `learner` (local dev only) | Atomic one-time claim only when zero admins exist; disabled in production/Supabase | — | Yes |
| `listUserRoles`, `setUserRole`, `listAuditLogs`, `getOperationalMetrics` | `admin` | Server-side `requireAdmin` middleware | `admin` (120/min) | Yes |
