# 115 — DMSMS, obsolescence, supply assurance and lifecycle resilience

**Depth:** Expert · **Evidence date:** 5 November 2026

## 1. DMSMS is a lifecycle engineering problem

Diminishing Manufacturing Sources and Material Shortages (DMSMS) is the loss, or impending loss, of manufacturers/suppliers of items, raw materials or software. A supplier may discontinue production or support, or a needed raw material may become unavailable. The consequences are not limited to procurement price: the effects can include readiness, schedule, cost, system performance, safety, cybersecurity and loss of the ability to sustain a system [S330].

The official Defense Standardization Program Office DMSMS page records that SD-22, _DMSMS: A Guidebook of Best Practices and Tools for Implementing a DMSMS Management Program_, was updated in January 2026. The official page describes it as covering both electrical and mechanical part obsolescence and as addressing cost, schedule and performance. The January 2026 PDF itself was not fully retrieved in this pass; therefore this document relies on the official publication page for the version/update claim, not on an unverified copy of the guidebook [S330].

## 2. Continuous DMSMS process

A risk-based programme should be active from concept/architecture through disposal:

1. **Establish the item universe:** parts, materials, software, tools, test equipment, manufacturing process dependencies and support equipment.
2. **Define criticality:** mission/safety function, failure consequence, redundancy, repairability, lead time, installed base and system population.
3. **Monitor supply signals:** manufacturer lifecycle status, product discontinuance notices, supplier health, raw material constraints, software support end dates, export/trade constraints and counterfeit indicators.
4. **Assess impact:** affected configurations/serial numbers, replenishment horizon, engineering change effort, qualification/recertification, tooling, test and supply risk.
5. **Select mitigation:** lifetime buy, alternate supplier, form-fit-function replacement, redesign, modular/open interface, repair/harvest/cannibalization, software migration, redesign of test/support tooling, or managed obsolescence.
6. **Implement and qualify:** engineering change, qualification/acceptance, safety/cybersecurity analysis, documentation update, supply chain approval and as-built/as-maintained data.
7. **Verify closure:** parts coverage, spares, updated technical data, approved substitution, revised support plan and residual risk acceptance.

## 3. Architecture decisions that reduce future obsolescence exposure

- Avoid unnecessary single-source dependence for critical parts.
- Separate stable interfaces from replaceable implementations using modularity and well-defined interface control.
- Maintain data rights, design disclosure and test access needed for replacement or repair.
- Track software dependencies, build tools, firmware, licenses and security support end dates—not just physical components.
- Avoid choosing parts with a lifecycle shorter than the programme’s intended production and sustainment horizon unless an explicit mitigation is approved.
- Preserve alternate-source qualification evidence and substitution design rules.

Modularity is not sufficient by itself. A nominally swappable module may still depend on proprietary tooling, undocumented firmware, a shared certification baseline or a sole-source connector.

## 4. NASA EEE parts policy connection

NASA-STD-8739.10 states that long-life projects and heritage hardware are exposed to EEE parts obsolescence risk. It calls for availability assessment before part selection, continuous monitoring during the lifecycle, review of as-designed EEE parts lists before PDR and CDR, avoidance of obsolete/projected-obsolete parts without approval, and documentation of mitigation measures in an EEE Parts Management and Control Plan. The standard names part substitution, multiple sourcing and lifetime buy as mitigation types [S329].

It also explains why early notice matters: manufacturer product discontinuance and GIDEP notices can give projects a planning window. The exact notice lead time is not guaranteed and should be validated for the actual supplier and commodity.

## 5. Risk and prioritization model

An obsolescence-risk model should not rely on a single red/amber/green status. Consider at least:

- time to projected end of production/support versus time to need;
- remaining supplier capacity and sole-source condition;
- demand rate and stock position;
- lead time and procurement variability;
- qualification and design-change duration;
- impact of failure or unavailable repair on mission readiness;
- availability of an alternate and evidence needed to qualify it;
- cybersecurity vulnerability and software support status;
- cross-program commonality (other programmes may compete for the same source).

A critical item with abundant stock but no qualified replacement may be a larger long-term risk than a low-criticality commodity with an impending EOL notice.

## 6. Metrics

Useful programme measures include: percent of critical parts with monitored lifecycle status; percent of critical items with qualified alternate; forecast years of supply; count and age of unresolved obsolescence notices; schedule exposure of unresolved DMSMS cases; mitigation cost versus avoided lifecycle cost; number of redesign/qualification actions on critical path; fraction of installed configurations affected; and repeat obsolescence events per supplier/part family.

Metrics need explicit denominators and update frequency. “Number of obsolescence notices closed” can reward closing easy cases while high-criticality risks remain unmitigated.

## 7. Source access and status limits

The DLA DMSMS page is the authoritative source used for the January 2026 SD-22 update status. The March 2024 SD-22 PDF found in search is marked as a working draft and was not treated as the current guidebook. The page itself gives the January 2026 update but the actual new PDF was not retrievable via the scraper, so the full clauses are not represented here [S330–S331].

## Sources

- [S330] Defense Standardization Program Office, DMSMS programme and SD-22 guidebook page (updated January 2026; page-level extraction).
- [S329] NASA-STD-8739.10, EEE Parts Assurance Standard (2017; full PDF text extracted), including parts obsolescence sections.
- [S348] March 2024 SD-22 Working Draft — historical draft only, not current authoritative copy.
