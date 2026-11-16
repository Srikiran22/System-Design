# 98 — SEMP, technical planning, IMP/IMS and engineering execution control

## Technical planning connects design intent to executable work

A systems engineering management plan (SEMP) explains what technical work will be done, how it will be applied, who will do it, what resources are required and how work products and decisions will be integrated. NASA describes the SEMP as the foundation document for technical and engineering activities; it can be standalone or embedded in higher-level project documentation depending on project size. It is a living document that should be reviewed and updated as the project changes. [S270]

## SEMP content architecture

NASA groups SEMP content into three broad areas:

1. technical programme planning and control;
2. systems engineering processes and their tailoring, implementation procedures, tools, models and trade-study methods;
3. engineering specialty integration, including how reliability, safety, security, human factors, supportability and other disciplines are integrated. [S270]

A useful SEMP also identifies system boundary and lifecycle, technical authority, technical organization, work breakdown, interface authority, technical reviews, configuration and data management, verification/validation, risk, decision analysis, metrics and supplier integration.

## Technical planning workflow

1. understand mission objectives, scope and lifecycle constraints;
2. establish technical product breakdown and deliverables;
3. identify technical processes and tailoring;
4. define responsibilities, authorities and interface owners;
5. estimate engineering effort, facilities, tools, test assets and long-lead needs;
6. sequence technical tasks and reviews;
7. synchronize SEMP and technical plans with the project plan and integrated schedule;
8. baseline and communicate the plan;
9. monitor technical progress, risk and work-product maturity;
10. revise after significant scope, architecture, supplier or risk change.

NASA's technical planning process begins early and calls out technical product breakdown, technical schedule/workflow, resource needs, interface responsibility and configuration control. It warns that design/environment change can invalidate previous analysis results. [S271]

## IMP and IMS

The DoD IMP/IMS Guide (May 2023, Change 1 October 2024) describes the integrated master plan as a hierarchy of events, accomplishments and criteria; the integrated master schedule adds tasks and time relationships. These structures connect outcomes and evidence to activities and dates. [S277]

- **Event:** meaningful lifecycle/management milestone.
- **Accomplishment:** outcome that must be achieved to complete the event.
- **Criterion:** objective evidence that the accomplishment is complete.
- **Task:** scheduled work that produces or verifies criteria.

The IMP should describe what has to be accomplished and what evidence proves it. The IMS should show when and how tasks are sequenced, resourced and integrated. The WBS provides the product/work decomposition; it is not interchangeable with the IMP or IMS.

## Schedule logic must represent engineering dependency

Technical work is not simply a chain of meetings. A test cannot be ready before the configuration, procedures, environment, calibration and requirements are controlled. A review should not be scheduled as an unconditional date if the technical entrance criteria have not been met. The schedule should represent dependencies and include maturation/closure time for findings.

Use technical measures and leading indicators: requirement volatility, interface maturity, test coverage by risk, model-validation status, supplier data maturity, anomaly aging, risk burn-down, review action closure and technical debt. A milestone date alone is not a measure of technical maturity.

## Integrated control loop

Each reporting period should reconcile:

- technical baseline and actual product configuration;
- work-product maturity and planned criteria;
- schedule progress and critical path;
- cost/resource consumption;
- technical risk and uncertainty;
- change requests and decision log;
- supplier status and external dependencies;
- verification/validation evidence and open anomalies.

Technical planning is successful when the plan helps the team detect infeasible work, missing evidence and emerging risk early—not when a plan document is approved and never used.

## Practical deliverable

Create a SEMP outline and IMP/IMS skeleton for a hybrid cloud/edge control system. Identify five lifecycle events, accomplishments and measurable criteria, then map tasks, dependencies, owners and evidence artifacts. Introduce a late interface redesign and show the effect on risk, verification, schedule and resource plans.

## Source limitations

NASA SEMP guidance and DoD IMP/IMS guidance belong to their issuing organizations and acquisition contexts. Tailor requirements to contract, programme authority and delivery model. [S270, S271, S277]
