# 87 — Human reliability analysis: tasks, dependence, context and uncertainty

## Human reliability is a system-modeling problem

Human reliability analysis (HRA) estimates or characterizes how human actions and interactions contribute to system availability, safety or mission performance. It must not be reduced to assigning a universal “human error probability.” The analysis depends on the task, procedure, interface, training, workload, time pressure, cues, organizational setting, recovery opportunities and dependencies among actions.

HRA is commonly integrated with probabilistic risk assessment (PRA): identify human failure events, perform qualitative analysis, quantify where justified, and integrate the results into the overall risk model. IAEA guidance describes this iterative flow for nuclear installations. [S264]

## Start with task and context analysis

Before assigning probabilities, define:

1. the operational task and intended objective;
2. the cue or condition that initiates the task;
3. operator information and interface presentation;
4. required decisions and action sequence;
5. available time and workload;
6. procedure quality and usability;
7. training, staffing, fatigue and experience assumptions;
8. possible errors, omissions, timing errors and wrong actions;
9. dependencies between tasks and between operators;
10. recovery, detection and mitigation opportunities.

Use hierarchical task analysis, cognitive task analysis, timeline analysis, human-machine interface review and operational scenario analysis as appropriate. A checklist may describe the steps but fail to expose diagnosis, uncertainty, competing goals or mode confusion.

## Method families

HRA methods include THERP, HEART, SPAR-H, ATHEANA and other context-specific approaches. They differ in error taxonomy, dependence assumptions, performance shaping factors, data basis and quantification logic. They are not interchangeable calculators.

Typical performance-shaping factors include available time, stress, complexity, experience/training, procedures, ergonomics, displays, team communication, task interruption and work environment. Analysts must preserve method-specific factor scales and dependencies rather than casually combining factors from different methods.

## Dependence matters

A repeated action is not necessarily independent of the prior action. Dependence can arise from shared cues, the same operator, common procedure, same interface, common training, common workload, common equipment or repeated erroneous mental model. Treating dependent actions as independent can produce overconfident risk estimates.

The analysis should state whether dependence is considered, how it is represented and what empirical or expert-judgment basis supports the assumption. Where data are sparse, a sensitivity range may be more honest than a precise point estimate.

## Limits of HRA quantification

The NRC NUREG/CR-1278 handbook provides models and estimated human-error probabilities for nuclear safety applications, but it is an older technical report and its fetch was blocked in this research pass. Do not imply that its values are current or universally applicable. [S265]

Probability estimates may not capture organizational drift, novel tasks, automation surprise, adversarial conditions, learning, adaptive strategies or changes in staffing and work practices. Qualitative analysis and scenario testing remain essential even when a quantitative model is available.

## HRA and automation design

Do not allocate all routine tasks to automation and leave humans only exceptional recovery tasks without preserving situation awareness and intervention skill. NASA's 2025 review of human-machine teaming in aviation discusses safety challenges arising when autonomy changes roles and task allocation. [S218]

Design controls include:

- transparent system state and rationale;
- bidirectional communication and acknowledgement;
- explicit authority and responsibility boundaries;
- predictable mode transitions;
- timely, actionable alerts rather than alert volume;
- training and rehearsal for off-nominal events;
- meaningful human control points and ability to pause/abort;
- protection against unmanageable workload and loss of skill.

## Practical deliverable

Analyze an operator's response to a pressure-control alarm in a plant. Build task and timeline models, identify three human failure events, list performance-shaping factors, model two dependent actions, estimate a plausible uncertainty range and propose interface/procedure/design changes that reduce reliance on perfect operator response.

## Source limitations

IAEA and NRC documents are nuclear-focused. HRA methods must be selected and calibrated for the system, population and operational context; estimated human-error probabilities are not portable constants. [S264, S265]
