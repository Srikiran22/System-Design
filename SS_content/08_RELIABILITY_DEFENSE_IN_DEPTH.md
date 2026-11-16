# 08 — Reliability and defense in depth

## Vocabulary

- **Fault:** defect or abnormal condition in a component.
- **Error:** incorrect internal state caused by a fault.
- **Failure:** externally visible deviation from required behavior.
- **Availability:** whether required service is usable when needed.
- **Reliability:** ability/probability of required function without failure for a defined time and conditions.
- **Resilience:** withstand disruption and recover while maintaining acceptable behavior.
- **Fault tolerance:** continue required operation despite specified faults.
- **Durability:** committed data survives defined failures.
- **Recoverability:** restore service/data within target.

Google reliability guidance emphasizes user-experience goals, realistic targets, redundancy, horizontal scaling, observability, graceful degradation, recovery/data-loss tests, and postmortems [S20].

## Start with user journeys and objectives

A running process that returns errors is not a successful transaction. Define an SLI (indicator), SLO (objective), and SLA (external commitment/penalty, if used) for critical user journeys. Error budgets can govern risky change when SLOs are breached.

- **RPO:** maximum tolerable data loss measured in time.
- **RTO:** target time to restore service or business capability.
- **MTPD/MTD:** maximum tolerable disruption duration, according to the chosen framework.

Targets must come from business impact and be demonstrated in tests.

## First defense and second defense

A **first defense** prevents or reduces failure probability. A **second defense** detects, contains, or recovers when the first fails. Layer prevention, detection, containment, recovery, and learning. Prefer independent layers.

### Example: data corruption or accidental deletion

| Layer        | Control                                                                                 |
| ------------ | --------------------------------------------------------------------------------------- |
| Prevention   | Least-privilege DB access, migration review, protected changes, constraints, validation |
| Detection    | Integrity checks, audit logs, anomaly alerts, reconciliation                            |
| Containment  | Read-only mode, stop writers, isolate tenant/partition, revoke credentials              |
| Recovery     | Immutable/versioned backups, point-in-time recovery, alternate-region restore           |
| Verification | Restore tests, row/hash counts, application-level reconciliation, business sign-off     |
| Learning     | Root-cause review, safer migrations, control/test updates                               |

### Example: region outage

| Layer        | Control                                                                   |
| ------------ | ------------------------------------------------------------------------- |
| Prevention   | Capacity planning, zone/region design, dependency diversity, safe rollout |
| Detection    | Synthetic user journeys, regional health, dependency telemetry            |
| Containment  | Traffic isolation, load shedding, feature degradation, circuit breakers   |
| Recovery     | Independent region/recovery environment, failover and data reconciliation |
| Verification | Failover exercise, integrity checks, failback rehearsal                   |
| Learning     | Update architecture, runbooks, capacity assumptions                       |

### Example: identity-provider failure

A secondary service behind the same broken identity control plane is not independent. Consider emergency break-glass access with hardware-backed credentials, strict approval, out-of-band audit, short duration, and post-use review. Test it safely; do not create a permanent bypass.

## Independence and common-mode failure

Ask if both layers share a region/zone/power/network/DNS/control plane, identity/secrets/KMS, deployment pipeline/config/image, database/replication stream/operator/vendor, or human approval path. Two copies sharing a failure domain are not independent. Backups with production write credentials can be deleted by the same attacker; replicas can replicate corruption; a failover region can reproduce the same software bug.

## Reliability tactics and misuse

| Tactic                           | Purpose                                 | Failure/misuse                                          |
| -------------------------------- | --------------------------------------- | ------------------------------------------------------- |
| Redundancy                       | Continue after component loss           | Shared failure domain, correlated defects               |
| Health checks                    | Route only to useful instances          | Restart amplification; false healthy signal             |
| Timeout                          | Bound waiting/resources                 | Too short for normal tail latency; inconsistent budgets |
| Bounded retry + backoff + jitter | Recover transient faults                | Retry storm, duplicate side effects, unbounded retries  |
| Circuit breaker                  | Stop calls to a failing dependency      | Unsafe half-open probes or stuck state                  |
| Bulkhead                         | Isolate resource/blast radius           | Wrong pool sizing or hidden shared resource             |
| Load shedding                    | Reject low-priority work under overload | No explicit work priority                               |
| Backpressure                     | Limit production to downstream capacity | Merely moving overload into unbounded queues            |
| Graceful degradation             | Preserve critical user value            | Incorrect/insecure degraded behavior                    |
| Queue load leveling              | Smooth bursts                           | Invisible queue age, poison events                      |
| Idempotency                      | Safely repeat operations                | Wrong key scope or non-atomic dedupe                    |
| Backup/restore                   | Recover data                            | Untested restore, shared credentials, copied corruption |
| Multi-zone/region                | Reduce location failure risk            | Shared control plane/network/capacity                   |
| Chaos/fault injection            | Verify behavior                         | Unguarded production experiment                         |

## Graceful degradation

Classify functions:

- **Critical:** preserve correctness and core user value.
- **Degradable:** lower freshness, reduced functionality, queue, or read-only mode.
- **Optional:** recommendations, analytics, expensive visualizations, background features.
- **Unsafe to degrade:** never silently weaken authorization, payment integrity, tenant isolation, or safety properties.

Make degraded mode explicit to users/operators. Define exit and reconciliation behavior.

## Data protection and recovery

Use transaction integrity, replication for availability, independent backups for recovery, immutable/offline copies where justified, point-in-time recovery, access separation, retention, restore drills, reconciliation. Replication is not backup. A backup is not proven until restored and validated.

Restore tests should check counts, checksums, constraints, referential integrity, ledger balance, duplicate detection, access, and event replay. Test with realistic staffing/time limits.

## FMEA and incident learning

For each failure mode record component, failure, cause, local effect, system effect, detection, severity, occurrence, detectability, mitigation, owner, residual risk. Risk priority products can hide catastrophic low-probability events; use severity gates for safety, data loss, financial and security risks.

Postmortems should include impact, timeline, detection, contributing factors, what worked/failed, recovery, customer communication, corrective actions, owners, and verification. Avoid blame. “Human error” is not a sufficient root cause; ask why the system made the action likely or hard to detect.

## PostHog example

PostHog reported a Sep 29, 2025 outage lasting 1h48m, with ~78% of US-region flag evaluation requests failing. A database timeout reduction during writer load, retries without circuit breakers/backoff, and ineffective health probes contributed to cascading failure. Hardcoded config and rollback-permission problems delayed recovery [S21]. October 2025 incidents described CPU undersizing leading to connection-pool exhaustion, excessive parallelism, Redis overload, and broader service impact [S22]. A timeout/retry is a system-wide load and recovery decision, not a local code detail.

## Required reliability checklist

- [ ] Critical journeys have SLI/SLO.
- [ ] Timeouts and retry budgets are explicit.
- [ ] Retried operations are idempotent or protected from duplicates.
- [ ] Queues have capacity, age, backpressure, poison-message policy.
- [ ] Critical resources have isolation and overload priorities.
- [ ] Failure domains and shared dependencies are mapped.
- [ ] Backups are sufficiently independent and restore-tested.
- [ ] RPO/RTO match business impact and are demonstrated.
- [ ] Degradation preserves correctness and security.
- [ ] Operators can detect, diagnose, contain, recover, and reconcile.
- [ ] Postmortem actions have verified evidence.

**Primary references:** Google reliability [S20], Google SRE [S15], Azure patterns [S14], AWS Well-Architected [S12].
