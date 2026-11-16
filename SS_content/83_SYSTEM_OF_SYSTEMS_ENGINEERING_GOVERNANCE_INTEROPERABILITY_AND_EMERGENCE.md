# 83 — System-of-systems engineering: governance, interoperability and emergence

## What makes an SoS different

A system of systems is not simply a very large system. Maier's widely used characterization identifies operational independence and managerial independence of constituent systems as the distinguishing properties, alongside geographic distribution, emergent behaviour and evolutionary development. These characteristics are not a checklist that automatically classifies every complex product as an SoS; operational and managerial independence are the key distinction in the cited SEBoK framing. [S43, S93]

Constituent systems may have different owners, missions, budgets, release cycles, safety authorities, users, data policies and technology stacks. The SoS engineer therefore cannot assume full command of every constituent's design or roadmap. Influence, interface agreements, collaboration patterns, architecture governance and mission-level evidence often matter more than detailed control of each component.

## Four collaboration patterns

The 2026 DoW guidebook describes the familiar SoS types—virtual, collaborative, acknowledged and directed—as different governance and authority arrangements. In practice, these differ in the extent to which an SoS-level authority is recognized and can direct constituent system decisions. The correct governance pattern is a design decision: it affects change authority, funding, interface ownership, integration test rights, and the ability to impose mission-level constraints. [S94]

A virtual SoS may emerge without a recognized central manager; a collaborative SoS is coordinated by constituent owners; an acknowledged SoS has an accepted SoS lead/management structure but constituent owners retain substantial authority; a directed SoS has stronger central authority over constituent systems. These are ideal types; actual programmes may blend arrangements or change governance over time.

## The engineering challenge is at the boundaries

The most difficult SoS defects frequently arise from mismatch among otherwise functioning systems:

- data semantics differ even where message schemas match;
- timing, latency and time synchronization assumptions do not align;
- system-level objectives conflict with the incentives of constituent owners;
- interfaces are designed locally but do not support end-to-end mission threads;
- authority and funding do not cover the changes required for interoperability;
- upgrades or policy changes occur on different schedules;
- emergent behaviour appears only through combinations of functions and operating contexts.

Thus interoperability includes technical, semantic, procedural, organizational, legal, security and mission dimensions. A common protocol is necessary but rarely sufficient.

## SoS engineering workflow

1. **Frame the mission or enterprise outcome.** State the operational effect, mission measures, constraints and relevant non-material factors such as training, policy and procedures.
2. **Bound the SoS context.** Identify constituent systems, external systems, owners, users, operators, authorities, data stewards and relevant natural/human environments.
3. **Characterize independence and authority.** Determine what can be changed centrally, negotiated, coordinated or not changed at all.
4. **Construct mission threads.** Trace tasks, actors, systems, data, decisions, effects and timing from end to end. Include nominal, degraded, adversarial and recovery paths.
5. **Identify capability gaps and dependencies.** Distinguish a missing system capability from a data, training, process, authority or coordination gap.
6. **Model interfaces and semantic contracts.** Specify ownership, data meaning, timing, availability, security, schema versioning, failure handling and change notification.
7. **Analyze emergent and common-cause behaviour.** Include shared identity providers, clocks, navigation sources, data feeds, update infrastructure, network routes and human procedures.
8. **Agree governance and change mechanisms.** Define decision rights, funding, change forums, interface control, dispute escalation and acceptance.
9. **Validate mission-level performance.** Test end-to-end effects, not only constituent system conformance.
10. **Operate a learning loop.** Use operational data, incident reports, change proposals and mission measures to re-evaluate the SoS architecture.

## Architecture and standards alignment

ISO/IEC/IEEE 21839:2019 defines SoS considerations for constituent systems across lifecycle stages. The ISO record for edition 2 reported “under publication” as of 5 November 2026; that status is not equivalent to a published normative edition. [S255, S256] The 2026 DoW SoS guidebook expands implementation and adds appendices on data-centricity, AI and zero-trust cybersecurity. [S94]

The NATO Architecture Framework v4.1 (March 2026) is a current alliance-level architecture framework for communicating and aligning architecture information. It should be used where the NATO context calls for it, not treated as a universal replacement for DoDAF, UAF or ISO architecture-description requirements. [S249]

## Quantify mission-level interoperability

For a mission thread, define:

- success probability across the full path;
- latency distribution and deadline miss probability;
- data completeness, freshness and semantic validity;
- degraded-mode throughput;
- recovery time and recovery point;
- number and criticality of external dependencies;
- interface-change lead time and compatibility failure rate;
- mission availability and consequence-weighted failure exposure.

A product of independent constituent availabilities is only a first approximation. Shared dependencies and correlated failures violate independence assumptions. Use fault trees, dependency graphs, common-cause models and scenario analysis where consequences justify the effort.

## Practical deliverable

Design an SoS architecture for emergency response involving dispatch, mobile networks, hospitals, traffic systems, cloud services and field responders. Map one end-to-end mission thread; identify independent owners, at least five interface contracts, two shared dependencies, one governance conflict, one emergent risk and a test plan that measures mission outcome rather than only API success.

## Source limitations

The DoW guidebook and NAF describe specific institutional frameworks. ISO normative text is licensed. SEBoK is a secondary curated body of knowledge. Tailor methods to actual governance rights and applicable law. [S43, S93, S249, S255]
