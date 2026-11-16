# 12 — Real-world case studies

These are first-hand engineering accounts, postmortems, or research studies. Treat them as context-specific evidence, not universal recipes.

## 1. Shopify — monolith to modular monolith

**Source:** [Shopify Engineering, Deconstructing the Monolith](https://shopify.engineering/deconstructing-monolith-designing-software-maximizes-developer-productivity) [S16], 2019.

**Context:** A large Rails codebase evolved over more than a decade and was worked on by over a thousand developers. Business capabilities were highly coupled. **Decision:** Rather than immediately moving to microservices, Shopify retained one codebase and introduced enforced modular boundaries, public APIs, and stronger data ownership. **Method:** CI tooling named Wedge detected cross-component calls and data coupling violations.

**Lesson:** The problem was uncontrolled coupling/developer productivity, not necessarily lack of network services. A modular monolith can improve structure without distributed operations. **Costs:** shared deployment/runtime; boundary discipline; less independent scale/fault isolation than services. **Ask:** Can modularizing solve the real problem before creating network boundaries?

## 2. Uber — service decomposition created new problems

**Source:** [Uber Engineering, Service-Oriented Architecture](https://www.uber.com/us/en/blog/service-oriented-architecture/) [S32], 2015.

**Context:** Product/geographic growth made one codebase and release process difficult to evolve. **Decision:** move toward independently deployable services around domains. **New problems documented:** with hundreds of services, service discovery and contract understanding became hard; REST/RPC interfaces varied; type safety and validation were inconsistent; timeouts/outages/cascading failures lacked standard handling. Uber described the result as a “distributed monolithic API” when separation did not produce clean contracts and resilience.

**Lesson:** Pair service boundaries with discovery, standard contracts, schema/version policy, client libraries, timeout/retry conventions, ownership, and fault isolation. Splitting code alone does not create autonomy.

## 3. Adyen — payment acceptance separated from accounting

**Source:** [Adyen, Accounting and Reporting Systems](https://www.adyen.com/knowledge-hub/design-to-duty-adyen-architecture-part2) [S33], 2021.

**Context:** Payments create multiple accounting records. Adyen describes double-entry bookkeeping and mathematically verified templates to preserve ledger balance. Write volume eventually exceeded one PostgreSQL database. **Decisions:** reporting DB separated to reduce read pressure; accounting DB sharded later. Round-robin partitioning was chosen after considering merchant/payment-method keys, because those could require broad cross-shard aggregation.

**Reliability boundary:** payment processing persists incoming payment state locally; a separate process performs accounting. When accounting consistency is uncertain or accounting storage is unavailable, accounting can lag without immediately disabling payment acceptance. The queue is persisted in a database, not only memory.

**Lesson:** Separate critical synchronous user path from deferrable work only when business semantics permit. Persist intent and reconcile downstream effects. Select shard keys from real query/aggregation behavior.

## 4. PostHog — timeout plus retries caused cascading outage

**Source:** [PostHog postmortem, 29 September 2025](https://posthog.com/handbook/company/post-mortems/2025-09-29-flags-is-down) [S21]. Impact: 1h48m; about 78% of US-region feature-flag evaluation requests failed with HTTP 504. A DB connection timeout was reduced from 1 second to 300 ms during elevated writer load. Retry logic lacked circuit breaking and exponential backoff, multiplying failed attempts. Health probes kept routing to crash-looping pods; hardcoded configuration and rollback permission issues delayed recovery.

**Lesson:** Timeout choices interact with tail latency and load. Retries amplify failure. Health checks must distinguish “process exists” from “ready to serve.” Test recovery configuration and permissions before incidents.

## 5. PostHog — CPU pressure spread to connection pools and Redis

**Source:** [PostHog recurring outages, October 2025](https://posthog.com/handbook/company/post-mortems/2025-10-21-feature-flags-recurring-outages) [S22]. Four incidents over ten days totaled over 14 hours of major impact. Three had CPU resource undersizing as a shared contributor; another involved rate-limit misconfiguration. Small nodes relative to pod requests caused CPU saturation. Connection pools failed to initialize; slow requests/retries increased parallelism; database connections multiplied; cache misses triggered DB fallback; Redis was overwhelmed. Shared infrastructure affected the main app too.

**Lesson:** Capacity is a graph, not a CPU metric. Model retry fan-out, per-pod pools, cache misses, startup, and shared infrastructure.

## 6. Grammarly — hidden DNS/network capacity limit

**Source:** [Grammarly, The Great Linkerd Mystery](https://www.grammarly.com/blog/engineering/the-great-linkerd-mystery/) [S34], 2025. Linkerd denials coincided with AWS ENA conntrack allowance pressure on CoreDNS instances. Exceeded connection tracking allowance caused packet drops; DNS requests failed; clients retried/backed off/closed; Linkerd protocol detection timed out; traffic was denied.

**Lesson:** Lower-level shared dependencies may be absent from an application diagram. Monitor provider-specific network limits and map the whole dependency chain. DNS is a critical availability dependency.

## 7. Stepwise monolith migration — measured performance impact

**Source:** Faustino et al., [Stepwise Migration of a Monolith to Microservices](https://arxiv.org/abs/2201.07226) [S35], 2022. The researchers measured one production system as it moved from monolith to modular monolith to microservices. In this system, modularization could serve as an intermediate step; microservice network overhead significantly reduced performance for selected operations and required coarser-grained interactions and rework.

**Limit:** one system/selected operations cannot prove microservices are generally slower or modular monoliths always preferable. **Ask:** What measured benefit justifies each network boundary and what is its critical-path cost?

## 8. Microservice energy tactics — quality attributes conflict

**Source:** Xiao, Gao, Bogner, [microservices tactics and energy trade-offs](https://arxiv.org/abs/2501.14402) [S36], arXiv version 2025. Controlled experiments on Online Boutique compared three tactics and three patterns under different loads. Some techniques reduced energy use by up to 5.6% in tested conditions, but also changed response time, throughput, or maintainability; effects were load-dependent.

**Lesson:** Optimize multiple attributes together. This is a bounded experiment, not a universal energy/performance model.

## 9. bol.com — historical data migration while business continues

**Source:** [bol.com Techlab](https://techlab.bol.com/en/blog/splitting-the-data-of-the-monolith-because-who-needs-to-sleep-anyway/) [S37], 7 November 2024. A financial fulfillment monolith held roughly 4 TB of data; about 3 TB was planned for two new microservices. Jobs took 19–23 hours while daily fulfillment obligations continued.

**Lesson:** Migration is a product and operations problem, not just ETL. Preserve historical context for future refunds/credits, maintain business obligations during cutover, quantify unknown transform time, design reconciliation and rollback before promising a date.

## Cross-case synthesis

1. Boundaries solve one problem and create another: modules reduce code coupling; services introduce network/operating dependencies.
2. Protect critical user paths; defer noncritical processing only with durable intent and reconciliation.
3. Retries are load generators; model them in capacity/failure analysis.
4. Shared infrastructure defeats isolation: DNS, Redis, identity, pipelines, control planes.
5. Migration is lifecycle engineering: historical data, mixed versions, operations, customer promises.
6. Measure multiple attributes: latency, throughput, maintainability, energy, correctness, cost.
7. Incident reports provide concrete failure paths, but design choices remain context-specific.
