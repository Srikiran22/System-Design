# 89 — Value engineering, function analysis and lifecycle-value decisions

## Value is not “cheapest”

Value engineering is a structured method for understanding essential functions and comparing alternative ways of providing them at an acceptable lifecycle cost and risk. A low acquisition price can be poor value if it increases operating cost, support burden, failure exposure, energy consumption, downtime, training or retirement cost.

The 2025 DoD Value Engineering guidebook defines VE around review and analysis of requirements, functions and system elements to achieve essential functions at the lowest lifecycle cost consistent with required performance, reliability and quality. [S254]

## Function analysis

Express a function using a verb-object form, such as “contain pressure,” “transfer energy,” “authenticate operator,” “preserve data integrity” or “maintain thermal stability.” Separate essential functions from current design solutions. A pump is a solution; “move fluid at specified pressure and flow” is a function.

Function analysis prevents teams from optimizing a component without understanding what system outcome it supports. It also reveals non-value-adding complexity, duplicated functions, hidden requirements and opportunities for alternative architecture.

## Value study sequence

1. Select a candidate system/element and decision scope.
2. Collect needs, design, cost, performance, reliability, schedule, support and risk data.
3. Define functions and required performance.
4. Classify primary, secondary, use, esteem and unnecessary functions where the method supports such distinctions.
5. Generate alternative ways to deliver essential functions.
6. Evaluate feasibility, lifecycle cost, risk, schedule, quality and stakeholder impact.
7. Develop a preferred alternative with implementation and verification plans.
8. Present decisions and track realized benefits rather than projected savings only.

## Cost models and engineering constraints

A lifecycle cost model should include relevant design, development, acquisition, integration, deployment, energy, operations, maintenance, spares, training, logistics, upgrades, obsolescence, decommissioning and disposal. Consider discount rate, uncertainty, inflation/escalation basis, ownership boundary and externalities where relevant.

A candidate option must pass hard constraints before preference scoring: safety, security, statutory obligation, interface compatibility, required performance, environmental constraints and minimum mission capability. Multi-criteria scoring should not let low cost numerically compensate for violation of a hard constraint.

## Trade-space structure

Create a trade matrix with:

- option and key assumptions;
- essential functions satisfied;
- performance/quality attributes;
- lifecycle cost range and cost-driver sensitivity;
- operational/maintenance concept;
- reliability and safety effects;
- technical and supply-chain maturity;
- schedule and transition risks;
- irreversibility and future option value;
- evidence quality and unresolved uncertainty.

Value engineering should include operators, maintainers, safety/security specialists, manufacturers, suppliers and users—not only design engineers and finance.

## Failure modes

- cost reduction removes redundancy without analyzing common-cause risk;
- design simplification increases operator burden;
- cheaper components create lifecycle maintenance or calibration costs;
- standardization reduces variety but introduces a shared systemic failure mode;
- savings are counted without measuring implementation cost or realized benefit;
- a scoring model hides value judgments or weights selected after results are known.

## Practical deliverable

Take a high-availability telemetry service with three design alternatives. Separate functions from components, establish hard constraints, model lifecycle cost with uncertainty, compare supportability and energy impacts, identify a reversible option, and prepare a value-engineering decision record. Include a test proving the selected design preserves every essential function.

## Source limitations

The DoD guidebook is useful engineering guidance but belongs to a particular government acquisition context. Apply local procurement law, accounting rules, risk criteria and project policy. [S254]
