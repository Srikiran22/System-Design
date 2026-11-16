# 51 — Research frontiers and open engineering problems

This section identifies areas where methods are developing or where evidence remains context-specific. It is a research agenda, not a claim that one approach has already solved the problem.

## 1. Engineering socio-technical complexity

Systems increasingly combine software, hardware, organizations, supply chains, users, policy and natural environments. Open challenges include validating models of human/organizational behavior, representing power and incentives, predicting emergent behavior, and governing changes across independent actors. System dynamics and complexity science provide tools, but prediction limits must remain explicit. [S145–S147]

## 2. AI as an engineered system

AI introduces probabilistic outputs, model/data drift, opaque supply chains, prompt injection, tool-use authority and evaluation difficulties. Open problems include task-level guarantees, scalable evaluation, provenance of training/retrieval data, secure multi-agent interactions, and monitoring model behavior after deployment. NIST's AI RMF and GenAI profile are useful current risk frameworks, not final answers. [S136–S138]

## 3. Model-based engineering at scale

SysML v2 and API-oriented modeling create opportunities for executable semantics, interoperability and automation. Open problems include model governance across suppliers, semantic integration, migration from v1, trust in model transformations, linking evidence to models, and preventing model drift. [S124]

## 4. Resilience under correlated failure

Cloud, identity, software supply chains and shared platforms create common dependencies. High availability can be undermined by correlated faults, software monocultures, shared control planes, compromised credentials or synchronized updates. Better quantification of common-cause and cyber-induced failure remains a major engineering need. [S133]

## 5. Sustainability and energy-aware architecture

Compute-intensive workloads and AI increase pressure to understand energy, cooling, embodied hardware impact, water, material supply and lifecycle waste. Future architecture methods need consistent boundaries, transparent measurement and tradeoffs among latency, reliability, cost, energy and access. Avoid assuming that cloud migration is automatically greener.

## 6. Software supply-chain assurance

Modern systems depend on layers of packages, build systems, hosted services and AI components. Provenance, attestations, reproducible builds, dependency reachability, vulnerability prioritization and recovery after supplier compromise remain complex. System boundaries must include build and update infrastructure.

## 7. Verification of adaptive and autonomous systems

Adaptive systems change behavior after deployment through learning, configuration or interaction. Traditional test baselines may not cover future state spaces. Research directions include scenario generation, runtime assurance, constrained adaptation, formal abstraction, continuous validation and evidence preservation after updates.

## 8. Architecture evolution and debt quantification

Architectural debt is often qualitative, cross-team and path-dependent. More useful models would connect dependency structure, change coupling, ownership, rework, incident patterns and cost over time without collapsing everything to one simplistic score. [S144]

## 9. Human-AI work systems

As AI is embedded into decision workflows, human oversight can become superficial. Open issues include automation bias, calibrated reliance, responsibility allocation, contestability, workload, skill erosion, escalation quality and the ability to understand system limits under pressure.

## Research method

For each topic: define a falsifiable question; identify what counts as evidence; compare primary research and practitioner failures; separate conceptual models, controlled experiments, observational studies and case reports; track reproducibility and context; document uncertainty; and revise the knowledge-base page when evidence changes.
