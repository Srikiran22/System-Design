# 04 — Requirements and quality attributes

## Functional versus quality requirements

**Functional requirements** state what a system does: create order, authorize payment, search catalogue, publish event, export report. **Quality attributes** state how well it behaves under specified conditions. “Non-functional” can misleadingly imply optional; quality requirements are product requirements and often determine architecture.

Architecture influences quality, but implementation, data, configuration, people, and operations also matter. A good architecture does not rescue poor implementation or operations [S03].

## Key quality attributes

| Attribute               | Meaning                                        | Measures / evidence                                              |
| ----------------------- | ---------------------------------------------- | ---------------------------------------------------------------- |
| Performance             | Response/processing behavior under load        | p50/p95/p99 latency, throughput, jitter, queue age               |
| Scalability             | Handles workload growth                        | Latency/throughput as load, data, tenants grow; scale efficiency |
| Availability            | User-visible service is usable                 | Successful eligible requests / eligible requests; downtime       |
| Reliability             | Correct required behavior over time/conditions | Failure rate, correctness, data integrity, completion rate       |
| Resilience              | Withstands disruption and recovers             | Degradation, failover, recovery tests, blast radius              |
| Durability              | Committed data survives defined failures       | Data-loss tests, backup/replication guarantees, RPO              |
| Security                | Resists unauthorized access/misuse             | Threat coverage, access review, penetration/control tests        |
| Privacy                 | Handles personal data appropriately            | Minimization, retention, access, consent, deletion evidence      |
| Safety                  | Avoids unacceptable harm                       | Hazard analysis, safety cases, fail-safe behavior                |
| Modifiability           | Changes at acceptable cost/risk                | Lead time, blast radius, regression rate                         |
| Maintainability         | Understand, correct, evolve                    | Change cost, complexity, code health, ownership clarity          |
| Testability             | Control and observe behavior                   | Risk coverage, deterministic tests, fault injection              |
| Deployability           | Release safely and frequently                  | Lead time, rollback, change failure rate                         |
| Interoperability        | Correctly exchanges data/behavior              | Contract compatibility, schema/version support                   |
| Usability/accessibility | Users complete goals accurately                | Task completion, errors, time-on-task, audits                    |
| Cost efficiency         | Delivers outcome at sustainable cost           | Cost per successful transaction/tenant                           |
| Sustainability          | Uses energy/resources responsibly              | Energy per transaction, carbon intensity, utilization            |
| Operability             | Operators understand/control behavior          | Detection/diagnosis time, alert/runbook coverage                 |

## Quality attribute scenario template

A rigorous scenario specifies: **source**, **stimulus**, **environment**, **artifact**, **response**, and **response measure**.

**Performance example:** At weekday peak, 30,000 authenticated users issue catalogue searches concurrently. At least 99% of valid queries succeed; p95 is below 350 ms and p99 below 900 ms for the agreed query mix.

**Resilience example:** If one availability zone becomes unreachable at peak, critical reads continue in remaining zones, committed order data is preserved, and normal capacity returns within 10 minutes. Recovery is visible to operators.

**Modifiability example:** A tax-rule change for one region can be implemented, tested, and deployed by the tax-capability team without unrelated checkout or catalogue deployments.

**Recovery example:** After accidental deletion of a production table, restore to no more than five minutes before the incident and restore service within one hour; reconcile before writes resume.

These values are illustrative targets, not generic recommendations. Derive them from business impact and realistic workload.

## Prioritize explicitly

For each scenario assess importance, difficulty/risk, consequence (financial, legal, safety, trust, usability, operational), and verification method. Avoid marking everything “high.” Use hard vetoes for law, safety, data integrity, and minimum security: a high score elsewhere cannot compensate for unacceptable risk.

## Avoid vague requirements

- Weak: “The system must be fast.” Better: “For the defined workload, p95 read latency stays below 250 ms at 2,000 requests/second.”
- Weak: “The system must scale.” Better: “Support 3× monthly active users without changing the public API or exceeding cost per active user by more than 20%.”
- Weak: “The system must be highly available.” Better: “The critical order-confirmation journey meets its monthly SLO, excluding only explicitly agreed maintenance windows.”

## Quality attributes interact

Strong consistency may increase latency or reduce availability during partitions. Redundancy improves some failures but raises cost and correlated failure complexity. Caching improves latency but adds staleness/invalidation. Microservices can enable independent deployment while adding network, security, observability, and operating costs. Encryption and authorization add processing but reduce exposure. Flexibility can reduce future change cost while raising initial complexity. Optimization may harm maintainability.

An attribute is an architecture driver only when tied to stakeholder need, context, and measurable threshold.

**Methods:** SEI ATAM [S09], Google Well-Architected [S10], Azure Well-Architected [S11], AWS Well-Architected [S12], ISO/IEC 25010 [S13].
