# Sector Assurance: Aerospace, Automotive, Medical, Rail and Process Safety

**Depth:** cross-sector comparison with explicit applicability boundaries.  
**Rule:** the right assurance basis is determined by intended use, jurisdiction, regulator, customer/contract, system boundary and hazard class—not by whichever standard appears most comprehensive.

## 1. Aerospace software and airborne electronic hardware

### Software

FAA AC 20-115D (21 July 2017) recognizes EUROCAE ED-12C / RTCA DO-178C for airborne software development assurance and related supplements:

- DO-330 / ED-215 — software tool qualification;
- DO-331 / ED-218 — model-based development and verification;
- DO-332 / ED-217 — object-oriented technology and related techniques;
- DO-333 / ED-216 — formal methods.

The AC describes an acceptable means, not the only means, to show compliance. It is not itself a regulation; where an applicant elects to use its means, the relevant provisions must be followed. DO-178C/ED-12C addresses software aspects of airborne systems/equipment in the applicable certification context.

### Hardware

FAA AC 20-152A (7 October 2022) recognizes ED-80 / RTCA DO-254 and provides additional objectives/clarifications for airborne electronic hardware including custom devices, COTS IP/devices and circuit board assemblies. It is an acceptable means, not a regulation. The AC applies to airborne electronic hardware contributing to hardware DAL A, B or C functions; objective applicability varies by DAL. The AC explicitly excludes single-event-effects assessment from its scope.

### System-level development

System-level development assurance is not identical to software or hardware assurance. ARP4754B / ED-79B and ARP4761A / ED-135A are commonly referenced aerospace system-development and safety-assessment practices; confirm the exact certification basis and current FAA/EASA recognition for the project. Do not treat one software/hardware standard as a complete aircraft-level assurance argument.

## 2. Automotive functional safety, SOTIF and AI safety

- **ISO 26262:2018 series:** functional safety for safety-related E/E systems in series-production road vehicles. It addresses hazards arising from malfunctioning behavior of safety-related E/E systems. The 2018 edition remains published in the ISO catalogue while parts are moving through revision; do not treat draft replacements as normative.
- **ISO 21448:2022 (SOTIF):** addresses unreasonable risk caused by functional insufficiencies in the specification or performance of intended functionality, particularly where situational awareness depends on complex sensors and processing algorithms. It covers reasonably foreseeable misuse and relevant remote/back-office interactions. It excludes faults covered by ISO 26262 and cybersecurity threats, so separate safety/security reasoning is required.
- **ISO/PAS 8800:2024:** addresses safety-related E/E systems in production road vehicles that use AI, including risk from output insufficiencies, systematic errors and random hardware errors of AI elements. It focuses mainly on machine learning. It does not govern the development lifecycle of AI elements outside the vehicle; it offers safety-related properties for a vehicle-level assurance claim.

Do not collapse functional safety (malfunctioning E/E behavior), SOTIF (functional insufficiency/limitations) and AI safety into one undifferentiated risk assessment. They overlap and must be coordinated, but their scopes differ.

## 3. Medical devices and medical-device software

- **IEC 62304:2006 + Amendment 1:2015:** medical device software lifecycle processes. ISO currently lists the 2006 edition as confirmed in 2023 and published, with one amendment. The amendment must be considered with the base standard.
- **ISO 14971:2019:** risk-management process for medical devices across the life cycle, including software as a medical device and IVD devices. The edition was reviewed/confirmed in 2025. It requires objective risk-acceptability criteria but does not prescribe a universal acceptable-risk level.
- **FDA cybersecurity guidance, 3 February 2026:** “Cybersecurity in Medical Devices: Quality Management System Considerations and Content of Premarket Submissions.” It supersedes the June 27, 2025 guidance. It covers design, labeling and premarket cybersecurity documentation for devices with cybersecurity risk, including section 524B recommendations for cyber devices.

FDA guidance is nonbinding recommendations, not a consensus standard or a regulation itself. Statutory requirements such as FD&C Act section 524B remain legally distinct. Manufacturers should integrate security risk management into the quality system and total product lifecycle; cybersecurity risk management is not interchangeable with safety risk management.

## 4. Rail systems and signalling

The EN 50126 / IEC 62278 family addresses RAMS lifecycle processes; EN 50128 / IEC 62279 addresses railway control/protection software; EN 50129 / IEC 62425 addresses safety-related electronic systems for signalling. The European Union's Common Safety Method for risk evaluation and assessment (Regulation (EU) No 402/2013, as amended) creates a regulatory process for technical, operational or organizational changes and independent assessment criteria.

ERA guidance identifies FMECA, FTA and HAZOP among common risk assessment methods. National authorisation and assessment arrangements must be checked for the specific infrastructure, rolling stock, signalling system, change and jurisdiction.

## 5. Process/industrial functional safety

IEC 61508 is the generic functional-safety foundation for electrical/electronic/programmable electronic safety-related systems; sector standards (for example IEC 61511 in process industry) tailor it to application context. SIL is a defined safety-integrity concept, not a generic quality rating or cybersecurity assurance level. Process-safety methods such as HAZOP, LOPA, SIS lifecycle engineering and safety instrumented function validation are not equivalent to software DAL or automotive ASIL.

## 6. Cross-sector assurance boundary table

| Domain                               | Main assurance focus                                                         | Standards/guidance anchors              | Do not confuse with                                                  |
| ------------------------------------ | ---------------------------------------------------------------------------- | --------------------------------------- | -------------------------------------------------------------------- |
| Civil aviation software              | Software development assurance by criticality/DAL and certification evidence | FAA AC 20-115D; DO-178C and supplements | Whole aircraft safety assessment                                     |
| Civil aviation electronic hardware   | Hardware design assurance                                                    | FAA AC 20-152A; DO-254                  | Software assurance or radiation SEE analysis                         |
| Automotive E/E                       | Malfunctioning behavior of safety-related E/E systems                        | ISO 26262                               | SOTIF or cybersecurity                                               |
| Automotive intended functionality    | Functional insufficiencies and reasonably foreseeable misuse                 | ISO 21448                               | Component-fault-only safety analysis                                 |
| Automotive AI                        | AI element output/systematic/random hardware errors at vehicle level         | ISO/PAS 8800:2024                       | General-purpose AI governance or full external AI supplier lifecycle |
| Medical software                     | Software lifecycle framework                                                 | IEC 62304                               | Full device risk management                                          |
| Medical device risk                  | Device lifecycle hazard/risk control                                         | ISO 14971                               | Cybersecurity-only risk                                              |
| Medical cybersecurity                | Device cyber design and premarket/postmarket considerations                  | FDA Feb 2026 guidance, FD&C Act 524B    | Nonbinding guidance as law                                           |
| Rail RAMS                            | Lifecycle RAMS and safety demonstration                                      | EN 50126/28/29; EU CSM                  | Aviation DAL or automotive ASIL                                      |
| Industrial/process functional safety | E/E/PE safety-related systems and sector SIS                                 | IEC 61508/61511                         | Generic enterprise risk scoring                                      |

## 7. Assurance planning method

1. Identify the jurisdiction, regulator, contract and intended-use category.
2. Identify the system boundary and external dependencies (cloud, communications, supplier models, data, users and maintainers).
3. Identify governing legislation/regulation separately from consensus standards and voluntary guidance.
4. Map applicable standard parts and editions to system lifecycle processes and safety/security claims.
5. Define development assurance levels or integrity classifications only where the relevant regime defines them.
6. Establish plans, requirements, architecture, hazard/risk analyses, V&V, configuration management and objective evidence.
7. Resolve deviations/alternate methods with the proper authority; do not self-declare equivalence.
8. Maintain a standards revision watch and re-assess impact when a new edition moves from draft to published.

## Sources

- [FAA AC 20-115D official record](https://www.faa.gov/regulations_policies/advisory_circulars/index.cfm/go/document.information/documentID/1032046)
- [FAA AC 20-152A official record](https://www.faa.gov/regulations_policies/advisory_circulars/index.cfm/go/document.information/documentID/1041323)
- [FAA software/hardware approval references](https://www.faa.gov/aircraft/air_cert/design_approvals/air_software/software_regs)
- [ISO 26262 series overview](https://www.iso.org/publication/PUB200262.html)
- [ISO 21448:2022](https://www.iso.org/standard/77490.html)
- [ISO/PAS 8800:2024](https://www.iso.org/standard/83303.html)
- [IEC 62304:2006](https://www.iso.org/standard/38421.html)
- [ISO 14971:2019](https://www.iso.org/standard/72704.html)
- [FDA February 2026 medical-device cybersecurity guidance](https://www.fda.gov/regulatory-information/search-fda-guidance-documents/cybersecurity-medical-devices-quality-management-system-considerations-and-content-premarket)
- [ERA Common Safety Method](https://www.era.europa.eu/domains/common-safety-methods/risk-evaluation-assessment-csm_en)

**Limit:** this is a map, not a compliance determination. Purchase/access the normative text, confirm the current national adoption and harmonisation status, and obtain sector-qualified regulatory advice for a real programme.
