import fs from "fs";
import path from "path";

const PACK_ROOT = "content/pack";

function parseCSV(text) {
  const rows = [];
  let currentRow = [];
  let currentField = "";
  let insideQuote = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuote && nextChar === '"') {
        currentField += '"';
        i++;
      } else {
        insideQuote = !insideQuote;
      }
    } else if (char === "," && !insideQuote) {
      currentRow.push(currentField);
      currentField = "";
    } else if ((char === "\r" || char === "\n") && !insideQuote) {
      if (char === "\r" && nextChar === "\n") i++;
      currentRow.push(currentField);
      if (currentRow.some((c) => c.length > 0)) rows.push(currentRow);
      currentRow = [];
      currentField = "";
    } else {
      currentField += char;
    }
  }
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }
  return rows;
}

const packMeta = JSON.parse(fs.readFileSync(path.join(PACK_ROOT, "PACK_METADATA.json"), "utf8"));
const freshnessAsOf = String(packMeta.as_of || "2026-11-05");

const sourceRows = parseCSV(fs.readFileSync(path.join(PACK_ROOT, "sources.csv"), "utf8")).slice(1);
const auditRows = parseCSV(
  fs.readFileSync(path.join(PACK_ROOT, "DEEP_SCRAPE_AUDIT.csv"), "utf8"),
).slice(1);
const mdFiles = fs
  .readdirSync(PACK_ROOT)
  .filter((f) => f.endsWith(".md") && f !== "CONTENT_IMPORT_GUIDE.md");

// Build file metadata from canonical content/pack
const fileMeta = [];
mdFiles.forEach((f) => {
  const text = fs.readFileSync(path.join(PACK_ROOT, f), "utf8");
  const h1Match = text.match(/^#\s+(.+)$/m);
  const title = h1Match ? h1Match[1].trim() : f.replace(/\.md$/, "");
  const numMatch = f.match(/^(\d+)_/);
  const number = numMatch ? parseInt(numMatch[1], 10) : null;
  const slug = f.replace(/\.md$/, "").toLowerCase().replace(/_/g, "-");
  fileMeta.push({
    filename: f,
    slug,
    title,
    number,
    text,
  });
});

// Audit map keyed by canonicalId and researchRef
const auditMap = new Map();
auditRows.forEach((row) => {
  const [researchRef, canonicalId, title, url, status, tools, extractionExtent, limitations] = row;
  const item = {
    researchRef,
    canonicalId,
    title,
    url,
    status,
    tools,
    extractionExtent,
    limitations,
  };
  if (canonicalId) auditMap.set(canonicalId.trim(), item);
  if (researchRef && researchRef.trim() !== canonicalId?.trim()) {
    auditMap.set(researchRef.trim(), item);
  }
});

function deriveDomainTopics(title, type, rel) {
  const combined = `${title} ${type} ${rel}`.toLowerCase();
  const topics = new Set();

  if (
    combined.includes("incose") ||
    combined.includes("nasa") ||
    combined.includes("systems engineering") ||
    combined.includes("sebok")
  ) {
    topics.add("Systems Engineering");
  }
  if (
    combined.includes("thinking") ||
    combined.includes("meadows") ||
    combined.includes("system dynamics") ||
    combined.includes("feedback")
  ) {
    topics.add("Systems Thinking");
  }
  if (
    combined.includes("requirement") ||
    combined.includes("traceability") ||
    combined.includes("29148")
  ) {
    topics.add("Requirements Engineering");
  }
  if (
    combined.includes("distributed") ||
    combined.includes("consensus") ||
    combined.includes("raft") ||
    combined.includes("paxos") ||
    combined.includes("spanner") ||
    combined.includes("zookeeper")
  ) {
    topics.add("Distributed Systems");
  }
  if (
    combined.includes("safety") ||
    combined.includes("hazard") ||
    combined.includes("stamp") ||
    combined.includes("stpa") ||
    combined.includes("61508") ||
    combined.includes("26262") ||
    combined.includes("882")
  ) {
    topics.add("Safety & Hazard Analysis");
  }
  if (
    combined.includes("reliability") ||
    combined.includes("weibull") ||
    combined.includes("markov") ||
    combined.includes("fmeca") ||
    combined.includes("fmea") ||
    combined.includes("availability") ||
    combined.includes("rcm")
  ) {
    topics.add("Reliability & Dependability");
  }
  if (
    combined.includes("security") ||
    combined.includes("threat") ||
    combined.includes("stride") ||
    combined.includes("crypto") ||
    combined.includes("cyber")
  ) {
    topics.add("Security Architecture");
  }
  if (
    combined.includes("sysml") ||
    combined.includes("mbse") ||
    combined.includes("model") ||
    combined.includes("simulation") ||
    combined.includes("digital twin")
  ) {
    topics.add("MBSE & Modeling");
  }
  if (
    combined.includes("architecture") ||
    combined.includes("atam") ||
    combined.includes("iso 42010") ||
    combined.includes("arc42") ||
    combined.includes("patterns") ||
    combined.includes("c4")
  ) {
    topics.add("Software & Enterprise Architecture");
  }
  if (
    combined.includes("data") ||
    combined.includes("mesh") ||
    combined.includes("lakehouse") ||
    combined.includes("stream") ||
    combined.includes("kafka") ||
    combined.includes("contract")
  ) {
    topics.add("Data Architecture");
  }
  if (
    combined.includes("cloud") ||
    combined.includes("sre") ||
    combined.includes("slo") ||
    combined.includes("sli") ||
    combined.includes("devops") ||
    combined.includes("kubernetes")
  ) {
    topics.add("Cloud & SRE");
  }
  if (
    combined.includes("decision") ||
    combined.includes("trade study") ||
    combined.includes("mcda") ||
    combined.includes("utility") ||
    combined.includes("bayes")
  ) {
    topics.add("Decision Analysis & Trade Studies");
  }
  if (
    combined.includes("verification") ||
    combined.includes("validation") ||
    combined.includes("testing") ||
    combined.includes("qualification") ||
    combined.includes("v&v")
  ) {
    topics.add("Verification & Validation");
  }
  if (
    combined.includes("aerospace") ||
    combined.includes("automotive") ||
    combined.includes("medical") ||
    combined.includes("rail") ||
    combined.includes("defense") ||
    combined.includes("dod")
  ) {
    topics.add("Regulated Sector Assurance");
  }
  if (
    combined.includes("human") ||
    combined.includes("hra") ||
    combined.includes("ergonomics") ||
    combined.includes("cognitive")
  ) {
    topics.add("Human Systems Integration");
  }
  if (
    combined.includes("lifecycle") ||
    combined.includes("support") ||
    combined.includes("obsolescence") ||
    combined.includes("dmsms") ||
    combined.includes("maintenance") ||
    combined.includes("phm")
  ) {
    topics.add("Product Support & Lifecycle");
  }

  if (topics.size === 0) {
    topics.add("Systems Foundations");
  }
  return Array.from(topics).slice(0, 4);
}

function classifyAuthorityTier(title, sourceType, qualitySignal) {
  const combined = `${title} ${sourceType} ${qualitySignal}`.toLowerCase();
  if (
    combined.includes("iso/") ||
    combined.includes("iso ") ||
    combined.includes("iec ") ||
    combined.includes("ieee") ||
    combined.includes("international standard") ||
    combined.includes("formal specification") ||
    combined.includes("regulation") ||
    combined.includes("advisory circular") ||
    combined.includes("npr ") ||
    combined.includes("sector safety standard")
  ) {
    return "primary-standard";
  }
  if (
    combined.includes("incose") ||
    combined.includes("sebok") ||
    combined.includes("nasa") ||
    combined.includes("handbook") ||
    combined.includes("body of knowledge") ||
    combined.includes("nist") ||
    combined.includes("dod") ||
    combined.includes("sei")
  ) {
    return "authoritative-handbook";
  }
  if (
    combined.includes("paper") ||
    combined.includes("academic") ||
    combined.includes("journal") ||
    combined.includes("conference") ||
    combined.includes("peer-reviewed") ||
    combined.includes("acm")
  ) {
    return "peer-reviewed-paper";
  }
  if (
    combined.includes("official") ||
    combined.includes("documentation") ||
    combined.includes("architecture") ||
    combined.includes("google") ||
    combined.includes("aws") ||
    combined.includes("engineering")
  ) {
    return "engineering-practice";
  }
  return "secondary-reference";
}

function classifyProvenanceStatus(audit) {
  if (!audit || !audit.status) return "unaudited";
  const st = audit.status.toLowerCase();
  if (st.includes("full fetch") || st.includes("full extraction")) return "full-extraction";
  if (st.includes("targeted")) return "targeted-extraction";
  if (st.includes("discovery")) return "discovery-only";
  return "partial-or-blocked";
}

function isValidHttpUrl(url) {
  if (!url || typeof url !== "string") return false;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function deriveLicensingNote(title, sourceType, url, limitations) {
  const combined = `${title} ${sourceType} ${url || ""} ${limitations || ""}`.toLowerCase();
  if (
    combined.includes("iso.org") ||
    combined.includes("ieee") ||
    combined.includes("iec.ch") ||
    combined.includes("incose") ||
    combined.includes("opengroup") ||
    combined.includes("paywall") ||
    combined.includes("purchase")
  ) {
    return "Copyrighted standard/publication — summarized with attribution only; consult the official publisher edition for normative compliance.";
  }
  if (combined.includes("nasa") || combined.includes("nist.gov") || combined.includes("faa.gov")) {
    return "Public government technical publication — verify current revision and applicability on the issuing agency site.";
  }
  if (combined.includes("sebok")) {
    return "Community body of knowledge (SEBoK) — verify current wiki revision and underlying primary references.";
  }
  return "External reference — verify current edition, license terms, and operational applicability at the publisher URL.";
}

const topicToVolumes = {
  "Systems Engineering": [0, 1, 3, 21, 23, 29, 38, 48, 81, 98],
  "Systems Thinking": [0, 1, 2, 27, 28, 61, 103],
  "Requirements Engineering": [3, 4, 29, 63, 85],
  "Distributed Systems": [5, 7, 32, 45, 65],
  "Safety & Hazard Analysis": [8, 23, 36, 44, 77, 107, 108],
  "Reliability & Dependability": [8, 35, 46, 75, 100, 101, 110, 111, 112, 113],
  "Security Architecture": [9, 37, 42, 48, 73],
  "MBSE & Modeling": [22, 39, 67, 84, 102],
  "Software & Enterprise Architecture": [3, 5, 6, 25, 30, 31, 40, 46, 64, 84, 99],
  "Data Architecture": [7, 34, 66, 90],
  "Cloud & SRE": [10, 33, 50, 100],
  "Decision Analysis & Trade Studies": [6, 30, 88, 89, 96, 97, 118],
  "Verification & Validation": [21, 38, 70, 104, 105, 106],
  "Regulated Sector Assurance": [44, 48, 78, 92, 108, 109],
  "Human Systems Integration": [41, 74, 87, 91],
  "Product Support & Lifecycle": [21, 48, 101, 114, 115, 116, 117],
};

// Build enriched source records cleanly separating EXPLICIT citations vs HEURISTIC related volumes
const enrichedSources = [];
const articleExplicitSourceMap = {};
const articleRelatedSourceMap = {};
const articleAllSourceMap = {};

sourceRows.forEach((row) => {
  const [sourceId, title, url, sourceType, relevance, qualitySignal, limitations] = row;
  if (!sourceId) return;
  const cleanId = sourceId.trim();
  const audit = auditMap.get(cleanId);
  const topics = deriveDomainTopics(title || "", sourceType || "", relevance || "");
  const authorityTier = classifyAuthorityTier(title || "", sourceType || "", qualitySignal || "");
  const provenanceStatus = classifyProvenanceStatus(audit);
  const urlValid = isValidHttpUrl(url);
  const licensingNote = deriveLicensingNote(
    title || "",
    sourceType || "",
    url || "",
    limitations || "",
  );

  // 1. EXPLICIT citations: exact token boundary match of sourceId in canonical pack markdown
  const idRegex = new RegExp(`\\b${cleanId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`);
  const explicitFiles = fileMeta
    .filter((m) => idRegex.test(m.text))
    .map((m) => ({
      slug: m.slug,
      number: m.number,
      title: m.title,
      filename: m.filename,
    }));

  // 2. HEURISTIC related reading (NEVER mixed into explicit cited_in_articles!)
  const relatedFiles = [];
  const explicitSlugs = new Set(explicitFiles.map((f) => f.slug));
  const candidateNums = new Set();
  topics.forEach((t) => {
    const vols = topicToVolumes[t] || [];
    vols.slice(0, 3).forEach((v) => candidateNums.add(v));
  });
  if (candidateNums.size === 0) candidateNums.add(0);

  candidateNums.forEach((num) => {
    const m = fileMeta.find((f) => f.number === num);
    if (m && !explicitSlugs.has(m.slug) && !relatedFiles.some((r) => r.slug === m.slug)) {
      relatedFiles.push({
        slug: m.slug,
        number: m.number,
        title: m.title,
        filename: m.filename,
      });
    }
  });

  // Update reverse mappings cleanly
  explicitFiles.forEach((cf) => {
    if (!articleExplicitSourceMap[cf.slug]) articleExplicitSourceMap[cf.slug] = [];
    if (!articleExplicitSourceMap[cf.slug].includes(cleanId)) {
      articleExplicitSourceMap[cf.slug].push(cleanId);
    }
    if (!articleAllSourceMap[cf.slug]) articleAllSourceMap[cf.slug] = [];
    if (!articleAllSourceMap[cf.slug].includes(cleanId)) {
      articleAllSourceMap[cf.slug].push(cleanId);
    }
  });

  relatedFiles.forEach((rf) => {
    if (!articleRelatedSourceMap[rf.slug]) articleRelatedSourceMap[rf.slug] = [];
    if (!articleRelatedSourceMap[rf.slug].includes(cleanId)) {
      articleRelatedSourceMap[rf.slug].push(cleanId);
    }
    if (!articleAllSourceMap[rf.slug]) articleAllSourceMap[rf.slug] = [];
    if (!articleAllSourceMap[rf.slug].includes(cleanId)) {
      articleAllSourceMap[rf.slug].push(cleanId);
    }
  });

  let summary = "";
  if (audit && audit.extractionExtent && audit.extractionExtent.length > 20) {
    summary = `${relevance}. Extraction detail: ${audit.extractionExtent}`;
  } else {
    summary = `${relevance || "Reference source"} — domain focus: ${topics.join(", ")}.`;
  }

  // Honest, evidence-calibrated takeaway (never claims normative baseline for unaudited/discovery-only items)
  let takeaways = "";
  if (authorityTier === "primary-standard") {
    takeaways =
      provenanceStatus === "full-extraction" || provenanceStatus === "targeted-extraction"
        ? `Primary engineering standard for ${topics[0] || "systems engineering"}. Obtain the current official publisher edition for compliance work. Limitations: ${limitations || "Check revision currency"}.`
        : `Primary standard indexed for ${topics[0] || "systems engineering"} (${provenanceStatus.replace(/-/g, " ")}). Verify full clauses directly in the official edition. Limitations: ${limitations || "Metadata/overview only"}.`;
  } else if (authorityTier === "authoritative-handbook") {
    takeaways = `Authoritative handbook/body-of-knowledge guidance for ${topics[0] || "systems engineering"}. Cross-check against project-specific regulatory constraints. Note: ${limitations || "Verify edition"}.`;
  } else if (authorityTier === "peer-reviewed-paper") {
    takeaways = `Peer-reviewed research or formal proof model. Validate assumptions against target production constraints before adopting. Note: ${limitations || "Verify applicability"}.`;
  } else {
    takeaways = `Practical engineering reference for ${topics[0] || "system design"}. Balance against domain risk and lifecycle constraints. Note: ${limitations || "Verify currency"}.`;
  }

  enrichedSources.push({
    source_id: cleanId,
    title: title || "",
    url: url || null,
    url_valid: urlValid,
    source_type: sourceType || "Reference",
    authority_tier: authorityTier,
    provenance_status: provenanceStatus,
    freshness_as_of: freshnessAsOf,
    licensing_note: licensingNote,
    relevance: relevance || "",
    quality_signal: qualitySignal || "Documented reference",
    limitations: limitations || "Verify current edition and applicability",
    ...(audit
      ? {
          audit: {
            status: audit.status,
            tools: audit.tools,
            extraction_extent: audit.extractionExtent,
            limitations: audit.limitations,
          },
        }
      : {}),
    domain_topics: topics,
    summary,
    takeaways,
    cited_in_articles: explicitFiles,
    related_articles: relatedFiles,
  });
});

// Verified alias table — every target ID is checked to exist in enrichedSources!
const RAW_ALIASES = {
  "INCOSE SE Handbook": "S01",
  "NASA-SP-2016-6105": "S02",
  "NASA/SP-2016-6105": "S02",
  ATAM: "S09",
  SEBoK: "S63",
  "SysML v2": "S67",
  "SysML 2.0": "S67",
  "STPA Handbook": "S77",
  STPA: "S77",
  "ISO/IEC/IEEE 15288": "S119",
  "ISO 15288": "S119",
  "ISO/IEC/IEEE 42010": "S120",
  "ISO 42010": "S120",
  "ISO/IEC/IEEE 29148": "S121",
  "ISO 29148": "S121",
  "ISO/IEC/IEEE 42020": "S122",
  "ISO 42020": "S122",
  "ISO/IEC/IEEE 24748-1": "S123",
  QAW: "S125",
  "TOGAF 10": "S126",
  "BPMN 2.0": "S127",
  "IEC 61508": "S131",
  "ISO 26262": "S162",
  "NASA-HDBK-1009A": "S191",
  "ISO/IEC/IEEE 21839": "S256",
  "ISO 21839": "S256",
  "NPR 7123.1D": "S272",
  "FAA AC 20-115D": "S291",
  "NASA/SP-2010-576": "S334",
};

const validIdSet = new Set(enrichedSources.map((s) => s.source_id));
const verifiedAliases = {};
for (const [alias, id] of Object.entries(RAW_ALIASES)) {
  if (!validIdSet.has(id)) {
    throw new Error(
      `Invalid alias target: ${alias} -> ${id} does not exist in ${PACK_ROOT}/sources.csv`,
    );
  }
  verifiedAliases[alias] = id;
}

const explicitCitedCount = enrichedSources.filter((s) => s.cited_in_articles.length > 0).length;
console.log("Canonical pack root:", PACK_ROOT);
console.log("Total enriched sources:", enrichedSources.length);
console.log("Explicitly cited sources:", explicitCitedCount);
console.log(
  "Uncited register-only sources (related reading only):",
  enrichedSources.length - explicitCitedCount,
);

const tsContent = `/**
 * Auto-generated Enriched Source Index (from canonical content/pack/)
 * DO NOT EDIT BY HAND — regenerate with: node scripts/generate_source_enrichment.js
 * Separates explicit markdown citations (cited_in_articles) from heuristic domain reading (related_articles).
 */

export type SourceAuthorityTier =
  | "primary-standard"
  | "authoritative-handbook"
  | "peer-reviewed-paper"
  | "engineering-practice"
  | "secondary-reference";

export type SourceProvenanceStatus =
  | "full-extraction"
  | "targeted-extraction"
  | "discovery-only"
  | "partial-or-blocked"
  | "unaudited";

export interface EnrichedSourceAudit {
  status: string;
  tools: string;
  extraction_extent: string;
  limitations: string;
}

export interface EnrichedSourceArticleRef {
  slug: string;
  number: number | null;
  title: string;
  filename: string;
}

export interface EnrichedSource {
  source_id: string;
  title: string;
  url: string | null;
  url_valid: boolean;
  source_type: string;
  authority_tier: SourceAuthorityTier;
  provenance_status: SourceProvenanceStatus;
  freshness_as_of: string;
  licensing_note: string;
  relevance: string;
  quality_signal: string;
  limitations: string;
  audit?: EnrichedSourceAudit;
  domain_topics: string[];
  summary: string;
  takeaways: string;
  /** Articles that explicitly reference this source_id in their markdown body. */
  cited_in_articles: EnrichedSourceArticleRef[];
  /** Heuristically associated volumes by domain topic (never conflated with explicit citations). */
  related_articles: EnrichedSourceArticleRef[];
}

export const PACK_FRESHNESS_AS_OF = ${JSON.stringify(freshnessAsOf)};

export const ENRICHED_SOURCES: Record<string, EnrichedSource> = ${JSON.stringify(
  Object.fromEntries(enrichedSources.map((s) => [s.source_id, s])),
  null,
  2,
)};

export const ALL_ENRICHED_SOURCES: EnrichedSource[] = Object.values(ENRICHED_SOURCES);

/** Explicit S-ID citations per article slug (strict text match). */
export const ARTICLE_EXPLICIT_SOURCES: Record<string, string[]> = ${JSON.stringify(
  articleExplicitSourceMap,
  null,
  2,
)};

/** Heuristic topic-related sources per article slug (excludes already-explicitly-cited IDs). */
export const ARTICLE_RELATED_SOURCES: Record<string, string[]> = ${JSON.stringify(
  articleRelatedSourceMap,
  null,
  2,
)};

/** Combined lookup preserved for backward compatibility. */
export const ARTICLE_TO_SOURCES: Record<string, string[]> = ${JSON.stringify(
  articleAllSourceMap,
  null,
  2,
)};

/** Verified alias mapping for standards and handbook names to canonical source IDs. */
export const CITATION_ALIASES: Record<string, string> = ${JSON.stringify(verifiedAliases, null, 2)};

export function getEnrichedSource(id: string): EnrichedSource | undefined {
  const norm = id.trim().toUpperCase();
  if (ENRICHED_SOURCES[norm]) return ENRICHED_SOURCES[norm];
  const alias = CITATION_ALIASES[id.trim()];
  if (alias && ENRICHED_SOURCES[alias]) return ENRICHED_SOURCES[alias];
  return undefined;
}

/** Return explicit citations and heuristic related reading separately for an article. */
export function getSourcesForArticleSplit(slugOrFilename: string): {
  explicitSources: EnrichedSource[];
  relatedSources: EnrichedSource[];
} {
  const clean = slugOrFilename.replace(/\\.md$/, "").toLowerCase().replace(/_/g, "-");
  const explicitIds = ARTICLE_EXPLICIT_SOURCES[clean] || [];
  const relatedIds = ARTICLE_RELATED_SOURCES[clean] || [];
  return {
    explicitSources: explicitIds.map((id) => ENRICHED_SOURCES[id]).filter(Boolean) as EnrichedSource[],
    relatedSources: relatedIds
      .slice(0, 8)
      .map((id) => ENRICHED_SOURCES[id])
      .filter(Boolean) as EnrichedSource[],
  };
}

/** Backward-compatible helper returning explicitly cited sources first. */
export function getSourcesForArticle(slugOrFilename: string): EnrichedSource[] {
  const { explicitSources } = getSourcesForArticleSplit(slugOrFilename);
  return explicitSources;
}
`;

fs.writeFileSync("src/lib/neet/sourceEnrichment.ts", tsContent, "utf8");
console.log("Successfully wrote src/lib/neet/sourceEnrichment.ts from canonical content/pack/!");
