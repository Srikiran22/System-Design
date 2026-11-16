# 21 — Systems engineering lifecycle and process architecture

## Why this module exists

Software system design is only one slice of systems engineering. Systems engineering treats the engineered product, its operating context, enabling systems, users, organizations, suppliers, and lifecycle as a connected whole. The system must work in its intended environment and remain supportable from concept through retirement.

## Core process backbone

A practical process map aligns the NASA Systems Engineering Handbook, INCOSE Systems Engineering Handbook, SEBoK, and ISO/IEC/IEEE 15288 lifecycle-process concepts. The process is iterative and recursive; it is not a rigid waterfall checklist.

### A. Concept and mission definition

- Business or mission analysis: define the opportunity/problem, desired outcomes, mission objectives, measures of effectiveness, constraints, and solution-space boundaries.
- Stakeholder analysis: identify customers, users, operators, maintainers, regulators, sponsors, suppliers, affected communities, and external system owners.
- Concept of Operations (ConOps): describe intended use, actors, operating scenarios, modes, environments, external interfaces, abnormal/emergency conditions, and lifecycle transitions.
- System context: identify the system-of-interest (SoI), external systems, environment, system boundary, assumptions, exclusions, and dependencies.
- Feasibility and alternatives: compare solution classes, technology readiness, affordability, schedule, risk, and operational concept.

**Typical evidence:** mission statement, stakeholder register, ConOps, context diagram, mission/thread scenarios, constraints register, assumptions log, preliminary risk register, concept selection rationale.

### B. Stakeholder needs and requirements

- Elicit needs through interviews, workshops, observations, operational analysis, regulations, contracts, and existing system evidence.
- Resolve conflicts and distinguish needs from proposed solutions.
- Define stakeholder requirements, operational requirements, system requirements, interface requirements, and specialty requirements.
- Make requirements necessary, singular, feasible, unambiguous, measurable, verifiable, traceable, and implementation-neutral where appropriate.
- Allocate requirements down the system hierarchy; identify derived requirements and justify them.
- Maintain bidirectional traceability from stakeholder need to system requirement, subsystem requirement, architecture/design element, verification case, and validation evidence.
- Manage versions, baselines, change requests, impact analysis, waivers, deviations, and approval.

**Typical evidence:** stakeholder requirements specification, system requirements specification, requirements database/model, traceability matrix, verification cross-reference matrix, requirements quality report, change log, baseline record.

### C. System definition and architecture

- Decompose the system into functions, logical elements, physical elements, software/hardware/human/process elements, and interfaces.
- Develop functional, behavioral, structural, physical, data, deployment, operational, safety, security, reliability, and supportability views as appropriate.
- Allocate requirements and budgets (mass, power, thermal, bandwidth, timing, reliability, safety, cost, schedule, maintainability, etc.).
- Define external/internal interfaces, interface assumptions, protocols, physical envelopes, environment, tolerances, ownership, and control.
- Generate multiple architecture alternatives; conduct trade studies and evaluate quality attributes, technical performance, lifecycle cost, risks, and constraints.
- Establish architecture rationale, decisions, design rules, and configuration baseline.

**Typical evidence:** system architecture description, functional architecture, logical/physical architecture, block/interface diagrams, N² diagram, interface requirements document, Interface Control Documents (ICDs), budgets, trade study, Architecture Decision Records, preliminary design package.

### D. Design definition and realization

- Refine architecture into detailed design descriptions and component-level requirements.
- Decide make/buy/reuse/adapt; assess supplier capability and component provenance.
- Implement by coding, fabrication, procurement, configuration, assembly, or reuse.
- Control technical data, tooling, materials, software versions, hardware revisions, manufacturing processes, and configuration items.
- Verify each element against its design description and requirements before integration.

**Typical evidence:** detailed design, drawings, software design, parts list/BOM, source code/model baseline, supplier specifications, build records, unit/element test results, implementation records, configuration audit evidence.

### E. Integration

- Define integration strategy, build sequence, integration environment, enabling products, test fixtures, simulators, test data, and entry/exit criteria.
- Integrate from lower-level elements to higher-level subsystems and system-of-interest; adapt strategy to risk and interface dependencies.
- Verify interface compatibility, configuration correctness, timing, units, physical connections, protocols, data schemas, power/thermal envelopes, safety constraints, and operational procedures.
- Record anomalies, nonconformances, corrective actions, retest, and integration status.

**Typical evidence:** Integration Plan, integration sequence, interface verification cases, integration readiness review, build/configuration records, anomaly reports, integration test reports, as-integrated baseline.

### F. Verification

Verification answers: **Was the product built right against its specified requirements?**

Common methods:

- Test: exercise the product with defined inputs and observe measured response.
- Analysis: use calculations, models, simulations, statistical arguments, or validated analysis methods.
- Inspection: examine product characteristics, construction, code, configuration, or documentation.
- Demonstration: operate the product to show a capability without necessarily taking detailed quantitative measurements.

Verification planning identifies method, level, environment, setup, instrumentation, sample size, constraints, pass/fail criteria, configuration, witness/approval, and evidence record. Verification may include qualification, acceptance, environmental, reliability, cybersecurity, software, interface and performance tests.

**Typical evidence:** Verification Plan, requirement verification matrix, procedures, test readiness review, calibrated instrumentation records, test logs, analysis reports, nonconformance records, compliance report, qualification/acceptance evidence.

### G. Validation

Validation answers: **Does the system satisfy its intended use and stakeholder needs in the intended operational context?**

- Validate operational scenarios, mission effectiveness, usability, safety, suitability, survivability, human-system interaction, maintenance workflow, and stakeholder outcomes.
- Validate the whole system and external interactions, not only isolated components.
- Include realistic operating environments and representative users/operators/maintainers.
- Capture unmet needs, assumptions invalidated by operation, and intended-use gaps.

**Typical evidence:** Validation Plan, operational validation scenarios, customer/user acceptance, field trials, operational test and evaluation, suitability assessment, acceptance decision, validation report.

### H. Transition, deployment and commissioning

- Prepare the system and enabling systems for the next lifecycle level or customer environment.
- Verify logistics, training, facilities, installation, site readiness, documentation, safety permits, operational procedures, spares, tooling, data migration, rollback, and configuration identity.
- Conduct commissioning and handover; confirm acceptance criteria.

### I. Operation, maintenance and sustainment

- Monitor system effectiveness, service levels, safety, reliability, availability, cost, technical debt, operational risks, obsolescence and environment changes.
- Maintain operational configuration and digital thread; assess incidents and field data.
- Execute preventive/corrective maintenance, software updates, upgrades, parts replacement, calibration, retraining, and supply-chain support.
- Manage change, compatibility, backwards migration, and recertification/reauthorization where required.

### J. Disposal and retirement

- Plan decommissioning, data retention/deletion, material disposal, hazardous-material handling, shutdown dependencies, records, customer notification, and continuity/transition to replacement systems.
- Confirm that the retirement itself is safe, secure, compliant and traceable.

## Crosscutting technical management processes

These operate across lifecycle stages:

1. Technical planning and Systems Engineering Management Plan (SEMP).
2. Requirements management.
3. Interface management.
4. Risk and opportunity management.
5. Configuration management and change control.
6. Technical data/information management and digital thread.
7. Technical assessment, reviews, audits, metrics and technical performance measures (TPMs).
8. Decision management and trade studies.
9. Quality assurance and process assurance.
10. Measurement and control of technical progress.
11. Supplier/acquisition and supply management.
12. Knowledge management, lessons learned, and competency management.

## Technical reviews and lifecycle gates

Review names vary by agency, contract, and industry; treat these as common patterns, not universal mandatory gates:

- Mission/Concept Review (MCR): mission need and concept credibility.
- System Requirements Review (SRR): requirements completeness, feasibility, traceability, and alignment.
- System Definition/Functional Review (SDR/SFR): architecture and functional baseline maturity.
- Preliminary Design Review (PDR): preliminary design, margins, risk and plans support proceeding to detailed design.
- Critical Design Review (CDR): detailed design sufficiently mature to build/implement.
- System Integration Review (SIR): integration readiness and compatibility.
- Test Readiness Review (TRR): test article, procedures, environment, instrumentation and risks are ready.
- Operational Readiness Review (ORR): operational organization, training, facilities, safety, support and procedures ready.
- Flight/Production/Acceptance reviews as domain-specific.
- Functional/Physical Configuration Audits (FCA/PCA): confirm actual configuration and evidence conform to baselines.

A gate should have explicit entrance criteria, products to inspect, decision authority, exit/success criteria, unresolved risks, action owners, and closure evidence. Never treat a calendar date or completed slide deck as proof of readiness.

## Key source anchors

- NASA Systems Engineering Handbook Rev 2: https://ntrs.nasa.gov/api/citations/20170001761/downloads/20170001761.pdf
- NASA common technical processes: https://www.nasa.gov/reference/2-1-the-common-technical-processes-and-the-se-engine/
- NASA requirements management: https://www.nasa.gov/reference/6-2-requirements-management/
- NASA interface management: https://www.nasa.gov/reference/6-3-interface-management/
- NASA review criteria appendix: https://nodis.gsfc.nasa.gov/displayDir.cfm?Internal_ID=N_PR_7123_001D_&page_name=AppendixG
- SEBoK: https://sebokwiki.org/wiki/Systems_Engineering_and_Management
- INCOSE standards map: https://www.incose.org/about-systems-engineering/standards-policies/

## Practice exercise

Design an autonomous warehouse robot as a socio-technical system. Produce: context diagram, ConOps, stakeholders, 15 testable requirements, logical/physical architecture, ICDs for robot/WMS/charging station, safety constraints, failure analysis, integration sequence, V&V matrix, operations/maintenance plan, and retirement considerations. Trace each stakeholder need through a requirement to a verification or validation method.
