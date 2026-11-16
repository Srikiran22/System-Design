# 112 — Repairable-system dependability, Markov models and availability engineering

**Depth:** Expert · **Evidence date:** 5 November 2026

## 1. Start with the right mathematical object

A non-repairable population and a repairable system are not the same statistical problem.

- **Non-repairable item:** after its first failure it leaves the population. Its time-to-first-failure is modeled with a lifetime distribution (exponential, Weibull, lognormal, and others). The central quantities are the survival function, hazard rate and lifetime quantiles.
- **Repairable system:** after a failure it is restored, replaced in part, reconfigured or otherwise returned to service. The data are recurrent event times. A rate of occurrence of failures (ROCOF) or repair rate describes the expected event intensity. Reusing a non-repairable hazard model on the sequence of failures can produce incorrect conclusions.

NIST explicitly separates lifetime distributions from repair-rate models and describes homogeneous Poisson and non-homogeneous Poisson models for repairable systems [S318–S320].

## 2. Homogeneous Poisson process (HPP)

For a constant event intensity \(\lambda\), cumulative failures in exposure time \(t\) follow

\[
N(t)\sim\operatorname{Poisson}(\lambda t),\qquad E[N(t)]=\lambda t.
\]

Inter-arrival times are independent exponential random variables with mean \(1/\lambda\). This model is appropriate only when the rate is reasonably stable over the interval, the event process assumptions are defensible, and the definition of exposure is consistent. A calendar-time denominator can be wrong where usage, duty cycle, environment or mission profile changes.

HPP is not proof that a system is “constant-rate” in every operating regime. Plot recurrent-event counts and inter-arrival data, inspect trends and change points, stratify different modes and operating populations, and investigate whether repairs are minimal or restore-as-good-as-new. A maintenance policy or redesign can change the process during the observation window.

## 3. Non-homogeneous Poisson process and Crow–AMSAA

The power-law NHPP uses the expected cumulative failure count

\[
M(t)=a t^b,\qquad a>0,\;b>0,
\]

with intensity / ROCOF

\[
m(t)=\frac{dM(t)}{dt}=ab t^{b-1}=\alpha t^{-\beta},\quad \beta=1-b.
\]

Interpretation of the exponent:

| Parameter region         | Process interpretation   | Engineering reading                                               |
| ------------------------ | ------------------------ | ----------------------------------------------------------------- |
| \(b=1\), \(\beta=0\)     | Constant event intensity | No modeled reliability growth or deterioration                    |
| \(0<b<1\), \(0<\beta<1\) | Decreasing intensity     | Reliability-growth pattern under continuing corrective action     |
| \(b>1\), \(\beta<0\)     | Increasing intensity     | Deterioration, wear, worsening exposure, or changing event regime |

NIST calls the power-law NHPP the Duane / AMSAA model in reliability-growth contexts [S319–S320]. Do not confuse this recurrent-event process with a two-parameter Weibull population lifetime distribution simply because the time to the first event has a Weibull form. The models answer different questions.

The model presumes a coherent cumulative test-time or exposure basis and a sufficiently stable event-generation mechanism. If engineering changes, fixes, test intensity or exposure definition changes, segment the data or model the intervention explicitly. A fitted downward slope is not proof that the corrective-action program caused the improvement; check the action history and test process.

## 4. Availability: separate reliability, maintainability and support

For a simple alternating up/down renewal process, a familiar steady-state approximation is

\[
A_i=\frac{MTBF}{MTBF+MTTR}.
\]

This expression is useful only when the definitions and assumptions match the system boundary and the repair process being modeled. Do not swap MTTF, MTBF, repair time and downtime without checking the convention. Operational availability can include administrative, logistics, supply, transport, queueing, scheduled maintenance and other delays; intrinsic/inherent availability typically strips some of these from the measure. A system with good intrinsic repairability can still have poor operational availability due to spare-part delays or slow fault isolation.

Define the measured state and clock explicitly:

- **Mission reliability:** probability of completing a stated mission, under a stated profile, without a failure that defeats the mission.
- **Availability:** probability or long-run fraction that the system is in an operable state when required.
- **Maintainability:** probability that a failed item can be restored within a specified time, under stated resources and conditions.
- **Supportability:** ability of the support system (people, spares, tools, data, facilities, contracts and processes) to sustain the required performance.

Avoid using uptime of a component as a substitute for user-visible mission availability. Define whether degraded modes count as available and which functions are essential.

## 5. Markov state-space models for fault-tolerant architectures

NASA RP-1348 gives a tutorial for translating fault-tolerant architecture features into state-space models, including simplex, static redundancy, N-modular redundancy, degradable configurations, reconfiguration and standby spares [S321]. A NASA Markov introduction also covers repair, imperfect coverage, sequence-dependent behavior, transient/intermittent faults and state-dependent responses [S322].

A continuous-time Markov chain has a state vector \(p(t)\) and transition-rate matrix \(Q\):

\[
\frac{dp(t)}{dt}=p(t)Q.
\]

The state definition must preserve all information needed to determine future transition probabilities. A state such as “two channels available, one latent fault, repair crew occupied” may be necessary where those facts alter next-event rates. Each transition should correspond to an explicit failure, detection, repair, switchover, coverage, demand or common-cause event.

Use a Markov model when repair, standby, reconfiguration, dependent event sequences or imperfect fault coverage materially affect the answer. A plain series/parallel reliability block diagram assumes simpler relationships and may be inadequate when state, sequence and repair determine success.

### Markov assumptions and failure modes in the analysis

- A classical continuous-time Markov chain assumes exponential holding times / memoryless transitions. If this is not plausible, consider semi-Markov or phase-type approximations.
- Common-cause failures cannot be ignored merely because redundancy exists. Explicitly model shared power, cooling, software, environment, network, identity, maintenance error, common supplier or design vulnerabilities when they can defeat multiple channels.
- Coverage is a probability with operational meaning: detection, isolation and successful transition must be specified, not represented as an unexplained “coverage factor”.
- Repair assumptions matter: perfect repair, imperfect repair, maintenance-induced failure, finite repair crews and spares create different state spaces.
- State-space growth can become severe. Use modularization, symmetry, bounding, aggregation and sensitivity analysis, while preserving the dependencies that dominate risk.

## 6. Select the method by behavior, not habit

| Need                                                    | Useful primary model                             | Major caveat                                                         |
| ------------------------------------------------------- | ------------------------------------------------ | -------------------------------------------------------------------- |
| First failure of independent, non-repairable components | Weibull / exponential / lognormal lifetime model | Failure-mode mixture and censoring must be handled                   |
| Static series / parallel architecture                   | RBD or fault tree                                | Dependence, repair and sequence are not naturally represented        |
| Recurrent failures and repair history                   | HPP / NHPP recurrence model                      | Exposure and repair-policy changes must be handled                   |
| Repair, standby, degraded operation, switchover         | Markov / semi-Markov state space                 | State sufficiency and transition data are difficult                  |
| Multiple uncertainty sources and causal evidence        | Bayesian network / Bayesian reliability model    | Priors, dependency structure and evidence quality require governance |

Method-selection depends on the behavior being represented; the decision table above synthesizes the distinctions in the NIST repairable-system handbook and NASA Markov tutorials [S318–S322].

## 7. Minimum analysis record

A defensible dependability model should include: system boundary; mission or service profile; operating and repair clocks; event/failure definitions; failure-mode taxonomy; data provenance; censoring and exposure treatment; model family and assumptions; dependency/common-cause treatment; repair and spares assumptions; parameter estimates and confidence/credible bounds; sensitivity and scenario analysis; model verification/validation evidence; decisions supported; and change triggers when design or operating conditions change.

## Sources

- [S318] NIST Engineering Statistics Handbook — repair-rate models (HPP/NHPP).
- [S319] NIST Engineering Statistics Handbook — power-law NHPP.
- [S320] NIST Engineering Statistics Handbook — NHPP power-law reliability growth.
- [S321] NASA RP-1348, _Techniques for Modeling the Reliability of Fault-Tolerant Systems With the Markov State-Space Approach_ (1995).
- [S322] NASA, _An Introduction to Markov Modeling: Concepts and Uses_.
