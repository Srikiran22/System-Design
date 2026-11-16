# FMECA, Failure Mechanisms, Criticality and Living Risk Assessment

**Depth:** advanced reliability and mission assurance workflow.

## 1. FMEA and FMECA

- **FMEA** identifies failure modes at the selected item/function level, their causes, local effects, next-higher-level effects and system/end effects, plus detection or control measures.
- **FMECA** adds criticality analysis or another structured assessment of consequence/likelihood/criticality according to the approved programme method.

The value is not the risk-priority number. It is the structured decomposition of how a design or process can fail, what the failure does to the mission and safety, how it is detected, and what design or operational control is justified.

## 2. Build the analysis at the right level

A complete analysis normally includes:

1. Define purpose, system boundary, operating modes and analysis depth.
2. Obtain current architecture, function tree, hardware/software breakdown, interfaces and configuration baseline.
3. Identify functions and failure conditions before listing failure modes.
4. Identify credible failure modes for each item/function.
5. Identify causes/mechanisms, including wear-out, overstress, latent defects, environment, software logic, interface incompatibility, human action and common-cause mechanisms.
6. Trace local effects to next-higher effects and end effects, across mission phases and operating modes.
7. Identify detection, annunciation, containment, recovery and existing safeguards.
8. Evaluate severity and likelihood/criticality using the approved scheme and evidence basis.
9. Recommend design, process, test, maintenance or operational controls.
10. Assign owner, due date, closure evidence and residual-risk acceptance authority.
11. Update the analysis as design, material, process, operating conditions or knowledge changes.

## 3. Make the FMECA a living engineering record

GSFC-HDBK-8004 (approved 20 August 2024; revalidation date 20 August 2029) defines a consistent FMECA/risk-assessment approach for GSFC missions. It explicitly frames FMECA as a concurrent, living risk assessment that should be updated as designs, materials, operating parameters, processes and operations are refined or new knowledge is obtained.

That lifecycle stance is important: an FMECA completed once at preliminary design is stale as soon as the system baseline or operational assumptions materially change.

## 4. Criticality and risk scoring

Criticality approaches may use categories, risk matrices, quantitative failure rates, severity/occurrence/detection ratings or mission-specific scoring. A single number should not hide:

- severity class and rationale;
- likelihood model and data source;
- exposure time and operating mode;
- uncertainty and dependence;
- detectability and recovery time;
- common-cause and latent failure potential;
- residual risk and acceptance authority.

Multiplying ordinal rank numbers can produce a prioritization index, but it does not produce a calibrated probability or a mathematically valid expected-loss estimate. Use quantitative modeling where the data/model justify it; otherwise preserve the ordinal nature of the assessment.

## 5. Software and complex-system extensions

Traditional bottom-up FMECA may not fully capture unsafe control actions, emergent hazards, requirement errors or software behavior that is not a component failure. Augment FMECA with system-level hazard analysis, STPA, fault trees, event trees, interface analyses, cybersecurity threat analysis, human reliability analysis and PRA as appropriate. Avoid counting the same scenario twice or treating separate analyses as independent evidence when they share assumptions.

## 6. Common-cause and redundancy

For each redundant function, ask whether the channels share:

- same design, implementation, code, compiler or model;
- common sensor, power, cooling, network, clock or identity provider;
- environment, location, flooding, fire, EMI or contamination;
- maintenance action, technician, procedure or configuration;
- requirements error, data feed or supplier batch;
- identical monitoring and recovery mechanism.

Redundancy only protects against a defined class of failures. It does not establish independence by itself.

## 7. Closure criteria

A FMECA action should not close just because a mitigation is described. Require evidence that the mitigation is implemented, configured, verified, and effective in the relevant operating context. Evidence could include inspection, test, analysis, updated design records, qualification, validated procedure, training, monitoring or accepted risk rationale.

## 8. Review checklist

- Is each failure mode tied to a defined function and configuration?
- Are causes and effects traced through interfaces and system levels?
- Are software, human, environmental and organizational contributors considered?
- Are severity and occurrence grounds explicit?
- Are detection, containment and recovery actually verified?
- Are failure dependencies and common causes modeled?
- Is the register versioned and linked to change control?
- Are residual risks owned and accepted by the correct authority?

## Sources

- [GSFC-HDBK-8004 official NASA record](https://standards.nasa.gov/standard/GSFC/GSFC-HDBK-8004) — baseline handbook; approved 20 August 2024; revalidation 20 August 2029.
- [GSFC-HDBK-8004 full PDF](https://standards.nasa.gov/sites/default/files/standards/GSFC/Baseline/0/GSFC-HDBK-8004_Approved_0.pdf) — full targeted TinyFish extraction.
- [NASA Center Technical Standards list](https://standards.nasa.gov/center-specific-standards) — related reliability, risk, failure-review and flight-system standards.
- [NASA reliability and safety resources](https://sma.nasa.gov/sma-disciplines/system-safety) — related PRA and system-safety guidance.

**Limit:** this handbook is a GSFC technical guide. Its method may be useful elsewhere, but it is not automatically a contractual or regulatory requirement outside its stated context.
