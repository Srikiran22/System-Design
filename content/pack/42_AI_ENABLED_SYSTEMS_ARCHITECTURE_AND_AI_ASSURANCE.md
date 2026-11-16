# 42 — AI-enabled system architecture and AI assurance

## AI is a subsystem inside a product system

A production AI feature is not just a model endpoint. Its system includes users, workflows, data sources, labeling, preprocessing, retrieval, model selection, prompts, tools, orchestration, policy controls, evaluation, serving infrastructure, telemetry, human review, suppliers and incident processes. Treat the model as one component with uncertainty and lifecycle dependencies.

## AI workload architecture

A typical architecture may include:

1. Data ingestion, consent/rights, classification and provenance.
2. Data validation, de-identification where appropriate, transformation and quality controls.
3. Model training/fine-tuning or provider selection and model-version registry.
4. Retrieval/indexing and grounding data with access-control propagation.
5. Prompt templates, tool schemas, orchestration and policy enforcement.
6. Inference serving, capacity management, caching and routing.
7. Evaluation pipelines, safety/security tests and release gates.
8. Monitoring of quality, drift, latency, cost, abuse, incidents and user feedback.
9. Human escalation, override, appeal and fallback workflows.
10. Decommissioning, data deletion, model retirement and provenance retention.

## Deterministic versus probabilistic components

Traditional code is often expected to behave deterministically for a fixed input/environment; generative model output is probabilistic and can vary with model version, prompt, context and sampling. Therefore requirements and acceptance criteria should use distributions, task-level outcomes and evaluation sets rather than a few golden examples. Specify acceptable error types, escalation behavior and operational constraints.

## RAG system design

Retrieval-augmented generation adds ingestion, chunking, metadata, embeddings, indexing, filtering, ranking, context assembly and citation/evidence presentation. Critical design issues include:

- Access controls must be applied before or during retrieval, not only in the final response layer.
- Deletions and permission revocations must propagate to derived indexes and caches.
- Chunk boundaries and metadata affect retrieval quality.
- Retrieval precision/recall and stale-data behavior should be measured.
- Model output must distinguish retrieved evidence from unsupported synthesis.
- Vector similarity does not prove truth, authority or relevance.
- Prompt injection can arrive through retrieved documents and tool outputs.

## Agent and tool-use architecture

An agentic system adds planning, state, memory, tool selection, permissions, retries and sometimes delegation. Keep authority bounded: allowlist tools; use least-privilege credentials; separate read from write actions; require explicit approval for consequential operations; validate tool arguments and outputs; constrain network/filesystem access; impose time/cost limits; and log decisions. Treat tool output and retrieved content as untrusted data, not policy instructions.

## Evaluation architecture

Use layered evaluation: unit tests for components; retrieval evaluations; prompt and model regression sets; scenario-based system tests; adversarial safety/security tests; human review; online monitoring; and incident feedback. Track task success, groundedness, factuality, refusal quality, retrieval relevance, harmful output, privacy leakage, robustness, latency and cost. No single metric captures generative-system quality.

Prevent evaluation leakage: separate development and held-out test sets; document rater rubric and disagreement; version prompts, data, models and metrics; test distribution shifts; and re-run before model or pipeline updates. LLM-as-a-judge may scale evaluation but needs calibration and human spot checks.

## AI risk and governance

NIST AI RMF structures risk work around Govern, Map, Measure and Manage; NIST's Generative AI Profile adds GenAI-specific risks. ISO/IEC 42001 specifies an organizational AI management system. These are risk-management and governance resources; compliance claims do not prove a model is accurate or a product is safe. [S136, S137, S160]

## Secure AI lifecycle

Multi-agency secure-AI guidance covers design, development, deployment and operation. Threats include data poisoning, model theft, prompt injection, insecure tool permissions, insecure plugin/supply-chain components, sensitive data leakage and denial of service. Protect data/model artifacts, training pipelines, model registries, inference endpoints, secrets and update paths. [S138]

## Failure containment and second defenses

For high-impact AI decisions, do not make one model output the only safety barrier. Add deterministic policy checks, scoped tools, independent authorization, human approval, bounded actions, post-action validation, audit trail, rate limits, circuit breakers, manual workflow and rollback. But check for common-mode failure: if the same model both decides and verifies, if the same compromised identity controls the agent and the approval process, or if all fallback paths depend on the same data source, the “second line” may not be independent.

## Operational controls

Define model/version provenance, quality drift thresholds, kill switches, fallback models or manual mode, request/response privacy policy, cost budgets, abuse monitoring, prompt injection tests, red-team exercises, incident ownership, rollback and user disclosure. AI-specific operational metrics should be connected to product outcomes and harm signals.

## Build-versus-buy decision

Compare model quality for task, data rights, data residency, privacy, vendor lock-in, customization, inference cost, latency, throughput, availability, security, auditability, model update behavior, support and fallback options. A frontier model is not automatically the best architecture choice; smaller or deterministic components may be better for bounded tasks.
