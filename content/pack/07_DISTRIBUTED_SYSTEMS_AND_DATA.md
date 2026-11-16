# 07 — Distributed systems and data

## Why distribution changes the problem

A distributed system uses processes or machines communicating over a network. It is not one perfectly reliable computer: messages can be delayed, lost, duplicated, reordered, or rejected; nodes fail independently; clocks disagree; partitions occur; and a component can be alive but too slow to be useful. Microsoft documents common network fallacies: reliability, zero latency, infinite bandwidth, network security, stable topology, one administrator, simple versioning, and observability that can be postponed [S14].

## Capacity estimation

Record assumptions for active users/concurrency, requests per user, peak-to-average ratio, read/write ratio, request fan-out, payload size, retained data, growth, cache hit ratio, hot keys, event volume, consumer lag, geography, and tenant distribution.

Useful approximations:

- Average RPS ≈ daily requests / 86,400.
- Peak RPS ≈ average RPS × measured/assumed peak factor.
- Raw storage ≈ records/day × average record size × retention days.
- Network bits/sec ≈ requests/sec × response bytes × 8.
- Queue drain time ≈ backlog / (consumer rate − arrival rate), only if net rate is positive.

Include indexes, replicas, logs, backups, metadata, and headroom. Use ranges rather than false precision; benchmark actual patterns.

## Latency and throughput

- **Latency:** time an operation takes.
- **Throughput:** completed operations per time.
- **Concurrency:** operations in progress.
- **Tail latency:** high-percentile delay (p95/p99/p99.9).
- **Queueing:** waiting work; near saturation, queue delay rises sharply.
- **Fan-out:** one request creates multiple downstream operations; slowest branch may dominate completion.

Reduce critical-path round trips, batch when semantics allow, bound queues, and measure percentiles under realistic traffic.

## Consistency and transactions

- **Linearizability:** operations appear atomic in one global order consistent with real-time order. Useful for strict invariants; can cost latency or availability during partitions.
- **Sequential consistency:** one order consistent with each process's order, not necessarily real-time order.
- **Eventual consistency:** replicas converge if updates stop and propagation succeeds; temporary staleness is possible.
- **Read-your-writes / monotonic reads:** session guarantees that may improve UX without global strong consistency.
- **Atomicity:** transaction completes entirely or not at all within its transaction boundary.

Define consistency from product behavior. A cart may tolerate slight staleness; a balance or inventory reservation may require strict invariants at commitment.

### Distributed transactions

One database transaction does not make multiple independent services atomic. Options:

- Keep the operation inside one transactional boundary.
- Use a saga with compensating business actions.
- Use a transactional outbox to persist state and event intent atomically.
- Make consumers idempotent and tolerate duplicate delivery.
- Reconcile incomplete workflows.

Compensation is not a time machine: a refund is a new auditable action, not erasure of the charge.

## Replication, partitioning, consensus

- **Replication:** copies data for availability, locality, or read scale. Understand sync/async replication, lag, quorum, split brain, leader election, failover.
- **Partitioning/sharding:** divides data across nodes. Choose keys by locality, cardinality, distribution, query patterns, tenant boundaries, and rebalancing needs.
- **Hot partition:** disproportionate traffic/storage for a key or shard.
- **Quorum:** replica threshold for an operation; guarantees depend on protocol and failure model.
- **Consensus:** agreement among participants despite specified failures; useful for coordination/leader decisions, not a universal database magic feature.

## CAP and PACELC

CAP addresses behavior during a network partition: a distributed data system cannot guarantee both linearizable consistency and availability for every request under all partition conditions. It does not mean every system permanently picks two of three. PACELC emphasizes that without a partition, systems still trade latency against consistency. Specify the guarantee needed by the user workflow.

## Messaging and event-driven design

- **At-most-once:** message may be lost but is not redelivered.
- **At-least-once:** retries can duplicate delivery.
- **Effectively-once business processing:** scoped result achieved with idempotency, dedupe, transactional changes, and clearly defined boundaries; do not claim universal end-to-end exactly-once without precision.
- **Ordering:** global order is expensive; partition ordering may suffice.
- **Backpressure:** prevent producers overwhelming consumers.
- **Dead-letter queue:** isolates repeatedly failing messages; requires alerting and replay/correction procedure.
- **Schema evolution:** consumers must handle compatible versions.

## Idempotency

An operation is idempotent when repeating it has the same intended effect as performing it once. For a payment/order API, persist a key scoped to customer/operation and the outcome. Define payload mismatch behavior, retention, concurrent duplicate races, and partial downstream success.

## Caching

Use when reuse, latency, or origin protection justifies it. Define cache key, TTL, invalidation, freshness, stampede prevention, negative caching, authorization boundaries, and fallback. Cache is usually an optimization, not durable source of truth. Keying that omits tenant/authorization context can create security bugs.

## Data design questions

- Source of truth? Transactional invariants?
- Critical queries and access patterns? Growth and retention?
- Data deletion/retention in replicas, logs, backups, derived data?
- Schema migration across mixed app versions?
- Restore, replay, reconciliation, audit procedure?
- Can one tenant/hot key dominate capacity?

## Learning sequence

Networking, HTTP, DNS, TLS and timeouts → transactions/indexing/isolation → replication/consistency/consensus/partitioning → messaging/idempotency/saga/outbox → cache and failure modes → capacity/load tests/tail latency.

Courses: TU Delft Modern Distributed Systems [S17], CS Primer [S18]. Book: Kleppmann, _Designing Data-Intensive Applications_ [S19].
