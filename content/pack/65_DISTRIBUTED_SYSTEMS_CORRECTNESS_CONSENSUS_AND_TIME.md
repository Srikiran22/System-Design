# 65 — Distributed systems correctness: consensus, time, ordering and idempotency

## Partial failure is the baseline

In a distributed system, processes can fail independently, messages can be delayed, duplicated, reordered or lost, and network partitions can make healthy nodes unreachable. A timeout does not prove that a remote operation did not happen. This uncertainty is the source of many retry, consistency and recovery defects.

## Safety and liveness

- **Safety:** nothing bad happens (for example, two conflicting values are not both committed as the unique decision).
- **Liveness:** something good eventually happens (for example, an operation eventually completes under stated timing/failure assumptions).

A design should state which properties it guarantees and under which assumptions. Consensus algorithms do not remove the need to reason about membership, durability, client semantics, snapshots, upgrades, failure detection and operational procedures.

## Consensus and replicated logs

Consensus is the problem of agreeing on a value or ordered sequence despite failures. Paxos, Raft and Zab are foundational families. Raft decomposes consensus into leader election, log replication and safety for understandability [S195]. ZooKeeper's atomic broadcast and replicated state machine illustrate coordination in production systems [S196]. Google's “Paxos Made Live” demonstrates the engineering work needed to turn an algorithm into a production service [S197].

## Consistency is a spectrum

- **Linearizability:** each operation appears instantaneous between invocation and response, respecting real-time order.
- **Sequential consistency:** all processes observe one common order, not necessarily real-time order.
- **Causal consistency:** causally related operations preserve order; concurrent unrelated operations may vary.
- **Eventual consistency:** replicas converge after updates stop, subject to the system's convergence model.
- **Read-your-writes / monotonic reads:** client-centric guarantees can avoid surprising regressions.

Do not use “strong” or “eventual” as a complete specification. State exact consistency semantics for each operation and data type. Research on eventual consistency explores stronger guarantees and limits under availability constraints [S198].

## Clocks and time

Wall clocks can drift; clock synchronization has uncertainty. A globally distributed transaction system must define how time is used for ordering and what uncertainty exists. Google's Spanner exposes TrueTime uncertainty bounds and waits appropriately to support external consistency [S199]. For systems without such guarantees, avoid treating timestamps as a perfect total order. Use logical clocks, version vectors, sequence numbers, database serialization or explicit causal metadata as appropriate.

## Exactly-once is usually an end-to-end illusion

Message brokers can provide delivery modes, but application side effects may still be repeated or uncertain. Robust patterns include:

- idempotency keys at command boundaries;
- deduplication with durable uniqueness constraints;
- transactional outbox/inbox patterns;
- idempotent consumers;
- explicit operation state machines;
- retry policies with backoff, jitter and deadlines;
- reconciliation of uncertain outcomes.

A retry must preserve the identity of the original logical operation. Generating a new idempotency key per retry defeats deduplication.

## Distributed transaction design

Choose among local ACID transactions, two-phase commit, sagas, transactional messaging, event sourcing, compensating actions or application-level reconciliation based on failure semantics and business invariants. A saga does not provide atomic rollback; compensation is a new business action and may fail or be impossible. Document which intermediate states are externally visible.

## Coordination vs availability

Coordination can limit throughput and availability; relaxed consistency can increase availability but pushes complexity into application semantics. Avoid reducing CAP to a simplistic menu. Define the failure model, partition behavior, read/write guarantees, latency envelope, recovery behavior and business tolerance for stale/conflicting data.

## Capacity and failure propagation

Analyze queue depth, service time, arrival rate, concurrency, retry amplification, shared dependencies, backpressure, overload rejection and cascading failure. Retries without budgets can amplify load. A bulkhead must isolate actual resource pools, not merely code paths.

## Design review questions

- What happens if the client times out after the server commits?
- Can two leaders write concurrently? How is fencing enforced?
- What is the source of truth after failover?
- Which operations must be linearizable and which can be causal/eventual?
- What happens during membership changes and rolling upgrades?
- Are snapshots, compaction and replay safe?
- What evidence proves idempotency under repeated delivery?
- How do clock uncertainty and expiration leases affect correctness?
