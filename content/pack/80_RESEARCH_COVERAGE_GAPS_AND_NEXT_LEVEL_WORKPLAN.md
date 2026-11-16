# 80 — Research coverage gaps and next-level workplan

## Coverage expanded in this pass

This pass deepened systems methods and boundary critique, mission engineering, formal requirements and evidence chains, architecture governance, distributed correctness, data contracts, probabilistic risk, STPA/safety cases, security and cyber resilience, formal verification, human systems integration, real-time CPS, robust OR, sector functional safety, incident forensics and agentic AI security.

## Remaining high-value gaps

| Gap                               | What is missing                                                                            | Evidence needed                                                                                                 |
| --------------------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| CSH/SSM primary text extraction   | Some foundational chapters were unreachable                                                | Accessible primary chapter, complete method example and boundary critique case                                  |
| DoDAF/UAF implementation          | DoDAF PDF was discovered but not fully fetched; UAF viewpoint-level details remain shallow | Official metamodel, viewpoint catalog, example mission architecture and tooling interoperability                |
| Sector standards                  | Normative text not fully reviewed                                                          | Official standard editions/amendments, regulator advisory circulars, certification evidence examples            |
| Nuclear/rail/medical assurance    | Domain maps are present, but specialist depth remains limited                              | Safety-case examples, hazard-control traceability and regulator investigation records                           |
| Formal verification practice      | Method families covered, but tool tutorials and evidence pipelines remain partial          | TLA+, Alloy, SPIN, model checking, refinement and CI-integrated proof examples                                  |
| Human reliability                 | Human factors covered, not a complete HRA curriculum                                       | NASA/NUREG HRA methods, workload, error probability assumptions and limits                                      |
| Software product-line engineering | Architecture governance covered, but variability management is not deep                    | Feature models, product-line architecture evaluation and release evidence                                       |
| Configuration and digital thread  | Baselines are covered, but industrial PLM/ALM lifecycle not exhausted                      | Configuration item data models, change boards, digital thread governance and CM standards                       |
| Sustainability                    | LCA map and ITU-T L.1801 are covered, not a full quantitative course                       | Functional unit, system boundary, allocation, uncertainty, embodied impacts and independent studies             |
| AI agent assurance                | 2026 threat taxonomy and controls are covered; test data and benchmarks are evolving       | Reproducible multi-agent benchmark, agent incident reports, tool-authorization and runtime safety case examples |
| Mission engineering               | Process and metrics covered; operational analytics examples remain limited                 | Full public mission analysis example with model/data/evidence provenance                                        |
| Cost and uncertainty              | Lifecycle economics is covered conceptually                                                | Cost estimating relationships, uncertainty propagation, value of information and quantitative cost-risk models  |

## Prioritized continuation sequence

1. Fetch primary text and build example sets for CSH/SSM, DoDAF/UAF and mission architecture.
2. Create sector-specific tracks with regulator source hierarchies and a standard/version applicability matrix.
3. Add executable labs: SysML model, TLA+ protocol model, reliability block diagram/PRA toy model, STPA control structure, data migration reconciliation and agent threat harness.
4. Add source-grounded incident case studies with timelines, causal factors, design controls, validation evidence and recovery lessons.
5. Create a formal evidence graph: need → requirement → architecture → hazard/security control → implementation → verification → validation → operational metric.
6. Review every source record annually or on standards/tool revision events.

## Definition of done for a topic

A topic is only mature when it includes: definitions; assumptions; process; artifact templates; quantitative methods where relevant; trade-offs; failure modes; standards/regulatory scope; at least one real case; a practical exercise; source quality and gaps; and an evidence link to adjacent disciplines. A topic should not be called complete merely because a long glossary exists.

## Fourth-pass additions and remaining gaps

Documents 82–95 add: GSN assurance cases, current SoS engineering guidance, NATO/DoDAF/UAF architecture context, configuration baselines/digital thread, product-line variability, HRA, uncertainty/value of information, value engineering, data-platform correctness, human-machine teaming, sector applicability, incident forensics and provenance governance. The machine-readable coverage matrix is `DEEP_COVERAGE_MATRIX.csv`.

Remaining specialist gaps: (1) full licensed GSN standard and sector-specific safety-case acceptance examples; (2) regulator-approved assurance/certification bases by jurisdiction; (3) complete HRA method manuals and empirical calibration datasets; (4) field-tested product-line variability cases; (5) end-to-end model-to-implementation conformance tools; (6) independently measured AI/ICT LCA datasets; (7) full official NTSB/Ariane 501/RTGS reports for the discovery-only cases. These are explicitly not claimed as complete.

## Sixth-level additions (5 November 2026)

Volumes 112–118 extend the repository into repairable-system point-process and Markov models, PHM/RUL and prognostics, manufacturing and EEE-parts assurance, DMSMS/obsolescence, systems-engineering measurement and leading indicators, IPS/LORA product support, and Bayesian/RIDM/robust decisions under deep uncertainty. Important remaining gaps include executable statistical and Markov labs, current full-text SD-22 January 2026, the DoD IPS and product-support guide PDFs, a full manufacturing quality case, and a validated RDM/EVI model. See the updated coverage matrix and scrape audit for source-by-source depth and access status.
