# System Verification, Validation, Independence and Evidence Coverage

**Depth:** expert assurance method  
**Purpose:** establish defensible evidence that a system meets specified requirements and is fit for its intended use.

## 1. Two different assurance questions

- **Verification:** did we realize the product right? Does the realized item conform to its approved requirements, design definition and configuration baseline?
- **Validation:** did we realize the right product? Does the system meet stakeholder expectations and intended purpose in the intended operational environment?

The distinction is not a matter of test type. Both activities can use test, analysis, inspection and demonstration; the governing question and reference baseline differ. Verification primarily references approved requirements/specifications. Validation references intended use, mission context and ConOps.

## 2. V&V is a lifecycle process, not a final test event

A sound strategy starts when requirements and architecture are being defined. Each requirement should be testable or otherwise objectively assessable; its allocated implementation and verification method should be planned. Validation scenarios should be tied to real stakeholder tasks, operators, operating environments, degraded conditions and mission objectives.

A practical evidence chain is:

`stakeholder need → ConOps/scenario → system requirement → allocated element → design/implementation → verification method/procedure → result/evidence → validation scenario → decision/acceptance`

The chain should be bidirectional. A change to a stakeholder expectation, requirement, interface, design baseline or test method can invalidate linked evidence. A traceability matrix or model is an implementation; the real control is the maintained relationship graph and change-impact analysis.

## 3. Verification methods and their limits

| Method        | Evidence produced                                          | Main limitation                                                               |
| ------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Test          | Measured response under defined conditions                 | Test environment and configuration may not represent all operating conditions |
| Analysis      | Calculation, model result, proof, simulation or prediction | Depends on validity of assumptions, inputs and models                         |
| Inspection    | Evidence of physical/documented characteristics            | Usually cannot establish dynamic performance                                  |
| Demonstration | Observed execution of a function or task                   | May not quantify margins or all boundary cases                                |

Combined methods are often appropriate. A test can verify a requirement while the same scenario contributes to validation, but the conclusions and acceptance criteria must remain distinct.

## 4. V&V planning and configuration

A V&V plan should establish at least:

- purpose, scope, system boundary and product hierarchy;
- applicable and reference documents and precedence rules;
- requirements source, flowdown, allocation and bidirectional traceability;
- verification and validation methods, environments, models, equipment and procedures;
- responsibilities, independence, approval authority and change authority;
- entry/exit criteria, pass/fail rules, margins and anomaly handling;
- configuration identification of hardware, software, firmware, model, data and procedures;
- evidence repository, result reporting, nonconformance disposition and closure criteria.

Baseline the plan and test procedures. A result against an unknown or uncontrolled configuration is weak evidence. Re-test or re-analysis decisions should be based on impact analysis, not on a default assumption that a change is harmless.

## 5. Independence and IV&V

Independent verification and validation is a distinct assurance function, not merely a second test team. Independence is established through organizational and technical arrangements appropriate to the integrity/risk level, including separation of responsibilities, objective assessment, access to lifecycle artifacts, and independent conclusions. Independence does not guarantee correctness; the IV&V provider must still have competent personnel, sufficient access, a risk-informed plan and explicit acceptance criteria.

The independent assessment should challenge:

- mission and stakeholder assumptions;
- requirement quality and completeness;
- architecture and interface risks;
- testability and method adequacy;
- configuration and traceability integrity;
- off-nominal behavior and hazardous conditions;
- residual risk, unclosed anomalies and limits of the evidence.

## 6. Coverage is not one number

Maintain separate evidence views for:

- requirements coverage: each approved requirement has an appropriate verification disposition;
- interface coverage: each critical interface is verified under relevant states and loads;
- function/behavior coverage: expected and off-nominal scenarios are exercised;
- structural coverage: code/model/design structure coverage where applicable;
- hazard/control coverage: each safety constraint and risk control has evidence;
- configuration coverage: evidence applies to the delivered baseline;
- validation coverage: stakeholder goals and operational scenarios are represented.

A full requirement-to-test mapping does not prove that requirements are correct, sufficient or safe. It proves traceability of the selected set. This is why verification and validation must examine both the product and the adequacy of the requirement/mission framing.

## 7. IEEE 1012-2024

IEEE 1012-2024 is an active process standard for system, software and hardware V&V. Its stated scope includes hardware, software, systems and interfaces; new development, maintenance and reuse (including COTS/legacy items); and analysis, evaluation, review, inspection, assessment and testing. It specifies lifecycle V&V requirements for different integrity levels. The full normative clauses are licensed; use the official abstract and standard itself for applicability and conformance claims.

## 8. Frequent assurance failures

- V&V starts after implementation, when correction is expensive.
- Requirement coverage is mistaken for stakeholder validation.
- A test is considered successful without a controlled configuration or defined acceptance criterion.
- A model's output is accepted without credibility/uncertainty assessment.
- An anomaly is waived without a documented rationale and risk owner.
- Independence is claimed based only on different job titles.
- Reused or COTS components are excluded despite their lifecycle, interface and supply-chain risks.
- Evidence is retained as disconnected PDFs rather than traceable, versioned records.

## 9. V&V design review questions

1. What claim does each verification activity support?
2. What requirement or design baseline is being verified?
3. What intended-use claim does each validation activity support?
4. Are the operational conditions and stakeholder population representative?
5. What uncertainty or limitation remains in analysis-based evidence?
6. Is independence proportionate to risk and integrity?
7. Can a change invalidate previous evidence, and is that impact discoverable?
8. Are residual risks explicitly owned and accepted by an authorized decision maker?

## Sources

- [IEEE 1012-2024 — System, Software, and Hardware V&V](https://standards.ieee.org/ieee/1012/7324/) — active standard; official status, scope and abstract extracted.
- [NASA Appendix I — Verification and Validation Plan Outline](https://www.nasa.gov/reference/appendix-i-verification-and-validation-plan-outline/) — full targeted extraction of the V&V plan structure and product flow.
- [NASA SWE-141 — Software Independent Verification and Validation](https://swehb.nasa.gov/spaces/SWEHBVD/pages/102695499/SWE-141+-+Software+Independent+Verification+and+Validation) — NASA software assurance guidance.
- [NASA SWE-072 — Bidirectional Traceability Between Software Test Procedures and Requirements](https://swehb.nasa.gov/spaces/7150/pages/16449898/SWE-072+-+Bidirectional+Traceability+Between+Software+Test+Procedures+and+Software+Requirements) — traceability guidance.
- [NASA, Product Verification](https://www.nasa.gov/reference/5-3-product-verification/) — process framing.

**Limit:** conformance to IEEE 1012 or a NASA process reference depends on the actual normative text, declared integrity level, contract/regulatory basis and approved tailoring; the public summaries alone cannot establish compliance.
