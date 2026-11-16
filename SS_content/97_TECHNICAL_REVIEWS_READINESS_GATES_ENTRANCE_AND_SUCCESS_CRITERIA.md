# 97 — Technical reviews, readiness gates and evidence of maturity

## A review is a decision event, not a presentation ritual

A lifecycle review assesses whether the system and programme are technically mature enough to proceed, whether plans and resources are credible, and whether unresolved risks are understood and owned. The review must answer a decision question. A meeting held because the calendar says “PDR week” without entrance criteria is not an effective technical control.

NASA NPR 7123.1D Appendix G describes entrance and success criteria for lifecycle and technical reviews. The NPR is effective 5 July 2023 and lists an expiration date of 5 July 2028; the NODIS record marks compliance mandatory for NASA employees. It also states that tailoring/customization is expected, and criteria should assess technical maturity, planning adequacy, budget/schedule credibility and readiness to proceed. [S272]

## Common review sequence

Exact names and gates differ by sector/programme, but a typical lifecycle contains:

- **Mission Concept Review (MCR):** need, concept and mission feasibility.
- **System Requirements Review (SRR):** requirements completeness, consistency, allocation approach and mission traceability.
- **System Definition Review (SDR):** system-level architecture and requirements baseline maturity.
- **Preliminary Design Review (PDR):** preliminary design satisfies allocated requirements and is ready for detailed design.
- **Critical Design Review (CDR):** detailed design maturity, interfaces, analysis and implementation readiness.
- **System Integration Review (SIR):** integration readiness and configuration/interface maturity.
- **Test Readiness Review (TRR):** test objectives, procedures, environment, instrumentation, safety and anomaly process are ready.
- **Operational Readiness Review (ORR):** system, operators, facilities, support and contingency processes are ready for operations.
- **Flight/mission readiness and closeout reviews:** readiness to commit to operation and lifecycle exit.

Do not treat this list as a universal sequence. The applicable NPR/standard/contract defines the governing reviews.

## Entrance versus success criteria

**Entrance criteria** answer whether the evidence is mature enough to conduct the review. Examples: configuration is known, required work products are submitted, prior review actions are dispositioned or have an approved closure plan, and key analyses are available.

**Success criteria** answer whether the decision objective is met. Examples: requirements are adequately formulated; architecture addresses stakeholder concerns; risks are understood and acceptable to the decision authority; key interfaces are controlled; verification/validation strategy is credible; resources and schedules are consistent with the technical approach.

A review can be held with open actions; the decision record must distinguish accepted residual actions from criteria not met. “Conditional pass” should have explicit conditions, owners, due dates and closure authority.

## Evidence maturity model

For each major work product, state whether it is draft, reviewed, baselined, verified, validated, approved, or superseded. Do not confuse “exists” with “mature.” A requirements document can exist but contain ambiguous shall statements; an architecture model can be populated but fail stakeholder concerns; a test plan can be written but lack validated test environments.

## Review package

A review package should include system boundary/ConOps, requirements status, architecture views and rationale, technical performance measures, interface list, safety/security/risk analyses, trade studies, verification/validation plan, configuration status, supplier maturity, schedule/resource credibility, cost/technical risk, operational support and open actions.

The review chair should challenge evidence sufficiency, conflicts of interest and assumptions. Independent technical assessment may be required depending on system consequence and governance.

## Review anti-patterns

- entrance criteria waived to protect schedule without risk rationale;
- success criteria defined after the evidence is seen;
- major risks hidden in a slide appendix;
- action closure accepted without evidence;
- reviews treated as contract incentive points rather than technical decisions;
- requirements or models presented with no configuration baseline;
- one discipline dominates while cross-domain risks remain unexamined.

## Practical deliverable

Create SRR and PDR entrance/success criteria for an autonomous warehouse robot. For each criterion specify artifact, owner, evidence type, maturity threshold, reviewer question and accepted-open-action process. Simulate a PDR with one incomplete safety analysis and one interface specification under change; justify proceed/hold/conditional proceed.

## Source limitations

NPR 7123.1D is mandatory for NASA employees and specific to NASA governance. Other organizations should adapt the review logic to their own authority and lifecycle model rather than claim compliance with NASA criteria. [S272]
