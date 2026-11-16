# 30 — Architecture description, evaluation and decision methods

## Architecture is a set of consequential structures and decisions

Architecture is not a diagram, framework, technology stack or folder structure. It is the significant structures, elements, relationships, constraints and decisions that shape a system's properties over its lifecycle. Architecture work translates stakeholder concerns and quality attributes into structures that can be reasoned about and tested.

## Architecture description: the ISO 42010 vocabulary

ISO/IEC/IEEE 42010:2022 provides a framework for architecture description. The useful concepts are:

- **Stakeholder:** an individual, team or organization with concerns about the system.
- **Concern:** an interest relevant to the system, such as performance, cost, safety, modifiability or compliance.
- **Viewpoint:** conventions for constructing and interpreting a view that addresses a set of concerns.
- **View:** representation of the system from a viewpoint.
- **Model:** a representation used in a view; one view may combine models.
- **Rationale:** why an architecture decision or structure was selected.
- **Correspondence / consistency:** relationships among architecture elements and views that must remain coherent.

A collection of diagrams without identified stakeholders, concerns, viewpoints, assumptions and rationale is not a complete architecture description. [S120]

## Match notation to question

| Notation / framework           | Best question                                                                         | Does not replace                                              |
| ------------------------------ | ------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| C4                             | What is the software system, its containers and components?                           | Runtime behavior, quality analysis or full requirements model |
| UML                            | How are software structures and interactions represented?                             | Whole systems lifecycle or architecture rationale             |
| SysML                          | How are engineered systems' requirements, structures, behaviors and analyses modeled? | Domain engineering judgment or all specialist analyses        |
| ArchiMate                      | How do business, application, data and technology architectures relate?               | Detailed executable process design                            |
| BPMN                           | How does a business process flow across actors, events, tasks and gateways?           | Enterprise architecture or system behavior by itself          |
| Deployment / topology diagrams | Where do elements run and what are their infrastructure dependencies?                 | Security architecture or recovery proof                       |
| N2 / interface matrix          | Which elements exchange information or material?                                      | Full timing, semantic or safety analysis                      |

## Quality-attribute analysis

Quality goals are design drivers. They should become observable scenarios with an explicit workload, environment, stimulus, response and measure. Examples include p95/p99 latency under a specified load, recovery time after a zone loss, modification effort for a new business rule, isolation after tenant compromise, or operator error rate under workload conditions.

Treat attributes as interacting constraints, not independent checkboxes. Strong consistency may raise coordination latency; aggressive caching can improve latency but complicate revocation and freshness; redundancy may improve availability but add common-mode risk; microservices may improve team autonomy while increasing operational and network complexity.

## Quality Attribute Workshop (QAW)

QAW is used early, before an architecture exists, to discover and prioritize quality-attribute scenarios with stakeholders. It complements ATAM. It is especially useful where business drivers are known but architecture choices are not yet settled. [S126]

## Architecture Tradeoff Analysis Method (ATAM)

ATAM evaluates architecture approaches against prioritized quality goals and identifies risks, non-risks, sensitivity points and tradeoff points. SEI's documented flow includes: introduce method; present business drivers; present architecture; identify approaches; build and prioritize a utility tree; analyze approaches; brainstorm and prioritize scenarios; analyze approaches against those scenarios; and present findings. [S09]

An ATAM evaluation does not prove an architecture correct. It structures stakeholder discussion and exposes risks early enough to change the design.

## Complementary decision methods

- **CBAM:** adds economic reasoning to quality-attribute tradeoffs by estimating benefits, costs and schedule implications.
- **Architecture Decision Records (ADRs):** document individual decisions and rationale with status, context, options, consequences and revisit triggers.
- **Architecture fitness functions:** automated or repeatable checks that test whether architectural properties remain true as the system evolves.
- **Design reviews:** inspect architecture against requirements, interfaces, risks, safety/security constraints, operability, supportability and lifecycle cost.
- **Trade studies:** compare alternatives using measurable criteria, uncertainties, constraints and sensitivity analysis.
- **Prototyping / spikes:** retire high-risk uncertainty with evidence; distinguish throwaway experiments from production designs.

## Architecture process: iterate, do not waterfall the diagram

The arc42 method describes six iterative activities: clarify requirements; design structures; design cross-cutting concepts; communicate and document; accompany implementation; analyze and evaluate. The key architectural priorities are quality requirements, domain-aligned structures and cross-cutting decisions. [S128]

## Decision review questions

1. Which business or mission driver makes this decision necessary?
2. Which quality scenarios does it satisfy, and how will that be measured?
3. What new risk, coupling, operating cost or failure mode does it introduce?
4. What are the failure domains and recovery paths?
5. Who owns each interface and data contract?
6. What is the migration and rollback strategy?
7. How does the design behave under overload, partial failure, loss of dependency and misuse?
8. Which parts are reversible? What evidence would trigger a redesign?
9. Is the design appropriate for the team, budget, skills, domain and lifecycle—not just technically fashionable?

## Common failure modes

- Architecture by drawing: many boxes, no decisions, measurable qualities or executable checks.
- Framework by compliance: adopting TOGAF, C4 or a cloud framework without connecting it to decisions.
- Premature decomposition: creating network boundaries before domain and ownership boundaries are understood.
- Quality attributes as vague adjectives: “highly scalable”, “secure” or “enterprise-ready”.
- ADRs without governance: recording decisions but never checking whether assumptions changed.
- One-time design review: architecture drifts after implementation unless fitness functions and operational feedback exist.
