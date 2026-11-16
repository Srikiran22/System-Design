# 71 — Human systems integration, automation and cognitive engineering

## The operator is part of the engineered system

A system's boundary includes human roles, information, workload, procedures, training, authority, incentives and organizational interfaces when they affect the mission. Automation can improve consistency and speed while also creating new failure modes: loss of situation awareness, automation surprise, mode confusion, over-trust, under-trust, skill decay, alert overload and responsibility gaps.

## Joint cognitive systems

Cognitive systems engineering treats human and technical resources as a joint system that coordinates to achieve work under changing conditions. Distributed cognition asks how information and cognition are distributed across people, tools, artifacts, procedures and environment. Analyze the work as performed, not only the nominal procedure.

## Human-machine teaming design properties

A useful system should expose what the automation is doing, what it intends to do, why it is doing it, what state it believes the environment is in, what it can and cannot do, and how the human can intervene. Human-machine teaming guidance highlights observability, predictability, adaptability and directability as important design considerations [S216]. NASA research documents automation surprises and their role in accidents and incidents [S217].

## Human-task analysis

1. Identify mission/work goals and operational conditions.
2. Observe work in context; interview operators and maintainers.
3. Identify decisions, information needs, time constraints and interruptions.
4. Analyze workload, vigilance, communication, handoffs and authority.
5. Identify failure modes such as mode error, missed detection, automation surprise or workload saturation.
6. Allocate functions between human and automation with explicit rationale.
7. Define interface, feedback, override, recovery and training requirements.
8. Test with representative users, workload and degraded conditions.
9. Monitor after deployment and update procedures/training/design as the work changes.

## Automation allocation

Do not allocate a task to automation solely because it can be automated. Consider performance, safety, explainability, variability, reversibility, uncertainty, skill retention, failure detection, workload and accountability. A human approval button does not provide meaningful oversight if the person lacks time, context or authority to reject the action.

## Measures

Potential measures include task completion, error/recovery rate, response time, workload, interruption cost, situation awareness, trust calibration, takeover latency, false alarm/miss rate, training retention and performance under degraded conditions. Define measurement method and operational validity; subjective trust ratings alone are insufficient.

## Human-machine team lifecycle

Treat training, procedures, staffing, maintenance and organizational readiness as enabling products with their own requirements, verification and sustainment. Re-evaluate when autonomy level, user population, work tempo, interface, alerting, mission or environment changes. Human-machine teaming research in aviation highlights the need for reproducible evidence and safety assurance for new role allocations [S218].

## Failure patterns

- “Human in the loop” means only that a person clicks approve.
- The human sees output but not system confidence, provenance or uncertainty.
- Multiple automated systems each assume a different operator owns the recovery.
- Alerts are technically correct but arrive too late or too often to be useful.
- The operator cannot safely stop, override or recover from automation.
- Training assumes normal operation while incidents occur in degraded modes.
