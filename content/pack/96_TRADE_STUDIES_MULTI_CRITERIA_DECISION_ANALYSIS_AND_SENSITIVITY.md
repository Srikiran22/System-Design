# 96 — Trade studies, multi-criteria decision analysis and sensitivity

## A trade study is an auditable decision process

A trade study compares feasible alternatives against explicit stakeholder objectives and criteria. It should produce a repeatable decision record, not merely a score. NASA describes decision analysis as a framework that characterizes alternatives against decision-maker priorities and current knowledge, including expert judgments, preferences, technical performance, cost, schedule and uncertainty. [S269]

## Start with the decision, not the scoring spreadsheet

Define:

- the decision authority and decision deadline;
- the decision to be made and why now;
- the system/mission boundary and operating context;
- hard constraints and non-negotiable requirements;
- stakeholder objectives and conflicting preferences;
- feasible alternatives and the option to defer or gather information;
- uncertainty, risk and reversibility;
- evidence quality and the consequence of a wrong choice.

The solution space should be broad enough to include materially different architectures, not just variations of the preferred design. Alternatives should be rejected for stated feasibility reasons, not omitted because they score poorly.

## Separate constraints from preferences

A hard requirement (e.g., maximum hazardous emissions or mandatory security control) is a feasibility condition. A preference (e.g., lower weight or lower cost) is a trade criterion. Do not allow a weighted score to compensate for violating a hard constraint.

For every criterion define: unit, direction of preference, measurement method, operating condition, uncertainty, threshold, weight rationale and evidence source. Avoid vague criteria such as “flexible” unless decomposed into measurable scenarios.

## Method families

| Method                           | Strength                                                                    | Main caveat                                                                                   |
| -------------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Pugh matrix                      | Rapid relative comparison against a datum; exposes pros/cons                | Ordinal comparisons can hide magnitude and weight effects                                     |
| AHP                              | Hierarchical pairwise comparisons; useful for eliciting relative priorities | Pairwise judgments and consistency can be burdensome; rank reversal/weight sensitivity matter |
| Kepner-Tregoe                    | Separates musts from wants; useful for structured choice                    | Scoring remains dependent on chosen factors and ratings                                       |
| Weighted sum / utility model     | Transparent quantitative aggregation where scales are justified             | Normalization and compensability can mislead; weights are value judgments                     |
| Pareto analysis                  | Identifies non-dominated options without forcing one score                  | Does not select a single option without preferences or constraints                            |
| Cost-benefit / lifecycle cost    | Links alternatives to economic consequence                                  | Discounting, boundary, uncertainty and non-monetized values matter                            |
| Robust / stochastic optimization | Evaluates uncertainty and variability directly                              | Model/data effort and decision-maker interpretation can be difficult                          |

NASA's comparison of Pugh, AHP and Kepner-Tregoe shows that methods can rank the same alternatives differently because their logic and weighting differ. This is not a bug to conceal; it is a reason to test how the result depends on method assumptions. [S276]

## Sensitivity and robustness tests

After computing a preferred option:

1. vary criteria weights over plausible ranges;
2. vary uncertain performance/cost parameters;
3. change normalization methods and datum options;
4. test correlated criteria to avoid double-counting;
5. test alternative stakeholder preference sets;
6. identify where ranking changes and what drives the reversal;
7. determine whether more information is likely to change the decision.

A robust choice performs acceptably across plausible conditions, not merely optimally at one point estimate.

## Decision record structure

- decision statement and authority;
- boundary, use cases and assumptions;
- constraints and criteria definitions;
- alternative descriptions and elimination rationale;
- analysis models/data and validation;
- scoring method and weighting basis;
- results, sensitivity and uncertainty;
- risks, dependencies and reversibility;
- recommendation and dissenting views;
- approvals, implementation actions and conditions for reopening.

NASA's decision-analysis process expects a report that preserves the decision, alternatives, criteria, assumptions, method and results. [S269]

## Common traps

- false precision in scores;
- hidden double-counting of quality attributes;
- asymmetric evidence across options;
- sunk-cost bias and premature commitment;
- confusing “lowest cost” with “best lifecycle value”;
- treating subjective inputs as objective measurement;
- ignoring the no-action/defer alternative;
- not reopening the decision after new evidence.

## Practical deliverable

Compare a modular monolith, microservices platform and managed SaaS option for a regulated workflow. Define hard constraints, at least eight criteria, a Pugh matrix and a second method (AHP or utility scoring). Vary weights and two major uncertainty assumptions. Identify whether the winner is robust and what evidence would change the decision.

## Source limitations

NASA process guidance and the trade-study survey are methods and examples, not mandatory universal scoring recipes. The correct method depends on stakes, time, evidence and stakeholder diversity. [S269, S276]
