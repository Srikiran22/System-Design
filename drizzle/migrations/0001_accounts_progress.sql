CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT '',
  initials text NOT NULL DEFAULT '',
  signature_seed integer NOT NULL DEFAULT 0,
  signed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.learning_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  text text NOT NULL CHECK (char_length(text) BETWEEN 1 AND 200),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.learning_goals(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.learning_goals TO authenticated;
GRANT ALL ON public.learning_goals TO service_role;
ALTER TABLE public.learning_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own goals" ON public.learning_goals FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.limit_goals() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF (SELECT count(*) FROM public.learning_goals WHERE user_id = NEW.user_id) >= 3 THEN
    RAISE EXCEPTION 'You can keep up to 3 learning goals';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER learning_goals_limit BEFORE INSERT ON public.learning_goals FOR EACH ROW EXECUTE FUNCTION public.limit_goals();

CREATE TABLE public.progress_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  kind text NOT NULL CHECK (kind IN ('lesson','lab','quiz','explain','article')),
  ref text NOT NULL CHECK (char_length(ref) BETWEEN 1 AND 200),
  discipline text CHECK (discipline IN ('st','sd','en')),
  occurred_on date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, kind, ref)
);
CREATE INDEX ON public.progress_events(user_id, occurred_on);
GRANT SELECT, INSERT, DELETE ON public.progress_events TO authenticated;
GRANT ALL ON public.progress_events TO service_role;
ALTER TABLE public.progress_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own events read" ON public.progress_events FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own events insert" ON public.progress_events FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own events delete" ON public.progress_events FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE n text := coalesce(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1));
BEGIN
  INSERT INTO public.profiles (id, display_name, initials, signature_seed)
  VALUES (NEW.id, n,
    upper(left(coalesce((SELECT string_agg(left(w,1), '') FROM unnest(string_to_array(trim(n), ' ')) w WHERE w <> ''), 'U'), 3)),
    (abs(hashtext(NEW.id::text)) % 100000))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();