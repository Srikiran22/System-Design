# 14 — Certifications and credentials

## The distinction

There is no single universal “System Design Certified” credential that proves architecture judgment across domains. Certifications validate a defined body of knowledge or platform skill; they do not replace architecture decisions, prototypes, incident analysis, operational experience, and a portfolio.

| Target role                    | Pathway                                                                                 | What it signals                                                                          |
| ------------------------------ | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Cloud solution architect       | AWS Solutions Architect, Azure Solutions Architect, Google Professional Cloud Architect | Platform-specific design, security, resilience, performance, cost, migration, operations |
| Enterprise architect           | TOGAF EA Foundation / Practitioner                                                      | Architecture method, governance, capability and lifecycle design                         |
| Systems engineer               | INCOSE ASEP → CSEP → ESEP                                                               | Lifecycle, stakeholder needs, requirements, architecture, V&V, leadership/experience     |
| Cloud-native platform engineer | CNCF KCNA / CKA / CKAD / CKS and specialist certs                                       | Kubernetes/cloud-native implementation, admin, development, security                     |
| Reliability engineer           | SRE learning and operational portfolio; relevant cloud credential as needed             | SLOs, incident response, automation, reliability design                                  |

## AWS Certified Solutions Architect — Associate (SAA-C03)

Official: [AWS SAA](https://aws.amazon.com/certification/certified-solutions-architect-associate/) [S38]. Blueprint: [SAA-C03 exam guide](https://docs.aws.amazon.com/pdfs/aws-certification/latest/solutions-architect-associate-03/solutions-architect-associate-03.pdf) [S39].

The official page reviewed in this research states Associate level, 130 minutes, 65 questions, listed price USD 150 (tax/currency treatment varies), three-year validity, and recommended hands-on design experience. Retrieved guide version 1.1 is dated 29 October 2026. Scored domains: secure architectures 30%, resilient architectures 26%, high-performing architectures 24%, cost-optimized architectures 20%. Exam includes unscored pilot questions; consult live guide before booking.

**Best use:** first cloud architecture credential if AWS is relevant to the intended role. It is not a vendor-neutral systems design credential.

## AWS Certified Solutions Architect — Professional (SAP-C02)

Official: [AWS SAP](https://aws.amazon.com/certification/certified-solutions-architect-professional/) [S40]. Guide: [SAP-C02 blueprint](https://docs.aws.amazon.com/pdfs/aws-certification/latest/solutions-architect-professional-02/solutions-architect-professional-02.pdf) [S41]. Advanced credential for complex solution design, migration, optimization, organizational complexity. Verify current exam format, service scope and prerequisites in the live guide.

## Microsoft Certified: Azure Solutions Architect Expert (AZ-305)

Official guide: [AZ-305 Study Guide](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-305) [S42]. Retrieved skills measured as of 17 April 2026:

- Identity, governance, monitoring: 25–30%.
- Data storage: 20–25%.
- Business continuity: 15–20%.
- Infrastructure: 30–35%.

The guide states a passing score of 700 and annual renewal by free online assessment for applicable role-based certifications. Verify the current prerequisite for the Expert certification, booking details, and objectives on the live Microsoft credential page before paying; those details change.

## Google Cloud Professional Cloud Architect

Official: [Google PCA](https://cloud.google.com/learn/certification/cloud-architect) [S43]. Page reviewed in the research states two-hour exam, USD 200 plus tax, 50–60 multiple-choice/multiple-select questions, two case studies contributing roughly 20–30% of exam content, two-year validity, no formal prerequisite, and recommended three years of industry experience including one year designing/managing Google Cloud solutions. Scope includes strategy, design, provisioning, security/compliance, migration, implementation, optimization and operations. Confirm current details at registration.

## Enterprise architecture — TOGAF

Official portfolio: [The Open Group TOGAF Certification Portfolio](https://www.opengroup.org/certifications/togaf-certification-portfolio) [S44]. The live portfolio includes TOGAF Standard 10th Edition pathways and legacy TOGAF 9.2 qualifications.

The Enterprise Architecture Practitioner path can be reached by OGEA-101 Foundation then OGEA-102 Practitioner; combined OGEA-103; or, for eligible TOGAF 9 Certified holders, OGEA-10B bridge. If Foundation is already held, OGEA-102 is the Practitioner exam. The portfolio also contains business architecture and agile/digital/environmental specialist, risk/security, and leader credentials. Check current datasheets/FAQ for exam format, fee, language, and policy.

**Fit:** enterprise architecture, governance, business/technology alignment, formal architecture method. It does not substitute for hands-on distributed systems design.

## Systems engineering — INCOSE SEP

Official: [Certification start](https://www.incose.org/certification/start-your-certification/) [S45], [exam information](https://www.incose.org/certification/start-your-certification/taking-the-exam/) [S46], [Systems Engineering Handbook](https://www.incose.org/resources-publications/technical-publications/se-handbook/) [S01].

- **ASEP:** knowledge recognition; official overview states no experience requirement.
- **CSEP:** minimum five years of systems engineering experience and supporting references/evidence, with detailed eligibility rules in the current procedure.
- **ESEP:** senior systems engineering leadership recognition, with substantial experience/leadership evidence and an interview/reference process.

INCOSE states the knowledge exam moved to Handbook 5th Edition content from 15 March 2025. The retrieved official information described 100 scored multiple-choice questions plus possible unscored pilot items. INCOSE pages returned HTTP 403 during extraction, so verify current experience calculations, application/renewal fees, exam time and process in the latest procedure before applying.

**Fit:** complex products, infrastructure, aerospace, defense, mobility, medical devices, and systems-of-systems engineering.

## Cloud-native — CNCF

Official: [CNCF Training & Certification](https://www.cncf.io/training/) [S47]. Examples include KCNA, KCSA, CKA, CKAD, CKS, PCA, ICA, CCA, CAPA, CGOA, CBA, OTCA and KCA. The current page organizes credentials into Associate, Developer, Administrator, and Specialist categories. Some are hands-on performance-based. Pathways and renewal/cross-renewal policies changed in 2026; use the live issuer page for status and rules.

**Fit:** implementing and operating cloud-native systems. Kubernetes credentials validate platform skill; they do not prove Kubernetes is appropriate for a given product.

## Recommended paths

- **Broad software system design:** fundamentals + distributed systems + architecture portfolio; add one cloud credential if target jobs use that platform.
- **Enterprise architecture:** systems thinking + business capability mapping + TOGAF + portfolio of decisions.
- **Systems engineering:** requirements/lifecycle/V&V + INCOSE ASEP/CSEP when eligible + complete systems project.
- **Cloud-native implementation:** networking/Linux/containers + KCNA/CKA/CKAD/CKS + production-like labs.
- **Reliability:** SRE book + SLO/incident practice + fault-injection/recovery evidence; credential only when role needs it.

## Before paying

- [ ] Does it map to target role/platform?
- [ ] Are issuer, exam objectives, prerequisites, validity, renewal, fee, language and delivery format current?
- [ ] Does the exam test practical ability or mainly recall?
- [ ] Would a portfolio project demonstrate more value for the same time/cost?
- [ ] Does your portfolio show trade-offs, failure behavior and product outcomes?

Do not buy a credential only because its title contains “architect.” Select it after choosing the target role and technical environment.

## Expanded credential map — choose by target role

| Target discipline           | Credential families worth investigating                                    | Selection caveat                                                                                                                |
| --------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Systems engineering         | INCOSE ASEP, CSEP, ESEP                                                    | Experience thresholds and evidence requirements differ sharply by level; consult the current program document. [S149]           |
| Systems modeling / MBSE     | OMG OCSMP; tool-specific modeler credentials                               | Demonstrates defined modeling knowledge, not whole-lifecycle system competence. [S67, S124]                                     |
| Enterprise architecture     | TOGAF Foundation / Practitioner; ArchiMate routes                          | Tests a method or notation; portfolio work must demonstrate useful architecture and governance. [S126, S148]                    |
| Software/cloud architecture | AWS, Azure, Google Cloud architecture credentials; CNCF ecosystem          | Provider alignment can be useful; demonstrate transferable architecture decisions and operational practice too.                 |
| Reliability                 | ASQ CRE and role-specific reliability training                             | Requires relevant work history; inspect current body of knowledge and eligibility before preparing. [S150]                      |
| Cybersecurity architecture  | ISC2 CISSP and architecture specialization routes; security training       | Experience and endorsement rules matter; a credential does not certify a product as secure. [S151]                              |
| Secure software / DevSecOps | Vendor-neutral secure development and cloud security credentials           | Match the role: product security, application security, cloud security, assurance and governance differ. [S153–S155]            |
| Safety / functional safety  | Sector and standard-specific functional safety credentials                 | Must match the actual standard, industry, system lifecycle and jurisdiction. [S131, S161–S165]                                  |
| AI governance / management  | AI risk and AI management training, including ISO/IEC 42001-related routes | Verify the issuer, assessment rigor and applicability; “AI certificate” is not a universal competency class. [S136, S137, S160] |

Always re-check prerequisites, exam version, fees, renewal/CPD and accreditation with the issuing organization. Course completion certificates, vendor certifications, professional certifications, regulated-person authorization and employer qualification are different things.
