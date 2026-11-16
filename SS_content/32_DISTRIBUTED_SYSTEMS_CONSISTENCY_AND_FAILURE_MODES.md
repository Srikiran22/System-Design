# 32 — Distributed systems, consistency and partial failure

## The defining problem: partial failure

In a distributed system, one process can fail while another continues; a request can be delayed, duplicated or lost; a timeout does not reveal whether the remote operation committed; clocks differ; network partitions split views; a dependency can be overloaded but not fully down. A system design must define behavior under these conditions, not only the happy path.

## Start with a failure model

State whether the design assumes crash-stop, crash-recovery, omission, message duplication, reordering, network partition, Byzantine behavior, malicious actors or correlated infrastructure failure. Many application architectures assume crash and network failure; safety/security-critical systems may need stronger models.

## Consistency is a spectrum

- **Linearizability:** operations appear to occur atomically in real-time order; useful for coordination and strong invariants, with coordination latency and availability trade-offs.
- **Sequential consistency:** operations appear in a common order, but not necessarily real-time order.
- **Causal consistency:** causally related operations preserve ordering; unrelated operations may differ.
- **Eventual consistency:** replicas converge when updates stop and propagation succeeds; application must tolerate stale reads and reconcile conflicts.
- **Read-your-writes / monotonic reads:** session-level guarantees that can make user workflows predictable without globally strong consistency.

Do not oversimplify CAP as “choose any two.” CAP is about consistency and availability during a network partition under a defined model; practical distributed design also involves latency/consistency tradeoffs, workload shape, quorum rules, conflict handling and operational recovery. PACELC makes the latency-versus-consistency choice outside partitions explicit.

## Replication and coordination

Replication improves fault tolerance and read distribution but introduces replica lag, conflict resolution, leader changes and recovery concerns. Consensus protocols such as Raft or Paxos coordinate replicated state under stated assumptions. Quorum reads/writes depend on replica count, quorum intersection, failure tolerance, read/write consistency and the database's actual semantics. Do not infer linearizability from the word “quorum.”

## Time and ordering

Wall clocks are not reliable global order. Clock skew, drift and leap adjustments matter. Use logical clocks or hybrid timestamps where the domain requires causal ordering; use monotonic clocks for elapsed-time measurements; use explicit sequence numbers or event versions for domain order. Define what order must be preserved and at which scope.

## Retries, idempotency and duplicate delivery

A timeout means “outcome unknown,” not “operation failed.” Retrying a non-idempotent payment, order or inventory mutation can double-apply a side effect. Use idempotency keys, deduplication records, unique constraints, transactional outbox/inbox, operation status queries and bounded retry policies. “Exactly once” is usually an end-to-end business effect built from transactions, deduplication and idempotent handlers, not a magical message-broker setting.

## Overload and cascading failure

Retries amplify load. A slow dependency retains threads/connections; queues grow; memory rises; timeouts increase; callers retry; health checks may cause flapping; the system collapses. Use admission control, bounded queues, load shedding, backpressure, deadlines, circuit breakers, bulkheads, concurrency limits, jittered retries and emergency kill switches. Google SRE documents overload and cascading-failure patterns in detail. [S15]

## Distributed transaction patterns

- **Single database transaction:** strongest/simple when one transactional boundary is available.
- **Two-phase commit:** coordinates participants but adds blocking and availability/operational complexity; use where the transaction manager and failure assumptions justify it.
- **Saga:** sequence of local transactions plus compensating actions; design compensation, timeout, duplicate handling and human intervention explicitly.
- **Outbox + relay:** couples state change and message intent in one local transaction.
- **CDC:** captures database changes; event semantics and schema ownership remain important.
- **Reconciliation:** periodic comparison of authoritative records to detect and repair divergence. It is essential even when synchronous processing appears reliable.

## Cache architecture

Specify TTL, invalidation, write-through/write-back behavior, stale-read tolerance, key cardinality, stampede prevention, tenant isolation and privacy implications. Cache invalidation is hard because it is a distributed consistency problem, not because cache APIs are complicated.

## Failure scenarios to test

1. Response lost after remote commit.
2. Duplicate message or client retry.
3. Consumer crash after side effect but before acknowledgement.
4. Queue poison message and dead-letter accumulation.
5. Leader failover during a write.
6. Network partition / split brain attempt.
7. Stale schema during rolling deployment.
8. Slow dependency and retry storm.
9. Hot partition or skewed key distribution.
10. Clock skew affecting expiration, ordering or authentication.

## Design review output

Produce a consistency matrix for each data entity, authoritative owner, write path, read path, read-after-write promise, conflict policy, recovery/reconciliation method and business consequence of stale or missing data. Add failure-domain and retry/idempotency analysis. [S15, S18, S20, S141]
