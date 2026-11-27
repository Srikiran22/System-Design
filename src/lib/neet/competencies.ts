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

/* ---------- INCOSE SECF 2e Crosswalk (16 NEET skills -> 37-competency reference) ---------- */

export type CrosswalkMappingType = "direct" | "partial" | "supporting" | "unmapped";

export interface IncoseCrosswalkEntry {
  neetCompetencyId: string;
  incoseCompetencyId: string;
  incoseDomain: "Core" | "Technical" | "Management" | "Professional" | "Integrating";
  incoseTitle: string;
  mappingType: CrosswalkMappingType;
  rationale: string;
  indicatorRefs: string[];
  sourceEdition: "INCOSE SECF 2e";
  reviewedAt: string;
}

export const INCOSE_CROSSWALK_NOTICE =
  "NEET covers a tailored 16-competency subset mapped explicitly to INCOSE SECF 2nd Edition (37 competencies across 5 domains). Unmapped professional/programmatic competencies (e.g., Acquisition, Contracting, Negotiation, Coaching) remain intentionally outside this self-directed technical curriculum.";

export const INCOSE_CROSSWALK: IncoseCrosswalkEntry[] = [
  {
    neetCompetencyId: "st-stocks",
    incoseCompetencyId: "INCOSE-CORE-01",
    incoseDomain: "Core",
    incoseTitle: "Systems Thinking",
    mappingType: "direct",
    rationale:
      "Stocks, flows, and accumulation delays directly address Core Systems Thinking fundamentals.",
    indicatorRefs: ["SECF2e Core: Systems Thinking — Awareness/Supervised Practitioner"],
    sourceEdition: "INCOSE SECF 2e",
    reviewedAt: "2026-11-25",
  },
  {
    neetCompetencyId: "st-loops",
    incoseCompetencyId: "INCOSE-CORE-01",
    incoseDomain: "Core",
    incoseTitle: "Systems Thinking",
    mappingType: "direct",
    rationale:
      "Causal loop polarity, non-linear feedback, and delay-induced oscillation directly map to Core Systems Thinking.",
    indicatorRefs: ["SECF2e Core: Systems Thinking — Practitioner"],
    sourceEdition: "INCOSE SECF 2e",
    reviewedAt: "2026-11-25",
  },
  {
    neetCompetencyId: "st-leverage",
    incoseCompetencyId: "INCOSE-CORE-04",
    incoseDomain: "Core",
    incoseTitle: "Critical Thinking",
    mappingType: "partial",
    rationale:
      "Ranking structural interventions over parameter tweaks supports Critical & Systems Thinking, without covering organizational governance policy.",
    indicatorRefs: ["SECF2e Core: Critical Thinking — Intervention Evaluation"],
    sourceEdition: "INCOSE SECF 2e",
    reviewedAt: "2026-11-25",
  },
  {
    neetCompetencyId: "st-boundaries",
    incoseCompetencyId: "INCOSE-TECH-01",
    incoseDomain: "Technical",
    incoseTitle: "Requirements Definition",
    mappingType: "partial",
    rationale:
      "Boundary critique and stakeholder elicitation cover operational context framing leading into Requirements Definition.",
    indicatorRefs: ["SECF2e Technical: Requirements Definition — Context & Stakeholder Needs"],
    sourceEdition: "INCOSE SECF 2e",
    reviewedAt: "2026-11-25",
  },
  {
    neetCompetencyId: "sd-requirements",
    incoseCompetencyId: "INCOSE-TECH-01",
    incoseDomain: "Technical",
    incoseTitle: "Requirements Definition",
    mappingType: "direct",
    rationale:
      "Verifiable ISO 29148 requirements, quantitative sizing budgets, and verification method allocation directly map to Requirements Definition.",
    indicatorRefs: ["SECF2e Technical: Requirements Definition — Verifiable Spec & Sizing"],
    sourceEdition: "INCOSE SECF 2e",
    reviewedAt: "2026-11-25",
  },
  {
    neetCompetencyId: "sd-data",
    incoseCompetencyId: "INCOSE-TECH-02",
    incoseDomain: "Technical",
    incoseTitle: "System Architecting",
    mappingType: "partial",
    rationale:
      "Covers software/data storage architecture, schema contracts, and migration safety within System Architecting.",
    indicatorRefs: ["SECF2e Technical: System Architecting — Data & Interface Viewpoints"],
    sourceEdition: "INCOSE SECF 2e",
    reviewedAt: "2026-11-25",
  },
  {
    neetCompetencyId: "sd-scale",
    incoseCompetencyId: "INCOSE-TECH-03",
    incoseDomain: "Technical",
    incoseTitle: "Design For ... (Performance & Scalability)",
    mappingType: "partial",
    rationale:
      "Addresses software scaling, caching staleness bounds, and load shedding as specialty quality-attribute design.",
    indicatorRefs: ["SECF2e Technical: Design For — Performance & Capacity"],
    sourceEdition: "INCOSE SECF 2e",
    reviewedAt: "2026-11-25",
  },
  {
    neetCompetencyId: "sd-reliability",
    incoseCompetencyId: "INCOSE-TECH-03",
    incoseDomain: "Technical",
    incoseTitle: "Design For ... (Reliability & Resilience)",
    mappingType: "direct",
    rationale:
      "Defense in depth, fault containment, error budgets, and SLOs directly align with Reliability/Resilience specialty engineering.",
    indicatorRefs: ["SECF2e Technical: Design For — Reliability, Availability & Maintainability"],
    sourceEdition: "INCOSE SECF 2e",
    reviewedAt: "2026-11-25",
  },
  {
    neetCompetencyId: "sd-consensus",
    incoseCompetencyId: "INCOSE-TECH-02",
    incoseDomain: "Technical",
    incoseTitle: "System Architecting",
    mappingType: "supporting",
    rationale:
      "Deep software distributed-systems specialty supporting fault-tolerant System Architecting under network partitions.",
    indicatorRefs: ["SECF2e Technical: System Architecting — Fault-Tolerant Coordination"],
    sourceEdition: "INCOSE SECF 2e",
    reviewedAt: "2026-11-25",
  },
  {
    neetCompetencyId: "sd-trade-studies",
    incoseCompetencyId: "INCOSE-MGMT-04",
    incoseDomain: "Management",
    incoseTitle: "Decision Management",
    mappingType: "direct",
    rationale:
      "Swing-weighted MCDA trade studies, ADRs, and sensitivity sweeps directly implement INCOSE Decision Management.",
    indicatorRefs: ["SECF2e Management: Decision Management — Trade Studies & Sensitivity"],
    sourceEdition: "INCOSE SECF 2e",
    reviewedAt: "2026-11-25",
  },
  {
    neetCompetencyId: "en-reading",
    incoseCompetencyId: "INCOSE-TECH-04",
    incoseDomain: "Technical",
    incoseTitle: "Integration & Interfaces",
    mappingType: "partial",
    rationale:
      "Tracing existing software architectures and interface boundaries builds practical Integration & Interface comprehension.",
    indicatorRefs: ["SECF2e Technical: Integration — Interface & Dependency Analysis"],
    sourceEdition: "INCOSE SECF 2e",
    reviewedAt: "2026-11-25",
  },
  {
    neetCompetencyId: "en-testing",
    incoseCompetencyId: "INCOSE-TECH-06",
    incoseDomain: "Technical",
    incoseTitle: "Verification & Validation",
    mappingType: "direct",
    rationale:
      "Requirement-linked V&V pyramids, contract tests, and objective evidence coverage directly map to Verification & Validation.",
    indicatorRefs: ["SECF2e Technical: Verification", "SECF2e Technical: Validation"],
    sourceEdition: "INCOSE SECF 2e",
    reviewedAt: "2026-11-25",
  },
  {
    neetCompetencyId: "en-shipping",
    incoseCompetencyId: "INCOSE-TECH-08",
    incoseDomain: "Technical",
    incoseTitle: "Transition, Operation & Support",
    mappingType: "partial",
    rationale:
      "Thin vertical slices, rollbacks, configuration baselines, and operational runbooks map partially to Transition & Operation.",
    indicatorRefs: ["SECF2e Technical: Transition", "SECF2e Management: Configuration Management"],
    sourceEdition: "INCOSE SECF 2e",
    reviewedAt: "2026-11-25",
  },
  {
    neetCompetencyId: "en-assurance-gsn",
    incoseCompetencyId: "INCOSE-TECH-07",
    incoseDomain: "Technical",
    incoseTitle: "Systems Modeling & Assurance Analysis",
    mappingType: "partial",
    rationale:
      "Structured GSN claim-argument-evidence cases and defeater tracking cover assurance argumentation without formal tool certification.",
    indicatorRefs: ["SECF2e Technical: Systems Modeling & Analysis — Assurance Cases"],
    sourceEdition: "INCOSE SECF 2e",
    reviewedAt: "2026-11-25",
  },
  {
    neetCompetencyId: "en-safety-stpa",
    incoseCompetencyId: "INCOSE-TECH-03",
    incoseDomain: "Technical",
    incoseTitle: "Design For ... (System Safety)",
    mappingType: "direct",
    rationale:
      "STPA control-structure hazard analysis, UCAs, and enforceable safety constraints directly address System Safety specialty engineering.",
    indicatorRefs: ["SECF2e Technical: Design For — System Safety Engineering"],
    sourceEdition: "INCOSE SECF 2e",
    reviewedAt: "2026-11-25",
  },
  {
    neetCompetencyId: "en-dependability-markov",
    incoseCompetencyId: "INCOSE-TECH-03",
    incoseDomain: "Technical",
    incoseTitle: "Design For ... (RAM / Quantitative Dependability)",
    mappingType: "direct",
    rationale:
      "Continuous-time Markov availability chains, MTBF/MTTR, Weibull analysis, and common-cause failure directly map to RAM specialty engineering.",
    indicatorRefs: ["SECF2e Technical: Design For — Reliability, Availability & Maintainability"],
    sourceEdition: "INCOSE SECF 2e",
    reviewedAt: "2026-11-25",
  },
];

const CROSSWALK_BY_SKILL = new Map(INCOSE_CROSSWALK.map((e) => [e.neetCompetencyId, e]));

export function incoseCrosswalkFor(skillId: string): IncoseCrosswalkEntry | undefined {
  return CROSSWALK_BY_SKILL.get(skillId);
}

/** Selected INCOSE SECF 2e domains intentionally outside NEET's current 16-skill technical scope. */
export const INCOSE_INTENTIONALLY_UNMAPPED: {
  id: string;
  domain: string;
  title: string;
  note: string;
}[] = [
  {
    id: "INCOSE-MGMT-01",
    domain: "Management",
    title: "Planning, Acquisition & Contracting",
    note: "Organizational procurement and contract management are outside NEET's technical engineering track.",
  },
  {
    id: "INCOSE-PROF-01",
    domain: "Professional",
    title: "Negotiation, Coaching & Organizational Leadership",
    note: "Interpersonal leadership competencies require live workplace observation rather than self-paced labs.",
  },
  {
    id: "INCOSE-INTG-01",
    domain: "Integrating",
    title: "Project Portfolio & Enterprise Investment Governance",
    note: "Covered as reading reference in the Library, not assessed as a core hands-on competency.",
  },
];

/* ---------- Provisional Role Profiles (Stage 4D) ---------- */

export interface RoleProfile {
  id: string;
  title: string;
  status: "provisional";
  disclaimer: string;
  summary: string;
  requiredLevels: Record<string, 1 | 2 | 3 | 4>;
}

export const ROLE_PROFILES: RoleProfile[] = [
  {
    id: "early-career-se",
    title: "Early-Career Systems Engineer",
    status: "provisional",
    disclaimer:
      "Provisional educational profile — useful for structuring study priorities, not an accredited hiring or certification standard.",
    summary:
      "Builds foundational systems thinking, verifiable requirements, interface reading, V&V testing, and trade-study habits.",
    requiredLevels: {
      "st-stocks": 2,
      "st-loops": 3,
      "st-boundaries": 2,
      "sd-requirements": 3,
      "sd-trade-studies": 3,
      "en-reading": 3,
      "en-testing": 3,
      "en-shipping": 2,
    },
  },
  {
    id: "software-systems-architect",
    title: "Software / Systems Architect",
    status: "provisional",
    disclaimer:
      "Provisional educational profile — focuses on distributed software architecture, reliability, and explicit trade-off defense.",
    summary:
      "Targets high-proficiency architecture framing, data contracts, caching/scaling, distributed consensus, resilience, and MCDA trade studies.",
    requiredLevels: {
      "st-loops": 3,
      "st-leverage": 3,
      "st-boundaries": 3,
      "sd-requirements": 4,
      "sd-data": 4,
      "sd-scale": 3,
      "sd-reliability": 4,
      "sd-consensus": 3,
      "sd-trade-studies": 4,
      "en-reading": 3,
      "en-shipping": 3,
    },
  },
  {
    id: "safety-reliability-assurance",
    title: "Safety, Reliability & Assurance Engineer",
    status: "provisional",
    disclaimer:
      "Provisional educational profile — prepares portfolio artifacts for review; does not replace sector regulatory qualification (DO-178C, ISO 26262, IEC 61508).",
    summary:
      "Emphasizes hazard analysis (STPA), GSN assurance cases, Markov dependability modeling, V&V independence, and verifiable requirements.",
    requiredLevels: {
      "st-loops": 3,
      "st-boundaries": 3,
      "sd-requirements": 3,
      "sd-reliability": 4,
      "sd-trade-studies": 3,
      "en-testing": 4,
      "en-assurance-gsn": 4,
      "en-safety-stpa": 4,
      "en-dependability-markov": 4,
    },
  },
];

export function roleProfileById(id?: string): RoleProfile | undefined {
  if (!id) return undefined;
  return ROLE_PROFILES.find((r) => r.id === id);
}

/* ---------- Deterministic Curriculum Gap Report (Stage 4C) ---------- */

export interface CurriculumGapItem {
  competencyId: string;
  code: string;
  title: string;
  lessonCount: number;
  labCount: number;
  hasArtifactAssessment: boolean;
  hasCrosswalk: boolean;
  gaps: string[];
}

export interface CurriculumGapReport {
  generatedAt: string;
  totalCompetencies: number;
  competenciesWithNoLessons: string[];
  competenciesWithNoLabs: string[];
  competenciesMissingArtifactAssessment: string[];
  competenciesMissingCrosswalk: string[];
  items: CurriculumGapItem[];
}

/** Deterministic audit of every competency's curriculum & assessment coverage. */
export function computeCurriculumGapReport(): CurriculumGapReport {
  const items: CurriculumGapItem[] = [];
  const noLessons: string[] = [];
  const noLabs: string[] = [];
  const missingArtifact: string[] = [];
  const missingCrosswalk: string[] = [];

  for (const comp of COMPETENCIES) {
    const lessons = lessonsForCompetency(comp.id);
    const labs = labsForCompetency(comp.id);
    const hasArtifact = labs.some((l) => l.evidenceType === "artifact");
    const hasCrosswalk = CROSSWALK_BY_SKILL.has(comp.id);
    const gaps: string[] = [];

    if (lessons.length === 0) {
      noLessons.push(comp.id);
      gaps.push("No dedicated lesson mapped");
    }
    if (labs.length === 0) {
      noLabs.push(comp.id);
      gaps.push("Passive-only coverage (no hands-on lab)");
    }
    if (!hasArtifact) {
      missingArtifact.push(comp.id);
      gaps.push("No standalone artifact lab (relies on Capstone milestone for Proceed L4)");
    }
    if (!hasCrosswalk) {
      missingCrosswalk.push(comp.id);
      gaps.push("Missing INCOSE SECF 2e crosswalk entry");
    }

    items.push({
      competencyId: comp.id,
      code: comp.code,
      title: comp.title,
      lessonCount: lessons.length,
      labCount: labs.length,
      hasArtifactAssessment: hasArtifact,
      hasCrosswalk,
      gaps,
    });
  }

  return {
    generatedAt: "2026-11-25",
    totalCompetencies: COMPETENCIES.length,
    competenciesWithNoLessons: noLessons,
    competenciesWithNoLabs: noLabs,
    competenciesMissingArtifactAssessment: missingArtifact,
    competenciesMissingCrosswalk: missingCrosswalk,
    items,
  };
}
