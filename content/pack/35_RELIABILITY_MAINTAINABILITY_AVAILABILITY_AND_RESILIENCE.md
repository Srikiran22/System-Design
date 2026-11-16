# 35 — Reliability, maintainability, availability and resilience engineering

## Define the mission before computing reliability

Reliability is the probability that an item/system performs a required function without failure for a specified interval under stated conditions. Availability concerns readiness to perform when needed; maintainability concerns how effectively it can be restored or retained in service. Resilience concerns sustaining or recovering critical function under disturbance. These are related but not interchangeable. [S75, S76]

## Measures and their limits

- **MTTF:** mean time to failure for non-repairable items under stated assumptions.
- **MTTR:** mean time to repair/restore; define whether it excludes detection, diagnosis, logistics, access and restart.
- **MTBF:** commonly used for repairable items; not a guaranteed lifetime or a complete probability distribution.
- **Availability:** for a simple steady-state repairable model, approximately `MTBF / (MTBF + MTTR)`. This estimate assumes defined repairable behavior and does not capture scheduled maintenance, logistics delay, common-cause failure, demand mode, load or service-level semantics.
- **Failure rate / hazard rate:** may vary over lifecycle; constant-rate assumptions are not universal.
- **Reliability at time t:** requires an assumed lifetime distribution and failure mechanism; exponential models are not universally appropriate.
- **Weibull parameters:** shape and scale can represent increasing, decreasing or approximately constant hazard, but fitted data and censoring assumptions matter.

## Analysis methods

| Method                       | Primary question                                                    | Strength                                                | Limitation                                                              |
| ---------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------------- |
| FMEA / FMECA                 | How can each function/item fail and what are effects/criticality?   | Systematic bottom-up review                             | Can miss interactions, unsafe controls and unknown failure combinations |
| Fault Tree Analysis          | What combinations can cause a top event?                            | Top-down logical model; quantitative where data support | Requires valid Boolean structure and probability assumptions            |
| Reliability Block Diagram    | What combinations of component success deliver function?            | Architecture-level series/parallel modeling             | Simplifying independence and static-state assumptions can mislead       |
| Weibull / life data analysis | What is failure behavior over time?                                 | Aging and reliability-growth insight                    | Requires representative data and censoring/usage understanding          |
| FRACAS                       | How are field/test failures reported, analyzed and corrected?       | Learning loop and corrective-action ownership           | Fails if closure is administrative rather than causal                   |
| Reliability growth           | Is reliability improving through test/fix cycles?                   | Tracks observed maturity                                | Results depend on test exposure, scoring and fix incorporation          |
| Physics of failure           | Which physical mechanisms drive degradation?                        | Links design stresses to failure                        | Needs material, thermal, mechanical, electrical or chemical expertise   |
| Maintainability analysis     | How can diagnosis, access, repair and logistics affect restoration? | Exposes repair-time contributors                        | A nominal repair task time understates real operational downtime        |

NASA's fault-tree handbook and DoD/Navy reliability guides provide detailed methods; the 2025 R&M Body of Knowledge broadens lifecycle coverage. [S133, S135, S136]

## Redundancy is not independence

Two units are not independent if they share a power feed, cooling, network, DNS, identity, software defect, environmental exposure, supplier, configuration pipeline, operator procedure or maintenance error. Common-cause analysis asks whether one initiating event can defeat multiple channels. Diversity can reduce correlated design faults, but heterogeneous systems add training, integration and maintenance costs. [S134]

## Defense in depth

A layered defense should have different failure modes, independently testable controls, explicit ownership and a recovery path. For a critical data service, layers may include: preventive input validation; transactional integrity; replication; immutable backups; access isolation; monitoring; anomaly detection; restore drills; manual reconciliation; and business continuity procedures. The layers must not share one hidden dependency. Defense in depth is a system property, not a checklist count.

## Degraded modes and graceful degradation

Define which functions must continue, which may be reduced, and which must fail safely. Examples: read-only mode; reduced recommendation features; offline cache; queue new requests; limit high-cost analytics; preserve emergency stop; or disable untrusted integrations. Degraded mode needs user communication, recovery criteria, data reconciliation and an exit condition.

## Maintainability and supportability

Design for diagnostics, modular replacement, clear interfaces, access, standard tools, spare parts, training, documentation, configuration status, repair safety, test equipment, logistics and software updates. Maintainability is partly an architecture property and partly an operational/logistics capability.

## Resilience engineering

Resilience must be evaluated against plausible disruptions: loss of supplier, staff, data center, identity plane, communications, power, control system, critical data, or a simultaneous demand surge. Consider anticipatory capacity, monitoring, response, adaptation and learning. A system that returns to baseline but cannot learn from recurring precursors is not strongly resilient.

## Metrics that should be paired

Pair availability with user-visible success; MTTR with incident detection and restore-test results; reliability prediction with test/field evidence; failure count with exposure; recovery objective with observed recovery; redundancy count with common-cause analysis; and service health with data integrity. Avoid maximizing a metric in isolation.
