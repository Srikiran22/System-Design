# 93 — Incident forensics: causal analysis, organizational learning and design feedback

## A disciplined incident model

Do not reduce an incident to its initiating event or the last visible operator action. Build a causal explanation that separates:

- mission/service context and system boundary;
- initiating trigger;
- technical mechanism and propagation path;
- latent design, test, data, process and interface conditions;
- organizational and supplier conditions;
- detection, containment and recovery;
- consequences for users and dependent systems;
- corrective actions and evidence of effectiveness.

A causal graph should distinguish necessary, sufficient, contributing and contextual factors. It should show evidence for each edge and alternative explanations considered.

## Compare incidents by engineering mechanism

### CrowdStrike Channel File 291

The first-party RCA describes an interface mismatch between an IPC template expecting 21 input parameters and an interpreter path that supplied 20, resulting in an out-of-bounds memory read and system crash. Lessons include schema/contract validation, boundary checks, rollout controls and the special consequences of a security sensor running with privileged kernel access. [S224]

### NATS flight-planning system failure

The UK CAA independent review covers causes, system design, resilience, contingency, industry communication, investment and consumer impact. The failure exposed the relationship between automated processing, manual fallback throughput and sector-level contingency. [S225]

### Alaska Airlines Flight 1282

The NTSB AIR-25-04 report is a regulator investigation into an in-flight door-plug separation and rapid depressurization. The PDF was not fetched in this research pass; use the official report as the controlling source and do not replace findings with a short press-summary narrative. [S226]

### Ariane 501 and RTGS outage

The Ariane 501 inquiry and the Bank of England RTGS outage review are retained as discovery-only sources in this pass. They are useful candidate studies for reused software assumptions, correlated redundancy failure, configuration-change risk and rare operational paths, but the full reports were not successfully fetched here. Do not claim detailed conclusions solely from the source list. [S227, S228]

## Incident-to-engineering feedback loop

For every material finding, ask:

1. Which stakeholder need or requirement was incomplete or ambiguous?
2. Which architecture decision or interface assumption enabled the failure?
3. Which design control should prevent or limit recurrence?
4. Which verification/validation method could have detected the issue earlier?
5. Which operational signal or SLO should detect it in service?
6. Which fallback/degraded mode should contain impact?
7. Which shared dependency or common-cause factor defeats redundancy?
8. Which governance, supplier or staffing process created the conditions?
9. What change is required to baseline, training, maintenance or incident response?
10. What test will prove the corrective action works across relevant variants?

## Distinguish corrective action from evidence

“Add more testing,” “improve communication” or “increase redundancy” are not complete corrective actions. A corrective action names an owner, a design/process change, the affected baseline, a measurable acceptance criterion, a verification method and a time at which effectiveness will be reviewed.

## Practical deliverable

Select one fetched incident and one discovery-only incident. Build separate causal timelines, classify evidence confidence, derive at least five engineering controls, identify which recommendations are directly supported versus inferred, and write a regression/assurance plan for the changed system.

## Source limitations

CrowdStrike is a first-party RCA; CAA NATS is an independent regulator review. NTSB is an independent investigation source but the full PDF was not extracted here. Ariane 501 and Bank of England RTGS reports remain discovery-only in this pass. [S224–S228]
