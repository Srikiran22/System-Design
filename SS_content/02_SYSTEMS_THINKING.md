# 02 — Systems thinking

## Purpose

Systems thinking explains why a problem persists after repeated local fixes. It studies relationships, feedback, accumulations, delays, nonlinear effects, boundaries, incentives, and whole-system behavior over time. Use it when problems cross teams/components, recur, create unintended consequences, or resist simple cause-and-effect explanations.

## Major concepts

### System, purpose, boundary, environment

A system has elements, relationships, and a purpose/function. The boundary determines what the model includes. The environment contains external actors and conditions that influence it. Stakeholders may define purpose differently; expose the disagreement instead of silently selecting one viewpoint.

### Stocks and flows

A **stock** is an accumulation at a point in time: inventory, queued messages, database connections, unresolved defects, technical debt, cash, or support cases. A **flow** changes the stock: arrivals, completions, purchases, cancellations, fixes, withdrawals.

`Change in stock = inflows − outflows` over the chosen time interval.

A backlog grows when arrival rate exceeds completion rate. More workers help only until coordination, onboarding, or another bottleneck dominates. Request rate alone is insufficient; include queue age and completion rate.

### Feedback loops

- **Reinforcing loop (R):** change feeds itself and amplifies direction. Example: latency → retries → load → more latency. It can also be positive, such as users → content → value → users.
- **Balancing loop (B):** a response pushes the system toward a target or limit. Example: queue grows → autoscaler adds workers → capacity rises → queue shrinks.

A balancing loop may fail when response is delayed, capped, or driven by a misleading metric.

### Delays, nonlinearity, thresholds

Delays occur in autoscaling startup, cache refresh, replication, hiring, adoption, and incident detection. Delayed control can overshoot or oscillate. Nonlinear systems behave differently at different operating points: near saturation, queues and contention can make latency rise sharply; a cache may help only when reuse is high.

### Emergence and adaptation

System-level behavior can arise from local rules. Users adapt to UI friction; attackers adapt to security controls; teams route around slow processes; services retry failures; traffic shifts during degradation. Consider actor responses, not just initial behavior.

### Leverage points and path dependence

A **leverage point** is an intervention in structure/rules that can produce a large effect: changing an information signal, access rule, interface, queue admission policy, team ownership, or incentive. **Path dependence** means earlier schema, API, migration, team, or vendor choices constrain future options. Prefer reversible decisions when uncertainty is high.

## Tools

| Tool                     | What it reveals                                       | When to use                              |
| ------------------------ | ----------------------------------------------------- | ---------------------------------------- |
| Iceberg model            | Events → patterns → structures → mental models        | Recurring symptoms                       |
| Behavior-over-time graph | Variable change, delay and oscillation                | Queue, incidents, churn, costs, adoption |
| Causal-loop diagram      | Reinforcing and balancing feedback                    | Complex cause chains and side effects    |
| Stock-flow diagram       | Accumulations, inflows, outflows, capacity limits     | Backlogs, inventory, budgets, pools      |
| Connection circle        | Relationships before formal loop modeling             | Early exploration                        |
| Rich picture             | Actors, concerns, tensions, boundaries                | Ambiguous socio-technical problems       |
| Ladder of inference      | How observation becomes assumption/action             | Disagreement and incident analysis       |
| Scenario analysis        | System behavior under different futures               | Growth, regulation, demand uncertainty   |
| Soft Systems Methodology | Multiple viewpoints and contested problem definitions | Wicked organizational/product problems   |

Resources: Donella Meadows Project [S04], System Dynamics Society [S05], Waters Center [S06], Open University [S07].

## Practical analysis sequence

1. State the problem in neutral, measurable terms.
2. Draw the boundary; list what is included and excluded.
3. Identify actors, goals, incentives, resources, constraints, information flows.
4. Graph important variables over time, not only a snapshot.
5. Identify stocks and flows: where does work accumulate and what limits outflow?
6. Map causal links; mark reinforcing/balancing loops and delays.
7. Identify unintended consequences of the proposed fix.
8. Search for leverage points in rules, incentives, information, capacity, interfaces, goals.
9. Propose an intervention and a testable prediction.
10. Observe after enough time for the relevant delay to pass.

## Software/product examples

**Retry storm:** dependency slows → clients retry → dependency load rises → latency/failures increase. Faster retry makes it worse. Break the loop with bounded retry budgets, exponential backoff with jitter, circuit breakers, load shedding, queue limits, and capacity controls.

**Support backlog:** confusing workflow → user errors → tickets → support workload → less time for product fixes → confusing workflow persists. Simplifying workflow or fixing a data contract may outperform hiring more agents.

**Technical debt:** shortcut improves delivery now → change cost rises later → less time for structural improvement → delivery slows → more shortcuts. Fund debt reduction against measurable product risk and change frequency.

## Systems thinking is not

- Adding complexity to every problem.
- Drawing a large causal diagram without testing relationships.
- Claiming every incident has one root cause.
- Replacing engineering analysis with metaphors.
- Ignoring individuals because “the system made them do it.”

A systems model guides inquiry; it must remain open to contradictory evidence and alternative explanations.

## Practice

Model a campus food delivery service: students, vendors, riders, payments, kitchens, maps, weather, support, peak demand, refunds, incentives. Draw a stock-flow model for pending orders and a causal loop for late deliveries. Propose an intervention, predict second-order effects, and name the variables required to test it.
