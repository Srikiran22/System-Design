import type { EvidenceType } from "./types";

export const RUBRIC_VERSION = "2.0.0";

export interface RubricCriterion {
  id: string;
  label: string;
  weight: number;
  rationale: string;
  evidenceRequired: string;
  typicalFailureModes: string[];
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
  labTitle?: string;
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
    rationale: "Engineering models are only valid inside their stated operating envelope.",
    evidenceRequired: "Explicit system boundary, load/scope assumptions, and constraints.",
    typicalFailureModes: ["Hidden assumptions", "Unbounded operational scope"],
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
    rationale: "Conclusions must follow from verifiable calculations, traces, or formal steps.",
    evidenceRequired: "Step-by-step arithmetic, state transitions, or diagrams.",
    typicalFailureModes: ["Hand-waved numbers", "Skipped intermediate derivations"],
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
    rationale: "Stress-testing reveals fragility and exposes the real cost of every mitigation.",
    evidenceRequired: "Explicit failure analysis under the twist plus mitigation cost.",
    typicalFailureModes: ["Ignoring the twist", "Naming a fix without stating its cost"],
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
    rationale: "Another engineer should be able to inspect and challenge the deliverable.",
    evidenceRequired: "Inspectable link, structured diagram/spec, or reproducible file.",
    typicalFailureModes: ["Brief summary only with no inspectable work"],
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

/**
 * Ten dedicated domain-specific rubrics mapped 1:1 to every lab in `content.ts`,
 * plus a standard fallback definition. Weights in every rubric sum to 1.0.
 */
export const LAB_RUBRICS: Record<string, RubricDefinition> = {
  default: {
    id: "rubric-lab-standard-v2",
    version: RUBRIC_VERSION,
    passThreshold: 0.65,
    criteria: STANDARD_LAB_CRITERIA,
  },
  "lab-loop-map": {
    id: "rubric-loop-map-v2",
    version: RUBRIC_VERSION,
    labTitle: "Map a feedback loop",
    passThreshold: 0.65,
    criteria: [
      {
        id: "stock_flows",
        label: "Stock & Flow Identification",
        weight: 0.25,
        rationale: "Confusing accumulations with rates invalidates causal-loop reasoning.",
        evidenceRequired: "One clearly named stock plus distinct inflow and outflow variables.",
        typicalFailureModes: ["Naming an event or rate as a stock", "Missing outflows"],
        descriptors: {
          1: "No clear stock identified; variables mix events, feelings, and rates.",
          2: "Stock named, but inflows and outflows are incomplete or poorly distinguished.",
          3: "Clear measurable stock with explicit inflows, outflows, and variable polarity.",
          4: "Stock and flow units are explicit, with clear boundary on what stays exogenous.",
        },
        revisionHint:
          "Pick one concrete accumulation (e.g., backlog, queue depth, defect count) and separate its inflow and outflow rates.",
      },
      {
        id: "loop_polarity_delays",
        label: "Closed Loop Polarity (R/B) & Delays",
        weight: 0.35,
        rationale: "Unmarked delays hide why balancing loops overshoot or oscillate.",
        evidenceRequired:
          "At least one closed loop with link +/- signs, R/B label, and marked delays.",
        typicalFailureModes: [
          "Open arrow chain that never closes",
          "Missing delay hash marks",
          "Wrong R/B count",
        ],
        descriptors: {
          1: "Arrows do not close into a loop or polarities are omitted.",
          2: "Closed loop drawn, but R/B polarity or delay markers are inaccurate or missing.",
          3: "Closed loop accurately labelled R or B via odd/even negative links, with explicit delay locations.",
          4: "Multiple interacting R and B loops accurately mapped with delay timescales and dominance shift explained.",
        },
        revisionHint:
          "Verify every arrow closes back to the stock, count negative links to confirm R vs. B, and mark where feedback lags.",
      },
      {
        id: "link_removal_twist",
        label: "Link-Removal Twist & Policy Prediction",
        weight: 0.25,
        rationale: "Cutting a link tests whether the diagram actually explains system behavior.",
        evidenceRequired: "Predicted dynamic shift when one causal link is cut.",
        typicalFailureModes: [
          "Asserting the problem simply disappears",
          "Ignoring secondary loops",
        ],
        descriptors: {
          1: "Link-removal twist is omitted.",
          2: "States a generic outcome without tracing how the stock trajectory changes.",
          3: "Traces which loop breaks when the chosen link is removed and predicts the new stock behavior.",
          4: "Predicts both intended shift and potential policy resistance or compensating feedback.",
        },
        revisionHint:
          "Name the exact arrow you cut and trace step-by-step how the stock rises, drains, or stops oscillating.",
      },
      {
        id: "artifact",
        label: "Diagram Legibility & Summary",
        weight: 0.15,
        rationale: "A causal loop diagram is a shared thinking tool for reviewers.",
        evidenceRequired: "Link/photo of the diagram plus a concise two-sentence synthesis.",
        typicalFailureModes: ["Prose only without a diagram"],
        descriptors: {
          1: "No diagram link or structured representation provided.",
          2: "Diagram exists but labels are ambiguous or synthesis is missing.",
          3: "Legible diagram paired with a sharp two-sentence explanation of the dominant loop.",
          4: "Clean, review-ready diagram plus crisp explanation naming the highest-leverage intervention.",
        },
        revisionHint:
          "Attach a legible diagram link (or structured ASCII/Mermaid loop) and summarize the dominant loop in two sentences.",
      },
    ],
  },
  "lab-estimate": {
    id: "rubric-estimate-v2",
    version: RUBRIC_VERSION,
    labTitle: "Estimate a URL shortener",
    passThreshold: 0.7,
    criteria: [
      {
        id: "assumptions",
        label: "Explicit Workload Assumptions",
        weight: 0.2,
        rationale:
          "Every sizing number is meaningless unless its input assumptions are inspectable.",
        evidenceRequired:
          "Stated DAU/MAU, write-to-read ratio, record byte size, and peak multiplier.",
        typicalFailureModes: ["Pulled QPS out of thin air", "Forgetting read:write skew"],
        descriptors: {
          1: "Key workload inputs (users, writes/day, read ratio, payload size) are missing.",
          2: "Some assumptions listed, but peak factor or byte-per-record assumptions are hidden.",
          3: "All workload inputs, read/write ratios, record size, and peak factor are stated upfront.",
          4: "Assumptions are bounded with sensitivity ranges and grounded in realistic traffic skew.",
        },
        revisionHint:
          "State users, links created per period, read:write ratio, peak multiplier, and bytes per row before computing.",
      },
      {
        id: "arithmetic",
        label: "QPS, Bandwidth & 5-Year Storage Arithmetic",
        weight: 0.4,
        rationale:
          "Order-of-magnitude errors in units or retention silently invalidate architecture choices.",
        evidenceRequired:
          "Unit-checked average/peak QPS, ingress/egress Mbps, 5-year TB, and single-DB verdict.",
        typicalFailureModes: [
          "Confusing bits vs bytes",
          "Ignoring index/replication overhead",
          "Using 365 days as 1 year only",
        ],
        descriptors: {
          1: "Calculations missing or off by multiple orders of magnitude.",
          2: "Average QPS computed, but peak QPS, bandwidth, or 5-year storage contains unit errors.",
          3: "Unit-checked arithmetic for avg/peak QPS, bandwidth, and 5-year storage with an explicit single-DB verdict.",
          4: "Includes index and replication amplification factors plus explicit RAM working-set estimate.",
        },
        revisionHint:
          "Show unit conversions explicitly (e.g., 86,400 s/day, bytes vs bits, 5 years = 1,825 days) and justify the single-DB call.",
      },
      {
        id: "surge_bottleneck",
        label: "10× Overnight Surge — First Bottleneck",
        weight: 0.25,
        rationale: "Knowing what saturates first prevents over-engineering the wrong layer.",
        evidenceRequired:
          "Specific bottleneck resource (CPU, IOPS, connections, egress) under 10× load and mitigation.",
        typicalFailureModes: ["Saying 'the database breaks' without naming the saturated resource"],
        descriptors: {
          1: "10× surge twist ignored.",
          2: "Names a vague bottleneck ('DB slows down') without tying back to the sizing numbers.",
          3: "Identifies the exact first-to-saturate resource from the math and proposes a targeted mitigation.",
          4: "Ranks first and second bottlenecks under 10× load and quantifies cache hit-rate or sharding relief.",
        },
        revisionHint:
          "Multiply your peak QPS and bandwidth by 10× and pinpoint which concrete limit (connections, IOPS, hot keys, egress) breaks first.",
      },
      {
        id: "artifact",
        label: "Verifiable Sizing Sheet",
        weight: 0.15,
        rationale: "Sizing math should be easy for a reviewer to re-check in two minutes.",
        evidenceRequired: "Structured calculation table or link.",
        typicalFailureModes: ["Unformatted prose hiding formulas"],
        descriptors: {
          1: "No inspectable numbers or calculation sheet.",
          2: "Numbers provided but formulas cannot be audited.",
          3: "Clean, auditable calculation note or spreadsheet showing inputs → outputs.",
          4: "Reproducible sizing table with formula transparency and explicit capacity headroom.",
        },
        revisionHint:
          "Format assumptions, formulas, and final numbers in a clean table or linked sheet.",
      },
    ],
  },
  "lab-cache": {
    id: "rubric-cache-v2",
    version: RUBRIC_VERSION,
    labTitle: "Add a cache, then break it",
    passThreshold: 0.7,
    criteria: [
      {
        id: "implementation_latency",
        label: "Cache-Aside Implementation & Latency Delta",
        weight: 0.25,
        rationale:
          "Caching adds complexity; you must verify it actually improves latency under real lookups.",
        evidenceRequired:
          "Working cache-aside + TTL implementation with before/after latency measurements.",
        typicalFailureModes: ["No baseline latency measurement", "Cache never bypassed on miss"],
        descriptors: {
          1: "No cache implementation or latency measurements.",
          2: "Cache-aside sketched, but TTL or measured before/after latency is missing.",
          3: "Working cache-aside with TTL and measured hit vs. miss/baseline latency comparison.",
          4: "Measures p50/p95/p99 latency plus hit ratio across warm and cold states.",
        },
        revisionHint:
          "Record concrete before/after latency numbers for both cache hit and cache miss paths.",
      },
      {
        id: "stale_race",
        label: "Stale-Data Race Reproduction & Fix Cost",
        weight: 0.35,
        rationale:
          "Stale reads emerge from specific read/write interleavings, not abstract theory.",
        evidenceRequired:
          "Step-by-step interleaving that produces stale data, concrete fix, and stated trade-off cost.",
        typicalFailureModes: [
          "Only citing TTL expiry without showing a write/read race",
          "Omitting fix cost",
        ],
        descriptors: {
          1: "No stale-read failure scenario reproduced.",
          2: "Mentions stale data generically without an interleaving trace or fix.",
          3: "Reproduces a concrete write/read interleaving causing stale data, implements a fix, and names its cost.",
          4: "Demonstrates race reproduction + fix (e.g., versioned keys, write-through, delete-after-commit) with quantified latency/complexity cost.",
        },
        revisionHint:
          "Trace the exact concurrent read/write sequence that leaves stale cache data, fix it, and explain the latency or write-path cost.",
      },
      {
        id: "cold_restart_twist",
        label: "Cache Restart Under Load (Stampede Defense)",
        weight: 0.25,
        rationale: "A cold cache restart can multiply origin DB load by 10–100× in seconds.",
        evidenceRequired:
          "Quantified origin DB impact during restart plus stampede mitigation (singleflight, jitter, stale-while-revalidate).",
        typicalFailureModes: ["Ignoring thundering herd", "Relying solely on shorter TTL"],
        descriptors: {
          1: "Cache restart twist is skipped.",
          2: "Notes increased DB load without designing a stampede protection mechanism.",
          3: "Explains the thundering-herd spike on the DB and specifies concrete protection (request coalescing, TTL jitter, or warm-up).",
          4: "Quantifies DB QPS spike during restart and combines coalescing, jitter, and load-shedding/circuit breaking.",
        },
        revisionHint:
          "Calculate what the database sees when cache hit rate drops from 95% to 0% and add request coalescing or TTL jitter.",
      },
      {
        id: "artifact",
        label: "Inspectable Repo/Gist & Staleness Contract",
        weight: 0.15,
        rationale: "Acceptable staleness is an explicit product/engineering contract.",
        evidenceRequired: "Repo/gist link plus explicit paragraph bounding acceptable staleness.",
        typicalFailureModes: ["Missing link or unstated staleness window"],
        descriptors: {
          1: "No code artifact or staleness statement.",
          2: "Code linked, but acceptable staleness bounds are unclear.",
          3: "Inspectable repo/gist with a clear paragraph stating acceptable staleness and invalidation policy.",
          4: "Reproducible repo with automated stale-race test and explicit staleness SLA.",
        },
        revisionHint:
          "Link your repo or gist and explicitly state what staleness window your workload tolerates.",
      },
    ],
  },
  "lab-reading": {
    id: "rubric-reading-v2",
    version: RUBRIC_VERSION,
    labTitle: "Read a repo you did not write",
    passThreshold: 0.65,
    criteria: [
      {
        id: "repo_execution",
        label: "Local Run & Entrypoint Grounding",
        weight: 0.2,
        rationale:
          "Reading static files without running the code misses config and runtime wiring.",
        evidenceRequired: "Named target repo, runtime verification, and entry point file paths.",
        typicalFailureModes: ["Summarizing README without tracing real source files"],
        descriptors: {
          1: "No target repo identified or verified locally.",
          2: "Repo cloned, but entry points and runtime setup are vague.",
          3: "Repo executed locally with exact entry point, build/run commands, and module boundaries documented.",
          4: "Includes environment/dependency constraints and trust boundaries verified against live execution.",
        },
        revisionHint: "Cite exact file paths and commands from running the repository locally.",
      },
      {
        id: "end_to_end_trace",
        label: "End-to-End Request-to-Storage Trace",
        weight: 0.4,
        rationale:
          "Tracing one concrete action exposes real architecture faster than reading top-down.",
        evidenceRequired:
          "Step-by-step call chain from user action through validation, domain logic, persistence, and response.",
        typicalFailureModes: ["Stopping at the controller", "Skipping storage/serialization layer"],
        descriptors: {
          1: "No concrete user action traced.",
          2: "Partial trace that skips either middleware, state mutation, or persistence return path.",
          3: "Complete trace of one user action from UI/API entry to persistence and back with symbol/file citations.",
          4: "Trace highlights error paths, hidden coupling, and invariants enforced (or missed) across boundaries.",
        },
        revisionHint:
          "Follow one user action all the way through routing, validation, persistence, and response rendering with file names.",
      },
      {
        id: "pr_twist",
        label: "Contribution Twist (Doc/Typo PR or Concrete Defect)",
        weight: 0.2,
        rationale:
          "Making a small verified change proves your mental model matches the repo's conventions.",
        evidenceRequired: "PR link or concrete verified patch/defect write-up.",
        typicalFailureModes: ["Skipping the twist entirely"],
        descriptors: {
          1: "No contribution or concrete doc/code defect identified.",
          2: "Notes a generic improvement without producing a concrete patch or issue.",
          3: "Opens a focused PR (or prepares a verified diff) fixing a real doc bug or typo.",
          4: "PR/patch includes verification steps and clarifies a genuine onboarding trap for future readers.",
        },
        revisionHint:
          "Submit (or attach a clean diff for) a focused doc or code fix that verifies your local workflow.",
      },
      {
        id: "architecture_doc",
        label: "One-Page ARCHITECTURE.md Clarity",
        weight: 0.2,
        rationale:
          "A great architecture map fits on one page and highlights where invariants live.",
        evidenceRequired: "Concise one-page ARCHITECTURE.md link or structured document.",
        typicalFailureModes: ["File-by-file directory listing instead of architectural map"],
        descriptors: {
          1: "No ARCHITECTURE.md artifact produced.",
          2: "Lists folders without explaining component responsibilities or data flow.",
          3: "Clear one-page ARCHITECTURE.md covering components, data flow, and key invariants.",
          4: "Crisp one-page map with diagram, architectural seams, and explicit extension/risk notes.",
        },
        revisionHint:
          "Organize your ARCHITECTURE.md around components, data flow, and invariants—not just a folder tree.",
      },
    ],
  },
  "lab-ship": {
    id: "rubric-ship-v2",
    version: RUBRIC_VERSION,
    labTitle: "Ship something in 48 hours",
    passThreshold: 0.7,
    criteria: [
      {
        id: "thin_slice",
        label: "One-Sentence Scope & End-to-End Slice",
        weight: 0.25,
        rationale: "Scoping to a sharp, end-to-end thin slice beats half-finished ambition.",
        evidenceRequired: "One-sentence problem statement + live working vertical slice.",
        typicalFailureModes: [
          "Unfinished backend/UI mismatch",
          "Scope creep preventing deployment",
        ],
        descriptors: {
          1: "Scope is vague or slice does not work end to end.",
          2: "Works locally only or omits core user flow.",
          3: "Clear one-sentence scope delivered as a working, deployed vertical slice.",
          4: "Tight vertical slice with explicit non-goals, error handling, and clean README.",
        },
        revisionHint:
          "Cut non-essential features until one user workflow works end-to-end on a live URL.",
      },
      {
        id: "behavior_tests",
        label: "Behaviour Tests & Verification",
        weight: 0.3,
        rationale: "Even a 48-hour ship needs automated feedback guarding its core promise.",
        evidenceRequired: "At least two automated behaviour tests covering user-visible outcomes.",
        typicalFailureModes: ["Zero tests", "Testing implementation mocks instead of behavior"],
        descriptors: {
          1: "No automated tests included.",
          2: "Only trivial/unit smoke checks that do not guard user behavior.",
          3: "At least two passing behaviour tests verifying core user-visible outcomes and edge cases.",
          4: "Passing behaviour + regression tests wired into a repeatable test script documented in README.",
        },
        revisionHint:
          "Add at least two automated tests asserting real user-visible behavior (including one failure/edge path).",
      },
      {
        id: "user_bug_twist",
        label: "Real User Feedback & 24-Hour Defect Fix",
        weight: 0.25,
        rationale: "Contact with a real user reveals assumptions tests alone cannot catch.",
        evidenceRequired: "Real user test record + defect fixed and verified within 24 hours.",
        typicalFailureModes: [
          "Self-testing only without sharing live URL",
          "Leaving reported bug unfixed",
        ],
        descriptors: {
          1: "Never shared with another person or no bug/feedback recorded.",
          2: "Shared with a user, but reported issue was not fixed or verified.",
          3: "Shared live URL, logged a real user-found defect, shipped the fix within 24h, and documented cause.",
          4: "Shipped the 24h fix plus a regression test preventing that bug class from returning.",
        },
        revisionHint:
          "Send the live URL to one real user, record what tripped them up, ship the fix, and add a regression test.",
      },
      {
        id: "artifact",
        label: "Live URL, Repo & Operational README",
        weight: 0.2,
        rationale: "Shipping means anyone can visit, run, and inspect the work.",
        evidenceRequired: "Live URL + repository link + run/test README.",
        typicalFailureModes: ["Dead link", "Missing setup/test instructions"],
        descriptors: {
          1: "Neither live URL nor repo link provided.",
          2: "Only repo or only URL provided, or README lacks run instructions.",
          3: "Working live URL, inspectable repo, and clear README covering run & test commands.",
          4: "Live URL, repo, reproducible build/test README, and concise post-ship lessons learned.",
        },
        revisionHint:
          "Include both the live URL and repository link, and verify your README run/test instructions.",
      },
    ],
  },
  "lab-raft-consensus": {
    id: "rubric-raft-v2",
    version: RUBRIC_VERSION,
    labTitle: "Raft consensus election & split-brain simulation",
    passThreshold: 0.7,
    criteria: [
      {
        id: "cluster_election",
        label: "5-Node Quorum Setup & Election Trace",
        weight: 0.25,
        rationale:
          "Randomized election timeouts and majority votes establish single-leader safety.",
        evidenceRequired:
          "5-node initialization with randomized timeouts, leader election, and 3 quorum-replicated entries.",
        typicalFailureModes: [
          "Identical election timeouts causing livelock",
          "Committing without 3/5 quorum",
        ],
        descriptors: {
          1: "Cluster setup or leader election trace is missing.",
          2: "5 nodes described, but term numbers, randomized timeouts, or quorum commit indices are incomplete.",
          3: "Clear trace of 5-node election with randomized timeouts and 3 entries replicated/committed across >=3 nodes.",
          4: "Demonstrates term monotonicity, RequestVote log-up-to-date check, and commitIndex advancement rules.",
        },
        revisionHint:
          "Show node IDs, randomized timeout values, election term, and commitIndex across all 5 nodes for the first 3 entries.",
      },
      {
        id: "partition_safety",
        label: "2-vs-3 Partition & Minority Rejection",
        weight: 0.35,
        rationale:
          "Only the majority partition (3/5) can safely commit; minority writes must stay uncommitted.",
        evidenceRequired:
          "Trace of writes attempted on {N1,N2} vs {N3,N4,N5} showing terms, log indices, and commit status.",
        typicalFailureModes: [
          "Allowing minority leader to commit",
          "Confusing AppendEntries receipt with commit",
        ],
        descriptors: {
          1: "Partition scenario missing or both sides commit writes (split-brain).",
          2: "Partition simulated, but minority rejection or majority new-term commits are not traced clearly.",
          3: "Explicitly shows writes on {N1,N2} failing to commit while {N3,N4,N5} elects a higher-term leader and commits.",
          4: "Proves Log Matching and Election Safety invariants across both partitions with complete per-node logs.",
        },
        revisionHint:
          "Record per-node (index, term, committed?) tables on both sides of the {N1,N2} | {N3,N4,N5} split.",
      },
      {
        id: "heal_stepdown_twist",
        label: "Partition Heal, Term 3 Step-Down & Truncation",
        weight: 0.25,
        rationale:
          "Stale leaders must step down immediately upon discovering a higher term and discard uncommitted conflicting entries.",
        evidenceRequired:
          "Step-by-step proof of stale leader stepping down at Term 3 and truncating uncommitted entries.",
        typicalFailureModes: ["Merging conflicting logs instead of overwriting minority entries"],
        descriptors: {
          1: "Old-leader re-join twist is omitted.",
          2: "States old leader steps down without showing RPC term comparison or log truncation.",
          3: "Demonstrates Term 3 AppendEntries forcing the stale leader to Follower and truncating uncommitted minority entries.",
          4: "Traces prevLogIndex/prevLogTerm conflict rollback, convergence of all 5 logs, and client retry semantics.",
        },
        revisionHint:
          "Trace the exact AppendEntries RPC (Term 3) received by the old leader and show how uncommitted entries are truncated.",
      },
      {
        id: "artifact",
        label: "Reproducible Simulation / Trace Artifact",
        weight: 0.15,
        rationale:
          "Consensus proofs should be inspectable as code, notebook, or structured state-transition log.",
        evidenceRequired: "Test script, notebook, or structured state-machine trace.",
        typicalFailureModes: ["Prose explanation only with no verifiable state log"],
        descriptors: {
          1: "No simulation script, notebook, or structured state trace provided.",
          2: "Trace provided but omits terms or node states needed to verify invariants.",
          3: "Inspectable script/notebook or state table clearly showing cluster state, terms, and split-brain rejection.",
          4: "Deterministic test suite asserting no conflicting commits across randomized partition/heal schedules.",
        },
        revisionHint:
          "Include an inspectable script, notebook, or complete state-transition table covering all 5 nodes.",
      },
    ],
  },
  "lab-gsn-assurance": {
    id: "rubric-gsn-v2",
    version: RUBRIC_VERSION,
    labTitle: "Construct a GSN assurance case",
    passThreshold: 0.75,
    criteria: [
      {
        id: "goal_context",
        label: "Top Goal (G1), Context (C) & Assumptions (A)",
        weight: 0.25,
        rationale: "Unbounded safety claims cannot be discharged by finite engineering evidence.",
        evidenceRequired:
          "Falsifiable G1 paired with operational context (C1+) and explicit assumptions (A1+).",
        typicalFailureModes: [
          "Vague 'system is safe' claim",
          "Omitting operational design domain (ODD)",
        ],
        descriptors: {
          1: "Top-level safety claim is vague or unmeasurable.",
          2: "Claim stated, but operational context or assumptions are missing.",
          3: "Clear falsifiable G1 claim bounded by explicit operational context (C1) and assumptions (A1).",
          4: "Precise safety claim with bounded ODD, explicit assumptions, justifications, and scope exclusions.",
        },
        revisionHint:
          "Tighten G1 so it is falsifiable and pair it with explicit Context (C) and Assumption (A) nodes.",
      },
      {
        id: "strategy_evidence",
        label: "Strategy (S1) Decomposition & Solution (Sn) Evidence",
        weight: 0.35,
        rationale:
          "GSN makes logical reasoning explicit so reviewers can spot leaps between claim and evidence.",
        evidenceRequired:
          "Explicit Strategy node decomposing into detection, actuation, and V&V sub-goals backed by concrete Solution artifacts.",
        typicalFailureModes: [
          "Jumping straight from G1 to 'unit tests pass'",
          "Evidence that doesn't match the sub-goal",
        ],
        descriptors: {
          1: "Claims jump directly to generic testing with no decomposition strategy.",
          2: "Has sub-goals, but evidence nodes do not clearly discharge the claims.",
          3: "Explicit Strategy (S1) decomposes into detection, fail-safe actuation, and V&V sub-goals backed by concrete Solution (Sn) artifacts.",
          4: "Traceable argument tree with independent evidence types (test, formal proof, FMECA) and zero logical leaps.",
        },
        revisionHint:
          "Link every leaf sub-goal to a concrete, verifiable Solution node (test report, analysis, or formal proof).",
      },
      {
        id: "defeater_twist",
        label: "Uncertified Library Update (Defeater & Decay)",
        weight: 0.25,
        rationale:
          "Living assurance cases must invalidate specific nodes when underlying artifacts change.",
        evidenceRequired:
          "Explicit impacted Solution/Sub-Goal nodes, defeater modelling, and re-verification gate.",
        typicalFailureModes: [
          "Treating the update as minor",
          "Failing to trace upward impact to G1",
        ],
        descriptors: {
          1: "Uncertified third-party library update is ignored.",
          2: "Notes risk generically without marking affected GSN nodes.",
          3: "Identifies impacted sub-goals/solutions, marks evidence stale/defeated, and states the re-verification gate.",
          4: "Models explicit Counter-Evidence/Defeater node, containment boundary, and re-certification release block.",
        },
        revisionHint:
          "Name the exact Solution and Sub-Goal nodes defeated by the uncertified sensor driver library update and state what restores them.",
      },
      {
        id: "artifact",
        label: "GSN Diagram & One-Page Defense Memo",
        weight: 0.15,
        rationale:
          "Review boards evaluate both structural notation and the rationale defending key boundaries.",
        evidenceRequired: "GSN diagram (Mermaid/SVG/image) plus concise defense memo.",
        typicalFailureModes: ["Missing diagram notation", "Defense memo omits residual risk"],
        descriptors: {
          1: "No GSN diagram or defense memo provided.",
          2: "Diagram or memo missing, or node IDs are inconsistent between them.",
          3: "Clean GSN diagram paired with a one-page defense memo using matching G/S/C/A/Sn IDs.",
          4: "Publication-grade GSN diagram + defense memo explicitly highlighting strongest and weakest evidence links.",
        },
        revisionHint:
          "Include a GSN diagram (e.g., Mermaid) with consistent G/S/C/A/Sn IDs referenced in your defense memo.",
      },
    ],
  },
  "lab-mcda-trade-study": {
    id: "rubric-mcda-v2",
    version: RUBRIC_VERSION,
    labTitle: "MCDA trade study with sensitivity analysis",
    passThreshold: 0.7,
    criteria: [
      {
        id: "alternatives_criteria",
        label: "Decision Framing, Alternatives & 4 Criteria",
        weight: 0.2,
        rationale: "A biased alternative set or overlapping criteria corrupts any weighted matrix.",
        evidenceRequired:
          "Three realistic architecture alternatives evaluated on cost, latency, availability, and vendor lock-in.",
        typicalFailureModes: ["Strawman alternatives", "Double-counting the same criterion"],
        descriptors: {
          1: "Fewer than 3 viable alternatives or criteria are vague/overlapping.",
          2: "Alternatives and criteria listed, but measurement units/ranges are unstated.",
          3: "Three credible alternatives defined with 4 non-overlapping criteria and explicit worst-to-best ranges.",
          4: "Explicit decision boundary, must-pass constraints, and well-defined measurement scales per criterion.",
        },
        revisionHint:
          "Define 3 credible alternatives and specify the measurable worst-to-best range for each of the 4 criteria.",
      },
      {
        id: "swing_weights_scoring",
        label: "Swing Weights & Normalized Utility Scoring",
        weight: 0.35,
        rationale:
          "Swing weighting ties weight magnitude to actual outcome spread rather than abstract importance.",
        evidenceRequired:
          "Swing weights summing to 1.0, normalized 0–10 scores, and verified composite math.",
        typicalFailureModes: [
          "Arbitrary weights that ignore range width",
          "Weights not summing to 1.0",
        ],
        descriptors: {
          1: "Weights are arbitrary and scoring scales are inconsistent.",
          2: "Criteria weighted, but normalization or composite math has gaps.",
          3: "Explicit swing weights sum to 1.0 with documented 0–10 scales across 3 alternatives and verified totals.",
          4: "Swing weights justified by range impact, normalized scores verified, and dominated options pruned.",
        },
        revisionHint:
          "Ensure swing weights sum to 1.0, justify them by each criterion's swing range, and verify composite math.",
      },
      {
        id: "sensitivity_twist",
        label: "±20% Sensitivity Sweep & 40% Budget-Cut Twist",
        weight: 0.3,
        rationale:
          "Fragile winners that flip under minor weight shifts require deeper evidence before commitment.",
        evidenceRequired:
          "Recomputed rankings under ±20% top-weight sweep, tipping point, and 40% cost cap twist.",
        typicalFailureModes: [
          "Claiming robustness without re-computing totals",
          "Skipping the 40% budget cut",
        ],
        descriptors: {
          1: "Sensitivity sweep and budget-cut twist omitted.",
          2: "Discusses sensitivity qualitatively without re-computing composite scores.",
          3: "Tests ±20% weight sweep and 40% budget cut, explicitly identifying whether and where the winner flips.",
          4: "Computes exact tipping-point weight/cost threshold and documents decision-reversal triggers.",
        },
        revisionHint:
          "Re-calculate composite scores for both the ±20% weight shift and the 40% budget reduction, and state the exact flip point.",
      },
      {
        id: "artifact",
        label: "Auditable Matrix & Sensitivity Artifact",
        weight: 0.15,
        rationale: "Decision records must be reproducible when stakeholders challenge the weights.",
        evidenceRequired: "Spreadsheet, script, or structured matrix + sensitivity plot/table.",
        typicalFailureModes: ["Final winner stated without the scoring table"],
        descriptors: {
          1: "No inspectable scoring matrix or script.",
          2: "Matrix present but sensitivity calculation cannot be verified.",
          3: "Inspectable spreadsheet/script showing matrix, swing weights, and sensitivity output.",
          4: "Reproducible notebook/sheet paired with a concise ADR summarizing residual risk.",
        },
        revisionHint:
          "Attach or paste your full scoring table, swing weights, and sensitivity sweep values.",
      },
    ],
  },
  "lab-stpa-hazard": {
    id: "rubric-stpa-v2",
    version: RUBRIC_VERSION,
    labTitle: "STPA hazard analysis on a control loop",
    passThreshold: 0.75,
    criteria: [
      {
        id: "losses_control_structure",
        label: "Losses, Hazards & Hierarchical Control Structure",
        weight: 0.25,
        rationale:
          "STPA starts from system-level losses and control feedback loops, not part-level failure rates.",
        evidenceRequired:
          "Explicit Losses (L), Hazards (H), and control structure (Controller, Actuator, Controlled Process, Sensors).",
        typicalFailureModes: [
          "Confusing component failure with system hazard",
          "Omitting feedback arrows",
        ],
        descriptors: {
          1: "Losses, hazards, or control structure missing.",
          2: "Control structure drawn, but feedback channels or process model inputs are incomplete.",
          3: "Clear L → H mapping and complete control structure showing control actions and sensor feedback loops.",
          4: "Includes controller process-model beliefs, human/supervisory layers, and explicit system boundary.",
        },
        revisionHint:
          "Define system Losses (L) and Hazards (H) first, then draw both downward control actions and upward sensor feedback.",
      },
      {
        id: "uca_constraints",
        label: "All 4 UCA Categories & Safety Constraints",
        weight: 0.35,
        rationale:
          "All four STPA guidewords systematically uncover timing, omission, commission, and duration flaws.",
        evidenceRequired:
          ">=4 context-specific UCAs spanning all 4 guidewords, each paired with an enforceable safety constraint.",
        typicalFailureModes: [
          "Missing 'too early/late' or 'stopped too soon'",
          "Generic constraints like 'be safe'",
        ],
        descriptors: {
          1: "Fewer than 4 UCAs or missing STPA guideword categories.",
          2: "UCAs listed, but operational context is vague or derived constraints are non-enforceable.",
          3: "At least 4 context-specific UCAs across all 4 guidewords, each linked to a hazard and enforceable safety constraint.",
          4: "Traces causal scenarios (flawed process model, feedback delay, conflicting controllers) to verifiable requirements.",
        },
        revisionHint:
          "Ensure each UCA names [Controller] + [Guideword] + [Control Action] + [Context] + [Hazard Link] and pairs with a testable constraint.",
      },
      {
        id: "latency_twist",
        label: "250ms Bus Congestion Twist (Timing UCA)",
        weight: 0.25,
        rationale:
          "Component-reliable hardware still causes accidents when shared buses delay feedback.",
        evidenceRequired:
          "Exact UCA activated by 10ms → 250ms sensor delay plus architectural/watchdog mitigation.",
        typicalFailureModes: ["Proposing higher-MTBF sensors instead of fixing timing/isolation"],
        descriptors: {
          1: "Sensor latency twist omitted.",
          2: "Notes slower braking generically without naming the activated UCA or causal mechanism.",
          3: "Identifies the exact timing UCA (provided too late / not provided in time) and enforces bus isolation or freshness watchdog.",
          4: "Quantifies stopping-distance/control-margin breach at 250ms and specifies fail-safe degradation bounds.",
        },
        revisionHint:
          "Map the 250ms bus delay directly to your timing UCA, show how it corrupts the controller's process model, and specify a freshness/isolation control.",
      },
      {
        id: "artifact",
        label: "Control Diagram & UCA Traceability Table",
        weight: 0.15,
        rationale: "Safety reviews audit traceability from Loss → Hazard → UCA → Constraint.",
        evidenceRequired: "Control structure diagram plus structured UCA & constraint table.",
        typicalFailureModes: ["Unstructured bullet notes with broken IDs"],
        descriptors: {
          1: "No diagram or UCA table provided.",
          2: "Diagram or table incomplete; IDs do not cross-reference.",
          3: "Clear control structure diagram and UCA table with consistent L/H/UCA/SC cross-references.",
          4: "Review-ready STPA package linking every safety constraint to a verification method.",
        },
        revisionHint:
          "Use explicit L1/H1/UCA-1/SC-1 IDs across your control diagram and UCA table.",
      },
    ],
  },
  "lab-markov-availability": {
    id: "rubric-markov-v2",
    version: RUBRIC_VERSION,
    labTitle: "Markov availability model for an HA cluster",
    passThreshold: 0.75,
    criteria: [
      {
        id: "state_space_rates",
        label: "State Space (S0/S1/S2) & Rate Matrix Q",
        weight: 0.25,
        rationale:
          "Wrong transition multiplicities (e.g., 2λ vs λ) invalidate the entire availability result.",
        evidenceRequired:
          "States 0/1/2 defined, λ=1/MTBF, μ=1/MTTR, and valid generator matrix Q (rows sum to 0).",
        typicalFailureModes: [
          "Forgetting factor of 2 in S0→S1 for active/active or mismatching standby rate",
          "Rows of Q not summing to 0",
        ],
        descriptors: {
          1: "State space or transition rates missing.",
          2: "States named, but Q matrix has sign errors or rows do not sum to zero.",
          3: "Accurate 3-state diagram, consistent λ and μ units, and generator matrix Q with zero row sums.",
          4: "Explicitly states warm vs. hot standby failure assumption and single vs. parallel repair crew assumption.",
        },
        revisionHint:
          "Verify consistent time units (hours⁻¹), check whether S0→S1 is 2λ (hot) or λ+λ_s (warm), and verify every row of Q sums to 0.",
      },
      {
        id: "steady_state_math",
        label: "Steady-State Solution (P0, P1, P2) & Downtime",
        weight: 0.35,
        rationale:
          "Steady-state balance equations translate hardware MTBF/MTTR into business downtime minutes/year.",
        evidenceRequired:
          "Solved πQ = 0 with ΣPi = 1, steady-state availability A_ss = P0 + P1, and annual downtime minutes.",
        typicalFailureModes: [
          "Forgetting normalization P0+P1+P2=1",
          "Multiplying by 365×24 instead of 525,600 min/yr",
        ],
        descriptors: {
          1: "Steady-state equations unsolved or wildly incorrect.",
          2: "Formulas written, but arithmetic or annual downtime conversion has errors.",
          3: "Correctly solves P0, P1, P2, computes A_ss = P0 + P1, and converts P2 to annual downtime minutes.",
          4: "Cross-checks closed-form balance solution against numerical solver and tests MTTR sensitivity.",
        },
        revisionHint:
          "Solve πQ = 0 with P0 + P1 + P2 = 1 explicitly, then compute annual downtime = P2 × 525,600 minutes.",
      },
      {
        id: "ccf_twist",
        label: "Common-Cause Failure (γ) Twist",
        weight: 0.25,
        rationale:
          "Common-cause failure (power, bad deploy, shared switch) typically dominates HA downtime over independent failures.",
        evidenceRequired:
          "Direct S0→S2 transition with rate γ added to Q, recomputed A_ss and downtime delta.",
        typicalFailureModes: [
          "Treating γ as independent",
          "Not recomputing P2 with S0→S2 transition",
        ],
        descriptors: {
          1: "Common-cause failure twist skipped.",
          2: "Mentions rack power failure qualitatively without modifying Q or recomputing availability.",
          3: "Adds S0→S2 transition rate γ to Q, re-solves P2, and quantifies the jump in annual downtime minutes.",
          4: "Compares nominal vs. CCF downtime ratio and shows why reducing γ (diverse power/zones) beats adding a 3rd identical node.",
        },
        revisionHint:
          "Add direct S0→S2 transition rate γ into Q, re-solve for P2, and compare nominal vs. CCF annual downtime minutes.",
      },
      {
        id: "artifact",
        label: "Reproducible Script or Derivation",
        weight: 0.15,
        rationale:
          "Quantitative reliability models must be auditable and re-runnable under new parameters.",
        evidenceRequired: "Python/Jupyter script or complete step-by-step derivation.",
        typicalFailureModes: ["Final '99.99%' number without equations or code"],
        descriptors: {
          1: "No script or derivation provided.",
          2: "Partial derivation that cannot be reproduced.",
          3: "Complete mathematical derivation or runnable script reproducing both nominal and CCF results.",
          4: "Parameterized script/notebook with automated sanity checks (ΣPi = 1, Q row sums = 0).",
        },
        revisionHint:
          "Attach your runnable script or complete equation derivation with explicit parameter values.",
      },
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
      "Self-assessment meets rubric proficiency (provisional). Submit for independent peer or mentor review to earn reviewer-verified status.",
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
  designReviewGate: string;
  upstreamMilestoneIds: string[];
  skillIds: string[];
  evidenceType: Extract<EvidenceType, "artifact">;
  deliverables: string[];
  traceabilityLink: string;
  prompt: string;
  rubric: RubricDefinition;
}

export interface CapstoneChangeImpact {
  id: string;
  title: string;
  triggerAfterMilestoneId: string;
  scenario: string;
  affectedMilestones: string[];
  prompt: string;
  checklist: string[];
}

/**
 * Cumulative Systems Engineering Capstone:
 * "Design a Dependable Regional Emergency Dispatch & Triage Service"
 * Implements a connected 6-milestone traceability chain with simulated educational
 * design review gates and a midway change-impact exercise.
 */
export const CAPSTONE_PROJECT = {
  id: "capstone-dependable-dispatch",
  version: "2.0.0",
  title: "Dependable Regional Emergency Dispatch & Triage Service",
  summary:
    "Design a mission-critical regional dispatch service end to end. Every milestone links directly to prior artifacts—connecting stakeholder needs, verifiable requirements, trade studies, safety/security controls, availability models, change-impact analysis, and final defense.",
  disclaimer:
    "Simulated educational portfolio capstone for developing engineering judgment. Self-scored rubric results are provisional until independently reviewed by a peer or mentor; not an accredited certification or regulatory sign-off.",
  changeImpactChallenge: {
    id: "cap-change-surge-cut",
    title: "Midway Change-Impact Exercise: 4× Call Surge + Zone 3 Fiber Cut",
    triggerAfterMilestoneId: "cap-m3-architecture-mcda",
    scenario:
      "Midway through detailed design, a severe regional storm raises peak emergency call volume from 2,500 calls/hr to 10,000 calls/hr (4×) AND severs the primary fiber link isolating Zone 3 for 60 minutes.",
    affectedMilestones: [
      "cap-m2-requirements",
      "cap-m3-architecture-mcda",
      "cap-m4-safety-security",
      "cap-m5-markov-vv",
      "cap-m6-lifecycle-defense",
    ],
    prompt:
      "Trace the exact downstream impact across your already-drafted milestones: which Milestone 2 SLOs break, does your Milestone 3 replication choice survive, which new Milestone 4 UCA activates, what Milestone 5 test must be added, and which Milestone 6 GSN assumption is defeated?",
    checklist: [
      "Milestone 2: Re-check intake queue sizing and p99 dispatch latency at 10,000 calls/hr",
      "Milestone 3: Verify fenced local reserve fleet behavior during 60-minute Zone 3 isolation",
      "Milestone 4: Identify newly triggered timing/overload Unsafe Control Actions",
      "Milestone 5: Update Markov CCF / surge failover test exit criteria",
      "Milestone 6: Mark impacted GSN assumptions and define the re-verification gate",
    ],
  } satisfies CapstoneChangeImpact,
  milestones: [
    {
      id: "cap-m1-boundary",
      order: 1,
      title: "1. Problem Framing, Mission Measures & System Boundary",
      traceStage: "Stakeholder Need → Boundary",
      designReviewGate: "Simulated MCR (Mission Concept Review)",
      upstreamMilestoneIds: [],
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
      rubric: STANDARD_LAB_CRITERIA_RUBRIC("cap-m1-rubric-v2", 0.7),
    },
    {
      id: "cap-m2-requirements",
      order: 2,
      title: "2. Verifiable Requirements, Quality Attributes & SLOs",
      traceStage: "Boundary → Requirements",
      designReviewGate: "Simulated SRR (System Requirements Review)",
      upstreamMilestoneIds: ["cap-m1-boundary"],
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
      rubric: STANDARD_LAB_CRITERIA_RUBRIC("cap-m2-rubric-v2", 0.7),
    },
    {
      id: "cap-m3-architecture-mcda",
      order: 3,
      title: "3. Architecture Views, Data Contracts & MCDA Trade Study",
      traceStage: "Requirements → Architecture",
      designReviewGate: "Simulated PDR (Preliminary Design Review)",
      upstreamMilestoneIds: ["cap-m1-boundary", "cap-m2-requirements"],
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
      designReviewGate: "Simulated Safety & Security Gate",
      upstreamMilestoneIds: ["cap-m2-requirements", "cap-m3-architecture-mcda"],
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
      rubric: LAB_RUBRICS["lab-stpa-hazard"]!,
    },
    {
      id: "cap-m5-markov-vv",
      order: 5,
      title: "5. Markov Availability Model & Verification/Validation Plan",
      traceStage: "Controls → V&V Evidence",
      designReviewGate: "Simulated CDR / TRR (Critical Design & Test Readiness)",
      upstreamMilestoneIds: ["cap-m2-requirements", "cap-m4-safety-security"],
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
      rubric: LAB_RUBRICS["lab-markov-availability"]!,
    },
    {
      id: "cap-m6-lifecycle-defense",
      order: 6,
      title: "6. Lifecycle Support, GSN Defense Memo & Invalidation Criteria",
      traceStage: "V&V → Final Defense",
      designReviewGate: "Simulated ORR (Operational Readiness Defense)",
      upstreamMilestoneIds: [
        "cap-m1-boundary",
        "cap-m2-requirements",
        "cap-m3-architecture-mcda",
        "cap-m4-safety-security",
        "cap-m5-markov-vv",
      ],
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
