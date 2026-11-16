# 91 — Human-machine teaming: autonomy boundaries, control and safety

## Design a team, not a handoff

Human-machine teaming is not achieved by inserting a human approval dialog into an otherwise autonomous pipeline. It requires an explicit model of joint goals, authority, shared situation awareness, communication, task allocation, intervention, training and accountability.

NASA's 2025 aviation memorandum highlights safety questions introduced by increasingly autonomous roles in piloting, air traffic control, maintenance and aviation operations. It warns that task allocation can leave humans without the ability to perform or intervene in their assigned tasks. [S218]

## Define autonomy by authority and consequence

For every automated action, record:

- what the agent/system may observe;
- what it may infer or recommend;
- what it may execute without approval;
- what requires explicit approval;
- what actions are prohibited;
- how an action can be interrupted, reversed or contained;
- who owns accountability and incident response.

Autonomy should be scoped to task, data class, risk, environment, duration and tool permission. It should not silently expand from low-risk tasks to consequential actions because a downstream tool becomes available.

## Human control points

Control points are useful only if they are meaningful. A human may be nominally “in the loop” but lack time, information, authority, interface clarity or training to make a different decision. Design for:

- timely notification with actionable context;
- transparent rationale, uncertainty and provenance;
- explicit acknowledgement and shared state;
- safe pause/abort and escalation;
- clear ownership of execution and monitoring;
- recovery from automation surprise and mode confusion;
- reversible actions where possible;
- workload, alert and skill-retention analysis.

The ACSC agentic-AI guidance adds system-level controls such as least privilege, identity and access management, monitoring, human oversight and phased adoption of agentic harnesses. [S230, S260]

## Allocation of function

Allocate tasks based on capability and risk, not simply “humans do exceptions, automation does routine.” Evaluate task frequency, variability, novelty, time pressure, detectability of errors, consequence, skill degradation, information access, coordination and recovery. A rare emergency task may be the least suitable task to allocate to a human who has been kept out of the loop.

## Evaluation protocol

Measure both system and human performance:

- task success and mission outcome;
- time to detect and recover;
- missed/false alerts;
- human response time distribution;
- intervention rate and intervention success;
- mode errors and loss of situation awareness;
- workload and cognitive demand;
- calibration of trust and reliance;
- recoverability after tool/model failure;
- ability to explain, audit and contest actions.

A benchmark that measures only model accuracy or task completion misses team-level hazards.

## Practical deliverable

Design an autonomous maintenance agent that can diagnose equipment, order parts, schedule technicians and execute safe machine calibration. Define autonomy levels, prohibited actions, permission scopes, escalation triggers, human-visible explanations, rollback, audit events and a set of tests for prompt injection, wrong diagnosis, operator overload and tool outage.

## Source limitations

NASA's report is an aviation technical memorandum, not universal policy. ACSC guidance applies to Australian government/industry cybersecurity practice; adapt to jurisdiction and risk. [S252, S260]
