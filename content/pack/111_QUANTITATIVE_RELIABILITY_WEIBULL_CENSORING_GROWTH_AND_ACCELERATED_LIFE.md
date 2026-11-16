# Quantitative Reliability: Weibull, Censoring, Reliability Growth and Accelerated-Life Testing

**Depth:** expert reliability engineering and statistical evidence.  
**Purpose:** interpret reliability data and claims without treating MTBF as a universal or self-explanatory measure.

## 1. Start with the type of system and question

Reliability statistics depend on the stochastic process and the physical system:

- **Non-repairable population:** time to first failure is commonly modeled with a life distribution (exponential, Weibull, lognormal, etc.).
- **Repairable system:** recurrent failure events over operating exposure may be modeled as a counting process, often with a time-varying intensity during development or growth.
- **Degrading system:** condition or performance may deteriorate continuously; threshold-crossing, degradation and physics-of-failure models can be more appropriate than an independent constant hazard model.
- **Fleet / field population:** units may differ in age, configuration, mission profile, maintenance, environment and use; pooled data may not be identically distributed.

State the estimand before calculating: probability of surviving a mission, failure intensity per operating hour, availability, life percentile, reliability growth, warranty risk, or a decision threshold. These are related but not interchangeable.

## 2. Exponential and Weibull lifetime models

### Exponential model

For a constant failure rate \(\lambda\):

\[
R(t)=e^{-\lambda t},\qquad F(t)=1-e^{-\lambda t},\qquad h(t)=\lambda.
\]

The mean life is \(1/\lambda\) for the exponential time-to-failure model. This model assumes a constant hazard over the modeled interval. It can be useful for a stable useful-life regime, but it does not describe infant mortality or wear-out without additional structure.

### Two-parameter Weibull model

\[
R(t)=\exp\left[-\left(\frac{t}{\eta}\right)^\beta\right]
\]

\[
f(t)=\frac{\beta}{\eta}\left(\frac{t}{\eta}\right)^{\beta-1}R(t),\qquad
h(t)=\frac{\beta}{\eta}\left(\frac{t}{\eta}\right)^{\beta-1}.
\]

- \(\eta\) is scale/characteristic life. At \(t=\eta\), the cumulative failure probability is about 63.2% for the two-parameter form.
- \(\beta\) is the shape parameter. For this model, \(\beta<1\) gives a decreasing hazard, \(\beta=1\) reduces to the exponential model, and \(\beta>1\) gives an increasing hazard.
- The mean is \(\eta\,\Gamma(1+1/\beta)\).

The shape interpretation is conditional on the selected model and data population; it does not identify a physical mechanism by itself. A mixture of failure modes, changing environment, repairs or population heterogeneity can distort the inferred hazard trend. A three-parameter Weibull adds a location/threshold parameter, but estimating that extra parameter requires strong physical justification and adequate data; otherwise it can overfit.

## 3. Censoring is data, not a missing-value nuisance

Reliability tests frequently end before every test unit fails. Treating survivors as if they failed at the end time biases life estimates.

- **Type I right censoring:** test duration \(T\) is set in advance; the number of failures is random; surviving units are known to have survived at least to \(T\).
- **Type II right censoring:** the test stops after a pre-set number of failures; duration is random.
- **Interval/readout censoring:** failure is known to have occurred within an interval, but exact time is not observed.
- **Left truncation / delayed entry:** a unit enters observation after surviving to an earlier age; the risk set must account for that entry time.

For each unit, preserve whether an observation is a failure, right-censored survival, interval-censored, withdrawn or missing for another reason. Do not silently code “not failed by shutdown” as an actual failure.

### Mode-specific censoring

If one component can fail by several mutually distinguishable modes, an analysis of mode A can treat other-mode failure times as competing/censored observations only under assumptions appropriate to the estimand and censoring process. Competing risks and dependence need to be considered; simply dropping other modes can create biased estimates.

## 4. Estimation and confidence bounds

- **Probability plotting** is useful for exploratory diagnosis and communicating distribution fit, but plotting positions and censoring adjustments matter.
- **Maximum likelihood estimation (MLE)** can use exact failures and censored observations and is often more precise/flexible than simple graphical estimation. It needs appropriate software, a defensible distribution and enough information in the data.
- **Kaplan–Meier/product-limit estimation** gives a non-parametric survival estimate under its censoring assumptions.
- **Confidence intervals/bounds** are needed when a reliability claim drives safety, contract acceptance or lifecycle investment. A point estimate hides sample size and uncertainty.

### Simple zero-failure demonstration example

For \(n\) independent, identical, non-repairable units tested to mission time \(T\), if zero failures occur, a one-sided lower confidence bound for survival probability at confidence \(1-\alpha\) is:

\[
R_L(T)=\alpha^{1/n}.
\]

Equivalently, to demonstrate a target reliability \(R_0\) with zero failures at one-sided confidence \(1-\alpha\), the required sample size satisfies:

\[
n\geq\frac{\ln(\alpha)}{\ln(R_0)}.
\]

This is a simple binomial demonstration calculation. It assumes independent identical units and the same specified mission duration. It does not automatically apply to repairable systems, heterogeneous fleets, censored exposure of differing duration, correlated units, or non-constant hazards.

For an exponential constant-rate model with total accumulated test exposure \(T_{tot}\) and zero failures, the one-sided upper confidence bound on the failure rate is \(-\ln(\alpha)/T_{tot}\). The associated lower bound on MTBF is \(T_{tot}/[-\ln(\alpha)]\). This calculation depends on the constant-rate exponential assumption; it is not a distribution-free MTBF guarantee.

## 5. Reliability growth during development

Reliability growth is improvement due to identification and correction of failure mechanisms during test, analysis and redesign. It should be managed as an engineering feedback loop:

1. define reliability requirements and the growth objective;
2. define exposure, operational profile, failure definition and data capture;
3. plan test events and corrective-action windows;
4. record every relevant failure and configuration;
5. perform root-cause analysis and assess whether the cause is design, process, supplier, operation or test artifact;
6. implement corrective action and verify it;
7. track observed growth and compare with planning curves;
8. assess whether failures have moved, been masked, changed mode or been removed from the dataset;
9. decide whether achieved reliability is adequate for deployment and what residual risk remains.

### Crow–AMSAA / power-law process

A common repairable-system reliability-growth model uses a non-homogeneous Poisson process with cumulative mean failures:

\[
m(t)=\lambda t^\beta,
\qquad
\rho(t)=\frac{dm(t)}{dt}=\lambda\beta t^{\beta-1}.
\]

For this parameterization, \(0<\beta<1\) corresponds to a decreasing failure intensity over cumulative test exposure (growth); \(\beta=1\) is constant intensity; \(\beta>1\) is increasing intensity. Other sources may parameterize the model differently, so confirm parameter definitions before comparing estimates.

The model is useful for describing growth under assumptions about exposure and process behavior. It does not establish that the system will continue to improve in field use, that corrective actions were effective, or that the fleet matches the tested configuration. A good fit to a cumulative-failure curve is not proof of a sound reliability growth programme.

## 6. Accelerated-life testing (ALT)

ALT applies elevated stress to induce failures sooner, then extrapolates to use conditions using a physical/statistical acceleration model. Possible stress dimensions include temperature, voltage, humidity, vibration, pressure, cycling and mechanical load.

For a thermally activated failure mechanism, an Arrhenius-type acceleration factor is commonly written:

\[
AF=\exp\left[\frac{E_a}{k}\left(\frac{1}{T_{use}}-\frac{1}{T_{stress}}\right)\right],
\]

where temperatures are absolute (Kelvin), \(E_a\) is the activation energy and \(k\) is Boltzmann's constant. The equation is meaningful only when the assumed mechanism/model applies. Other degradation mechanisms require other stress/life models (for example power-law or strain-cycle relations).

Before extrapolating, establish:

- the same dominant failure mechanism operates at stress and use conditions;
- the stress range does not create a different failure mode;
- acceleration factor and parameter uncertainty are quantified;
- failure modes are classified rather than pooled indiscriminately;
- the use environment and mission profile are represented;
- censoring and competing risks are treated correctly;
- the model has validation evidence or physical justification.

A very high stress can produce fast failures that are irrelevant to normal use. “More accelerated” is not always “more informative.”

## 7. Physics of Failure (PoF)

NASA's Methodology for Physics of Failure-Based Reliability Assessments Handbook (NASA/SP-20230004376, Version 1.0.3, June 2024) frames PoF as using knowledge of an item's design/condition, stresses, processes and failure mechanisms to predict reliability or life. It cautions that no single PoF model can represent every failure mode. The analyst needs to characterize the plausible mechanisms through experimental and/or theoretical physics.

A PoF assessment should identify the failure mechanism, relevant stressor, material/geometry/process variables, physical model, parameter evidence, uncertainty and validated domain. It is complementary to statistical life-data analysis and reliability prediction, not a guaranteed replacement.

## 8. Component prediction versus system reliability

IEC 61709:2017 provides reference conditions and stress models for converting electrical-component failure-rate data from reference conditions to actual operating conditions within defined component functional limits. It does **not** supply universal base failure rates. Base rates must come from other data sources; conversion requires appropriate stress and mission assumptions.

Do not multiply component reliability values blindly to claim system reliability. That calculation requires correct system structure (series/parallel/standby), independence, load sharing, switching success, common-cause failure, repair strategy, mission time and dependency assumptions.

## 9. Field reliability data architecture

ISO 14224:2016 provides a standard data basis for reliability and maintenance in petroleum, petrochemical and natural gas industries. It standardizes equipment, failure and maintenance data, including failure mode/cause/consequence, actions, resources and downtime. It was reviewed/confirmed in 2022 and remains published/current in the ISO record.

A high-quality field data schema should preserve:

- equipment hierarchy, type, manufacturer, part number and configuration;
- operating age, exposure, cycles, mission profile and environment;
- event timestamp, failure mode, cause, mechanism and consequence;
- detection source, operational symptoms and diagnostic confidence;
- corrective action, parts, labor, repair time and restoration time;
- whether the event is a functional failure, demand failure, degradation or nuisance trip;
- censoring, missingness, exposure denominator and data provenance;
- controlled taxonomies and change history.

Bad data definitions, inconsistent boundaries and inconsistent event capture can make sophisticated statistical models misleading.

## 10. MTBF and availability: what not to claim

- MTBF is not the same as a component's guaranteed lifetime.
- A high MTBF under a constant-rate model does not rule out early-life or wear-out failures.
- For a repairable system, MTBF estimates depend on event definition, exposure, repair policy and population.
- Availability depends on both failure and restoration processes (plus logistics, spares, access and support arrangements), not just failure rate.
- A fleet average hides tail behavior, configuration differences and mission-specific exposure.
- A prediction model is not field evidence; field data is not a guarantee for a changed configuration.

## 11. Review checklist

1. Is the target metric defined precisely (mission reliability, failure intensity, life percentile, availability or reliability growth)?
2. Is the system repairable or non-repairable for the chosen model?
3. Are failure times, censoring, withdrawals and exposure denominators recorded correctly?
4. Are failure modes modeled separately where appropriate?
5. Does the distribution fit the data and the physical mechanism?
6. Are confidence bounds and parameter uncertainty reported?
7. Is the acceleration model physically justified and validated?
8. Are growth-model assumptions and corrective-action effectiveness tested?
9. Are dependencies/common-cause mechanisms represented at system level?
10. Are data taxonomy and configuration sufficiently controlled for reproducibility?

## Sources

- [NIST Engineering Statistics Handbook — Weibull model](https://www.itl.nist.gov/div898/handbook/apr/section1/apr162.htm)
- [NIST — Censored reliability data](https://www.itl.nist.gov/div898/handbook/apr/section1/apr131.htm)
- [NIST — Parameter estimation from censored data](https://www.itl.nist.gov/div898/handbook/apr/section4/apr41.htm)
- [NIST — Lognormal/Weibull reliability test planning](https://www.itl.nist.gov/div898/handbook/apr/section3/apr312.htm)
- [MIL-HDBK-189C official DLA ASSIST record](https://quicksearch.dla.mil/qsDocDetails.aspx?ident_number=53928) — Reliability Growth Management; revision C, notice 1 validation, active record.
- [NASA/SP-20230004376 — Physics of Failure-based Reliability Assessments](https://ntrs.nasa.gov/api/citations/20230004376/downloads/20230004376.pdf)
- [IEC 61709:2017](https://webstore.iec.ch/en/publication/28554)
- [ISO 14224:2016](https://www.iso.org/standard/64076.html)
- [SAE JA1011_202411](https://saemobilus.sae.org/standards/ja1011_202411-evaluation-criteria-reliability-centered-maintenance-rcm-processes)

**Limit:** the NIST handbook is methodological guidance; MIL-HDBK-189C is a defense handbook; ISO 14224 is domain-specific; IEC 61709 is an electrical component reference-condition/stress-model standard; SAE JA1011 defines RCM process criteria. None provides a universal failure rate table that can be transplanted into every system.
