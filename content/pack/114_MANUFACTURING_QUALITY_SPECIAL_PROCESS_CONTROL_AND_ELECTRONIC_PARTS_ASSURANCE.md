# 114 — Manufacturing quality, special-process control and electronic-parts assurance

**Depth:** Expert · **Evidence date:** 5 November 2026

## 1. Design assurance does not end at the drawing

A verified design does not guarantee a conforming manufactured product. Manufacturing variation, supplier substitutions, process drift, counterfeit parts, poor workmanship, calibration failure, undocumented rework and inadequate inspection can invalidate design assumptions.

Manufacturing assurance therefore connects the design baseline to the actual production configuration and evidence. This includes process qualification, supplier control, operator competence, material and lot traceability, measurement-system control, inspection, nonconformance disposition, corrective action and change control.

## 2. NASA workmanship framework

NASA-STD-8739.6B (approved 4 February 2021) establishes implementation requirements for NASA-adopted workmanship standards. Its role is to clarify how adopted consensus workmanship standards are applied for NASA mission hardware; it does not mean every project automatically uses every requirement without applicable NPR/project tailoring [S328].

NASA-STD-8739.10 (approved 13 June 2017) establishes EEE parts assurance requirements. Its structure includes parts classification, selection and assurance processes, supplier and lot controls, screening/qualification considerations, traceability, and obsolescence management [S329]. Verify the current revision, program applicability and tailoring on the NASA Standards catalogue before using either as a contractual baseline.

## 3. Process assurance chain

| Control layer                 | Engineering question                                                                           | Evidence examples                                                                     |
| ----------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Design for manufacturability  | Can the design be built repeatably using known process capability?                             | Design rules, tolerances, process-risk reviews, producibility analysis                |
| Supplier qualification        | Can the supplier consistently meet technical and quality requirements?                         | Audit results, quality system evidence, capability data, flowdown acceptance          |
| Special-process qualification | Is the process controlled and qualified where output cannot be fully verified later?           | Process qualification, approved process list, personnel certifications where required |
| Workmanship                   | Were assembly, soldering, crimping, bonding, cleaning and ESD controls performed as specified? | Traveler, inspection records, training/authorization, workmanship acceptance          |
| Measurement assurance         | Are measuring systems calibrated and fit for the tolerance/decision?                           | Calibration records, uncertainty budgets, MSA, gauge R&R where relevant               |
| Product acceptance            | Does the built article conform to the approved configuration?                                  | First article, in-process inspection, acceptance testing, objective acceptance record |
| Nonconformance control        | Is the deviation assessed and dispositioned by authorized technical authority?                 | NCR, MRB disposition, deviation/waiver, rework/repair instructions, retest evidence   |
| Configuration integrity       | Does the data package describe the actual delivered article?                                   | As-built BOM, serial/lot genealogy, redlines, configuration audit                     |

## 4. Quality planning and traceability

A project quality plan should define scope, applicable standards, tailoring, supplier flowdown, roles/authority, process controls, records, audit approach, nonconformance management, corrective action and acceptance criteria. A control plan ties each special process and critical-to-quality characteristic to a process owner, method, sample rate, acceptance rule and reaction plan.

Traceability should connect requirements and design features to material/part identity, supplier and manufacturing lot, process traveler, operator/inspection records, test results, NCRs and as-built configuration. Traceability becomes especially important when an observed in-service failure may affect more than one serial number or supplier lot.

## 5. EEE parts assurance and lifecycle management

EEE part selection is not just a data-sheet comparison. It is an assurance decision involving part type, screening, qualification, radiation/environmental suitability where applicable, derating, pedigree, supplier/manufacturer controls, counterfeit exposure, availability, long-term support and mission profile.

NASA-STD-8739.10 includes explicit obsolescence management: assess part availability before selection, monitor the lifecycle, review parts lists before major design reviews, avoid obsolete/projected-obsolete parts without approval and document obsolescence controls in the EEE Parts Management and Control Plan. The standard recommends continuous monitoring for end-of-life and product-change notifications and describes lifetime buys, alternate sourcing and substitution as potential mitigations [S329].

This creates an important cross-link: manufacturing assurance, cybersecurity/supply-chain risk, configuration management and obsolescence management must share one parts identity and evidence model.

## 6. Nonconformance, rework and process feedback

A nonconformance is not closed merely because a board accepts a proposed repair. Closure requires a defined disposition, technical rationale, authorized approval, implemented change, inspection/test evidence and configuration-record update. For repetitive defects, corrective action should address root cause and process controls, not only the individual article.

A useful quality learning loop is:

1. detect and contain;
2. characterize extent (same part, lot, supplier, process, tool, date code, design revision);
3. assess technical/safety/mission consequences;
4. disposition affected articles;
5. identify systemic cause;
6. change process/design/supplier controls;
7. verify effectiveness on subsequent production;
8. update risk, reliability and supportability forecasts.

## 7. Applicability warning

NASA-STD-8739.6B and 8739.10 are NASA standards; industry consensus standards and program-level requirements may be incorporated by reference. Do not make a generic claim that a NASA workmanship standard applies to every NASA, aerospace or commercial product. Applicability follows the mission/program directives, contracts, approved tailoring and technical authority decisions.

## Sources

- [S328] NASA-STD-8739.6B, _Implementation Requirements for NASA Approved Workmanship Standards_ (2021).
- [S329] NASA-STD-8739.10, _Electrical, Electronic, and Electromechanical (EEE) Parts Assurance Standard_ (2017).
- NASA-STD-8739.1/8739.3/8739.4 and project-specific adopted workmanship standards are related references; check current catalogue records before use.
