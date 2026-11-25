import type { EvidenceType } from "./types";

export const RUBRIC_VERSION = "1.0.0";

export interface RubricCriterion {
  id: string;
  label: string;
  weight: number;
  descriptors: {
    1: string;
    2: string;
    3: string;
    4: string;
  };
  revisionHint: string;
}

export interface RubricDefinition {
  id: string;
  version: string;
  passThreshold: number; // 0..1 weighted score required to meet Adapt/Proceed gate
  criteria: RubricCriterion[];
}

export interface RubricEvaluation {
  rubricId: string;
  rubricVersion: string;
  weightedScore: number; // 0..1
  passedThreshold: boolean;
  criterionResults: {
    id: string;
    label: string;
    level: number; // 1..4
    passed: boolean;
    feedback: string;
  }[];
  feedbackSummary: string[];
}

const STANDARD_LAB_CRITERIA: RubricCriterion[] = [
  {
    id: "framing",
    label: "Boundary & Assumptions",
    weight: 0.25,
    descriptors: {
      1: "Boundary or operating assumptions are omitted.",
      2: "Assumptions are implied but incomplete or unquantified.",
      3: "Explicit system boundary, load/scope assumptions, and constraints stated clearly.",
      4: "Boundary explicitly justified with edge-case constraints and stakeholder impact.",
    },
    revisionHint:
      "State your system boundary and quantify key operating assumptions before designing.",
  },
  {
    id: "rigor",
    label: "Technical & Analytical Rigor",
    weight: 0.35,
    descriptors: {
      1: "Major conceptual errors or missing core steps.",
      2: "Core steps attempted but math, model invariants, or trace contains gaps.",
      3: "All steps executed accurately with verifiable calculations, traces, or diagrams.",
      4: "Rigorous analysis cross-checked against failure modes and quantitative bounds.",
    },
    revisionHint:
      "Show explicit arithmetic, state transitions, or control-loop invariants step by step.",
  },
  {
    id: "twist",
    label: "Constraint Twist & Trade-off Defense",
    weight: 0.25,
    descriptors: {
      1: "Twist constraint was skipped or hand-waved.",
      2: "Identifies what breaks under the twist without proposing a concrete mitigation.",
      3: "Analyzes failure mode under the twist and defends a mitigation with explicit trade-offs.",
      4: "Quantifies the breaking point, defends mitigation trade-offs, and names what would invalidate it.",
    },
    revisionHint:
      "Directly address the constraint twist: name what fails first and what your mitigation costs.",
  },
  {
    id: "artifact",
    label: "Artifact Clarity & Verifiability",
    weight: 0.15,
    descriptors: {
      1: "Notes only; no inspectable artifact or concrete evidence provided.",
      2: "Artifact is present but another engineer could not reproduce or verify it.",
      3: "Self-contained artifact with clear structure that another engineer can inspect.",
      4: "Reproducible, review-ready deliverable linking decisions to measurable acceptance criteria.",
    },
    revisionHint:
      "Include an inspectable link, structured diagram/spec, or reproducible verification artifact.",
  },
];

export const LAB_RUBRICS: Record<string, RubricDefinition> = {
  default: {
    id: "rubric-lab-standard",
    version: RUBRIC_VERSION,
    passThreshold: 0.65,
    criteria: STANDARD_LAB_CRITERIA,
  },
  "lab-mcda-trade-study": {
    id: "rubric-mcda-v1",
    version: RUBRIC_VERSION,
    passThreshold: 0.7,
    criteria: [
      STANDARD_LAB_CRITERIA[0]!,
      {
        id: "rigor",
        label: "Swing Weights & Normalized Scoring",
        weight: 0.35,
        descriptors: {
          1: "Weights are arbitrary and scoring scales are inconsistent.",
          2: "Criteria weighted, but normalization or composite math has gaps.",
          3: "Explicit swing weights sum to 1.0 with documented 0–10 scales across 3 alternatives.",
          4: "Swing weights justified by range impact, normalized scores verified, and dominated options pruned.",
        },
        revisionHint:
          "Ensure swing weights sum to 1.0 and document why each alternative earned its 0–10 score.",
      },
      {
        id: "twist",
        label: "Sensitivity Sweep & Tipping Point",
        weight: 0.25,
        descriptors: {
          1: "No sensitivity check performed.",
          2: "Mentions sensitivity qualitatively without re-computing rankings.",
          3: "Tests ±20% weight sweep and 40% budget cut, explicitly showing whether the winner flips.",
          4: "Identifies exact tipping-point weight/cost threshold and documents decision-reversal triggers.",
        },
        revisionHint:
          "Re-calculate composite scores under the ±20% weight shift and 40% budget cut to locate the flip point.",
      },
      STANDARD_LAB_CRITERIA[3]!,
    ],
  },
  "lab-gsn-assurance": {
    id: "rubric-gsn-v1",
    version: RUBRIC_VERSION,
    passThreshold: 0.75,
    criteria: [
      {
        id: "framing",
        label: "Top Goal, Context & Assumptions",
        weight: 0.25,
        descriptors: {
          1: "Top-level safety claim is vague or unmeasurable.",
          2: "Claim stated, but operational context or assumptions are missing.",
          3: "Clear G1 claim bounded by explicit operational context (C1) and assumptions (A1).",
          4: "Precise safety claim with bounded ODD, explicit assumptions, and scope exclusions.",
        },
        revisionHint:
          "Tighten G1 so it is falsifiable and pair it with explicit Context (C) and Assumption (A) nodes.",
      },
      {
        id: "rigor",
        label: "Strategy Decomposition & Evidence Nodes",
        weight: 0.35,
        descriptors: {
          1: "Claims jump directly to generic testing with no decomposition strategy.",
          2: "Has sub-goals, but evidence nodes do not clearly discharge the claims.",
          3: "Explicit Strategy (S1) decomposes into detection, actuation, and V&V sub-goals backed by concrete Solution (Sn) artifacts.",
          4: "Traceable argument tree with independent evidence types (test, analysis, FMECA) and zero logical leaps.",
        },
        revisionHint:
          "Link every leaf sub-goal to a concrete, verifiable Solution node (test report, analysis, or proof).",
      },
      {
        id: "twist",
        label: "Defeater & Evidence Decay Handling",
        weight: 0.25,
        descriptors: {
          1: "Uncertified dependency update is ignored.",
          2: "Notes risk generically without marking affected GSN nodes.",
          3: "Identifies impacted sub-goals/solutions, marks evidence stale, and states re-verification gate.",
          4: "Models explicit Counter-Evidence/Defeater node, containment boundary, and re-certification trigger.",
        },
        revisionHint:
          "Show exactly which Solution and Sub-Goal nodes are defeated by the uncertified library update.",
      },
      STANDARD_LAB_CRITERIA[3]!,
    ],
  },
};

export function getRubricForLab(labId: string): RubricDefinition {
  return LAB_RUBRICS[labId] ?? LAB_RUBRICS["default"]!;
}

/**
 * Pure deterministic rubric evaluation.
 * Ratings are 1..4 per criterion; weighted score is normalized to 0..1 ((rating - 1) / 3).
 * Any criterion rated 1 or 2 produces targeted revision feedback.
 */
export function evaluateRubric(
  rubric: RubricDefinition,
  ratings: Record<string, number>,
): RubricEvaluation {
  const totalWeight = rubric.criteria.reduce((sum, c) => sum + c.weight, 0) || 1;
  let weightedSum = 0;
  const criterionResults: RubricEvaluation["criterionResults"] = [];
  const feedbackSummary: string[] = [];

  for (const c of rubric.criteria) {
    const raw = ratings[c.id] ?? 1;
    const level = Math.min(4, Math.max(1, Math.round(raw))) as 1 | 2 | 3 | 4;
    const normalized = (level - 1) / 3;
    weightedSum += normalized * c.weight;
    const passed = level >= 3;
    const feedback = passed ? `Met (${level}/4): ${c.descriptors[level]}` : c.revisionHint;
    criterionResults.push({
      id: c.id,
      label: c.label,
      level,
      passed,
      feedback,
    });
    if (!passed) {
      feedbackSummary.push(`${c.label}: ${c.revisionHint}`);
    }
  }

  const weightedScore = Number((weightedSum / totalWeight).toFixed(4));
  const allCorePassed = criterionResults.every((r) => r.level >= 2);
  const passedThreshold = weightedScore >= rubric.passThreshold && allCorePassed;

  if (passedThreshold && feedbackSummary.length === 0) {
    feedbackSummary.push(
      "All rubric criteria met proficiency. Consider requesting peer or mentor review to move from provisional self-evaluation to independently verified evidence.",
    );
  }

  return {
    rubricId: rubric.id,
    rubricVersion: rubric.version,
    weightedScore,
    passedThreshold,
    criterionResults,
    feedbackSummary,
  };
}

export interface ScenarioOption {
  id: string;
  label: string;
  tradeoff: string;
  score: number; // 0..1 (1 = strongest engineering judgment, 0.5 = partial, 0 = flawed)
  feedback: string;
}

export interface ScenarioChallenge {
  id: string;
  title: string;
  skillId: string;
  domainContext: string;
  situation: string;
  constraints: string[];
  question: string;
  options: ScenarioOption[];
  invalidationPrompt: string;
}

/** Realistic worked engineering scenarios testing analysis, evaluation, and trade-off defense. */
export const SCENARIOS: ScenarioChallenge[] = [
  {
    id: "scen-partition-dispatch",
    title: "Emergency Dispatch Split-Brain Under WAN Partition",
    skillId: "sd-consensus",
    domainContext: "Multi-region dispatch service · CAP & linearizability",
    situation:
      "A 3-zone regional dispatch cluster handles ambulance assignment. A fiber cut isolates Zone C (1 node) from Zones A and B (2 nodes). Zone C still receives local 911 calls.",
    constraints: [
      "Duplicate ambulance dispatch to two incidents causes life-safety risk, but refusing all emergency intake in Zone C is also unacceptable.",
      "WAN recovery takes 15–45 minutes.",
      "Central Raft quorum remains healthy in Zones A+B.",
    ],
    question: "Which architectural strategy best balances safety and operational continuity?",
    options: [
      {
        id: "opt-async-master",
        label:
          "Allow Zone C to accept normal writes locally and merge last-write-wins after healing",
        tradeoff: "High local availability, breaks unit-allocation exclusivity invariant",
        score: 0.25,
        feedback:
          "Last-write-wins violates the single-assignment invariant: two incidents can dispatch the same ambulance during the partition, causing a silent safety hazard.",
      },
      {
        id: "opt-quorum-fence",
        label:
          "Keep Raft quorum in A+B for primary fleet; switch Zone C to a pre-partitioned local reserve pool with fenced lease IDs and explicit reconciliation queue",
        tradeoff: "Preserves exclusivity invariant while maintaining degraded local intake",
        score: 1,
        feedback:
          "Strong systems judgment: fencing leases + a pre-allocated local reserve pool preserves linearizable fleet ownership without halting emergency intake in the isolated zone.",
      },
      {
        id: "opt-halt-all",
        label: "Fail closed across all zones until all 3 nodes reconnect",
        tradeoff: "Maximum consistency, total outage despite majority quorum",
        score: 0,
        feedback:
          "Failing closed in A+B defeats the purpose of a 3-node Raft quorum, which explicitly tolerates 1 failed/partitioned node.",
      },
    ],
    invalidationPrompt:
      "What assumption would invalidate this design? (e.g., reserve ambulances already deployed outside Zone C before the cut)",
  },
  {
    id: "scen-stpa-sensor-delay",
    title: "Automated Braking Controller — Sensor Latency Drift",
    skillId: "en-safety-stpa",
    domainContext: "Cyber-physical safety · STPA control loop",
    situation:
      "All individual hardware components (radar, CAN bus, brake ECU) meet their MTBF targets. During heavy rain + diagnostic logging, CAN bus latency spikes from 10ms to 260ms.",
    constraints: [
      "Vehicle braking distance margin assumes <= 50ms perception-to-actuation delay.",
      "Diagnostic telemetry shares the same CAN bus priority queue as radar obstacle frames.",
    ],
    question: "How does STPA diagnose and mitigate this hazard?",
    options: [
      {
        id: "opt-dual-radar",
        label: "Buy a higher-MTBF radar unit to lower component failure probability",
        tradeoff: "Addresses component failure, misses systemic interaction flaw",
        score: 0,
        feedback:
          "Component reliability is not the cause here—the radar did not fail. Shared bus contention creates a 'Control Action Provided Too Late' UCA even with 100% reliable hardware.",
      },
      {
        id: "opt-stpa-constraints",
        label:
          "Classify UCA-3 (braking provided too late), isolate safety-critical frames onto a dedicated priority/time-triggered channel, and enforce stale-timestamp watchdog fallback",
        tradeoff:
          "Adds bus partitioning complexity and watchdog fail-safe mode, eliminates timing hazard",
        score: 1,
        feedback:
          "Exact STPA reasoning: eliminates the shared-resource feedback delay causing UCA-3 and bounds residual latency with an enforceable controller freshness constraint.",
      },
      {
        id: "opt-log-after",
        label: "Keep shared bus but alert operators when average latency exceeds 100ms",
        tradeoff: "Low effort, reactive after safety margin is already breached",
        score: 0.35,
        feedback:
          "Alerting on average latency reacts far too slowly for a 50ms real-time safety budget and misses tail latency spikes.",
      },
    ],
    invalidationPrompt: "What operational scenario could still defeat the freshness watchdog?",
  },
  {
    id: "scen-slo-retry-storm",
    title: "Metastable Retry Storm After Downstream Slowdown",
    skillId: "sd-reliability",
    domainContext: "Production service · Feedback loops & defense in depth",
    situation:
      "A payments dependency slows from 40ms to 600ms. Upstream API gateways retry 3 times with fixed 100ms intervals. CPU saturates at 100% and stays collapsed even after the database recovers.",
    constraints: [
      "Checkout p99 SLO is 500ms; error budget is 0.1% monthly.",
      "Clients must never double-charge on retry.",
    ],
    question: "Which combination breaks the reinforcing collapse loop cleanly?",
    options: [
      {
        id: "opt-more-retries",
        label:
          "Increase gateway timeout to 5s and bump retries to 5 so requests eventually succeed",
        tradeoff: "Amplifies queue stock and locks up worker threads",
        score: 0,
        feedback:
          "Longer timeouts and extra retries pour fuel on the reinforcing retry-storm loop, exhausting connection pools and turning a brief blip into a prolonged outage.",
      },
      {
        id: "opt-bounded-defense",
        label:
          "Enforce per-call deadline propagation, exponential backoff with jitter, a retry budget (<=10% of traffic), circuit breaking, and mandatory idempotency keys",
        tradeoff:
          "Returns fast 503s during overload while preserving recovery headroom and payment safety",
        score: 1,
        feedback:
          "Textbook defense in depth: retry budgets and circuit breakers cut the reinforcing loop, jitter prevents synchronized waves, and idempotency keys make retries financially safe.",
      },
      {
        id: "opt-autoscale",
        label: "Trigger horizontal autoscaling when CPU > 70%",
        tradeoff:
          "Too slow (minutes) to stop a seconds-scale retry cascade; amplifies downstream DB load",
        score: 0.35,
        feedback:
          "Autoscaling reacts slower than retry amplification and can actually send even more traffic to an already-struggling downstream dependency.",
      },
    ],
    invalidationPrompt:
      "What happens if downstream callers ignore idempotency keys on client-initiated retries?",
  },
  {
    id: "scen-req-verifiability",
    title: "Making an Ambiguous Requirement Verifiable",
    skillId: "sd-requirements",
    domainContext: "Requirements engineering · ISO/IEC/IEEE 29148",
    situation:
      "A stakeholder writes: 'The telemetry ingestion pipeline must be fast, highly available, and secure against unauthorized access.'",
    constraints: [
      "Engineering and QA must sign off on objective acceptance tests before release.",
      "Peak burst load is 50,000 events/sec from field gateways.",
    ],
    question: "Which rewrite satisfies ISO/IEC/IEEE 29148 verifiability criteria?",
    options: [
      {
        id: "opt-vague",
        label: "The pipeline shall be industry-leading in speed, uptime, and enterprise security.",
        tradeoff: "Marketing language; impossible to verify objectively",
        score: 0,
        feedback:
          "Adjectives like 'industry-leading' have zero pass/fail threshold and cannot be bound to a verification method.",
      },
      {
        id: "opt-verifiable",
        label:
          "At 50k events/s sustained for 30m, p99 ingest-to-durable-ack latency shall be <=150ms (Verification: load test), monthly availability >=99.95% (Verification: synthetic SLI probe), and 100% of requests without valid mTLS client certs shall be rejected with 401/403 (Verification: security integration suite).",
        tradeoff:
          "Requires upfront stakeholder negotiation on thresholds, eliminates acceptance ambiguity",
        score: 1,
        feedback:
          "Measurable, bounded by load profile, unambiguous, and directly coupled to an explicit verification method for every attribute.",
      },
      {
        id: "opt-impl-lock",
        label: "The pipeline shall use Apache Kafka with 12 partitions and TLS 1.3.",
        tradeoff:
          "Prescribes implementation prematurely without stating measurable performance outcomes",
        score: 0.4,
        feedback:
          "Prematurely prescribes a specific tool/partition count as a requirement instead of defining the required performance and security behavior.",
      },
    ],
    invalidationPrompt:
      "Which external dependency change would invalidate the 99.95% availability requirement?",
  },
];

export interface CapstoneMilestone {
  id: string;
  order: number;
  title: string;
  traceStage: string;
  skillIds: string[];
  evidenceType: Extract<EvidenceType, "artifact">;
  deliverables: string[];
  traceabilityLink: string;
  prompt: string;
  rubric: RubricDefinition;
}

/**
 * Cumulative Systems Engineering Capstone:
 * "Design a Dependable Regional Emergency Dispatch & Triage Service"
 * Implements the full SEBoK/NASA traceability chain across 6 progressive milestones.
 */
export const CAPSTONE_PROJECT = {
  id: "capstone-dependable-dispatch",
  version: "1.0.0",
  title: "Dependable Regional Emergency Dispatch & Triage Service",
  summary:
    "Design a mission-critical regional dispatch service end to end. Each milestone builds directly on your prior artifacts—connecting stakeholder needs, verifiable requirements, trade studies, safety/security controls, availability models, and lifecycle defense.",
  disclaimer:
    "Portfolio capstone for developing and demonstrating engineering judgment. Rubric results are provisional until reviewed by a peer or qualified mentor; not an accredited certification.",
  milestones: [
    {
      id: "cap-m1-boundary",
      order: 1,
      title: "1. Problem Framing, Mission Measures & System Boundary",
      traceStage: "Stakeholder Need → Boundary",
      skillIds: ["st-boundaries", "st-stocks"],
      evidenceType: "artifact" as const,
      deliverables: [
        "Problem statement & mission effectiveness measures (MOEs)",
        "Explicit system context diagram declaring inside vs. outside scope",
        "Stakeholder register including dispatchers, field crews, hospitals, regulators, and citizens",
      ],
      traceabilityLink: "Feeds technical requirements in Milestone 2",
      prompt:
        "Define the operational boundary for a 3-zone emergency dispatch service handling 2,500 peak calls/hour. Identify at least two edge stakeholders affected by boundary choices.",
      rubric: STANDARD_LAB_CRITERIA_RUBRIC("cap-m1-rubric", 0.7),
    },
    {
      id: "cap-m2-requirements",
      order: 2,
      title: "2. Verifiable Requirements, Quality Attributes & SLOs",
      traceStage: "Boundary → Requirements",
      skillIds: ["sd-requirements", "sd-reliability"],
      evidenceType: "artifact" as const,
      deliverables: [
        "10+ measurable functional and quality requirements (ISO 29148 format)",
        "Peak load, storage, and p99 latency sizing arithmetic",
        "SLI/SLO error budget table with explicit verification method per requirement",
      ],
      traceabilityLink: "Traces to Milestone 1 stakeholders; drives Milestone 3 architecture",
      prompt:
        "Convert your Milestone 1 mission measures into unambiguous, verifiable technical requirements with explicit load profiles and verification methods (test, analysis, inspection, demonstration).",
      rubric: STANDARD_LAB_CRITERIA_RUBRIC("cap-m2-rubric", 0.7),
    },
    {
      id: "cap-m3-architecture-mcda",
      order: 3,
      title: "3. Architecture Views, Data Contracts & MCDA Trade Study",
      traceStage: "Requirements → Architecture",
      skillIds: ["sd-data", "sd-trade-studies", "sd-consensus"],
      evidenceType: "artifact" as const,
      deliverables: [
        "Logical component, deployment, and data-flow viewpoints (ISO 42010)",
        "Versioned dispatch event & unit-allocation interface contract",
        "MCDA trade study + 2 ADRs (e.g., active-active vs. fenced-quorum dispatch state) with ±20% sensitivity sweep",
      ],
      traceabilityLink:
        "Allocates Milestone 2 requirements to components; informs Milestone 4 hazard analysis",
      prompt:
        "Design the component topology and data contracts. Run a swing-weighted MCDA trade study comparing three replication topologies under WAN partition constraints.",
      rubric: LAB_RUBRICS["lab-mcda-trade-study"]!,
    },
    {
      id: "cap-m4-safety-security",
      order: 4,
      title: "4. STPA Hazard Analysis & STRIDE Threat Model",
      traceStage: "Architecture → Risk & Control",
      skillIds: ["en-safety-stpa", "en-assurance-gsn"],
      evidenceType: "artifact" as const,
      deliverables: [
        "Control structure diagram + >=4 Unsafe Control Actions across all 4 STPA guidewords",
        "STRIDE threat model covering call intake, unit telemetry, and dispatch APIs",
        "Derived safety and security constraints mapped back to Milestone 2 requirements",
      ],
      traceabilityLink: "Constrains Milestone 3 interfaces; verified in Milestone 5",
      prompt:
        "Identify how timing delays, stale GPS telemetry, or spoofed dispatch commands can lead to system-level losses—even when individual servers stay healthy.",
      rubric: STANDARD_LAB_CRITERIA_RUBRIC("cap-m4-rubric", 0.75),
    },
    {
      id: "cap-m5-markov-vv",
      order: 5,
      title: "5. Markov Availability Model & Verification/Validation Plan",
      traceStage: "Controls → V&V Evidence",
      skillIds: ["en-dependability-markov", "en-testing"],
      evidenceType: "artifact" as const,
      deliverables: [
        "Continuous-time Markov availability model including common-cause failure factor γ",
        "Requirement-to-V&V traceability matrix (unit, contract, chaos, failover drills)",
        "Acceptance test exit criteria for operational readiness gate",
      ],
      traceabilityLink: "Proves Milestone 2 SLOs and Milestone 4 hazard controls",
      prompt:
        "Quantify steady-state availability and annual downtime minutes under nominal and shared-power common-cause failure. Define the V&V plan proving each safety and reliability requirement.",
      rubric: STANDARD_LAB_CRITERIA_RUBRIC("cap-m5-rubric", 0.75),
    },
    {
      id: "cap-m6-lifecycle-defense",
      order: 6,
      title: "6. Lifecycle Support, GSN Defense Memo & Invalidation Criteria",
      traceStage: "V&V → Final Defense",
      skillIds: ["en-shipping", "en-assurance-gsn"],
      evidenceType: "artifact" as const,
      deliverables: [
        "GSN assurance argument linking Milestone 1–5 evidence to top-level dependability claim",
        "Transition, rollback, obsolescence/DMSMS, and on-call support plan",
        "Final engineering defense memo: top 3 trade-offs, residual risks, and exact assumptions that would invalidate the design",
      ],
      traceabilityLink: "Integrates the complete portfolio into a reviewable engineering dossier",
      prompt:
        "Defend your complete system design to a review board. Explicitly state what assumptions, if violated in the field, would invalidate your architecture and trigger re-design.",
      rubric: LAB_RUBRICS["lab-gsn-assurance"]!,
    },
  ] satisfies CapstoneMilestone[],
};

function STANDARD_LAB_CRITERIA_RUBRIC(id: string, passThreshold: number): RubricDefinition {
  return {
    id,
    version: RUBRIC_VERSION,
    passThreshold,
    criteria: STANDARD_LAB_CRITERIA,
  };
}
