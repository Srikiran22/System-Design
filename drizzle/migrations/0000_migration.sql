CREATE TABLE public.articles (
  slug text PRIMARY KEY,
  filename text NOT NULL,
  number int,
  title text NOT NULL,
  track_order int NOT NULL DEFAULT 0,
  track text NOT NULL,
  summary text NOT NULL DEFAULT '',
  body text NOT NULL,
  word_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.sources (sort int NOT NULL DEFAULT 0, source_id text PRIMARY KEY, title text NOT NULL, url text, source_type text, relevance text, quality_signal text, limitations text);
CREATE TABLE public.practice_prompts (sort int NOT NULL DEFAULT 0, prompt_id text PRIMARY KEY, exercise text NOT NULL, primary_concepts text, required_artifacts text);
CREATE TABLE public.roles (id bigserial PRIMARY KEY, sort int NOT NULL DEFAULT 0, role text NOT NULL, career_level text, competency_areas text, typical_deliverables text, source_anchors text, portfolio_project text);
CREATE TABLE public.coverage_deep (id bigserial PRIMARY KEY, sort int NOT NULL DEFAULT 0, domain text NOT NULL, depth_in_repository text, new_deep_volumes text, primary_source_anchors text, evidence_status text, remaining_gap text, next_validation_action text);
CREATE TABLE public.coverage_research (id bigserial PRIMARY KEY, sort int NOT NULL DEFAULT 0, domain text NOT NULL, knowledge_files text, source_anchors text, known_limitations_or_gaps text, coverage_status text);
CREATE TABLE public.scrape_audit (id bigserial PRIMARY KEY, sort int NOT NULL DEFAULT 0, research_ref text, canonical_source_id text, title text, url text, status text, tools text, extraction_extent text, limitations text);
CREATE TABLE public.pack_meta (key text PRIMARY KEY, value jsonb NOT NULL);

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['articles','sources','practice_prompts','roles','coverage_deep','coverage_research','scrape_audit','pack_meta'] LOOP
    EXECUTE format('GRANT SELECT ON public.%I TO anon, authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY "Public read" ON public.%I FOR SELECT TO anon, authenticated USING (true)', t);
  END LOOP;
END $$;

CREATE INDEX articles_track_idx ON public.articles(track_order, number);
CREATE INDEX articles_search_idx ON public.articles USING gin (to_tsvector('english', title || ' ' || summary || ' ' || body));