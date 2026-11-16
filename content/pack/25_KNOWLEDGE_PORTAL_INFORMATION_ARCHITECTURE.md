# 25 — Knowledge portal information architecture and content governance

## Product intent

Build a deep, searchable systems knowledge portal that combines:

1. An encyclopedia of concepts and relationships.
2. Structured learning paths from beginner to specialist/lead.
3. A curated resource directory (books, papers, standards, handbooks, courses, videos, tools, simulations, open-source repositories and communities).
4. Career and competency maps.
5. Practice: labs, case studies, design challenges, quizzes, templates and worked examples.
6. A continuously reviewed source register and change history.

Do not model this as a static website made of isolated articles. Model it as a knowledge graph with editorially managed nodes and relationships, surfaced through multiple user journeys.

## Top-level navigation

1. **Start Here** — discipline map, beginner orientation, glossary, how to study, common misconceptions.
2. **Knowledge Map** — full searchable hierarchy of concepts, sub-concepts, methods, artifacts, standards and tools.
3. **Systems Thinking** — system dynamics, complexity, socio-technical systems, feedback, leverage points, system archetypes, boundary critique.
4. **Systems Engineering** — lifecycle, technical processes, management processes, specialty engineering, standards, review gates.
5. **System Design & Architecture** — software/hardware/system architecture, decomposition, patterns, trade-offs, performance/reliability/security, reference architecture.
6. **MBSE & Digital Engineering** — SysML, modeling methodology, digital thread/twin, tool ecosystem, model governance.
7. **Specialisms** — reliability, safety, security, control, V&V, integration, human systems, logistics, manufacturing, sustainability, etc.
8. **Careers** — role explorer, competency matrix, day-in-the-life, deliverables, portfolios, career progression, job-market signals.
9. **Learning Paths** — role-based, domain-based, concept-based, certification-based, time-budget-based tracks.
10. **Practice & Labs** — design prompts, simulators, architecture kata, FMEA/STPA, V&V plans, review exercises, portfolio projects.
11. **Case Studies** — successes, failures, outages, near misses, design evolutions, lessons learned.
12. **Resources** — searchable curated links and bibliographic catalog.
13. **Standards & Certifications** — version, issuer, scope, industry applicability, prerequisites, official exam guide and review date.
14. **Glossary** — canonical definitions, synonyms, ambiguous terms and related concepts.
15. **Contribute / Methodology** — source policy, editorial rules, corrections, change log, review process.

## Core entity model

Each content entity should have a stable ID, title, summary, canonical URL/slug, body, parent, tags, related concepts, status, revision, sources, author/reviewer, and timestamps.

### Concept entity

Fields: definition, purpose, why it matters, prerequisites, major/minor sub-concepts, mental models, workflow, equations (where relevant), diagram, examples, counterexamples, typical failure modes, decision criteria, trade-offs, related concepts, practical exercise, source citations, confidence/review status.

### Method/tool entity

Fields: question it answers, when to use/avoid, inputs, steps, outputs/artifacts, roles involved, assumptions, limitations, examples, template, software tools, standards linkage, source support.

### Resource entity

Fields: title, author/issuer, URL, format, resource type, discipline, level, role fit, prerequisites, price/access, language, last checked date, publication/version, what it teaches, quality rationale, limitations, licensing/copyright notes, replacement/archival status.

### Role entity

Fields: seniority, role family, purpose, responsibilities, competencies, methods, tools, work products, interfaces, decision authority, progression, portfolio projects, industry variants, source evidence.

### Standard/certification entity

Fields: issuer, identifier/version, scope, normative/informative status, domain applicability, current edition, superseded versions, access, exam name/code, prerequisites, format, duration, cost/currency, renewal/expiry, official source, last verification date. Never hardcode live exam values without a timestamp.

### Case study entity

Fields: system context, target outcomes, constraints, architecture, decision alternatives, chosen design, implementation, measured evidence, failure modes, trade-offs, operational consequences, lessons, source perspective and evidence quality.

### Learning path entity

Fields: learner persona, starting knowledge, outcome competencies, sequence, time estimate, materials, practice, checkpoints, assessment rubric, capstone, progression criteria.

## Relationship graph

Use explicit relationships such as:

- `part_of`, `specializes`, `prerequisite_of`, `related_to`, `contrasts_with`, `implemented_by`, `evaluated_by`, `verified_by`, `validated_by`, `allocates_to`, `interfaces_with`, `mitigates`, `causes`, `trades_off_with`, `supersedes`, `based_on_standard`, `used_in_role`, `taught_by_resource`, `practiced_by_exercise`, `demonstrated_in_case_study`.

Every relationship should be typed. Avoid an undifferentiated “related links” list as the only relationship mechanism.

## Resource curation inspired by Awesome lists

The Awesome manifesto's core principle is curated recommendation, not unfiltered aggregation. Adopt the following:

- Only list resources that an editor can explain and recommend for a clear learner need.
- Each entry must say why it is useful and who it is useful for.
- Keep scope explicit; split broad domains into coherent collections.
- Prefer primary sources, standards bodies and institutional curricula for technical truth.
- Avoid duplicates; point to the stronger canonical resource and note alternatives only when their differences matter.
- Include a contribution guide, editorial license, code of conduct if community participation is enabled, and correction process.
- Consistent format, category hierarchy, source metadata and revision tracking.

References: https://github.com/sindresorhus/awesome and https://github.com/klaufel/awesome-design-systems.

## Resource curation inspired by FMHY

Adopt the useful product patterns, not its topic-specific content:

- Beginner guide and FAQ for first-time visitors.
- Category landing pages and alternate browse/search views.
- Visible monthly update notes and granular commit/change history.
- Backup/export and recovery plan for the knowledge repository.
- Link testing and report-a-broken-resource flow.
- Review before accepting contributions; significant restructuring should be discussed before being merged.
- Explicit inclusion/exclusion criteria.
- Keep search, tags, glossary and filters consistent across the entire site.

Reference: https://fmhy.net/, https://fmhy.net/beginners-guide, https://fmhy.net/other/contributing, https://fmhy.net/posts/nov-2026.

## Editorial/source policy

Source classes:

- A: standards body, government/agency handbook, official specification, original research paper, original incident/postmortem, issuer's certification page.
- B: university course, professional society guidance, established engineering organization/vendor engineering publication.
- C: practitioner article, book review, community curated list, conference presentation, job posting.
- D: unverified social post, generic SEO article, undated repost, link aggregator with no editorial rationale.

Class D can lead to discovery, but should not support a consequential technical claim without corroboration. Vendor documentation is authoritative for the vendor's implementation, not proof that it is the universal best approach. Job postings are evidence of employer demand at a point in time, not canonical definitions of a profession.

## Quality controls

- Every key technical claim has source support or is explicitly labeled as synthesis/opinion.
- Prefer primary sources and cross-check critical safety/reliability/standard claims.
- Distinguish normative requirements from guidance, examples and common practice.
- Record publication date, version and last checked date.
- Use a `needs_review` state when live facts cannot be verified.
- Check link health, redirects, archive status, duplicates and paywall changes.
- Retain historical versions for standards/certification snapshots; never silently rewrite historical requirements.
- Keep original explanations authored; quote only short passages and link to the source.
- Do not republish proprietary standards, paid books, course slides or entire FMHY/Awesome entries. Link, summarize, cite and respect licenses.

## Suggested content status workflow

`discovered → triaged → source_checked → drafted → technical_review → published → review_due → archived/replaced`

A resource can be `broken`, `paywalled`, `superseded`, `withdrawn`, or `unverified` without deleting its history.

## User experience/search

Search should support concepts, synonyms, standards IDs, role names, acronyms, methods, artifacts, tools and natural-language questions. Filters: discipline, level, lifecycle phase, role, industry, resource type, standard, free/paid, language, last reviewed, primary/secondary source, tool/vendor and learning format.

Each result card should show a concise description, why it is useful, level, prerequisites, content type, review date and source quality. Provide graph navigation (prerequisite path, concept neighborhood, role-to-skill map and case-study-to-concept map).

## Site acceptance checklist

- Can a beginner identify which discipline they need?
- Can a learner move from a concept to prerequisites, methods, artifacts, resources and practice?
- Can a role page state what to do and what evidence proves competence?
- Can a designer compare options and see trade-offs, not merely a recommended pattern?
- Can a reviewer trace a statement to an authoritative source and version?
- Can an editor correct, version, archive and audit content?
- Can users report broken/outdated links?
- Can a content export/back-up reconstruct the graph and files?
