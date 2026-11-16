# 68 — System safety: STPA, hazard control and safety cases

## Safety is a system property

System safety is not achieved by proving every component reliable in isolation. Unsafe outcomes can arise from component failure, unsafe interaction among functioning components, flawed requirements, inadequate control, poor feedback, changes in operating conditions or organizational decisions. The NASA System Safety Handbook frames system safety across the lifecycle and supports risk-informed safety decisions [S208].

## Hazard-analysis methods are complementary

| Method     | Model focus                                            | Strength                                                | Blind spot if used alone                                                        |
| ---------- | ------------------------------------------------------ | ------------------------------------------------------- | ------------------------------------------------------------------------------- |
| FMEA/FMECA | Component/function failure modes and effects           | Structured bottom-up failure discovery                  | Interaction hazards, organizational control and emergent behavior can be missed |
| FTA        | Logical combinations leading to a top event            | Quantitative/qualitative causal combinations            | Depends on correct boundary and dependency modeling                             |
| Event tree | Branching outcomes after an initiating event           | Success/failure of protective functions                 | Limited by selected initiating events and modeled branches                      |
| HAZOP      | Deviations from design/process intent using guidewords | Process deviations and causes/consequences              | Workshop scope and discipline determine completeness                            |
| Bow-tie    | Threats, top event, barriers and consequences          | Clear barrier communication                             | Often linear; can hide complex feedback and common causes                       |
| STPA       | Unsafe control actions and inadequate control/feedback | Interaction, software, human and organizational control | Requires careful system/control-structure modeling and analysis skill           |

## STPA process

The MIT STPA primer describes a systems-theoretic hazard analysis grounded in STAMP [S209]. A typical workflow:

1. Define losses and system-level hazards.
2. Establish safety constraints that prevent those hazards.
3. Model the control structure: controllers, control actions, controlled processes, feedback, actuators, sensors and external influences.
4. Identify unsafe control actions: a needed action not provided; an unsafe action provided; action provided too early/too late or in wrong order; action applied too long or stopped too soon.
5. Identify causal scenarios that could produce unsafe control: inadequate process models, flawed control algorithms, missing/inaccurate feedback, actuator/sensor faults, communication delays, inadequate coordination, environmental disturbances or organizational control failures.
6. Derive safety requirements/constraints and link them to architecture, implementation, operations and verification evidence.

STPA does not replace FMEA, FTA, test, operational monitoring or sector-specific functional-safety obligations. Select a combination that matches the hazard and assurance case.

## Safety case and assurance argument

A safety case is a structured argument supported by evidence that a system is acceptably safe for a stated context and operating envelope. It should make explicit:

- claim: what safety property is asserted;
- context: intended operation, assumptions, configuration and environment;
- strategy: how the claim is decomposed and justified;
- subclaims: safety constraints and hazard-control claims;
- evidence: analyses, test results, inspections, procedures, training, audits and operational evidence;
- defeaters/limitations: conditions that would invalidate the argument.

Goal Structuring Notation (GSN) is one notation for representing claims, strategies, context, assumptions, justifications and evidence. A diagram is not an argument unless evidence actually supports the claims.

## Risk acceptance and lifecycle

Risk acceptance criteria depend on sector, jurisdiction, organizational policy and hazard severity. Do not casually transplant ALARP, SIL, ASARP or risk matrices between sectors. A risk matrix is a prioritization aid; it is not a quantitative probability model. Safety controls must be allocated, implemented, verified, maintained and monitored as the system changes.

## Operational safety

Define safety responsibilities, operator tasks, emergency modes, training, maintenance, anomaly response, incident reporting, configuration control, decommissioning and post-deployment feedback. A safety control that depends on an operator must account for alarm load, time available, information quality, training, fatigue and authority to act.

## Evidence and traceability

Link each hazard to: losses; safety constraints; causal scenarios; allocated controls; requirements; design elements; verification method and result; operational procedures; residual risk; responsible authority; and approved configuration. Reassess when software, data, suppliers, mission profile, personnel, environment or interfaces change.
