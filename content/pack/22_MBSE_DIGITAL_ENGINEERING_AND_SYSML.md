# 22 — MBSE, digital engineering and SysML

## Model-Based Systems Engineering (MBSE)

MBSE is the formalized use of system models to support systems engineering tasks across the lifecycle. The model is a managed engineering artifact, not merely a diagram or slide. It connects requirements, structure, behavior, interfaces, constraints, analysis, verification and rationale in a coherent representation.

### Document-centric versus model-centric

| Aspect           | Document-centric approach                   | Model-centric approach                                        |
| ---------------- | ------------------------------------------- | ------------------------------------------------------------- |
| Primary artifact | Independent documents/spreadsheets/drawings | Configured system model plus linked evidence                  |
| Relationships    | Often manual and distributed                | Explicit, queryable relationships and trace links             |
| Change impact    | Search and review multiple documents        | Analyze model relationships and affected views                |
| Consistency      | Manual reconciliation                       | Rules, validation, and model queries can detect inconsistency |
| Outputs          | Documents authored directly                 | Documents/reports can be generated from controlled data       |
| Risk             | Duplicate/inconsistent truth                | Stale, over-complex, poorly governed or tool-locked model     |

MBSE does not automatically improve engineering. A bad, incomplete, stale or unvalidated model can give false confidence. Model quality, model scope, stakeholder agreement, configuration, governance, training, tool interoperability and intended use must be defined.

## Essential MBSE principles

1. Start with an engineering question or decision; do not model without purpose.
2. Define model scope and system-of-interest boundary.
3. Select a method and modeling language suited to the domain.
4. Agree on semantics, naming, units, conventions, viewpoints and abstraction.
5. Model needs/requirements, functions, structure, interfaces and behavior consistently.
6. Allocate requirements and trace them to design, analyses and verification evidence.
7. Keep models under configuration and change control.
8. Link models to discipline tools: CAD/CAE, software, controls, safety, reliability, test, manufacturing, logistics and PLM.
9. Validate the model against known scenarios, evidence, measurements and expert review.
10. Manage model federation and ownership where a single monolithic model is unsuitable.
11. Define model fidelity and limitations; never imply simulation predicts reality beyond its validation envelope.
12. Automate repeatable checks and report generation only after data semantics are stable.

## Common model perspectives and contents

- Requirements model: needs, requirements, constraints, rationale, source, verification method and traceability.
- Structural model: system, subsystem, parts, ports, connectors, interfaces, ownership and decomposition.
- Behavioral model: use cases, activities, sequences, state machines, modes, transitions and interactions.
- Parametric/analytical model: properties, equations, constraints, budgets, performance and sizing.
- Interface model: logical/physical interfaces, units, protocols, signals, flows, tolerances and control authority.
- Verification model: verification cases, methods, test conditions, success criteria and evidence links.
- Risk/safety/security models: hazards, threats, controls, mitigations, assurance claims and evidence.
- Lifecycle model: phases, states, configuration, product variants, operation, support, change and retirement.

## SysML concepts

SysML is a general-purpose systems modeling language derived from UML and used to describe complex systems. Learn the language concepts, not just the tool menu.

SysML v1 common diagram families include:

- Requirements diagram: requirements and relationships such as derive, satisfy, verify, refine, contain and trace.
- Block Definition Diagram (BDD): blocks, properties, generalization, composition and system structure.
- Internal Block Diagram (IBD): parts, ports, connectors and item flows.
- Use Case diagram: actors, use cases, system scope and relationships.
- Activity diagram: flows, actions, control, object flows and partitions.
- Sequence diagram: lifelines, messages, ordering and interaction.
- State Machine diagram: states, transitions, events, guards and actions.
- Parametric diagram: constraints, value properties and binding connectors.
- Package diagram: model organization, reuse and namespaces.

SysML v2 introduces major changes in precision, textual and graphical notation, formal semantics, interoperability and API-based integration. It is built on KerML and is intended for requirements, behavior, structure, analysis and verification. Check current official status and tool conformance before choosing it for a production program.

Official specification overview: https://www.omg.org/sysml/sysmlv2/
Official tool/vendor listing: https://www.omg.org/sysml/sysmlv2/sysml-tool/

## Digital engineering and digital thread

Digital engineering is broader than MBSE. It is an engineered ecosystem of authoritative models, data, simulations, methods, tools, people, governance, configuration and decisions used across the product lifecycle.

- Digital thread: governed relationships connecting lifecycle information and evidence across tools/domains.
- Digital twin: a digital representation of a specific physical asset or system, with defined fidelity, context, update mechanisms and intended decisions. A CAD model or static simulation is not automatically a digital twin.
- Model federation: coordinated discipline models linked by identifiers, interfaces and exchange/semantic agreements.
- PLM/PDM: product lifecycle/product data management and configuration authority.
- MBSE repository: model storage, versioning, access control, model validation and release.
- Model-based verification: tests/analyses linked directly to requirements and model elements.

## Tool ecosystem — evaluate, do not blindly endorse

Examples in the SysML v2 ecosystem include CATIA Magic/Cameo, Ansys System Architecture Modeler, SysON, OpenMBEE, IBM Rhapsody, MathWorks System Composer and other vendor/open implementations. The OMG listing is a starting point, not an endorsement or proof that each implementation has identical coverage.

Selection dimensions: language/version conformance, import/export, API, collaboration, version control, merge/diff, model validation, requirements integration, multi-domain integrations, simulation, security, deployment model, licensing, training, vendor support, data ownership and exit/migration strategy.

## MBSE learning sequence

1. Learn system context, requirements, functions, structure, interfaces and V-model first.
2. Draw context, use-case and functional decomposition models manually.
3. Learn a small SysML subset and modeling discipline.
4. Build a traceable model with requirement-to-function-to-component-to-test links.
5. Add behavior and interface views.
6. Add parametric budgets and trade studies.
7. Add configuration/change workflow and automated model checks.
8. Integrate a second domain model or simulation.
9. Demonstrate change-impact analysis and document generation.
10. Present the model, its scope, assumptions, limitations and decision value to a review board.

## Portfolio project

Model an electric vehicle charging ecosystem with EV, battery management system, charger, grid, payment service, user, operator and maintenance. Create requirements, use cases, logical/physical architecture, power/control interfaces, state machines for charging, safety constraints, verification cases, a power budget and an impact analysis for a change from 7 kW to 22 kW charging.
