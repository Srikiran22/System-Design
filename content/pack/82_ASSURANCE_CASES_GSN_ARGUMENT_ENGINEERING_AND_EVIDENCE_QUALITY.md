# 82 — Assurance cases, GSN argument engineering and evidence quality

## The distinction between a test result and an assurance claim

A test result is evidence about a particular configuration, environment, stimulus, procedure and observation. An assurance claim is a broader proposition about a system or service. The claim is not established merely because evidence exists: an explicit argument must show why the evidence supports the claim within a stated context and assumptions.

An assurance case is commonly framed as a reasoned, auditable argument supported by evidence that a system, service or organisation will operate as intended for a defined application in a defined environment. The scope and environment are part of the claim, not administrative footnotes. A claim that is credible for one operational envelope may be invalid after a change in users, loads, adversary capability, supplier, geography or maintenance concept. [S246, S247]

## GSN as an argument notation

The Goal Structuring Notation provides a visual language for claims/goals, strategies, contexts, assumptions, justifications, solutions/evidence and relationships. It is not a hazard-analysis method, a test method or a proof engine. It helps make the reasoning structure inspectable. Version 3 of the community standard is the latest version identified on the SCSC owner page in this research snapshot. [S246]

A defensible top-level argument normally decomposes the assurance claim along meaningful dimensions such as:

- intended function and mission outcome;
- defined operational environment and operating envelope;
- safety, security, reliability and human-performance concerns;
- lifecycle stages, including production, update, maintenance and retirement;
- configuration identity and dependencies;
- evidence sufficiency, independence and currency.

Do not decompose merely by subsystem names. A subsystem-by-subsystem argument can leave cross-system interactions, shared dependencies, system-level hazards and socio-technical assumptions unaddressed.

## Construction sequence

1. **Define the claim boundary.** Name the system-of-interest, intended use, version/configuration, environment, operating envelope, actors and relevant lifecycle phase.
2. **State the top-level claim.** Use a proposition that can in principle be challenged or supported. Avoid claims such as “the system is safe” with no use context or risk criteria.
3. **Select a decomposition strategy.** Decompose by hazard, mission thread, lifecycle, system property or combination. Explain why the decomposition is complete enough for the stated claim.
4. **Expose context and assumptions.** Record standards, definitions, environmental conditions, user population, service dependencies, threat assumptions, operating procedures and known exclusions.
5. **Make the inference explicit.** State why the evidence proves a subclaim and why that subclaim supports the parent claim. Evidence lists without inference are not an argument.
6. **Assess evidence quality.** Check configuration, repeatability, test validity, coverage, independence, uncertainty, anomalies, applicability and age.
7. **Identify defeaters and residual uncertainty.** Ask what evidence would disconfirm the claim, what plausible scenarios are not covered and what operational controls remain necessary.
8. **Review and maintain.** Reopen claims after changes to requirements, architecture, code, data, suppliers, models, environment, threats, user tasks or operating procedures.

## Evidence quality dimensions

| Dimension       | Question to ask                                                                                     |
| --------------- | --------------------------------------------------------------------------------------------------- |
| Relevance       | Does the evidence address this exact claim and system boundary?                                     |
| Configuration   | Is the tested/modelled item the released configuration, with known versions and dependencies?       |
| Validity        | Does the method measure the property claimed, under representative conditions?                      |
| Coverage        | Which states, transitions, scenarios, environments, failure modes and users are covered or omitted? |
| Independence    | Was evidence generated/reviewed with appropriate independence from the design activity?             |
| Reproducibility | Are procedures, instruments, raw data, tolerances and analysis preserved?                           |
| Uncertainty     | Are measurement error, model uncertainty and operational variability characterized?                 |
| Currency        | Does later change invalidate the evidence or argument?                                              |

## Common argument anti-patterns

- **Evidence dumping:** dozens of test reports are attached without showing which claims they support.
- **Circular argument:** a subclaim merely restates the parent claim.
- **Unjustified completeness:** “all hazards were considered” without a method, boundary, completeness rationale or independent challenge.
- **Assumption hiding:** operational controls, training, human response time or supplier capability are assumed but not evidenced.
- **Confidence laundering:** a successful simulation is presented as real-world validation without showing model validity.
- **Configuration drift:** a safety case remains attached to a baseline that no longer matches the deployed system.

## Tie safety analysis to the case

Hazard logs, STPA unsafe control actions, FMEA/FMECA, fault trees, HAZOP, cybersecurity threat models, human-task analyses and reliability models are sources of claims, constraints and scenarios. None alone is a safety case. The case must explain the relationship between the analyses, selected controls, implementation and verification evidence. NASA's work on aviation assurance cases highlights the importance of explicit argument structure, review and evidence interpretation. [S247]

## Practical deliverable

Create an assurance case for a cloud-connected industrial controller. Include the system boundary, an operational envelope, top-level claim, at least three decomposition strategies, assumptions, safety/security subclaims, verification evidence, residual risk, independent reviewer questions and a change-trigger table. Red-team the case by introducing a supplier firmware update, a new remote operator role and a degraded network state.

## Source limitations

GSN is a notation and guidance standard, not a claim that an argument is true. The NASA assurance-case report is a research report and not a sector certification rule. Applicable regulator rules and sector standards remain controlling where mandated. [S246, S247]
