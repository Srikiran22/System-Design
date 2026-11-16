# 33 — Cloud-native architecture, platform engineering and operations

## Cloud is a deployment and operating model, not an architecture answer

Cloud services can reduce undifferentiated infrastructure work, but they do not remove failure, security, capacity, data governance, cost or vendor-dependency decisions. A cloud-native system must be designed for deployment, observability, recovery, change and cost as well as request handling.

## Topology and failure domains

Document regions, zones, networks, identity planes, control planes, data stores, queues, secrets, build systems, DNS, certificates, observability pipelines and external providers. For each critical path identify shared dependencies. Two application instances in separate zones are not independent if they share one database, identity provider, DNS path, KMS key, routing layer or deployment pipeline.

## Deployment strategies

- **Rolling:** replace instances in batches; ensure mixed-version compatibility.
- **Blue/green:** route traffic between two environments; requires data compatibility and clear cutover semantics.
- **Canary:** expose a small cohort, measure guardrails and expand only when evidence is acceptable.
- **Feature flags:** decouple deploy from release; manage flag ownership, expiry, default safety and configuration failure.
- **Progressive delivery:** combine automation, metrics, policy and rollback; rollback must be safe for data/schema changes.

## Site Reliability Engineering

SRE treats reliability as an engineering objective with explicit service-level indicators (SLIs), objectives (SLOs), error budgets, monitoring, automation, incident response and postmortem learning. An SLO is a reliability target over a defined window; it is not the same as a contractual SLA. Error budgets help negotiate feature velocity and reliability work. Do not turn operational measures into team quotas.

Useful signals include latency, traffic, errors and saturation, but select signals based on user-visible behavior and service semantics. A dashboard full of infrastructure metrics can miss a broken transaction or degraded business process. [S15]

## Recovery engineering

Define:

- **RTO:** target time to restore service/function.
- **RPO:** acceptable data-loss window measured in time.
- **MTPD / maximum tolerable disruption:** maximum disruption before impact becomes unacceptable.
- **Failover conditions:** automatic/manual triggers, decision authority and false-positive tolerance.
- **Failback conditions:** how the original environment is safely restored.
- **Backup strategy:** scope, immutability, encryption, retention, geographic independence and restore testing.

Backup success is not restore success. A recovery plan is not proven until a realistic restore and failover test exercises data, identity, network, secrets, dependencies, runbooks and staff roles.

## Capacity and performance

Model demand by user journey and workload profile, not only average requests per second. Consider burstiness, concurrency, arrival rates, service time, queue length, utilization, cache hit rate, payload size, fan-out and downstream limits. Use Little's Law only when its stable-system assumptions are understood. Load-test at realistic data volumes and include saturation/overload behavior.

## Observability and operations readiness

Instrument logs, metrics, traces and events with stable correlation IDs, useful cardinality, privacy controls and retention. Define health checks with semantics: liveness should not restart a process simply because a dependency is slow; readiness should reflect ability to serve the relevant workload; startup checks should handle initialization. Provide runbooks, on-call ownership, escalation paths, dashboards, dependency maps, feature kill switches and user communication plans.

## Platform engineering

An internal developer platform is a product for internal users. It should provide golden paths, self-service infrastructure, policy guardrails, secure defaults, environment provisioning, software templates and reusable capabilities. A platform that imposes one rigid model without understanding team needs can increase cognitive load and create shadow infrastructure. Measure developer outcomes, platform adoption, cognitive load, lead time and reliability rather than counting platform features.

## FinOps and lifecycle economics

Cloud cost is an architecture quality attribute. Track cost per transaction, user, tenant, model call or business outcome; identify idle capacity, data egress, storage growth, observability cost and cross-region replication. Cost reduction that increases outage, security or engineering risk may be a false saving. The FinOps framework provides a shared operating model for engineering, finance and business accountability. [S152]

## Operational readiness review

Before launch, prove service ownership, SLOs, capacity headroom, failure handling, backup/restore, DR exercises, dependency limits, observability, security controls, threat model, incident playbooks, release rollback, data migration safety, support/training and decommission path.
