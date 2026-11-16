# 28 — Problem framing and systems methodologies

## The problem is part of the design

A design can be technically elegant and still solve the wrong problem. Problem framing defines what is inside the system boundary, whose needs count, which outcomes matter, which constraints are binding, and what evidence would show success. Treat a problem statement as a hypothesis to be revised, not a fixed sentence from a sponsor.

## A rigorous framing sequence

1. **Observe the system:** collect events, behavior-over-time, operational data, complaints, failure reports, workarounds, queues, costs and constraints.
2. **Separate symptom from mechanism:** a missed service target may be caused by arrival variability, capacity, handoff delay, poor incentives, rework, or demand shaping—not necessarily slow code.
3. **Map stakeholders and affected parties:** include users, operators, maintainers, owners, suppliers, regulators, adjacent systems and groups bearing external costs.
4. **State the system-of-interest and context:** boundary, environment, upstream/downstream dependencies, assumptions, exclusions and interfaces.
5. **Describe current and desired behavior:** measures of effectiveness, behavior-over-time, operational scenarios and failure conditions.
6. **Generate multiple solution classes:** technical, process, policy, human, data, organizational and hybrid alternatives.
7. **Select a method fit for the problem:** choose a model or inquiry method based on uncertainty, disagreement, dynamic behavior and available evidence.
8. **Validate the framing:** seek disconfirming evidence and ask affected stakeholders whether the model describes the actual problem.

## Method selection map

| Method                                          | Best fit                                                     | Principal output                                                        | Main risk                                                         |
| ----------------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Systems engineering / lifecycle analysis        | Engineered product with lifecycle and assurance obligations  | Needs, requirements, architecture, verification and validation evidence | Process compliance replacing technical insight                    |
| System dynamics                                 | Feedback, delays, accumulation and long-term policy behavior | Causal model, stock-flow model, policy scenarios                        | Poor equations or weak validation create false confidence         |
| Soft Systems Methodology                        | Multiple stakeholders disagree about what the problem is     | Rich picture, purposeful activity models, feasible changes              | Can remain qualitative without action or measurement              |
| Critical systems heuristics / boundary critique | Power, inclusion, legitimacy and contested system boundaries | Explicit boundary judgments and affected-party analysis                 | Requires facilitation and openness about power                    |
| Operations research                             | Optimization under explicit objectives and constraints       | Mathematical optimization, queueing, allocation                         | Objective function may omit important social or lifecycle effects |
| Design thinking / human-centered design         | User experience, desirability and workflow discovery         | Research insights, prototypes, journey maps                             | Prototype preference can be mistaken for operational feasibility  |
| Scenario planning                               | High uncertainty and several plausible futures               | Scenario set, stressors, robust strategies                              | Scenarios mistaken for forecasts                                  |
| Pre-mortem / failure analysis                   | Decision risk and hidden assumptions                         | Failure narratives, causes, mitigations                                 | Team may focus on familiar failures only                          |

## Quantitative decision support

Use a decision method appropriate to the decision's reversibility, cost and uncertainty.

- **Weighted trade study:** define criteria, measures, weights and evidence; score alternatives with confidence bands; show sensitivity to weights.
- **Cost-benefit analysis:** identify lifecycle costs and benefits, discounting assumptions, externalities, risk and distribution of impact. Avoid false precision where probabilities are unknown.
- **Multi-criteria decision analysis:** preserve separate criteria rather than hiding them inside one score. Test rank reversal and weight sensitivity.
- **Analytic hierarchy process:** useful for structured pairwise judgments; watch for inconsistent comparisons and spurious numerical precision.
- **Real-options reasoning:** value the ability to defer, stage, pilot, switch or expand when uncertainty is high and decisions are partly irreversible.
- **Robust decision-making:** seek options that remain acceptable across plausible futures rather than optimizing one forecast.

## Decision record requirements

For every consequential choice capture: decision statement; context and date; decision owner; stakeholders consulted; constraints; options considered; criteria and measurement method; evidence; assumptions; rejected alternatives and reasons; risks accepted; reversibility; triggers for reconsideration; and links to requirements, models and tests.

## Causal reasoning discipline

A causal hypothesis should specify a mechanism and a time order. Ask whether a confounder could explain the relationship, whether there is a selection effect, and whether a proposed intervention changes the claimed mechanism. Correlation in logs, dashboards or business metrics is not automatically causal evidence.

## When to stop framing and start building

Move from inquiry to an experiment when the boundary is sufficiently stable, a measurable outcome exists, high-impact assumptions are identified, and a low-cost experiment can discriminate among competing explanations. Do not delay all action until certainty; use reversible probes and update the model.

## Practice

Choose a recurring system failure—missed deliveries, API latency, support backlog or student attendance. Produce: system boundary; stakeholder map; behavior-over-time chart; two competing causal explanations; one quantitative model; one soft-systems or boundary critique; three solution classes; weighted trade study; and an experiment designed to falsify the preferred explanation. See [46 — Review playbook](46_ARCHITECTURE_PROBLEM_SOLVING_AND_REVIEW_PLAYBOOK.md). [S04, S05, S146, S147]
