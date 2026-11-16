# 88 — Risk, uncertainty, model validation and value of information

## Separate aleatory variation from epistemic uncertainty

Risk estimates inherit assumptions from system boundaries, event definitions, data, models and expert judgments. Aleatory uncertainty represents variability treated as stochastic within the model; epistemic uncertainty represents lack of knowledge about parameters, structure or conditions. The distinction depends on the analyst's model and can change when new knowledge becomes available.

A single point estimate hides uncertainty. For high-consequence decisions, show uncertainty distributions or ranges, sensitivity to assumptions, and whether the decision changes under plausible alternatives.

## Model credibility is an evidence chain

A model used to support a design or safety decision should document:

- intended purpose and decision context;
- conceptual model and system boundary;
- assumptions, abstractions and omitted phenomena;
- governing equations/logic and software implementation;
- parameter sources and calibration;
- verification that the model is implemented correctly;
- validation against independent data or phenomena where possible;
- uncertainty characterization and sensitivity;
- applicability domain and conditions where extrapolation is unsafe.

Verification asks whether the model was implemented as intended. Validation asks whether it is adequate for its intended use. A model may be numerically stable and correctly coded yet still be inappropriate for the decision.

## Quantitative risk workflow

1. Define the top event or loss and the decision threshold.
2. Construct scenarios and dependencies (fault tree, event tree, Bayesian network or other structure).
3. Identify data and model uncertainty separately.
4. Estimate parameters with provenance and uncertainty distributions.
5. Quantify the model and test sensitivity to dominant assumptions.
6. Identify risk-important events and contributors.
7. Evaluate alternative designs and mitigation packages.
8. Determine whether more information could change the decision.
9. Document residual risk and decision authority.

PRA methods provide an organized way to represent scenarios, likelihood and consequences. NASA PRA guidance and Bayesian reliability material provide foundational methods; model validity remains a separate problem from calculating a risk number. [S203, S204]

## Sensitivity and importance are not the same as decision value

A parameter can have strong mathematical influence on a risk metric but may not change the decision. Conversely, a parameter with modest sensitivity may determine whether a threshold is crossed. Value-of-information analysis asks whether additional information is worth acquiring because it could change the decision or the preferred mitigation. The decision threshold, cost of information, delay and consequences matter.

## Value-of-information procedure

- define the available decisions and their consequences;
- describe uncertainty over relevant states of the world;
- compute expected outcome for each decision under current information;
- evaluate the expected outcome if additional information were available;
- compare the expected benefit with the cost, delay and side effects of acquiring information;
- test robustness to model alternatives and uncertainty assumptions.

Do not interpret expected value as a substitute for hard safety constraints or legal obligations. Some decisions are constrained by mandatory requirements regardless of economic value.

## Simulation and probabilistic validation

Where a model predicts a complex physical or operational process, quantify predictive uncertainty and compare it against an acceptance criterion appropriate for the decision. Probabilistic validation research distinguishes uncertainty in model prediction from acceptance of that uncertainty for a specified use. [S267]

Use independent validation data where possible. Repeatedly tuning a model to the same dataset and then calling fit a validation result is circular.

## Practical deliverable

Compare two redundancy options for a critical subsystem. Build a fault tree, include a common-cause event, use uncertain failure parameters, calculate an uncertainty range, identify top contributors, and conduct a value-of-information analysis for one proposed qualification test. State whether the decision changes under credible prior distributions and model structures.

## Source limitations

The cited NASA and NRC documents provide method guidance, while the value-of-information paper is a specific research approach. Do not treat any one quantitative method as universally required or sufficient. [S203, S204, S267]
