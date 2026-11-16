# 79 — Advanced research method, source provenance and scrape ledger

## Purpose

This volume records the third research pass as an auditable source-discovery and extraction exercise. It distinguishes finding a source from fetching it, reading it, validating it and synthesizing it. A search result is not a reviewed source.

## EFT execution record

**E — Exa discovery:** used across systems methods, requirements, mission engineering, architecture theory, distributed systems, reliability/PRA, safety, cybersecurity, AI assurance, control/CPS, OR, sustainability, careers and incident forensics. Queries were split by discipline and sub-question; results were filtered for primary/official/academic sources and deduplicated against the existing register.

**F — Firecrawl extraction:** successfully extracted numerous official HTML pages and technical PDFs, including the September 2026 Systems Engineering Guidebook, NASA-HDBK-1009A, NIST SP 800-160 Vol. 2 Rev. 1, 800-161 Rev. 1 Update 1, 800-218A, GenAI Profile, PRA Guide, System Safety Handbook, Bayesian Reliability handbook, STPA primer, Spanner, NASA requirements management and integration material, AI Software Assurance, CrowdStrike RCA, NATS review and NTSB AIR-25-04. Firecrawl later exhausted connected-app credits; subsequent scrape attempts were not executed.

**T — TinyFish extraction:** successfully fetched and parsed large batches of PDFs/HTML, including the MEG 2.0, DoDAF-related discovery, OWASP Agentic Top 10 (2026), ACSC agent adoption guidance, SECNAV R&M Guidebook, IAEA common-cause-failure procedures, NASA HDBK-1009A, NASA interface/product integration and logistics documents, the Data Mesh review, and selected incident reports. Some URLs returned `target_unreachable`, `bot_blocked`, timeout or empty content. Two account links were tried where the first fetch failed.

## Extraction-status vocabulary

- **Full fetch:** page/PDF text returned and reviewed for scope and technical material.
- **Targeted extraction:** selected questions/sections or summary extracted; not necessarily the entire document.
- **Discovery only:** identified through search but content not fetched.
- **Partial / metadata only:** title, abstract, table of contents or selected passages only.
- **Blocked / unreachable / timeout:** fetch attempt failed; source is not counted as read.
- **Gated/licensed:** public listing found, normative content is restricted or requires purchase/member access.
- **Superseded / version caution:** source may be old or no longer governing; retain for historical context only.

The companion `DEEP_SCRAPE_AUDIT.csv` records status and limitations for the key sources. `DEEP_COVERAGE_MATRIX.csv` records which disciplines gained additional coverage and remaining gaps.

## Source-quality rules

1. Use standards publishers, regulator/government reports, primary handbooks, original research and first-party incident reports first.
2. Treat tool vendors as authoritative for their own tools, not neutral sources for market-wide claims.
3. Treat a postmortem as a first-party account; cross-check independently investigated incidents where possible.
4. Record publication date, version, scope, author/issuer and access limitations.
5. Never copy normative standards beyond permitted use; cite and summarize only.
6. Distinguish source facts, synthesis, inference and recommendations.
7. Do not treat search ranking, popularity or citation count as quality proof.

## Limitations of the third pass

- Firecrawl connected-app credits ran out before all planned follow-up pages could be scraped.
- Some Open University CSH/SSM PDFs were unreachable in TinyFish; some ACM pages were bot-blocked.
- DoDAF PDF, ESA Ariane 501 PDF and Bank of England RTGS PDF were not successfully extracted during this pass; search-derived pointers remain in the register.
- The full contents of all sector standards were not reviewed; many are paywalled or licensed.
- No independent engineering execution, formal verification, certification assessment or field validation was performed.
- “All sources” cannot be guaranteed for an open, evolving multidisciplinary field. This pass improves breadth/depth and gives an auditable continuation path rather than asserting global exhaustiveness.

## Fourth research pass (documents 82–95)

The fourth pass added primary-source extraction for the September 2026 DoW System of Systems Engineering Guidebook, NATO NAF 4.1 (March 2026), NASA Human–Machine Teaming in Aviation (April 2025), CMU/SEI product-line requirements research, NASA configuration-management and technical-management pages, the DoW Value Engineering guidebook (February 2025), IAEA Human Reliability Analysis guidance, the ACM Data Mesh systematic gray-literature review, ISO/IEC/IEEE 16085 and the ISO record for ISO/IEC/IEEE 21839 edition 2. The latter was listed as under publication on 5 November 2026, not yet as a published edition.

**Account note:** Firecrawl account 1 had exhausted its credits from the earlier pass. Account 2 was rejected as ineligible by Firecrawl. Account 3 was used successfully in this pass; its remaining balance was 239 credits after the last extraction batch. TinyFish account 2 handled a large PDF/HTML batch successfully. These access facts are included to keep the research provenance auditable; they do not imply that every discovered page was fully scraped.

The source ledger was reconciled against inline citations, and `DEEP_COVERAGE_MATRIX.csv` was generated to show where coverage remains partial.
