# 39 — MBSE, SysML, digital engineering and model governance

## MBSE is an approach, not a software purchase

Model-Based Systems Engineering (MBSE) uses formalized models to support requirements, architecture, analysis, design, integration, verification and lifecycle communication. A model should answer a decision or engineering question. The goal is not to convert every document into a diagram or create one enormous model of everything.

## Model with purpose

For each model define: intended decisions; stakeholders; scope and boundary; fidelity; lifecycle stage; source data; assumptions; responsible owner; update triggers; interfaces; validation criteria; and reuse conditions. Start with the smallest model that reduces uncertainty or enables traceability. NASA MBSE adoption guidance emphasizes planning and model purpose rather than all-or-nothing modeling. [S112]

## Model families

- Requirements and stakeholder models.
- Operational/concept models: use cases, mission threads, operating modes and external actors.
- Structural models: hierarchy, composition, allocations, interfaces, ports and connectors.
- Behavioral models: activities, interactions, state machines, sequence and timing.
- Parametric/analytical models: equations, constraints, mass/power/performance budgets and trade spaces.
- Verification models: test cases, requirements coverage, verification cases and evidence.
- Architecture views: mission, functional, logical, physical, deployment, safety, security and lifecycle views.

## SysML v2

OMG published the formal SysML 2.0 specification in September 2025. The language is intended to support requirements, structure, behavior, analysis and verification modeling; it provides textual and graphical representations and an associated Systems Modeling API and Services specification. [S124, S112]

Distinguish the language from tool products, training courses, profile conventions and enterprise modeling methods. SysML v2 formal publication does not mean every tool, integration, migration workflow or organization is equally mature. Confirm tool conformance, API coverage, import/export fidelity, model governance and training before selecting a platform.

## Model architecture and traceability

A model should support typed relationships among need, requirement, function, logical element, physical component, interface, analysis, test, hazard, threat and evidence. Make ownership and baselines explicit. Avoid a single ungoverned central repository where hundreds of authors can silently change semantics.

## Digital thread and digital twin

- **Digital thread:** linked lifecycle information connecting requirements, models, design, implementation, manufacturing, operations, maintenance and retirement.
- **Digital twin:** a digital representation connected to an actual system or process with defined synchronization, data and intended uses. A static CAD model is not automatically a digital twin.
- **Simulation model:** representation used to explore behavior under conditions; may be offline and not connected to a live asset.

The useful twin is fit for a named purpose: state estimation, predictive maintenance, control, design validation, training or lifecycle configuration. State refresh frequency, sensor quality, calibration, latency, uncertainty, model drift and operating envelope.

## Model quality and governance

1. Define a modeling method and semantic rules.
2. Assign model element owners and configuration status.
3. Manage libraries, reusable patterns, naming, units and interface definitions.
4. Validate model constraints and run automated consistency checks.
5. Test model transformations and import/export paths.
6. Keep a baseline and change-impact mechanism.
7. Preserve rationale and evidence for critical model-derived decisions.
8. Check whether the model remains valid after operational or supplier changes.

## Common MBSE failures

- Modeling without a decision use case.
- Buying a tool before agreeing modeling semantics and governance.
- Treating the model as authoritative while it is stale.
- Optimizing model completeness rather than usefulness.
- Modeling only nominal behavior and omitting abnormal modes and interfaces.
- Confusing a visually attractive diagram with a formally constrained model.
- Failing to connect model elements to tests and real implementation evidence.

## Adoption path

Pilot one engineering decision with a measurable payoff—requirements change impact, interface consistency, mass/power allocation, hazard traceability or verification coverage. Establish ownership and version control; compare model and document workflows; measure defect detection, cycle time and rework; then expand only where the benefit exceeds model maintenance cost.
