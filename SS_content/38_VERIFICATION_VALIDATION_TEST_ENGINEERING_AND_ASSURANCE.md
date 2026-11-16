# 38 — Verification, validation, test engineering and assurance

## The distinction

**Verification:** did we build the system right against its specified requirements? **Validation:** did we build the right system for the intended users, mission and operating context? A system can pass every test derived from an incorrect requirement and still fail validation.

## Evidence architecture

A requirement should have one or more verification methods and acceptance criteria. Common methods are test, analysis, inspection and demonstration. Choose the method based on the claim: performance generally needs measurement under a defined workload; a physical dimension may be inspected; a mathematical property may be analyzed; an operational workflow may need demonstration with representative users. Record test configuration, data, environment, instruments, calibration, software/model version, anomalies, acceptance decision and reviewer.

## Lifecycle test strategy

| Level                  | Main concern                                      | Examples                                                                 |
| ---------------------- | ------------------------------------------------- | ------------------------------------------------------------------------ |
| Component / unit       | Local logic and physical element behavior         | unit tests, component tests, material tests                              |
| Interface              | Contract and interaction correctness              | API contract tests, ICD checks, electrical and protocol tests            |
| Integration            | Subsystem interaction and allocated requirements  | hardware/software integration, service integration, HIL/SIL              |
| System                 | End-to-end requirements and performance           | system test, stress, reliability, security, environmental tests          |
| Qualification          | Demonstrate design meets specified conditions     | environmental qualification, reliability qualification, safety assurance |
| Acceptance             | Demonstrate delivered configuration is acceptable | FAT, SAT, customer acceptance                                            |
| Operational validation | Suitability under intended use                    | field trials, usability studies, mission-thread validation               |

The V-model is a useful relationship map between decomposition/design and integration/verification, but real programs iterate, prototype, re-baseline and validate continuously. It is not a mandatory waterfall sequence.

## Integration strategy

Plan integration around risk, interface complexity, dependency maturity, testability and feedback time. Big-bang integration delays learning. Incremental integration should include stable interface contracts, representative stubs/simulators, configuration management, test fixtures and a known-good baseline. Hardware/software systems may need software-in-the-loop, processor-in-the-loop, hardware-in-the-loop, subsystem rigs and end-to-end system test.

## Testability by design

Include test points, instrumentation, fault injection, diagnostic codes, observability, controllable test modes, synthetic data, deterministic replay, interface simulators and safe recovery hooks. A system that cannot expose internal state or reproduce failure is expensive to verify and operate.

## Model verification and validation

- **Model verification:** are equations, logic, code and implementation correct relative to the conceptual model?
- **Model validation:** is the model adequate for its intended purpose and domain of use?
- **Model credibility:** are assumptions, input data, uncertainty, sensitivity and validation evidence sufficient for the decision being made?

A simulation can be numerically correct yet unsuitable because the conceptual model omits a dominant mechanism. A validated model is not valid for every new context.

## Formal methods

Formal specification, invariants, temporal logic, model checking, theorem proving, abstract interpretation and refinement can provide strong assurance for selected properties. Use them where state-space, failure consequence, concurrency or protocol correctness justifies the cost. Formal proof is always relative to a model, assumptions and properties; it does not prove that the model captures the real environment.

## Independent verification and validation

IV&V adds organizational and technical independence to reduce conflicts of interest and blind spots. Independence should be defined in authority, reporting, access to artifacts, review scope and ability to report findings. It is not achieved by merely assigning the test to a different team that has no access or time.

## Assurance cases

A safety, security or mission assurance case links claims to arguments and evidence. Structure the top-level claim, context, assumptions, subclaims, evidence and defeaters. Review evidence freshness, configuration, independence, applicability and unresolved anomalies. Assurance is an argument supported by evidence, not a label.

## Coverage and closure

Track requirement-to-test coverage, test-to-requirement traceability, interface coverage, scenario coverage, hazard/threat control coverage, configuration coverage, code/model coverage where relevant, and open anomalies. Coverage percentages are not proof of adequacy: a poorly designed test can cover a requirement ID while failing to test its risky condition.

## Exit criteria

A credible test exit decision requires defined scope, representative configuration, passed mandatory criteria, dispositioned anomalies, known deviations, residual risk acceptance, evidence traceability and an accountable decision authority. “All tests passed” is insufficient without test quality and configuration context.
