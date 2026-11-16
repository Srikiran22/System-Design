# 84 — Architecture frameworks: DoDAF, UAF, NAF and semantic interoperability

## Frameworks solve different problems

An architecture framework organizes architecture descriptions so that different stakeholders can reason about a system, enterprise or mission using consistent concerns and representations. A framework is not the architecture itself, a software modelling tool or an automatic design method.

- **DoDAF 2.02 / DM2:** DoD-oriented architecture content and a meta-model for precise data semantics and exchange. DM2 organizes concepts through conceptual, logical and physical-exchange layers and is intended to support discovery, understanding, federation and analysis of architecture data. [S188]
- **UAF 1.2:** OMG architecture framework with a Domain Meta-Model (DMM) and UAF Modeling Language (UAFML). It organizes views around stakeholder viewpoints and architectural aspects, supporting enterprise, mission, SoS and cyber-physical architecture. [S190]
- **NAF 4.1:** NATO framework for architecture documentation, viewpoints, interoperability and decision support across Alliance contexts. Version 4.1 is dated March 2026. [S249]
- **ISO/IEC/IEEE 42010:** architecture-description requirements. It distinguishes an architecture from the architecture description that expresses it; the description is organized around stakeholders, concerns, viewpoints, views, rationale and correspondences. [S120]
- **TOGAF / ArchiMate:** enterprise architecture method and modelling language; neither should be confused with a sector-specific operational or system safety assurance method. [S140, S141]

## Selection logic

Choose a framework based on the stakeholders, decisions and information exchanges required. Do not begin by asking which diagram set a tool supports. Ask:

1. Which decisions must the architecture support: mission capability, acquisition, design, investment, security, operations, interoperability or governance?
2. Which stakeholders need which views, and what concerns must those views answer?
3. Is data exchange/federation required across organizations or tools?
4. Is the model a descriptive record, an analytical model, a contractual deliverable or a live engineering model?
5. What semantic precision and traceability are needed?
6. What framework is mandated by contract, regulator, enterprise policy or alliance agreement?
7. How will models be versioned, reviewed, queried, validated and kept synchronized with implemented systems?

## Diagram compliance is not semantic conformance

A diagram may look like an operational view but still carry ambiguous semantics. DM2's value is not merely a set of diagram labels; it establishes constrained vocabulary, relationships and exchange semantics. Likewise, UAF's domain meta-model and machine-readable elements are not decorative notations. A model that cannot preserve element identity, relationships, provenance and version history may be unsuitable for federation and automated analysis. [S188, S190]

## Viewpoint and view design

A viewpoint defines conventions for constructing and interpreting a view to address stakeholder concerns. A view is a particular representation of the architecture. A good view:

- states its stakeholder and concern;
- defines scope and system boundary;
- identifies included elements and relationships;
- states source data and model version;
- records assumptions, exclusions and rationale;
- uses consistent semantics and controlled vocabulary;
- links to other views through explicit correspondence rules.

Avoid the “diagram zoo”: large collections of disconnected views with duplicated names, different identifiers and inconsistent relationships. Prefer a coherent model with multiple fit-for-purpose views generated from shared information.

## Semantic interoperability checklist

| Layer      | Required control                                                                     |
| ---------- | ------------------------------------------------------------------------------------ |
| Identity   | Stable identifiers for systems, capabilities, functions, interfaces and data objects |
| Semantics  | Agreed definitions, units, codes, cardinality and time meaning                       |
| Structure  | Explicit relationships, decomposition, allocation and dependencies                   |
| Exchange   | Machine-readable schema, versioning, validation rules and transfer process           |
| Governance | Data owner, change authority, approval and dispute path                              |
| Provenance | Source, author, time, tool version, transformation and confidence                    |
| Lifecycle  | Baseline, status, configuration, retirement and migration behavior                   |

## Example: mission architecture federation

An architecture team models a mission thread in UAF, exchanges data with a DoDAF-aligned programme repository, and shares views with NATO stakeholders using NAF conventions. The exchange requires more than diagram export: identifier mapping, semantic mapping, version management, provenance, role-based access, and explicit treatment of unmapped or lossy concepts. A correct export file that changes the meaning of a timing attribute is an interoperability failure.

## Practical deliverable

Model one logistics mission with stakeholders, capabilities, operational activities, services, resources, data and security aspects. Produce (a) a viewpoint catalogue, (b) an element identity/semantic dictionary, (c) a traceability matrix between three views, (d) an exchange schema and compatibility plan, and (e) a list of known semantic losses between two chosen frameworks.

## Source limitations

DoDAF 2.02 and UAF 1.2 are specific framework releases. NAF 4.1 is a NATO framework. Normative ISO content may be licensed. Framework adoption does not itself guarantee architectural quality or implementation consistency. [S120, S188, S190, S249]
