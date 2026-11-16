# 102 — Model-based engineering: model assurance, credibility and toolchain governance

## A model is an engineered work product

A model should have a defined purpose, system boundary, abstraction, semantics, assumptions, owner, version, validation approach and decision-use limitation. A visually complete model may still be wrong, incomplete or irrelevant to the decision. MBSE improves traceability and consistency only when the model is governed as a controlled engineering artifact.

NASA-HDBK-1009A provides practical systems-modeling handbook guidance and work-product examples. SysML v2 is an OMG formal modeling language; it supports requirements, structure, behavior, analysis and verification cases. Neither the language nor the tool automatically establishes model credibility. [S191, S22]

## Model lifecycle

1. Define intended use and decision question.
2. Define abstraction boundary, context, entities, state, behavior and interfaces.
3. Identify assumptions, constraints, units and semantic definitions.
4. Build model and trace elements to stakeholder needs/requirements.
5. Perform model verification (correct implementation of intended model).
6. Perform validation (adequate representation for intended use).
7. Quantify uncertainty and sensitivity when predictions inform decisions.
8. Baseline model, tool/version, libraries, solver, parameters and data.
9. Generate analysis evidence and link to requirements/architecture/safety case.
10. Revalidate after model, source data, implementation or operational-context change.

## Verification, validation and credibility

- **Model verification:** were equations, constraints, state transitions, units and code implemented correctly?
- **Model validation:** does the model adequately represent the relevant real-world system for the stated purpose?
- **Model calibration:** were parameters estimated against data, and is separate validation data available?
- **Model uncertainty:** what is not known about parameters, structure, inputs or operating conditions?
- **Applicability:** which decisions and conditions are inside the model's validated domain?

A model can be internally consistent but invalid for a real mission. Calibration and validation should not use identical data without explaining the risk of overfitting.

## Toolchain governance

Control model source, generated artifacts, language/specification version, toolchain, plugins, libraries, solver configuration, external datasets, scripts and export formats. Preserve model provenance and reproducibility. If a model is used as evidence in a safety or regulatory argument, understand tool confidence, automation, independent checks and applicable qualification expectations.

## Traceability and consistency

A model element should connect to the requirement or decision it supports, architecture elements, analysis inputs/outputs and verification evidence. Automated consistency checks can detect missing allocations, interface mismatch, orphan requirements, invalid units, broken dependencies and model/code drift. They do not prove that the model's semantics are correct.

## Practical deliverable

Build a simple thermal-control model and connect it to requirements, architecture, simulation assumptions, test cases and acceptance criteria. Baseline the model/tool/data, verify dimensional consistency, validate against an independent measured dataset, and show which design decision cannot be supported by the model because its validation domain is too narrow.

## Source limitations

NASA handbook guidance and SysML specifications provide frameworks and language capabilities, not a universal model-credibility guarantee. Tool qualification requirements depend on use, sector and governing assurance basis. [S191, S22]
