# 16 — Templates and checklists

Copy these into each project and keep them version-controlled with the design.

## A. System architecture brief

```markdown
# System architecture brief

Date / owner / reviewers:

## Problem and outcome

Who has what problem? What measurable outcome changes?

## Users and stakeholders

Users, operators, customers, partners, regulators, support:

## Scope and boundary

In scope / out of scope / dependencies / trust boundaries:

## Critical workflows

Happy paths, failure paths, cancellation, support and correction:

## Functional requirements and invariants

FR-01 / FR-02 / key invariants:

## Quality attributes

Scenario / priority / measure / verification method:

## Constraints and assumptions

Constraint / assumption / owner / test / expiry date:

## Workload model

Users, concurrency, peak requests, read-write ratio, payload, retention, growth, regions:

## Data ownership and invariants

Entity / source of truth / owner / invariant / retention:

## Options and design

Option A / B / C; diagrams and contracts:

## Security, failure and recovery

Threats / failure modes / containment / RPO / RTO / proof:

## Operations and cost

SLOs / telemetry / on-call / runbook / rollout / rollback / cost per outcome:

## Open risks and revisit triggers
```

## B. Architecture Decision Record (ADR)

```markdown
# ADR-NNN: <decision title>

Status: Proposed | Accepted | Superseded | Rejected
Date / owner / reviewers:

## Context

Problem and constraints:

## Drivers

Prioritized requirements, risks, assumptions, time horizon:

## Options considered

A — benefits / costs / risks
B — benefits / costs / risks
C — benefits / costs / risks

## Decision

What is selected and why?

## Consequences

Positive / negative / security / reliability / product / operations:

## Evidence

Prototype / benchmark / user research / incidents / review:

## Revisit triggers

What measurable change reopens the decision?
```

## C. Quality attribute scenario

```text
Attribute:
Priority / difficulty:
Source:
Stimulus:
Environment:
Artifact:
Expected response:
Response measure:
Verification method:
Owner:
```

## D. Threat model

```text
Assets:
Actors / trust assumptions:
Data flows / trust boundaries / entry points:
STRIDE threats / abuse cases:
Impact and likelihood:
Preventive controls:
Detective controls:
Containment and recovery controls:
Verification evidence:
Residual risk / owner:
```

## E. Failure Mode and Effects Analysis (FMEA)

| Component | Failure mode | Cause | Local effect | System/user effect | Detection | Severity | Likelihood | Detectability | Prevention | Independent fallback | Owner / residual risk |
|---|---|---|---|---|---|---|---|---|---|---|
| | | | | | | | | | | | |

## F. Failure / second-defense review

- What first control prevents the event?
- How can that control fail or be bypassed?
- What independent signal detects the failure?
- What stops propagation or reduces blast radius?
- What alternate path is available?
- What shared dependencies disable both primary and fallback?
- Is fallback capacity sufficient at peak/regional-failure load?
- How is data reconciled after failover?
- How does the operator return to normal mode safely?
- When was the complete scenario last rehearsed?

## G. Postmortem

```markdown
# Incident postmortem

Date / service / incident commander:

## Summary and user impact

What failed, who affected, duration, measurement:

## Timeline

Detection, escalation, mitigation, recovery, validation:

## Technical sequence

Fault → error → failure → propagation:

## Contributing factors

Architecture, code, config, resources, process, organization, external:

## Detection and response

What worked? What delayed diagnosis/recovery?

## Data correctness and reconciliation

What needs checking/repair?

## Corrective actions

Action / owner / due date / evidence / priority:

## Structural lessons

Which system condition made incident likely or difficult to detect?
```

## H. Architecture review checklist

- [ ] Problem, stakeholder, product outcome, boundary explicit.
- [ ] Functional requirements and invariants testable.
- [ ] Quality scenarios prioritized and measurable.
- [ ] Workload/capacity/growth assumptions visible.
- [ ] Every critical data item has a source of truth and owner.
- [ ] Consistency and transaction boundaries explicit.
- [ ] API/event contracts, versioning and idempotency defined.
- [ ] Failure domains, shared dependencies and blast radius mapped.
- [ ] Primary and independent secondary defenses defined.
- [ ] Security, privacy and abuse cases included.
- [ ] Observability, SLOs, runbooks, on-call and incident roles exist.
- [ ] Deployment, rollback, migration, backup, restore, reconciliation tested.
- [ ] Options/trade-offs recorded in ADRs.
- [ ] Product outcomes and total operating cost included.
- [ ] Revisit triggers and owners explicit.

## I. Systems-thinking map

```text
System purpose:
Boundary / environment:
Stakeholders and goals:
Stocks:
Inflows / outflows:
Reinforcing loops (R):
Balancing loops (B):
Delays:
Constraints / thresholds:
Unintended consequences:
Leverage-point hypotheses:
Intervention:
Predicted behavior over time:
Evidence that would disconfirm the model:
```

## Advanced engineering templates to add to project work

### Quality-attribute scenario

`Source / Stimulus / Environment / Affected component / Response / Response measure / Threshold / Priority / Verification method / Owner / Evidence`.

### Hazard / safety analysis record

`Hazard ID / Loss / Hazard / Operating mode / Unsafe control action or failure mode / Causal scenario / Severity / Likelihood basis / Safety constraint / Allocated requirement / Mitigation / Verification evidence / Residual risk / Approver`.

### Threat model

`Asset / Actor / Entry point / Trust boundary / Data flow / Threat / Preconditions / Impact / Attack path / Mitigation / Detection / Recovery / Test / Residual risk / Owner`.

### Data migration plan

`Source / Target / Mapping / Volume / Data-quality baseline / Transformation / CDC or change capture / Reconciliation invariant / Dual-run plan / Cutover criterion / Rollback criterion / Retention/deletion / Owner`.

### Recovery exercise

`Failure scenario / Scope / Dependencies / RTO / RPO / Restore point / Isolation requirement / Runbook / Observed recovery / Data-integrity check / Gaps / Corrective actions`.

### AI evaluation and assurance plan

`Use case / Model & version / Data lineage / Evaluation set / Quality metric / Risk & harm metric / Security abuse test / Human review rule / Permission boundary / Fallback / Drift threshold / Release gate / Monitoring / Incident owner`.

### Model governance plan

`Model purpose / Authoritative repository / Language & version / View conventions / Element IDs / Trace policy / Validation constraints / Tool/API versions / Reviewer / Baseline/change process / Export/archival / Model quality metrics`.

### Architecture review record

`Decision scope / Stakeholders / Drivers / Constraints / Options / Quality scenarios / Sensitivity points / Trade-off points / Risk themes / Evidence / Dissent / Decision owner / Conditions / Revisit trigger`.

### Product value case

`User or mission outcome / Baseline / Target / Benefits / Costs / Risk / Assumptions / Option value / Operational owner / Lifecycle cost / Measurement plan / Review date`.
