# 77 — Reliability-centered maintenance and integrated product support

## Maintenance is a lifecycle design choice

Reliability-centered maintenance (RCM) selects failure-management strategies based on system functions, functional failures, failure modes/effects and consequences. It does not start by selecting a maintenance interval. DoD Manual 4151.25 (2024) defines the RCM analysis sequence and requires documented analysis, rationale and supporting data [S234].

## RCM analysis sequence

1. Identify the functions and required performance standards.
2. Identify functional failures (complete and partial loss/degradation).
3. Identify credible failure modes.
4. Describe failure effects at local, next-higher and end-item level.
5. Evaluate consequences: safety, environment, mission/operations and economics; distinguish hidden failures.
6. Select technically defensible maintenance tasks and intervals.
7. Consider other logical actions such as redesign, software changes, training, procedures, emergency actions or technical-data changes.

The decision priority is not “cheapest first”: safety and environmental obligations dominate, then mission consequences, then economic trade-offs. Hidden failures need failure-finding tasks because operators may not see the loss of a protective function.

## Maintenance-task categories

- **On-condition:** detect evidence of impending failure and act before functional failure. The inspection interval must be shorter than the potential-to-functional-failure (P-F) interval and the task must be applicable and effective.
- **Scheduled restoration:** restore acceptable resistance to failure at a specified interval regardless of observed condition.
- **Scheduled discard:** replace an item at a specified interval.
- **Failure finding:** periodically detect hidden failures of protective/standby functions.
- **Other logical action:** redesign, modification, operating or emergency procedure, training, or other control.

## R&M engineering integration

The SECNAV R&M Engineering Guidebook places reliability and maintainability engineering into design, development, production, test and sustainment. It lists predictions, PoF, FMECA, FTA, design of experiments, FRACAS, accelerated life testing, reliability growth, maintainability design, diagnostics, accessibility/removal analysis and maintainability demonstrations [S76]. Software-only programs may need availability and restore-time measures rather than hardware-style MTBF alone.

## Integrated product support

Supportability is an inherent design property and an enabling-system capability. It includes maintenance concept, supply support, support/test equipment, manpower/personnel/training, technical data, facilities, packaging/handling/storage/transport and logistics information systems. NASA's LCLS Guidebook describes these support elements throughout the lifecycle [S169]. The AIA/ASD S-Series IPS specifications seek interoperable lifecycle support data and processes [S235].

## Data and learning loop

A mature program preserves failure definitions, exposure, FRACAS records, causal analyses, corrective actions, action verification, maintenance task performance, false alarm/miss rates, spare consumption, repair turnaround, cost and mission availability. RCM assumptions often rely on subject-matter experts when operating data are missing; identify those assumptions and use age exploration, monitoring or test to reduce uncertainty.

## Limits

Maintenance cannot create reliability beyond the inherent design and operating context. Poor maintainability, inaccessible components, unavailable spares, untrained operators or unreliable diagnostics can invalidate a theoretically adequate maintenance strategy. A task that is not measurable, accessible, safe, timely and cost-effective is not a viable control.
