# 70 — Formal methods, model checking and verification assurance

## What formal methods provide

Formal methods use mathematically precise models/specifications to analyze whether defined properties hold. They are particularly useful when state-space complexity, concurrency, safety, security or mission assurance makes informal reasoning insufficient. They do not automatically prove that the requirements are correct, complete or appropriate.

## Main families

- **Model checking:** systematically explore a finite/abstract state space for violations of temporal properties.
- **Theorem proving:** prove claims from axioms, definitions and inference rules; often requires more human guidance.
- **SAT/SMT solving:** determine whether logical/arithmetic constraints are satisfiable, often used for bounded verification and synthesis.
- **Abstract interpretation:** compute safe approximations of program behavior to prove properties such as absence of selected runtime errors.
- **Design by contract:** specify preconditions, postconditions and invariants.
- **Assume-guarantee reasoning:** decompose proof obligations across components and interfaces.
- **Refinement:** show that a lower-level design/implementation preserves the behavior allowed by a higher-level specification.

## Choosing the right degree of formality

Escalate formality for high consequence, hard-to-test states, concurrency, security boundaries, complex mode logic, precise timing, protocol correctness or certification objectives. Use informal review and conventional tests for low-risk, well-understood behavior. Formalization has cost: model construction, proof maintenance, tool qualification/assurance where applicable, expertise and model-to-code correspondence.

## Model checking workflow

1. Identify a concrete question and property (e.g. “the system never unlocks while pressure exceeds threshold”).
2. Define the system boundary, environment assumptions and abstraction.
3. Model states, transitions, concurrency, data and timing as required.
4. State invariants and temporal properties.
5. Run the checker and analyze counterexamples.
6. Refine model/requirements and repeat.
7. Validate that the abstraction represents the implementation-relevant behavior.
8. Preserve model version, tool version, assumptions, property set and results.

A counterexample is not merely an error; it may reveal ambiguity in the requirement, missing environmental condition or an unexpected design path.

## Verification strategy

Choose appropriate methods: inspection, analysis, demonstration, test, simulation, formal proof, hardware-in-the-loop, software-in-the-loop, acceptance test and independent verification. Every method must state configuration, test conditions, instrumentation, tolerance, acceptance criteria, anomalies and objective evidence.

## Coverage is multidimensional

Requirements coverage does not prove transition coverage, state coverage, interface coverage, fault coverage, timing coverage, security coverage, operational-envelope coverage or hazard-control coverage. Define coverage objectives that correspond to the risk and verification claim.

## MC/DC and safety-critical software

Modified Condition/Decision Coverage (MC/DC) is one structural coverage criterion used in certain software assurance contexts. It does not prove correctness, requirements completeness or absence of all defects. Applicable objectives depend on the governing sector standard, software level/classification, regulator guidance and project certification basis. Do not claim that satisfying one coverage metric establishes overall safety.

## V&V distinction

- **Verification:** evidence that specified requirements/design outputs are satisfied (“built according to specification”).
- **Validation:** evidence that the resulting system is fit for intended use in the actual or representative operational context (“the right system for the need”).

NASA process descriptions emphasize the technical lifecycle and link product integration to verification and validation [S167]. Both are needed; they are not interchangeable.

## Evidence package

Preserve requirement baseline, model/specification, verification plan, procedures, environment, equipment calibration, raw data, analysis, anomalies, disposition, reviewer approval, configuration identifier and limitations. Where independence is required, record organizational and technical independence, conflicts of interest and access to evidence.
