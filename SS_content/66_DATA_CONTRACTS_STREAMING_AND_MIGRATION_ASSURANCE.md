# 66 — Data contracts, streaming semantics and migration assurance

## Data architecture is socio-technical

A data platform includes producers, consumers, domain ownership, transformation logic, storage, semantics, access controls, lineage, quality processes, service levels and incident handling. Data Mesh makes four principles explicit: domain-oriented ownership, data as a product, self-service infrastructure and federated computational governance. The systematic review synthesizes 114 grey-literature sources and describes the concept's principles and implementation challenges [S200]. The foundational Data Mesh article describes common centralized lake failure modes and a decentralized product-oriented alternative [S201].

## Data product contract

A data contract should identify:

- owner and accountable operational contact;
- business meaning and intended consumer use;
- schema, types, units, keys and semantic definitions;
- allowed nullability, range, cardinality and uniqueness;
- freshness, completeness and availability objectives;
- event time vs processing time semantics;
- compatibility/evolution rules;
- privacy classification, lawful purpose and access policy;
- lineage, provenance and transformation logic;
- retention, deletion and correction semantics;
- versioning, deprecation and incident process.

Schema validity alone does not prove semantic correctness. “Amount: 100” is ambiguous without currency, tax, time basis, sign convention and meaning.

## Streaming and event semantics

Define event identity, key, ordering scope, timestamp semantics, replay behavior, duplicate handling, late-arriving data policy, schema evolution, poison-message strategy, checkpoint behavior and retention. Distinguish event time from processing time. A system may be at-least-once at transport level yet deliver effectively-once business outcomes through idempotent processing and durable transaction boundaries.

## ETL/ELT, CDC and reconciliation

A migration plan must preserve correctness across source capture, transformation, target load and cutover. Typical stages:

1. Inventory source data, ownership, volume, sensitivity and dependencies.
2. Define canonical mapping and transformation rules.
3. Profile data and define quality thresholds.
4. Establish snapshot and change-data-capture strategy.
5. Run repeated rehearsal migrations.
6. Reconcile row counts, keys, aggregates, referential integrity and business-level invariants.
7. Cut over with a defined write-freeze/dual-write/CDC strategy.
8. Verify target behavior, access controls and downstream consumers.
9. Maintain rollback or forward-recovery conditions.
10. Retire source only after acceptance and retention obligations are satisfied.

## Lakehouse and storage architecture

The lakehouse paper analyzes the requirements for combining warehouse-style transactions and analytical processing with open data formats and flexible compute [S202]. The architecture trade-off is not only “lake vs warehouse”; evaluate concurrency, transaction semantics, catalog consistency, schema evolution, governance, performance isolation, engine interoperability, operational maturity and cost. “Open format” does not automatically mean portability if catalogs, permissions, table semantics and operational workflows are proprietary.

## Data quality dimensions

At minimum, assess accuracy, completeness, consistency, timeliness/freshness, validity, uniqueness, integrity, representativeness, provenance and fitness for purpose. Choose thresholds based on impact. For financial ledger or safety telemetry, aggregate accuracy can conceal dangerous local errors.

## Common failure modes

- Rebuilding a lake without changing centralized ownership and incentives.
- Treating a data product as a table with no service contract.
- Silent semantic changes behind schema-compatible fields.
- CDC without delete semantics or ordering guarantees.
- Dual-write without reconciliation and conflict handling.
- Backfill racing with live updates.
- Migration acceptance based only on row counts.
- Lineage that ends at the pipeline but not the decision or report.

## Evidence required before cutover

Maintain source-to-target mappings, test results, reconciliation reports, data-quality exceptions, cutover runbook, rollback/forward-recovery plan, consumer sign-offs, access-control validation, performance/capacity results and a signed configuration baseline.
