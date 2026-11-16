# Standards Revision Watch — Snapshot 5 November 2026

**Purpose:** prevent draft standards, obsolete editions, voluntary guidance and regulator-accepted means from being mislabeled as current mandatory requirements.

## 1. Lifecycle and requirements engineering

| Standard                  | Official status at snapshot                                                        | Correct use in this repository                                                                |
| ------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| ISO/IEC/IEEE 15288:2023   | Published, Edition 2 (May 2023)                                                    | Current published system lifecycle process framework identified by ISO record.                |
| ISO/IEC/IEEE 29148:2018   | Published, Edition 2 (Nov 2018); reviewed/confirmed 2024; Edition 3 DIS in enquiry | 2018 remains the published baseline until a replacement is published. DIS 3 is not normative. |
| ISO/IEC/IEEE 16085:2021   | Published, Edition 1; ISO review process shown as under review                     | Risk-management lifecycle process elaboration; full text is licensed.                         |
| ISO/IEC/IEEE 24748-1:2024 | Published, 2024 edition                                                            | Lifecycle management guidance complementing 15288/12207.                                      |

**29148 revision detail:** ISO's official record identifies Edition 3 as a Draft International Standard in the enquiry phase and says it will replace the 2018 edition. The DIS ballot began 14 September 2026 for 12 weeks. The draft is not a published standard on this snapshot date. Do not teach draft clauses as mandatory or settled requirements.

## 2. Architecture standards

| Standard                | Official status at snapshot                                      | Correct use                                                                                                                                                                                  |
| ----------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ISO/IEC/IEEE 42010:2022 | Published, Edition 2                                             | Requirements for the structure/expression of architecture descriptions, viewpoints, frameworks, languages and model kinds; it does not prescribe the architecture itself or a design method. |
| ISO/IEC/IEEE 42020:2019 | Published, reviewed/confirmed in 2025; revision work item exists | Current published architecture process reference at snapshot. AWI replacement is not published.                                                                                              |
| ISO/IEC/IEEE 42030:2019 | Published, reviewed/confirmed in 2025                            | Current architecture evaluation framework record. Normative text licensed.                                                                                                                   |
| OMG UAF 1.2             | Published OMG specification                                      | Use the official OMG versioned specification; do not confuse UAF views with DoDAF products or a domain-neutral architecture ontology.                                                        |
| NATO NAF 4.1            | NATO framework document, March 2026                              | Latest retrieved release for NATO architecture practice; it is a framework/guidance document, not an ISO standard.                                                                           |

## 3. Systems-of-systems standards

| Standard                     | Official status at snapshot                           | Correct use                                                                                          |
| ---------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| ISO/IEC/IEEE 21839:2019      | Published first edition                               | Existing published SoS lifecycle consideration reference.                                            |
| ISO/IEC/IEEE 21839 Edition 2 | Under publication; final production steps in progress | Do not cite as published normative edition until ISO changes status. It is expected to replace 2019. |

## 4. Functional safety

### IEC 61508 Edition 3

IEC 61508-1:2026 PRV is listed by IEC as a pre-release/Final Draft International Standard. Its voting window is 2 October 2026 to 13 November 2026. The current catalogue entry forecasts publication on 22 January 2027. The PRV describes updates including clarified interface among parts, clearer differentiation between SIL and Systematic Capability, more detailed competence requirements and independence levels for functional safety assurance.

**Status rule:** on 5 November 2026, this is a draft in ballot, not the final published Edition 3. The Edition 2 (2010) remains the published baseline pending formal publication and transition guidance. Do not claim the 2026 PRV is already a mandatory or final edition.

## 5. Automotive safety

- ISO 26262:2018 series parts remain published. The ISO catalogue showed work toward revised drafts for at least selected parts; a draft is not yet a replacement.
- ISO 21448:2022 is the published SOTIF edition; Edition 2 is a Working Draft and will replace the 2022 edition when completed.
- ISO/PAS 8800:2024 is a published Publicly Available Specification for road-vehicle safety and AI. PAS status is not identical to a full International Standard status.

## 6. Medical devices

- IEC 62304:2006 remains published and was confirmed in 2023; Amendment 1:2015 applies.
- ISO 14971:2019 was reviewed and confirmed in 2025, so that edition remains current on this snapshot.
- FDA's cybersecurity guidance issued 3 February 2026 superseded the June 27, 2025 final guidance. It is nonbinding guidance; statutory duties under section 524B are separately binding where applicable.

## 7. NASA standards and handbooks

| Source          | Status                                                                      | Boundary                                                                                                                                             |
| --------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| NASA-STD-7009B  | Active, dated 5 March 2024                                                  | NASA model/simulation standard; acceptance criteria set by programme/project and approved Technical Authority; catalogue does not mark it mandatory. |
| NASA-HDBK-1009A | Active, dated 12 March 2025; NASA-endorsed handbook                         | SysML modeling integration with NASA SE processes and selected work products; handbook/guidance, not a claim that a model is validated.              |
| GSFC-STD-7000B  | Active, dated 28 April 2021; next 5-year review 28 April 2027               | GSFC environmental verification standard; not a NASA-wide mandatory standard.                                                                        |
| GSFC-HDBK-8004  | Baseline handbook approved 20 August 2024; revalidation date 20 August 2029 | GSFC FMECA/risk assessment guidance, not a universal regulatory standard.                                                                            |
| NASA-STD-0005   | Inactive for new design since 9 March 2015                                  | Historical CM reference; current NASA CM guidance points to SAE/EIA-649 family and NASA-specific implementation.                                     |
| NPR 7123.1D     | Effective 5 July 2023; expires 5 July 2028                                  | Procedural requirements; marked mandatory for NASA employees. Tailoring/customization requirements are specified in the NPR.                         |

## 8. Aviation guidance

FAA AC 20-115D remains listed as active by FAA. It describes acceptable means, not the only means, and explicitly is not itself a regulation. It recognizes DO-178C and supplements. FAA AC 20-152A is also active and describes an acceptable means for airborne electronic hardware assurance, recognizing DO-254/ED-80 and adding clarification. Confirm the certification basis and FAA/EASA policy at the time of project approval.

## 9. Source-of-record hierarchy

For each standards claim, use this order:

1. Official publisher catalogue or regulator status record.
2. Official standards committee/technical authority page.
3. Government/agency technical handbook or guidance.
4. Authorized national adoption catalogue for regional versions.
5. Secondary technical commentary for explanation only.

Never use a vendor blog as the authority for whether a standard is current, mandatory, harmonized or superseded. It may be useful for implementation interpretation if independently checked.

## 10. Revision watch protocol

Every standard record in the future knowledge portal should store:

- designation, title and part number;
- publisher/issuer and jurisdiction;
- edition, amendment, corrigendum and publication date;
- lifecycle stage (published, confirmed, under review, DIS, FDIS, AWI, withdrawn, superseded);
- legal/normative force (law, regulation, contract, accepted means, consensus standard, guidance, handbook);
- previous and replacement documents;
- last verification timestamp and official source URL;
- transition/adoption notes and review owner.

Recheck draft standards before teaching or using them in compliance plans. A new draft may be informative, but it is not a published normative requirement.

## Sources

- [ISO 15288:2023](https://www.iso.org/standard/81702.html)
- [ISO 29148:2018](https://www.iso.org/standard/72089.html) and [ISO DIS 29148 Edition 3](https://www.iso.org/standard/94091.html)
- [ISO 16085:2021](https://www.iso.org/standard/74371.html)
- [ISO 24748-1:2024](https://standards.ieee.org/ieee/24748-1/10942/)
- [ISO 42010:2022](https://www.iso.org/standard/74393.html)
- [ISO 42020:2019](https://www.iso.org/standard/68982.html)
- [ISO 42030:2019](https://www.iso.org/standard/73436.html)
- [ISO 21839 Edition 2 status](https://www.iso.org/standard/91120.html)
- [IEC 61508-1:2026 PRV](https://webstore.iec.ch/en/publication/117296)
- [ISO 21448:2022](https://www.iso.org/standard/77490.html) and [ISO/PAS 8800:2024](https://www.iso.org/standard/83303.html)
- [IEC 62304:2006](https://www.iso.org/standard/38421.html) and [ISO 14971:2019](https://www.iso.org/standard/72704.html)
- [NASA standards catalogue](https://standards.nasa.gov/)
- [FAA software and airborne electronic hardware references](https://www.faa.gov/aircraft/air_cert/design_approvals/air_software/software_regs)

**Snapshot warning:** this file is dated 5 November 2026. It is not a permanent list; the source-of-record links control if statuses change.
