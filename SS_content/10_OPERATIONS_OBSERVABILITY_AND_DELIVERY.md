# 10 — Operations, observability and delivery

## Operability is a design property

A system that works only when its original developers are present is operationally fragile. Design for deployment, diagnosis, safe change, capacity management, incident response, backup, restore, security response, and retirement.

## Observability

**Monitoring** checks known conditions. **Observability** is the ability to infer internal state from emitted evidence.

- **Metrics:** numeric time series for rates, counts, utilization, latency, queue depth, saturation, and business outcomes.
- **Logs:** structured event records with context, severity, and correlation IDs.
- **Traces:** causal path of a request across components and time.

Instrument business outcomes too: order accepted, payment authorized, inventory held, reconciliation discrepancy. Infrastructure health alone is insufficient.

### Four golden signals and related models

Latency, traffic, errors, saturation. **USE** = utilization, saturation, errors; useful for resources. **RED** = rate, errors, duration; useful for services. These are starting lenses, not replacements for domain metrics.

Avoid CPU-only alerts without user impact/saturation context, uncontrolled high-cardinality labels, secrets/PII in logs, unowned alerts, dashboards without operator questions, and synthetic checks that only prove a process is alive.

## SRE and service objectives

Google's SRE book covers SLOs, error budgets, monitoring, alerting, incident response, postmortems, reliability testing, overload, cascading failures, and data integrity [S15]. An SLO should measure a real user-visible promise. Keep SLI definitions stable and review measurement gaps.

## Incident response

1. Detect and declare severity by user/business impact.
2. Establish an incident commander and roles.
3. Stabilize first: stop blast radius, shed load, disable risky feature, isolate dependency, or roll back safely.
4. Preserve evidence and communicate impact.
5. Recover service, then reconcile data/deferred work.
6. Validate the critical user journey, not just component health.
7. Write a blameless postmortem and verify corrective actions.

## Delivery and deployment safety

- Small batches reduce the size of change but do not eliminate risk.
- Feature flags enable controlled exposure; design their own failure modes.
- Canary releases expose a small cohort; compare error, latency, resources, business metrics.
- Blue-green swaps prepared environments; schema/data compatibility still matters.
- Rolling deployments require compatibility between old/new versions.
- Code rollback may not reverse data migration or external side effects.
- Use expand-and-contract schema changes when versions coexist.
- Protect deployment credentials and test recovery access.

## Testing strategy

| Test                    | What it proves                                         |
| ----------------------- | ------------------------------------------------------ |
| Unit                    | Small behavior and invariants                          |
| Component/integration   | Contract and behavior together                         |
| Contract                | Producer/consumer interface agreement                  |
| End-to-end              | Critical user journey across dependencies              |
| Load/stress/spike       | Capacity, bottlenecks, tail latency, overload recovery |
| Soak                    | Leaks/resource drift/long-running behavior             |
| Fault injection         | Dependency failure, delay, loss, partition behavior    |
| Security                | Controls resist known attacks and misuse               |
| Data recovery           | Restore, replay, reconciliation, integrity             |
| Usability/accessibility | Users complete tasks accurately and efficiently        |
| Disaster recovery       | Team meets RTO/RPO under realistic scenario            |

## Operational readiness questions

Who owns each service/database/stream/journey? Are SLOs and alerts tied to user impact? Can requests be traced end-to-end? Are runbooks executable by on-call? Is rollback data-compatible? Are timeouts/retries/rate limits/bulkheads explicit? Are backups restored/reconciled in tests? Are capacity and costs monitored? Can the system degrade safely? Are incident roles/customer communications/escalations defined?

**References:** Google SRE [S15], AWS Well-Architected [S12], Google Cloud Well-Architected [S10], Azure Well-Architected [S11], OpenTelemetry [S29], DORA [S30].
