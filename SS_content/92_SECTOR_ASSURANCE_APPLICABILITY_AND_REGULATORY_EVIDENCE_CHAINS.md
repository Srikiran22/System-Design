# 92 — Sector assurance applicability and regulatory evidence chains

## Applicability precedes compliance mapping

A standard is not applicable because it appears in a list. Establish intended use, system classification, hazard/consequence, jurisdiction, regulator, contractual flow-down, product boundary, software/hardware role and certification basis before assigning a compliance matrix. The same device may trigger multiple domains—for example, a medical robot can involve medical device software, machine safety, cybersecurity, human factors and clinical risk.

## Sector map

| Sector               | Common standards/guidance families                                                   | Typical assurance focus                                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| Civil aerospace      | SAE ARP4754B, ARP4761A; RTCA DO-178C, DO-254, DO-160; regulator advisory circulars   | Aircraft/system development assurance, safety assessment, airborne software/electronic hardware, environment qualification |
| Road vehicles        | ISO 26262; ISO 21448 (SOTIF); cybersecurity and software-update rules                | Functional safety, intended-functionality limitations, vehicle cybersecurity and update integrity                          |
| Process industry     | IEC 61508, IEC 61511; IEC 62443                                                      | Functional safety lifecycle, safety instrumented systems, OT cybersecurity                                                 |
| Medical devices      | ISO 14971; IEC 62304; usability/human-factors and quality-system requirements        | Risk management, software lifecycle, clinical use, usability, post-market surveillance                                     |
| Rail                 | EN 50126, EN 50128, EN 50129                                                         | RAMS lifecycle, railway software and safety case/acceptance                                                                |
| Nuclear              | IAEA safety standards, NRC regulatory guides/NUREGs, IEC 61513                       | Defense in depth, PRA, HRA, common cause, nuclear I&C and regulator acceptance                                             |
| Industrial machinery | ISO 13849, IEC 62061, IEC 61508 family                                               | Safety-related control systems and machinery risk reduction                                                                |
| Defense systems      | DoW/DoD engineering policy, MIL/SAE/ISO standards and contract-specific requirements | Acquisition lifecycle, mission assurance, configuration, safety, security, supportability                                  |

## Build an applicability decision record

For every candidate standard or rule, record:

1. issuing body, exact identifier, edition, amendment and publication status;
2. legal, regulatory, contractual, certification or voluntary status;
3. system classes and scope that it covers;
4. excluded products or use cases;
5. required process, technical evidence and information items;
6. approval authority and verification/validation expectations;
7. supplier flow-down and subcontractor evidence;
8. lifecycle obligations after deployment;
9. relation to adjacent standards (e.g., safety/security, software/hardware, quality/environment);
10. unresolved interpretive questions and owner.

## Do not collapse safety, security and reliability

Functional safety focuses on risk from hazards and safety-related functions. Cybersecurity protects systems and information against malicious or accidental threats. Reliability focuses on ability to perform without failure for a specified period and conditions. These disciplines intersect, but a design can be reliable yet unsafe, safe in nominal use but insecure, or secure but unavailable. Their controls and evidence need coordination rather than substitution.

## Compliance evidence graph

Link each obligation to:

- source clause/rule and applicability rationale;
- system requirement/control;
- design component and supplier;
- implementation artifact;
- analysis/test/inspection/demonstration;
- result, anomaly and disposition;
- configuration baseline and evidence date;
- approval/acceptance record;
- post-deployment monitoring and change trigger.

A status cell that says “compliant” without this evidence chain is not an assurance result.

## Currentness cautions from this research snapshot

The DoW published a new System of Systems Engineering Guidebook in September 2026 and a revised Systems Engineering Guidebook in September 2026; use current issuer material rather than old handbook snapshots when working in that context. [S94, S93]

ISO/IEC/IEEE 21839 edition 2 was listed as under publication in the ISO record in the 5 November 2026 snapshot. Do not cite it as already published. [S255, S256]

NASA-STD-0005 is inactive for new design; do not list it as a current mandatory NASA CM standard. [S250]

## Practical deliverable

For an autonomous rail inspection vehicle, define regulatory jurisdiction, applicability of rail RAMS, machinery safety, cybersecurity and data protection. Build an evidence chain for one hazard control and one cyber control. Identify which obligations are binding, guidance, contract requirements or engineering good practice.

## Source limitations

This map is a discovery and engineering orientation aid, not a legal opinion or complete jurisdiction-specific certification plan. Obtain and review controlling normative texts and regulator interpretations before claiming compliance.
