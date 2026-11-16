# 01 — Definitions and mental models

## What is a system?

A **system** is a set of interacting elements organized to achieve a purpose or produce behavior. Elements may be software, hardware, data, people, processes, external services, policies, or physical resources. The interactions and boundary conditions matter as much as the parts.

A **system boundary** is the chosen line around what the design team controls or is responsible for. It is a modeling decision, not a claim that the outside world is irrelevant. Users, suppliers, regulators, and dependencies remain part of the context.

A **system of systems** is a collection of independently useful systems cooperating to deliver a larger capability, often with distributed ownership and different lifecycles.

A **socio-technical system** combines technology with people, organizations, incentives, procedures, and institutions. A production product is socio-technical: operations, support, customers, sales promises, and team incentives influence its behavior.

## Distinguish the disciplines

| Discipline                           | Primary question                                                        | Typical output                                                        |
| ------------------------------------ | ----------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Systems thinking                     | What relationships and feedback create the behavior we see?             | Causal-loop map, stock-flow model, leverage-point hypothesis          |
| Systems engineering                  | How do we realize and manage a system across its lifecycle?             | Needs, requirements, architecture, V&V evidence, lifecycle plans      |
| Software architecture                | What major software structures exist, and why are they shaped this way? | Views, decisions, components, interfaces, deployment model            |
| Software system design               | How should a capability work end to end?                                | APIs, data model, components, capacity, consistency, failure behavior |
| Product design                       | How should the product help a user achieve an outcome?                  | Journey, workflow, interaction model, usability evidence              |
| Platform/infrastructure architecture | How are workloads hosted, connected, secured, deployed, and operated?   | Network, identity, compute, storage, platform topology                |

These overlap. A payment system design includes product behavior, ledger integrity, distributed processing, security, reconciliation, support operations, and financial controls. A service diagram is not the complete design.

## Levels of design

1. **Product/mission:** outcomes, value, users, harms, stakeholders, operating model.
2. **Context:** external actors, dependencies, regulatory and organizational boundaries.
3. **System:** capabilities, subsystems, contracts, data ownership, quality goals.
4. **Application/service:** modules, APIs, domain model, persistence, workflows.
5. **Component:** classes, algorithms, schemas, concurrency, error handling.
6. **Deployment/operations:** regions, networks, identity, release, telemetry, backup, recovery.
7. **Lifecycle:** build, verify, validate, operate, maintain, migrate, retire.

A design is incomplete if it optimizes one level while breaking another. Small services may improve team autonomy but create network costs, operational work, and cross-service transactions.

## Core mental models

### Boundary and interface

The boundary says what is inside a component or team. The interface says how the outside world may interact with it. A good interface hides implementation details, states guarantees, validates input, and makes failure modes explicit.

### Cohesion and coupling

- **Cohesion:** how strongly a module's responsibilities belong together.
- **Coupling:** how much a module depends on other modules' details, timing, data, or release choices.

Prefer high cohesion and controlled coupling. Do not reduce code coupling by creating so many network boundaries that coordination and failure costs become worse.

### Abstraction and information hiding

An abstraction exposes a useful contract while hiding details likely to change. Information hiding localizes change. Poor abstractions leak database shape, vendor assumptions, internal errors, or lifecycle details to every consumer.

### Drivers, constraints, trade-offs, risks

- **Driver:** a requirement/context that materially shapes a decision.
- **Constraint:** a hard boundary on available choices.
- **Trade-off:** gain in one quality or benefit at the cost of another.
- **Risk:** uncertain condition that could cause loss or prevent an objective.
- **Assumption:** unverified statement temporarily treated as true.

Write assumptions down. Hidden assumptions are difficult to test and easy to forget.

### Emergence and feedback

System behavior can arise from interactions rather than one component. Retry storms, inventory oscillations, queue backlogs, team bottlenecks, and runaway costs are emergent behaviors. Local correctness does not guarantee system correctness. A feedback loop exists when the system's response affects future inputs; delays can create oscillation and overcorrection.

### Common-mode failure

Two defenses are not independent if the same event disables both. Replicas sharing one region, backups sharing one identity account, active and standby systems sharing one network route, or fallback code sharing a saturated database may fail together.

## A design is a hypothesis, not a picture

Each significant decision should have a reason tied to a prioritized requirement, an explicit assumption and time horizon, an expected benefit and known cost, a failure mode and mitigation, evidence or a test that could falsify the claim, and a trigger for revisiting it.

## Example: limited inventory

A narrow feature view says: “Build a checkout endpoint.” A system view asks: What does “reserved” mean and for how long? Can two customers reserve the last unit? What happens if payment succeeds but the response is lost? Can retries charge twice? What if inventory is unavailable? How are expired reservations released? Can support explain failures? How are oversell, fraud, latency, and abandonment measured? What is the manual recovery process?

These questions change data, API contracts, concurrency, event handling, UX, and operations. That is system design.

## First principles

- Design for the actual workload and context; do not cargo-cult a reference architecture.
- Make important qualities measurable before choosing patterns.
- Prefer the simplest design that satisfies constraints and leaves a credible evolution path.
- Treat network calls, retries, identity, data ownership, and deployments as failure sources.
- Build observability and recovery into the design.
- Design operating model and ownership with technical boundaries.
- Re-evaluate when product, workload, organization, or threat model changes.

**References:** INCOSE Systems Engineering Handbook [S01], NASA Systems Engineering Handbook [S02], Software Architecture in Practice [S03].
