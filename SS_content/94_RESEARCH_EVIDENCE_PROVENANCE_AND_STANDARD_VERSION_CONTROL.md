# 94 — Research evidence, provenance and standard-version control

## Research is a lifecycle process

A knowledge portal should preserve the distinction between candidate discovery, source validation, extraction, interpretation, synthesis and update. A URL in a bibliography is not evidence that the content was read. A successful fetch is not proof that the content was complete, current, authoritative or correctly interpreted.

## Source record minimum schema

For every source, record:

- stable source ID and canonical URL;
- exact title, publisher/issuer and author where available;
- publication date, edition, version, amendment and status;
- source class (normative standard, regulator rule, government handbook, technical report, peer-reviewed paper, first-party postmortem, vendor guide, course, private source);
- scope, system/sector and intended audience;
- access state (open, gated, licensed, blocked, partial, metadata-only);
- extraction tool, date and extraction extent;
- claims supported by the source and their limitations;
- successor/supersession and review trigger.

## Version-control rule for standards

Treat a standard as a tuple: identifier + edition + amendments/corrigenda + publication/status date + jurisdiction/contractual context. A newer edition can be under development, under publication, published but not yet adopted by a regulator, or contractually inapplicable. Do not overwrite the older record; retain version history and note which source governs the project.

Examples from the present snapshot:

- ISO/IEC/IEEE 21839:2019 remains a published edition; edition 2 was listed as under publication on 5 November 2026. [S255, S256]
- NASA-STD-0005 is marked inactive for new design; the old document should not be represented as a current NASA mandate. [S250]
- DoW published updated system and SoS engineering guidebooks in September 2026. [S94, S93]

## Extraction status taxonomy

- **Full fetch:** substantive content of the page/PDF retrieved and reviewed.
- **Targeted extraction:** selected sections/questions extracted; not the complete source.
- **Metadata/abstract:** title, date, scope or abstract only.
- **Discovery only:** source identified but not fetched.
- **Partial:** some pages or snippets retrieved; gaps remain.
- **Blocked/unreachable/timeout:** no substantive extraction; never count as reviewed.
- **Gated/licensed:** listing available but normative content restricted.
- **Superseded/inactive:** retain only for history or explicit migration analysis.

## Cross-source triangulation

For a consequential claim, prefer convergence among independent high-quality sources. For incident causes, compare first-party RCA with regulator investigation. For standards status, use the standards owner. For a vendor tool's behavior, vendor documentation is primary; for claims that the tool is best or industry-leading, seek independent evidence. For an engineering method, distinguish the method's original source, later systematic review, official guidance and commercial training material.

## Audit checks

1. URLs are canonical and unique.
2. Source IDs are stable and cited docs resolve to them.
3. Titles and versions match the source's own front matter/metadata.
4. No summary is presented as full source extraction.
5. Currentness statements include a date and issuer.
6. Excluded search false positives are recorded when they affected coverage.
7. Normative text is not reproduced beyond license and quotation limits.
8. Internal links, CSV schemas and archive integrity are tested before release.

## Practical deliverable

Take 20 standards/reports and produce a provenance matrix with two independent source checks for every status claim. Include an explicit “not checked” field rather than inferring active status from a recent file date.

## Limitations

This repository is a research foundation, not a complete standards register for every jurisdiction. Source discovery is inherently bounded by accessible indexes and fetch restrictions. Treat the audit as a snapshot, not an assurance certificate.
