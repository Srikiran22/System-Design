# 95 — Cross-domain engineering evidence graph and integrated capstone

## Why an evidence graph is needed

In a complex system, requirements, hazards, security threats, architecture decisions, data contracts, human tasks, verification results and operational measures are interdependent. Separate spreadsheets can hide important relationships. The evidence graph preserves the chain from need through operation and change.

## Core node types

- stakeholder, user, operator, maintainer and regulator;
- mission, use case, scenario and operational environment;
- need, requirement, constraint and quality attribute;
- architecture element, interface, data object and configuration item;
- hazard, threat, failure mode, risk and assumption;
- control, mitigation, safety constraint and security control;
- verification case, validation case, test, analysis and evidence item;
- release, deployed configuration, operational metric and incident;
- decision, trade study, waiver, exception and approval.

## Important relationship types

`derives_from`, `allocated_to`, `implemented_by`, `interfaces_with`, `depends_on`, `exposes_to`, `mitigates`, `verified_by`, `validated_by`, `evidenced_by`, `assumed_by`, `approved_by`, `supersedes`, `deployed_as`, `monitored_by`, `changed_by`.

Relations should have provenance and validity interval. A requirement can be verified by a test only for a specific configuration; if the baseline changes, the relation may need to be revalidated.

## Bidirectional questions

A mature graph supports both forward and backward queries:

- For every stakeholder need, what requirements, architecture and verification evidence satisfy it?
- For every hazard, what controls are implemented and verified?
- For every software/data/interface change, which requirements, safety/security cases and tests are impacted?
- For every operational SLO breach, which design assumptions and dependencies are implicated?
- For every supplier component, which versions, vulnerabilities, tests and product variants depend on it?
- For every claim in the assurance case, what evidence and assumptions support it?

## Integrated capstone: autonomous emergency logistics network

Design a multi-agency network of drones, vehicles, hospitals, dispatch software, public data feeds, identity, maps and AI tasking agents. The system must deliver medical supplies in a disrupted region while preserving safety, security, privacy and traceability.

### Deliverables

1. Problem statement, boundary critique and stakeholder map.
2. Mission model, ConOps, mission threads and MOE/MOP definitions.
3. Requirements model with bidirectional traceability and change control.
4. SoS architecture using a fit-for-purpose framework and semantic model.
5. Interface/data contracts for identity, location, inventory and task execution.
6. Failure analysis: fault tree, FMEA/FMECA and STPA control structure.
7. Cyber threat model, SBOM/provenance plan and least-privilege agent design.
8. HSI/task analysis and human-machine teaming control points.
9. Reliability/availability model including common-cause dependencies.
10. Verification and validation strategy with test evidence, simulation assumptions and field validation plan.
11. Assurance case with claims, context, assumptions, evidence and defeaters.
12. Lifecycle cost, product support, sustainability and retirement concept.
13. Configuration baseline, digital thread and incident/learning loop.

## Review gates

At concept review, challenge the problem boundary and value proposition. At architecture review, challenge quality attributes, interface contracts, hazard controls and model fidelity. At preliminary design review, verify requirements allocation, trade studies, risk reduction and verification planning. At critical design review, examine detailed architecture, configuration, safety/security evidence and manufacturing/supportability. At test readiness review, validate procedures, instrumentation, environment, anomaly process and configuration. At operational readiness review, assess training, monitoring, fallback, recovery, incident response and residual risk acceptance.

## Scoring rubric

| Dimension       | Weak                                      | Strong                                                              |
| --------------- | ----------------------------------------- | ------------------------------------------------------------------- |
| Problem framing | Solution-first, unclear boundary          | Explicit system context, competing perspectives and value           |
| Requirements    | Ambiguous and untraceable                 | Testable, allocated, versioned and change-controlled                |
| Architecture    | Diagrams without decision rationale       | Views answer concerns; decisions linked to scenarios and trade-offs |
| Safety/security | Checklist after design                    | Constraints and controls shape architecture and lifecycle           |
| Reliability     | Redundancy assumed independent            | Shared dependencies and common cause modeled                        |
| Human factors   | User training compensates for poor design | Human work modeled and evaluated as part of system                  |
| Evidence        | Test names and pass/fail only             | Configuration-aware evidence and explicit claim argument            |
| Operations      | Nominal path only                         | Degraded modes, recovery, feedback and support engineered           |
| Economics       | Initial cost only                         | Whole-life cost, uncertainty and sensitivity explained              |
| Governance      | Ownership unclear                         | Decision rights, change authority and provenance defined            |

## Final challenge

Introduce a delayed map-data feed, a compromised identity token, a supplier firmware update and a sudden increase in hospital demand. Update the mission thread, risk model, controls, architecture decision record, test set and assurance case. Explain which evidence has become stale and why.

## Source basis

This capstone integrates the methodological, mission, architecture, requirements, safety, security, formal-methods, HSI, operations and sustainment sources in volumes 61–94. No single framework or certification subsumes the entire evidence chain.
