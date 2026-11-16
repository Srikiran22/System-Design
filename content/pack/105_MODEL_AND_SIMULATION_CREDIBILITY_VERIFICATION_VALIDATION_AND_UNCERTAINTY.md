# Model and Simulation Credibility: Verification, Validation and Uncertainty

**Depth:** expert guidance for model-based engineering, analysis and simulation evidence.

## 1. A model is an engineered product with a declared use

A model is not credible in the abstract. Credibility is relative to a purpose, decision, operating domain and consequence of error. The first assurance question is therefore: _what decision is this model allowed to inform, for which context, and with what required confidence?_

Define before model development:

- intended decision and use;
- modeled system, boundary, interfaces and operating domain;
- outputs/quantities of interest and measures;
- phenomena and fidelity required to support the decision;
- assumptions, excluded effects and limits of use;
- acceptance criteria and technical authority;
- data pedigree, configuration and model/software version.

## 2. The V&V/UQ distinction

- **Code verification:** is the implementation free of programming/logic errors relative to its intended equations or algorithms?
- **Solution verification:** are numerical errors from discretization, convergence, solver settings and approximations acceptably controlled?
- **Validation:** does the model represent the real world sufficiently well for its intended use, when compared with relevant physical/system observations?
- **Calibration:** are parameter values estimated or tuned against observations? Calibration is not independent validation.
- **Uncertainty quantification (UQ):** what uncertainty in model inputs, parameters, structure, data and numerical methods propagates to the outputs?
- **Sensitivity analysis:** which parameters, assumptions or model choices materially affect output or decision?

A model can be implemented correctly but represent the wrong physics; it can match one data set but fail outside that domain; or it can be validated for one use and not another.

## 3. NASA standards and handbooks

### NASA-STD-7009B — Standard for Models and Simulations

NASA-STD-7009B (approved 5 March 2024) is active in the NASA Technical Standards System. It establishes uniform practices for design, development and use of models and simulations; acceptance criteria are defined by the programme/project and approved by delegated NASA Technical Authority. The revision made lifecycle changes, particularly in credibility assessments during development and use. It is NASA-endorsed, but the catalogue does not mark it as a NASA-mandatory standard.

### NASA-HDBK-1009A — Systems Modeling Handbook for Systems Engineering

NASA-HDBK-1009A (approved 12 March 2025) explains integration of SysML modeling with NASA SE processes under NPR 7123.1. Its mapped work products include stakeholder identification/expectations, ConOps, MOE, technical requirements, MOP, TPM, V&V requirements, planning, results and reports. It expands the 2022 baseline to include a wider set of stakeholder and performance/V&V model products.

This is implementation guidance, not a replacement for process requirements or a guarantee that a model is correct. The handbook includes model planning, model organization, metamodel, example model construction and generation of diagrams/tables. The companion model/toolchain can change; validate compatibility and version before adoption.

## 4. Model credibility workflow

1. **Classify model use:** exploratory, design support, operational decision, safety evidence, certification or regulatory submission.
2. **Set credibility criteria:** define what evidence and accuracy are required for the decision's consequence and uncertainty.
3. **Plan model development:** identify governing equations, data, software, people, tools, assumptions, verification and validation.
4. **Verify structure and implementation:** code/logic, equations, numerical algorithms, units, interface conditions and reproducibility.
5. **Validate relevant behavior:** compare outputs with test/operational data at representative states; explain discrepancies.
6. **Quantify uncertainty:** input variability, measurement noise, parameter uncertainty, model-form uncertainty and numerical error.
7. **Run sensitivity and robustness studies:** examine dominant contributors and whether conclusions reverse under plausible alternatives.
8. **Control model configuration:** version model, code, solver, libraries, data, calibration set and execution environment.
9. **Report limits of use:** identify out-of-domain conditions, non-validated phenomena, known deficiencies and required safety margin.
10. **Reassess after change:** new evidence, software, requirements, input data or model updates may invalidate prior credibility conclusions.

## 5. Evidence and model governance

Maintain a model card / model assurance record with purpose, owner, stakeholders, assumptions, theory, equations, data sources, calibration/validation sets, version, parameter ranges, solver settings, verification results, validation results, uncertainty, sensitivity, known issues, approval and use restrictions.

In a digital thread, preserve relationships among model elements, requirements, architecture, test cases, test results, analysis reports and change records. A diagram export without underlying identities and relationships is a document, not a robust model-based evidence chain.

## 6. Model failure patterns

- “The simulator runs” is mistaken for model verification.
- Agreement with calibration data is claimed as independent validation.
- The intended-use domain is never defined.
- A model is reused for a higher-consequence decision without new credibility assessment.
- Uncertainty is reported as a single percentage without identifying contributors or dependence.
- Model and dataset versioning are not controlled.
- Sensitivity analysis is reported but no decision impact is evaluated.
- A SysML model is assumed to be semantically consistent because it is syntactically valid.

## 7. Review questions

- Which real-world phenomena must be represented for the decision?
- Is fidelity allocated by risk and decision sensitivity rather than aesthetic model detail?
- What independent evidence validates the modeled domain?
- Are model-form errors considered, not only parameter errors?
- How are data, code, model and environment versioned together?
- What triggers revalidation or a model-use restriction?

## Sources

- [NASA-STD-7009B](https://standards.nasa.gov/standard/NASA/NASA-STD-7009) — active standard; status and scope verified from NASA technical standards record.
- [NASA-STD-7009B PDF](https://standards.nasa.gov/sites/default/files/standards/NASA/B/1/NASA-STD-7009B-Final-3-5-2024.pdf) — source document.
- [NASA-HDBK-1009A](https://standards.nasa.gov/standard/NASA/NASA-HDBK-1009) — active, NASA-endorsed handbook; 2025-03-12.
- [NASA-HDBK-1009A PDF](https://standards.nasa.gov/system/files/tmp/2025-03-12-NASA-HDBK-1009A.pdf) — targeted full PDF extraction.

**Limit:** NASA catalogue status is agency-specific. It does not imply that other agencies, customers or regulators require NASA-STD-7009B or HDBK-1009A.
