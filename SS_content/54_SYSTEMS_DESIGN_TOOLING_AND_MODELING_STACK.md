# 54 — Systems design tooling and modeling stack

## Tool selection rule

Select tools because they support a method, workflow, collaboration boundary or evidence requirement. Tool popularity is not a design rationale. Before procurement, test interoperability, data ownership, exportability, versioning, access control, audit, automation, offline/air-gapped needs, lifecycle support, licensing and exit cost.

## Tool categories by engineering activity

| Activity                     | Tool category and examples                                                                                           | What to prove before adoption                                                                                                     |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Requirements / ALM           | IBM DOORS Next, Jama Connect, Siemens Polarion, Azure DevOps work items, Jira with disciplined schemas               | Baselines, typed trace links, change impact, review workflow, export, audit trail and test integration                            |
| MBSE / SysML                 | Cameo Systems Modeler, Capella, IBM Rhapsody, Sparx Enterprise Architect; SysML v2 tools listed by OMG               | Language/version conformance, model governance, API/export, collaboration, validation and repository strategy                     |
| Architecture views           | C4, Structurizr, arc42, PlantUML, Mermaid, UML tools                                                                 | Diagram-as-code or reproducible export, view consistency, accessibility, version control and stakeholder comprehension            |
| Enterprise architecture      | TOGAF content, ArchiMate modeling, repository/catalog tools                                                          | Capability-to-investment traceability, ownership, standards catalog, roadmap and architecture exception workflow                  |
| Business process             | BPMN modeling tools (e.g. Camunda Modeler and other BPMN-capable tools)                                              | Correct event/gateway semantics, process ownership, simulation/execution boundary and versioned process definitions               |
| System dynamics / simulation | Stella, Vensim, AnyLogic, MATLAB/Simulink, Modelica ecosystems                                                       | Model assumptions, equation validity, calibration, reproducibility, uncertainty and domain suitability                            |
| Reliability / safety         | FMEA/FMECA, fault-tree, RBD, hazard-log and FRACAS systems; spreadsheets may be adequate for small work if governed  | Controlled taxonomy, failure-mode linkage, criticality assumptions, versioning, evidence and review workflow                      |
| Security architecture        | Threat Dragon, attack-tree/DFD tools, architecture repositories, code/dependency scanners                            | Threat model is tied to asset/data flows, ownership, controls, tests and change triggers                                          |
| Verification and testing     | Test-management tools, pytest/JUnit, Robot Framework, Postman, k6, JMeter, Gatling, hardware-in-loop rigs            | Requirement traceability, test repeatability, representative configuration, result provenance and anomaly handling                |
| Observability / SRE          | OpenTelemetry, Prometheus, Grafana, Jaeger, log/search stacks, cloud monitoring                                      | User-centered SLI/SLOs, cardinality/cost limits, trace context, access controls, actionable alerts and retention                  |
| Infrastructure / platform    | Terraform/OpenTofu, Kubernetes, Helm, GitOps tools, policy-as-code                                                   | Reproducibility, drift detection, least privilege, supply-chain integrity, disaster recovery and platform operability             |
| Data architecture            | dbt, Airflow, Dagster, Kafka-compatible streaming, schema registries, catalog/lineage and quality systems            | Data contracts, ownership, lineage, replay, schema evolution, privacy, reconciliation and cost                                    |
| AI / ML engineering          | MLflow, model registries, evaluation harnesses, feature/data pipelines, inference gateways and vector/search systems | Model/data provenance, offline/online evaluation, policy enforcement, prompt-injection testing, drift, fallback and observability |

Examples are an orientation map, not a recommendation or endorsement. Products evolve and may change pricing, licensing or support; verify current vendor documentation before procurement.

## Choosing a model notation

| Need                                    | Useful notation/model                                        | Typical misuse                                                                  |
| --------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| Explain boundary and external actors    | Context diagram / system context                             | Omitting operators, suppliers, regulators or external services                  |
| Explain software decomposition          | C4 context/container/component/code                          | Treating every C4 box as a deployable service                                   |
| Explain process and responsibility flow | BPMN, swimlane, value-stream map                             | Turning an informal flowchart into an executable process without semantic rigor |
| Explain data movement and trust         | Data-flow diagram, data lineage, trust-boundary diagram      | Drawing arrows without classifying data, protocol, ownership or trust           |
| Explain structure and interfaces        | UML/SysML block/internal-block/structure views               | Treating a structural view as proof of runtime behavior                         |
| Explain behavior and mode changes       | State machine, sequence/activity diagram                     | Ignoring concurrency, timing and exceptional states                             |
| Explain deployment and failure domains  | Deployment/topology diagram                                  | Showing cloud icons without dependencies, zones, control planes or blast radius |
| Explain enterprise capability           | Capability map, value stream, ArchiMate views                | Confusing current operating capability with intended future-state capability    |
| Explain safety control structure        | STPA control structure, bow-tie, fault tree                  | Using a single diagram as a complete hazard assessment                          |
| Explain quantitative dynamics           | Stock-flow, causal-loop, discrete-event or agent-based model | Claiming causal proof from an unvalidated qualitative sketch                    |

## Modeling stack maturity

1. **Sketch:** shared vocabulary and boundary. Mark assumptions and uncertainty.
2. **Structured description:** stable IDs, typed entities, interfaces, ownership and views.
3. **Traceable model:** requirements, architecture, hazards, tests and decisions linked.
4. **Analyzable model:** constraints, simulation, static checks, model checking or quantitative analysis.
5. **Executable/digital thread:** model and engineering evidence are connected to implementation, configuration and operation with controlled synchronization.

Not every system needs level 5. Modeling maturity should be proportional to system risk, change rate, complexity, evidence needs and expected payoff.

## Procurement and adoption questions

- Which lifecycle process or decision will improve?
- Who owns the model/data and who can export it?
- Can the tool preserve IDs and links across export/import?
- Does it support the organization’s security, privacy, residency and access-control requirements?
- Can it be automated, tested and integrated with source control/CI where relevant?
- What happens if the vendor, plugin, license or file format disappears?
- How will model correctness and stale-model drift be detected?
- What is the training and administration burden?
- Can a small pilot demonstrate measurable benefit before broad rollout?

## Example lightweight tool stack for a student portfolio

- Markdown/CSV or a lightweight issue tracker for requirements, ADRs and traceability.
- Mermaid, PlantUML or Structurizr for diagrams as code.
- A local database plus migration scripts for data modeling and persistence experiments.
- Docker Compose or a small cloud deployment for runtime behavior; do not introduce Kubernetes unless orchestration is a real learning objective.
- OpenTelemetry plus Prometheus/Grafana or a hosted equivalent for observability.
- Automated unit, integration, load and fault-injection tests.
- Threat model, recovery runbook and a tested backup/restore procedure.

## Sources

[S68, S124–S128, S15, S29, S30, S153–S156]

## Tool documentation anchors

- [Structurizr](https://docs.structurizr.com/) provides a C4 models-as-code workflow and multiple architecture views from one DSL model. [S175]
- [PlantUML](https://plantuml.com/) generates diagrams from text descriptions; review its current licensing options and rendering support. [S176]
- [Cameo Systems Modeler](https://docs.nomagic.com/spaces/CSM2024x/pages/136723595/Cameo+Systems+Modeler+Documentation) is a commercial systems-modeling environment; assess version, exchange and model governance. [S177]
- The [OMG SysML v2 release repository](https://github.com/systems-modeling/sysml-v2-release/) includes specification artifacts, examples and pilot editor implementations. [S178]
