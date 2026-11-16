# 48 — Standards and regulatory reference map

## Standards are scoped instruments, not universal architecture recipes

The table is a navigation aid. Before using a standard for a project, verify the latest edition, amendments, corrigenda, national adoption, contractual invocation, jurisdiction and product classification from the official publisher or regulator. Full normative text is often licensed. The INCOSE standards page is a useful systems-engineering index; it lists, among others, ISO/IEC/IEEE 15288:2023, ISO/IEC/IEEE 15289:2019 and ISO/IEC/IEEE 24748-1:2024. [S110, S119, S123]

| Area                     | Standard / framework          | Primary use                                             | Boundary / caution                                                |
| ------------------------ | ----------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------- |
| System lifecycle         | ISO/IEC/IEEE 15288:2023       | System life-cycle process framework                     | Tailor process sets; not a project schedule template              |
| Lifecycle management     | ISO/IEC/IEEE 24748-1:2024     | Guidance for lifecycle management                       | Guidance must be applied to context                               |
| Lifecycle information    | ISO/IEC/IEEE 15289:2019       | Content of lifecycle information items                  | Do not equate documents with engineering effectiveness            |
| Requirements             | ISO/IEC/IEEE 29148:2018       | Requirements engineering                                | Check current publisher status before contractual use             |
| Architecture description | ISO/IEC/IEEE 42010:2022       | Stakeholders, concerns, viewpoints, views and rationale | Does not prescribe one notation or method                         |
| Architecture processes   | ISO/IEC/IEEE 42020:2019       | Architecture processes                                  | Use with lifecycle and architecture-description standards         |
| Product quality          | ISO/IEC 25010:2023            | Product quality model                                   | Do not mix editions without mapping characteristics               |
| Software lifecycle       | ISO/IEC/IEEE 12207            | Software lifecycle processes                            | Integrate with system lifecycle where product is socio-technical  |
| Risk                     | ISO 31000                     | Risk management principles and guidance                 | Risk acceptance is an organizational decision                     |
| Information security     | ISO/IEC 27001:2022            | ISMS requirements                                       | Organizational management-system certification, not product proof |
| Business continuity      | ISO 22301                     | Business continuity management systems                  | Technical DR must be tested independently                         |
| AI governance            | ISO/IEC 42001:2023            | AI management system                                    | Does not certify model accuracy or harmlessness                   |
| Cybersecurity            | NIST CSF 2.0                  | Organizational cybersecurity risk management            | Voluntary framework; tailor profiles and outcomes                 |
| Systems security         | NIST SP 800-160 Vol. 1 Rev. 1 | Engineering trustworthy secure systems                  | U.S. government guidance; system-context adaptation required      |
| Cyber resilience         | NIST SP 800-160 Vol. 2 Rev. 1 | Cyber-resilient systems engineering                     | Check revision, errata and applicability                          |
| Zero trust               | NIST SP 800-207               | Zero-trust architecture                                 | Architectural principles, not a single product                    |
| Secure software          | NIST SP 800-218 SSDF          | Secure software development practices                   | Integrate into broader systems security                           |
| Functional safety        | IEC 61508                     | E/E/PE functional safety foundation                     | Sector-specific derivatives may govern the product                |
| Process safety           | IEC 61511                     | Safety instrumented systems in process industries       | Not a generic software-safety standard                            |
| Industrial security      | IEC 62443                     | Industrial automation/control-system security           | Multi-part series; define role and system scope                   |
| Automotive safety        | ISO 26262                     | Automotive E/E functional safety                        | Complement with SOTIF and cybersecurity as applicable             |
| Automotive SOTIF         | ISO 21448                     | Safety of intended functionality                        | Different from malfunction-based functional safety                |
| Medical risk             | ISO 14971                     | Medical-device risk management                          | Coordinate with clinical and regulatory requirements              |
| Medical software         | IEC 62304                     | Medical-device software lifecycle                       | Scope is medical-device software                                  |
| Quality management       | ISO 9001                      | Quality management system                               | Organizational quality framework; not technical safety evidence   |
| Enterprise architecture  | TOGAF 10th Edition            | EA method, content and governance                       | Tailor; avoid bureaucracy                                         |
| Process modeling         | OMG BPMN 2.0.2                | Business process notation                               | Correct semantics and modeling conventions matter                 |
| Systems modeling         | OMG SysML 2.0                 | Systems modeling language                               | Verify tool implementation, API and model governance              |

## Sector standards: apply by product and jurisdiction

Automotive, aviation, aerospace, medical, industrial, energy, rail, telecom and financial systems have additional domain rules. Examples include ISO 26262/21448, aviation development-assurance standards, IEC 61511, ISO 14971/IEC 62304, IEC 62443 and PCI DSS where cardholder-data environments apply. This map is not a certification applicability determination.

## How to create a compliance crosswalk

For each obligation record: issuer; jurisdiction; standard/version; applicability rationale; affected system boundary; requirement/control; design allocation; evidence type; verification owner; assessor/authority; status; deviation/waiver; and review date. Link each control to both implementation and effectiveness evidence.

## Conformance versus fitness

A standard may define a minimum process or control. The system may still be unsafe, insecure, unreliable or unfit if its context is misunderstood, implementation is defective or evidence is weak. Conversely, a team may use effective engineering practices without claiming formal certification. State exactly what has been conformed to, assessed or certified—and by whom.
