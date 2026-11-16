# 62 — Mission engineering, mission architecture and operational analysis

## Scope

Mission engineering starts from an end-to-end operational outcome and asks how capabilities, people, organizations, data, systems, tactics, timing and interfaces combine to produce it. It is broader than engineering one platform or one software product. The DoD Mission Engineering Guide 2.0 (1 October 2023) describes the discipline and its analytical process [S186]; the September 2026 Systems Engineering Guidebook connects mission engineering to systems engineering and the acquisition lifecycle [S93].

## Core distinctions

- **Mission objective:** the outcome the mission must achieve.
- **Mission thread (MT):** an end-to-end sequence of operational tasks and activities needed to execute a mission objective.
- **Mission engineering thread (MET):** a more detailed representation connecting mission tasks to the capabilities, technologies, systems, people, organizations, information exchanges and interfaces that realize them.
- **Capability:** an ability to perform an operational activity under stated conditions.
- **MOE — measure of effectiveness:** evidence that the mission-level effect or objective is achieved.
- **MOP — measure of performance:** measurable performance characteristics of systems or actors performing the mission tasks.
- **MOS — measure of success:** measurable attributes/targets for overall mission success in its operating environment.
- **Metric:** the specific quantity and calculation method used to express a measure.

Do not substitute a system's component performance for mission effectiveness. Faster message processing (a MOP) does not prove a mission objective was achieved (an MOE).

## Mission engineering workflow

1. **Frame the mission and decision.** State the operational objective, threat/competition context, mission boundary, sponsor, decision to be informed and time horizon.
2. **Establish the operational baseline.** Describe the current mission, actors, capabilities, constraints, systems, dependencies, environment and known shortfalls.
3. **Develop the mission architecture.** Represent tasks, activities, sequence, information exchanges, decisions, actors, interfaces and relevant system-of-systems dependencies.
4. **Construct mission threads and METs.** Develop “as-is” and “to-be” threads, including variants, degraded conditions, adversary actions and alternative concepts.
5. **Define measures.** Tie each objective to MOEs; connect them to MOPs and lower-level technical parameters. Give each metric a unit, method, source, threshold/target and uncertainty.
6. **Design the analysis.** Define alternatives, scenarios, assumptions, model/simulation scope, required data, run matrix and resource needs.
7. **Execute and interrogate the evidence.** Run analytical models, experiments, simulations, tabletop exercises or operational tests. Verify input data and model validity.
8. **Compare alternatives.** Evaluate mission-level effects, risks, cost, schedule, interoperability, resilience and sensitivity to assumptions.
9. **Recommend and preserve evidence.** Record decision rationale, model versions, data provenance, assumptions, unresolved gaps and follow-up experiments.

The MEG 2.0 contents cover mission engineering context, mission architectures, mission threads, METs, baseline/alternative thread construction, analysis design, run matrices, computational methodology/simulation, datasets, and analysis [S186].

## Architecture frameworks

DoDAF v2.02 and the OMG Unified Architecture Framework (UAF) are frameworks for organizing architecture descriptions and viewpoints. They are not mission models that automatically establish operational truth. Select views based on stakeholder concerns and decisions; do not produce every view merely because a framework contains it. The official DoDAF site describes v2.02 as the approved release [S188]. The 2025 Mission Architecture Style Guide provides additional guidance for documenting mission architectures [S189].

## Analysis design: minimum run-matrix fields

| Dimension        | Examples                                                       |
| ---------------- | -------------------------------------------------------------- |
| Mission thread   | Baseline, alternative A/B, degraded thread                     |
| Scenario         | Environment, threat, demand, timing, operating conditions      |
| Configuration    | Systems, actors, software versions, capabilities, interfaces   |
| Assumptions      | Availability, data latency, capacity, operator proficiency     |
| MOE/MOP/MOS      | Operational effect, component performance, mission success     |
| Model/experiment | Simulation, analytic model, test, exercise or combination      |
| Data             | Source, date, quality, uncertainty, transformation             |
| Trial            | Identifier, configuration, parameters, random seed if relevant |
| Result           | Value, confidence/uncertainty, failure observations, caveats   |

## Important failure modes

- Starting with a preferred platform rather than the mission objective.
- Measuring what is easy to count rather than what constitutes mission success.
- Treating a mission thread as a happy-path sequence and ignoring denial, delay, loss or adversarial adaptation.
- Assuming each system's local reliability composes into mission reliability without dependency analysis.
- Using a simulation outside its valid envelope or hiding data uncertainty.
- Ignoring people, training, authorities, logistics, doctrine, policy and organizational interfaces.
- Presenting a single weighted score without exposing weights, hard constraints and uncertainty.

## Decision standard

A mission-engineering recommendation should say: **under which scenario, for which mission objective, with what configuration and assumptions, which alternative produces what measured operational effect, at what risk and lifecycle cost, with what confidence?** If that statement cannot be answered, the evidence is not yet decision-grade.
