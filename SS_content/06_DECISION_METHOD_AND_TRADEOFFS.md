# 06 — Decision method and trade-offs

## What makes a design “best” for a situation?

The best design is the simplest viable design that satisfies prioritized stakeholder outcomes and hard constraints across the relevant lifecycle, with acceptable risk and a credible path to change. It is not necessarily the design with the most services, newest database, most cloud services, or highest theoretical scalability.

## A repeatable selection method

1. **Define one decision.** Example: “Should checkout hold inventory synchronously, or create a time-limited reservation asynchronously?” Keep unrelated choices separate.
2. **Establish context.** Capture outcome, workload/data profile, critical quality thresholds, constraints (budget, date, expertise, law, legacy), operating model, time horizon, and reversibility.
3. **List at least three real options.** Include the simple baseline, an option optimized for the main driver, and an alternative that challenges assumptions. Avoid straw men.
4. **Use identical comparison criteria.** Requirements fit, correctness, performance, availability, security, modifiability, delivery time, operations, cost, reversibility, and evidence strength.
5. **Apply hard gates.** Unacceptable safety, security, legal, privacy, or data-integrity risk cannot be compensated by scores elsewhere.
6. **Find sensitivities.** What small change in workload, staffing, latency, or data volume would reverse the choice?
7. **Prototype the dangerous assumption.** Test performance, automation, contract compatibility, migration duration, or recovery. Use realistic access patterns, not toy benchmarks.
8. **Record and revisit.** Write an ADR with choice, rejected options, consequences, evidence, owner, and review trigger.

## Example comparison matrix

| Criterion                     | Example weight | Evidence                                           |
| ----------------------------- | -------------: | -------------------------------------------------- |
| Critical journey correctness  |           Gate | Invariant, concurrency tests, reconciliation       |
| Security and privacy          |           Gate | Threat model, controls, verification               |
| Availability / recovery       |             20 | Fault tests, failure-domain design, restore tests  |
| Performance / scale           |             15 | Load test, capacity estimate, tail latency         |
| Modifiability / team autonomy |             15 | Change scenarios, ownership map, coupling evidence |
| Delivery / time to market     |             15 | Implementation plan, team familiarity              |
| Operating complexity          |             15 | On-call plan, toil estimate, runbooks              |
| Cost / sustainability         |             10 | Unit economics, cost model, utilization            |

Weights must be set by stakeholders. This is a decision aid, not a formula for objective truth. Use ranges and confidence when evidence is weak.

## Architecture Tradeoff Analysis Method (ATAM)

The Software Engineering Institute's ATAM evaluates architecture against quality goals and surfaces risks/trade-offs. A typical workshop: present method; business drivers; architecture; architectural approaches; build/prioritize a quality-attribute utility tree; analyze high-priority scenarios; brainstorm and prioritize additional scenarios; re-analyze; report findings and risk themes.

Outputs include approaches, scenarios, risks, non-risks, sensitivity points, trade-off points, and risk themes [S09]. A lightweight version is useful for normal projects; formal workshops suit high-stakes or complex systems.

## Architecture Decision Records (ADR)

Use one ADR per significant decision. Include title/status/date, context, decision drivers, options, decision/rationale, positive and negative consequences, risks, assumptions, evidence, owners, and revisit triggers. Do not record every minor implementation detail unless it has cross-cutting consequences.

## Reversible and irreversible decisions

- Delay hard-to-reverse choices when uncertainty is high and delay cost acceptable.
- Use reversible experiments for uncertain capabilities.
- Make security, data integrity, and compliance decisions early enough to avoid expensive retrofit.
- “We can change it later” is not credible when migration needs data conversion, contract changes, customer coordination, or downtime.

## Problem-solving method for design or production issues

1. **Observe:** symptom, affected journey, time window, evidence.
2. **Bound:** system area, dependencies, failure domain.
3. **Quantify:** errors, latency, throughput, queue age, saturation, blast radius.
4. **Reconstruct:** timeline and request/dependency path.
5. **Generate hypotheses:** separate facts from guesses; list multiple explanations.
6. **Find bottleneck or feedback failure:** scarce resource, amplifier, queue, boundary mismatch.
7. **Contain safely:** limit blast radius before redesigning during an incident.
8. **Test prediction:** define expected signal and side effects.
9. **Recover and reconcile:** restore service and data correctness, not just green dashboards.
10. **Learn structurally:** add controls, tests, runbooks, and design changes.

## Review questions

- Which requirement proves this component needs to exist?
- Which measured bottleneck does this pattern address?
- What new dependency/failure mode does it introduce?
- What if traffic is 10x lower or higher?
- What must be strongly consistent and what may be stale?
- How is partial success detected and reconciled?
- Is fallback truly independent?
- Can a team deploy and operate this without constant coordination?
- What is cost per successful user operation?
- What evidence would reverse this decision?

**Core reading:** CMU SEI ATAM [S09], _Designing Software Architectures: A Practical Approach_, _Software Architecture in Practice_ [S03].
