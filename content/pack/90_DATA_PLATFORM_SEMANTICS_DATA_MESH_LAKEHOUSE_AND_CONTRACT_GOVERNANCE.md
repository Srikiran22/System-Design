# 90 — Data-platform architecture: semantics, contracts, mesh and lakehouse choices

## Begin with data use, not product labels

“Data lake,” “warehouse,” “lakehouse,” “data mesh” and “data fabric” are not mutually exclusive implementations of a single design choice. They describe different architectural concerns: storage/transaction/analytics capabilities, governance model, ownership model, integration and discovery. Select an approach from workload semantics, ownership, operating model, data quality, latency, consistency, privacy, cost and change rate—not from a trend label.

## Data as an engineered interface

A data contract is more than a schema. It should define:

- identity and ownership;
- semantics, units, reference data and meaning;
- schema and compatibility policy;
- ordering, event time, processing time and late-arrival behavior;
- freshness/availability expectations;
- quality constraints and validation rules;
- access/privacy classification and retention;
- replay, deduplication, idempotency and failure handling;
- versioning, deprecation and consumer migration;
- operational owner and incident process.

A syntactically valid record can still be semantically wrong. For example, a currency field without currency code, timezone-naive timestamp or changed meaning of “active customer” can corrupt downstream decisions without failing a schema validator.

## Data mesh is an operating model plus architecture

Data mesh commonly combines domain-oriented ownership, data as a product, self-serve data infrastructure and federated governance. The evidence base includes practitioner literature and growing academic work; a systematic gray-literature review analyzes 114 industrial articles, while more recent reference architecture work identifies multiple adoption archetypes and organizational/technical challenges. [S200, S268]

Data mesh is not a synonym for distributed ETL or microservices. It requires clear domain accountability, product quality and discovery, interoperability, platform capabilities, and federation rules. Decentralizing ownership without investing in platform self-service or governance can create new silos rather than remove old ones.

## Lakehouse trade-offs

The original CIDR 2021 lakehouse paper proposes open direct-access data formats, transactional storage capabilities and support for analytics/ML workloads. Treat it as an architecture proposal from its authors, not a neutral comparison of every implementation. [S263]

Evaluate storage/compute separation, ACID transaction support, table formats, concurrent readers/writers, schema evolution, time travel, governance, workload isolation, cost predictability, portability and catalog consistency. “Open format” does not automatically imply open operational governance or portable semantics.

## Streaming correctness

For an event pipeline, define the semantics of:

- delivery: at-most-once, at-least-once or a carefully scoped exactly-once guarantee;
- processing: deterministic, idempotent, transactional or externally coordinated;
- order: global, per-key, per-partition or causal;
- time: event time, ingestion time, processing time, watermark and late data;
- replay: offsets, retention, ordering and side effects;
- recovery: dead-lettering, backpressure, retry limits and poison messages.

Exactly-once claims must state the scope: a broker transaction may guarantee atomicity inside the broker but not necessarily an external database or third-party API side effect.

## Data migration assurance

A high-assurance migration requires a source/target inventory, transformation rules, key strategy, referential integrity rules, reconciliation totals, sampling or full comparison, dual-run/cutover plan, rollback criteria, write freeze or change-data-capture plan, access/security controls, audit trail and post-cutover monitoring. Validate business meaning, not just row counts.

## Practical deliverable

Design a data platform for finance, logistics and customer operations. Define product contracts for three domains; map master/reference data; select event and batch pathways; specify schema evolution and replay; define PII access and retention; create data quality SLOs; and write a migration/cutover reconciliation plan.

## Source limitations

The data mesh systematic review includes industrial gray literature and should be read with awareness of vendor and practitioner incentives. The lakehouse paper is an original academic-conference proposal with strong author/industry affiliation. Pair both with current independent implementations and failure reports. [S200, S263, S268]
