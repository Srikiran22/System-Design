# 15 — 24-week learning roadmap

**Assumption:** basic programming and computer literacy. If networking, databases, operating systems, or programming are unfamiliar, extend the foundation phase.

## Phase 1 — System foundations (Weeks 1–3)

**Study:** systems, boundaries, stakeholders, lifecycle, architecture levels, networking, HTTP, DNS, TLS, databases, transactions, concurrency. **Read:** [01], [03], INCOSE/NASA [S01, S02]. **Practice:** context diagram for a familiar product; ten functional requirements and five measurable quality scenarios. **Exit:** explain system, architecture, implementation, verification and validation.

## Phase 2 — Systems thinking and requirements (Weeks 4–6)

**Study:** stocks/flows, feedback, delays, leverage points, boundaries, causal loops, quality attributes, risk, user workflows. **Read:** [02], [04], Donella Meadows [S04], System Dynamics Society [S05], OpenLearn [S07]. **Practice:** iceberg and causal-loop diagram for a recurring issue; prioritize a quality-attribute utility tree. **Exit:** explain why a local fix can worsen the whole system.

## Phase 3 — Architecture structures and decision methods (Weeks 7–10)

**Study:** monolith, modular monolith, layered, hexagonal, microservices, event-driven, serverless, DDD, C4, patterns, ADRs, ATAM. **Read:** [05], [06], C4 [S08], SEI ATAM [S09], Fowler [S48]. **Practice:** same product as modular monolith and service design; compare against same requirements; write five ADRs. **Exit:** justify a choice without naming technology as the reason.

## Phase 4 — Distributed data and reliability (Weeks 11–15)

**Study:** transactions, consistency, replication, partitioning, messaging, idempotency, caching, overload, retries, failure domains, recovery, security, observability, SLOs. **Read:** [07]–[10], DDIA [S19], Google SRE [S15], Azure patterns [S14]. **Practice:** durable queue workflow; inject duplicate messages/slow dependencies; restore backup; test failover and reconciliation. **Exit:** explain consistency guarantees and failure recovery.

## Phase 5 — Product and real-world architecture (Weeks 16–19)

**Study:** product quality, unit economics, team topology, Conway's Law, service ownership, platform engineering, migration. **Read:** [11], [12], Shopify, Uber, Adyen, PostHog, Grammarly [S16, S21–S22, S32–S34]. **Practice:** analyze a case; write a skeptical design review; map user metric to architecture decision. **Exit:** distinguish reusable principle from context-specific implementation.

## Phase 6 — Capstone and credential selection (Weeks 20–24)

**Build:** one system from [13], with requirements, diagrams, ADRs, threat model, capacity, observability, load test, fault drill, restore test and postmortem. **Review:** use [16] templates and [13] rubric; ask a peer to challenge assumptions. **Credential:** choose AWS/Azure/GCP, TOGAF, INCOSE or CNCF only after matching it to target role. **Exit:** reproducible design portfolio, not just certificate.

## Weekly cadence

- Two sessions: read and annotate.
- One: draw a system/feedback model.
- One: implement or prototype a narrow behavior.
- One: test failures, review evidence, update notes.
- One short review: teach the trade-off without notes and list unresolved questions.

## Learning note format

For each concept record: definition; problem solved; assumptions; when it applies/does not; alternatives; trade-offs; failure modes; measurable evidence; real example; one unresolved question.

## Progress gate

Advance when you can demonstrate the capability in a design review or exercise, not merely after finishing videos. Teach it back with a diagram and counterexample.

## Expanded multi-track roadmap (36–52 weeks)

The earlier 24-week roadmap remains a foundation. This extension offers a deeper route; it is a planning model, not a promised duration. Prior knowledge, weekly hours and domain access change the pace.

### Shared core (weeks 1–8)

- Weeks 1–2: systems boundaries, stakeholders, system context, feedback, stocks/flows, causal assumptions and problem framing. Deliver a system map and behavior-over-time hypothesis.
- Weeks 3–4: lifecycle, ConOps, requirements, interfaces, quality attributes, traceability and configuration. Deliver 25 testable requirements and a trace matrix.
- Weeks 5–6: architecture description, alternatives, quality scenarios, risk, ATAM/QAW concepts, ADRs and trade studies. Deliver 3 options and an architecture review pack.
- Weeks 7–8: integration, V&V, test strategy, operational readiness and lifecycle economics. Deliver a verification plan, operational concept and TCO assumptions.

### Select two specialist tracks (weeks 9–24)

**Software/cloud track:** DDD and modularity; distributed consistency and failure; database/storage design; cloud foundations; CI/CD and infrastructure as code; SRE/SLO; security; cost/capacity. Deliver a deployable service with explicit invariants, load tests, dependency failure tests, SLO and restore evidence.

**Enterprise/data track:** capability/value streams; BPMN; current/target/transition architecture; data ownership and contracts; ETL/ELT/CDC; data governance/lineage; migration/parallel-run/cutover; architecture governance. Deliver a modernization blueprint and a reversible data migration plan.

**Safety/reliability/security track:** risk context; hazard/threat models; FMEA/FTA/STPA; functional safety and sector standard selection; common-cause failure; cyber-resilience; safety/security assurance; recovery drills. Deliver a hazard log, threat model, layered controls and assurance argument.

**MBSE/digital engineering track:** model purpose; model conventions; SysML; architecture and requirements traceability; behavior/interface modeling; simulation; model verification/validation; model repository and change governance. Deliver a model that is linked to at least one test and one risk decision.

**AI systems track:** ML inference and data lifecycle; RAG and retrieval; prompt/tool threat models; permission boundaries; evaluation design; human oversight; drift monitoring; fallback and rollback; AI governance. Deliver an AI system architecture with benchmark/evaluation suite, red-team tests and manual fallback.

**Systems thinking/complexity track:** system dynamics; causal loop and stock-flow models; scenario analysis; soft systems and boundary critique; complex adaptive systems; network/agent models; quantitative validation; policy resistance and leverage. Deliver a model with assumptions, sensitivity analysis and falsifiable interventions.

### Integration capstone (weeks 25–36)

Select a system with interacting people, processes, software/data, infrastructure and external dependencies. Produce the artifacts in [47 — Advanced practice labs](47_ADVANCED_PRACTICE_LABS_AND_CAPSTONE_PORTFOLIO.md). Require peer review and test evidence. Optional extension to weeks 37–52: domain standard research, advanced simulation/formal methods, a second capstone in a different sector, or a supervised internship/project.

### Course screenshot crosswalk

The supplied course snippets are organized by distinct tracks because course numbering restarts and the AI-powered course modules are partially cut off. The visible architecture/systems course list totals 145 hours, but hours are not equivalent to practical mastery, credential value or independent engineering authority. See [49 — Course crosswalk](49_USER_COURSE_MATERIALS_CROSSWALK.md).

### Optional domain extensions (weeks 37–52 or a later specialization)

- **Control/CPS:** control theory, signals, state-space, real-time scheduling, embedded systems, hybrid systems, SIL/HIL and safety/security interactions. Build a closed-loop simulation and verify timing/failure modes. [56]
- **Operations research:** optimization, queuing, stochastic models, decision analysis, simulation and sensitivity. Build a model and compare predictions with a pilot or historical data. [57]
- **Integration/configuration:** interface definitions, ICDs, staged integration, configuration baselines and evidence. Demonstrate a multi-subsystem integration plan and anomaly closure. [58]
- **Product support/logistics:** maintenance concepts, support resources, spares, obsolescence, supply risk and lifecycle economics. Produce a ten-year supportability plan. [59]
- **Sustainability:** lifecycle assessment, circularity, AI/ICT impacts and system boundaries. Produce a transparent LCA-style comparison with uncertainty. [60]
