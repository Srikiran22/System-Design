# 74 — Functional-safety standards by sector and assurance boundaries

## Do not use a generic “safety standard” for every system

Functional-safety obligations depend on the sector, jurisdiction, system boundary, hazard, intended use and regulatory/certification context. IEC 61508 is the foundational functional-safety family for electrical/electronic/programmable electronic safety-related systems; IEC describes its lifecycle-oriented role in identifying hazards, managing risk and designing safety functions [S131]. It is not a substitute for sector-specific standards where those apply.

## Sector reference map

| Sector                      | Common standards / guidance families           | Typical assurance emphasis                                                                                  | Important caveat                                                          |
| --------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| General E/E/PE              | IEC 61508                                      | Safety lifecycle, hazard/risk analysis, safety functions, SIL                                               | Generic foundation; tailoring/sector standard may govern                  |
| Process industry            | IEC 61511                                      | Safety instrumented systems across process lifecycle                                                        | Must integrate process hazard analysis and operating/maintenance controls |
| Automotive                  | ISO 26262; ISO 21448 (SOTIF)                   | Functional safety of E/E systems; hazards from intended functionality/performance limitations               | SOTIF is not simply another name for ISO 26262                            |
| Civil aerospace             | ARP4754B; ARP4761A; DO-178C; DO-254; DO-160    | Aircraft/system development, safety assessment, software/hardware assurance and environmental qualification | Certification basis and regulator guidance determine applicability        |
| Medical devices             | ISO 14971; IEC 62304                           | Risk management and medical-device software lifecycle                                                       | Combine with device classification and jurisdictional regulation          |
| Rail                        | EN 50126, EN 50128, EN 50129                   | RAMS lifecycle, software and safety-related electronic systems                                              | National adoption and railway application category matter                 |
| Machinery                   | IEC 62061; ISO 13849                           | Safety-related control systems and performance levels                                                       | Machine scope, architecture and validation obligations matter             |
| Nuclear                     | IEC 61513 and relevant IAEA/regulator guidance | I&C systems important to safety, defense in depth, independent review                                       | Nuclear-specific licensing and safety case expectations dominate          |
| Industrial automation/cyber | IEC 62443 family                               | IACS security lifecycle, zones/conduits, component/system security                                          | Cybersecurity is not identical to functional safety; integrate them       |

## Safety integrity is not overall system safety

SIL/PL or a software assurance level is a property/target associated with specified safety functions and lifecycle evidence. It does not prove that the full system has no hazards. System safety also includes non-functional hazards, human interaction, operating procedures, environment, maintenance and organizational controls.

## Assurance planning

For each project, establish:

- applicable legal/regulatory/certification basis;
- system classification and boundary;
- hazard identification and risk-acceptance policy;
- safety lifecycle and evidence requirements;
- independence/competence rules for review;
- configuration and change-impact requirements;
- supplier/development assurance interfaces;
- validation, operation, maintenance and decommissioning obligations.

## Source quality warning

Normative standard texts are generally licensed. This map links to publishers and reputable official sources but does not reproduce clauses. Verify the edition, amendments, errata, adoption status and regulator interpretation before making compliance claims. A vendor's crosswalk is a discovery aid, not authoritative evidence of compliance.
