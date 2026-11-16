# 63 — Requirements engineering: formalization, traceability and evidence chains

## Requirements are controlled claims about need and constraint

A requirement is not a design preference or a disguised implementation instruction. It expresses a need, capability, behavior, constraint or quality level that can be evaluated. Requirements engineering is iterative: stakeholder understanding, system boundary, architecture, requirements and verification strategy refine one another. NASA's requirements-management process explicitly covers stakeholder expectations and technical requirements down to component level, including traceability and change control [S56].

## Decompose without losing meaning

A robust chain can include:

1. Mission/business objective.
2. Stakeholder need or expectation.
3. Operational scenario / ConOps.
4. System requirement.
5. Subsystem/component requirement.
6. Interface requirement.
7. Design element / model element.
8. Verification requirement and procedure.
9. Test/analysis/inspection result.
10. Validation evidence in the intended context of use.

Traceability must be meaningful, not merely a populated database field. A link should express a relation such as derives, refines, satisfies, allocates, interfaces with, verifies or validates. Bidirectional traceability supports change-impact analysis and orphan detection.

## Requirement quality checks

| Quality             | Review question                                                                                                |
| ------------------- | -------------------------------------------------------------------------------------------------------------- |
| Necessary           | Does this requirement contribute to a need, risk control, interface, legal obligation or lifecycle constraint? |
| Singular            | Is there one testable obligation rather than multiple hidden obligations?                                      |
| Unambiguous         | Would independent readers interpret it consistently?                                                           |
| Complete            | Are conditions, units, modes, interfaces and exceptions stated?                                                |
| Feasible            | Can the requirement be achieved under known technology/resources/constraints?                                  |
| Consistent          | Does it conflict with other requirements, architecture or operating concept?                                   |
| Verifiable          | Can an objective method and acceptance criterion be defined?                                                   |
| Traceable           | Is its source/rationale and downstream evidence linked?                                                        |
| Correctly allocated | Is it assigned to the level that can satisfy it?                                                               |
| Current             | Is it still valid after approved changes?                                                                      |

## Quantitative quality requirements

Use operationally meaningful scenarios rather than “fast”, “secure”, “scalable” or “high availability.” A scenario should identify stimulus/source, operating context, response, response measure, threshold and verification method. For a timing requirement: state the triggering event, start/stop points, load, percentile or worst-case criterion, clock basis and measurement conditions. For availability: define service boundary, observation window, exclusions, planned maintenance policy, dependency assumptions and the denominator used.

## Formalization ladder

Not every requirement needs formal mathematics. Increase formality when risk, ambiguity, interaction count or assurance obligations justify it:

- Natural-language statement with controlled vocabulary.
- Structured statement/template with condition, actor, action, object and threshold.
- Tabular decision/transition model.
- State machine, sequence, interface or constraint model.
- Formal specification using temporal logic, contracts, invariants or mathematical relations.
- Model checking, theorem proving or executable test generation.

Formalization is not a cure for an incorrect stakeholder assumption. Validate the meaning before proving properties of a formal model.

## Change-impact analysis

For each proposed change, inspect: parent need; siblings and competing requirements; derived and allocated requirements; interfaces; architecture/model elements; hazard controls; security controls; test cases and procedures; training/logistics; suppliers; schedule/cost; operational data and certification evidence. Record who approved the change and which baselines are affected.

## Requirement volatility and uncertainty

Unstable requirements can be an early signal of unresolved mission intent, incomplete stakeholder representation, immature technology, changing regulation or poor decomposition. Track volatility by requirement set and time period, but do not punish discovery. Distinguish legitimate learning from avoidable churn. Use assumptions registers, decision logs, prototypes and staged baselines to contain uncertainty.

## MBSE integration

NASA-HDBK-1009A describes modeling work products across stakeholder expectations, ConOps, MOEs, technical requirements, MOPs, TPMs and V&V. It provides relationships such as `deriveReqt`, `trace`, `refines`, `satisfies` and `verifies` for connecting artifacts [S191]. A model repository becomes an authoritative source only when ownership, conventions, access, change control, validation, configuration and tool interoperability are governed.

## Evidence chain

Every high-criticality requirement should be able to answer: who needs it; why it exists; what element satisfies it; what assumptions it depends on; how it is verified; what objective result exists; what validation shows the result matters to users/operators; and which configuration was assessed.

## Failure patterns

- “Shall be user-friendly” without a user/task/context metric.
- Requirement wording embeds a chosen technology without rationale.
- Multiple requirements are collapsed into one opaque sentence.
- One test is linked to every requirement with no coverage argument.
- Trace links are one-way and break on change.
- Verification passes but validation fails because the wrong problem was solved.
- A system-level target is allocated to components without budgets or interface analysis.
- Requirements become frozen while the actual mission/context changes.
