# 36 — System safety, hazard analysis and safety assurance

## Safety is about unacceptable harm, not merely component failure

A hazard is a system condition that, together with an environment or circumstance, can lead to loss. An accident or loss can occur even when each component behaves according to its local specification. Safety analysis must therefore examine unsafe interactions, control actions, requirements, operators, environment and lifecycle—not only failed parts.

## Safety lifecycle

1. Define system purpose, operating context, intended and foreseeable uses, stakeholders and losses.
2. Identify hazards and hazardous system states early.
3. Establish safety constraints and safety requirements.
4. Allocate constraints to architecture, subsystems, software, hardware, procedures, operators and external interfaces.
5. Select and conduct analyses appropriate to system maturity and domain.
6. Verify that requirements and controls are implemented correctly.
7. Validate the overall system in representative operations and abnormal conditions.
8. Build and maintain a safety argument with evidence, assumptions and residual risk.
9. Monitor incidents, near misses, changes, new modes, obsolescence and operational drift.

## Method selection

- **FMEA/FMECA:** bottom-up item/function failure modes, local/global effects, detection and criticality. Useful early; can miss hazards arising without component failure.
- **Fault Tree Analysis:** top-down combinations of events leading to a defined top event. Requires carefully defined gates, dependencies and probability data.
- **Event Tree Analysis:** forward branching from an initiating event through barrier successes/failures to outcomes.
- **HAZOP:** structured guideword review of deviations in process variables and operating intent; common in process industries.
- **Bow-tie:** organizes threats, top event, preventive barriers, consequences and mitigative barriers. It is clear for barrier communication but can oversimplify nonlinear causal interactions.
- **STPA:** system-theoretic hazard analysis based on unsafe control actions and inadequate control/feedback. Useful where hazards emerge from interactions, software logic, operators or complex control structures. [S77, S134]
- **Job/task hazard analysis:** examines human tasks and work conditions; not a substitute for system-level hazard analysis.

Use more than one technique when the risk and architecture justify it. Methods answer different questions; they are not interchangeable scores.

## STPA essentials

Model the control structure: controllers, control algorithms, actuators, controlled processes, sensors, feedback and external disturbances. Identify unsafe control actions in categories such as: a required control action not provided; an unsafe action provided; a control action provided too early/late or in the wrong order; or an action applied too long/too briefly. Derive safety constraints and scenarios that explain why feedback, process models, timing or control authority could be inadequate.

## Safety requirements

A safety requirement should identify a hazard/loss link, operating mode, trigger, response, timing, fault assumptions and verification evidence. Safety requirements should be allocated and traced to design, interfaces, software/hardware, procedures and training. Avoid a single generic phrase such as “the system shall be safe.”

## Functional safety and standards

IEC 61508 is a foundational functional-safety standard family for electrical/electronic/programmable electronic systems. Sector adaptations include IEC 61511 in process industries, ISO 26262 in road vehicles, IEC/EN machinery safety standards, and domain-specific aviation and medical-device regimes. These standards have separate scopes, terminology and certification/assessment arrangements. Do not copy a SIL or ASIL target from another domain or assign it as a generic risk score. [S132]

Other domain-specific examples to investigate according to product jurisdiction and intended use include aerospace system development/safety assessment standards (ARP4754/ARP4761), airborne software/hardware assurance (DO-178/DO-254), medical-device risk management (ISO 14971) and medical software lifecycle (IEC 62304). Check current revisions and local regulatory adoption before contractual or certification decisions.

## Safety cases and assurance arguments

A safety case is a structured claim-argument-evidence chain. A top-level claim might say that the system is acceptably safe for a defined operational context. Subclaims address hazards, requirements, design, verification, validation, operations and assumptions. Evidence may include test reports, analyses, inspection records, competence records, maintenance procedures and field data. Explicitly record defeaters, assumptions, residual risks and conditions of use.

## Human and organizational contributors

Operator workload, alarm quality, interface ambiguity, automation surprise, shift handovers, training, staffing, procedures, incentives and maintenance access can affect safety. “Human error” should trigger investigation of system conditions, not become the endpoint of analysis.

## Safety review checklist

- Losses, hazards, operating modes and foreseeable misuse are explicit.
- Safety constraints exist at system and interface level.
- Analyses match the system maturity and domain.
- Dependencies and common-cause risks are examined.
- Safety-critical software/hardware and external interfaces have assurance evidence.
- Human-system interaction and operational procedures are validated.
- Changes, updates, suppliers and decommissioning are covered.
- Residual risk is accepted by an authorized owner with evidence.
