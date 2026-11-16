# 75 — Engineering incident forensics and system failure cases II

## How to read an incident report

Separate the initiating event from latent conditions, technical root cause, contributing factors, organizational decisions, detection/recovery performance and consequences. Avoid “one-line root cause” narratives. Build a causal timeline and distinguish direct evidence from inference.

## CrowdStrike Channel File 291 (19 July 2024)

CrowdStrike's external technical RCA describes an input-field count mismatch in the Content Interpreter path: a new template instance required a 21st input parameter while the interpreter path processed 20. The mismatch led to an out-of-bounds memory read and system crashes. The report discusses validation gaps, missing runtime bounds checks, template-type testing gaps, validator logic and staged rollout mitigations [S224].

**System lessons:**

- Interface contracts must be checked at producer/consumer boundaries.
- Schema/template changes need compile-time and runtime validation.
- Test design must cover all input shapes and boundary conditions.
- Rapid content distribution is a safety-critical deployment path when the product runs in kernel space.
- Staged rollout, rollback, observability and kill-switches are system design requirements, not release-ops decoration.

## NATS flight-planning failure (28 August 2023)

The UK CAA independent review examines the NATS En Route flight-planning system failure and its causes, communication, resilience, investment and recovery [S225]. A particular flight-plan data combination triggered an exception condition; automatic processing ceased and manual input was used to maintain service at lower throughput. The report considers engineering capacity, system design, contingency arrangements, stakeholder engagement and resilience.

**System lessons:**

- Rare combinations can reveal untested state-space regions.
- Safe shutdown can preserve data integrity while sharply reducing capacity; contingency throughput must be engineered and tested.
- Recovery time and degraded-mode capacity are mission-level requirements.
- Stakeholder communication and industry-wide dependencies belong in the system context.

## Alaska Airlines Flight 1282 / Boeing 737-9 exit door plug (5 January 2024)

The NTSB final aviation investigation report AIR-25-04 (24 June 2025) documents the in-flight separation and rapid depressurization, injuries and safety recommendations [S226]. Use the official report to distinguish physical evidence, maintenance/production records, process controls, organizational oversight and recommendations. Do not replace the report's findings with a simplistic “bolt missing” summary.

**System lessons:**

- Configuration traceability and work-package completion records are safety-critical.
- Design, manufacturing, inspection, maintenance and oversight create a coupled lifecycle control system.
- Human factors and documentation must be analyzed alongside component integrity.

## Ariane 501 (4 June 1996)

The ESA inquiry report documents the Ariane 5 maiden-flight failure and the investigation [S227]. Use it to study reused software, assumptions about input ranges, common-mode behavior across redundant inertial reference systems, and system-level verification against the new flight envelope. The case is often compressed to “integer overflow”; the engineering lesson is broader: reused components and their assumptions must be validated in the new system context, and redundant channels do not protect against common design/software faults.

## Bank of England RTGS outage (20 October 2014)

The independent review describes a configuration change associated with a CHAPS membership transfer; a rare deletion operation triggered a latent defect and a chain of downstream defects, with the system failing non-cleanly [S228]. The case illustrates configuration changes, exceptional operational paths, latent design defects, and the difference between a technically routine change and a low-risk change.

## Cross-case review template

For each incident, capture:

1. Mission/service and system boundary.
2. Trigger, timeline and propagation path.
3. Direct technical cause and latent design assumptions.
4. Requirements, tests and assurance evidence that should have found the issue.
5. Shared dependencies and correlated failure.
6. Human, organizational, supplier and governance factors.
7. Detection, containment, degraded mode and recovery.
8. Impact and affected stakeholders.
9. Corrective actions and evidence they work.
10. Reusable design principles and context-specific limitations.
