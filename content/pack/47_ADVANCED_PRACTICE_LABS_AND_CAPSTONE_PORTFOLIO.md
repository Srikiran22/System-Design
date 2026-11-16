# 47 — Advanced practice labs and portfolio capstones

The exercises below produce artifacts that can be reviewed by another engineer. A portfolio should show the reasoning, alternatives, evidence and failure analysis—not only a final diagram.

## Progression

| Level                       | Project                                             | Required deliverables                                                                                | Main evidence of competence                                      |
| --------------------------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| 1 — Foundation              | Design a campus parcel-delivery service             | context, stakeholders, ConOps, 20 requirements, 5 quality scenarios                                  | clear boundary and measurable need                               |
| 2 — Software architecture   | Design a commerce/order platform                    | C4 views, domain map, API/event contracts, ADRs, modular-monolith alternative                        | architecture justified by domain and quality drivers             |
| 3 — Distributed systems     | Design inventory and payment workflows              | consistency matrix, idempotency, outbox, saga, reconciliation and failure tests                      | correct handling of ambiguous outcomes and partial failure       |
| 4 — Data engineering        | Migrate a legacy student-record system              | data inventory, schema mapping, data quality rules, CDC/cutover and rollback                         | data integrity and operational continuity                        |
| 5 — Reliability             | Architect a multi-region booking service            | SLOs, capacity model, failure domains, RTO/RPO, restore drill and degraded modes                     | reliability decisions tied to user outcomes and cost             |
| 6 — Security                | Threat-model a multi-tenant SaaS product            | data flows, trust boundaries, STRIDE threats, security requirements, test plan                       | attack paths mapped to controls and evidence                     |
| 7 — Safety                  | Analyze an autonomous campus robot                  | hazard log, STPA or FTA/FMEA, safety constraints, safe-stop and validation scenarios                 | interaction hazards and human factors addressed                  |
| 8 — Enterprise architecture | Modernize a regional hospital information landscape | capability map, BPMN, data governance, transition roadmap and risk register                          | target state linked to business outcomes and migration realities |
| 9 — MBSE                    | Model a small satellite or autonomous vehicle       | requirement, structure, behavior, interface, parametric and verification models                      | model purpose, traceability and governance                       |
| 10 — AI architecture        | Build an internal policy assistant                  | RAG architecture, permission propagation, evaluation dataset, prompt-injection tests, human fallback | grounded outputs, secure access and measurable evaluation        |

## Integrated capstone: regional emergency-response platform

Design a socio-technical system spanning citizens, dispatch, emergency service providers, hospitals, transport, identity, maps, communications and public authorities. Treat it as a system of systems.

### Required work products

1. Mission, stakeholder register, boundary/context model and ConOps.
2. Operational scenarios including normal, surge, communications loss, false reports, data corruption and cyber incident.
3. Requirements baseline with quality scenarios and traceability.
4. Enterprise capability and BPMN process models.
5. Logical/physical architecture and integration/interface control documents.
6. Data ownership, privacy classification, lineage and retention model.
7. Architecture alternatives and trade study with cost, schedule, risk and reversibility.
8. Threat model, hazard analysis and assurance argument.
9. Resilience design with independent communication, recovery, manual dispatch and reconciliation paths.
10. Test strategy, simulation, load model, operational exercise and acceptance criteria.
11. Deployment and migration roadmap, governance, staffing, training and supportability plan.
12. Post-implementation metrics and feedback process.

## Review rubric

Score each dimension 0–4 with evidence: problem framing; stakeholder coverage; requirement quality; architecture coherence; quality-attribute reasoning; interface/data ownership; failure analysis; safety/security; V&V adequacy; operations/recovery; lifecycle economics; documentation and decision rationale. A high aggregate score cannot hide a zero in a safety-critical mandatory dimension.

## Weekly training loop

- Read one authoritative chapter/standard excerpt.
- Reproduce one diagram or analysis from a reference system.
- Apply it to the project.
- Write a one-page decision record.
- Run one failure or misuse scenario.
- Get an independent review.
- Revise and record what evidence changed the decision.

## What counts as a strong portfolio

A reviewer should be able to understand the problem, inspect source assumptions, trace a requirement to test evidence, reproduce a trade study, see the failure modes considered, understand the alternatives rejected, and identify remaining uncertainty. A polished diagram without traceability and testable assumptions is weak evidence.
