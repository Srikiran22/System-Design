# 43 — System of systems, interoperability and federation

## System of systems (SoS)

A system of systems is a set of operationally and managerially independent systems that interact to deliver capabilities not achieved by the constituent systems alone. SoS engineering differs from traditional single-system engineering because constituent owners may retain their own missions, budgets, schedules, interfaces, data and change authority. Autonomy and independent evolution are central design conditions. [S94]

## Common SoS characteristics

- Operational independence of constituents.
- Managerial independence and separate authorities.
- Geographic or organizational distribution.
- Emergent capability from interaction.
- Evolutionary development and changing membership.
- Partial control over external systems and their release schedules.
- Competing local goals and global mission objectives.

## Architecture implications

A central architect may not control all components. The design needs interface agreements, shared semantics, governance, federated identity, data-sharing policy, service-level expectations, change notification, version compatibility, conflict resolution and a way to manage unsafe or incompatible constituent behavior.

## Interoperability layers

1. **Physical/connectivity:** can systems connect and exchange signals?
2. **Protocol/syntactic:** do they use compatible message formats and transport?
3. **Semantic:** do data fields mean the same thing, with consistent units, identity and time?
4. **Process/organizational:** do workflows, roles and decision rights align?
5. **Policy/legal:** are data and actions permitted across jurisdictions and owners?
6. **Operational:** can incidents, maintenance and upgrades be coordinated?

A technically connected API can still be semantically and organizationally incompatible.

## Governance model

Define who owns constituent systems, who approves interface changes, who manages shared standards, how disputes are resolved, what happens when a participant withdraws, how assurance evidence is shared, and who accepts global mission risk. Use federated governance where ownership is distributed; centralize only where a common mission or hazard requires it.

## Emergent risk

A constituent system can be safe in isolation but unsafe in a new combination because of feedback, timing, workload, conflicting assumptions or unexpected control interactions. Model cross-system dependencies, timing, information quality, degraded modes and common-cause dependencies. Use scenario-based integration testing and operational exercises.

## Examples of SoS design questions

- How do hospital systems exchange patient identity, orders and results without semantic corruption?
- How do national transport, payment and identity systems interoperate under partial outage?
- How do satellite, ground station, mission operations and launch systems coordinate across independent suppliers?
- How does an industrial plant coordinate PLC, SCADA, historians, safety systems and enterprise planning?
- How does an ecosystem of autonomous AI agents interact under shared data and policy constraints?

## Good practice

Maintain an SoS context and dependency map, constituent capability register, interface agreements, data dictionary, change calendar, risk register, shared scenario catalogue, interoperability test harness, operational escalation model and retirement/transition strategy.
