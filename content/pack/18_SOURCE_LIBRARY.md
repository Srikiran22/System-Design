# 18 — Source library

This library prioritizes primary standards, official frameworks, academic research, first-hand company engineering accounts, and structured courses. Official documentation is authoritative for its own framework, not neutral proof that a vendor's product is best. A company postmortem is first-hand but partial. A preprint is not a settled standard.

## A. Systems engineering and architecture foundations

| ID  | Source                                                                                                                                                      | Use / quality note                                                                                                   |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| S01 | [INCOSE Systems Engineering Handbook](https://www.incose.org/resources-publications/technical-publications/se-handbook/)                                    | Professional handbook; lifecycle processes elaborating ISO/IEC/IEEE 15288:2023. Full book may be paid/member access. |
| S02 | [NASA Systems Engineering Handbook Rev 2](https://essp.larc.nasa.gov/EVI-6/pdf_files/NASA_SystemsEngineeringHandbookRev2.pdf)                               | Government handbook; lifecycle, ConOps, requirements, trade studies, V&V. NASA program context.                      |
| S03 | [Software Architecture in Practice, 4th ed.](https://www.pearson.com/en-us/subject-catalog/p/software-architecture-in-practice/P200000003472/9780136886099) | Bass, Clements, Kazman; architecture and quality-attribute reference. Commercial book.                               |
| S08 | [C4 model](https://c4model.com/)                                                                                                                            | Diagramming model: context, container, component, code. Not architecture evaluation.                                 |
| S09 | [CMU SEI ATAM collection](https://www.sei.cmu.edu/library/architecture-tradeoff-analysis-method-collection/)                                                | Institutional method for quality-attribute trade-off and risk evaluation.                                            |
| S13 | [ISO/IEC 25010 standard family](https://www.iso.org/standard/78176.html)                                                                                    | Product quality model reference. Check current edition and licensed text.                                            |
| S31 | [Quantitative Study on Conway's Law in Technical Architectures (ECIS 2025)](https://aisel.aisnet.org/ecis2025/ent_system/ent_system/5)                      | Empirical socio-technical research; do not generalize beyond method/sample.                                          |

## B. Systems thinking

| ID  | Source                                                                                                         | Use / quality note                                                            |
| --- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| S04 | [Donella Meadows Project — Systems Thinking Resources](https://donellameadows.org/systems-thinking-resources/) | Iceberg model, stocks/flows, bathtub theorem, learning artifacts.             |
| S05 | [System Dynamics Society — Road Maps](https://systemdynamics.org/learning/road-maps/)                          | Learning paths and feedback/stock-flow exercises.                             |
| S06 | [Waters Center — Thinking Tools Studio](https://thinkingtoolsstudio.waterscenterst.org/courses/tools)          | Behavior-over-time, iceberg, causal loops, stocks/flows, ladder of inference. |
| S07 | [Open University — Systems Thinking Hub](https://www.open.edu/openlearn/systems-thinking-hub)                  | Free course hub, including Systems Thinking in Practice material.             |

## C. Architecture frameworks, methods and reliability

| ID  | Source                                                                                                                        | Use / quality note                                                                                                      |
| --- | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| S10 | [Google Cloud Well-Architected Framework](https://docs.cloud.google.com/architecture/framework)                               | Operational excellence, security, reliability, performance, cost, sustainability. Vendor-specific; reviewed 2026-10-13. |
| S11 | [Azure Well-Architected Framework](https://learn.microsoft.com/en-us/azure/well-architected/)                                 | Quality-driven workload review. Vendor-specific.                                                                        |
| S12 | [AWS Well-Architected](https://aws.amazon.com/architecture/well-architected/)                                                 | Cloud design principles and six pillars. Vendor-specific.                                                               |
| S14 | [Azure Cloud Design Patterns](https://learn.microsoft.com/en-us/azure/architecture/patterns/)                                 | Pattern catalogue with context/trade-offs; many patterns generalize beyond Azure.                                       |
| S15 | [Google SRE Book](https://sre.google/sre-book/table-of-contents/)                                                             | Free reference for SLOs, overload, cascades, incident response, postmortems, testing, data integrity.                   |
| S20 | [Google Cloud Reliability Pillar](https://docs.cloud.google.com/architecture/framework/reliability)                           | Reliability and resilience guidance; reviewed 2026-10-27. Vendor-specific.                                              |
| S23 | [NIST Cybersecurity Framework 2.0](https://www.nist.gov/cyberframework)                                                       | Cybersecurity risk management. Not itself a product security checklist/certification.                                   |
| S24 | [NIST SP 800-207 Zero Trust Architecture](https://csrc.nist.gov/pubs/sp/800/207/final)                                        | Foundational zero-trust guidance.                                                                                       |
| S25 | [NIST SP 800-53](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final)                                                          | Security/privacy control catalogue; tailor to scope.                                                                    |
| S26 | [OWASP Application Security Verification Standard](https://owasp.org/www-project-application-security-verification-standard/) | Application security verification requirements. Check current release.                                                  |
| S27 | [OWASP Top 10](https://owasp.org/www-project-top-ten/)                                                                        | Awareness categories, not a complete threat model.                                                                      |
| S28 | [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)                                                      | API-specific security risks. Check current release.                                                                     |
| S29 | [OpenTelemetry Documentation](https://opentelemetry.io/docs/)                                                                 | Open observability instrumentation and signals.                                                                         |
| S30 | [DORA](https://dora.dev/)                                                                                                     | Research/capabilities for software delivery and operations. Do not turn metrics into quotas.                            |

## D. Courses and hands-on curriculum

| ID  | Source                                                                                                                  | Use / quality note                                                                                                  |
| --- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| S17 | [TU Delft — Modern Distributed Systems](https://learningforlife.tudelft.nl/modern-distributed-systems/)                 | Listed free, self-paced, six weeks, 3–5 hours/week; consistency, scalability, resilience. Course status may change. |
| S18 | [CS Primer — Distributed Systems](https://csprimer.com/courses/distributed-systems/)                                    | Structured curriculum with distributed key-value store project and practice. Independent resource.                  |
| S49 | [The HLD Handbook](https://hld.handbook.academy/)                                                                       | Open high-level-design curriculum; supplement rather than treat self-described module count as audited.             |
| S50 | [University of Queensland — Software Architecture course repository](https://github.com/CSSE6400/software-architecture) | Course notes, practicals, assignments and case material. Check current activity.                                    |

## E. Case studies and practitioner evidence

| ID  | Source                                                                                                                                              | Use / quality note                                                                                       |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| S16 | [Shopify — Deconstructing the Monolith](https://shopify.engineering/deconstructing-monolith-designing-software-maximizes-developer-productivity)    | First-hand modular-monolith evolution, boundaries, ownership and CI checks. Company retrospective, 2019. |
| S21 | [PostHog — Feature flags outage, 2025-09-29](https://posthog.com/handbook/company/post-mortems/2025-09-29-flags-is-down)                            | First-hand postmortem: retries, timeouts, health checks, rollback/recovery.                              |
| S22 | [PostHog — Recurring feature flags outages, Oct 2025](https://posthog.com/handbook/company/post-mortems/2025-10-21-feature-flags-recurring-outages) | First-hand CPU, parallelism, connection pool, Redis cascade and rate-limit issues.                       |
| S32 | [Uber — Service-Oriented Architecture](https://www.uber.com/us/en/blog/service-oriented-architecture/)                                              | First-hand service evolution and new discovery/contract/resilience problems; dated 2015.                 |
| S33 | [Adyen — Accounting and Reporting Systems](https://www.adyen.com/knowledge-hub/design-to-duty-adyen-architecture-part2)                             | First-hand payment ledger, sharding, durable queue and payment/accounting decoupling.                    |
| S34 | [Grammarly — The Great Linkerd Mystery](https://www.grammarly.com/blog/engineering/the-great-linkerd-mystery/)                                      | First-hand DNS/conntrack failure chain and hidden infrastructure limits.                                 |
| S37 | [bol.com — Splitting monolith data](https://techlab.bol.com/en/blog/splitting-the-data-of-the-monolith-because-who-needs-to-sleep-anyway/)          | First-hand live historical data migration under business continuity constraints.                         |

## F. Academic research

| ID  | Source                                                                                                  | Use / quality note                                                                           |
| --- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| S35 | [Faustino et al. — Stepwise Migration of a Monolith to Microservices](https://arxiv.org/abs/2201.07226) | Empirical migration/performance study; single-system scope.                                  |
| S36 | [Xiao et al. — Microservices Tactics and Energy/Quality Trade-offs](https://arxiv.org/abs/2501.14402)   | Controlled Online Boutique experiment; arXiv version 2025-12-03; effects are load-dependent. |
| S51 | [Ameller & Franch — Quality Attributes and Architectural Decisions](https://arxiv.org/abs/1206.5166)    | Research on linking quality/constraints to architecture decisions.                           |
| S52 | [Blatter et al. — Communication Structure and System Design](https://doi.org/10.1109/reser.2013.13)     | Controlled pilot on Conway's Law; authors describe results as inconclusive.                  |

## G. Certifications

| ID  | Source                                                                                                                                                          | Use / quality note                                                                  |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| S38 | [AWS Solutions Architect — Associate](https://aws.amazon.com/certification/certified-solutions-architect-associate/)                                            | Official issuer. Price, format, validity and eligibility can change by date/region. |
| S39 | [AWS SAA-C03 Exam Guide](https://docs.aws.amazon.com/pdfs/aws-certification/latest/solutions-architect-associate-03/solutions-architect-associate-03.pdf)       | Official blueprint; retrieved version 1.1 dated 2026-10-29.                         |
| S40 | [AWS Solutions Architect — Professional](https://aws.amazon.com/certification/certified-solutions-architect-professional/)                                      | Official advanced architecture credential.                                          |
| S41 | [AWS SAP-C02 Exam Guide](https://docs.aws.amazon.com/pdfs/aws-certification/latest/solutions-architect-professional-02/solutions-architect-professional-02.pdf) | Official professional exam blueprint.                                               |
| S42 | [Microsoft AZ-305 Study Guide](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-305)                                      | Official skills measured; retrieved guide date 2026-04-17.                          |
| S43 | [Google Professional Cloud Architect](https://cloud.google.com/learn/certification/cloud-architect)                                                             | Official exam/case study/validity/fee page; verify before booking.                  |
| S44 | [The Open Group — TOGAF Certification Portfolio](https://www.opengroup.org/certifications/togaf-certification-portfolio)                                        | Official current TOGAF 10th Edition and legacy 9.2 paths.                           |
| S45 | [INCOSE SEP Certification](https://www.incose.org/certification/start-your-certification/)                                                                      | Official ASEP/CSEP/ESEP overview; check latest procedure.                           |
| S46 | [INCOSE Exam Information](https://www.incose.org/certification/start-your-certification/taking-the-exam/)                                                       | Official exam scope/logistics; access blocked in one fetch; verify live.            |
| S47 | [CNCF Training & Certification](https://www.cncf.io/training/)                                                                                                  | Official cloud-native credentials and pathways; policies change.                    |

## H. Books (generally commercial)

| Book                                                                     | Main use                                                     |
| ------------------------------------------------------------------------ | ------------------------------------------------------------ |
| Martin Kleppmann, _Designing Data-Intensive Applications_                | Storage, replication, distributed data, streams, consistency |
| Bass, Clements, Kazman, _Software Architecture in Practice_ (4th ed.)    | Quality attributes, architecture design/evaluation           |
| Richards and Ford, _Fundamentals of Software Architecture_               | Styles, characteristics, modularity, decision work           |
| Ford, Parsons, Kua, _Building Evolutionary Architectures_                | Fitness functions and evolution                              |
| Eric Evans, _Domain-Driven Design_                                       | Strategic/tactical domain modeling                           |
| Vaughn Vernon, _Implementing Domain-Driven Design_                       | Applied DDD patterns                                         |
| Michael Nygard, _Release It!_                                            | Production stability and failure patterns                    |
| Brendan Burns, _Designing Distributed Systems_                           | Distributed design patterns                                  |
| Donella Meadows, _Thinking in Systems_                                   | Stocks, flows, feedback, leverage points                     |
| INCOSE, _Systems Engineering Handbook_, 5th ed.                          | Systems lifecycle engineering                                |
| Google, _Site Reliability Engineering_ / _The Site Reliability Workbook_ | Reliability/operations; SRE book also online free            |
| Skelton and Pais, _Team Topologies_                                      | Team boundaries and cognitive load                           |
| Forsgren, Humble, Kim, _Accelerate_                                      | Delivery and organizational performance                      |
| Gerald Weinberg, _An Introduction to General Systems Thinking_           | General systems thinking/problem framing                     |

## Source-quality rules

1. Prefer original standards, official documentation, or primary case studies over copied summaries.
2. Vendor frameworks provide structured guidance, not neutral ranking evidence.
3. Prefer sources with shipped systems, measurable outcomes, or documented incidents over generic commentary.
4. Treat talks and company posts as first-hand but partial perspectives.
5. Record dates; certifications, frameworks, cloud services and courses change.
6. Distinguish preprint, peer-reviewed paper, controlled experiment, case study, and opinion.
7. Do not redistribute copyrighted books/handbooks. Use legitimate publishers, libraries, or licensed access.

## Additional systems-engineering and portal sources

See `sources.csv` IDs S53–S95 for the expanded source register. High-priority additions:

- **NASA competency model and lifecycle:** S53–S59, S80–S82, S92–S95.
- **INCOSE competency, experience areas and standards:** S60–S62.
- **SEBoK:** S63–S66.
- **MBSE and SysML v2:** S67–S68.
- **MIT learning materials:** S69–S71.
- **Role descriptions:** S72 and S97.
- **Reliability, safety and specialty engineering:** S73–S79.
- **Curated portal governance patterns:** S82–S88.
- **Complementary reading/video:** S89–S91.

### Source-use cautions

A source inventory is not an endorsement list. Standards should be checked against their current official editions and applicability. Job postings and vendor pages are context signals. Community-curated portals are useful for learning information architecture and link-review patterns, not for establishing engineering truth. Some standards are paywalled; link to the issuer rather than reproducing text. See `25_KNOWLEDGE_PORTAL_INFORMATION_ARCHITECTURE.md` for the quality rubric.

## User-supplied links and access audit (2026-11-05)

Every user-provided lead is retained in `sources.csv`, with a new source ID and an explicit verification/access note. This is important: a source can be valuable as a lead even when it is paid, gated, private, moved, incomplete, or not yet independently reviewed.

### Canonical and verified resources

- Coursera's generic Systems Engineering lead maps to the current course page, **The Need for Systems Engineering**: https://www.coursera.org/learn/need-for-systems-engineering. The live page showed beginner level, five modules, nine assignments, a shareable certificate option and “Enroll for free”; do not infer that all graded features or the certificate are free.
- The official INCOSE SEBoK landing page is now https://www.incose.org/resources-publications/technical-publications/systems-engineering-body-of-knowledge/. The older `/products-and-publications/se-body-of-knowledge` URL supplied by the user returned a not-found page in the prior check.
- MIT 16.842 is a graduate-level open course with downloadable lecture notes and concept questions: https://ocw.mit.edu/courses/16-842-fundamentals-of-systems-engineering-fall-2015/ and https://ocw.mit.edu/courses/16-842-fundamentals-of-systems-engineering-fall-2015/pages/lecture-notes/. It is historical (Fall 2015), not a current credential.
- NASA NESC Academy's “How to Get Started Using MBSE on a Project” provides a useful model-with-purpose adoption discussion: https://nescacademy.nasa.gov/video/29e48e45cda7432eb1577b5c159bbf6f1d.
- The NASA SE handbook landing page resolves but extraction exposed substantial global-site boilerplate. Use the NASA handbook NTRS PDF and direct chapter pages for actual study.

### Access, editorial and legal distinctions

- **Open courseware:** MIT OCW materials are open learning resources; still preserve MIT attribution and do not imply that viewing them earns MIT credit.
- **Platform courses:** Coursera may offer enrollment without charge while certificates, graded work, specializations or some content can be paid. Verify the specific access path at the time a learner clicks.
- **Commercial/gated resources:** PTC's traceability report landing page shows a vendor lead form. Jama, PTC, O'Reilly and paid training providers should be labeled vendor/commercial and should never be presented as vendor-neutral standards.
- **Private collection:** the supplied Dropbox URL is retained but was not opened or indexed. Import only after individual files are supplied or made accessible; record owner, rights, confidentiality and license before publication.
- **Unreviewed secondary leads:** the supplied Medium and CrisisNow PDF links remain retained as unverified source leads. They require content review before their claims are cited.
- **Curated portals:** Awesome and FMHY are useful for taxonomy, contribution and update-governance patterns. Do not bulk-copy their lists. FMHY's topic is unrelated to systems engineering and includes content that should not be imported into this portal.
- **Books on judgment:** _Systemantics_, _The Four Agreements_, and _The Basic Laws of Human Stupidity_ are deliberately classified as supplementary thought/communication material rather than engineering methods or normative technical authorities.

`sources.csv` now contains 118 records. The `quality_signal` and `limitations` fields are part of the data model; do not discard them when importing.

## G. Standards and methods added in the iceberg expansion

| ID        | Source                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Use / limitation                                                                                                                                                                            |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S119      | [ISO/IEC/IEEE 15288:2023](https://www.iso.org/standard/81702.html)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | System life-cycle process framework; normative text is licensed and must be tailored.                                                                                                       |
| S120      | [ISO/IEC/IEEE 42010:2022](https://www.iso.org/standard/74393.html)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Architecture description: stakeholders, concerns, viewpoints and views; not a single architecture method.                                                                                   |
| S121      | [ISO/IEC/IEEE 29148:2018](https://www.iso.org/standard/72089.html)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Requirements engineering; confirm current status before contractual use.                                                                                                                    |
| S122      | [ISO/IEC/IEEE 42020:2019](https://www.iso.org/standard/68982.html)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Architecture processes.                                                                                                                                                                     |
| S123      | [ISO/IEC/IEEE 24748-1:2024](https://www.iso.org/standard/84709.html)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Life-cycle management guidance.                                                                                                                                                             |
| S124      | [OMG SysML 2.0](https://www.omg.org/spec/SysML/2.0/About-SysML)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Formal modeling language specification, published September 2025; tool support maturity varies.                                                                                             |
| S125      | [SEI Quality Attribute Workshops](https://www.sei.cmu.edu/library/quality-attribute-workshops-qaws-third-edition/)                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Early stakeholder elicitation and prioritization of architecture quality scenarios.                                                                                                         |
| S126      | [TOGAF Standard, 10th Edition](https://publications.opengroup.org/c220)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Enterprise architecture method and governance; licensed standard and needs tailoring.                                                                                                       |
| S127      | [OMG BPMN 2.0.2](https://www.omg.org/spec/BPMN/2.0.2)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Formal process notation; published 2014.                                                                                                                                                    |
| S128      | [arc42 method](https://arc42.org/method/)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Iterative architecture documentation and workflow; not a normative standard.                                                                                                                |
| S129–S130 | [NIST SP 800-160 Vol. 1 Rev. 1](https://csrc.nist.gov/pubs/sp/800/160/v1/r1/final) and [Vol. 2 Rev. 1](https://csrc.nist.gov/pubs/sp/800/160/v2/r1/final)                                                                                                                                                                                                                                                                                                                                                                                                                     | Systems security engineering and cyber-resilient systems across the lifecycle.                                                                                                              |
| S131      | [IEC functional safety](https://www.iec.ch/functional-safety)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Functional-safety overview; licensed IEC standards contain normative requirements.                                                                                                          |
| S132–S135 | [NASA Fault Tree Handbook](https://s3vi.ndc.nasa.gov/ssri-kb/static/resources/Fault%20Tree%20Handbook_NASA.pdf), [NASA common-cause paper](https://ntrs.nasa.gov/api/citations/20160005837/downloads/20160005837.pdf), [ICAO 2026 safety methods](https://www.icao.int/sites/default/files/SMI/TrainingDocs/Chapter%202%20Safety%20Management%20Fundamentals/2.6-09-SRM-Methods-Overview-and-analysis-based-on-systems-thinking-2026.pdf), [MIT STAMP intro](https://psas.scripts.mit.edu/home/wp-content/uploads/2016/04/STAMP-Intro-2016.pdf)                               | Fault-tree, common-cause, STPA and other hazard-analysis context; select methods based on hazard and domain.                                                                                |
| S136–S139 | [NIST AI RMF](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf), [NIST GenAI Profile](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf), [Secure AI Development Guidelines](https://www.ncsc.gov.uk/files/Guidelines-for-secure-AI-system-development.pdf), [AWS GenAI Lens](https://docs.aws.amazon.com/pdfs/wellarchitected/latest/generative-ai-lens/generative-ai-lens.pdf)                                                                                                                                                                                   | AI governance, GenAI-specific risks, secure lifecycle and vendor-specific cloud guidance.                                                                                                   |
| S140–S144 | [Fowler Data Guide](https://martinfowler.com/data/), [Microsoft Data-Heavy Design](https://microsoft.github.io/code-with-engineering-playbook/design/design-patterns/data-heavy-design-guidance/), [Fowler modular architecture/teams](https://martinfowler.com/articles/linking-modular-arch.html), [Socio-technical congruence paper](https://doi.org/10.1109/TSE.2011.29), [Architectural debt research](https://research.chalmers.se/publication/522928/file/522928_Fulltext.pdf)                                                                                         | Data mesh, consistency, team/architecture relationships and technical-debt research; context-sensitive.                                                                                     |
| S145–S147 | [Complex Systems textbook](http://cps-www.bu.edu/hes/book-thurner18.pdf), [System dynamics primer](https://www.informs-sim.org/wsc18papers/includes/files/024.pdf), [Systems thinking/system dynamics methodology](https://proceedings.systemdynamics.org/2000/PDFs/cavana41.pdf)                                                                                                                                                                                                                                                                                             | Quantitative complexity and system-dynamics models; validate assumptions and fit.                                                                                                           |
| S148–S151 | [TOGAF certifications](https://publications.opengroup.org/certifications/togaf), [INCOSE SEP 2026 requirements](https://www.incose.org/wp-content/uploads/2026/01/CER-PROC-01_Certification-Program-Definition-and-Requirements_2026.pdf), [ASQ CRE](https://www.asq.org/cert/reliability-engineer), [ISC2 CISSP outline](https://www.isc2.org/certifications/cissp/cissp-certification-exam-outline)                                                                                                                                                                         | Credential-owner sources; eligibility, costs and exams change.                                                                                                                              |
| S152–S156 | [FinOps Framework](https://www.finops.org/framework/), [NIST SSDF](https://csrc.nist.gov/pubs/sp/800/218/final), [OWASP threat modeling](https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html), [CISA Secure by Design](https://www.cisa.gov/securebydesign), [NIST cloud security reference architecture](https://csrc.nist.gov/pubs/sp/800/223/final)                                                                                                                                                                                            | Cost/value management, secure development, threat modeling, secure-by-design and cloud security.                                                                                            |
| S157–S165 | [ISO 27001](https://www.iso.org/standard/27001), [ISO 22301](https://www.iso.org/standard/75106.html), [ISO 31000](https://www.iso.org/iso-31000-risk-management.html), [ISO/IEC 42001](https://www.iso.org/standard/81230.html), [ISA/IEC 62443](https://www.isa.org/standards-and-publications/isa-standards/isa-iec-62443-series-of-standards), [ISO 26262](https://www.iso.org/standard/68383.html), [ISO 21448](https://www.iso.org/standard/77490.html), [ISO 14971](https://www.iso.org/standard/72704.html), [IEC 62304](https://webstore.iec.ch/en/publication/6792) | Information security, continuity, risk, AI management, OT security, automotive safety/SOTIF and medical-device risk/software lifecycle. Applicability is sector- and jurisdiction-specific. |

### Source count and update status

The structured `sources.csv` register contains **222 unique source records** at this snapshot (5 November 2026). The source IDs are stable references within this repository version; do not assume a source is still current without checking the issuer, revision and jurisdiction. Several standards are paywalled or licensed: this repository links to official catalogues and summarizes scope but does not reproduce normative text.

## H. High-signal research additions

The deep expansion gives particular weight to the SEBoK overview, INCOSE's current standards list, ISO life-cycle and architecture standards, OMG's formal SysML 2.0 specification, CMU SEI's ATAM/QAW methods, NIST systems-security engineering, NIST AI risk guidance, multi-agency secure-AI development guidance, IEC functional safety, NASA reliability/safety handbooks, and first-hand engineering research. The document-level notes explain where each source is authoritative and where it is limited.

## I. Additional domain and tool references

| ID   | Source                                                                                                                                                                         | Use / quality note                                                                                                  |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| S167 | [NASA Product Integration](https://www.nasa.gov/reference/5-2-product-integration/)                                                                                            | Integration and assembly process guidance; pair with an actual project integration strategy.                        |
| S168 | [NASA Integration Plan Outline](https://www.nasa.gov/reference/appendix-h-integration-plan-outline/)                                                                           | Plan outline for sequencing, resources, strategy and verification; tailor to system and facilities.                 |
| S169 | [NASA Life Cycle Logistics Support Guidebook](https://www.nasa.gov/wp-content/uploads/2023/02/nasa_lcls_guidebook.pdf)                                                         | Maintenance, supply, technical data, workforce, training, tools, facilities and sustainment across lifecycle.       |
| S170 | [Principles of Cyber-Physical Systems](https://www.cis.upenn.edu/~alur/pcps.html)                                                                                              | Rajeev Alur’s advanced text across control, formal methods, concurrency, real-time and hybrid systems.              |
| S171 | [Operational Research Society — OR Methods](https://www.theorsociety.com/ORS/ORS/About-OR/OR-Methods.aspx)                                                                     | Professional-society index of optimization, simulation, queueing, decision analysis and problem structuring.        |
| S172 | [Texas A&M — Operations Research](https://engineering.tamu.edu/industrial/research/operations-research.html)                                                                   | University research overview of optimization, stochastic systems, simulation and decision-making under uncertainty. |
| S173 | [ITU-T L.1801 (2026)](https://www.itu.int/epublications/publication/itu-t-l-1801-2026-02-guidelines-for-assessing-the-environmental-impact-of-artificial-intelligence-systems) | AI environmental impact assessment using lifecycle methods; includes direct and higher-order effects.               |
| S174 | [NIST Circular Economy in the High-Tech World](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.1500-204.pdf)                                                     | Reuse, repair and recycling in electronics, solar panels and batteries; workshop report, not normative standard.    |
| S175 | [Structurizr documentation](https://docs.structurizr.com/)                                                                                                                     | C4 models as code and reproducible architecture views; check current licensing/deployment model.                    |
| S176 | [PlantUML](https://plantuml.com/)                                                                                                                                              | Text-based diagramming; verify licensing and rendering environment.                                                 |
| S177 | [Cameo Systems Modeler documentation](https://docs.nomagic.com/spaces/CSM2024x/pages/136723595/Cameo+Systems+Modeler+Documentation)                                            | Version-specific MBSE tooling documentation; commercial tool and version compatibility caveat.                      |
| S178 | [OMG SysML v2 release repository](https://github.com/systems-modeling/sysml-v2-release/)                                                                                       | Specification artifacts, examples and pilot editor implementations; pilot status is not production certification.   |
| S179 | [NASA-STD-87291](https://standards.nasa.gov/standard/NASA/NASA-STD-87291)                                                                                                      | R&M planning, design, evaluation and operation for NASA spaceflight/support systems; check current applicability.   |

## J. Third-pass expert research sources (S180 onward)

The third pass adds source records across systems methods, mission engineering, formal requirements, architecture governance, distributed correctness, data mesh/lakehouse, PRA/CCF/PoF, STPA, cyber resilience, formal methods, human-machine teaming, real-time CPS, OR, functional safety, incident investigations and agentic AI. The complete records and limitations are in [`sources.csv`](sources.csv); extraction status is in [`DEEP_SCRAPE_AUDIT.csv`](DEEP_SCRAPE_AUDIT.csv). Important high-signal additions include:

- [DoD Mission Engineering Guide 2.0](https://ac.cto.mil/wp-content/uploads/2023/11/MEG_2_Oct2023.pdf) and the [September 2026 Systems Engineering Guidebook](https://www.cto.mil/wp-content/uploads/2026/09/SE-Guidebook-2026.pdf).
- [NASA Systems Modeling Handbook 1009A](https://standards.nasa.gov/system/files/tmp/2025-03-12-NASA-HDBK-1009A.pdf), NASA requirements/interface/integration process pages, and [NASA lifecycle logistics](https://www.nasa.gov/wp-content/uploads/2023/02/nasa_lcls_guidebook.pdf).
- [SEI ATAM original report](https://www.sei.cmu.edu/documents/629/2000_005_001_13706.pdf), [Spanner](https://static.googleusercontent.com/media/research.google.com/en/us/pubs/archive/39966.pdf), the [Data Mesh systematic review](https://arxiv.org/html/2304.01062), and [Data Lakehouse research](https://arxiv.org/html/2310.08697).
- [NASA PRA procedures](https://ntrs.nasa.gov/api/citations/20120001369/downloads/20120001369.pdf), [NASA system safety handbook](https://ntrs.nasa.gov/api/citations/20120003291/downloads/20120003291.pdf), [STPA Primer](https://psas.scripts.mit.edu/home/wp-content/uploads/2013/10/An-STPA-Primer-version-0-4.pdf), and [NASA Physics-of-Failure handbook](https://ntrs.nasa.gov/api/citations/20230004376/downloads/20230004376.pdf).
- [NIST cyber-resiliency engineering](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-160v2r1.pdf), [NIST SSDF](https://nvlpubs.nist.gov/nistpubs/specialpublications/NIST.SP.800-218.pdf), and [NIST C-SCRM](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-161r1-upd1.pdf).
- [OWASP Top 10 for Agentic Applications 2026](https://genai.owasp.org/download/52117/) and [Australian Cyber Security Centre agentic AI guidance](https://www.cyber.gov.au/publication/careful-adoption-of-agentic-ai-services).
- First-party and independent incident sources: [CrowdStrike RCA](https://www.crowdstrike.com/wp-content/uploads/2024/08/Channel-File-291-Incident-Root-Cause-Analysis-08.06.2024.pdf), [CAA NATS review](https://www.caa.co.uk/publication/download/23337), and [NTSB AIR-25-04](https://www-s.ntsb.gov/investigations/AccidentReports/Reports/AIR2504.pdf).

The third-pass source map includes sources found but not fully scraped. Do not use the source table as evidence that every linked document was reviewed; consult the audit.

## Latest primary-source additions (documents 82–95)

The additional research register includes the 2026 DoW System of Systems Engineering Guidebook [S94], NATO Architecture Framework v4.1 [S249], GSN Community Standard v3 [S246], NASA human-machine teaming technical memorandum [S218], NASA configuration management/process guidance [S250, S253], DoW Value Engineering guidebook [S254], product-line requirements research [S251], lifecycle and SoS standards status records [S119, S255–S257], AI/ICT environmental recommendations [S258–S259], RCM/IP support sources [S75–S262], and data-platform research [S263, S268].

Use `sources.csv` as the canonical record and `DEEP_SCRAPE_AUDIT.csv` for fetch status. In particular, NASA-STD-0005 is explicitly inactive for new design [S250], and ISO/IEC/IEEE 21839 edition 2 was still under publication on 2026-11-05 [S256].

## Decision and execution sources (documents 96–102)

- NASA decision analysis, SEMP outline and technical planning [S269–S271].
- NASA NPR 7123.1D technical review entrance and success criteria [S272].
- ISO/IEC/IEEE 42030:2019 architecture evaluation framework [S273].
- Google SRE SLI/SLO and risk/error-budget practice [S274–S275].
- NASA trade-study methods (Pugh, AHP, Kepner-Tregoe) [S276].
- DoD IMP/IMS integration guide, Change 1 October 2024 [S277].

## Fourth/fifth-level deep research sources added (103–110)

- [NASA System Safety Handbook Volumes 1–2](https://ntrs.nasa.gov/api/citations/20120003291/downloads/20120003291.pdf) and [Volume 2](https://ntrs.nasa.gov/api/citations/20150015500/downloads/20150015500.pdf) — objective-driven system safety, integrated safety analysis and risk-informed safety cases.
- [STPA Primer](https://psas.scripts.mit.edu/home/wp-content/uploads/2013/10/An-STPA-Primer-version-0-4.pdf) — system-theoretic hazard analysis tutorial; 2013 and explicitly incomplete on advanced topics.
- [IEEE 1012-2024](https://standards.ieee.org/ieee/1012/7324/) and [NASA V&V Plan Outline](https://www.nasa.gov/reference/appendix-i-verification-and-validation-plan-outline/) — lifecycle verification and validation.
- [NASA-STD-7009B](https://standards.nasa.gov/standard/NASA/NASA-STD-7009) and [NASA-HDBK-1009A](https://standards.nasa.gov/standard/NASA/NASA-HDBK-1009) — model/simulation credibility and SysML integration with NASA engineering work products.
- [GSFC-STD-7000B](https://standards.nasa.gov/standard/GSFC/GSFC-STD-7000) and [GSFC-HDBK-8004](https://standards.nasa.gov/standard/GSFC/GSFC-HDBK-8004) — environmental verification and living FMECA/risk assessment for GSFC context.
- [FAA AC 20-115D](https://www.faa.gov/regulations_policies/advisory_circulars/index.cfm/go/document.information/documentID/1032046) and [AC 20-152A](https://www.faa.gov/regulations_policies/advisory_circulars/index.cfm/go/document.information/documentID/1041323) — airborne software and hardware development assurance, respectively.
- [ISO 21448:2022](https://www.iso.org/standard/77490.html), [ISO/PAS 8800:2024](https://www.iso.org/standard/83303.html), [IEC 62304](https://www.iso.org/standard/38421.html), [ISO 14971](https://www.iso.org/standard/72704.html) and [FDA February 2026 cybersecurity guidance](https://www.fda.gov/regulatory-information/search-fda-guidance-documents/cybersecurity-medical-devices-quality-management-system-considerations-and-content-premarket) — automotive, AI, medical software and medical-device risk/security contexts.
- [ISO 15288:2023](https://www.iso.org/standard/81702.html), [ISO 29148:2018](https://www.iso.org/standard/72089.html), [ISO DIS 29148 Ed.3](https://www.iso.org/standard/94091.html), [ISO 42010](https://www.iso.org/standard/74393.html), [ISO 42020](https://www.iso.org/standard/68982.html), [ISO 42030](https://www.iso.org/standard/73436.html), [ISO 21839 Ed.2 status](https://www.iso.org/standard/91120.html), [IEC 61508-1:2026 PRV](https://webstore.iec.ch/en/publication/117296) — versioned standards status; draft/pre-release material must not be presented as published normative requirements.

See `sources.csv`, `DEEP_SCRAPE_AUDIT.csv` and `109_STANDARDS_REVISION_WATCH_AND_NORMATIVE_STATUS_2026_11_05.md` for source status and limitations.

## Quantitative reliability statistics added (111)

- [NIST Weibull model](https://www.itl.nist.gov/div898/handbook/apr/section1/apr162.htm), [censoring](https://www.itl.nist.gov/div898/handbook/apr/section1/apr131.htm), [MLE/censored-data estimation](https://www.itl.nist.gov/div898/handbook/apr/section4/apr41.htm) and [Weibull/lognormal test planning](https://www.itl.nist.gov/div898/handbook/apr/section3/apr312.htm) — statistical method sources.
- [MIL-HDBK-189C DLA record](https://quicksearch.dla.mil/qsDocDetails.aspx?ident_number=53928) — reliability growth management.
- [NASA Physics of Failure Handbook](https://ntrs.nasa.gov/api/citations/20230004376/downloads/20230004376.pdf) — NASA/SP-20230004376, Version 1.0.3, June 2024.
- [ISO 14224:2016](https://www.iso.org/standard/64076.html) — reliability/maintenance field data taxonomy for petroleum, petrochemical and gas.
- [IEC 61709:2017](https://webstore.iec.ch/en/publication/28554) — failure-rate reference conditions and stress conversion; does not provide base rates.
- [SAE JA1011_202411](https://saemobilus.sae.org/standards/ja1011_202411-evaluation-criteria-reliability-centered-maintenance-rcm-processes) — current RCM process evaluation criteria.

## Additional evidence and standards directory sources

- [NASA SWE-141](https://swehb.nasa.gov/spaces/SWEHBVD/pages/102695499/SWE-141+-+Software+Independent+Verification+and+Validation) and [SWE-072](https://swehb.nasa.gov/spaces/7150/pages/16449898/SWE-072+-+Bidirectional+Traceability+Between+Software+Test+Procedures+and+Software+Requirements) support IV&V and traceability discussions.
- [GSN Standard](https://scsc.uk/gsn-standard) defines the current version 3 notation; [ERA CSM](https://www.era.europa.eu/domains/common-safety-methods/risk-evaluation-assessment-csm_en) identifies EU railway risk-assessment regulation and guidance.
- [ISO/IEC/IEEE 24748-1:2024](https://standards.ieee.org/ieee/24748-1/10942/) complements 15288/12207 lifecycle management. [NASA Technical Standards](https://standards.nasa.gov/) and [NASA Center Standards](https://standards.nasa.gov/center-specific-standards) provide source-of-record status listings.
- [NASA product verification](https://www.nasa.gov/reference/5-3-product-verification/) and a system dynamics [model critique paper](https://metasd.com/wp-content/uploads/2010/03/SDModelCritique.pdf) supplement the fifth- and sixth-level methods. These sources have discovery-only status in the scrape audit where not fetched.

## Repairable systems, prognostics and quantitative dependability

- **S318–S320:** NIST repairable-system HPP/NHPP, power-law and reliability-growth methods.
- **S321–S322:** NASA Markov state-space reliability tutorials for fault-tolerant architectures, standby, repair and reconfiguration.
- **S323–S327:** ISO 13381-1:2025, PHM tutorial, NASA filter-based prognostics research, prognostics chapter and NASA ProgPy.

## Manufacturing, obsolescence, measurement and lifecycle support

- **S328–S329:** NASA workmanship implementation and EEE parts assurance standards.
- **S330:** DLA DMSMS programme page; confirms SD-22 January 2026 update, but the updated PDF was not retrieved.
- **S331–S333:** NASA Common Leading Indicators, ISO/IEC/IEEE 15939:2017 and NASA Logical Decomposition.
- **S338–S341:** IPS Guidebook, DoDI 5000.91, PSM Guidebook and MIL-HDBK-1390 LORA; extraction limitations are stated in the audit.

## Bayesian and risk-informed decisions

- **S334–S336:** NASA RIDM Handbook, Bayesian Inference for PRA/Reliability and NASA Risk Management Handbook.

## Sixth-level research: dependability, PHM, manufacturing, obsolescence and support

- **S318–S322:** NIST repairable-system HPP/NHPP/ROCOF models and NASA Markov state-space reliability tutorials.
- **S323–S327:** ISO 13381-1:2025; NASA PHM tutorial, filter-based prognostics paper, PHM chapter and ProgPy software.
- **S328–S329:** NASA workmanship implementation and EEE-parts assurance standards.
- **S330:** DLA DSP DMSMS page; SD-22 update listed as January 2026 (PDF not retrieved). **S348** is only the historical March 2024 working draft.
- **S331–S333:** NASA Common Leading Indicators, ISO/IEC/IEEE 15939 measurement process and NASA logical decomposition.
- **S334–S336:** NASA RIDM, Bayesian inference and risk-management handbooks. **S75** adds the DoW R&M engineering body of knowledge.
- **S338–S341:** DoD/DoW IPS guidebooks, DoDI 5000.91, PSM guidebook and DLA LORA handbook record; extraction/access limits are in the audit.
- **S346–S349:** RAND RDM, ASD S-Series specifications portal and a secondary reliability-method selection reference.

## Recovered source records from earlier advanced volumes

- **S94:** DoW System of Systems Engineering Guidebook (September 2026).
- **S119:** ISO/IEC/IEEE 15288:2023 system lifecycle process standard record.
- **S93:** DoW Systems Engineering Guidebook (September 2026).
- **S252:** ACSC AI considerations in the Essentials.
- **S75:** DoW Reliability and Maintainability Engineering Management Body of Knowledge (December 2025).
