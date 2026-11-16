# 31 — Software architecture and domain design: the deeper structure

## Architecture styles are choices with consequences

A style is not a universal best practice. Choose it according to domain boundaries, team structure, change patterns, quality-attribute scenarios, operational maturity, data ownership, deployment constraints and failure isolation.

| Style                          | Strengths                                                                              | Costs / risks                                                                  | Suitable conditions                                                             |
| ------------------------------ | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| Layered                        | Clear dependency direction and separation of concerns                                  | Cross-layer coupling, pass-through layers, difficult domain ownership          | Conventional business applications with stable layers                           |
| Modular monolith               | In-process calls, simpler transactions and operations, enforceable domain boundaries   | Requires module discipline; independent scaling/deployments are limited        | One product/team or early product with coherent domain and limited ops capacity |
| Microservices                  | Independent deployment/scaling, team autonomy, fault isolation when correctly designed | Network failures, observability, data consistency, platform and on-call burden | Multiple stable bounded contexts, independent ownership and mature operations   |
| Event-driven                   | Loose temporal coupling, fan-out, asynchronous workflows                               | Eventual consistency, replay/versioning complexity, difficult tracing          | Integration, streaming, asynchronous business processes                         |
| Serverless / functions         | Managed scaling and reduced infrastructure management                                  | Cold starts, limits, vendor coupling, distributed tracing, cost surprises      | Event-triggered or variable workloads with suitable runtime constraints         |
| Hexagonal / ports-and-adapters | Domain logic isolated from external technologies                                       | Can be over-layered in trivial CRUD systems                                    | Systems needing testability and replaceable adapters                            |
| Plugin / microkernel           | Extensibility around stable core                                                       | Plugin isolation, versioning and compatibility                                 | Product platforms and extensible tools                                          |
| Pipe-and-filter                | Composable processing stages                                                           | Backpressure, ordering, failure handling, schema evolution                     | Data and media pipelines                                                        |
| Shared-nothing / sharded       | Scale-out and failure partitioning                                                     | Cross-shard queries, resharding, hot partitions                                | Data volume/load beyond one-node limits with partitionable workload             |

## Domain-driven design (DDD)

DDD is most useful when software reflects a domain with nontrivial rules and language. Start with domain discovery and a shared vocabulary; identify bounded contexts; define context maps and integration relationships; assign responsibility for invariants; then select tactical patterns where complexity justifies them.

- **Entity:** identity persists across state changes.
- **Value object:** defined by attributes, typically immutable.
- **Aggregate:** consistency boundary with an aggregate root controlling invariants.
- **Repository:** abstraction for retrieving/persisting aggregates.
- **Domain event:** fact that occurred in the domain.
- **Bounded context:** boundary within which a model and its language are consistent.
- **Context map:** documents relationships and integration patterns between contexts.

DDD does not require microservices. A modular monolith can contain multiple bounded contexts. Splitting each context into a separate deployable service too early converts model boundaries into network and operational commitments.

## Data ownership and consistency boundaries

A service boundary is not sound if several services directly mutate the same tables or if business invariants span them without an explicit coordination mechanism. Assign authoritative ownership for each data set and publish stable contracts. Consumers should not infer business semantics from another service's internal schema.

## Patterns and their failure modes

- **CQRS:** separates command and query models. Useful when read and write concerns differ; adds projection consistency and operational complexity.
- **Event sourcing:** stores state changes as events. Useful for audit/history/reconstruction; adds schema evolution, replay, snapshot, retention and debugging costs. It is not a default database choice.
- **Saga:** coordinates a long-running transaction through local transactions and compensations. Compensation is not rollback in the database sense; some actions cannot be fully undone.
- **Transactional outbox:** records domain changes and outgoing messages atomically in one local transaction; a relay publishes later. Consumers still need idempotency and duplicate handling.
- **Strangler migration:** progressively routes behavior to a replacement system. It requires coexistence, reconciliation, ownership, cutover and fallback design.
- **Anti-corruption layer:** protects a domain model from an external or legacy model; adds translation logic that must be maintained.

## Interface design

Specify protocol, schema, semantics, units, versioning, error model, idempotency, timeout, security, service-level expectations and ownership. A syntactically valid API may still be semantically ambiguous. For asynchronous systems, document event identity, ordering guarantees, delivery semantics, replay policy, poison-message handling and schema compatibility.

## Choosing monolith versus services

Before splitting, establish: (1) actual independent change cadence, (2) stable domain ownership, (3) data ownership, (4) separate scaling needs, (5) fault-isolation need, (6) deployment friction, (7) sufficient observability/on-call, (8) platform cost and skill, and (9) an incremental migration path. A modular monolith is often a lower-risk starting point; that is a heuristic, not a law. First-party cases such as Shopify's modularization and Uber's service evolution show that organizational and operational costs matter alongside deployment architecture. [S16, S32, S145]

## Architecture drift and debt

Architecture debt is not only “bad code.” It includes expensive dependency structures, implicit coupling, undocumented constraints, data ownership ambiguity, obsolete assumptions and governance gaps. Track debt as a risk with trigger, consequence, interest/cost, owner and mitigation path. The research literature describes architectural debt as difficult to detect and expensive to remediate; avoid reducing it to a single lint score. [S144]

## Minimum design artifacts

- Context and container/component diagrams.
- Domain map and bounded-context map.
- Data ownership and lifecycle model.
- API/event contracts and interface control records.
- Quality-attribute scenarios and ADRs.
- Deployment, trust-boundary and failure-domain views.
- Migration plan, rollback plan and operational readiness checklist.
