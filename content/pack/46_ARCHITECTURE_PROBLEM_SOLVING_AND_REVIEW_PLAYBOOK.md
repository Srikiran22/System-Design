# 46 — Architecture problem-solving and review playbook

## A repeatable engineering loop

1. **Mission and outcome:** state what the system must accomplish and how success is measured.
2. **Boundary and context:** define system-of-interest, users, operators, external systems, environment, suppliers and assumptions.
3. **Evidence:** inspect existing data, workflows, incidents, constraints and stakeholder needs.
4. **Requirements:** convert needs into functional, performance, interface, security, safety, reliability, operational and lifecycle requirements.
5. **Risk and quality drivers:** prioritize quality-attribute scenarios, hazards, threats and critical dependencies.
6. **Alternatives:** produce at least two credible architecture options, including a minimal option and a deliberately different option.
7. **Trade study:** evaluate against explicit criteria, costs, risks, operational maturity, reversibility and uncertainty.
8. **Architecture description:** create views appropriate to stakeholders and concerns, with interfaces and rationale.
9. **Failure analysis:** walk through normal, degraded, overload, dependency-loss, malicious and recovery scenarios.
10. **Verification/validation plan:** identify evidence to show both conformance and fitness for purpose.
11. **Implementation and operation:** stage rollout, monitor guardrails, maintain runbooks and learn from incidents.
12. **Reassess:** revise the model as requirements, environment, product use, organization or threat changes.

## The second-defense question

For every critical hazard, threat or mission failure, ask:

- What is the primary preventive control?
- What independently detects loss of control?
- What contains propagation?
- What preserves a safe or useful degraded state?
- What recovers the service, data or physical process?
- What verifies the recovery and prevents recurrence?
- Which common dependencies could defeat multiple layers?

Independence is the key. Two controls sharing the same identity provider, DNS, power, software defect, data source, administrator, deployment pipeline or environmental exposure may fail together. Add diversity only when it reduces a defined common-cause risk more than it adds new integration and maintenance risk.

## Architecture review package

- System context and boundary diagram.
- Stakeholder map and ConOps / operational scenarios.
- Requirements baseline and traceability graph.
- Quality-attribute utility tree and measurable scenarios.
- Architecture views and ADRs.
- Data ownership, interfaces, trust boundaries and dependency maps.
- Trade study and cost/risk analysis.
- Hazard analysis, threat model, FMEA/FTA or other selected analyses.
- Verification, validation and test strategy.
- Deployment, monitoring, SLO, backup and disaster-recovery plans.
- Migration, rollback, configuration and decommission strategy.
- Open assumptions, residual risks and decision authority.

## Red-team prompts

- What assumption would make this architecture fail if it were false?
- Which component is a hidden single point of failure?
- Which dependency is shared across supposedly independent backups?
- What happens when load doubles, a region disappears, data is stale or a supplier changes its API?
- Which operation cannot be safely repeated?
- Which data can be read by a compromised identity?
- How does the system fail when clocks disagree or queues fill?
- Which quality attribute is being sacrificed, and who owns that decision?
- What does the design do when the model is wrong, the operator is overloaded or monitoring is unavailable?
- How does the organization know a rollback actually restored a known-good state?

## Review gates by risk

For low-risk internal tools, use lightweight peer review, automated checks and operational checklist. For public multi-tenant services, add threat modeling, load/failure tests, SLOs, data isolation and restore drills. For safety- or mission-critical systems, add formal lifecycle tailoring, hazard analysis, controlled baselines, independent assurance, qualification evidence, safety argument and explicit risk acceptance. The process should scale with consequence, novelty and uncertainty.

## Decision record pattern

`ID / Title / Status / Date / Owner / Context / Drivers / Constraints / Options / Decision / Rationale / Consequences / Risks / Revisit trigger / Evidence links / Affected requirements / Verification links`.

## Pre-mortem and tabletop

Describe a plausible future failure as though it occurred. Ask the team to independently write causes before discussion. Then tabletop the timeline: detection, authority, communication, containment, restore, reconciliation and public/customer impact. Convert findings to design changes and testable controls.
