# 57 — Operations research, optimization and simulation

## Purpose

Operations research (OR) applies mathematical modeling, statistics, optimization and simulation to decisions about complex operations and resource constraints. It supports, rather than replaces, engineering judgment: model outputs depend on problem formulation, data, assumptions and objectives. The Operational Research Society's method map includes optimization, simulation, queuing, decision analysis, forecasting, agent-based modeling and problem-structuring approaches. [S171, S172]

## Method families

| Method                                | Question answered                                                         | Common use                                                  | Key limitation                                                         |
| ------------------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------- |
| Linear programming                    | Best allocation under linear objective and constraints?                   | Capacity, blending, scheduling, resource allocation         | Linearity and data assumptions may be unrealistic                      |
| Mixed-integer optimization            | Which discrete choices plus continuous quantities optimize the objective? | Facility placement, fleet, project selection and routing    | Computational difficulty; model size and optimality gap matter         |
| Nonlinear optimization                | Best solution when relationships are nonlinear?                           | Control, process and engineering design                     | Local minima, nonconvexity and sensitivity                             |
| Robust optimization                   | Which decision remains feasible across a defined uncertainty set?         | Supply, capacity and safety-margin planning                 | Conservative if uncertainty set is too broad or mis-specified          |
| Stochastic optimization               | How should decisions account for probabilistic scenarios?                 | Inventory, energy, service capacity and finance             | Probability estimates and scenario coverage may be unreliable          |
| Multi-criteria decision analysis      | How compare options with conflicting objectives?                          | Architecture trade studies, supplier choices, policy design | Weights and utility assumptions can hide value judgments               |
| Queueing theory                       | How do arrival rates, service capacity and variability create queues?     | Support centers, compute clusters, hospitals, logistics     | Simplifying arrival/service assumptions can mislead                    |
| Discrete-event simulation             | How does a process evolve through events and resource contention?         | Manufacturing, service operations and network systems       | Model calibration and event logic determine usefulness                 |
| System dynamics                       | How do feedback, accumulation and delay shape behavior over time?         | Policy, workforce, projects, inventory and market feedback  | Qualitative loops require quantitative calibration for forecasting     |
| Agent-based modeling                  | How do local rules/interactions produce system-level patterns?            | Markets, mobility, networks and adaptive behavior           | Agent rules and validation are difficult; emergent output is not proof |
| Monte Carlo / uncertainty propagation | How do uncertain inputs affect output distributions?                      | Risk, reliability, cost and schedule                        | Independence and distribution assumptions are often the weak point     |

## Formulate a decision model

1. Define the decision owner, decision horizon and objective.
2. State the system boundary, entities, resources and constraints.
3. Separate decisions (controls) from uncertain parameters and observed outcomes.
4. Write objective functions and constraints in operational units.
5. Identify infeasibility conditions and hard safety/legal constraints.
6. Validate inputs with owners; identify missingness, bias, time drift and dependency.
7. Solve a baseline model and inspect whether the solution is plausible.
8. Compare with a simple heuristic, status quo and alternative scenarios.
9. Run sensitivity/robustness analysis and identify decision thresholds.
10. Pilot, observe and update the model with actual operational data.

## Queueing and capacity design

For a stable single-server queue under idealized M/M/1 assumptions, utilization is \(\rho=\lambda/\mu\), where arrival rate \(\lambda\) is lower than service rate \(\mu\). As utilization approaches 1, expected waiting time rises sharply. Real systems have multiple servers, batching, priority classes, heavy-tailed service times, retries and correlated bursts; use the simple model to build intuition, not to forecast without testing assumptions.

Connect Little’s Law \(L=\lambda W\) to measured throughput, work-in-progress and time in system. It is an accounting identity for a stable system over a consistent boundary, not a shortcut for arbitrary nonstationary behavior.

Capacity decisions must include headroom, failover, degraded modes, maintenance windows, demand spikes and recovery traffic. A system with enough average capacity can still collapse under tail latency or correlated retry storms.

## Decision analysis and architecture trade studies

MCDA should expose, not hide, the value judgments in a choice. Record criteria definitions, weights, evidence quality, uncertainty ranges and veto constraints. Perform sensitivity analysis: if a small weight change reverses the ranking, the choice is fragile and should trigger more evidence or a reversible experiment.

Use decision trees when choices unfold over time and future information may change the best action. Real options matter when a modular or staged architecture preserves the ability to delay, expand or reverse an investment.

## Simulation verification and validation

A simulation is a model, not reality. Validate: conceptual structure; equations; input data; implementation; numerical behavior; output plausibility; and applicability to the decision. Use expert review, historical back-testing, boundary tests, conservation checks, extreme-condition tests and independent replication where possible.

Record model version, random seed, scenario, data snapshot, software version, parameter provenance, calibration result and known limitations. Avoid false precision: show ranges, confidence and sensitivity, not only a point estimate.

## Practice

Model a campus shuttle operation with uncertain demand, multiple vehicles, traffic delays, charging windows and accessibility constraints. Compare fixed schedules, dynamic dispatch and pooled demand. Produce assumptions, LP/MIP formulation or simulation, baseline, sensitivity, service-level measures, cost and failure scenario. Explain what data would invalidate the model.

## Sources

[S28, S50, S146, S147, S171, S172]
