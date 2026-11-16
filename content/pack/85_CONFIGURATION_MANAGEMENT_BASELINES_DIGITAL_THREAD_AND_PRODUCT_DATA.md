# 85 — Configuration management, baselines, digital thread and product data

## Configuration management is product-integrity engineering

Configuration management (CM) makes the product's approved identity visible and controls changes to its functional, performance and physical characteristics. It is not simply document versioning. The objective is to know which configuration is being designed, manufactured, tested, operated, repaired or retired, and to preserve traceability between the real product and its authoritative information. NASA describes CM as a lifecycle management discipline and identifies planning, configuration identification, configuration control, configuration accounting/status, and verification/audit as core functions. [S253]

## Baseline types and authority

A programme commonly controls stakeholder/requirements, functional, allocated, product/design and as-built/as-deployed baselines. Exact names and gates vary by sector and lifecycle model. A baseline is meaningful only when its authority, contents, effective date, status and change process are clear.

Configuration items should be selected based on the need to control identity, interfaces, risk, procurement, test evidence, certification or maintenance. A configuration item may be a hardware assembly, software package, model, dataset, safety-critical parameter, interface specification, technical publication or supplier-controlled component.

## Five CM functions

1. **CM planning:** define roles, scope, procedures, resources, toolchain, approval bodies and records.
2. **Configuration identification:** select items, assign identifiers, define product structures and record attributes/relationships.
3. **Configuration control:** evaluate proposed changes, assess impact, approve/reject/defer, implement and verify.
4. **Configuration status accounting:** report current and historical configuration, change status, deviations, waivers and implementation evidence.
5. **Configuration verification and audit:** verify that product and records match the approved baseline; investigate discrepancies.

CM must coordinate with requirements management, interface management, technical data management, procurement, software release, cybersecurity, safety and verification. A change to a schema, firmware image, control parameter or operating procedure may alter system behavior even when the physical hardware is unchanged.

## Change-impact analysis

A change request should trace outward and inward across:

- originating need/defect/hazard/threat;
- affected requirements and assumptions;
- architecture elements and interfaces;
- hardware/software/data/model components;
- verification/validation cases and past evidence;
- safety, security, reliability and human-system analyses;
- suppliers, spare parts, technical manuals and training;
- deployed configurations, customer fleets and rollback options.

The change authority should require an impact analysis before approval and verification after implementation. “The code compiles” does not establish that product safety, data compatibility, certification scope or operator workflow remain valid.

## Digital thread

A digital thread is a governed network of linked lifecycle data, not necessarily one vendor platform. It should preserve identity and traceability across need, requirement, design, model, simulation, implementation, test, release, operation, maintenance and retirement. It becomes untrustworthy when identifiers are unstable, data ownership is unclear, transformations are opaque or models drift from delivered products.

## Source status warning

NASA-STD-0005 is a historical configuration management standard record whose status page marks it INACTIVE for new design since 9 March 2015. Do not cite it as current NASA mandatory authority. NASA's current handbook pages refer to SAE/EIA-649B and NASA enterprise CM requirements; verify the live endorsed baseline and any project-specific tailoring. [S250, S253]

ISO 10007:2017 is a configuration-management guideline source; only a preview was accessed in this research pass. It is not a substitute for the full licensed text. [S257]

## Practical deliverable

Create a configuration-management plan for a connected medical/industrial device. Define 12 configuration items, naming/version rules, three baselines, two change-control boards, status accounting, audit evidence, interface impact graph, software/data rollback, field configuration identification and a retirement/decommissioning record.

## Common failures

- deployed software cannot be tied to a tested baseline;
- field repairs create undocumented variations;
- schema/version changes break downstream interfaces;
- safety or threat analyses are not reopened after a design change;
- supplier substitutions are treated as procurement-only events;
- configuration status reports show planned rather than actual implementation;
- digital-thread links exist but do not carry provenance or approval status.

CM is a technical control system over product identity, change and evidence. [S253, S257]
