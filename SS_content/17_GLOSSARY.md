# 17 — Glossary

| Term                 | Definition                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------------ |
| ADR                  | Architecture Decision Record: durable explanation of a significant design choice and consequences.           |
| Aggregate            | DDD consistency boundary controlled through an aggregate root.                                               |
| API                  | Contract through which software capabilities are accessed.                                                   |
| ATAM                 | Architecture Tradeoff Analysis Method, used to evaluate architecture against quality goals.                  |
| Availability         | Whether a service is usable according to a defined measure.                                                  |
| Backpressure         | Mechanism limiting upstream production when downstream capacity is insufficient.                             |
| Bounded context      | DDD boundary where a domain model and language are consistent.                                               |
| Bulkhead             | Resource/component isolation that contains a failure.                                                        |
| Cache stampede       | Many requests regenerate an expired/missing cache entry simultaneously, overloading origin.                  |
| CAP                  | Consistency, Availability, Partition tolerance theorem for behavior during partitions under its assumptions. |
| Causal loop          | Feedback relationship in which variables influence each other over time.                                     |
| Circuit breaker      | Stops calls to a failing dependency after defined conditions and probes recovery.                            |
| Cohesion             | Degree to which a component's responsibilities belong together.                                              |
| Common-mode failure  | One cause disables multiple supposedly independent defenses/components.                                      |
| Consistency          | Defined guarantee about ordering/visibility of reads and writes.                                             |
| Coupling             | Degree of dependency between components, teams, or systems.                                                  |
| CQRS                 | Command Query Responsibility Segregation: separate write and read models/paths.                              |
| DDD                  | Domain-Driven Design: modeling software around the domain and bounded contexts.                              |
| Durability           | Committed data survives specified failures.                                                                  |
| Event sourcing       | Store state changes as an append-only event history; derive state/projections.                               |
| Eventual consistency | Replicas/views converge if updates cease and propagation succeeds.                                           |
| Failure domain       | Resources likely to fail together due to shared dependency/event.                                            |
| FMEA                 | Failure Mode and Effects Analysis.                                                                           |
| Graceful degradation | Preserve critical behavior while reducing nonessential features during disruption.                           |
| Idempotency          | Repeating an operation has the same intended effect as performing it once.                                   |
| Leverage point       | Intervention in system structure/rules that can materially change behavior.                                  |
| Linearizability      | Strong consistency: operations appear atomic and ordered consistently with real time.                        |
| MTBF                 | Mean time between failures, interpreted according to repairable-system assumptions.                          |
| MTTD                 | Mean time to detect.                                                                                         |
| MTTR                 | Mean time to restore/repair/recover; define exact start/end used.                                            |
| NFR                  | Non-functional requirement; preferably expressed as measurable quality attribute.                            |
| Outbox pattern       | Persist business state and event intent atomically, then publish asynchronously.                             |
| RPO                  | Recovery Point Objective: maximum tolerable data loss expressed as time.                                     |
| RTO                  | Recovery Time Objective: target time to restore service.                                                     |
| Saga                 | Multi-step distributed business transaction using forward actions and compensations.                         |
| Scalability          | Handle workload growth with acceptable quality and cost.                                                     |
| SLI                  | Service Level Indicator: measured signal of service behavior.                                                |
| SLO                  | Service Level Objective: target for an SLI.                                                                  |
| SLA                  | Service Level Agreement: external commitment, often with remedy/penalty.                                     |
| Stock                | Accumulation in a system, changed by inflows/outflows.                                                       |
| System boundary      | Chosen distinction between system and environment.                                                           |
| System of systems    | Independently useful systems cooperating for a larger capability.                                            |
| Systems engineering  | Lifecycle discipline for requirements, architecture, implementation, V&V, operation, maintenance, disposal.  |
| Systems thinking     | Analysis of interrelationships, feedback, delays, boundaries and emergent behavior.                          |
| Tail latency         | High-percentile delay such as p95 or p99.                                                                    |
| Throughput           | Completed work per unit time.                                                                                |
| Trust boundary       | Boundary across which identity/data/control uses a different trust assumption.                               |
| Verification         | Evidence that specified requirements are met.                                                                |
| Validation           | Evidence system meets stakeholder needs in intended environment.                                             |

## Advanced glossary additions

- **Agent-based model (ABM):** simulation of autonomous agents and their interactions to study aggregate behavior.
- **Allocated baseline:** approved allocation of system requirements and architecture to lower-level elements.
- **Architecture fitness function:** repeatable check that evaluates whether an architecture characteristic remains within an intended bound.
- **Architecture viewpoint / view:** a viewpoint defines conventions for addressing stakeholder concerns; a view is a representation of the architecture from that viewpoint.
- **Availability:** probability or proportion of required time a system is capable of performing its required function, under a stated definition.
- **Backpressure:** mechanism that prevents upstream producers from overwhelming downstream consumers.
- **Bow-tie analysis:** barrier-based view of threats, a top event, consequences, preventive controls and mitigations.
- **CBAM:** Cost Benefit Analysis Method; evaluates architecture strategies in terms of cost, benefit and quality-attribute response.
- **Cyber-physical system (CPS):** system where computing/communication interacts with physical processes through sensors, actuators and feedback.
- **Data contract:** explicit agreement about the schema, semantics, quality, access and change behavior of data exchanged or produced.
- **Data lineage:** trace of data origin, transformations, movement and dependencies.
- **Digital thread:** linked engineering information across lifecycle stages and disciplines, with controlled identity and change.
- **Digital twin:** digital representation of a specific system or asset connected to data and, in some usages, models/simulation; definitions vary by domain.
- **Event sourcing:** persistence approach that records state changes as an append-only event sequence from which state can be reconstructed.
- **FMEA/FMECA:** Failure Modes and Effects Analysis / its criticality-oriented extension; structured identification and analysis of failure modes and consequences.
- **FRACAS:** Failure Reporting, Analysis and Corrective Action System; lifecycle process for collecting failures, analyzing causes and tracking corrective actions.
- **Functional safety:** safety achieved through correct functioning of safety-related systems and functions in response to hazardous conditions.
- **Hardware-in-the-loop (HIL):** test arrangement where real hardware interacts with a simulated plant or environment.
- **ICD:** Interface Control Document; controlled definition of an interface and the agreement between interfacing parties.
- **Integrated product support (IPS):** coordinated planning and management of resources required to support a system through its operating life.
- **LCA:** Life-Cycle Assessment; method for assessing environmental impacts across a defined product/system lifecycle boundary.
- **LCLS:** Life Cycle Logistics Support; support planning and execution from acquisition through sustainment and closeout.
- **Little’s Law:** relationship for a stable process: average work in process equals throughput rate multiplied by average time in system.
- **Model predictive control (MPC):** controller that optimizes predicted future behavior over a finite horizon and repeatedly applies the next control action.
- **Model-in-the-loop (MIL):** model-level simulation/test before generated or production software is placed in the loop.
- **Operations research (OR):** mathematical, statistical and computational methods for decision-making and optimization in complex operations.
- **Operational availability:** availability measure that may include logistics and administrative delay, depending on definition.
- **PIL:** Processor-in-the-loop testing with target processor or representative execution platform.
- **Product supportability:** ability to operate and maintain a system at required readiness/performance with affordable support resources.
- **QAW:** Quality Attribute Workshop; early elicitation and prioritization of quality attribute scenarios with stakeholders.
- **RBD:** Reliability Block Diagram; representation of system success paths and component reliability relationships.
- **RTO/RPO:** Recovery Time Objective / Recovery Point Objective; target restoration time and tolerated data-loss window.
- **SIL:** Software-in-the-loop testing in which software executes against a model/simulation of relevant hardware or environment.
- **SLO / SLI:** Service Level Objective / Service Level Indicator; target and measurement for a user-relevant service characteristic.
- **SOTIF:** Safety of the Intended Functionality; safety concerns arising from functional insufficiencies or foreseeable misuse even without a component fault.
- **STPA:** System-Theoretic Process Analysis; hazard analysis based on unsafe control actions and system interaction, not only component failure.
- **SysML:** Systems Modeling Language; standardized language for modeling system requirements, structure, behavior and analysis.
- **Technology refresh:** planned replacement or upgrade of components to address obsolescence, performance, security or support constraints.
- **Transactional outbox:** pattern that persists a business update and an event to publish in one local transaction, then relays the event asynchronously.
- **Verification cross-reference:** mapping between requirements and verification methods, levels, cases and evidence.
- **Worst-case execution time (WCET):** upper-bound estimate of execution time under defined hardware/software and operating assumptions.
