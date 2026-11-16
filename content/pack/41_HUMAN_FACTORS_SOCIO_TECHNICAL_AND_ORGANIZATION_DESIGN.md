# 41 — Human factors, socio-technical systems and organization design

## The operator is part of the system

A system includes the people who operate, maintain, approve, configure, supervise, support and are affected by it. Human performance is shaped by interface design, workload, incentives, staffing, training, procedures, authority, organizational culture and environmental conditions. Treating people as external “users” or describing an incident as human error without examining system conditions is incomplete systems analysis.

## Human Systems Integration (HSI)

HSI integrates human capabilities and limitations into system design. Core concerns include human factors engineering, manpower/personnel, training, human-computer interface, safety, habitability, workload, accessibility and organizational readiness. The exact HSI domains vary by industry and program. Consider the full work system: tasks, tools, physical environment, information, team coordination, shift handover, maintenance and abnormal operations.

## Human-centered architecture questions

- What must a person perceive, decide and do, under which workload and time pressure?
- What happens when an alarm is missed, misunderstood or arrives too late?
- Can the operator distinguish normal, degraded, unsafe and recovery states?
- Does automation create mode confusion or remove meaningful feedback?
- Are manual overrides safe, authorized and tested?
- Are workflows compatible with fatigue, interruptions and training levels?
- Does the system design shift invisible work onto support staff or customers?

## Socio-technical congruence

Technical dependencies and social coordination needs can be compared: teams that must coordinate should have mechanisms to communicate and resolve coupled changes. Research on socio-technical congruence finds relationships with software build outcomes but also reports context-specific exceptions; higher congruence is not always a universal predictor of success. [S143]

Conway's Law is best treated as a design hypothesis: communication structures influence the systems organizations create. The reverse direction also matters—architecture changes can alter team boundaries, ownership, incentives and coordination load. Do not reorganize teams solely to mimic a diagram without examining actual product boundaries and capabilities.

## Team Topologies and cognitive load

Common team patterns include stream-aligned teams, platform teams, enabling teams and complicated-subsystem teams. Their value depends on the product domain, skills and interaction modes. A platform team should provide an internal product and reduce repeated cognitive load; a platform can also increase cognitive load if its abstractions are opaque or its golden path blocks legitimate needs.

## Organization and architecture evolve together

Architecture creates work queues, integration dependencies, release coordination, service ownership and on-call responsibilities. A modular architecture paired with aligned team ownership can improve change flow in some contexts, while a service mesh of tiny teams can increase coordination overhead. The Martin Fowler case documents one organization-specific improvement after aligning modular boundaries and teams; treat the reported numbers as a case, not a universal causal estimate. [S142]

## Incentives and local optimization

Metrics influence behavior. Optimizing story points can create fragmentation; uptime targets can encourage hiding incidents; utilization targets can create queues; security compliance counts can reward paperwork; low cloud cost can externalize reliability risk. Design measurement and incentives around system outcomes, guardrails and learning—not one proxy metric.

## Human factors in safety and security

Design for alarm management, situational awareness, authorization clarity, secure recovery, accessible controls and understandable failure states. Security controls that are unusable invite workarounds; safety procedures that conflict with production incentives will be bypassed. Include operators and maintainers in design reviews and realistic validation.
