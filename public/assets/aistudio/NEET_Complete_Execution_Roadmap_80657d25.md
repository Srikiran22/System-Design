# NEET — Complete Project Execution Roadmap

**Roadmap date:** 25 November 2026  
**Repository reviewed:** `System-Design-main/` from `System-Design.zip`  
**Purpose:** A followable product, engineering, curriculum, assessment, research and release plan grounded in the supplied repository and current external sources.

---

## 0. How to use this roadmap

This plan is sequenced by dependency. Complete each stage's exit criteria before moving to the next stage. Do not treat the week numbers as deadlines: they are an indicative 16-week solo-developer schedule, assuming part-time work and reasonable access to the Lovable schema owner and a small number of assessment reviewers.

There are two kinds of recommendations:

- **Repository fact:** directly observed in the supplied archive or its `AGENTS.md` instructions.
- **Roadmap recommendation:** a proposed future decision, not something already implemented or approved.

### Working assumptions

1. NEET remains a broad **Systems Engineering Practice Platform**. Software/system architecture is a specialization, not the entire product.
2. The primary learner is a student, early-career engineer, or engineer transitioning into systems engineering. This segment still needs validation with actual learners.
3. Supabase/Postgres becomes the canonical source of truth for signed-in learner evidence and snapshots. Browser storage remains the offline outbox/cache. Local SQLite remains development/test infrastructure only unless a later design explicitly changes this.
4. The existing React, TanStack Start, TypeScript and Supabase stack is retained. A framework rewrite is not justified by the current evidence.
5. The existing 16-competency model remains the product's tailored model and is mapped to the INCOSE framework. It is not renamed as the INCOSE framework.
6. The six-milestone Dependable Regional Emergency Dispatch capstone remains the central longitudinal project.
7. The platform must not claim accreditation, formal INCOSE certification, or independent verification unless the required authority and review process actually exist.

### Important repository constraint

`AGENTS.md` says Lovable manages database schema, generated files, AI gateway configuration, connectors and secrets. It explicitly says not to manually edit `supabase/migrations/` or `drizzle/`; schema changes must be requested through Lovable. Respect this boundary. Do not directly edit generated files. Also avoid rewriting published Git history because the repository is connected to Lovable.

---

# 1. Product destination

## 1.1 Product thesis

**NEET helps learners develop, demonstrate and maintain systems-engineering judgment through competency-led learning, applied engineering problems, reviewable artifacts, transparent assessment and evidence-backed progression.**

The core learning loop is:

`Orient → Diagnose → Learn → Apply → Produce → Review → Revise → Demonstrate → Continue`

The product should answer five questions for every learner:

1. What capability am I trying to develop?
2. Why does that capability matter for my target role or system?
3. What should I learn or practise next?
4. What work demonstrates that I can do it?
5. Who or what evaluated that work, using which criteria, and what should I improve?

## 1.2 Product goals

- Give each learner a transparent, explainable competency profile.
- Guide learners from foundational concepts to applied, lifecycle-oriented engineering work.
- Preserve artifacts, assumptions, constraints, trade-offs, feedback and revisions.
- Distinguish learner self-assessment, deterministic automated checks, rubric feedback and independent reviewer decisions.
- Persist learner evidence reliably across devices and sessions.
- Maintain trustworthy content provenance and current standards/framework mappings.
- Measure demonstrated capability, not just time on site or lesson completion.

## 1.3 Non-goals for the first release-hardening cycle

Do not build these until the learning and evidence loop works:

- Public leaderboards or gamification systems.
- A social network, job marketplace or employer recruitment portal.
- A paid mentor marketplace.
- Automatic AI grading as the sole assessment authority.
- Formal certifications or accreditation claims.
- More courses/labs simply to increase catalogue size.
- Microservices, Kubernetes or a database migration for novelty.
- A rewrite of the TanStack/Supabase architecture.

## 1.4 Positioning boundary

The repository's content is broader than software system-design interview preparation. It includes systems thinking, requirements, lifecycle engineering, architecture, trade studies, dependability, safety, assurance, MBSE and verification. Keep this as the main product identity. A software architecture/distributed-systems track can be offered within the wider curriculum, with its own learning outcomes and role profile.

---

# 2. Priority register: what must be fixed first

| Priority | Workstream | Why it comes first | Release rule |
|---|---|---|---|
| P0 | Cloud persistence and evidence synchronization | The production path currently drops evidence/snapshots while acknowledging sync | No evidence-backed cross-device portfolio claim until fixed |
| P0 | Assessment/verification truthfulness | Learner-entered ratings are presented as rubric-evaluated evidence | No higher verification tier from self-rating |
| P1 | Production runtime and health checks | Current health/diagnostic paths depend on local SQLite despite Cloudflare being the documented/default target | No production sign-off until target-runtime tests pass |
| P1 | Identity and schema edge cases | Signature seed can exceed PostgreSQL signed INT4 range | Boundary and account integration tests required |
| P1 | Lab-specific rubrics and evidence provenance | Eight labs currently use the same generic rubric; only two have dedicated rubrics | All ten labs need observable, domain-specific criteria before full assessment launch |
| P1 | Competency crosswalk and learning-path mapping | The product's tailored competency model needs traceability to authoritative frameworks | No claim that the 16 are the complete INCOSE model |
| P2 | Content governance and freshness | Current validator allows some citation/mirror drift as warnings | Content integrity must become a CI gate |
| P2 | Client performance and accessibility | Large generated source data may inflate citation-rendering client bundles | Measure bundle impact; target WCAG 2.2 AA for core journeys |
| P3 | Mentor, cohort and credentials | Valuable only after learner evidence is durable and assessment is credible | Defer until pilot evidence supports demand |

---

# 3. Stage 0 — Establish a repeatable engineering baseline

**Indicative duration:** Week 0–1  
**Priority:** P0 foundation  
**Goal:** make the repository safe to change and establish a reproducible baseline before fixing behavior.

## Work to complete

- [ ] Create a clean working branch. Do not rewrite already-published history.
- [ ] Preserve the original archive/branch as a rollback point.
- [ ] Read `AGENTS.md` and list which files are manually maintained, Lovable-managed or generated.
- [ ] Decide which package manager is canonical. The repository contains both `package-lock.json` and `bun.lock`; avoid silently maintaining two competing dependency graphs.
- [ ] Pin the intended Node/Bun versions in project setup documentation and CI.
- [ ] Install dependencies using the canonical lockfile and record exact install/build failures.
- [ ] Run the existing unit tests, lint, type-check (if configured), content validator, and production build. Record a baseline report.
- [ ] Repair command/runtime mismatch in `validate:pack` and `seed:sqlite`. The default package scripts invoke `.ts` files with `node`; the reviewed Node v22.16 environment required `--experimental-strip-types` for the validator. Select the repository's supported runtime and make the scripts match it.
- [ ] Add a lightweight CI workflow that runs the current checks before any feature work.
- [ ] Add/refresh architecture docs: current deployment target, data ownership, auth boundary, content ingestion path, and local-development model.
- [ ] Create an ADR log. Record decisions such as canonical learner data store, sync semantics, reviewer model and primary target segment.

## Deliverables

- A reproducible developer setup.
- A CI baseline report.
- A concise architecture/data-flow diagram.
- A decision log and P0 issue list.

## Exit criteria

- A new checkout can install dependencies and run the agreed test/build commands.
- CI runs the same commands.
- Every generated/Lovable-managed file is identified.
- There is one documented canonical package manager and runtime.

## Learn while doing this

- [TanStack Start: Production Checklist](https://tanstack.com/start/latest/docs/framework/react/guide/production-checklist)
- [TanStack Start: Execution Model](https://tanstack.com/start/latest/docs/framework/react/guide/execution-model)
- [Bun documentation](https://bun.sh/docs) if Bun is selected; otherwise use the official Node/npm documentation for the chosen runtime.

---

# 4. Stage 1 — Fix cloud persistence and the sync contract

**Indicative duration:** Weeks 1–3  
**Priority:** P0 release blocker  
**Goal:** make the cloud portfolio durable and honest.

## Current repository behavior

The reviewed flow sends events, evidence and an optional learner snapshot from `ProgressSync.tsx` to `account.functions.ts`. The local SQLite branch persists the three payload types. The Supabase branch currently writes progress events only. The client acknowledges evidence and snapshots after a successful response, even though those records were not committed. The Supabase snapshot read path returns an empty snapshot/evidence response.

This can silently discard locally queued learner evidence and prevents reliable cross-device restore.

## Recommended design

Use **cloud-first canonical learner records**:

- Supabase/Postgres is the source of truth for signed-in learner events, evidence, snapshots and review records.
- Browser storage remains a local cache and durable pending-operation outbox.
- Local SQLite is only for development/test unless the architecture is deliberately redesigned later.
- Delivery is at-least-once; database operations are idempotent. Do not promise literal exactly-once network delivery.
- The server acknowledges individual committed records, not merely a whole request that returned HTTP success.

## Implementation sequence

### 1A. Define the data contract

- [ ] Define the canonical event record and its identity.
- [ ] Define the evidence record: learner, competency, activity, evidence type, artifact reference, explanation, assumptions, constraints, timestamps, rubric/version, assessment method and verification status.
- [ ] Define snapshot versioning and the relationship between event history and the derived learner snapshot.
- [ ] Define stable idempotency keys created at the time of the learner action, not at send time.
- [ ] Define the sync response with explicit accepted, rejected and retryable IDs/keys.
- [ ] Define rules for duplicate submissions, stale writes, partial batches, conflict handling and maximum payload size.
- [ ] Decide whether snapshot and associated evidence writes must be atomic. Use a database transaction/server-side database function for operations that must commit together.

### 1B. Get the schema approved through the schema owner

- [ ] Ask Lovable/schema owner to create the missing cloud persistence structures for learner evidence and snapshots, plus review/audit records if included in this release.
- [ ] Add owner-scoped RLS policies and appropriate indexes/unique constraints.
- [ ] Add unique constraints on idempotency keys within the correct user/record scope.
- [ ] Add foreign keys and check constraints for valid evidence/status values.
- [ ] Regenerate typed database interfaces from the actual deployed schema.
- [ ] Verify migration order and rollback/recovery before using real learner data.

**Do not hand-edit `supabase/migrations/` or `drizzle/` if the project's `AGENTS.md` remains in force.** Request schema changes through Lovable and then update the application to the approved contract.

### 1C. Repair the server write path

- [ ] Update `recordEvents` to persist progress events, evidence and snapshot data in Supabase.
- [ ] Validate the incoming schema server-side; never trust arbitrary client-supplied user IDs or verification tiers.
- [ ] Derive the user identity from verified server auth context.
- [ ] Make repeated requests with the same idempotency key safe.
- [ ] Return the exact IDs/keys committed and rejected.
- [ ] Ensure partial failure is explicit; do not return a generic success if evidence did not persist.
- [ ] Enforce payload limits and reject malformed records.

### 1D. Repair the client outbox

- [ ] Persist a pending event/evidence item locally before network transmission.
- [ ] Keep the same idempotency key across retries.
- [ ] Acknowledge only the exact IDs/keys the server confirms committed.
- [ ] Keep unacknowledged records after timeout, connection loss, 5xx or partial failure.
- [ ] Use bounded exponential backoff with jitter and a clear maximum retry policy.
- [ ] Prevent a slower older request from overwriting a newer state; use server version/sequence checks.
- [ ] Show truthful states: pending, syncing, synced, partially synced, offline, failed/needs attention.

### 1E. Restore and export from canonical cloud data

- [ ] Implement `getLearnerSnapshotFn` for Supabase mode.
- [ ] Hydrate progress, evidence and snapshot from the cloud on a fresh browser/profile.
- [ ] Define merge behavior when local pending changes coexist with server state.
- [ ] Update account/profile views to read canonical cloud evidence.
- [ ] Update dossier export to use the same cloud records shown in the portfolio.
- [ ] Make deletion/export/privacy behavior explicit.

## Required tests

- [ ] Same idempotency key submitted twice produces one logical evidence record.
- [ ] Server commits but response times out: retry does not duplicate the record.
- [ ] Partial batch returns accepted/rejected IDs accurately.
- [ ] Browser does not remove pending evidence if the server did not confirm it.
- [ ] Account A cannot read or modify Account B records.
- [ ] Evidence and snapshot restore in a brand-new browser session.
- [ ] Export equals the canonical data shown in the cloud portfolio.
- [ ] Sign-out/sign-in preserves the expected learner record state.

## Exit criteria

A signed-in learner submits one lab artifact; the server confirms its persistent record; the browser acknowledges that specific record; after signing in on a separate browser profile, the learner sees the same artifact, evidence metadata and progress; export includes it; duplicate and retry tests pass; RLS blocks another account.

---

# 5. Stage 2 — Production runtime, security and operational correctness

**Indicative duration:** Weeks 4–5  
**Priority:** P1  
**Goal:** make the app run correctly in the actual hosting runtime, not only in local development.

## Work to complete

### 2A. Confirm the target runtime

- [ ] Confirm whether the production target is Cloudflare Workers/Pages, another Nitro adapter or a different host.
- [ ] Pin the deployment adapter and compatibility date/flags.
- [ ] Create a preview deployment that runs the real production runtime.
- [ ] Build a runtime capability checklist for SQLite, filesystem, crypto, environment variables and background work.

The current code's health paths dynamically load local SQLite functions even in Supabase mode. Cloudflare's Node.js compatibility documentation describes `node:sqlite` as a compatibility stub, not a general replacement for a local Node SQLite database. Cloudflare's own storage options (such as D1 or Durable Objects SQLite) are different products with different APIs. Do not assume enabling `nodejs_compat` makes a local-file SQLite application portable to Workers.

### 2B. Separate health/readiness paths

- [ ] Make liveness a minimal process/runtime response with no database dependency.
- [ ] Make readiness check the selected production dependency (e.g. Supabase/Postgres connectivity) without loading local SQLite.
- [ ] Keep local SQLite diagnostics behind an explicit local-development path.
- [ ] Do not expose private account counts or diagnostics through a public health endpoint.
- [ ] Test each health path on the actual deployment runtime.

### 2C. Fix numeric and data-contract boundaries

- [ ] Fix `signature_seed` so its generated values fit PostgreSQL signed INT4 if that is the selected column type, or migrate to a suitable wider type through the schema owner.
- [ ] Add boundary tests for minimum, maximum and out-of-range values.
- [ ] Add validation for all numeric API inputs, enum values and timestamp formats.
- [ ] Review all client-supplied score/status fields and make sensitive state server-authoritative.

### 2D. Harden authorization

- [ ] Verify auth context in server functions that read or mutate private data.
- [ ] Review RLS for every account-owned table.
- [ ] Separate learner and reviewer/admin permissions.
- [ ] Test unauthenticated, normal learner, reviewer and admin roles.
- [ ] Confirm service-role credentials never enter browser bundles.
- [ ] Apply rate limits to expensive/abusable submission endpoints.

### 2E. Observability and backup

- [ ] Log sync attempts, accepted/rejected counts, idempotency conflicts, failures and latency.
- [ ] Never log secrets, tokens or private artifact payloads.
- [ ] Add error reporting with request correlation IDs.
- [ ] Establish Postgres backup and restore procedures.
- [ ] Run a restore drill and record recovery evidence.

## Test and exit criteria

- Target-runtime preview deployment passes smoke tests.
- No production route imports local SQLite accidentally.
- Liveness and readiness semantics are separate.
- User A/B isolation tests pass.
- Numeric boundary tests pass.
- Backup restore is demonstrated, not just configured.

## Learn while doing this

- [TanStack Start middleware](https://tanstack.com/start/latest/docs/framework/react/guide/middleware)
- [TanStack Start server functions](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions)
- [Supabase SSR client setup](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Cloudflare Workers Node.js compatibility](https://developers.cloudflare.com/workers/runtime-apis/nodejs/)
- [Cloudflare compatibility flags](https://developers.cloudflare.com/workers/configuration/compatibility-flags/)
- [Drizzle migrations](https://orm.drizzle.team/docs/migrations)

The Supabase SSR guide was updated on 18 November 2026 when checked. Follow the framework's current server/browser client split and its current auth guidance rather than copying older examples blindly.

---

# 6. Stage 3 — Make assessment trustworthy

**Indicative duration:** Weeks 6–8  
**Priority:** P0/P1  
**Goal:** ensure the platform never claims stronger evidence than its assessment process supports.

## 3A. Separate the assessment concepts

Model these as separate records or explicit fields:

1. **Self-assessment:** the learner's own confidence or rating.
2. **Deterministic automated check:** a reproducible check such as a calculation, schema validation, simulation condition or multiple-choice answer.
3. **Rubric feedback:** criterion-level assessment, with the method and evaluator identified. A self-entered score is not independent rubric assessment.
4. **Human review:** a peer, mentor or qualified reviewer records a decision with identity, permissions, date, feedback and rubric version.

Recommended review states:

`draft → submitted → under_review → needs_revision / accepted / not_met`

The learner must not be able to create `reviewer_verified` by submitting a score or choosing a UI option. The server creates reviewer status only after an authorized review action.

AI may help generate feedback suggestions or point to missing evidence, but its output must be labelled as assistance and must not independently award a professional verification claim.

## 3B. Create a distinct rubric for all ten labs

Each rubric must include:

- Competency and intended proficiency level.
- Observable criteria tied to the artifact.
- Descriptors for below expectations, developing, meets expectations and strong performance.
- Evidence required to score each criterion.
- Weight and pass threshold, with rationale.
- Typical failure modes and examples.
- Revision guidance.
- Version and change history.

### Proposed rubric coverage

| Existing lab | What the rubric should assess |
|---|---|
| Map a feedback loop | System boundary, stock/flow distinction, causal polarity, reinforcing/balancing loop, delay and intervention reasoning |
| Estimate a URL shortener | Assumptions, arithmetic, average/peak load, storage, bottleneck identification and sensitivity to growth |
| Add a cache, then break it | Cache-aside correctness, staleness/failure scenario, measurement, mitigation and consistency/cost trade-off |
| Read a repo you did not write | Reproducibility, user-action trace, route/service/data-path accuracy, architecture map and evidence from source |
| Ship something in 48 hours | Problem clarity, thin vertical slice, tests, deployment, user feedback and response to a defect |
| Raft consensus simulation | Terms, election safety, quorum rule, log replication, partition behavior and recovery reasoning |
| Construct a GSN assurance case | Claims/context/strategy/evidence structure, argument completeness, evidence quality and invalidation/defeat conditions |
| MCDA trade study | Decision criteria, swing weights, normalization, alternative scoring, sensitivity/tipping point and defensible recommendation |
| STPA hazard analysis | Losses, hazards, control structure, all four UCA categories, safety constraints and causal scenarios |
| Markov availability model | State definition, transition-rate matrix, assumptions, steady-state solution, availability and common-cause impact |

Do not use a generic “clarity, completeness, correctness” rubric as the entire assessment for all ten activities. General presentation criteria can be shared, but the engineering criteria must be specific to the work product.

## 3C. Version the assessment engine

- [ ] Add rubric ID/version to every submission.
- [ ] Preserve the exact prompt/criteria shown to the learner at submission time.
- [ ] Preserve immutable attempt history; a resubmission creates a new revision/attempt.
- [ ] Store each criterion result and its evidence/reviewer comment.
- [ ] Do not silently recalculate historical attempts after a rubric change.
- [ ] Create an explicit mapping between rubric criteria and NEET competencies.
- [ ] Add a feedback-response criterion when a learner revises work.

## 3D. Calibrate the rubrics

- [ ] Select representative lab submissions at different quality levels.
- [ ] Ask two reviewers to score independently.
- [ ] Compare disagreement by criterion.
- [ ] Rewrite ambiguous descriptors.
- [ ] Repeat until reviewers can explain why a score was assigned.
- [ ] Document known limits of the rubric.

Do not claim a reliable proficiency measure from a rubric that has never been tried on real learner work.

## Exit criteria

- All ten labs have specific rubrics.
- Learner self-rating cannot upgrade evidence to a reviewed tier.
- Each assessment is versioned and traceable.
- A learner can see the criterion-level feedback and submit a revision.
- Two reviewers can apply the rubric and explain the resulting decision.

## Learn while doing this

- INCOSE [Competency Framework](https://www.incose.org/resources-publications/publish-with-incose/competency-framework/)
- Wiley [Systems Engineering Competency Assessment Guide](https://onlinelibrary.wiley.com/doi/book/10.1002/9781119862581)
- ASEE [Active Learning Techniques for MBSE](https://peer.asee.org/leveraging-active-learning-techniques-to-teach-model-based-systems-engineering.pdf)
- WPI [Systems Engineering Awareness Digital Badge Pilot](https://doi.org/10.18260/1-2-60.660.1149-55001)

---

# 7. Stage 4 — Build a traceable competency and learning model

**Indicative duration:** Weeks 9–10  
**Priority:** P1  
**Goal:** connect content, assessments, roles and proficiency into one coherent learning system.

## 4A. Preserve the 16 NEET competencies

The current internal model has these 16 IDs:

- `st-stocks`
- `st-loops`
- `st-leverage`
- `st-boundaries`
- `sd-requirements`
- `sd-data`
- `sd-scale`
- `sd-reliability`
- `sd-consensus`
- `sd-trade-studies`
- `en-reading`
- `en-testing`
- `en-shipping`
- `en-assurance-gsn`
- `en-safety-stpa`
- `en-dependability-markov`

Keep these as NEET's instructional structure if they fit the learner experience. Don't force a one-to-one mapping to the INCOSE framework.

## 4B. Build the INCOSE crosswalk

INCOSE's second edition defines 37 systems-engineering competencies and explicitly expects organizations to tailor its generic framework to their own application/domain. The official competency framework identifies knowledge, skills, abilities and behaviors. The assessment guide describes the five proficiency levels: Awareness, Supervised Practitioner, Practitioner, Lead Practitioner and Expert.

Create a maintainable crosswalk table:

| Field | Purpose |
|---|---|
| `neet_competency_id` | Existing NEET identifier |
| `incose_competency_id` | Official competency identifier |
| `mapping_type` | Direct, partial, supporting or no mapping |
| `rationale` | Why the mapping is valid |
| `indicator_refs` | Relevant observable indicators |
| `source_edition` | Framework edition/version |
| `reviewed_by` / `reviewed_at` | Provenance |

One NEET competency may map to multiple INCOSE competencies and vice versa. Preserve unmapped areas and explain why rather than inventing correspondence.

## 4C. Map all learning content to outcomes

For every lesson, scenario, lab and capstone milestone, record:

- primary competency;
- supporting competencies;
- intended proficiency;
- prerequisites;
- required output/artifact;
- assessment method;
- authoritative reference(s);
- follow-up activity for a failed/weak outcome.

Run a gap report:

- competencies with no activity;
- competencies with only passive reading;
- competencies with no artifact-based assessment;
- competencies whose only evidence is self-assessment;
- learning units without a clear outcome;
- content with no authoritative source or no review date.

## 4D. Add a small, explicit set of target roles

Start with no more than three provisional role profiles, validate them with learners and practitioners, and revise later. Example hypotheses:

1. Early-career Systems Engineer.
2. Software/Systems Architect.
3. Safety, Reliability or Assurance Engineer.

Each role profile should declare required competencies and target proficiency levels. The learner sees the gap between intended role requirements and demonstrated evidence—not an opaque recommendation score.

## 4E. Replace completion-only recommendations

The next activity recommendation should consider:

- learner's target role;
- current evidence and evidence quality;
- prerequisite dependencies;
- repeated weaknesses or failed criteria;
- confidence vs demonstrated performance;
- prior feedback still awaiting a revision.

Begin with a deterministic rules-based recommendation model. Add more advanced ranking only after enough real learner data exists.

## Exit criteria

- Every one of the 16 NEET competencies has an explained crosswalk status.
- Every current learning unit is mapped to outcomes and assessment.
- Learner can see a reason for each recommended next activity.
- Role profiles are reviewed and labelled as provisional until validated.

## Learn while doing this

- [INCOSE Competency Framework](https://www.incose.org/resources-publications/publish-with-incose/competency-framework/)
- [SEBoK](https://sebokwiki.org/wiki/Main_Page)
- [INCOSE SE standards page](https://www.incose.org/about-systems-engineering/standards-policies/)
- [Systems Engineering Education Ecosystem paper](https://doi.org/10.1002/iis2.12998)

---

# 8. Stage 5 — Make the capstone the central product experience

**Indicative duration:** Weeks 11–12  
**Priority:** P1  
**Goal:** turn the existing six-milestone capstone into a single, connected engineering dossier.

## Existing project to preserve

**Dependable Regional Emergency Dispatch & Triage Service** — a mission-critical service design with a 3-zone dispatch scenario and 2,500 peak calls/hour in the first milestone prompt.

The six existing milestones already follow a strong lifecycle logic:

| Milestone | Existing focus | Required continuity |
|---|---|---|
| 1. Problem Framing, Mission Measures & System Boundary | Needs, stakeholders, boundary, mission measures | Baseline problem statement, operational context and stakeholder register |
| 2. Verifiable Requirements, Quality Attributes & SLOs | Requirements, load sizing, latency, SLI/SLO and V&V | Trace every requirement back to Milestone 1 stakeholder need |
| 3. Architecture Views, Data Contracts & MCDA Trade Study | Architecture viewpoints, interfaces, alternatives, ADRs and sensitivity | Allocate requirements to components and record why the design was chosen |
| 4. STPA Hazard Analysis & STRIDE Threat Model | Safety, unsafe control actions, threat model and constraints | Trace risks/constraints back into requirements and architecture |
| 5. Markov Availability Model & V&V Plan | Availability model, common-cause failures, tests and acceptance | Demonstrate how safety/reliability requirements will be verified |
| 6. Lifecycle Support, GSN Defense Memo & Invalidation Criteria | Assurance, sustainment, transition, residual risks and defense | Present the complete engineering argument and state invalidating assumptions |

## Improvements required

- [ ] Store a stable project ID and artifact version for the learner's capstone.
- [ ] Make later milestone submissions reference prior artifact IDs and versions.
- [ ] Add a traceability graph: stakeholder need → requirement → design decision → hazard/control → verification result → assurance claim.
- [ ] Require an explicit response to previous feedback at the next milestone.
- [ ] Store rejected alternatives and decision rationale, not just the selected architecture.
- [ ] Track assumptions, constraints, operational scenarios and residual risks as first-class items.
- [ ] Add a change-impact exercise: change one key assumption midway and ask the learner to identify affected requirements, architecture, risk, test cases and assurance claims.
- [ ] Keep provisional assessment language until a reviewer evaluates the dossier.
- [ ] Export the capstone as a coherent, versioned portfolio dossier.

## Define a common artifact package

Every milestone should produce:

1. **Artifact** — diagram, model, spreadsheet, report, calculation, code or test result.
2. **Decision record** — what was decided, alternatives, trade-offs and rationale.
3. **Assumptions and constraints** — what is known, estimated or outside scope.
4. **Traceability** — what earlier work and requirements this depends on.
5. **Self-reflection** — what the learner believes is strong/weak.
6. **Assessment** — automated check and/or reviewer decision, clearly separated.
7. **Revision history** — what changed after feedback and why.

## Add lightweight design reviews

Use review gates modelled on engineering design reviews, but label them as educational simulations rather than formal project certification:

- Problem/mission review after M1.
- Requirements review after M2.
- Architecture/trade review after M3.
- Safety/security review after M4.
- Verification/readiness review after M5.
- Final engineering defense after M6.

## Exit criteria

A learner can submit, revise and trace all six milestone artifacts; the final dossier shows where each claim came from, what alternatives were rejected, which requirements were verified and what risks remain.

## Learn while doing this

- NASA [Systems Engineering Handbook](https://www.nasa.gov/reference/systems-engineering-handbook/)
- NASA [Fundamentals of Systems Engineering](https://www.nasa.gov/reference/2-0-fundamentals-of-systems-engineering/)
- [ISO/IEC/IEEE 15288:2023](https://www.iso.org/standard/81702.html)
- [ISO/IEC/IEEE 29148:2018 — Requirements Engineering](https://standards.ieee.org/standard/29148-2018.html)
- [ISO/IEC/IEEE 42010:2022 — Architecture Description](https://www.iso.org/standard/74393.html) (verify catalogue status before teaching against a specific edition)

---

# 9. Stage 6 — Make content and standards governance reliable

**Indicative duration:** Week 13  
**Priority:** P1/P2  
**Goal:** turn the knowledge pack into a versioned, traceable and continuously checked source system.

## Existing content baseline

The archive contains:

- 119 canonical article Markdown files plus one import guide;
- 320 registered sources;
- 73 practice prompts;
- 28 role/competency rows;
- 50 deep-coverage rows;
- 28 research-coverage rows;
- 162 audit rows;
- 120 Markdown files in the `SS_content/` mirror, byte-for-byte matching the canonical pack.

The content validator currently passes when invoked through Node's type-stripping flag. However, the audit found that dangling citations and mirror drift can be warnings rather than CI-blocking errors, and the validator does not enforce expected count ranges.

## Work to complete

### 6A. Make validation enforce invariants

- [ ] Missing canonical files fail CI.
- [ ] Duplicate/invalid article IDs fail CI.
- [ ] Dangling citation IDs fail CI.
- [ ] Mirror drift fails CI if the mirror remains required.
- [ ] Required metadata omissions fail CI.
- [ ] Expected lower-bound counts are validated to catch accidental bulk deletion.
- [ ] Source URLs must be valid and classified; a syntactically valid URL is not automatically authoritative or live.
- [ ] Test validator behavior with fixtures containing intentional defects.

### 6B. Establish source metadata and review cadence

For each source, track:

- canonical title and publisher;
- canonical URL;
- source type (standard, official handbook, academic paper, practitioner source, vendor docs, community discussion);
- edition/version/publication date;
- status (current, superseded, withdrawn, discovery-only, partial extraction, blocked, stale);
- last checked date and next review date;
- articles/lessons/labs that depend on it;
- copyright/license and allowed use notes.

Schedule a quarterly review plus event-driven checks for important versioned references. A failed HTTP request should be classified carefully: a 403 or anti-bot block does not necessarily mean a source has disappeared.

### 6C. Use authoritative sources appropriately

Core references checked in this research:

| Source | Current/reference status checked | Use in NEET |
|---|---|---|
| INCOSE SE Competency Framework 2nd Edition | Official site describes 37 competencies and tailoring | Competency crosswalk and role/proficiency model |
| INCOSE Competency Assessment Guide | Five proficiency levels and evidence-oriented evaluation | Assessment indicators and reviewer guidance |
| SEBoK | Official site currently lists v2.14, released 18 May 2026 | Broad curriculum reference and source discovery |
| ISO/IEC/IEEE 15288 | 2023 edition is published; full system lifecycle | Lifecycle process map |
| ISO/IEC/IEEE 29148 | 2018 edition is listed by IEEE as requirements engineering standard | Requirement quality and verification methods |
| ISO/IEC/IEEE 24748-1 | 2024 edition is listed by INCOSE | Lifecycle management guidance |
| ISO/IEC/IEEE 42010 | 2022 edition is listed by INCOSE | Architecture description and viewpoints |
| NASA Systems Engineering Handbook | Revision 2 is an established applied reference | Practical systems engineering process and work products |
| OMG SysML v2 | SysML 2.0 formal specification published September 2025; final adoption announced July 2025 | Optional MBSE specialization, not a dependency for the whole platform |

Check the official catalogue when updating content. Avoid copying protected standards text into articles; summarize, teach application and link to authorized material.

### 6D. Remove unnecessary duplication and oversized client data

- [ ] Verify all consumers of `SS_content/` before removing or keeping the duplicate mirror.
- [ ] If the mirror is retained for import/deployment, document one canonical source and automatically regenerate/check parity.
- [ ] Keep `sourceEnrichment.ts` generated; do not edit it manually.
- [ ] Measure whether its ~932 KB generated metadata catalogue is entering client bundles through the Markdown citation renderer.
- [ ] Prefer server-side lookup or small per-article citation payloads if bundle analysis confirms unnecessary client shipping.
- [ ] Record route chunk sizes before and after changes.

## Exit criteria

The content gate fails for known integrity violations; all user-facing references have identifiable provenance/status; the source mirror has one documented owner; the citation UI does not ship a large unused metadata catalogue without a measured reason.

## Learn while doing this

- [SEBoK Release History](https://sebokwiki.org/wiki/Acknowledgements_and_Release_History)
- [INCOSE current standards](https://www.incose.org/about-systems-engineering/standards-policies/)
- [ISO standards catalogue](https://www.iso.org/standards.html)
- [OMG SysML 2.0 specification](https://www.omg.org/spec/SysML/2.0/About-SysML)

---

# 10. Stage 7 — Improve onboarding, pathways, accessibility and learner feedback

**Indicative duration:** Week 14  
**Priority:** P2  
**Goal:** reduce the time from account creation to the learner's first meaningful artifact.

## Learner flow to implement

1. **Choose intent:** broad systems engineering, software/system architecture, or specialist interest.
2. **Set context:** education/experience level and technical domain of interest; do not collect unnecessary personal details.
3. **Take a baseline diagnostic:** use a small number of scenarios mapped to competencies. Capture confidence separately from demonstrated answers.
4. **Show a gap map:** identify demonstrated strengths, uncertain areas and missing evidence.
5. **Generate a learning path:** lessons and prerequisites explain why they are recommended.
6. **Reach first artifact quickly:** the learner should produce something reviewable early, not complete a long content sequence first.
7. **Enter the capstone:** guide the learner into M1 and preserve work in the portfolio.
8. **Show next action:** make the next activity specific (revise criterion 2, complete a missing verification step, or study a prerequisite concept).

## UX work

- [ ] Make the difference between self-assessment and demonstrated competency visible throughout the app.
- [ ] Show why a competency level was assigned and which evidence supports it.
- [ ] Explain incomplete evidence rather than showing an unexplained progress percentage.
- [ ] Add clear empty, offline, pending, error and degraded/fallback states.
- [ ] Show prerequisite and dependency relationships in learning paths.
- [ ] Make capstone milestones and cross-links easy to navigate.
- [ ] Add a learner-facing evidence timeline and revision history.
- [ ] Add privacy controls: private by default; explicit sharing; revoke access; export/delete where supported.
- [ ] Audit keyboard navigation, focus order, screen reader labels, contrast, form errors, reduced motion and responsive layouts.
- [ ] Target WCAG 2.2 AA for core learning, submission, account and reviewer flows.

## Research with real learners

Before building expensive personalization:

- [ ] Interview 5–8 learners from the primary audience.
- [ ] Interview 3–5 practitioners/reviewers who can judge whether artifacts look credible.
- [ ] Ask learners to complete the onboarding and one lab while observing their behavior.
- [ ] Identify where they misunderstand a term, abandon a task or need help.
- [ ] Ask what kind of artifact they would realistically be willing to create and share.
- [ ] Test whether the broad SE positioning is clear or whether users assume interview prep.
- [ ] Change the path only when observed behavior supports the change.

Small qualitative samples are for discovery, not statistical proof of learning effectiveness.

## Exit criteria

A new learner can identify the platform's purpose, choose a path, understand a recommended competency gap, complete a first activity and submit evidence without staff intervention. Core journeys meet the accessibility target or have a documented remediation list.

## Learn while doing this

- [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [SEEE paper](https://doi.org/10.1002/iis2.12998)
- [WPI microcredential pilot](https://doi.org/10.18260/1-2-60.660.1149-55001)

---

# 11. Stage 8 — Run a controlled pilot and measure learning outcomes

**Indicative duration:** Weeks 15–16  
**Priority:** P1 before broad launch  
**Goal:** verify that learners can use the platform to improve and demonstrate a competency.

## Pilot scope

Start with one coherent experience:

- one primary learner segment;
- a small number of mapped competencies;
- 3–4 labs with complete rubrics;
- the first two capstone milestones;
- cloud evidence sync and a reviewer feedback cycle;
- a simple portfolio export.

Do not wait for every future feature before piloting the central learning loop. Equally, do not pilot cross-device evidence if Stage 1 has not passed its durability tests.

## Pilot operating steps

- [ ] Recruit a small discovery cohort (e.g. 10–15 learners); treat this as formative product testing, not a statistically powered study.
- [ ] Record baseline scenario performance.
- [ ] Give each learner a path and a target artifact.
- [ ] Observe where they get blocked.
- [ ] Review submissions using the lab-specific rubric.
- [ ] Ask the learner to revise at least one criterion.
- [ ] Record whether evidence survived a new session/device.
- [ ] Collect learner and reviewer feedback separately.
- [ ] Review drop-off and time-to-first-evidence.
- [ ] Fix the highest-impact usability and assessment problems before adding features.

## Metrics

### North Star candidate

**Weekly active learners who demonstrate improvement in at least one target competency through reviewable evidence, with the assessment method disclosed.**

### Supporting metrics

| Metric | Meaning |
|---|---|
| Diagnostic-to-first-evidence activation | Does a learner reach real practice? |
| First artifact submission rate | Does the course content lead to work? |
| Revision-after-feedback rate | Does feedback change the submitted work? |
| Criterion improvement after revision | Is work getting better? |
| Competency progression backed by evidence | Does demonstrated capability improve? |
| Reviewer agreement by criterion | Are rubrics clear enough to use consistently? |
| Independent-review coverage | How much evidence has external review? |
| Cross-device recovery success | Is the portfolio durable? |
| Sync retry/data-loss rate | Is persistence dependable? |
| Advanced-stage continuation | Does the learning experience support progression? |

Keep lesson completion and time spent as secondary engagement metrics. Do not treat satisfaction surveys or course completion as proof of competency improvement.

## Exit criteria

- Pilot learners can complete the first two milestones.
- Evidence survives session/device changes.
- Reviewers can apply the rubrics consistently enough to identify and explain disagreements.
- Learners can revise based on feedback.
- Product changes are prioritized from observed behavior and evidence, not assumed preferences.

---

# 12. After the first release: controlled expansion

Only start these after Stages 1–8 have passed their exit criteria.

## Expansion A — Reviewer and mentor workflow

- Reviewer invitation and permission model.
- Review queue with submitted artifact, rubric and prior revisions.
- Pass / needs revision / not met decisions.
- Reviewer feedback, audit history and conflict-of-interest rules.
- Reviewer calibration and workload monitoring.

Start with a manually coordinated small reviewer group. Do not build a mentor marketplace first.

## Expansion B — Role and career pathways

- Add roles based on actual learner/employer demand.
- Map role expectations to INCOSE/NEET competencies and levels.
- Explain missing evidence and recommended learning resources.
- Keep self-reported profiles separate from independently reviewed capabilities.

## Expansion C — MBSE and SysML v2 specialization

OMG's SysML 2.0 specification reached formal status in September 2025, with official final-adoption news in July 2025. Add it as an advanced pathway with a carefully chosen toolchain, model validation and version control. Do not force SysML into every learner journey. Teach systems-engineering fundamentals first and use model-based practice where it genuinely improves traceability and analysis.

Useful official resource: [OMG SysML 2.0](https://www.omg.org/spec/SysML/2.0/About-SysML).

## Expansion D — Microcredentials

A badge should require a defined set of competencies and accepted evidence. Store the rubric version, artifact references, assessor, date and criteria. A course-completion badge is not a competency credential. Avoid implying external accreditation or INCOSE endorsement.

## Expansion E — Educator and cohort support

Only if institutions or training teams request it:

- cohort and assignments;
- instructor dashboard;
- common rubric calibration;
- assignment deadlines and feedback;
- curriculum-to-competency reporting;
- privacy and institutional administration.

---

# 13. Suggested 16-week execution calendar

This is a suggested sequence for a solo developer working part-time. It assumes no major schema-owner delay and that a small reviewer group can be arranged. Re-estimate after the baseline stage.

| Week | Main focus | End-of-week deliverable |
|---:|---|---|
| 0 | Baseline and repository governance | Reproducible setup, baseline test report, ownership map, ADR log |
| 1 | Evidence model and sync API contract | Approved contract, schema request, idempotency design |
| 2 | Supabase persistence | Cloud event/evidence/snapshot writes and RLS policies |
| 3 | Client acknowledgement and restore | Per-record sync acknowledgement and cross-device snapshot hydration |
| 4 | Runtime health and deployment | Runtime-specific health checks and preview deployment |
| 5 | Integration/authorization tests | RLS isolation tests, runtime smoke tests, signature edge test |
| 6 | Verification model | Separate self-rating, auto-check, rubric feedback and human review |
| 7 | Lab rubrics, first half | Dedicated rubrics for first five labs |
| 8 | Lab rubrics, second half and calibration | Remaining five rubrics; reviewer calibration |
| 9 | Competency crosswalk | 16-to-37 INCOSE mapping and rationale |
| 10 | Learning paths and role profiles | Mapped activities and provisional role paths |
| 11 | Capstone continuity | Artifact/version graph and feedback-response links |
| 12 | Capstone review gates | Six milestone review sequence and dossier export |
| 13 | Content governance | Strict CI validation, source status metadata, mirror decision |
| 14 | UX, accessibility and performance | Onboarding improvements, accessibility report, bundle-size report |
| 15 | Pilot cohort begins | Baseline diagnostics and initial submissions |
| 16 | Pilot review and next backlog | Learning evidence report, prioritized post-pilot backlog |

If schema approvals or test infrastructure take longer, extend the schedule rather than skipping the gates.

---

# 14. Definition of Done and release gates

A feature is not complete when the UI renders. Use the relevant checks below.

## Product correctness

- [ ] The learner understands the competency and the reason for the activity.
- [ ] Assessment wording matches the actual evaluation method.
- [ ] The learner can inspect criteria and evidence requirements before submission.
- [ ] Feedback is actionable and tied to a specific artifact/criterion.
- [ ] A revision preserves the earlier attempt and captures the response to feedback.

## Data correctness

- [ ] All cloud writes are authorized and validated server-side.
- [ ] Idempotency key is stable across retries.
- [ ] Client acknowledges only records confirmed committed.
- [ ] Snapshot/evidence restores on a fresh browser.
- [ ] Exports match the canonical persisted state.
- [ ] RLS tests block cross-account access.

## Assessment correctness

- [ ] Learner self-ratings are not labelled as independent verification.
- [ ] Rubric and scoring versions are stored with attempts.
- [ ] Reviewer identity and authority are recorded.
- [ ] Historical decisions are not silently changed when a rubric is updated.
- [ ] The UI explains evidence gaps and rejected/needs-revision decisions.

## Engineering quality

- [ ] Type-check and lint pass.
- [ ] Unit tests pass.
- [ ] Server-function integration tests pass.
- [ ] Database and RLS tests pass.
- [ ] Browser E2E tests pass for the affected flow.
- [ ] Production preview smoke tests pass on the target runtime.
- [ ] Content validation passes.
- [ ] Accessibility checks pass for affected core workflows.
- [ ] Build and route-bundle measurements are recorded.

## Operations

- [ ] Errors are observable and correlated to requests.
- [ ] Secrets are not in client code or logs.
- [ ] Backups and restore procedures are known.
- [ ] Rollback/recovery steps are documented.

---

# 15. Recommended test suite to build

| Test layer | Specific NEET coverage |
|---|---|
| Unit | `evaluateRubric`, competency aggregation, signature generation, score/proficiency calculation, sync merge and retry rules |
| Contract | `recordEvents` request/response, accepted IDs, partial failures, payload validation, version constraints |
| Database | unique idempotency, foreign keys, RLS, snapshot consistency, reviewer authorization |
| Integration | Supabase cloud insert/read/export/hydration and verified auth middleware |
| E2E | signup → diagnostic → lesson → lab → submit → feedback → revise → sync → new browser → export |
| Runtime | Cloudflare/Nitro target health checks, environment handling, no accidental local SQLite import |
| Content | missing articles, duplicate IDs, dangling citations, stale source statuses, mirror parity |
| Accessibility | keyboard, screen reader, contrast, focus, error messages, responsive layout, reduced motion |

Minimum sync regression cases:

1. Duplicate request with the same idempotency key.
2. Lost response after successful commit.
3. Server partial commit/rejection.
4. Browser termination before acknowledgement.
5. Out-of-order requests.
6. New browser with no local cache.
7. Account switching.
8. Concurrent edits to the same learner state.

---

# 16. Research library: resources to use while following the plan

These are selected sources rather than a random resource dump. Prefer official standards/frameworks for requirements and use practitioner discussions for experience signals, not authority.

## A. Systems engineering foundations

- [SEBoK](https://sebokwiki.org/wiki/Main_Page) — primary map of the discipline; use it to structure the curriculum and discover primary references.
- [INCOSE Systems Engineering Competency Framework](https://www.incose.org/resources-publications/publish-with-incose/competency-framework/) — competency definitions and tailoring guidance.
- [INCOSE standards list](https://www.incose.org/about-systems-engineering/standards-policies/) — current systems engineering standards references.
- [ISO/IEC/IEEE 15288:2023](https://www.iso.org/standard/81702.html) — system lifecycle process framework, from conception to retirement; it does not prescribe one specific lifecycle model or method.
- [NASA Systems Engineering Handbook](https://www.nasa.gov/reference/systems-engineering-handbook/) — practical work products, lifecycle and systems-engineering process explanations.
- [NASA Fundamentals of Systems Engineering](https://www.nasa.gov/reference/2-0-fundamentals-of-systems-engineering/) — system design, product realization and technical management process explanations.

## B. Requirements, architecture, safety and modelling

- [ISO/IEC/IEEE 29148:2018](https://standards.ieee.org/standard/29148-2018.html) — requirements engineering.
- [ISO/IEC/IEEE 42010:2022](https://www.iso.org/standard/74393.html) — architecture description; verify the catalogue status and edition before each curriculum refresh.
- [OMG SysML 2.0](https://www.omg.org/spec/SysML/2.0/About-SysML) — formal modelling language specification, textual/graphical representations and analysis/verification cases.
- [INCOSE Systems Engineering Handbook](https://www.incose.org/resources-publications/technical-publications/se-handbook/) — practical methods and lifecycle elaboration.

## C. Engineering education and assessment

- [ASEE MBSE active-learning paper](https://peer.asee.org/leveraging-active-learning-techniques-to-teach-model-based-systems-engineering.pdf) — learner-selected system, sequential models, explicit rubrics and feedback/revision.
- [SEEE ecosystem paper](https://doi.org/10.1002/iis2.12998) — competency gaps and links between student, employer and education needs. Treat as an ecosystem design precedent, not proof of a deployed product's effectiveness.
- [WPI microcredential pilot](https://doi.org/10.18260/1-2-60.660.1149-55001) — course/badge pattern and implementation lessons. The pilot also identifies audience and advanced-course continuation as challenges to investigate.

## D. Software architecture and reliability

For the software/system-architecture specialization:

- [Google SRE Book](https://sre.google/sre-book/table-of-contents/) — reliability, overload, monitoring and operational practices.
- [Google SRE Workbook](https://sre.google/workbook/table-of-contents/) — applied exercises and operational work.
- [Architecture Decision Records](https://adr.github.io/) — decision log practice.
- [C4 Model](https://c4model.com/) — system context/container/component diagramming where appropriate.
- [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/) — application security verification requirements.

## E. The existing application stack

- [TanStack Start documentation](https://tanstack.com/start/latest/docs/framework/react/overview)
- [TanStack Start middleware](https://tanstack.com/start/latest/docs/framework/react/guide/middleware)
- [TanStack Start server functions](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions)
- [Supabase SSR client setup](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Drizzle ORM docs](https://orm.drizzle.team/docs/overview)
- [Cloudflare Workers Node.js APIs](https://developers.cloudflare.com/workers/runtime-apis/nodejs/)
- [Cloudflare compatibility flags](https://developers.cloudflare.com/workers/configuration/compatibility-flags/)
- [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/)

## F. Current Reddit discussions used as practitioner signals

- [r/systems_engineering — projects/skills for an undergraduate, May 2026](https://www.reddit.com/r/systems_engineering/comments/1t6tcfj/systems-engineering-projects-or-skills-to-learn/)
- [r/systems_engineering — foundational SE training for experienced engineers, October 2025](https://www.reddit.com/r/systems_engineering/comments/1nx7tbo/basic-foundational-se-training-courses-for/)
- [r/ExperiencedDevs — learning system design beyond interview prep, July 2025](https://www.reddit.com/r/ExperiencedDevs/comments/1lt2pqa/how-does-one-learn-to-build-system-design-at/)
- [r/ExperiencedDevs — software architecture learning and practical development, April 2026](https://www.reddit.com/r/ExperiencedDevs/comments/1sx0ma0/how-can-you-learn-about-software-architecture/)

Reddit sources are opinions and experiences, not controlled studies or normative engineering guidance. Use them to generate questions for learner interviews and identify practical pain points.

---

# 17. First 10 tasks to execute

Do these in order. Do not start with new UI features.

- [ ] 1. Confirm canonical package manager, runtime and production hosting target.
- [ ] 2. Get the full CI baseline green and save the exact output.
- [ ] 3. Write the learner evidence/snapshot sync contract and idempotency rules.
- [ ] 4. Submit the missing cloud schema/RLS request through Lovable, respecting `AGENTS.md`.
- [ ] 5. Implement Supabase writes for events, evidence and snapshots.
- [ ] 6. Change client outbox acknowledgement to accept only server-confirmed IDs.
- [ ] 7. Implement cloud snapshot hydration and export from canonical records.
- [ ] 8. Add cross-device, retry, partial-failure and RLS tests.
- [ ] 9. Remove the production health-path dependency on local SQLite and test on the real runtime.
- [ ] 10. Replace misleading verification labels with the actual assessment state, then design the ten lab-specific rubrics.

**Do not mark Stage 1 complete until a real cross-device evidence round trip works.** This is the most important acceptance test in the entire roadmap.

---

# 18. Research and verification notes

- Exa was used for standards/framework, curriculum, comparable initiatives, technical architecture and practitioner discussion searches. The requested result count across those searches was 111; duplicate results may exist.
- Firecrawl was used to cross-check official INCOSE, SEBoK, ISO, TanStack Start, Supabase and Cloudflare pages, as well as engineering education research.
- TinyFish was used to search and read selected recent Reddit discussions from systems engineering and experienced software development communities.
- Context7 documentation checks from the repository audit covered TanStack Start middleware/server functions, Supabase authentication verification, Drizzle migrations and Cloudflare Workers compatibility.
- The current official SEBoK main page and release history checked in this review list v2.14 as current (released 18 May 2026). The SEBoK says releases are typically semi-annual; re-check its official release page before refreshing the curriculum.
- ISO/IEC/IEEE 15288:2023 is listed as published by ISO and covers the full system lifecycle, but explicitly does not prescribe a particular lifecycle model, method or modelling technique.
- OMG's official SysML 2.0 page identifies the formal specification as version 2.0 with publication date September 2025. Treat tool availability/conformance as a separate adoption decision.
- Reddit comments are anecdotal and are used only to identify hypotheses about learner needs.
- This roadmap does not claim that the application has been modified or that any test/build has passed. The prior repository audit's limitation remains: dependency installation did not complete in that review environment, so the full automated test suite and production build were not verified there.

