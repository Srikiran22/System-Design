# Competency Architecture & Evidence-Based Assessment

## 1. Competency Graph (`COMPETENCY_MODEL_VERSION = "2.0.0"`)

All 16 curriculum skills (`SE-ST-01`..`SE-EN-06`) are formalized as typed `CompetencyDefinition` entities in `src/lib/neet/competencies.ts` across three engineering disciplines:

- **Systems Thinking (`SE-ST-01`..`SE-ST-04`)**: Stocks & flows, Feedback loops, Leverage points, Boundary critique.
- **System Design (`SE-SD-01`..`SE-SD-06`)**: Requirements & estimation, Data & storage, Scaling & caching, Design for reliability, Distributed consensus, Decision analysis & MCDA.
- **Systems Engineering (`SE-EN-01`..`SE-EN-06`)**: Reading unfamiliar code, Tests as feedback, Shipping small, Assurance cases (GSN), System safety & STPA, Markov dependability & Weibull.

Each competency includes:
- Acyclic prerequisites and typed relations (`assumes`, `extends`, `related`) verified automatically by `validateCompetencyGraph()`.
- Authoritative anchors to **INCOSE SECF 2e**, **SEBoK**, **NASA SE Handbook**, and **ISO/IEC/IEEE 15288 / 42010 / 29148**.
- Observable L1–L4 proficiency descriptors and direct links to lessons, rubric labs, knowledge volumes, career roles, and design prompts.

## 2. Proceed Scale v2 (`SCALE_MODEL_VERSION = "2.0.0"`)

Lesson completion checkboxes track reading place only and **never** award mastery. Competency levels require explicit evidence evaluated separately across four dimensions:

| Dimension | Definition |
| --- | --- |
| **Coverage (`0..1`)** | `min(1, sum(weight) / 6)` — evidence breadth across checks, explanations, labs, and artifacts. |
| **Quality (`0..1`)** | Recency-decayed weighted score (`HALF_LIFE_DAYS = 45`). |
| **Freshness** | `fresh` (`<=14d`), `aging` (`15–35d`), `stale` (`>35d`), or `none`. |
| **Verification Tier** | `self-assessed` < `automated-check` < `rubric-evaluated` < `reviewer-verified`. |

### Strict Level Gates
- **L0 (`Not yet assessed`)**: Zero evidence recorded (explicitly distinguished from low ability).
- **L1 (`Search`)**: Initial retrieval or framing evidence.
- **L2 (`Know`)**: `mastery >= 0.25`.
- **L3 (`Adapt`)**: `mastery >= 0.55` **AND** a passing lab or trade-off scenario (`score >= 0.60`). Quizzes alone cannot unlock L3.
- **L4 (`Proceed`)**: `mastery >= 0.80` **AND** a passing artifact or capstone milestone (`score >= 0.75`).

## 3. Practice & Assessment Studio (`/labs`)

- **10 Rubric-Evaluated Labs**: Criterion-by-criterion 1–4 behavioral anchors, constraint twist response, validated artifact URL, deterministic weighted score (`evaluateRubric`), targeted revision feedback, and full revision history (`v1`, `v2`, ...).
- **4 Worked Trade-Off Scenarios**: Multi-constraint engineering dilemmas (WAN partition split-brain, STPA sensor delay, metastable retry storms, ISO 29148 requirement verifiability) requiring an explicit invalidation condition.
- **6-Milestone Traceable Capstone**: *"Dependable Regional Emergency Dispatch & Triage Service"* tracing `Boundary -> Requirements -> Architecture/MCDA -> STPA/STRIDE -> Markov/V&V -> GSN Defense`.

## 4. Non-Certification Disclosure

All portfolio exports and dashboards explicitly state that this platform records self-directed engineering work and rubric evaluations—it is **not** a formal INCOSE, ISO, NASA, or regulatory certification.
