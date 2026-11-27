/**
 * Lightweight client-safe citation alias table & tooltip summary type.
 * Kept separate from the ~932 KB generated `sourceEnrichment.ts` catalogue so
 * article Markdown rendering does not ship the full 320-source metadata blob to clients.
 */

export type CitationAuthorityTier =
  | "primary-standard"
  | "authoritative-handbook"
  | "peer-reviewed-paper"
  | "engineering-practice"
  | "secondary-reference";

export type CitationProvenanceStatus =
  "full-extraction" | "targeted-extraction" | "discovery-only" | "partial-or-blocked" | "unaudited";

export interface CitationTooltipData {
  source_id: string;
  title: string;
  relevance: string;
  authority_tier: CitationAuthorityTier;
  provenance_status: CitationProvenanceStatus;
  freshness_as_of: string;
}

/** Verified canonical aliases matching scripts/generate_source_enrichment.js. */
export const CITATION_ALIASES: Record<string, string> = {
  "ISO/IEC/IEEE 15288": "S30",
  "ISO 15288": "S30",
  "ISO/IEC/IEEE 15288:2023": "S30",
  "ISO/IEC/IEEE 42010": "S07",
  "ISO 42010": "S07",
  "ISO/IEC/IEEE 29148": "S08",
  "ISO 29148": "S08",
  "ISO/IEC 25010": "S13",
  "ISO 25010": "S13",
  "ISO/IEC/IEEE 42020": "S32",
  "ISO/IEC/IEEE 42030": "S33",
  "NASA-SP-2016-6105": "S02",
  "NASA SP-2016-6105": "S02",
  "NASA SE Handbook": "S02",
  "INCOSE SE Handbook": "S01",
  ATAM: "S09",
  SEBoK: "S109",
  "SEBoK v2.12": "S109",
  "SysML v2": "S70",
  "OMG SysML v2": "S70",
  STPA: "S77",
  "NIST SP 800-160": "S42",
  "NIST SP 800-160 Vol 1": "S42",
  "NIST SP 800-160 Vol. 1": "S42",
  "NIST SP 800-160 Vol 2": "S43",
  "NIST SP 800-160 Vol. 2": "S43",
  "NIST SP 800-160v1r1": "S42",
  "NIST SP 800-160v2r1": "S43",
  "ISO 26262": "S143",
  "IEC 61508": "S145",
  "DO-178C": "S141",
  ARP4754A: "S142",
  ARP4754B: "S142",
  "IEC 62304": "S144",
  "ISO 14971": "S144",
  "NIST AI RMF": "S61",
  QAW: "S09",
};
