# 99 — Architecture evaluation: ISO 42030, ATAM and evidence-based review

## Evaluation asks whether the architecture is fit for its intended purpose

An architecture review is not just an inspection of diagrams. It assesses whether the architecture addresses stakeholder concerns, supports intended objectives, creates value, and exposes risks/opportunities. ISO/IEC/IEEE 42030:2019 provides an architecture-evaluation framework for enterprise, systems and software. The ISO record says the 2019 edition was reviewed and confirmed in 2025 and remains current. [S273]

## Separate evaluation purpose from evaluation method

Define whether the evaluation is intended to:

- validate stakeholder concerns are addressed;
- assess quality attributes and trade-offs;
- compare competing architecture alternatives;
- identify risk and opportunity;
- assess progress toward architecture objectives;
- determine whether the implemented entity matches the intended architecture;
- inform investment, acquisition or change decisions.

The question determines evidence, participants, timing and required analysis.

## QAW and ATAM

The Quality Attribute Workshop (QAW) elicits and prioritizes quality attribute scenarios early, before the architecture is fully formed. ATAM analyzes an architecture relative to quality attribute goals, exposing risks, non-risks, sensitivity points and trade-off points. These methods complement rather than replace each other. [S193, S142]

A quality attribute scenario should identify:

- source of stimulus;
- stimulus;
- environment;
- affected artifact;
- response;
- response measure.

Examples: under peak load, p99 latency remains below a target; during a dependency outage, a critical workflow degrades to a defined safe mode; after a security update, the system can roll back within a maximum time; after a schema change, downstream consumers remain compatible.

## Evaluation sequence

1. define purpose, scope and decision authority;
2. establish stakeholders and concerns;
3. document business/mission drivers and quality attribute scenarios;
4. describe architecture decisions and the mechanisms intended to satisfy each scenario;
5. select analysis methods (inspection, model analysis, simulation, performance modeling, threat modeling, reliability analysis, prototype or test);
6. identify assumptions, dependencies and model fidelity;
7. analyze architecture approaches against prioritized scenarios;
8. capture risks, sensitivities, trade-offs and non-risks;
9. present conclusions and recommended actions;
10. track remediation and evaluate conformance in implementation.

## Evaluation method selection

Choose method based on consequence, architectural maturity, information available and decision stakes. A workshop may be sufficient for early risk discovery; performance modeling is required for quantitative capacity claims; formal methods may be justified for safety/security protocol correctness; prototype/test evidence is needed where models cannot establish implementation behavior.

## Architecture fitness functions

A fitness function is an automated or repeatable test of a property the architecture is intended to preserve. Examples include dependency direction, API compatibility, latency budgets, encryption policy, data retention, forbidden library detection, service-level thresholds and deployment topology constraints. Fitness functions should be tied to an architectural decision/quality attribute, versioned, owned and reviewed. Passing a fitness function does not establish all dimensions of architecture quality.

## Practical deliverable

Evaluate a proposed event-driven platform using ISO 42030-style evaluation goals, QAW scenarios and an ATAM-style utility tree. Include one architecture model, a performance experiment, a security analysis, a dependency/conformance test and a written risk/trade-off report.

## Source limitations

ISO 42030 full normative text is licensed; the public ISO record and abstract were extracted. ATAM and QAW are method guidance, not certification by themselves. [S273, S193, S142]
