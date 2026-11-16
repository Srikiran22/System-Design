# 24 — Systems engineering careers and competency framework

## Important framing

Job titles are not globally standardized. One employer's “Systems Engineer I” may be another employer's integration, product, requirements or test engineer. The scope below is a role-family map based on professional competency frameworks, public role descriptions and common industry practice. Actual job descriptions, domain standards, clearance/licensing rules and years of experience vary.

## Career architecture

A useful career model separates:

- **Lifecycle responsibility:** concept, requirements, architecture, design, integration, V&V, operations, sustainment, retirement.
- **Technical specialism:** MBSE, reliability, safety, control, software, electrical, mechanical, logistics, human systems, cybersecurity.
- **Authority level:** contributor, engineer, senior engineer, technical lead, principal/architect, engineering manager/director.
- **Domain:** software, aerospace, defense, automotive, medical devices, industrial automation, energy, telecom, infrastructure, robotics, space, healthcare.

A senior engineer may be a deep technical specialist without being a people manager. An architect may be accountable for technical coherence but not own all lifecycle management tasks.

## Common competency backbone

1. Systems thinking and system context.
2. Stakeholder analysis and ConOps.
3. Requirements engineering and traceability.
4. System architecture and design.
5. Interface definition and management.
6. System analysis, modeling and trade studies.
7. Implementation, integration and product realization.
8. Verification and validation.
9. Risk, safety, security and reliability.
10. Technical planning, reviews, configuration and technical data management.
11. Operation, maintenance, logistics and lifecycle management.
12. Communication, facilitation, technical writing, negotiation, leadership and ethical judgment.

NASA's public competency model organizes competencies into System Design, Product Realization and Technical Management. INCOSE experience areas add requirements, system/decision analysis, architecture/design, integration, V&V, operation/maintenance, technical planning/control, risk, acquisition/supply, configuration/information management and specialty engineering.

## Roles

### 1. Systems Engineer I / Entry-Level Systems Engineer

**Purpose:** support the system-level engineering effort under guidance; maintain traceability and help coordinate subsystem work.

**Typical responsibilities:** maintain requirements and trace links; update system diagrams and interface records; support system analysis/trade studies; prepare technical review material; support integration/test events; record anomalies and actions; help manage configuration and technical data.

**Must know:** engineering fundamentals in a relevant domain; requirements quality; system boundary/context; basic architecture; V-model/lifecycle; units and interface discipline; test fundamentals; configuration control; technical writing.

**Tools (examples):** Excel/Sheets; DOORS/Jama/Polarion/Codebeamer; Cameo/SysML, Capella or diagrams; MATLAB/Simulink or Python; Git/Jira/Confluence; PLM/PDM as domain requires.

**Typical outputs:** requirements updates, traceability matrix, diagrams, ICD support, analysis workbook, meeting/action log, test procedure contribution, anomaly report.

**Evidence for a portfolio:** one small system project with requirements, context, architecture, ICD, test cases, evidence and change history.

### 2. Integration Engineer

**Purpose:** bring components/subsystems together and expose interaction failures early.

**Responsibilities:** define integration sequence and environment; manage interfaces/configuration; create harnesses, stubs, simulators and test data; assemble systems; debug mechanical/electrical/protocol/data/timing incompatibilities; manage anomalies and regression; report integration readiness.

**Must know:** interface control, configuration management, staged integration, test design, diagnostic reasoning, logs/instrumentation, dependency and build management.

**Typical outputs:** Integration Plan, build/configuration manifest, ICDs, N² interface matrix, integration tests, test logs, anomaly reports, integration readiness report.

**Portfolio:** integrate a REST/event system or hardware+software sensor system with version mismatch, invalid units, timing errors and missing dependency failure injected.

### 3. Requirements Analyst / Requirements Engineer

**Purpose:** transform stakeholder needs into an agreed, feasible, verifiable requirements baseline.

**Responsibilities:** stakeholder interviews/workshops; needs analysis; conflict resolution; requirement writing; quality reviews; decomposition/allocation; traceability; change impact; baseline and waiver management.

**Must know:** elicitation techniques, use cases/scenarios, shall-statement quality, functional/non-functional/interface constraints, verification method selection, requirements validation, requirements tool workflows.

**Typical outputs:** stakeholder register, ConOps scenarios, stakeholder requirements, system requirements specification, traceability matrix, verification cross-reference, change impact report, requirements quality metrics.

**Portfolio:** turn a vague request into a hierarchical requirement set with sources, rationales, measurable acceptance criteria and bidirectional trace links.

### 4. Verification & Validation (V&V) Engineer

**Purpose:** build defensible evidence of requirement compliance and intended-use fitness.

**Responsibilities:** V&V strategy; verification method/level; validation scenarios; test design; test environment, procedure and instrumentation; TRR preparation; test execution; results analysis; anomaly tracking; compliance reporting.

**Must know:** difference between verification and validation; test levels; statistical test design where relevant; safety/environmental testing; model V&V; calibration; configuration identity; reproducibility; evidence quality.

**Typical outputs:** V&V Plan, verification matrix, validation scenarios, procedures, test report, traceability/evidence package, anomaly closure.

**Portfolio:** test an autonomous robot against requirements and validate it in a warehouse workflow with real operators and abnormal conditions.

### 5. Model-Based Systems Engineer (MBSE)

**Purpose:** establish, govern and use system models as authoritative connected engineering artifacts.

**Responsibilities:** model scope/method; SysML or domain modeling; requirements/architecture/behavior/interface models; model validation; traceability; change impact; model federation and tool integration; training and governance.

**Must know:** systems engineering process first; modeling semantics; SysML (v1/v2 status must be identified); abstraction/viewpoints; model quality; configuration management; APIs/interoperability; model validation and simulation limitations.

**Typical outputs:** model architecture, diagrams/views, requirement relations, interface models, parametric models, validation rules, model governance plan, generated specifications, digital-thread links.

**Portfolio:** a connected model whose change-impact query shows how an altered interface requirement propagates to components, tests, safety analyses and review artifacts.

### 6. Senior Systems Engineer

**Purpose:** own a system/subsystem engineering area with limited supervision and make coordinated design decisions.

**Responsibilities:** lead requirements/architecture for a subsystem; resolve interface disputes; lead trade studies; manage technical risks and margins; review work; mentor juniors; coordinate supplier/domain teams; support technical reviews.

**Must know:** lifecycle methods, architecture views, technical budgets, specialty engineering integration, decision analysis, review leadership, risk and configuration control.

**Evidence:** lead a subsystem through requirements baseline, PDR/CDR, integration and V&V with decisions and residual risks documented.

### 7. Lead Systems Engineer / Systems Engineering Lead

**Purpose:** coordinate technical work across a project/program or engineering team; preserve system-level coherence.

**Responsibilities:** establish SEMP and technical plans; plan reviews; coordinate disciplines/specialties; manage technical baselines, interfaces, dependencies, risks, TPMs and decision boards; report system health; improve process and capability.

**Must know:** integrated planning, leadership without direct authority, complex trade studies, lifecycle cost and schedule, technical review criteria, configuration and data governance, systems engineering tailoring.

**Typical outputs:** SEMP, technical management plans, review schedule, system health/TPM dashboard, risk board pack, technical decision log, interface governance, process improvement plan.

### 8. Systems Architect / Lead Systems Architect

**Purpose:** shape the system's fundamental structure and design choices so requirements and quality attributes can be achieved across the lifecycle.

**Responsibilities:** architecture viewpoints; system decomposition; key interfaces; allocation; quality attribute scenarios; alternative architectures; trade studies; make/buy/reuse decisions; architecture governance; design integrity; technology and lifecycle strategy.

**Must know:** domain physics/engineering, architecture description/evaluation, reliability/safety/security/performance/supportability, interface and data architecture, model-based methods, lifecycle cost, uncertainty and socio-technical context.

**Typical outputs:** architecture description, logical/physical architecture, interface model, design rationale/ADRs, trade studies, budgets, architecture risk register, architecture review package.

### 9. System Reliability Engineer

**Purpose:** ensure reliability and availability goals are designed, analyzed, tested and improved over the lifecycle.

**Responsibilities:** define reliability requirements; allocate budgets; model failure behavior; FMEA/FMECA/FTA/RBD; Weibull/statistical analysis; reliability prediction and demonstration; failure data and FRACAS; design improvements; field reliability monitoring.

**Must know:** probability/statistics, failure physics, repairable/non-repairable systems, common-cause failure, redundancy, maintainability, mission profile, confidence bounds, lifecycle data.

**Typical outputs:** reliability plan, predictions, failure analysis, FMEA/FMECA, fault trees, reliability budget, growth model, FRACAS report, test strategy and reliability assessment.

### 10. Control Systems Engineer

**Purpose:** model dynamic processes and design/implement controllers and automation that satisfy performance and safety requirements.

**Responsibilities:** plant/system modeling; control architecture; control algorithms; sensor/actuator selection; simulation; PID/advanced control; PLC/DCS/SCADA/HMI implementation; integration; loop tuning; FAT/SAT; commissioning and troubleshooting.

**Must know:** differential equations, linear algebra, Laplace, state-space, stability, feedback, robustness, sampling, real-time constraints, instrumentation, industrial protocols and functional safety as applicable.

**Typical outputs:** control philosophy, control block diagrams, I/O list, narratives, state/sequence logic, controller models, HMI requirements, safety interlocks, FAT/SAT procedures and commissioning report.

## Additional adjacent roles to include

- Systems Analyst / Mission Analyst
- System Safety Engineer / Functional Safety Engineer
- Systems Security Engineer / Cybersecurity Architect
- Human Factors / Human Systems Integration Engineer
- Supportability / Integrated Product Support / Logistics Engineer
- Configuration Management / Technical Data Management Engineer
- Systems Test Engineer / Qualification Engineer
- Design Assurance / Quality Engineer
- Software/Hardware/Mechanical/Electrical Systems Engineer
- Reliability, Availability and Maintainability (RAM) Specialist
- Manufacturing/Producibility Engineer
- Product/Platform/Enterprise Architect (software-heavy domain)
- System-of-Systems Engineer
- Technical Program/Project Manager (technical decision interfaces)

## Role comparison dimensions for site filtering

Each role page should store: seniority, domain, lifecycle phases, competency areas, key methods, tools (marked as examples), outputs, interfaces with adjacent roles, expected autonomy, typical review responsibility, training pathway, portfolio projects, certifications (only where relevant), and job-description examples with date/location.

## Sources

- NASA Systems Engineering Competency Model: https://www.nasa.gov/wp-content/uploads/2025/09/se-competency-model.pdf
- INCOSE experience areas: https://www.incose.org/certification/documenting-experience/
- UVA career role descriptions: https://engineering.virginia.edu/offices-programs/center-engineering-career-development/career-development-systems-engineering-job-titles-and-job-descriptions
- INCOSE SEP certification: https://www.incose.org/certification/start-your-certification/
- SysML v2 overview: https://www.omg.org/sysml/sysmlv2/
- INCOSE competency framework: https://www.incose.org/wp-content/uploads/legacy/professional-development-portal/isecf.pdf
