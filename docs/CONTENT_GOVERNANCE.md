# Knowledge & Research Governance

## 1. Canonical Pack Root

- **`content/pack/`** is the single canonical source of truth for all 120 markdown volumes (119 numbered/guide articles + import guide), `sources.csv` (320 records), `DEEP_SCRAPE_AUDIT.csv` (162 extraction audit rows), `practice_prompts.csv` (73 prompts), `role_competency_matrix.csv` (28 roles), coverage matrices, and `PACK_METADATA.json`.
- `scripts/generate_source_enrichment.js` reads exclusively from `content/pack/` and generates `src/lib/neet/sourceEnrichment.ts`.

## 2. Citation Integrity & Provenance Rules

1. **Explicit Citations vs. Topic-Related Reading**:
   - `cited_in_articles` and `ARTICLE_EXPLICIT_SOURCES` contain **only** sources explicitly referenced by canonical `Sxxx` ID in a volume's markdown text.
   - Register-only sources without direct inline citations are surfaced separately under `related_articles` / *"Related reference reading (topic-matched)"* so heuristic associations are never mislabeled as explicit citations.
2. **Verified Citation Aliases**:
   - Every alias in `CITATION_ALIASES` is verified at generation time to exist in `content/pack/sources.csv` (eliminating previously misdirected aliases such as `MIL-STD-882E`, `NPR 7120.5F`, and `ATAM -> S125`).
   - Inline citations that do not resolve to a registered source render as neutral monospace tags rather than fabricated source links.
3. **Honest Extraction Status & Authority Tiers**:
   - Every source carries typed `authority_tier` (`primary-standard`, `authoritative-handbook`, `peer-reviewed-paper`, `engineering-practice`, `secondary-reference`), `provenance_status` (`full-extraction`, `targeted-extraction`, `discovery-only`, `partial-or-blocked`, `unaudited`), `url_valid`, `freshness_as_of`, and `licensing_note`.
   - Public status pages report the exact extraction audit breakdown instead of blanket "verified" claims.
4. **Copyright & Licensing Discipline**:
   - Paywalled standards (ISO, IEEE, IEC, INCOSE, Open Group) are summarized with attribution only and link to the official publisher edition; verbatim normative text is not reproduced.

## 3. Repeatable Content Update Workflow

Whenever updating files in `content/pack/`:

```bash
# 1. Regenerate TypeScript enriched source index from canonical content/pack/
npm run generate:sources

# 2. Run automated pack integrity gate (URLs, dangling [Sxx] citations, audit counts, mirror parity)
npm run validate:pack

# 3. Re-seed local SQLite mirror (if using local dev)
npm run seed:sqlite

# 4. Re-import into Supabase Cloud (requires service role env vars)
python3 scripts/load-content.py
```
