# 29 — Requirements engineering, traceability and change control

## Requirements are controlled claims about need and acceptance

A requirement is not merely a sentence in a document. It is a controlled statement that establishes a needed capability, condition, constraint or quality level and can be verified. Stakeholder needs, system requirements, architecture decisions, implementation elements, verification evidence and validation results should form a navigable chain. ISO/IEC/IEEE 29148 is the primary requirements-engineering reference in the standards map; lifecycle coordination aligns with 15288. [S119, S121]

## The requirements chain

**Mission / business outcome → stakeholder need → operational scenario → system requirement → subsystem allocation → interface / component requirement → design / implementation → verification evidence → validation against intended use.**

The chain is not always a simple tree. Requirements can be shared, derived, constrained by regulations, allocated to several elements, or verified by combined evidence. Model traceability as a graph with typed relations, not a spreadsheet that only stores parent-child IDs.

## Elicitation sources

- Stakeholder interviews, observation, contextual inquiry and user research.
- Current workflows, workarounds, operating data, field reports and service incidents.
- Contracts, laws, regulations, standards and procurement specifications.
- Interfaces, supplier constraints, environmental limits and enabling-system assumptions.
- Operational scenarios, misuse, abnormal conditions, maintenance, upgrades and disposal.
- Safety, security, reliability, privacy, accessibility and sustainability analyses.

## Requirements classes

- **Business / mission requirements:** why the system exists and the outcome sought.
- **Stakeholder requirements:** what each stakeholder needs from the system or service.
- **Functional requirements:** what the system must do, including modes, triggers and state changes.
- **Performance requirements:** measurable capacity, latency, throughput, range, accuracy, resource use or timing.
- **Quality requirements:** reliability, availability, security, safety, maintainability, usability and other system qualities.
- **Interface requirements:** protocols, physical/electrical characteristics, data schemas, units, timing and ownership.
- **Operational requirements:** deployment, users, environment, operating modes, support, monitoring, maintenance and training.
- **Constraints:** technology, budget, schedule, law, standards, physical limits or compatibility.
- **Derived requirements:** needed to satisfy higher-level requirements or design constraints; label their rationale and parent links.

## Good requirement properties

A well-formed requirement is necessary, singular, unambiguous, feasible, verifiable, traceable, implementation-aware only where justified, and stated at the correct level of abstraction. It should identify conditions and thresholds where needed. Avoid vague terms such as fast, secure, user-friendly, scalable, robust, simple, intuitive, real-time or enterprise-grade without an operational definition.

**Weak:** “The application shall be fast.”

**Better:** “For the defined interactive workload of 2,000 concurrent sessions and a 70/30 read/write mix, the service shall return the specified search response within 300 ms at p95 under the stated deployment and data-volume assumptions.”

The example is not a generic target; it illustrates the need for workload, percentile, operating conditions, measurement window and threshold.

## Requirement quality checks

1. Can a reviewer identify one subject, one obligation and one condition?
2. Does it describe an observable outcome rather than an unnecessary design choice?
3. Is the wording precise enough for independent interpretation?
4. Is its verification method and success criterion known?
5. Can it be traced to a stakeholder need, contract, hazard, risk or higher-level requirement?
6. Is it consistent with peer requirements and interface assumptions?
7. Does it have an owner, rationale, status, source, version and change history?
8. Is it still necessary after design and operational learning?

## Quality-attribute scenarios

Express quality requirements as: **source/stimulus → environment → system element → response → response measure**. Example: “During a regional cloud-zone loss, the transaction service shall preserve acknowledged ledger entries and restore write service to the surviving region within the approved recovery-time objective.” Add data-loss tolerance, workload, consistency model, failover mode and evidence method. This scenario style is useful in QAW and ATAM. [S09, S126]

## Traceability model

Use typed links such as `derived_from`, `satisfies`, `allocated_to`, `constrained_by`, `interfaces_with`, `verified_by`, `validated_by`, `mitigates_hazard`, `mitigates_threat`, `implemented_by`, `supersedes` and `approved_by`. A trace link needs a rationale; links without meaning create traceability theater.

A minimum requirement record includes stable ID, statement, class, rationale, source, owner, criticality, priority, verification method, acceptance threshold, parent/related links, interface dependencies, status, version, baseline, change history and evidence location.

## Change and volatility

Change control is not a bureaucratic barrier. It identifies what changed, why, who is affected, which interfaces and analyses are invalidated, what verification must be repeated, and whether the change affects safety/security/regulatory evidence. Perform impact analysis before approving; re-baseline only after decision authority and downstream owners agree.

## Prioritization versus criticality

Priority answers when to implement. Criticality answers the consequence of failure or omission. A low-priority feature may have a safety-critical constraint; a highly requested feature may have low mission consequence. Keep priority, risk, safety classification and verification rigor as separate fields.

## Tooling and anti-patterns

Requirements tools help with baselines, change control, linking, reports and configuration. They do not make poor requirements precise. Avoid: huge unreviewed requirement catalogs; IDs without semantics; one-way traceability; generated test cases that merely repeat the requirement; excessive requirement decomposition; treating user stories as full system requirements; and treating every stakeholder request as a committed obligation.

## Exercises

Create a ConOps and 20 requirements for a campus delivery robot. Include operational modes, weather, human interaction, cybersecurity, battery degradation, safe-stop behavior, maintenance and data retention. Trace each requirement to its source and test; identify two derived requirements and two conflict pairs. [S02, S99, S119, S121]
