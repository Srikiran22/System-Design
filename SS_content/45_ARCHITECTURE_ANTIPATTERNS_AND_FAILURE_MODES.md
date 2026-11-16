# 45 — Architecture anti-patterns and recurring failure modes

## Why anti-patterns matter

A design failure is often an interaction between individually reasonable choices. The objective is not to memorize a list of “bad patterns,” but to identify the mechanism, trigger, observable symptom and corrective action.

| Anti-pattern                        | Mechanism / symptom                                                                       | Better response                                                                                    |
| ----------------------------------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Premature microservices             | Network boundaries before domain/data ownership; high coordination and ops cost           | Start with modular boundaries; split when independent ownership, scaling or isolation is evidenced |
| Distributed monolith                | Services deploy separately but share data, release assumptions or synchronous call chains | Enforce autonomy, contracts, failure isolation and independently testable boundaries               |
| Shared database across services     | Hidden coupling through schema and transaction assumptions                                | Explicit data ownership; use APIs/events and migration plans                                       |
| Retry storm                         | Timeouts trigger retries that amplify load                                                | Bounded retries, jitter, deadlines, backpressure, idempotency and load shedding                    |
| Cascading failure                   | Slow dependency consumes shared threads/connections and propagates overload               | Bulkheads, isolation, queue limits, circuit breakers and graceful degradation                      |
| Cache as source of truth            | Stale or inconsistent data violates business invariants                                   | Define authoritative store, TTL/invalidation and read-after-write semantics                        |
| “Exactly once” assumption           | Duplicate or ambiguous side effects after lost acknowledgements                           | Idempotency, deduplication, transactions, outbox/inbox and reconciliation                          |
| Backup without restore test         | Backup is corrupt, inaccessible, incomplete or lacks dependencies                         | Restore drills with measured RTO/RPO and integrity verification                                    |
| Redundancy with shared dependencies | One fault defeats all replicas                                                            | Common-cause analysis, independent failure domains and diverse controls where justified            |
| Big-bang migration                  | Cutover exposes unknown data and workflow gaps                                            | Incremental migration, shadow traffic, reconciliation and rollback/forward-fix plan                |
| Security as perimeter               | Trust inferred from network location; compromised internal identity has broad access      | Resource-oriented authorization and zero-trust principles                                          |
| Observability after launch          | Failures cannot be explained or attributed                                                | Instrument critical paths and correlation before production                                        |
| Dashboard without action            | Metrics are collected but no owner, threshold or response exists                          | Define SLI/SLO, decision owner, alert action and runbook                                           |
| AI as an oracle                     | Model output accepted without uncertainty, verification or escalation                     | Task-level evaluation, grounding, deterministic checks, human review and bounded permissions       |
| Model-first MBSE                    | Huge model created without decision use or governance                                     | Use a model with purpose and measure benefit against upkeep                                        |
| Requirements inflation              | Every request becomes mandatory; scope and verification collapse                          | Prioritize; separate needs, requirements, constraints and backlog options                          |
| Traceability theater                | Links exist but do not prove satisfaction or verification                                 | Typed relations, rationale, evidence and impact analysis                                           |
| Local metric optimization           | Teams improve their score while system outcome worsens                                    | Pair local measures with end-to-end outcome and guardrails                                         |
| “Human error” as root cause         | Organizational and interface conditions are ignored                                       | Examine workload, feedback, authority, training, incentives and control design                     |
| Gold-plating                        | Complexity added without stakeholder value                                                | Costed alternatives, reversible experiments and explicit quality drivers                           |
| Single-vendor magic                 | Critical capability becomes an undocumented provider dependency                           | Portability analysis, exit plan, contract testing and operational fallback                         |

## Failure analysis template

For each observed or plausible failure record:

- Initiating condition and trigger.
- System state and context at the time.
- Propagation path and dependencies.
- Detection mechanism and detection delay.
- Containment boundary and why it did or did not hold.
- User/business/mission consequence.
- Recovery action and recovery time.
- Contributing technical, organizational and environmental factors.
- Missing or ineffective control.
- Corrective action, owner, due date and verification evidence.
- Residual risk and learning to apply to other systems.

## Do not use generic “root cause” language prematurely

Complex incidents often have multiple necessary and contributing conditions. “The operator clicked the wrong button,” “the database was slow,” or “the microservice failed” describes an event, not a complete causal account. Reconstruct timeline, state, workload, dependencies, incentives and feedback. Distinguish trigger, latent condition, propagation mechanism and control weakness.

## Case-based learning

Use first-party postmortems and migration accounts to reconstruct architecture and operations. The PostHog feature-flag incidents illustrate dependency, CPU, queue/connection and retry interactions; Grammarly's Linkerd investigation highlights DNS/conntrack behavior; bol.com's data migration write-up shows the risk of moving data while maintaining a live business. Pair each narrative with a counterfactual design and test. [S21, S22, S34, S37]
