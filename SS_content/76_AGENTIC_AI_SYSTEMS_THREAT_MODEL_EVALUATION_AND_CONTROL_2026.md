# 76 — Agentic AI systems: threat modeling, evaluation and control (2026)

## Why agents need system engineering

An agentic application is not just a language model response. It combines model behavior with goals, prompts, memory, retrieval, tools, identities, permissions, orchestration, external systems, human approvals and runtime state. The security and reliability boundary therefore extends beyond model input/output to every data and action path.

## OWASP Top 10 for Agentic Applications 2026

OWASP's Agentic Security Initiative published its 2026 Top 10 in December 2025. The document is licensed CC BY-SA 4.0 [S229]. Its risk taxonomy is:

1. **ASI01 — Agent Goal Hijack**
2. **ASI02 — Tool Misuse and Exploitation**
3. **ASI03 — Identity and Privilege Abuse**
4. **ASI04 — Agentic Supply Chain Vulnerabilities**
5. **ASI05 — Unexpected Code Execution (RCE)**
6. **ASI06 — Memory & Context Poisoning**
7. **ASI07 — Insecure Inter-Agent Communication**
8. **ASI08 — Cascading Failures**
9. **ASI09 — Human-Agent Trust Exploitation**
10. **ASI10 — Rogue Agents**

The categories should be treated as a threat taxonomy, not as a complete system risk assessment. Threats can chain: goal hijack can cause tool misuse; supply-chain compromise can affect tools or memory; an agent may propagate unsafe state to other agents; human trust can enable privilege escalation.

## Agent threat model

Model the lifecycle and trust boundaries for: user prompt; retrieved content; memory writes/reads; model selection and updates; tool registry; tool arguments; authorization; execution sandbox; network egress; other agents; human review; logs; model/data/tool supply chain; tenant boundaries; deployment and rollback. Track both control-plane and data-plane paths.

## Design controls

- Explicit, signed or integrity-protected goals and policy configuration.
- Separate planning/reasoning from action authorization and execution.
- Allowlist tools and versions; avoid broad generic shells where a narrow API suffices.
- Least privilege at action/resource/time scope; use short-lived, audience-bound credentials.
- Human approval for high-impact, irreversible or externally consequential actions.
- Sandboxed execution, network egress limits, resource budgets and rate limits.
- Isolated memory stores with provenance, content validation and poisoning defenses.
- Authenticated and integrity-protected inter-agent communication.
- Tool, model, prompt, data and agent dependency inventory.
- Immutable audit logs and replayable action traces.
- Kill-switch, credential revocation, quarantine and safe recovery.

## Australian Cyber Security Centre guidance

The ACSC's government guidance recommends security-first adoption, starting with low-risk well-defined tasks, continuous oversight, risk assessment and threat modeling [S230]. It recommends evaluating across autonomy levels and changing contexts/tools; least-privilege access; human control points; approval for high-impact actions; restricted tool allowlists; isolation and blast-radius controls; monitoring agent operations, identity/privilege changes, prompts, tool calls, memory interactions, decisions and actions; and tested incident response.

## Evaluation program

Agent evaluation must test the complete system, not only task-answer accuracy. Include:

- goal integrity and prompt injection;
- tool selection and argument correctness;
- authorization boundary enforcement;
- data exfiltration and tenant isolation;
- memory poisoning and retrieval contamination;
- inter-agent spoofing and cascading failure;
- refusal, human escalation and interruption behavior;
- rate-limit/resource exhaustion and retry storms;
- reproducibility under model/tool/prompt changes;
- recovery after revocation, rollback and quarantine.

Use scenario-based threat tests, adversarial red teaming, independent monitors, deterministic harnesses where possible, human review and production telemetry. Measure success and harmful-action rate separately. A high task-completion score can coexist with an unacceptable unsafe-action rate.

## Control model

A safer architecture separates: (1) intent capture, (2) planning, (3) policy evaluation, (4) authorization, (5) sandboxed execution, (6) independent postcondition verification, (7) audit and rollback. Do not permit the agent to grant itself privilege, modify its own tool allowlist or erase its audit history.

## Open engineering questions

- How should agent identity and capability be attested across multi-agent protocols?
- How can memory provenance and poisoning resistance scale across organizations?
- How can evaluation bound rare multi-step failures and emergent behavior?
- How should responsibility be allocated when agents delegate to other agents?
- How can runtime monitors distinguish adaptation from goal drift without blocking legitimate behavior?
