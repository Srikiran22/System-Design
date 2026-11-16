# 05 — Architecture styles and patterns

## Style, pattern, tactic, technology

- **Architecture style:** broad structure (layered, event-driven, microservices, client-server).
- **Architecture pattern:** reusable solution to a recurring problem in a context, with consequences.
- **Tactic:** smaller decision aimed at a quality (limit retries, add health check).
- **Technology:** concrete implementation (PostgreSQL, Kafka, Kubernetes, cloud queue).

A pattern is not a target. Select it because its problem statement matches a real constraint, not because a catalogue lists it [S14].

## Common styles and trade-offs

| Style                      | Useful when                                                            | Main costs / risks                                                    |
| -------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Monolith                   | One product/team; simple transactions; fast early delivery             | Can become tightly coupled; one release/scale unit                    |
| Modular monolith           | Need domain boundaries without distributed operations                  | Enforce boundaries; shared runtime is common failure domain           |
| Layered / n-tier           | Separate presentation, application, domain, infrastructure             | Pass-through layers; logic leaks across boundaries                    |
| Hexagonal / ports-adapters | Keep domain logic independent of external technologies                 | More interfaces; can become ceremony                                  |
| Clean architecture         | Dependency direction/separation matter                                 | Abstraction without meaningful boundaries                             |
| Microservices              | Independent capability needs deployment, scaling, ownership, isolation | Network/data failures, operations, contracts, security, observability |
| SOA                        | Enterprise integration across heterogeneous systems                    | Governance, coordination, shared standards, legacy coupling           |
| Event-driven               | Producers/consumers decoupled in time/ownership                        | Ordering, duplication, schema evolution, eventual consistency         |
| Serverless                 | Bursty/event-driven, managed execution fits                            | Cold starts, limits, provider coupling, testing/workflow complexity   |
| CQRS                       | Read/write requirements materially differ                              | Two models, eventual consistency, projections                         |
| Event sourcing             | Auditable history/reconstruction is essential                          | Replay, schema evolution, correction, storage, projection complexity  |
| Pipes and filters          | Staged/batch transforms                                                | Backpressure, contracts, partial failure, orchestration               |
| Space-based/data grid      | Shared database contention dominates                                   | Distributed state/synchronization                                     |
| Peer-to-peer               | Decentralized participation/resilience                                 | Discovery, membership, trust, consistency, coordination               |

## Selecting a starting point

- Start with a monolith or modular monolith when product uncertainty is high, domain is changing, team is small, or operations capacity is limited.
- Add modules/boundaries when internal coupling and team coordination are the problem.
- Extract a service when a bounded capability needs separate scaling, isolation, deployment cadence, technology, ownership, or regulatory boundary—and the team can operate it.
- Use messaging when work can be queued or spans time; retain synchronous calls when an immediate answer is required.
- Use CQRS/event sourcing only for real asymmetry or audit/history requirements.
- Use serverless when execution model and economics fit, not because it is fashionable.

## Domain decomposition

Domain-driven design concepts: **domain** (business problem space), **subdomain** (coherent part), **bounded context** (boundary where model/language are consistent), **aggregate** (consistency boundary controlled by root), **context map** (relationships/integration patterns between contexts).

Discover boundaries using business capability, change patterns, data ownership, consistency requirements, and team ownership. Avoid splitting by database table, UI screen, or technical layer alone. A good module/service has clear owner, stable contract, explicit data ownership, limited shared state, and an independent-change reason.

## Pattern catalogue

| Problem                               | Pattern/tactic                                  | Caution                                                 |
| ------------------------------------- | ----------------------------------------------- | ------------------------------------------------------- |
| Shield clients from internal topology | Backend for Frontend                            | More surfaces and duplicated aggregation                |
| Isolate slow/failing dependency       | Bulkhead                                        | Resource partitions must be sized/observed              |
| Stop calls accumulating on failure    | Circuit breaker                                 | Open/half-open policy must be safe                      |
| Recover from transient failure        | Bounded retry + backoff + jitter                | Can multiply load or duplicate side effects             |
| Reduce repeated read latency          | Cache-aside                                     | Staleness, invalidation, stampede, auth boundaries      |
| Defer slow work                       | Queue-based load leveling / async request-reply | Durable queue, status, dedupe, poison handling          |
| Coordinate distributed business steps | Saga/orchestration/choreography                 | Compensation is not rollback; partial completion occurs |
| Protect legacy boundary               | Anti-corruption layer                           | Adapter can become large translation subsystem          |
| Aggregate backend calls               | API composition/request aggregation             | Fan-out latency and failure still exist                 |
| Prevent duplicate processing          | Idempotency key/deduplication                   | Define scope, retention, payload mismatch, races        |
| Separate reporting reads from writes  | Read replica/CQRS projection                    | Staleness and reconciliation                            |
| Gradual migration                     | Strangler fig                                   | Routing, data consistency, observability, rollback      |
| Tenant isolation                      | Cell architecture/tenant sharding               | Hot tenants, cross-cell query, rebalancing              |
| Safe release                          | Canary/blue-green/rolling                       | Mixed-version and schema compatibility                  |
| Stop overload                         | Admission control/load shedding/backpressure    | Must prioritize critical work explicitly                |

## Data architecture patterns

- **Single authoritative DB:** simplest consistency; optimize schema/indexes/queries before sharding.
- **Database per service:** ownership and independent evolution; distributed transactions and cross-service queries harder.
- **Read replicas:** read scale; replication lag/failover semantics matter.
- **Sharding:** distributes data/load; introduces routing, hot partitions, rebalancing, cross-partition work.
- **CQRS projections:** specialized read model; eventual consistency and rebuild process required.
- **Append-only ledger/event log:** audit history; correct through compensating entries/new events, not silent mutation.

## Anti-patterns

- **Distributed monolith:** separate deployments but coordinated releases or tightly coupled synchronous calls.
- Shared DB writes bypassing ownership/contracts.
- Chatty services with long chains of remote round trips.
- Unbounded retries and duplicate side effects.
- God service/module, premature sharding, golden hammer, architecture astronautics, pattern cargo cult.

## Evolution

Evolve based on measured pressure: change coupling, release bottlenecks, isolated scaling, regulation, failure blast radius. Baseline, add boundaries, instrument, extract only when benefits exceed network/data/security/operations costs. Shopify's modular monolith story is a counterexample to automatic microservices migration [S16].
