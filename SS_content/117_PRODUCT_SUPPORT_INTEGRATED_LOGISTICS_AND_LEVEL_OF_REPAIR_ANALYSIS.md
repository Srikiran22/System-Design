# 117 — Product support, integrated logistics and Level of Repair Analysis

**Depth:** Expert · **Evidence date:** 5 November 2026

## 1. Supportability must be engineered with the system

Supportability is the ability to sustain a required capability throughout the intended service life. It is shaped by design choices: fault isolation, modularity, access, line-replaceable units, built-in test, diagnostics, software updateability, technical data, training, tools, facilities, spares, supply chains and maintenance concept.

A system that achieves its technical performance in a demonstration but cannot be maintained, supplied, updated or safely returned to service is not a complete lifecycle solution.

## 2. Integrated Product Support (IPS)

The DoD/DoW product support framework organizes supportability planning through IPS elements. DoDI 5000.91 is the product support policy reference for the Adaptive Acquisition Framework. The IPS Guidebook (January 2024) provides lifecycle implementation guidance and identifies the 12 IPS elements [S338–S339].

Typical IPS element groups include product support management; design interface; sustaining engineering; supply support; maintenance planning and management; support equipment; technical data; training and training support; manpower and personnel; facilities and infrastructure; packaging/handling/storage/transportation; and computer resources support. Use the governing official guidebook and current DoDI to confirm the exact term list and mapping before contract use.

## 3. Product Support Manager and LCSP

The Product Support Manager (PSM) integrates technical engineering, acquisition, sustainment organizations and support providers. The Life-Cycle Sustainment Plan (LCSP) captures the support strategy, implementation, performance outcomes, risks and evolution through lifecycle phases. PSM involvement early in design enables supportability requirements and trade-offs to influence architecture rather than trying to retrofit maintainability after CDR [S338,S340].

A useful supportability thread is:

`Mission availability requirement → reliability / maintainability allocations → maintenance concept → support analysis → IPS resource plan → product support package → performance-based outcomes → field data → sustainment improvement`.

## 4. Level of Repair Analysis (LORA)

LORA evaluates whether an item should be replaced, repaired or discarded at a given maintenance level (organizational/unit, intermediate, depot or other tailored level). It considers not only the repair-vs-replace part cost, but labor skill, diagnostic/test equipment, facilities, turnaround time, transportation, spares, repair yield, capital/tooling, inventory and readiness effects.

The DoD MIL-HDBK-1390 LORA handbook is listed as active in DLA ASSIST, with a document date of 29 January 2015 and validation notice 11 September 2024. It is guidance and cannot be cited as a requirement [S341].

### LORA decision sequence

1. Apply non-economic decision criteria (safety, policy, special process, technical restrictions, security, capability or mission constraints).
2. Identify feasible repair/replacement alternatives and maintenance levels.
3. Define demand, failure, repair and support scenarios.
4. Estimate cost, delay, readiness, inventory and resource consequences.
5. Account for uncertainty in failure rate, repair time, cost, repair yield, demand and logistics lead time.
6. Select a support solution using lifecycle economics and mission constraints.
7. Translate the result into support equipment, manpower, training, facilities, supply and technical data requirements.
8. Revisit the analysis when configuration, field reliability, supplier base, maintenance concept or mission profile changes.

A pure minimum-cost result is not automatically acceptable: it must satisfy safety, technical, readiness and policy constraints. The economic model needs a consistent scope and time horizon; costs shifted to a separate budget or organization should not be treated as zero.

## 5. Product Support Analysis and logistic data

LORA sits within the wider Product Support Analysis (PSA) process. It consumes and produces analysis information used by maintenance task analysis, support equipment selection, supply support, manpower, technical data and other IPS activities. Data models and common identifiers are essential to avoid separate inconsistent bills of material, maintenance and support records.

The S-Series IPS standards (S1000D, S2000M, S3000L, S4000P, S5000F, S6000T and SX000i) provide structured information exchange for technical publications, material management, logistics analysis, maintenance, in-service data and training. Specifications have their own revisions and usage terms; do not assume an older schema is compatible with the latest release [S262].

## 6. Reliability outcomes and support performance

Support metrics should measure outcomes rather than only support activity counts. Include materiel availability, operational availability, mission capable rate, material reliability, maintenance downtime, supply response time, repair turnaround, demand satisfaction, cost per operating hour, cost per mission, maintenance burden, and technical-data/training readiness.

Use carefully scoped definitions. Materiel availability, mission availability and operational availability are not synonyms. A measure must state whether supply delay, scheduled maintenance, administrative delay, transport and mission-specific degraded operation are included.

## Sources

- [S339] DoDI 5000.91, _Product Support Management for the Adaptive Acquisition Framework_ (official DoD issuances; check amendments and current supersession).
- [S338] Integrated Product Support Elements Guidebook (January 2024, version 1.1b; public file discovery, direct extraction blocked in this pass).
- [S340] DoD Product Support Manager Guidebook (May 2022; guidebook page captured, direct extraction blocked by bot protection).
- [S341] MIL-HDBK-1390, _Level of Repair Analysis_ (DLA ASSIST record; active, 2015 document with 2024 validation notice; guidance only).
- [S262] ASD / S-Series integrated product support specifications and official S-Series downloads.
