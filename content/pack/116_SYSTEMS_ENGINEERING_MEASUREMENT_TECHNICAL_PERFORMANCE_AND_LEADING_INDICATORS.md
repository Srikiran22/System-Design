# 116 — Systems engineering measurement, technical performance and leading indicators

**Depth:** Expert · **Evidence date:** 5 November 2026

## 1. Measurement begins with an information need

Measurement is not the same as collecting metrics. ISO/IEC/IEEE 15939:2017 defines an adaptable measurement process that begins with information needs, specifies measures and analysis, applies results and evaluates whether analysis results are valid. The standard is published and was last confirmed in 2022; the ISO catalogue now lists a DIS successor in development, so the 2017 edition remains the published baseline in this snapshot [S332].

A measurement plan should answer:

- What decision or management question must be supported?
- What information is required and by whom?
- What entity, property and context are being measured?
- How is the measure defined, normalized and collected?
- What model/analysis converts raw data into an indicator?
- What threshold or interpretation triggers action?
- How will validity, uncertainty, bias and data quality be assessed?

## 2. Distinguish measure, indicator, objective and threshold

| Term               | Meaning                                             | Example                                                                               |
| ------------------ | --------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Raw observation    | Recorded value with units and context               | 17 open interface change requests at a status date                                    |
| Measure            | Defined quantitative method applied to an attribute | Open interface changes divided by total controlled interfaces                         |
| Indicator          | Analyzed value used to infer state or trend         | Interface closure trajectory against phase exit plan                                  |
| Target / threshold | Agreed desired or unacceptable level                | All critical interfaces baselined before integration start                            |
| Decision rule      | Action under a defined condition                    | Escalate when closure trend falls behind planned trajectory for two reporting periods |

A number without a defined entity, denominator, time basis and decision context is not an engineering measure.

## 3. Leading versus lagging information

A lagging measure reports what has happened; a leading indicator is intended to provide early information about effects likely to influence future system or programme performance. Leading indicators are not causal proof and must be calibrated against experience.

NASA's Common Leading Indicators guide covers: requirements trends; interface trends; verification trends; review trends; software-specific trends; problem/discrepancy reports; technical performance measures; manufacturing trends; cost; schedule; and staffing. The detailed guide explains how programme/project teams can use common indicators to anticipate technical and programme outcomes [S331].

Examples:

- Requirements: volatility, open TBD/TBR, late requirement changes, allocated requirements without verification approach.
- Interfaces: ICD approval, unresolved interface parameters, open interface change requests, maturity before integration.
- Verification: requirement coverage, procedure readiness, test anomaly closure and verification burndown.
- Review: action/RID/RFA closure by severity and ageing—not just count.
- Technical performance: mass, power, thermal, data rate, memory, reliability, margin and performance forecast.
- Manufacturing: yield, rework, nonconformance ageing, supplier escape, corrective-action effectiveness.
- Schedule: critical path float and maturity of work products—not raw task completion percentage alone.

## 4. MOE, MOP and TPM are not interchangeable

NASA logical decomposition guidance defines technical measures based on stakeholder expectations and requirements and distinguishes Measures of Effectiveness (MOEs), Measures of Performance (MOPs) and a special subset called Technical Performance Measures (TPMs) [S333].

- **MOE:** whether the solution achieves the stakeholder/mission objective in operational context.
- **MOP:** how well the system performs a specified technical function or capability.
- **TPM:** a selected technical characteristic tracked during development to assess whether the design is likely to meet a requirement or objective (often with margin/forecast).

A design may meet a component-level MOP but fail to produce the mission-level MOE due to operator workload, environment, logistics, training, system-of-systems effects or operating policy. Maintain explicit links across need → MOE → MOP/TPM → requirement → design allocation → verification and validation evidence.

## 5. Measurement architecture and model governance

The measurement system should include:

1. data source and data owner;
2. measurement definition, unit, sampling and time basis;
3. collection tool and configuration;
4. inclusion/exclusion and handling of missing data;
5. aggregation and statistical method;
6. uncertainty and data-quality checks;
7. display, trend and threshold;
8. decision authority and action;
9. configuration/version history of the measure definition.

Where possible, model the measurement relationships in the same engineering model or digital thread as requirements, architecture and verification. This improves traceability but does not guarantee semantic correctness: the model must still be checked against the real decision need and the data acquisition process.

## 6. Common metric failure patterns

- **Gaming:** targets encourage local optimization, e.g. closing low-risk actions to improve count while severe items remain open.
- **Wrong denominator:** raw number of defects is compared across programmes of different size or exposure.
- **Wrong time basis:** calendar time is compared against operating hours or cumulative exposure.
- **Proxy drift:** proxy metric no longer correlates with the actual mission outcome.
- **Aggregation hides tail risk:** averages conceal severe subsystem or supplier outliers.
- **False precision:** point estimates omit uncertainty and data quality.
- **No action path:** dashboard measures are not connected to decision rights, thresholds or risk controls.

## Sources

- [S332] ISO/IEC/IEEE 15939:2017, _Systems and software engineering — Measurement process_ (official ISO record; DIS successor in development).
- [S331] NASA Office of the Chief Engineer, _NASA Common Leading Indicators: Detailed Reference Guide_ (January 2021).
- [S333] NASA, _4.3 Logical Decomposition_ (Systems Engineering Handbook).
