# 81 — Expert-level systems engineering exercises and synthesis

These exercises are intended to test reasoning, evidence quality and lifecycle integration, not recall of terminology. State assumptions, define boundaries, show alternatives, quantify where possible and identify what evidence would falsify the recommendation.

## Exercise 1 — Mission effectiveness under a contested environment

Create a mission thread and two MET alternatives. Define MOE, MOP and MOS separately. Model one degraded communications scenario and one adversarial scenario. Specify the run matrix, data provenance, uncertainty and decision threshold. Explain which result would reverse your recommendation.

## Exercise 2 — CSH boundary critique for a data platform

Map who defines success, who pays, who controls platform resources, whose data semantics prevail, who is excluded and who bears the effects of errors. Contrast actual and preferred boundaries. Then use SODA/SSM to negotiate options. Do not collapse disagreements into a single weighted score prematurely.

## Exercise 3 — Requirements evidence graph

For a safety-relevant product, build an end-to-end graph from mission objective to stakeholder need, requirement, architecture element, hazard control, verification test, validation scenario and operational measure. Inject a requirement change and show its impact on interfaces, tests, suppliers, training and baseline.

## Exercise 4 — Consensus protocol correctness

Specify a replicated state machine with failure assumptions. State safety and liveness properties. Model leader changes, message loss, delayed messages and stale clients. Show how idempotency keys, fencing and durable logs prevent duplicate business effects. State which assumptions the proof does not cover.

## Exercise 5 — Reliability with common-cause failure

Design a redundant service with two compute regions, shared identity, DNS and deployment control plane. Construct a fault tree including shared dependencies and estimate risk under illustrative assumptions. Show why nominal component redundancy overstates mission availability. Propose independent recovery and explain its cost.

## Exercise 6 — STPA and safety case

Define losses, hazards and safety constraints for an autonomous industrial machine. Draw the control structure; identify unsafe control actions across wrong timing/order, omission, commission and duration. Create causal scenarios, derive requirements and build a claim–argument–evidence structure.

## Exercise 7 — Data migration cutover

Migrate a transactional system while writes continue. Specify snapshot, CDC, ordering, duplicates, delete semantics, schema evolution, backfill, reconciliation, cutover and rollback. Define acceptance metrics beyond row counts. Inject a delayed event and prove that the result remains correct.

## Exercise 8 — Agentic AI security

Threat-model an agent with browser, code execution, memory and API tools. Map all OWASP ASI01–ASI10 risks. Design a split between planning, policy, authorization and execution. Test prompt injection, memory poisoning, tool misuse, privilege drift, multi-agent spoofing and cascading failure. Define human approval thresholds and containment evidence.

## Exercise 9 — Human-machine teaming

Allocate decision functions between operator and automation under time pressure. Define observability, predictability, directability, takeover and safe-stop requirements. Design representative evaluations under workload, degraded sensors, false alarms and automation surprise. Identify where human oversight is nominal rather than effective.

## Exercise 10 — Robust lifecycle decision

Compare a low initial-cost architecture with a higher initial-cost alternative. Include supportability, spares, maintenance, obsolescence, cyber resilience, training, decommissioning and environmental effects. Use uncertainty ranges rather than single point estimates. Identify the value of additional information.

## Capstone — Evidence-backed architecture review

Deliverables:

- stakeholder/problem boundary map;
- ConOps and mission/system context;
- requirements and quality scenarios;
- architecture alternatives and decision records;
- interface and dependency map;
- risk register, threat model and hazard analysis;
- verification/validation strategy and evidence matrix;
- deployment/operations/recovery concept;
- lifecycle cost/supportability/sustainability analysis;
- source register with fetch/review status;
- red-team review and unresolved assumptions.

**Scoring rubric:** problem framing 15%; requirements and evidence 15%; architecture alternatives/trade-offs 20%; safety/security/reliability 20%; integration and operations 10%; lifecycle economics 10%; provenance and clarity 10%. Safety-critical shortcomings are disqualifying regardless of aggregate score.
