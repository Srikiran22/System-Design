# System Safety: Integrated Hazard Analysis and Risk-Informed Safety Cases

**Depth:** advanced safety-engineering methods and evidence architecture.

## 1. Safety is a system property

Safety is not equivalent to the reliability of individual components. It emerges from interactions among hardware, software, humans, procedures, organizations and the operating environment. A system may contain highly reliable components and still produce hazardous interactions, unsafe control actions, flawed requirements or organizational conditions that defeat safeguards.

System safety therefore asks: what hazardous system states must be prevented or controlled, what constraints are necessary, and what evidence justifies accepting residual risk for the intended mission and operating context?

## 2. Traditional reliability methods and systems-theoretic methods

| Method              | Primary focus                                                                                  | Useful when                                                            | Key blind spot if used alone                                                                             |
| ------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| FMEA/FMECA          | Failure modes, local and propagated effects, criticality                                       | Component/subsystem failure analysis and risk ranking                  | Interaction and control problems that are not component failures                                         |
| Fault Tree Analysis | Combinations of events leading to a top hazard                                                 | Deductive logic and quantitative probability modeling                  | Incorrect/incomplete fault logic, dependency and common-cause omissions                                  |
| Event Tree Analysis | Forward progression after an initiating event                                                  | Barrier/success/failure sequence analysis                              | Poorly specified branching conditions or dependencies                                                    |
| HAZOP               | Deviations from design/operating intent using guide words                                      | Process and operational deviation analysis                             | Inadequate representation of dynamic control/organizational interactions                                 |
| STPA / STAMP        | Unsafe control actions and inadequate safety constraints in a sociotechnical control structure | Software-intensive, autonomous, interactive and organizational systems | Can become vague if control structure, unsafe action context and causal scenarios are not evidence-based |
| PRA                 | Structured probabilistic risk model                                                            | Risk-informed decisions with quantifiable scenarios and data           | Precision can exceed model/data confidence; model scope and epistemic uncertainty remain decisive        |

These methods complement rather than automatically replace one another. Select methods according to the hazard mechanisms and evidence required.

## 3. A systems-theoretic safety analysis loop

A common STPA-oriented sequence is:

1. Define losses, unacceptable system-level outcomes and hazards.
2. Translate hazards into enforceable safety constraints.
3. Draw the control structure: controllers, control actions, controlled processes, feedback, sensors, actuators, process models and relevant organizational relationships.
4. Identify unsafe control actions: control action provided when unsafe; not provided when needed; provided too early/late or in the wrong order; or applied too long/too soon stopped.
5. Develop causal scenarios explaining how each unsafe action could arise, including flawed process models, feedback delay/absence, component failures, inadequate requirements, human workload, coordination and external disturbances.
6. Derive design, operational and organizational controls.
7. Allocate constraints to system elements and verify that they are implemented.
8. Validate constraints in operational scenarios and update the analysis as the system changes.

STPA addresses hazards that may arise without a component failure. It therefore should not be described as just another FMEA table.

## 4. Integrated Safety Analysis and evidence

NASA System Safety Handbook Volume 2 promotes an objectives-driven approach: define objectives that collectively characterize adequate safety; derive safety requirements; conduct system safety activities, with emphasis on Integrated Safety Analysis (ISA); and build a risk-informed safety case at major milestone reviews. The point is not to generate paperwork for its own sake. It is to show whether safety objectives are met using system information, analysis and evidence, and to expose deficits in the argument or supporting evidence.

A safety case should include:

- **Claim:** what safety property is asserted, for which system, version, operation and environment;
- **Argument:** why the claim follows from the subclaims, assumptions, context and rationale;
- **Evidence:** verified requirements, analysis, test, inspection, operating history, hazard controls, reviews and independent assessment;
- **Defeaters/limitations:** uncertainties, exclusions, unresolved hazards, dependencies, residual risks and conditions that would invalidate the claim.

GSN is one notation for structuring this reasoning. The notation does not prove the argument valid; argument quality and evidence adequacy must be reviewed.

## 5. Risk is not just a score

A defensible risk record identifies:

- scenario leading to degraded performance or harm;
- likelihood/frequency estimate or qualitative likelihood basis;
- severity/consequence and affected stakeholder/asset;
- uncertainty, dependencies and data/model pedigree;
- controls that prevent, detect, mitigate or recover;
- residual risk after controls;
- accountable risk owner and authorized acceptance authority;
- trigger conditions for re-assessment.

Risk ranking numbers can help triage; they are not a universal decision rule. For catastrophic or low-frequency hazards, a low estimated probability is not sufficient if the model excludes plausible scenarios or common-cause dependencies.

## 6. Common-cause and human contributions

Redundant components are not independent if they share power, software, sensors, environmental exposure, maintenance errors, common data, procurement defects, configuration or the same erroneous requirements. FMECA/FTA/PRA should represent credible dependence and common-cause mechanisms.

Human reliability analysis should model tasks and context, not treat a human error probability as a universal constant. Procedures, interfaces, workload, training, automation behavior, team coordination, cues, time pressure and recovery opportunities influence the likelihood and consequences of a human failure event.

## 7. Review questions for a safety case

1. Are losses, hazards and constraints system-level and operationally grounded?
2. Does the analysis cover software behavior and interaction hazards, not only component failures?
3. Are dependencies, common-cause failures and latent organizational conditions addressed?
4. Does every critical safety constraint map to implementation and objective evidence?
5. Is the evidence tied to a controlled system configuration?
6. Are assumptions and use restrictions explicit?
7. Has independent challenge identified missing claims, unsupported inferences or stale evidence?
8. Is residual risk accepted by the correct authority, not by the analyst who modeled it?

## Sources

- [NASA System Safety Handbook Volume 1](https://ntrs.nasa.gov/api/citations/20120003291/downloads/20120003291.pdf) — NASA/SP-2010-580, November 2011; framework and concepts.
- [NASA System Safety Handbook Volume 2](https://ntrs.nasa.gov/api/citations/20150015500/downloads/20150015500.pdf) — NASA/SP-2014-612, November 2014; targeted full PDF extraction.
- [NASA system safety discipline page](https://sma.nasa.gov/sma-disciplines/system-safety) — links current safety resources and identifies NASA/SP-20250002210 as an additional risk-informed/case-assured guidance source.
- [STPA Primer](https://psas.scripts.mit.edu/home/wp-content/uploads/2013/10/An-STPA-Primer-version-0-4.pdf) — version 1, August 2013; explicitly incomplete on several advanced topics; use with the foundations text and later handbook, not as a sole normative source.
- [GSN standard](https://scsc.uk/gsn-standard) — current GSN community standard version 3.

**Limit:** NASA handbooks are NASA guidance, STPA is a method, and GSN is an argument notation; none by itself grants regulatory approval or defines a universal acceptable-risk threshold.
