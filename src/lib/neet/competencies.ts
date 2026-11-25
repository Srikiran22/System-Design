import { LABS, PATHS, SKILLS, allLessons, lessonKey } from "./content";
import type { BloomLevel, Discipline, EvidenceType } from "./types";

export const COMPETENCY_MODEL_VERSION = "2.0.0";

export interface CompetencyRelation {
  targetId: string;
  kind: "assumes" | "extends" | "related";
}

export interface CompetencyFrameworkAnchor {
  framework: "INCOSE SECF 2e" | "SEBoK" | "NASA SE Handbook" | "ISO/IEC/IEEE";
  reference: string;
  note: string;
}

export interface LevelDescriptor {
  level: 1 | 2 | 3 | 4;
  stage: "Search" | "Know" | "Adapt" | "Proceed";
  observableOutcome: string;
  requiredEvidence: EvidenceType[];
}

export interface CompetencyDefinition {
  id: string;
  code: string;
  domain: Discipline;
  title: string;
  definition: string;
  bloomTarget: BloomLevel;
  prerequisites: string[];
  relations: CompetencyRelation[];
  frameworkAnchors: CompetencyFrameworkAnchor[];
  levelDescriptors: [LevelDescriptor, LevelDescriptor, LevelDescriptor, LevelDescriptor];
  mappedVolumes: string[];
  roleTags: string[];
  version: string;
}

/**
 * Tailored versioned competency catalogue grounded in INCOSE SECF 2nd Edition,
 * SEBoK, and NASA/ISO systems engineering standards. Covers all 16 curriculum skills.
 * Explicitly scoped for self-directed portfolio development — not formal accreditation.
 */
export const COMPETENCIES: CompetencyDefinition[] = [
  {
    id: "st-stocks",
    code: "SE-ST-01",
    domain: "thinking",
    title: "Stocks & flows",
    definition:
      "Distinguish accumulations (queues, debt, inventory, state) from rates of change and diagnose delays between inflows and outflows.",
    bloomTarget: "analyze",
    prerequisites: [],
    relations: [{ targetId: "st-loops", kind: "extends" }],
    frameworkAnchors: [
      {
        framework: "INCOSE SECF 2e",
        reference: "Core · Systems Thinking",
        note: "Identify systemic elements, accumulations, and dynamic behavior over time.",
      },
      {
        framework: "SEBoK",
        reference: "Part 2 · Foundations of Systems Science",
        note: "System dynamics, state variables, and delay-induced oscillation.",
      },
    ],
    levelDescriptors: [
      {
        level: 1,
        stage: "Search",
        observableOutcome:
          "Identify visible symptoms vs. underlying stocks in an operational incident.",
        requiredEvidence: ["quiz"],
      },
      {
        level: 2,
        stage: "Know",
        observableOutcome: "Explain why queues grow even when average inflow equals outflow.",
        requiredEvidence: ["quiz", "explain"],
      },
      {
        level: 3,
        stage: "Adapt",
        observableOutcome: "Model stock/flow dynamics under a sudden traffic or delay shift.",
        requiredEvidence: ["lab", "variant"],
      },
      {
        level: 4,
        stage: "Proceed",
        observableOutcome:
          "Ship a quantified flow model defending capacity buffers and backpressure.",
        requiredEvidence: ["artifact"],
      },
    ],
    mappedVolumes: [
      "01-definitions-and-mental-models",
      "02-systems-thinking",
      "103-system-dynamics-model-building-validation-and-policy-intervention",
    ],
    roleTags: ["Systems Engineer", "SRE", "Staff Software Architect"],
    version: COMPETENCY_MODEL_VERSION,
  },
  {
    id: "st-loops",
    code: "SE-ST-02",
    domain: "thinking",
    title: "Feedback loops",
    definition:
      "Map reinforcing and balancing feedback structures, locate measurement delays, and anticipate policy resistance.",
    bloomTarget: "analyze",
    prerequisites: ["st-stocks"],
    relations: [
      { targetId: "st-stocks", kind: "assumes" },
      { targetId: "en-safety-stpa", kind: "related" },
    ],
    frameworkAnchors: [
      {
        framework: "INCOSE SECF 2e",
        reference: "Core · Systems Thinking",
        note: "Analyze non-linear feedback interactions and emergent oscillation.",
      },
      {
        framework: "SEBoK",
        reference: "Part 2 · Complexity & Cybernetics",
        note: "Closed-loop control and delayed feedback stability.",
      },
    ],
    levelDescriptors: [
      {
        level: 1,
        stage: "Search",
        observableOutcome:
          "Spot whether a recurring failure is driven by reinforcing or balancing loops.",
        requiredEvidence: ["quiz"],
      },
      {
        level: 2,
        stage: "Know",
        observableOutcome:
          "Explain retry storms and corrective overshoot using causal-loop polarity.",
        requiredEvidence: ["quiz", "explain"],
      },
      {
        level: 3,
        stage: "Adapt",
        observableOutcome:
          "Build a causal-loop diagram and predict system behavior when a link is removed.",
        requiredEvidence: ["lab", "variant"],
      },
      {
        level: 4,
        stage: "Proceed",
        observableOutcome:
          "Design feedback damping controls that prevent cascading oscillation in production.",
        requiredEvidence: ["artifact"],
      },
    ],
    mappedVolumes: [
      "02-systems-thinking",
      "27-systems-science-and-complexity",
      "103-system-dynamics-model-building-validation-and-policy-intervention",
    ],
    roleTags: ["Systems Engineer", "SRE", "Safety Engineer"],
    version: COMPETENCY_MODEL_VERSION,
  },
  {
    id: "st-leverage",
    code: "SE-ST-03",
    domain: "thinking",
    title: "Leverage points",
    definition:
      "Rank candidate interventions from parameter tweaks to information flows, rules, and goals to find durable change.",
    bloomTarget: "evaluate",
    prerequisites: ["st-loops"],
    relations: [{ targetId: "st-loops", kind: "assumes" }],
    frameworkAnchors: [
      {
        framework: "SEBoK",
        reference: "Part 2 · Systems Approach Applied to Engineered Systems",
        note: "Selecting structural interventions over reactive parameter tuning.",
      },
    ],
    levelDescriptors: [
      {
        level: 1,
        stage: "Search",
        observableOutcome:
          "Distinguish low-leverage parameter adjustments from structural rule changes.",
        requiredEvidence: ["quiz"],
      },
      {
        level: 2,
        stage: "Know",
        observableOutcome:
          "Explain why changing information flow or incentives outperforms local thresholds.",
        requiredEvidence: ["quiz", "explain"],
      },
      {
        level: 3,
        stage: "Adapt",
        observableOutcome:
          "Evaluate competing operational interventions and defend the highest-leverage choice.",
        requiredEvidence: ["lab", "variant"],
      },
      {
        level: 4,
        stage: "Proceed",
        observableOutcome:
          "Propose and defend a socio-technical intervention anticipating policy resistance.",
        requiredEvidence: ["artifact"],
      },
    ],
    mappedVolumes: [
      "02-systems-thinking",
      "26-systemantics-and-human-judgment",
      "41-human-factors-socio-technical-and-organization-design",
    ],
    roleTags: ["Principal Architect", "Engineering Manager", "Systems Engineer"],
    version: COMPETENCY_MODEL_VERSION,
  },
  {
    id: "st-boundaries",
    code: "SE-ST-04",
    domain: "thinking",
    title: "Boundary critique",
    definition:
      "Make system boundaries explicit, surface unrepresented stakeholders, and test what assumptions fall outside scope.",
    bloomTarget: "evaluate",
    prerequisites: ["st-leverage"],
    relations: [
      { targetId: "st-leverage", kind: "assumes" },
      { targetId: "sd-requirements", kind: "related" },
    ],
    frameworkAnchors: [
      {
        framework: "SEBoK",
        reference: "Part 3 · Stakeholder Needs & Requirements",
        note: "Context boundary framing and mission/stakeholder elicitation.",
      },
      {
        framework: "NASA SE Handbook",
        reference: "Sec 4.1 · Stakeholder Expectations Definition",
        note: "Defining operational concepts and external interfaces.",
      },
    ],
    levelDescriptors: [
      {
        level: 1,
        stage: "Search",
        observableOutcome: "Identify what a problem statement leaves outside the system boundary.",
        requiredEvidence: ["quiz"],
      },
      {
        level: 2,
        stage: "Know",
        observableOutcome:
          "Explain how redrawing a boundary shifts costs, risks, and stakeholders.",
        requiredEvidence: ["quiz", "explain"],
      },
      {
        level: 3,
        stage: "Adapt",
        observableOutcome: "Conduct a boundary critique on a contested real-world service scope.",
        requiredEvidence: ["lab", "variant"],
      },
      {
        level: 4,
        stage: "Proceed",
        observableOutcome:
          "Produce a signed boundary & stakeholder register linked to mission success measures.",
        requiredEvidence: ["artifact"],
      },
    ],
    mappedVolumes: [
      "28-problem-framing-and-systems-methods",
      "61-systems-methods-pluralism-problem-structuring-and-boundary-critique",
      "62-mission-engineering-mission-architectures-and-operational-analysis",
    ],
    roleTags: ["Lead Systems Engineer", "Enterprise Architect", "Product Architect"],
    version: COMPETENCY_MODEL_VERSION,
  },
  {
    id: "sd-requirements",
    code: "SE-SD-01",
    domain: "design",
    title: "Requirements & estimation",
    definition:
      "Translate stakeholder needs into measurable, verifiable requirements and back-of-the-envelope load, storage, and latency budgets.",
    bloomTarget: "apply",
    prerequisites: [],
    relations: [
      { targetId: "sd-data", kind: "extends" },
      { targetId: "sd-trade-studies", kind: "extends" },
    ],
    frameworkAnchors: [
      {
        framework: "ISO/IEC/IEEE",
        reference: "ISO/IEC/IEEE 29148 · Requirements Engineering",
        note: "Verifiable, unambiguous, traceable requirement statements.",
      },
      {
        framework: "NASA SE Handbook",
        reference: "Sec 4.2 · Technical Requirements Definition",
        note: "Linking each technical requirement to a verification method.",
      },
    ],
    levelDescriptors: [
      {
        level: 1,
        stage: "Search",
        observableOutcome:
          "Distinguish functional needs from measurable quality attributes and constraints.",
        requiredEvidence: ["quiz"],
      },
      {
        level: 2,
        stage: "Know",
        observableOutcome:
          "Explain how peak throughput, p99 latency, and retention drive sizing budgets.",
        requiredEvidence: ["quiz", "explain"],
      },
      {
        level: 3,
        stage: "Adapt",
        observableOutcome:
          "Quantify QPS, bandwidth, and 5-year storage and identify what breaks under a 10x surge.",
        requiredEvidence: ["lab", "variant"],
      },
      {
        level: 4,
        stage: "Proceed",
        observableOutcome:
          "Author a traceable requirements specification with explicit verification criteria and SLOs.",
        requiredEvidence: ["artifact"],
      },
    ],
    mappedVolumes: [
      "04-requirements-and-quality-attributes",
      "29-requirements-engineering-traceability-and-change",
      "63-requirements-engineering-formalization-and-evidence-chains",
    ],
    roleTags: ["Systems Architect", "Backend Engineer", "Requirements Engineer"],
    version: COMPETENCY_MODEL_VERSION,
  },
  {
    id: "sd-data",
    code: "SE-SD-02",
    domain: "design",
    title: "Data & storage",
    definition:
      "Select storage engines, partitioning schemes, and data contracts matched to consistency, access patterns, and migration safety.",
    bloomTarget: "analyze",
    prerequisites: ["sd-requirements"],
    relations: [
      { targetId: "sd-requirements", kind: "assumes" },
      { targetId: "sd-scale", kind: "extends" },
    ],
    frameworkAnchors: [
      {
        framework: "ISO/IEC/IEEE",
        reference: "ISO/IEC/IEEE 42010 · Architecture Description",
        note: "Explicit data viewpoints, contracts, and schema evolution governance.",
      },
    ],
    levelDescriptors: [
      {
        level: 1,
        stage: "Search",
        observableOutcome:
          "Match workload access patterns to relational, log, document, or key-value engines.",
        requiredEvidence: ["quiz"],
      },
      {
        level: 2,
        stage: "Know",
        observableOutcome:
          "Explain write amplification, index selectivity, and zero-downtime schema migration.",
        requiredEvidence: ["quiz", "explain"],
      },
      {
        level: 3,
        stage: "Adapt",
        observableOutcome:
          "Design a sharding and contract strategy that survives hot keys and schema changes.",
        requiredEvidence: ["lab", "variant"],
      },
      {
        level: 4,
        stage: "Proceed",
        observableOutcome:
          "Deliver versioned data contracts, retention plans, and rollback-safe migration playbooks.",
        requiredEvidence: ["artifact"],
      },
    ],
    mappedVolumes: [
      "07-distributed-systems-and-data",
      "34-data-architecture-integration-and-migration",
      "66-data-contracts-streaming-and-migration-assurance",
    ],
    roleTags: ["Data Architect", "Staff Backend Engineer", "Platform Engineer"],
    version: COMPETENCY_MODEL_VERSION,
  },
  {
    id: "sd-scale",
    code: "SE-SD-03",
    domain: "design",
    title: "Scaling & caching",
    definition:
      "Design horizontal scaling, caching, and load-shedding layers while explicitly bounding staleness and thundering-herd risk.",
    bloomTarget: "apply",
    prerequisites: ["sd-data"],
    relations: [
      { targetId: "sd-data", kind: "assumes" },
      { targetId: "sd-reliability", kind: "extends" },
    ],
    frameworkAnchors: [
      {
        framework: "SEBoK",
        reference: "Part 3 · System Architecture Definition",
        note: "Allocating performance and scalability quality attributes across tiers.",
      },
    ],
    levelDescriptors: [
      {
        level: 1,
        stage: "Search",
        observableOutcome: "Identify cache-aside, write-through, and write-back trade-offs.",
        requiredEvidence: ["quiz"],
      },
      {
        level: 2,
        stage: "Know",
        observableOutcome: "Explain cache stampedes, invalidation races, and bounded staleness.",
        requiredEvidence: ["quiz", "explain"],
      },
      {
        level: 3,
        stage: "Adapt",
        observableOutcome:
          "Implement a cache layer, trigger a stale-read race, and mitigate cold-start stampedes.",
        requiredEvidence: ["lab", "variant"],
      },
      {
        level: 4,
        stage: "Proceed",
        observableOutcome:
          "Engineer an observable multi-tier caching architecture with tested failover under load.",
        requiredEvidence: ["artifact"],
      },
    ],
    mappedVolumes: [
      "05-architecture-styles-and-patterns",
      "33-cloud-native-platform-engineering-and-operations",
      "45-architecture-antipatterns-and-failure-modes",
    ],
    roleTags: ["Distributed Systems Engineer", "Staff Software Engineer", "SRE"],
    version: COMPETENCY_MODEL_VERSION,
  },
  {
    id: "sd-reliability",
    code: "SE-SD-04",
    domain: "design",
    title: "Design for reliability",
    definition:
      "Engineer defense in depth with timeouts, bounded retries, circuit breakers, bulkheads, idempotency, and error budgets.",
    bloomTarget: "evaluate",
    prerequisites: ["sd-scale"],
    relations: [
      { targetId: "sd-scale", kind: "assumes" },
      { targetId: "en-dependability-markov", kind: "extends" },
    ],
    frameworkAnchors: [
      {
        framework: "INCOSE SECF 2e",
        reference: "Technical · Reliability, Availability & Maintainability",
        note: "Design for fault tolerance, graceful degradation, and operational SLOs.",
      },
    ],
    levelDescriptors: [
      {
        level: 1,
        stage: "Search",
        observableOutcome: "Identify single points of failure and cascading retry hazards.",
        requiredEvidence: ["quiz"],
      },
      {
        level: 2,
        stage: "Know",
        observableOutcome:
          "Explain SLI/SLO error budgets, idempotency keys, and bulkhead isolation.",
        requiredEvidence: ["quiz", "explain"],
      },
      {
        level: 3,
        stage: "Adapt",
        observableOutcome:
          "Re-architect a brittle dependency chain to survive partial degradation.",
        requiredEvidence: ["lab", "variant"],
      },
      {
        level: 4,
        stage: "Proceed",
        observableOutcome:
          "Ship an SLO-backed resilience design with verified chaos/failure drills.",
        requiredEvidence: ["artifact"],
      },
    ],
    mappedVolumes: [
      "08-reliability-defense-in-depth",
      "35-reliability-maintainability-availability-and-resilience",
      "100-operational-reliability-objectives-sli-slo-error-budgets-and-mission-metrics",
    ],
    roleTags: ["Site Reliability Engineer", "Reliability Engineer", "Systems Architect"],
    version: COMPETENCY_MODEL_VERSION,
  },
  {
    id: "sd-consensus",
    code: "SE-SD-05",
    domain: "design",
    title: "Distributed consensus",
    definition:
      "Reason about quorums, Raft/Paxos replication safety, leader leases, split-brain prevention, and linearizability trade-offs.",
    bloomTarget: "analyze",
    prerequisites: ["sd-data", "sd-scale"],
    relations: [
      { targetId: "sd-data", kind: "assumes" },
      { targetId: "sd-scale", kind: "assumes" },
    ],
    frameworkAnchors: [
      {
        framework: "SEBoK",
        reference: "Part 3 · Distributed & Fault-Tolerant Architecture",
        note: "Safety and liveness invariants across asynchronous networked nodes.",
      },
    ],
    levelDescriptors: [
      {
        level: 1,
        stage: "Search",
        observableOutcome:
          "Explain why majority quorums prevent dual-leader writes under network partition.",
        requiredEvidence: ["quiz"],
      },
      {
        level: 2,
        stage: "Know",
        observableOutcome: "Trace Raft term numbers, log matching, and leader step-down rules.",
        requiredEvidence: ["quiz", "explain"],
      },
      {
        level: 3,
        stage: "Adapt",
        observableOutcome:
          "Simulate a 5-node Raft partition and demonstrate minority rejection & log truncation.",
        requiredEvidence: ["lab", "variant"],
      },
      {
        level: 4,
        stage: "Proceed",
        observableOutcome:
          "Defend a replicated state-machine design specifying fencing tokens and recovery invariants.",
        requiredEvidence: ["artifact"],
      },
    ],
    mappedVolumes: [
      "32-distributed-systems-consistency-and-failure-modes",
      "65-distributed-systems-correctness-consensus-and-time",
    ],
    roleTags: ["Distributed Systems Engineer", "Storage Engineer", "Principal Engineer"],
    version: COMPETENCY_MODEL_VERSION,
  },
  {
    id: "sd-trade-studies",
    code: "SE-SD-06",
    domain: "design",
    title: "Decision analysis & MCDA",
    definition:
      "Structure Architecture Decision Records (ADRs) and Multi-Criteria Decision Analysis (MCDA) with swing weights and sensitivity sweeps.",
    bloomTarget: "evaluate",
    prerequisites: ["sd-requirements"],
    relations: [
      { targetId: "sd-requirements", kind: "assumes" },
      { targetId: "en-assurance-gsn", kind: "related" },
    ],
    frameworkAnchors: [
      {
        framework: "INCOSE SECF 2e",
        reference: "Management · Decision Management",
        note: "Formal trade studies, utility scoring, and sensitivity under uncertainty.",
      },
      {
        framework: "NASA SE Handbook",
        reference: "Sec 6.8 · Decision Analysis",
        note: "Documenting alternatives, weights, assumptions, and tipping points.",
      },
    ],
    levelDescriptors: [
      {
        level: 1,
        stage: "Search",
        observableOutcome:
          "Identify unstated criteria and hidden biases in an architecture comparison.",
        requiredEvidence: ["quiz"],
      },
      {
        level: 2,
        stage: "Know",
        observableOutcome:
          "Explain swing weighting, dominated options, and sensitivity tipping points.",
        requiredEvidence: ["quiz", "explain"],
      },
      {
        level: 3,
        stage: "Adapt",
        observableOutcome:
          "Run an MCDA trade study across 3 architectures and test a ±20% weight shift and budget cut.",
        requiredEvidence: ["lab", "variant"],
      },
      {
        level: 4,
        stage: "Proceed",
        observableOutcome:
          "Publish defensible ADRs + trade study specifying exact conditions that invalidate the choice.",
        requiredEvidence: ["artifact"],
      },
    ],
    mappedVolumes: [
      "06-decision-method-and-tradeoffs",
      "96-trade-studies-multi-criteria-decision-analysis-and-sensitivity",
      "118-robust-decision-making-bayesian-evidence-and-deep-uncertainty",
    ],
    roleTags: ["Principal Architect", "Systems Engineer", "Technical Lead"],
    version: COMPETENCY_MODEL_VERSION,
  },
  {
    id: "en-reading",
    code: "SE-EN-01",
    domain: "engineering",
    title: "Reading unfamiliar code",
    definition:
      "Trace end-to-end execution paths, trust boundaries, and storage contracts in an unfamiliar system before proposing changes.",
    bloomTarget: "analyze",
    prerequisites: [],
    relations: [{ targetId: "en-testing", kind: "extends" }],
    frameworkAnchors: [
      {
        framework: "SEBoK",
        reference: "Part 3 · System Implementation & Integration",
        note: "Reverse-engineering interfaces, dependencies, and behavioral assumptions.",
      },
    ],
    levelDescriptors: [
      {
        level: 1,
        stage: "Search",
        observableOutcome:
          "Locate entry points, configuration boundaries, and data stores in an unfamiliar repository.",
        requiredEvidence: ["quiz"],
      },
      {
        level: 2,
        stage: "Know",
        observableOutcome:
          "Explain control and data flow across UI, middleware, and persistence layers.",
        requiredEvidence: ["quiz", "explain"],
      },
      {
        level: 3,
        stage: "Adapt",
        observableOutcome:
          "Produce a one-page ARCHITECTURE.md tracing a real user action end to end.",
        requiredEvidence: ["lab", "variant"],
      },
      {
        level: 4,
        stage: "Proceed",
        observableOutcome:
          "Deliver an architecture audit identifying concrete defects and safe refactoring seams.",
        requiredEvidence: ["artifact"],
      },
    ],
    mappedVolumes: [
      "03-system-design-foundations",
      "31-software-architecture-and-domain-design-deep-dive",
      "58-systems-integration-interface-and-configuration-engineering",
    ],
    roleTags: ["Software Engineer", "Systems Integration Engineer", "Security Reviewer"],
    version: COMPETENCY_MODEL_VERSION,
  },
  {
    id: "en-testing",
    code: "SE-EN-02",
    domain: "engineering",
    title: "Tests as feedback",
    definition:
      "Design verification and validation test pyramids—unit, contract, integration, security, and failure-injection checks—linked to requirements.",
    bloomTarget: "apply",
    prerequisites: ["en-reading"],
    relations: [
      { targetId: "en-reading", kind: "assumes" },
      { targetId: "en-shipping", kind: "extends" },
      { targetId: "en-assurance-gsn", kind: "extends" },
    ],
    frameworkAnchors: [
      {
        framework: "INCOSE SECF 2e",
        reference: "Technical · Verification & Validation",
        note: "Distinguishing verification (built right) from validation (right system) with independent evidence.",
      },
      {
        framework: "ISO/IEC/IEEE",
        reference: "ISO/IEC/IEEE 15288 · Verification & Validation Processes",
        note: "Objective evidence coverage against technical requirements.",
      },
    ],
    levelDescriptors: [
      {
        level: 1,
        stage: "Search",
        observableOutcome: "Distinguish verification checks from stakeholder validation evidence.",
        requiredEvidence: ["quiz"],
      },
      {
        level: 2,
        stage: "Know",
        observableOutcome:
          "Explain contract tests, property invariants, and why coverage percentages can mislead.",
        requiredEvidence: ["quiz", "explain"],
      },
      {
        level: 3,
        stage: "Adapt",
        observableOutcome:
          "Author automated behavior and failure-mode tests guarding critical invariants.",
        requiredEvidence: ["lab", "variant"],
      },
      {
        level: 4,
        stage: "Proceed",
        observableOutcome:
          "Deliver a V&V evidence matrix tracing every requirement to test/inspection/analysis proof.",
        requiredEvidence: ["artifact"],
      },
    ],
    mappedVolumes: [
      "38-verification-validation-test-engineering-and-assurance",
      "70-formal-methods-model-checking-and-verification-assurance",
      "104-system-verification-validation-independence-and-evidence-coverage",
    ],
    roleTags: ["Verification Engineer", "Quality Engineer", "Software Engineer"],
    version: COMPETENCY_MODEL_VERSION,
  },
  {
    id: "en-shipping",
    code: "SE-EN-03",
    domain: "engineering",
    title: "Shipping small",
    definition:
      "Deliver thin vertical slices with progressive rollouts, observability, configuration baselines, and rapid defect remediation.",
    bloomTarget: "create",
    prerequisites: ["en-testing"],
    relations: [{ targetId: "en-testing", kind: "assumes" }],
    frameworkAnchors: [
      {
        framework: "ISO/IEC/IEEE",
        reference: "ISO/IEC/IEEE 15288 · Transition & Operation",
        note: "Controlled deployment, readiness gates, and operational supportability.",
      },
    ],
    levelDescriptors: [
      {
        level: 1,
        stage: "Search",
        observableOutcome: "Slice a large feature into reversible, testable deployment increments.",
        requiredEvidence: ["quiz"],
      },
      {
        level: 2,
        stage: "Know",
        observableOutcome:
          "Explain canary rollouts, rollback criteria, and configuration management baselines.",
        requiredEvidence: ["quiz", "explain"],
      },
      {
        level: 3,
        stage: "Adapt",
        observableOutcome:
          "Ship a thin vertical slice with automated tests and remediate a real user-found defect.",
        requiredEvidence: ["lab", "variant"],
      },
      {
        level: 4,
        stage: "Proceed",
        observableOutcome:
          "Own production delivery with operational runbooks, readiness gates, and lifecycle plan.",
        requiredEvidence: ["artifact"],
      },
    ],
    mappedVolumes: [
      "10-operations-observability-and-delivery",
      "85-configuration-management-baselines-digital-thread-and-product-data",
      "97-technical-reviews-readiness-gates-entrance-and-success-criteria",
    ],
    roleTags: ["Staff Software Engineer", "Release Engineer", "Platform Engineer"],
    version: COMPETENCY_MODEL_VERSION,
  },
  {
    id: "en-assurance-gsn",
    code: "SE-EN-04",
    domain: "engineering",
    title: "Assurance cases (GSN)",
    definition:
      "Construct structured Goal Structuring Notation (GSN) arguments linking top-level claims, strategies, context, assumptions, and defeaters to objective evidence.",
    bloomTarget: "create",
    prerequisites: ["en-testing"],
    relations: [
      { targetId: "en-testing", kind: "assumes" },
      { targetId: "en-safety-stpa", kind: "extends" },
    ],
    frameworkAnchors: [
      {
        framework: "SEBoK",
        reference: "Part 6 · System Assurance & Safety Cases",
        note: "Explicit claim-argument-evidence chains and argument defeater tracking.",
      },
    ],
    levelDescriptors: [
      {
        level: 1,
        stage: "Search",
        observableOutcome:
          "Distinguish a claim, a strategy, a context assumption, and an evidence node.",
        requiredEvidence: ["quiz"],
      },
      {
        level: 2,
        stage: "Know",
        observableOutcome:
          "Explain how unstated assumptions or stale third-party dependencies defeat an argument.",
        requiredEvidence: ["quiz", "explain"],
      },
      {
        level: 3,
        stage: "Adapt",
        observableOutcome:
          "Review a safety/security argument and identify missing evidence or logical leaps.",
        requiredEvidence: ["lab", "variant"],
      },
      {
        level: 4,
        stage: "Proceed",
        observableOutcome:
          "Author a complete GSN assurance case including evidence-decay and defeater handling.",
        requiredEvidence: ["artifact"],
      },
    ],
    mappedVolumes: [
      "82-assurance-cases-gsn-argument-engineering-and-evidence-quality",
      "92-sector-assurance-applicability-and-regulatory-evidence-chains",
      "107-system-safety-integrated-hazard-analysis-and-risk-informed-safety-cases",
    ],
    roleTags: ["Assurance Engineer", "Safety Engineer", "Principal Systems Engineer"],
    version: COMPETENCY_MODEL_VERSION,
  },
  {
    id: "en-safety-stpa",
    code: "SE-EN-05",
    domain: "engineering",
    title: "System safety & STPA",
    definition:
      "Analyze socio-technical control structures using System-Theoretic Process Analysis (STPA) to identify Unsafe Control Actions and derive safety constraints.",
    bloomTarget: "analyze",
    prerequisites: ["st-loops", "en-assurance-gsn"],
    relations: [
      { targetId: "st-loops", kind: "assumes" },
      { targetId: "en-assurance-gsn", kind: "assumes" },
    ],
    frameworkAnchors: [
      {
        framework: "INCOSE SECF 2e",
        reference: "Specialty · System Safety Engineering",
        note: "Hazard identification, control-loop flaws, and safety constraint allocation.",
      },
      {
        framework: "ISO/IEC/IEEE",
        reference: "IEC 61508 / ISO 26262 / MIL-STD-882E (Reference Context)",
        note: "Sector safety assurance boundaries (educational mapping only).",
      },
    ],
    levelDescriptors: [
      {
        level: 1,
        stage: "Search",
        observableOutcome:
          "Identify why component reliability alone does not guarantee system safety.",
        requiredEvidence: ["quiz"],
      },
      {
        level: 2,
        stage: "Know",
        observableOutcome:
          "Classify all four Unsafe Control Action (UCA) guidewords in a control loop.",
        requiredEvidence: ["quiz", "explain"],
      },
      {
        level: 3,
        stage: "Adapt",
        observableOutcome:
          "Run an STPA analysis on a control structure and trace how sensor delay triggers a UCA.",
        requiredEvidence: ["lab", "variant"],
      },
      {
        level: 4,
        stage: "Proceed",
        observableOutcome:
          "Deliver a hazard register, UCA matrix, and enforceable safety constraints linked to tests.",
        requiredEvidence: ["artifact"],
      },
    ],
    mappedVolumes: [
      "36-system-safety-hazard-analysis-and-assurance",
      "68-system-safety-stpa-safety-cases-and-hazard-control",
      "107-system-safety-integrated-hazard-analysis-and-risk-informed-safety-cases",
    ],
    roleTags: ["System Safety Engineer", "Robotics/CPS Engineer", "Assurance Lead"],
    version: COMPETENCY_MODEL_VERSION,
  },
  {
    id: "en-dependability-markov",
    code: "SE-EN-06",
    domain: "engineering",
    title: "Markov dependability & Weibull",
    definition:
      "Model repairable system availability using continuous-time Markov chains, MTBF/MTTR rates, Weibull failure distributions, and common-cause failure factors.",
    bloomTarget: "create",
    prerequisites: ["sd-reliability"],
    relations: [{ targetId: "sd-reliability", kind: "assumes" }],
    frameworkAnchors: [
      {
        framework: "INCOSE SECF 2e",
        reference: "Specialty · Reliability, Availability & Maintainability",
        note: "Quantitative dependability modeling and common-cause failure analysis.",
      },
    ],
    levelDescriptors: [
      {
        level: 1,
        stage: "Search",
        observableOutcome:
          "Distinguish series vs. parallel availability and identify common-cause failure modes.",
        requiredEvidence: ["quiz"],
      },
      {
        level: 2,
        stage: "Know",
        observableOutcome:
          "Explain transition rate matrices, MTTR sensitivity, and Weibull shape parameter β.",
        requiredEvidence: ["quiz", "explain"],
      },
      {
        level: 3,
        stage: "Adapt",
        observableOutcome:
          "Compute steady-state availability for an HA pair and quantify common-cause impact.",
        requiredEvidence: ["lab", "variant"],
      },
      {
        level: 4,
        stage: "Proceed",
        observableOutcome:
          "Deliver a validated availability & repairability model defending infrastructure redundancy.",
        requiredEvidence: ["artifact"],
      },
    ],
    mappedVolumes: [
      "110-fmeca-failure-mechanisms-criticality-and-living-risk-assessment",
      "111-quantitative-reliability-weibull-censoring-growth-and-accelerated-life",
      "112-repairable-system-dependability-markov-models-and-availability-engineering",
    ],
    roleTags: ["Reliability Engineer", "Dependability Architect", "Principal SRE"],
    version: COMPETENCY_MODEL_VERSION,
  },
];

const BY_ID = new Map(COMPETENCIES.map((c) => [c.id, c]));

export function competencyById(id: string): CompetencyDefinition | undefined {
  return BY_ID.get(id);
}

/** Returns all curriculum lessons mapped to a competency. */
export function lessonsForCompetency(competencyId: string) {
  return allLessons()
    .filter((entry) => entry.lesson.skillIds.includes(competencyId))
    .map((entry) => ({
      key: lessonKey(entry.path.slug, entry.lesson.slug),
      pathSlug: entry.path.slug,
      pathTitle: entry.path.title,
      lessonSlug: entry.lesson.slug,
      lessonTitle: entry.lesson.title,
      minutes: entry.lesson.minutes,
    }));
}

/** Returns all labs mapped to a competency. */
export function labsForCompetency(competencyId: string) {
  return LABS.filter((l) => l.skillId === competencyId);
}

/** Maps a free-text role competency/exercise prompt string to atomic competency IDs. */
export function inferCompetenciesFromText(text: string): CompetencyDefinition[] {
  const hay = text.toLowerCase();
  const rules: [RegExp, string][] = [
    [/stock|flow|iceberg|dynamics|delay/, "st-stocks"],
    [/feedback|loop|causal|oscillat/, "st-loops"],
    [/leverage|policy resistance|incentive/, "st-leverage"],
    [/boundary|stakeholder|mission|framing|problem structur/, "st-boundaries"],
    [/requirement|29148|estimat|slo|sli|traceab|quality attribute/, "sd-requirements"],
    [/data|storage|schema|contract|migration|lakehouse|mesh|stream/, "sd-data"],
    [/scal|cach|cdn|shard|load|cloud|platform/, "sd-scale"],
    [/reliab|resilien|fault|chaos|observab|circuit|failover/, "sd-reliability"],
    [/consensus|raft|paxos|quorum|distributed|lineariz|replication/, "sd-consensus"],
    [/trade|mcda|adr|decision|sensitivity|atam|42030|utility|value/, "sd-trade-studies"],
    [/code|integrat|interface|architect|42010|mbse|sysml/, "en-reading"],
    [/verif|valid|v&v|test|formal|model check|qualification/, "en-testing"],
    [
      /ship|deliver|config|baseline|review|readiness|semp|lifecycle|support|obsolesc/,
      "en-shipping",
    ],
    [/gsn|assurance case|safety case|argument|evidence|regulat|certif/, "en-assurance-gsn"],
    [/safety|stpa|hazard|61508|26262|882|uca|threat|security|human/, "en-safety-stpa"],
    [
      /markov|weibull|fmeca|fmea|mtbf|mttr|availability|dependab|rcm|phm/,
      "en-dependability-markov",
    ],
  ];

  const matched = new Set<string>();
  for (const [re, id] of rules) {
    if (re.test(hay)) matched.add(id);
  }
  return Array.from(matched)
    .map((id) => BY_ID.get(id))
    .filter((c): c is CompetencyDefinition => Boolean(c));
}

export interface CompetencyGraphValidation {
  valid: boolean;
  errors: string[];
  stats: {
    competencyCount: number;
    skillParityOk: boolean;
    lessonCount: number;
    mappedLessonCount: number;
    labCount: number;
    mappedLabCount: number;
  };
}

/** Validates acyclic prerequisite DAG, 1:1 skill parity, and complete lesson/lab mappings. */
export function validateCompetencyGraph(): CompetencyGraphValidation {
  const errors: string[] = [];
  const ids = new Set(COMPETENCIES.map((c) => c.id));
  const skillIds = new Set(SKILLS.map((s) => s.id));

  for (const s of SKILLS) {
    if (!ids.has(s.id)) errors.push(`Skill ${s.id} is missing a CompetencyDefinition.`);
  }
  for (const c of COMPETENCIES) {
    if (!skillIds.has(c.id)) errors.push(`Competency ${c.id} has no matching Skill entry.`);
    for (const prereq of c.prerequisites) {
      if (!ids.has(prereq))
        errors.push(`Competency ${c.id} references unknown prerequisite ${prereq}.`);
    }
    for (const rel of c.relations) {
      if (!ids.has(rel.targetId))
        errors.push(`Competency ${c.id} references unknown relation ${rel.targetId}.`);
    }
  }

  // Cycle detection via DFS
  const state = new Map<string, "visiting" | "visited">();
  const visit = (id: string, trail: string[]) => {
    const st = state.get(id);
    if (st === "visited") return;
    if (st === "visiting") {
      errors.push(`Prerequisite cycle detected: ${[...trail, id].join(" -> ")}`);
      return;
    }
    state.set(id, "visiting");
    const comp = BY_ID.get(id);
    if (comp) {
      for (const p of comp.prerequisites) visit(p, [...trail, id]);
    }
    state.set(id, "visited");
  };
  for (const c of COMPETENCIES) visit(c.id, []);

  // Verify every lesson and lab references valid competency IDs
  const lessons = allLessons();
  let mappedLessons = 0;
  for (const entry of lessons) {
    const validSkills = entry.lesson.skillIds.filter((id) => ids.has(id));
    if (validSkills.length > 0) mappedLessons++;
    for (const sid of entry.lesson.skillIds) {
      if (!ids.has(sid)) {
        errors.push(
          `Lesson ${entry.path.slug}/${entry.lesson.slug} references unknown skill ${sid}.`,
        );
      }
    }
  }

  let mappedLabs = 0;
  for (const lab of LABS) {
    if (ids.has(lab.skillId)) mappedLabs++;
    else errors.push(`Lab ${lab.id} references unknown skill ${lab.skillId}.`);
  }

  return {
    valid: errors.length === 0,
    errors,
    stats: {
      competencyCount: COMPETENCIES.length,
      skillParityOk: COMPETENCIES.length === SKILLS.length && ids.size === skillIds.size,
      lessonCount: lessons.length,
      mappedLessonCount: mappedLessons,
      labCount: LABS.length,
      mappedLabCount: mappedLabs,
    },
  };
}
