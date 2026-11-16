# Content import guide

## Repository purpose

This folder is a content research base for a systems knowledge website. Markdown notes are authored explanatory content; CSV files are structured indexes; JSON files define initial data models.

## Suggested ingestion

- Parse each Markdown file as an article/page with stable slug derived from filename.
- Parse `sources.csv` into Source records.
- Parse `role_competency_matrix.csv` into Role and Competency relations.
- Parse `practice_prompts.csv` into Exercise records.
- Use `portal_entity_schema.json` as a starting point, then split schemas by entity type before production.

## Required source discipline

Use `source_id` values as stable references. Never replace a source URL with a guessed URL. Record the exact access/review date. Store the source version/edition separately from the portal content version.

## Recommended production model

Use a relational database for canonical records and relationships; a search index for full-text and facets; object storage for permitted original files; and a versioned content repository for authored Markdown. Avoid a large untyped JSON blob as the only source of truth.

## Minimum entities

Concept, Method, Artifact, Standard, Certification, Role, Competency, Resource, CaseStudy, LearningPath, Exercise, GlossaryTerm, IndustryDomain, Tool, ReviewEvent.

## Provenance

Each factual technical assertion should point to one or more `source_id`s and a support note. Distinguish direct source statement, editor synthesis, and example. Capture uncertainty and source limitations.

## Do not scrape and republish whole third-party properties

For Awesome, FMHY, books, standards, courses, and video channels, record and curate references, describe their utility and scope in original words, and link to the original. Only ingest or republish content where the license and permission allow it. Never mirror a copyrighted book, paid course, or standards document without permission.

## Source ingestion: required rules

- Import all source records with stable IDs; do not discard the user's original URL when a canonical URL has changed. Record `canonical_url` separately in the production database if redirect resolution is available.
- Preserve `source_type`, `relevance`, `quality_signal` and `limitations`. Add fields for access (`open`, `account_required`, `paid`, `gated`, `private`, `unknown`), last_checked_at, publication_date, version, license and review_status.
- A source record is not a recommendation. Apply source-quality review and human technical review before using it to support an instructional claim.
- Link to the original publisher. Do not scrape and republish entire books, standards, course PDFs, or proprietary vendor materials. Create original explanations and short excerpts only when legally permitted.
- Store private Dropbox resources in a private workspace until owner permission, confidentiality and publication rights are confirmed.
- Schedule checks for volatile sources (courses, certification pages, software versions and vendor offerings). Standards and certification facts must be timestamped and must link to the issuer.
- For community-curated repositories, store maintainer, last commit/release, license, contribution guide, moderation state and archived/deprecated status.

## Source ingestion: required rules

- Import all source records with stable IDs; do not discard the user's original URL when a canonical URL has changed. Record `canonical_url` separately in the production database if redirect resolution is available.
- Preserve `source_type`, `relevance`, `quality_signal` and `limitations`. Add fields for access (`open`, `account_required`, `paid`, `gated`, `private`, `unknown`), last_checked_at, publication_date, version, license and review_status.
- A source record is not a recommendation. Apply source-quality review and human technical review before using it to support an instructional claim.
- Link to the original publisher. Do not scrape and republish entire books, standards, course PDFs, or proprietary vendor materials. Create original explanations and short excerpts only when legally permitted.
- Store private Dropbox resources in a private workspace until owner permission, confidentiality and publication rights are confirmed.
- Schedule checks for volatile sources (courses, certification pages, software versions and vendor offerings). Standards and certification facts must be timestamped and must link to the issuer.
- For community-curated repositories, store maintainer, last commit/release, license, contribution guide, moderation state and archived/deprecated status.

## Extended entity coverage

The portal should support additional first-class entities beyond a simple article/resource list:

- `standard`: issuing body, document number, edition, publication date, status, jurisdiction, scope, normative/informative, supersession, access/licence, applicability.
- `certification`: issuing organization, role family, exam version, prerequisites, experience, assessment type, expiry/renewal, cost check date and limitations.
- `tool`: category, supported methods/languages, export/API, licensing, interoperability, security, lifecycle status, known trade-offs and alternatives.
- `metric`: formula, decision audience, source, sampling, latency, threshold, owner, manipulation risk and action.
- `architecture-decision`: context, drivers, options, decision, rationale, consequences, risks, evidence and revisit trigger.
- `practice-lab`: prerequisites, scenario, constraints, artifacts, tests, rubric, hints, solution envelope and safety notes.
- `case-study`: system boundary, period, source, initial drivers, architecture, incident/decision, causal mechanism, outcomes, limitations and counterfactual.

Every entity must carry provenance and status. Do not turn an unreviewed search result into a published recommendation. Link tools to methods and use cases, standards to applicable system scopes, roles to deliverables, and learning resources to competencies. Keep user-supplied private material separate from public sources and access-controlled content.
