# 101 — Reliability-centered maintenance: task selection and supportability engineering

## Maintenance is a consequence-management decision

Reliability-centered maintenance (RCM) selects failure-management strategies based on functions, functional failures, failure modes, effects and consequences. It is not simply increasing preventive maintenance frequency. A maintenance task should be technically applicable and effective for the failure mode and consequence being managed.

DoD Manual 4151.25 (effective 16 February 2024) establishes DoD RCM policy and programme responsibilities. The DoD R&M Body of Knowledge and NASA lifecycle logistics guidance connect R&M engineering with design, supportability, test, product support and lifecycle cost. [S234, S75, S77, S169]

## RCM analysis sequence

1. Define system functions and required performance.
2. Identify functional failures (failure to meet required function).
3. Identify failure modes and causes.
4. Determine failure effects at local, system and mission levels.
5. Classify consequences: safety/environmental, operational, non-operational/economic, or hidden failure functions.
6. Identify feasible proactive tasks (on-condition, scheduled restoration, scheduled discard) and default actions.
7. Test applicability and effectiveness of each task.
8. Select task interval and resource requirements.
9. Document the maintenance programme, data needs, roles and review triggers.

## Applicability and effectiveness

An on-condition task is useful when a detectable potential failure condition exists, the P-F interval is reasonably consistent, inspection can occur at appropriate intervals, and enough time remains to act before functional failure. Inspection frequency must be shorter than the usable P-F interval, adjusted for uncertainty and consequence. A task that detects degradation but offers no feasible response is not effective by itself.

Scheduled restoration/discard tasks depend on whether age-related failure patterns and task economics justify the action. If no proactive task is applicable/effective, default actions may include failure-finding for hidden functions, redesign, or run-to-failure for acceptable consequences. High-consequence tasks require stronger evidence and controls.

## Supportability design features

Design for accessibility, modular replacement, standardization, commonality, interchangeability, built-in test, fault isolation, diagnostics, calibrated tools, repairability, training, technical data, spare provisioning, packaging and facilities. A theoretically reliable subsystem may still produce poor operational availability if it is difficult to isolate, repair or obtain parts for.

## Integrated Product Support

The S-Series IPS specifications connect technical publications, material management, logistics support analysis, preventive maintenance, in-service feedback, training and integrated product support. S1000D addresses technical publications; S2000M material management; S3000L logistics support analysis; S4000P preventive maintenance; S5000F in-service data feedback; S6000T training; SX000i integrated product support architecture. [S262]

## Measures

Track mission availability, operational availability, mean downtime, mean time to repair, maintenance labor hours, supply delay, fault isolation time, scheduled/unscheduled maintenance ratio, false alarm rate, task effectiveness, repeat-failure rate and lifecycle support cost. Interpret MTBF/MTTR using their event/repair definitions, censoring, operating environment and repairability assumptions.

## Practical deliverable

Choose five failure modes in a mobile robotics fleet. Perform functional failure analysis, consequence classification, task selection and intervals, fault isolation, spares/training needs, and a field-data feedback loop. Include one hidden function and one failure mode for which redesign is preferable to preventive maintenance.

## Source limitations

RCM policy and task logic should be tailored to equipment, safety case, data quality and regulator/customer requirements. Individual S-Series specifications have their own usage terms and should be obtained from the official owner. [S234, S262]
