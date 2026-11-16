# 52 — Knowledge governance and source-quality protocol

## The portal must preserve provenance

Each authored page should distinguish: (a) direct statements from an authoritative source, (b) synthesis across sources, (c) worked example, (d) rule of thumb, and (e) unresolved question. Attach source IDs to substantive claims. A source record should include title, exact URL, issuer/author, source type, edition/date, access date, quality signal, relevance, limitations and review status.

## Source hierarchy

1. Normative standard or regulation from the official publisher/regulator.
2. Government, standards-body or professional-society handbook.
3. Peer-reviewed research or transparent academic publication.
4. Maintainer documentation or first-party technical documentation.
5. First-party engineering postmortem, case study or conference report.
6. University/open-course materials.
7. Professional practitioner material with explicit author and evidence.
8. Commercial training/vendor material.
9. Unreviewed community posts, social snippets and SEO explainers.

This is a weighting guide, not an automatic truth ranking. A first-party incident report may be highly valuable for one system but partial; a standard may define a process without proving the product is safe; peer-reviewed work may be narrow or dated.

## Review record

For each article capture: owner; initial review date; last review; next review; source versions; claim changes; unresolved disagreements; links checked; and reviewer. Trigger review when a standard is revised, a course changes, a vulnerability or incident changes practice, a vendor service retires, or a major architecture method evolves.

## Curation rules

- No unverified certification claims, course prices or eligibility.
- Do not present a vendor framework as neutral industry consensus.
- Avoid republishing protected standards, books, paid course content or another directory's lists.
- Use original explanations and link to legitimate publishers.
- Preserve source limitations and uncertainty.
- Separate current requirements from historic versions.
- Distinguish product certification, professional certification, course completion and academic credit.
- Record access restrictions and whether full text was reviewed.

## Quality scoring

A source can be rated on authority, proximity to primary evidence, recency, method transparency, reproducibility, scope fit, incentive alignment and access completeness. Do not average away a fatal limitation: a current vendor page may be authoritative about its own product but weak evidence about neutral best practice.

## Coverage completeness

Use the taxonomy and `sources.csv` to track each concept's: definition, prerequisites, methods, artifacts, tools, tradeoffs, failure modes, exercises, cases, standards, certifications, careers and open questions. Mark “not researched” rather than filling gaps with confident prose.
