# 34 — Data architecture, integration and migration engineering

## Data architecture is system architecture

Data choices determine product correctness, latency, cost, privacy, integration complexity, recoverability and the ability to evolve. A “database selection” made without lifecycle, consistency, ownership and migration analysis is incomplete.

## Workload classes

- **OLTP:** transactional workloads, concurrent updates, integrity constraints and low-latency access.
- **OLAP / analytical:** scans, aggregation, historical analysis and columnar/warehouse optimization.
- **Streaming:** continuous event arrival, low-latency processing, ordering and replay.
- **Search / retrieval:** inverted indexes, vector indexes, ranking and freshness trade-offs.
- **Time-series / telemetry:** timestamped high-volume observations, retention and downsampling.
- **Graph:** relationship-heavy traversal and neighborhood queries.
- **Object / blob:** unstructured files, images, logs and large binary objects.

A product may use several stores, but each additional persistence system creates operational and consistency cost.

## Storage model selection

Choose relational, document, key-value, wide-column, graph, time-series, search or object storage based on access patterns, constraints, transaction semantics, query flexibility, schema evolution, operational expertise and recovery objectives. “NoSQL” is not one data model and “SQL scales poorly” is not a valid design rationale.

## Data architecture patterns

- **Warehouse:** governed analytical data model and query platform.
- **Data lake:** low-cost storage of broad/raw data; requires catalog, governance and quality controls to avoid a data swamp.
- **Lakehouse:** combines data-lake storage with table/transaction/metadata capabilities; implementation details vary.
- **Data mesh:** organizational and architectural principles: domain ownership, data as a product, self-serve platform and federated computational governance. It is not simply a new storage product. [S140, S141]
- **Data fabric:** integration/metadata-oriented approach to connecting distributed data assets; product definitions vary by vendor.

## Pipeline design

A robust pipeline defines ingestion, validation, transformation, enrichment, storage, serving, lineage, retries, dead-letter handling, replay, idempotency, schema versioning, monitoring and deletion/retention. Separate data quality dimensions such as accuracy, completeness, consistency, timeliness, uniqueness, validity and availability. Define acceptance thresholds based on use case; there is no single universal data-quality score.

## ETL, ELT and CDC

- **ETL:** transform before loading into the target store.
- **ELT:** load raw/near-raw data, then transform within the destination platform.
- **CDC:** capture changes from a source system. Preserve transaction order/identity where required; do not treat every row change as a domain event.

## Integration contracts

An API or event contract specifies schema, semantics, identity, ownership, versioning, compatibility, timing, delivery, error handling, security, privacy, replay and retention. Include data classification, lawful purpose, consent/retention obligations and deletion propagation. Schema compatibility tests are necessary but cannot detect semantic changes.

## Data migration sequence

1. Inventory entities, volumes, producers, consumers, dependencies and legal retention obligations.
2. Define source-of-truth ownership and migration acceptance criteria.
3. Map old and new schemas; record semantics, units, null handling, identifiers and transformations.
4. Build repeatable extraction and transformation with checksums and row/value reconciliation.
5. Test migration on representative and worst-case data volumes.
6. Choose cutover: offline, dual-write, change-data-capture, shadow reads, staged domain migration or strangler pattern.
7. Plan write freeze / consistency barrier if required.
8. Validate business invariants, totals, referential integrity, duplicate/missing records and access controls.
9. Define rollback, forward-fix and data-reconciliation behavior; rollback may be impossible after divergent writes.
10. Monitor post-cutover data quality and retire legacy dependencies only after an agreed evidence period.

## Data governance responsibilities

Name a business data owner, technical custodian, data steward and platform owner where appropriate. Define classification, quality, metadata, lineage, master/reference data, access, retention, archival, deletion, backup and audit requirements. Central policy and distributed domain ownership can coexist; clarify which decisions are federated and which are centrally controlled.

## Security and resilience concerns

Protect data in transit and at rest, keys, secrets, pipelines, backups, replicas, logs, exports, test copies and model-training corpora. Backups can become a data-exfiltration channel. Replication can spread corruption or ransomware; pair it with immutable recovery points and tested restoration. [S144]
