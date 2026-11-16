# 23 — Specialty engineering and cross-disciplinary knowledge

Specialty engineering is the coordinated engineering of system properties that emerge from the whole system. It is not a late compliance review. These properties often conflict, and their requirements should be allocated, traded, analyzed, verified and managed throughout the lifecycle.

## Core specialisms

### 1. Reliability engineering

Objective: influence design to reduce failures and achieve mission/service reliability.

Core concepts: failure modes, failure mechanisms, failure rate, hazard rate, MTBF (repairable-item metric with explicit assumptions), mission reliability, reliability allocation, reliability prediction, physics of failure, derating, redundancy, common-cause failure, reliability growth, demonstration testing, censored data, Weibull distribution, confidence bounds, FRACAS.

Methods/artifacts: reliability plan, reliability block diagram (RBD), FMEA/FMECA, fault tree analysis (FTA), failure definitions and scoring criteria, reliability prediction/model, reliability budget, growth curve, test plan, FRACAS database, corrective-action evidence.

### 2. Maintainability and availability engineering

Objective: design for restoration, support and operational availability.

Concepts: MTTR, mean logistics delay time, maintainability allocation, repair level, fault isolation, accessibility, modular replacement, diagnostics, built-in test, spares, repair turnaround, preventive maintenance, maintenance task analysis, operational/inherent/achieved availability.

Methods/artifacts: maintainability analysis, maintenance concept, maintenance task analysis, LORA (level of repair analysis), supportability case, spares analysis, maintainability demonstration, availability model, maintenance manuals, support plan.

### 3. System safety and functional safety

Objective: identify hazards and ensure risks are eliminated or controlled to an acceptable level with justified evidence.

Concepts: hazard, loss, accident, unsafe control action, risk, severity, likelihood, exposure, safety constraint, safety integrity level (SIL), safety lifecycle, common cause, independence, safe state, fail-safe, fail-operational, fail-degraded, safety case/assurance case.

Methods: Preliminary Hazard Analysis (PHA), HAZID, HAZOP, FMEA/FMECA, FTA, Event Tree Analysis (ETA), LOPA, STPA, bow-tie, fault injection, safety analysis, GSN assurance arguments.

Artifacts: hazard log, safety plan, hazard analysis, safety requirements specification, safety architecture, safety case, verification evidence, safety assessment, operational restrictions and residual-risk acceptance.

Standards are domain-specific. Common families include IEC 61508, IEC 61511, ISO 26262, EN 50126/8/9, DO-178C/DO-254 and sector-specific rules. Verify current edition, applicability and legal/contractual authority before using.

### 4. Security engineering and cyber resilience

Objective: preserve confidentiality, integrity, availability, authenticity, accountability and safety under malicious or accidental threats.

Concepts: assets, adversaries, attack surface, trust boundaries, threat actors, attack paths, privilege, defense in depth, zero trust, secure boot, key management, supply-chain trust, vulnerability, exploitability, detection, containment, recovery.

Methods: threat modeling, attack trees, STRIDE, misuse cases, security architecture review, penetration testing, fuzzing, software composition analysis, secure design review, red teaming, assurance cases.

Artifacts: system security plan, data classification, trust-boundary diagram, threat register, security requirements, security control matrix, vulnerability findings, incident playbooks, authorization evidence.

### 5. Human Systems Integration (HSI) and human factors

Objective: optimize the system across human capabilities/limitations, workload, usability, safety, training and workforce context.

Domains: human factors engineering, manpower/personnel, training, human survivability, habitability, safety and occupational health, ergonomics, accessibility, cognitive engineering, operator workload, human-machine interface, task analysis, human error, situation awareness.

Artifacts: human-system interface requirements, task analyses, user/operator scenarios, workload analysis, HSI plan, training needs analysis, usability test plan, accessibility evidence, human error analysis.

### 6. Control systems and automation engineering

Objective: make dynamic processes behave predictably and safely through sensing, computation, actuation, feedback and supervisory control.

Foundations: physical process/plant modeling; differential equations; transfer functions; Laplace transforms; state-space models; linear/nonlinear/time-varying systems; sampling; discretization; sensors/actuators; calibration; noise; disturbance; observability; controllability.

Control theory: open-loop and closed-loop control, feedback, stability, transient/steady-state response, overshoot, settling time, tracking, disturbance rejection, robustness, gain/phase margins, Bode/Nyquist/root-locus, PID, feedforward, cascade, state feedback, observers, MPC, adaptive/robust control.

Industrial implementation: PLC, DCS, SCADA, HMI, RTU, fieldbus/industrial Ethernet, I/O architecture, control narratives, operating modes, interlocks, alarm management, sequence logic, historian, FAT/SAT, commissioning, loop checks.

Artifacts: control philosophy, process/control block diagrams, I/O list, cause-and-effect matrix, control narratives, functional specification, loop drawings, logic diagrams, alarm philosophy, safety instrumented function specification, test and commissioning package.

### 7. Integration engineering

Objective: assemble elements into a coherent whole while controlling interface and configuration risk.

Concepts: integration strategy, sequence, environment, build, interface ownership, dependency, configuration identity, readiness, stubs/mocks/simulators, test harness, compatibility, anomaly, regression, incremental integration.

Artifacts: integration plan, integration sequence, ICD/IRD/IDD, N² matrix, integration readiness criteria, integration test cases, build record, anomaly log, integration report.

### 8. Verification, validation and test engineering

Objective: create credible evidence that requirements are satisfied and the intended system is fit for purpose.

Methods: test, analysis, inspection, demonstration; qualification, acceptance, regression, environmental, performance, stress, reliability, compatibility, usability, operational testing, simulation, model V&V.

Artifacts: V&V strategy/plan, verification cross-reference matrix, validation scenarios, procedures, test reports, calibrated instrumentation record, defect/anomaly records, test readiness review, acceptance dossier.

### 9. Logistics, product support and sustainment engineering

Domains: integrated product support, provisioning, support equipment, technical data, training, facilities, maintenance planning, supply support, packaging/handling/storage/transport, obsolescence, repairability, disposal, supply-chain risk.

Artifacts: product support strategy, supportability analysis, LORA, maintenance concept, provisioning/BOM, spares plan, technical manuals, training plan, support equipment plan, obsolescence plan.

### 10. Manufacturing, producibility and quality engineering

Concepts: design for manufacture/assembly/test, process capability, tolerances, yield, inspection, supplier quality, counterfeit avoidance, process validation, product genealogy, configuration conformity, continuous improvement.

Artifacts: manufacturing plan, process flow, control plan, inspection/test plan, quality plan, supplier qualification, nonconformance record, corrective/preventive action, production readiness review evidence.

### 11. Environmental, sustainability and electromagnetic compatibility

Concepts: thermal, vibration, shock, humidity, radiation, corrosion, contamination, lifecycle environmental impact, energy use, material restrictions, EMC/EMI, spectrum, grounding, shielding, susceptibility/emissions.

Artifacts: environmental requirements, qualification profile, EMC control plan, materials declaration, environmental analysis, energy budget, sustainability assessment, test evidence.

### 12. Affordability, cost and value engineering

Concepts: lifecycle cost, total cost of ownership, affordability, cost drivers, uncertainty, parametric estimates, trade space, cost-effectiveness, value engineering, make/buy, sunk cost, discount rate, sensitivity analysis.

Artifacts: cost model, lifecycle cost estimate, cost risk analysis, affordability target, trade study, value engineering proposal, business case.

### 13. Mass properties, power, thermal, structural and other design disciplines

These specialist disciplines define, allocate, model, budget and verify their own physical/system constraints and margins. Their constraints interact: adding shielding changes mass and thermal dissipation; adding redundancy changes mass, power and control complexity; increasing compute changes power and cooling demands.

Artifacts include discipline budgets, interface inputs, models, margins, analysis reports, verification cases, and integrated TPM contributions.

## Integration principle

Do not optimize each specialty independently. The system engineer coordinates interactions and trade-offs among them. A locally optimal subsystem can create an unviable total system. The architecture should explicitly show who owns each requirement, model, evidence item, interface and risk.
