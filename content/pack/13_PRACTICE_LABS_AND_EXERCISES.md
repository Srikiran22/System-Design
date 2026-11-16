# 13 — Practice labs and exercises

## What every complete answer must contain

1. Problem, actors, scope, context, assumptions.
2. Functional requirements and invariants.
3. Prioritized measurable quality scenarios.
4. Workload and storage estimate.
5. Domain/data model and ownership.
6. Architecture diagrams and critical sequences.
7. API/event contracts and versioning.
8. Security/threat model.
9. Failure modes and primary/secondary defenses.
10. Options, trade-offs, ADRs, risk register.
11. Test plan, operations plan, SLOs, costs.
12. Unanswered questions and revisit triggers.

## Twelve starter labs

1. **URL shortener:** create/redirect/update/delete, analytics, abuse, aliases, expiration; key generation, hot keys, cache, redirect latency, collisions.
2. **Ticket booking:** seat holds, payment, confirmation, expiry, cancellation/refund; double booking, hold expiry, lost payment response, duplicate callback, contention, oversell.
3. **Payment ledger:** authorization, capture, settlement, refund, chargeback, audit, reconciliation; double-entry invariants, outbox, durable workflows.
4. **Inventory/order system:** warehouses, reservations, stock movement, returns, safety stock, fulfillment; concurrent writes, oversell, routing.
5. **Chat/messaging:** membership, delivery, receipts, ordering, attachments, offline users, push, abuse, retention; fan-out-on-write/read.
6. **Video streaming:** upload, transcode, storage, catalog, playback, adaptive bitrate, CDN, DRM, rights, analytics; hot content and egress cost.
7. **Search:** indexing, schema evolution, serving, ranking, freshness, filters, tenancy, reindex; source of truth vs index, backfill and cutover.
8. **Feature flags:** low-latency evaluation, rules, targeting, SDK, cache, kill switch, audit, rollout; CPU pressure, stale config, DB outage, fallback.
9. **Event ingestion:** burst producers, validation, durable queue, schema registry, consumers, replay, dedupe, retention, quotas; backpressure/poison events.
10. **Healthcare appointments:** patient identity, scheduling, reminders, clinical data, audit, consent, emergency access, integrations; privacy/safety/interoperability/human workflows.
11. **Warehouse intelligence:** WMS/ERP/scanner ingestion, inventory, location mapping, forecasts, alerts, dashboards, offline operation; stale data and reconciliation.
12. **Multi-tenant SaaS:** provisioning, authorization, isolation, quotas, billing, export/deletion, configuration, noisy neighbors; compare shared tables/schema/database/cells.

## Systems-thinking exercises

- Iceberg-model a recurring production incident: event, pattern, structure, mental model.
- Stock-flow model support tickets or order backlog; identify arrival/completion/work-in-progress/delay.
- Map retry storm as reinforcing loop; propose two interventions and side effects.
- Model feature adoption and support load as feedback.
- Analyze how a service boundary changes team communication, ownership, release behavior.
- Find three leverage points in a product workflow beyond adding infrastructure.
- Plot behavior over time with baseline, intervention, expected result, alternative explanation.

## Failure drills

For each lab, simulate at least five: slow dependency; 500/429/malformed response; network partition/DNS failure; zone/region failure; DB failover with replica lag; cache flush/stampede; queue backlog/poison message; duplicate/delayed/out-of-order event; credential compromise/identity outage; 10× traffic spike; schema-incompatible deployment; corrupted backup; noisy tenant; operator control-plane loss; external API contract change.

For each: trigger, detection, affected journey, containment, recovery, reconciliation, independent second defense.

## Architecture review rubric (100 points)

| Dimension                   | Points | Strong evidence                                                   |
| --------------------------- | -----: | ----------------------------------------------------------------- |
| Problem/domain/stakeholders |     10 | Boundaries, workflows, invariants, assumptions                    |
| Requirements/quality        |     10 | Measurable and prioritized                                        |
| Architecture/interfaces     |     15 | Ownership, appropriate boundaries, coherent flows                 |
| Data/consistency            |     10 | Source of truth, transactions, idempotency, migration             |
| Capacity/performance        |     10 | Plausible estimates and realistic tests                           |
| Reliability/recovery        |     15 | Failure domains, degradation, independent defenses, restore tests |
| Security/privacy            |     10 | Trust boundaries, threats, least privilege, data control          |
| Operations/delivery         |     10 | Telemetry, SLOs, on-call, rollout, rollback, runbooks             |
| Trade-offs/evidence/product |     10 | Alternatives, consequences, ADR, user/business measures           |

Automatic review failure: duplicate financial side effects can occur silently; critical data has no source of truth; retries are unbounded; backup is claimed without restore testing; degraded mode weakens authorization; or critical business recovery is omitted.

## Portfolio standard

Keep at least three complete designs: one transactional system, one high-read/low-latency system, and one event-driven/operationally complex system. Include diagrams, ADRs, estimates, threat model, failure drills, test evidence, and reflection on which assumption changed after testing.
