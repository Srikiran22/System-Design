# 118 — Robust decision-making, Bayesian evidence and deep uncertainty

**Depth:** Expert · **Evidence date:** 5 November 2026

## 1. Decision analysis begins with a decision, not an algorithm

Engineering decision analysis should state: the decision authority; decision timing; purpose; objectives; alternatives; constraints; performance measures; uncertainty; consequence of delay; and what evidence would change the choice. The analytical method is selected to support that decision—not because the method is fashionable.

NASA's Risk-Informed Decision Making (RIDM) guidance treats risk as one input to selecting among feasible alternatives and applies a graded level of analysis based on stakes, complexity, uncertainty, multiple attributes and stakeholder diversity [S334]. The NASA Risk Management Handbook explains the relationship between trade studies, uncertainty distributions, risk analysis and decision authority [S336].

## 2. Bayesian evidence integration

Bayesian analysis updates a prior distribution using evidence through Bayes' rule:

\[
p(\theta\mid D,M)=\frac{p(D\mid\theta,M)p(\theta\mid M)}{p(D\mid M)}.
\]

Where:

- \(\theta\) represents uncertain parameters or propositions;
- \(D\) is observed test, field or expert evidence;
- \(M\) is the assumed model structure;
- prior assumptions, likelihood and data quality all influence the posterior.

NASA's Bayesian risk/reliability handbook explicitly aims to combine information from multiple sources into parameter uncertainty distributions for risk and reliability models [S204]. The analyst should document source dependence, selection bias, changes in test conditions, censoring, measurement quality, expert elicitation and prior sensitivity.

### Bayes is not a license to turn weak evidence into certainty

- If the model is wrong, the posterior can be tightly wrong.
- Evidence from a shared test setup, supplier or design lineage may be correlated; do not multiply likelihoods as if independent.
- A prior is a visible assumption, not objective truth.
- Sparse failure data may make prior influence substantial; report this sensitivity explicitly.
- Bayesian updating can quantify what is known under a model; it does not remove structural ignorance.

## 3. Expected value of information (EVI / VOI)

Additional testing, inspection or research is useful when it can change a decision enough to justify its cost and delay. In general form:

\[
EVSI = E_D\left[\max_a E[U(a,\theta)\mid D]\right] - \max_a E[U(a,\theta)]
\]

where EVSI is expected value of sample information, \(a\) is an action, \(U\) is utility / consequence and \(D\) is the possible new data. Net value subtracts acquisition and delay costs. A test with high scientific value may have low decision value if the result will not change the action; a targeted measurement may have high value if it resolves a decision-critical uncertainty.

## 4. Robust Decision Making (RDM)

For deep uncertainty—where stakeholders cannot agree on or confidently assign probabilities to the future—single-point forecasting and expected-value optimization can be brittle. RAND's RDM method focuses on how a candidate strategy performs across many plausible futures and identifies conditions under which it fails. Its core iteration includes decision framing, case generation, vulnerability assessment / scenario discovery and trade-off analysis [S346].

RDM is not the same as Monte Carlo simulation under a well-accepted probability model. The uncertainty sets may be exploratory stress cases rather than probability-weighted futures.

### RDM engineering workflow

1. Frame objectives, constraints, strategies and vulnerable performance thresholds.
2. Build an ensemble of plausible model structures, parameters and external scenarios.
3. Run the candidate strategies across the ensemble.
4. Identify failure regions: combinations of assumptions under which a strategy violates one or more objectives.
5. Determine whether those regions are plausible and whether design changes reduce vulnerability.
6. Compare robustness, cost, performance, flexibility and stakeholder preferences.
7. Select a near-term action and identify signposts that would trigger adaptation.
8. Preserve options where uncertainty is likely to resolve later and the cost of waiting is acceptable.

## 5. Real options and staged commitment

Where design or acquisition decisions are partly irreversible, a staged strategy may have value: prototype, test, hold a modular interface, preserve a second supplier, defer a low-maturity selection, or define a future decision gate. The value is not “always wait”. Waiting can sacrifice learning, readiness or schedule. Compare the cost of delay against the value of information and the ability to adapt.

## 6. Multi-criteria analysis and value judgments

Technical, cost, schedule, safety, maintainability, mission effectiveness, sustainability and stakeholder acceptance may conflict. Weighted-sum methods can hide non-compensable constraints: a low price should not offset violating a safety limit. Separate:

- hard constraints and feasibility gates;
- performance measures with units;
- stakeholder preference weights;
- uncertainty and evidence quality;
- sensitivity of the selected alternative;
- unresolved value judgments requiring decision authority.

## 7. Decision record minimum

Maintain a record of: decision statement; authority; date; alternatives; criteria and definitions; constraints; model/version; data and priors; uncertainty assumptions; analysis and sensitivity; rejected alternatives; trade-offs; selected alternative; conditions of validity; residual risk; evidence gaps; future signposts; revisit trigger; and approval.

## Sources

- [S334] NASA/SP-2010-576, _Risk-Informed Decision Making Handbook_ (NASA, 2010).
- [S336] NASA/SP-2011-3422, _NASA Risk Management Handbook_ (2011).
- [S204] NASA/SP-2009-569, _Bayesian Inference for NASA Probabilistic Risk and Reliability Analysis_ (2009).
- [S346] RAND, _Robust Decision Making_ method guide (deep uncertainty).
