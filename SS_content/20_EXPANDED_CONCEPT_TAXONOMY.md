# 20 — Expanded concept taxonomy and quick retrieval map

Use this as a coverage checklist. “Major” topics are the domains; the indented items are common sub-concepts to learn, compare, and practice. It is a taxonomy, not a claim that all specialist branches are fully expanded in this first pack.

## 1. Systems foundations

- System purpose, elements, relationships, boundary, environment, stakeholders.
- System-of-systems, socio-technical systems, lifecycle, emergence, complexity.
- Abstraction, decomposition, encapsulation, modularity, cohesion, coupling, information hiding.
- Constraints, drivers, assumptions, dependencies, risks, uncertainty, reversibility, path dependence.
- Architecture views, viewpoints, models, traceability, documentation, configuration management.

## 2. Problem framing and requirements

- Mission/business analysis; product discovery; user jobs and outcomes.
- Stakeholder analysis; personas/actors; use cases; user journeys; operational scenarios.
- Concept of Operations (ConOps); context diagrams; system boundary and external interfaces.
- Functional requirements; quality attributes; constraints; interface requirements; compliance obligations.
- Requirement decomposition, allocation, traceability, acceptance criteria, prioritization.
- Requirements volatility, ambiguity, feasibility, validation and change control.
- Verification, validation, qualification, acceptance, testability, evidence.

## 3. Systems thinking and system dynamics

- Iceberg model: events, patterns, structures, mental models.
- Stocks, flows, accumulation, throughput, capacity, delays, feedback.
- Reinforcing and balancing loops; causal polarity; loop dominance; nonlinear behavior.
- Behavior-over-time graphs; causal-loop diagrams; stock-flow diagrams; connection circles.
- Leverage points, system archetypes, unintended consequences, adaptation, emergence.
- Soft Systems Methodology; rich pictures; boundary critique; multiple stakeholder worldviews.
- Scenario planning, sensitivity analysis, policy resistance, path dependence.

## 4. Software architecture and decomposition

- Architecture styles: monolith, modular monolith, layered, hexagonal, clean, client-server, SOA, microservices, event-driven, serverless, peer-to-peer, pipes-and-filters, space-based.
- Architecture patterns versus tactics versus implementation technologies.
- Domain-Driven Design: subdomains, bounded contexts, ubiquitous language, aggregates, repositories, context maps.
- Decomposition by business capability, change rate, consistency boundary, data ownership, security boundary, team ownership.
- Coupling dimensions: compile-time, runtime, data, temporal, deployment, organizational, semantic.
- Interface/contract design: REST, RPC, gRPC, GraphQL, webhooks, events, schema evolution, versioning.
- Architecture documentation: C4 context/container/component/code, deployment, sequence, state, data-flow, threat diagrams.
- Architecture evaluation: ATAM, scenario analysis, ADRs, risk/sensitivity/trade-off analysis, fitness functions.

## 5. Computation, concurrency and runtime behavior

- Process, thread, coroutine, event loop, task scheduler, worker pool.
- Parallelism versus concurrency; synchronization; locks; mutexes; semaphores; atomics.
- Race conditions, deadlocks, livelocks, starvation, priority inversion, memory visibility.
- State machines, finite-state transitions, idempotent handlers, transactional boundaries.
- Queueing theory basics, Little's Law, service rate, arrival rate, utilization, tail latency.
- CPU, memory, storage IOPS/throughput, file descriptors, connection pools, resource limits.
- Backpressure, bounded queues, admission control, fairness, load shedding, work prioritization.

## 6. Networking and communication

- OSI/TCP-IP model; IP addressing/subnetting; routing; NAT; firewall; VPN; proxies.
- TCP, UDP, QUIC; connection lifecycle; congestion; retransmission; MTU; keepalive.
- DNS, service discovery, TLS/certificates, HTTP semantics, HTTP/2/3.
- REST, RPC, gRPC, WebSocket, SSE, streaming, long polling, webhooks.
- Load balancers, reverse proxies, API gateways, service mesh, ingress/egress.
- Network partitions, latency, packet loss, jitter, bandwidth, conntrack, DNS failure modes.

## 7. Data architecture and persistence

- Relational, key-value, document, wide-column, graph, time-series, search index, object storage.
- Schema design, normalization/denormalization, keys, indexes, constraints, query planning.
- ACID transactions, isolation levels, locking, MVCC, write-ahead logs, snapshots.
- Replication, leader/follower, multi-leader, quorum, conflict resolution, replication lag.
- Partitioning/sharding, key choice, hot partitions, rebalancing, cross-shard queries.
- Consistency models: linearizable, sequential, causal, eventual, read-your-writes.
- Data lifecycle: retention, archival, deletion, backup, restore, encryption, audit.
- Change data capture, outbox, event logs, schema registry, data contracts, lineage.
- OLTP versus OLAP, data warehouse, lake/lakehouse, materialized views, search indexing.

## 8. Distributed systems and integration

- Partial failure, unreliable networks, clocks/time, ordering, duplicate delivery.
- Consensus, leader election, membership, coordination, distributed locks.
- CAP/PACELC and trade-offs under partition/no partition.
- Message brokers, queues, topics, pub/sub, streams, consumer groups.
- At-most/at-least-once delivery, deduplication, idempotency, replay, poison messages.
- Sagas, orchestration/choreography, compensating actions, distributed transactions.
- Cache-aside, write-through, write-behind, TTL, invalidation, cache stampede.
- API composition, BFF, anti-corruption layer, strangler migration.

## 9. Reliability, safety and resilience

- Fault/error/failure; fault tree analysis; FMEA/FMECA; hazard analysis; risk matrix.
- Availability, reliability, resilience, durability, recoverability, fault tolerance.
- Redundancy, replication, failover, quorum, fencing, split-brain prevention.
- Failure domains, correlated/common-mode failure, blast radius, isolation, bulkheads.
- Timeout budgets, retry budgets, backoff, jitter, circuit breakers, rate limits.
- Graceful degradation, fail-open/fail-closed, safe mode, queueing, load shedding.
- Backup, point-in-time restore, immutable backup, RPO/RTO, disaster recovery, reconciliation.
- Chaos engineering, fault injection, game days, incident command, postmortems.

## 10. Security, privacy and trust

- CIA triad; threat modeling; STRIDE; attack trees; abuse cases; security requirements.
- Identity, authentication, authorization, RBAC, ABAC, workload identity, federation.
- Least privilege, zero trust, segmentation, secrets, key management, certificate lifecycle.
- Encryption in transit/at rest, tokenization, data classification, retention, minimization.
- OWASP, secure SDLC, dependency/supply-chain controls, SBOM, signing, provenance.
- Audit trails, detection, incident containment, credential rotation, break-glass access.
- Privacy impact assessment, consent, deletion, residency, jurisdiction-specific compliance.

## 11. Cloud, platform and deployment architecture

- IaaS/PaaS/SaaS; public/private/hybrid/multi-cloud; cloud regions/zones/edge.
- VMs, containers, Kubernetes, serverless, managed services, platform engineering.
- Compute, storage, networking, identity, secrets, policy, control plane/data plane.
- Infrastructure as Code, CI/CD, GitOps, configuration management, immutable infrastructure.
- Blue-green, canary, rolling, feature flags, expand/contract schema migration.
- Autoscaling, quotas, tenancy, cells, noisy-neighbor isolation, capacity planning.
- FinOps, unit economics, cloud spend attribution, egress, reservations, sustainability.

## 12. Operations, observability and product quality

- Metrics, logs, traces, events, profiling, synthetic journeys, business telemetry.
- RED, USE, golden signals, alert quality, dashboard design, cardinality.
- SLI/SLO/SLA, error budget, toil, on-call, incident command, runbooks.
- Deployment safety, release health, change failure rate, recovery time.
- Accessibility, usability, response-time perception, user trust, product analytics.
- Total cost of ownership, cost per successful outcome, lifecycle maintenance cost.

## 13. Enterprise, organizational and lifecycle architecture

- Enterprise architecture, capability maps, business processes, value streams, data architecture.
- TOGAF ADM, architecture governance, principles, standards, transition architectures.
- Conway's Law, team topologies, cognitive load, platform teams, stream-aligned teams.
- Systems engineering lifecycle, ConOps, requirements allocation, integration, verification, validation, operation, disposal.
- Architecture modernization, technical debt, migration, coexistence, retirement, vendor exit.

## 14. Specialist domains that deserve separate deep dives

The current pack gives an introductory map rather than full specialist treatment for:

- Embedded, real-time, firmware, edge and IoT systems.
- Safety-critical systems: aerospace, automotive, rail, medical devices, industrial control.
- Robotics, cyber-physical systems, autonomy, sensor fusion and control systems.
- Telecom networks, 5G, distributed edge, network function virtualization.
- High-performance computing, parallel algorithms, GPU/accelerator clusters.
- AI/ML systems: training pipelines, feature stores, inference serving, model monitoring, evaluation, retrieval systems, GPU capacity, data governance.
- Financial market infrastructure, banking, ledger/settlement, fraud, regulatory reporting.
- Data platforms, streaming analytics, lakehouse, governance and lineage.
- Gaming, multiplayer state, matchmaking, real-time synchronization, anti-cheat.
- Scientific systems, digital twins, simulation, climate/energy infrastructure.

## 15. A useful study rule

For each sub-concept, record: definition; problem addressed; preconditions; alternatives; costs; failure modes; product effect; operational proof; real case; source; and what would make the choice inappropriate. Knowing a pattern name is not mastery. Being able to explain where it fails is a stronger test.

## 21. Full systems engineering lifecycle and technical management

See [21_SYSTEMS_ENGINEERING_LIFECYCLE_AND_PROCESSES.md](21_SYSTEMS_ENGINEERING_LIFECYCLE_AND_PROCESSES.md) for detailed process sequences, artifacts, crosscutting management, review gates and an end-to-end practice project.

## 22. MBSE and digital engineering

See [22_MBSE_DIGITAL_ENGINEERING_AND_SYSML.md](22_MBSE_DIGITAL_ENGINEERING_AND_SYSML.md) for document-centric versus model-centric methods, SysML v1/v2, model governance, digital thread/twin and tool selection.

## 23. Specialty engineering

See [23_SYSTEMS_ENGINEERING_SPECIALTIES.md](23_SYSTEMS_ENGINEERING_SPECIALTIES.md) for reliability, maintainability, safety, security, HSI, control systems, integration, V&V, logistics, manufacturing, environmental, EMC, affordability and physical engineering specialties.

## 24. Career and competence map

See [24_CAREER_ROLES_AND_COMPETENCY_FRAMEWORK.md](24_CAREER_ROLES_AND_COMPETENCY_FRAMEWORK.md) for role scope, seniority, competencies, methods, tools, deliverables, interfaces and portfolio evidence.

## 25. Knowledge portal content architecture

See [25_KNOWLEDGE_PORTAL_INFORMATION_ARCHITECTURE.md](25_KNOWLEDGE_PORTAL_INFORMATION_ARCHITECTURE.md) for navigation, knowledge graph, resource schema, editorial standards, contribution governance and acceptance checks.

## 26. Complementary reading and critical thinking

See [26_SYSTEMANTICS_AND_HUMAN_JUDGMENT.md](26_SYSTEMANTICS_AND_HUMAN_JUDGMENT.md) for classification of Systemantics, The Four Agreements, Cipolla and control-systems learning resources.

## 16. Iceberg expansion: systems science, complexity and problem structuring

- General systems theory; open/closed system boundaries; hierarchy; holism; reductionism; emergence; isomorphism.
- Cybernetics; control; communication; feedback; homeostasis; adaptation; requisite variety; second-order cybernetics.
- System dynamics; stocks; flows; feedback loops; delays; nonlinearities; archetypes; leverage points; calibration and model validation.
- Complex adaptive systems; agents; networks; phase transitions; path dependence; scaling; resilience; fragility; robustness; self-organization.
- Hard systems methods; soft systems methodology; critical systems heuristics; boundary critique; participatory modeling; operations research.

## 17. Advanced architecture and software design

- ISO 42010 architecture description; stakeholder/concern/viewpoint/view; architecture rationale and correspondence.
- QAW; ATAM; CBAM; quality-attribute utility tree; sensitivity point; trade-off point; architecture risk theme.
- Domain-driven design; bounded context; context map; ubiquitous language; aggregate; domain event; anti-corruption layer.
- Modular monolith; microservices; service-oriented architecture; event-driven architecture; hexagonal/ports-and-adapters; plugin architecture; serverless; edge.
- CQRS; event sourcing; saga; transactional outbox; inbox/deduplication; strangler migration; change-data capture; schema evolution.
- Architecture fitness functions; ADR; dependency rule; module boundary test; API contract test; architecture drift/debt.

## 18. Distributed, cloud and data engineering

- Failure models; partial failure; failure detectors; quorum; consensus; leader election; replication; split brain; fencing tokens.
- Linearizability; sequential; causal; eventual consistency; read-your-writes; monotonic reads; consistency domain; conflict resolution.
- Retry budget; timeout; deadline; jitter; idempotency; backpressure; admission control; circuit breaker; bulkhead; load shedding; overload cascade.
- SLO/SLI; error budget; RTO/RPO; service dependency; blast radius; cell architecture; active-active/active-passive; chaos experiments.
- OLTP/OLAP; warehouse; lake; lakehouse; data fabric; data mesh; ETL/ELT; CDC; data contract; lineage; catalog; retention; reconciliation.
- Cloud landing zone; identity/network control plane; IaC; GitOps; platform engineering; FinOps; capacity and energy efficiency.

## 19. Safety, reliability, security and assurance

- Reliability/availability/maintainability/supportability; reliability block diagram; FMEA/FMECA; FTA; ETA; FRACAS; Weibull; reliability growth; common cause.
- Hazard analysis; HAZOP; STPA; bow-tie; safety constraints; safety case; Goal Structuring Notation; functional safety lifecycle; SOTIF.
- Systems security engineering; trust boundaries; threat modeling; attack trees; zero trust; secure-by-design; secure SDLC; software supply chain; cyber resilience.
- V&V; IV&V; verification cross-reference; testability; acceptance; qualification; formal methods; model checking; assurance case; evidence argument.
- Defense in depth; fail-safe/fail-operational; fault containment; recovery; graceful degradation; independence; diversity; common-cause analysis.

## 20. Enterprise, product, human and AI systems

- Enterprise architecture; TOGAF ADM; ArchiMate; capability map; value stream; transition architecture; governance; exception management.
- BPMN; process mining; Lean; Six Sigma; queueing; constraint management; service blueprint; operating model.
- Human systems integration; ergonomics; usability; cognitive load; alarm management; operator trust; automation bias; accessibility.
- Socio-technical congruence; Conway hypothesis; Team Topologies; platform team; stream-aligned team; enabling team; cognitive load.
- AI system lifecycle; data/model provenance; RAG; vector retrieval; agent orchestration; tool permissions; evaluation; guardrails; model drift; human oversight; fallback.
- Product architecture; value engineering; TCO/NPV; unit economics; option value; build/buy; vendor lock-in; sustainability; retirement.

## 21. Engineering artifacts and evidence objects

ConOps; stakeholder map; context diagram; system boundary; requirement baseline; traceability graph; architecture description; ADR; interface control document; data contract; deployment view; threat model; hazard log; FMEA; fault tree; safety case; verification cross-reference; test report; SLO; runbook; incident postmortem; migration plan; rollback plan; model governance plan; AI evaluation plan; cost model; decommission plan.

## 22. Explicit gaps to keep visible

The taxonomy is a map, not a claim that each leaf has a complete textbook-level treatment. Domains needing separate future reference volumes include real-time/embedded systems, control-theoretic derivations, aerospace and defense acquisition, rail/automotive/medical certification, industrial OT, telecom/5G, HPC/GPU systems, financial-market infrastructure, robotics/autonomy, energy/power systems, environmental engineering, supply-chain assurance, and quantitative safety/reliability analysis. See [44 — Domain architecture reference map](44_DOMAIN_ARCHITECTURE_REFERENCE_MAP.md) and [51 — Research frontiers](51_RESEARCH_FRONTIERS_AND_OPEN_ENGINEERING_PROBLEMS.md).

## 23. Control, embedded and cyber-physical engineering

- Physical plant, sensor, actuator, signal conditioning, estimator, controller, communication channel, operator and environment.
- State-space models; controllability; observability; stability; robustness; disturbance rejection; sampling; delay; jitter; quantization; saturation.
- PID; feedforward; state feedback; observer; adaptive/robust control; model predictive control; supervisory/hybrid control.
- Real-time scheduling; worst-case execution time; deadline classes; interrupts; priority inversion; watchdogs; safety mode transitions.
- MIL/SIL/PIL/HIL; control verification; calibration; fault injection; hardware/software co-design; secure update and diagnostics.

## 24. Operations research and quantitative decision support

- Linear, integer, mixed-integer, nonlinear, stochastic and robust optimization.
- Constraint programming; network flow; routing; assignment; scheduling; inventory; facility location.
- Multi-criteria decision analysis; decision trees; utility; real options; sensitivity and value-of-information analysis.
- Queueing theory; utilization; Little’s Law; bottlenecks; discrete-event simulation; agent-based modeling; Monte Carlo.
- Model verification/validation; calibration; uncertainty propagation; scenario design; operational pilot and post-decision review.

## 25. Integration, interface and lifecycle support

- Functional/physical/software/data/human/organizational/environmental interfaces.
- Interface requirements; ICD; interface working group; change request; compatibility test; configuration baseline.
- Component/subsystem/system/mission integration; integration skeleton; staged end-to-end tests; anomaly management.
- Configuration item; functional/allocated/product baseline; status accounting; audit; as-designed/as-built/as-operated.
- Product support; maintenance concept; spares; provisioning; support/test equipment; technical data; training; obsolescence.
- Life-cycle logistics; repairability; maintainability; supply-chain resilience; technology refresh; disposal.

## 26. Sustainability and environmental system design

- Lifecycle boundary; functional unit; inventory; impact assessment; interpretation; allocation; sensitivity and uncertainty.
- Direct footprint vs enabled/higher-order impact; rebound effects; embodied and operational energy; water; materials; transport; e-waste.
- Circular design; reuse; repair; refurbishment; remanufacture; recycling; take-back; secure data sanitization.
- Carbon/energy per useful outcome; hardware refresh; data retention; workload efficiency; lifecycle trade-offs.

## 18. Expert-level additions from the third research pass

### Systems methods and problem structuring

- Methodological pluralism; boundary critique; CATWOE; rich picture; root definition; conceptual activity model; SODA; cognitive map; Viable System Model; recursion; environmental scanning; metasystem; systemic intervention.

### Mission engineering

- Mission thread (MT); mission engineering thread (MET); mission architecture; MOE; MOP; MOS; mission effectiveness; analysis run matrix; threat-informed scenario; operational baseline; capability gap; mission-level sensitivity.

### Requirement and architecture evidence

- Requirement formalization; requirement volatility; bidirectional traceability; orphan requirement; refinement; satisfaction; verification relation; architecture conformance; architecture fitness function; architecture erosion; decision record; defeater; assumption register.

### Distributed correctness

- Safety property; liveness property; linearizability; sequential consistency; causal consistency; consensus; replicated log; fencing token; logical clock; clock uncertainty; idempotency key; transactional outbox; saga; compensation; reconciliation.

### Probabilistic risk and safety

- PRA; CCF; beta factor; dependency model; epistemic uncertainty; aleatory variability; Bayesian updating; PoF; reliability growth; hidden failure; unsafe control action; control structure; safety constraint; safety case; assurance argument.

### AI-agent assurance

- Goal hijack; tool misuse; privilege abuse; agentic supply chain; memory/context poisoning; inter-agent trust; cascading failure; rogue agent; behavior drift; tool allowlist; action authorization; execution sandbox; blast-radius control; agent kill-switch; human approval threshold.

### Lifecycle and sustainment

- RCM; functional failure; failure mode; failure effect; failure consequence; on-condition task; P-F interval; failure-finding task; integrated product support; obsolescence; supportability; mission availability; restore time; lifecycle logistics.
