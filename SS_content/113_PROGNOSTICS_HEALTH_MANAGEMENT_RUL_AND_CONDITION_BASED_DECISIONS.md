# 113 — Prognostics and health management: RUL, uncertainty and maintenance decisions

**Depth:** Expert · **Evidence date:** 5 November 2026

## 1. Prognostics is a system capability, not a life-prediction chart

Prognostics estimates future health evolution and, often, the remaining useful life (RUL) of a component or subsystem. The result is conditional on the present health state, the failure / functional-loss definition, the intended operating profile, future loads and environmental conditions. A credible estimate is not simply “hours remaining”; it is a probability distribution or interval connected to a decision and its consequences.

ISO 13381-1:2025, Edition 3, is the current published edition as of this snapshot. It provides guidance and requirements for the development and application of prognosis processes and replaces the withdrawn 2015 edition [S323].

## 2. PHM architecture and data path

A practical PHM architecture can be decomposed into:

1. **Sensing and acquisition:** sensors, sampling, time synchronization, calibration status, operating context and sensor health.
2. **Pre-processing:** filtering, synchronization, missing-data treatment, quality flags and signal conditioning.
3. **Feature extraction:** statistics, frequency features, learned embeddings, physical parameters or condition indicators.
4. **Detection:** distinguish expected operating variation from abnormal behavior.
5. **Diagnosis / isolation:** estimate the fault mode, location, severity and uncertainty.
6. **Health-state estimation:** infer hidden state and degradation parameters from observations.
7. **Prognosis:** propagate the health state under future usage scenarios to a functional-loss / end-of-life boundary.
8. **Decision management:** schedule inspection, maintenance, replacement, load reduction, reconfiguration, derating or continued operation.
9. **Feedback and learning:** compare predicted and actual outcomes, capture maintenance findings and update model credibility.

NASA PHM materials distinguish the data-to-feature-to-diagnosis-to-prognostics-to-decision path and describe health-based and usage-based prognostics [S324–S325].

## 3. Health-based versus usage-based prediction

- **Health-based prognosis:** uses online observations to detect an incipient fault, estimate its state and forecast its progression. It is highly dependent on observability, model validity and sufficient degradation data.
- **Usage-based prognosis:** projects life consumption from the usage history and an assumed future profile, even when an observable fault has not yet emerged. It depends on the damage model and the accuracy of future usage assumptions.
- **Hybrid prognosis:** combines physics, usage, inspections and data-driven learning. Fusion is only useful if the evidence sources, dependence and disagreement are modeled.

A “trend” that extrapolates one signal to a threshold is not necessarily a prognostic model. Prognosis needs a model of degradation evolution, functional loss and future conditions [S324].

## 4. RUL is a conditional distribution

Define a functional-loss event, for example:

\[
T_f=\inf\{t: g(x(t),u(t))\geq 0\},
\]

where \(x(t)\) is the latent health state, \(u(t)\) is future usage / environment and \(g\) describes the loss-of-function threshold. Given the present data \(D_t\), the remaining useful life is a distribution for \(T_f-t\):

\[
P(RUL\leq r\mid D_t,\;u_{future},\;M,\;g).
\]

This form forces the analyst to state the conditional future profile, model choice \(M\), and failure criterion \(g\). A 90% RUL interval can widen substantially when the future workload is unknown or when degradation mechanisms compete.

## 5. State estimation and prediction algorithms

NASA research compares nonlinear filtering approaches for model-based prognostics, including Daum filtering, unscented Kalman filtering and particle filtering [S325]. The algorithm choice depends on dynamics, observability, nonlinearity, noise distribution, computational budget, measurement frequency and the required uncertainty representation.

| Approach                        | Useful when                                            | Main limitation                                                                |
| ------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------ |
| Kalman filter                   | Approximately linear dynamics, Gaussian noise          | Linear/Gaussian assumptions may be poor                                        |
| EKF / UKF                       | Nonlinear dynamics with tractable state representation | Approximation quality and consistency must be tested                           |
| Particle filter                 | Nonlinear, non-Gaussian posterior distributions        | Computational load, particle degeneracy and resampling effects                 |
| Physics-based degradation model | Known mechanisms and stress/usage relationships        | Model-form uncertainty and unmodeled mechanism risk                            |
| Data-driven / ML                | Sufficient representative data and stable domain       | Distribution shift, data leakage, sparse failure labels and weak extrapolation |
| Hybrid / physics-informed       | Combining mechanistic and empirical evidence           | More interfaces, calibration burdens and potential correlated errors           |

## 6. Uncertainty budget

At minimum, distinguish:

- **State / initial-condition uncertainty:** what is the component's current damage state?
- **Parameter uncertainty:** uncertain degradation rates or material parameters.
- **Model-form uncertainty:** omitted mechanisms, wrong differential equations, wrong thresholds.
- **Measurement uncertainty:** sensor noise, calibration drift, missing samples, synchronization and feature-extraction error.
- **Load / usage uncertainty:** unknown future duty cycle, environment, operator behavior or mission plan.
- **Population variability:** unit-to-unit and manufacturing variation.
- **Decision / intervention uncertainty:** maintenance may change the trajectory but may also introduce defects.

Do not present a narrow interval that excludes known uncertainty sources. NASA work on prognostics uncertainty specifically treats state estimation and future-state prediction as separate stages and demonstrates Bayesian state tracking and uncertainty propagation [S326].

## 7. Validation and operational acceptance

A PHM algorithm needs test evidence beyond retrospective fit:

- verify implementation and numerical behavior;
- validate sensor and data quality assumptions;
- test detection/diagnostic confusion and missed-detection risk;
- evaluate prognostic calibration and interval coverage;
- test prediction performance over a realistic range of degradation modes and future profiles;
- evaluate early-life, mid-life, terminal and sparse-failure cases;
- test domain shift, environmental extremes and sensor failure;
- inject faults on testbeds where safe and feasible;
- assess decision utility, not just prediction error;
- monitor post-deployment drift and track actual maintenance outcomes.

Metrics should include false alarms, missed detection, detection lead time, RUL absolute/relative error, interval coverage/calibration, prognostic horizon, decision cost and availability impact. Choose metrics based on the actual operational decision.

## 8. Tools and reproducible implementation

NASA's ProgPy is an open-source Python framework for defining and building prognostic models and algorithms, including state estimation, prediction and uncertainty propagation. It is suitable as a practical lab substrate, not as an automatic substitute for application-specific model verification/validation [S327]. Record package version, model assumptions, test data provenance, algorithm settings and the exact functional-loss threshold.

## Sources

- [S323] ISO 13381-1:2025, Edition 3, published September 2025.
- [S324] NASA PHM Society tutorial, _Introduction to Prognostics_ (2012).
- [S325] Daigle, Saha and Goebel, _A Comparison of Filter-based Approaches for Model-based Prognostics_ (NASA conference paper, 2012).
- [S326] NASA prognostics uncertainty framework paper and NASA prognostics research.
- [S327] NASA ProgPy repository and versioned project documentation.
