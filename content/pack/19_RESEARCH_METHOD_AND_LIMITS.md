# 19 — Research method and limitations

## EFT workflow used

This expansion used the requested EFT sequence:

1. **Exa — discovery:** multi-angle searches across systems science and complexity, lifecycle and standards, architecture methods, software/distributed/cloud/data design, safety/reliability/security, V&V, enterprise architecture, MBSE, product/team research, AI system assurance, careers/credentials, control/CPS, operations research, integration, product support, sustainability and tooling. Search outputs were screened for primary-source value rather than treated as proof.
2. **Firecrawl — extraction:** targeted extraction of SEBoK, INCOSE standards, CMU SEI ATAM/QAW, NIST CSF and AI publications, OMG SysML/BPMN specifications, TOGAF, arc42, Google SRE, IEC functional safety, secure-AI guidance, NASA life-cycle logistics, cyber-physical systems, OR methods, ITU AI environmental guidance and architecture-tool documentation. Some pages exposed site navigation instead of the intended content; those cases were not treated as complete extraction.
3. **TinyFish — search/fetch validation:** successfully searched and fetched official INCOSE, SEBoK, SEI, NIST, OMG and NASA material, including NASA interface-management and Systems Engineering Handbook content. It provided a second extraction path for dynamic or difficult pages. Earlier account-eligibility errors occurred in a prior pass; the current expansion pass successfully completed selected searches and fetches.

Findings were deduplicated, classified by source type, and linked to authored notes with limitations. This is not a claim that the web was exhaustively crawled or that all linked standards were read in full.

## Deliberate coverage

- Definitions/boundaries across software architecture, systems engineering, systems thinking, product design.
- Requirements, constraints, quality attributes and measurable scenarios.
- Architecture styles, decomposition, data/integration patterns.
- Decision methods, ATAM, ADRs, risk and trade-offs.
- Distributed systems, data, messaging, capacity, caching, consistency.
- Reliability, defense in depth, recovery, security, operations, delivery.
- Product, organizational and socio-technical consequences.
- First-hand engineering cases and research on migration/quality trade-offs.
- Credentials, courses, books, labs, templates and roadmap.

## Incomplete areas requiring dedicated expansion

- Full systematic review of standards/frameworks (ISO/IEC/IEEE 15288, 42010, 25010, 27001, 27017, 22301, NIST, IEC safety standards and jurisdictional compliance).
- Exhaustive case-study crawl across all major engineering organizations and incident repositories.
- Full literature review including paywalled journals and citation graphs.
- Current region-specific credential prices, availability, taxes, prerequisites, renewal and languages for every certification; issuer pages are authoritative.
- Full mathematical depth for control/CPS and operations research; sector-specific regulatory engineering in aerospace, rail, automotive, medical and industrial control; telecom/5G, HPC/GPU systems, robotics/autonomy, financial-market infrastructure, energy grids and healthcare systems.
- Lab execution and peer review. The pack provides exercise specifications and rubrics, not claims that every lab was implemented, benchmarked or independently assessed.

## How to extend it systematically

1. Define domain scope, inclusion criteria, and source authority.
2. Search standards, academic work, official docs, implementation accounts, incidents/postmortems, criticism/failure, courses, credentials.
3. Read primary pages instead of relying on snippets.
4. Record date, author/issuer, source type, claims, evidence, limitations, URL, and note supported.
5. Deduplicate URLs; distinguish independent corroboration from repeated summaries.
6. Search counterexamples and conditions where a popular solution is inappropriate.
7. Add source IDs, update `sources.csv`, revise affected notes with date/version.
8. Re-check volatile items: exams, fees, renewals, courses, frameworks, service limits.

## Confidence labels for future additions

- **High:** standard/official specification, official exam guide, or multiple independent primary sources.
- **Moderate:** one detailed first-hand case or one well-described empirical study with limits.
- **Exploratory:** preprint, conceptual proposal, anecdote, or unverified vendor claim.

Source count is not confidence. Ten repeated vendor summaries are not ten independent sources.

## Date-sensitive fields

Snapshot: **5 November 2026**. Certifications, exams, fees, renewal, software versions, cloud services, standards, courses and security guidance change. Recheck issuer/standard owner before purchase, exam scheduling, or compliance assertions.

## Third-pass source extraction (5 November 2026)

The third pass decomposed the field into expert workstreams: systems-method pluralism; mission engineering; formal requirements; architecture governance; distributed correctness; data contracts/streaming; PRA/common-cause/PoF; STPA/safety cases; system security and cyber resilience; formal methods; human systems integration; real-time CPS; robust OR; sector functional safety; incident forensics; and agentic AI assurance. Exa discovery was followed by Firecrawl and TinyFish extraction where available.

Firecrawl credits were exhausted before the final planned follow-up extracts. TinyFish also reported target-unreachable, bot-blocked, timeout and empty-content results for a subset of pages. These failures are not counted as successful scrapes. See [79](79_ADVANCED_RESEARCH_METHOD_AND_SOURCE_PROVENANCE_LEDGER.md) and `DEEP_SCRAPE_AUDIT.csv` for the status at source level. The research snapshot does not guarantee every source in the global field has been found.

## Fourth research pass: evidence and configuration integrity

The fourth pass added DoW SoS engineering guidance (September 2026), NATO NAF 4.1 (March 2026), GSN v3, NASA human-machine teaming research (April 2025), NASA configuration-management processes, product-line engineering, human reliability analysis, sector-assurance applicability, value engineering and data-mesh/lakehouse research. The 2026 DoW SoS Guidebook and NAF 4.1 were fetched in Firecrawl/TinyFish; the NASA HMT memo and SEI product-line report were also extracted. The NASA CM standard record was fetched and found to be inactive for new design.

The expanded source register and `DEEP_SCRAPE_AUDIT.csv` record version and extraction status. `DEEP_COVERAGE_MATRIX.csv` records where the knowledge base is deep, partial or still map-level. Search results not fetched or blocked are not counted as fully reviewed.

## Additional fifth-level deep research pass (5 November 2026)

This pass added volumes 103–110 and refreshed the source register with official standard-status records, regulator guidance, NASA technical standards and handbooks. New full/targeted source extractions include NASA System Safety Handbook Volumes 1–2, the 2013 STPA Primer, NASA-HDBK-1009A, GSFC-HDBK-8004, NASA V&V outline, current FDA medical-device cybersecurity guidance, FAA AC references, ISO automotive/medical/architecture status pages, IEEE 1012-2024 and MIT/System Dynamics Society modeling resources.

The pass also explicitly records source failures and limits: the 2025 NASA objectives-driven risk-informed/case-assured safety guide PDF returned target_unreachable; GSFC-STD-7000B full PDF timed out in one extraction attempt although the official record and source were found; the 2013 STPA primer is explicitly incomplete in advanced sections; normative standards remain licensed; and current draft standards are not treated as published requirements.

## Sixth-level quantitative reliability pass (5 November 2026)

Volume 111 adds NIST reliability statistics references (Weibull, censoring, MLE, reliability test planning), MIL-HDBK-189C reliability-growth source record, NASA/SP-20230004376 Physics of Failure handbook, ISO 14224, IEC 61709 and SAE JA1011_202411. The volume explains model assumptions and limits; it does not include a runnable statistical notebook or use any illustrative calculations as empirical product evidence.

## Sixth-level extraction notes (5 November 2026)

Exa discovery was used to identify NIST repairable-system methods, NASA Markov reliability tutorials, ISO 13381-1:2025, NASA prognostics research/ProgPy, NASA workmanship and EEE parts standards, DLA DMSMS guidance, ISO 15939 measurement, NASA leading indicators, DoD supportability/LORA and NASA/RAND decision analysis. TinyFish extracted the NIST methods, Markov tutorials, prognostics material, NASA workmanship/EEE parts front matter, DLA DMSMS page, NASA measurement and decision handbooks. The latest January 2026 SD-22 PDF was not retrieved; the search result for March 2024 was explicitly a working draft. Some DoD IPS and product-support PDFs were blocked/unreachable. These limitations remain in DEEP_SCRAPE_AUDIT.csv.

## Citation and source-ledger reconciliation

This pass reconciled older citations with canonical source IDs already present in the master register, avoiding duplicate URL records for the DoW SoS/SE guidebooks, ISO/IEC/IEEE 15288 and the DoW R&M Body of Knowledge. The audit intentionally distinguishes full extraction from page-level discovery and failed file retrieval.
