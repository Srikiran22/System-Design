# NEET — Systems Thinking, System Design & Engineering

NEET is a free-to-access, self-directed learning platform for understanding systems, designing them, and producing defensible engineering work. It combines a guided curriculum, design exercises, practical labs, engineering scenarios, a capstone, and a source-backed reference library.

The platform supports learning and portfolio development. Its tailored competency framework is **not** a professional accreditation or certification, and it does not replace qualified engineering judgment.

## How learners move through the site

The home page introduces four learning activities:

1. **Understand** — establish concepts, terminology, and mental models.
2. **Learn** — follow a course and its ordered lessons.
3. **Practise** — answer design prompts and test trade-offs.
4. **Build** — complete labs, scenarios, and portfolio artifacts.

The separate **Proceed Scale** describes the evidence a learner has demonstrated:

- **Search** — frame useful questions and find credible sources.
- **Know** — explain a concept and maintain a working mental model.
- **Adapt** — apply it when assumptions or constraints change.
- **Proceed** — make, build, and defend an engineering decision.

These models serve different purposes: the first organizes the learner journey; the second describes demonstrated competency.

The curriculum is organized into three disciplines: **Systems Thinking**, **System Design**, and **Engineering**. Sixteen tailored competencies form a prerequisite-aware graph and are cross-referenced to INCOSE SECF 2nd Edition and other engineering frameworks. This is an instructional crosswalk, not a claim that NEET reproduces the full INCOSE framework or grants certification.

## Site map

The main navigation exposes Courses, Library, Exercises, Projects, and Progress. Research transparency and methodology pages are available through the footer and contextual links.

| Area | Route | Purpose | Access |
| --- | --- | --- | --- |
| Home | `/` | Start here, resume learning, and see the four learning activities | Public |
| Course catalogue | `/paths` | Browse courses by discipline | Public |
| Course detail | `/paths/:slug` | Review outcomes, roadmap, skills, and target artifact | Public |
| Lesson | `/learn/:path/:lesson` | Read lesson material, complete checks, and record learning progress | Sign-in required |
| Design exercises | `/exercises` | Browse searchable, competency-mapped practice prompts | Public |
| Projects | `/labs` | Work through labs, engineering scenarios, and the capstone | Public overview; progress is account-scoped |
| Knowledge library | `/library` | Search and browse the research-backed article collection | Public |
| Article | `/library/:slug` | Read a volume, its explicit citations, and separately labelled related reading | Public |
| Source register | `/sources` | Inspect source authority, provenance, freshness, and limitations | Public |
| Research coverage | `/coverage` | Review domain coverage, extraction audit status, and known gaps | Public |
| Method | `/method` | Understand the Proceed Scale and its evidence model | Public |
| Careers | `/careers` | Explore engineering roles, competency mappings, and portfolio evidence | Public |
| Learner dashboard | `/me` | Review personal progress and evidence | Sign-in required |
| Calibration | `/me/calibration` | Calibrate competency self-assessment | Sign-in required |
| Authentication | `/auth`, `/reset-password` | Sign in, create an account, and reset credentials | Public |
| Service status | `/health` | View service and knowledge-pack status; signed-in users can view their own diagnostics | Public + authenticated diagnostics |

Lessons and personal learner pages are protected by the authenticated route group. Course discovery, the article library, exercises, project overviews, and research-transparency pages can be explored without signing in.

## How learning content is structured

### Curriculum and practice

The curriculum model is:

`Course → Competencies → Modules → Lessons → Lesson blocks`

- A **course** has a discipline, level, description, learning outcomes, and a target artifact.
- **Competencies** describe observable skills, prerequisites, relationships, and progression descriptors.
- **Modules** group lessons into an ordered learning sequence.
- **Lessons** contain structured blocks: headings, explanatory text, lists, callouts, code, flow descriptions, and pause-and-think checks.
- **Practice** is provided through design prompts, labs, engineering scenarios, and a multi-milestone capstone.
- **Evidence** is typed (quiz, explain, variant, lab, artifact, or review) and can be evaluated against versioned rubrics. Self-assessment is kept distinct from automated checks and reviewer verification.

Curriculum operations are exposed through `src/lib/neet/curriculum.functions.ts` and validated by `src/lib/neet/curriculum-schemas.ts`. The versioned catalogues in `src/lib/neet/content.ts`, `competencies.ts`, and `rubrics.ts` provide seeded/default curriculum data for local development and fallback paths. Published database content is preferred when the configured data source is available.

### Knowledge and research library

The research pack is a **reference collection**, not a second course hierarchy. Its canonical source is `content/pack/`.

The current metadata snapshot records:

| Collection | Count |
| --- | ---: |
| Markdown knowledge volumes | 120 |
| Registered source records | 320 |
| Source extraction/audit rows | 162 |
| Practice prompts | 73 |
| Research coverage domains | 50 |
| Career roles in the matrix | 28 |

The snapshot freshness date is `2026-11-05` (`content/pack/PACK_METADATA.json`). A source count does not mean every source was fully fetched: `DEEP_SCRAPE_AUDIT.csv` distinguishes full, targeted, partial, discovery-only, blocked, and unreachable extraction. Check the audit and the source's limitations before treating a record as reviewed evidence.

- `content/pack/` is canonical.
- `SS_content/` is the legacy mirror; `npm run validate:pack` checks for drift.
- `scripts/generate_source_enrichment.js` generates `src/lib/neet/sourceEnrichment.ts`; do not hand-edit this generated file.
- Explicit in-text citations and topic-matched related reading are intentionally shown separately.

### Free access, attribution, and licensing

The site is free to access, while lesson progress and personal learner pages currently require sign-in. **Free access is not the same as an open content license.** Third-party standards, papers, handbooks, images, and other references remain subject to their own publisher terms. The pack summarizes and links to normative standards rather than reproducing licensed normative text. A citation or source-register entry is not permission to copy or redistribute the source.

Before reusing third-party material, check its stated license and limitations. For Creative Commons material, preserve required attribution information (title, creator, source, and license) and follow any NonCommercial, ShareAlike, or NoDerivatives conditions. Do not label the whole knowledge pack as OER unless each component has the necessary public-domain status or open license.

## Application and data architecture

- **Frontend:** React 19, TypeScript, TanStack Start/Router, TanStack Query, Tailwind CSS v4, Radix UI.
- **Server functions:** `src/lib/neet/` exposes validated curriculum, library, authentication, account, and diagnostics operations. Zod schemas validate dynamic curriculum and account inputs.
- **Knowledge pack:** public read-only Supabase queries are handled by `library.functions.ts`; local development can read the SQLite mirror.
- **Dynamic curriculum:** course, module, lesson, lab, scenario, capstone, and role operations use the configured data source, with seed/default fallbacks for local use.
- **Identity and learner records:** Supabase Auth verifies production identity; owner-scoped PostgreSQL policies protect account data. `account.functions.ts` handles profiles, goals, progress events, learner evidence, snapshots, and dossier reads/writes.
- **Offline and cross-device progress:** `store.ts` keeps account-namespaced browser state. `sync-outbox.ts` persists pending events/evidence locally; `ProgressSync.tsx` sends them to the server and removes only the keys the server confirms. Browser storage is a cache/outbox, not the production source of truth.
- **Local development and tests:** `node:sqlite` uses `.data/system_design.sqlite` by default (WAL mode); the server-only `SQLITE_DB_PATH` variable can override it. Local development authentication is disabled in production and whenever Supabase is configured.
- **Managed schema:** Lovable manages `drizzle/` and `supabase/migrations/`. Follow `AGENTS.md`; request schema changes through the managed workflow instead of editing those files directly.

See [Architecture](./docs/ARCHITECTURE.md), [Database & Data Flow](./docs/DATABASE_AND_DATA_FLOW.md), [Competency & Assessment](./docs/COMPETENCY_AND_ASSESSMENT.md), [Content Governance](./docs/CONTENT_GOVERNANCE.md), and [the ADR log](./docs/ADR.md) for detailed contracts.

## Accessibility and learning design

The shared layout includes a skip-to-content link and labelled primary/footer navigation. Lesson and article pages use structured headings and contextual navigation. The accessibility target is WCAG 2.2 AA, but the presence of these patterns is **not** a conformance claim; keyboard, screen-reader, mobile, contrast, and zoom testing still need to cover the full learner journeys.

Content design should make learning objectives visible, sequence tasks against prerequisites, provide practice and specific feedback, and make revision/enrichment possible. The research basis includes the [AERO Mastery Learning Practice Guide](https://www.edresearch.edu.au/guides-resources/practice-guides/mastery-learning-practice-guide-full-publication), [CAST UDL Guidelines 3.0](https://udlguidelines.cast.org/more/about-guidelines-3-0), and [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/). The site information architecture is informed by the [University of Arkansas Information Architecture guide](https://webfirst.uark.edu/site-toolkit/information-architecture.php) and the course-outline concepts in [Open edX documentation](https://docs.openedx.org/en/latest/educators/concepts/open_edx_platform/about_course_outline.html).

## Developer setup

CI uses Node 22 and npm; **npm with `package-lock.json` is the canonical toolchain** (see ADR-005). The repository still contains an older Bun lockfile/configuration; its reconciliation is tracked in [issue #6](https://github.com/Srikiran22/System-Design/issues/6). Use npm until that decision is resolved.

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Build production client and server bundles |
| `npm run smoke` | Smoke-check the home page, `/health`, and `/paths` over HTTP |
| `npm test` | Run Vitest unit and security regression tests |
| `npm run typecheck` | Run the TypeScript compiler |
| `npm run lint` | Run ESLint |
| `npx prettier --check src scripts` | Check formatting for source and scripts |
| `npm run validate:pack` | Verify source URLs, citation integrity, audit counts, and canonical/mirror parity |
| `npm run generate:sources` | Regenerate the source enrichment module from `content/pack/` |
| `npm run seed:sqlite` | Rebuild local `.data/system_design.sqlite` (default path; override with server-only `SQLITE_DB_PATH`) |
| `npm run import:course -- --file docs/curriculum/COURSE_BUNDLE_TEMPLATE.json --dry-run` | Validate the sample course bundle without importing it |

When the canonical pack changes, follow [Content Governance](./docs/CONTENT_GOVERNANCE.md): update `content/pack/`, regenerate source enrichment, validate the pack and mirror, then refresh local/cloud data through the approved import workflow.

## Verification boundaries and open work

The current CI suite checks formatting, types, lint, unit/security tests, pack and course-bundle integrity, the production build, and basic HTTP smoke routes. The smoke script starts the Node-backed Vite development server; it does **not** prove that the built Nitro deployment runs in the actual hosting environment.

Two important verification tasks remain tracked:
- [Issue #7](https://github.com/Srikiran22/System-Design/issues/7): verify the real Nitro/hosting runtime and live Supabase schema in staging.
- [Issue #8](https://github.com/Srikiran22/System-Design/issues/8): add browser-level end-to-end tests for navigation, sign-in, lesson progress, account isolation, offline sync, and author/admin access.

A green build and unit suite are necessary checks, not proof of production readiness or full accessibility conformance.
