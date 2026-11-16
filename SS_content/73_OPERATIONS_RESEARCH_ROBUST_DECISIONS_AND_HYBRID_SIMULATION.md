# 73 — Operations research, robust decisions and hybrid simulation

## Operations research supports decisions under constraints

Operations research (OR) applies mathematical modeling, optimization, probability, statistics, simulation and decision analysis to system design and operation. The Operational Research Society's method index covers optimization, queuing, agent-based modeling, forecasting, multicriteria analysis, simulation, system dynamics, supply chain and problem structuring methods [S171].

## Optimization problem anatomy

A decision model should define decision variables, objective(s), constraints, parameter data, uncertainty and feasible set. The mathematical optimum is conditional on that model. Validate whether the modeled objective is the real objective, whether constraints reflect reality, whether parameter estimates are credible and whether the decision is implementable.

## Methods

- Linear and mixed-integer programming for resource allocation, scheduling and network design.
- Nonlinear optimization for nonlinear objectives/constraints.
- Stochastic optimization when uncertain parameters have probability models.
- Robust optimization when solutions must remain acceptable across a defined uncertainty set.
- Multiobjective optimization when objectives conflict; inspect Pareto frontiers rather than hide trade-offs in one arbitrary score.
- Queueing theory for congestion, service capacity, waiting time and utilization.
- Discrete-event simulation for process and queue behavior.
- Agent-based modeling for decentralized actors and adaptive interaction.
- System dynamics for feedback, stocks, flows and delayed effects.
- Monte Carlo simulation for probabilistic propagation and sensitivity.

## Hybrid simulation

Hybrid simulation combines methods such as discrete-event simulation, system dynamics and agent-based modeling. It is appropriate when a problem combines process events, continuous accumulation/feedback and interacting agents. The model should specify how time advances, how submodels exchange state, how feedback is synchronized, and how output validation is performed. A review of hybrid simulation modeling is a useful research anchor [S222].

## Robustness and uncertainty

Perform sensitivity analysis, scenario analysis, stress testing and uncertainty quantification. Distinguish uncertainty in model structure from uncertainty in parameter estimates. Report which assumptions change the preferred alternative. A robust solution may be less optimal under a single forecast but more acceptable across plausible futures.

## Decision analysis workflow

1. Structure the decision and alternatives.
2. Identify objectives and non-negotiable constraints.
3. Define criteria and operational measures.
4. Collect/validate data and specify uncertainty.
5. Select model complexity proportional to decision consequence.
6. Analyze alternatives and trade-offs.
7. Conduct sensitivity, scenario and robustness analysis.
8. Validate with stakeholders and operational evidence.
9. Present recommendation, assumptions, uncertainty and implementation plan.

## Common traps

- Optimize a proxy that stakeholders do not actually value.
- Use weights that conceal non-compensable safety or legal constraints.
- Assume point forecasts instead of distributions or scenario ranges.
- Make model detail larger than data quality supports.
- Confuse a simulation run with a validated prediction.
- Ignore feedback from implementation and change the system without observing outcomes.
