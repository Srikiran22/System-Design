# 64 — Architecture governance, conformance, evolution and erosion

## Architecture is a set of consequential decisions

An architecture description communicates a system's elements, relationships, environment, principles and rationale to stakeholders. ISO/IEC/IEEE 42010 provides a conceptual framework for architecture descriptions, stakeholders, concerns, viewpoints, views and correspondence; the current edition identified in this research is 42010:2022 [S120]. It does not prescribe one universal diagram notation or one architecture method.

## Governance is not a review board alone

Architecture governance is the set of decision rights, policies, practices and evidence used to keep design choices aligned with stakeholder concerns, system constraints and lifecycle intent. It should specify:

- decision authority and escalation paths;
- who owns cross-cutting concerns and interfaces;
- what decisions require review and why;
- which standards, patterns or constraints apply;
- how exceptions are requested and time-bounded;
- where rationale, assumptions and consequences are recorded;
- how implementation is checked and architecture updated.

## Conformance has multiple strengths

1. **Syntactic conformance:** diagrams/models obey notation and schema.
2. **Structural conformance:** implementation dependencies match intended boundaries.
3. **Behavioral conformance:** interaction and state behavior match specified contracts.
4. **Quality conformance:** performance, availability, security, modifiability and other attributes meet targets.
5. **Operational conformance:** deploy, recovery, observability, support and change practices match the intended operating model.
6. **Contextual validity:** assumptions and architecture still fit stakeholder needs and environment.

Passing a static architecture lint does not prove runtime quality or contextual validity.

## Architecture evaluation

The SEI's Architecture Tradeoff Analysis Method (ATAM) evaluates architecture against prioritized quality-attribute scenarios and identifies risks, non-risks, sensitivity points and tradeoff points [S193]. A Quality Attribute Workshop (QAW) helps stakeholders identify and prioritize scenarios before architecture is established [S125]. The two methods complement rather than replace design reviews, prototypes, tests and operational data.

## Architecture fitness functions

A fitness function is an automated or repeatable check of a property that matters to architecture evolution. Examples include dependency direction, API compatibility, schema evolution, latency budgets, deployment isolation, security policy, image provenance, license policy and recovery time. Each fitness function needs owner, scope, threshold, execution cadence, failure action, false-positive policy and versioning. A metric without an enforcement or review response is only telemetry.

## Decision records

A concise architecture decision record should include context, decision, alternatives considered, rationale, consequences, assumptions, status, date, owner and supersession link. Record rejected alternatives where their future reconsideration is plausible. Link the decision to requirements, risks, interfaces, evidence and implementation constraints.

## Evolution and erosion

Architecture evolves through intentional change and unintentional drift. Typical causes: local shortcuts, urgent delivery, dependency changes, acquisitions, team restructuring, platform upgrades, unrecorded exceptions, copied patterns and mismatched incentives. Detect drift by comparing decisions/views to code, deployments, telemetry, dependency graphs and operational incidents.

A useful review loop:

1. Identify the original concern and decision.
2. Inspect the current implementation and runtime evidence.
3. Determine whether deviation is accidental, justified, or a newly preferred design.
4. Evaluate current quality and risk consequences.
5. Update implementation, architecture description or both.
6. Add or revise a fitness function where recurrence is costly.
7. Revisit the decision when context changes.

## Governance anti-patterns

- Architecture review approval is treated as a substitute for evidence.
- Standards are imposed without identifying the concern they serve.
- A central board becomes a bottleneck for reversible local decisions.
- Teams are allowed local autonomy but lack interface ownership.
- Documentation is frozen and diverges from deployed systems.
- Technical debt is measured only by code smells, ignoring irreversible structural constraints.
- “Reference architecture” is adopted without proving fit to scale, skills, risk and operations.

## Operating principle

Govern the decisions that are expensive, cross-cutting, risk-bearing or difficult to reverse. Delegate low-risk, reversible choices close to the teams with the best information, while making their interfaces and consequences observable.
