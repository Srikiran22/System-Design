# 03 — System design foundations

## A repeatable design workflow

1. **Write the problem statement.** Name user, job, outcome, pain, business goal, success measure. Do not start with a technology. Example: reserve a limited seat and confirm it durably without double booking during bursts.
2. **Identify actors and workflows.** Include users, administrators, operators, partners, support, scheduled jobs, devices, other systems, and unhappy paths: cancellation, correction, retry, support.
3. **Define context and boundaries.** Draw the system and external actors/dependencies. Mark data exchanged, ownership, trust boundaries, and exclusions. Do not hide dependencies inside a generic “external service” box.
4. **Define functional requirements.** Specify actor, preconditions, action, result, failure outcomes, authorization, and invariants such as “one seat has at most one active confirmed booking.”
5. **Define quality attributes.** Translate fast, available, secure, scalable, and maintainable into measurable scenarios. Prioritize them. See [04].
6. **Estimate workload.** Average/peak requests, read/write mix, payload, data growth, retention, concurrency, bursts, geography, expensive operations. Record assumptions and sensitivity ranges. See [07].
7. **Model domain and data.** Business capabilities, entities, ownership, invariants, transactions, states, events. Identify authoritative owner for every critical data item.
8. **Design components and contracts.** Responsibilities, interfaces, API/event semantics, versioning, authorization, timeouts, error model, idempotency, ownership. Draw sync and async paths separately.
9. **Design failure and abuse behavior.** For each dependency consider slow, unavailable, overloaded, stale, duplicated, reordered, malformed, compromised, partitioned. Decide fail closed, degrade, queue, or reconcile.
10. **Produce architecture views.** Context; container/component; deployment/trust boundary; critical sequences; data ownership/lifecycle; failure-domain/recovery. C4 provides context, container, component, code views [S08].
11. **Compare options.** At least simple viable baseline, option optimized for main growth driver, and option optimized for the most severe quality requirement. Record trade-offs. ATAM-style review suits important systems [S09].
12. **Test risky assumptions.** Prototype the dangerous part: contention, event ordering, failover, migration duration, key rotation, authorization, p95/p99 latency.
13. **Define operations and revisit triggers.** Telemetry, alerts, SLOs, on-call, release/rollback, backup/restore, disaster recovery, cost, conditions for redesign.

## Architecture deliverables

| Deliverable                 | Minimum content                                                    |
| --------------------------- | ------------------------------------------------------------------ |
| Architecture brief          | Problem, scope, stakeholders, requirements, constraints, decisions |
| Context diagram             | Actors, dependencies, data exchanged, trust boundaries             |
| Component/container diagram | Responsibilities, interfaces, ownership                            |
| Sequence diagrams           | Critical flows and failure paths                                   |
| Data model                  | Entities, keys, invariants, ownership, retention, access patterns  |
| Deployment view             | Regions, zones, networks, compute, storage, control plane          |
| Quality scenarios           | Stimulus, context, response, measure, priority                     |
| ADR set                     | Decision, context, options, choice, consequences, evidence         |
| Risk register               | Risk, likelihood/impact, owner, mitigation, residual risk          |
| Operations guide            | SLOs, dashboards, alerts, runbooks, restore/recovery               |
| Verification plan           | Tests and evidence required to prove claims                        |

## Common design questions

- What is the user-visible operation and its success metric?
- What is the source of truth? What invariants must hold?
- What is the critical path? What can be asynchronous?
- What is expected traffic and data shape?
- Which calls are remote and what are timeout/retry semantics?
- What happens when a dependency is slow or unavailable?
- What must be atomic and what may be eventually consistent?
- How is the system secured, observed, deployed, restored, migrated?
- What is the simplest design that satisfies requirements now?
- Which assumption, if wrong, invalidates the design?

## Verification versus validation

- **Verification:** evidence that specified requirements have been met (test, analysis, inspection, demonstration).
- **Validation:** evidence that the system solves the intended problem for stakeholders in its intended environment.

A service can pass every API test and still fail validation because the workflow does not match actual customer operations. NASA's handbook distinguishes verification and validation in the lifecycle [S02].

## Documentation discipline

Document for people who must build, review, operate, or change the system. Keep diagrams linked to source-of-truth decisions and update them as design changes. Do not build a diagram set nobody maintains. Begin with the smallest useful views and add detail for stakeholder concerns.
