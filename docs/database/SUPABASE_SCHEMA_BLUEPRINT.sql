-- ============================================================================
-- System Design Platform — Canonical Supabase PostgreSQL Schema & RLS Blueprint
-- ============================================================================
-- IMPORTANT (Lovable Cloud):
--   Do NOT commit hand-edited files under `supabase/migrations/`.
--   Apply this blueprint through Lovable Cloud / Supabase SQL Editor when
--   provisioning or updating your production PostgreSQL instance.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. RBAC Role Registry & Helper Function
-- ----------------------------------------------------------------------------
create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('learner', 'reviewer', 'author', 'admin')),
  granted_by uuid references auth.users(id),
  granted_at timestamptz not null default now()
);

alter table public.user_roles enable row level security;

create or replace function public.current_app_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role from public.user_roles where user_id = auth.uid()),
    nullif(auth.jwt() -> 'app_metadata' ->> 'role', ''),
    'learner'
  );
$$;

drop policy if exists "user_roles_self_or_admin_read" on public.user_roles;
create policy "user_roles_self_or_admin_read"
  on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.current_app_role() = 'admin');

drop policy if exists "user_roles_admin_write" on public.user_roles;
create policy "user_roles_admin_write"
  on public.user_roles for all to authenticated
  using (public.current_app_role() = 'admin')
  with check (public.current_app_role() = 'admin');

-- ----------------------------------------------------------------------------
-- 2. Learner Evidence & Optimistic-Concurrency Cross-Device Snapshots
-- ----------------------------------------------------------------------------
create table if not exists public.learner_evidence (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  idempotency_key text not null check (char_length(idempotency_key) between 1 and 200),
  skill_id text not null check (char_length(skill_id) between 1 and 100),
  evidence_type text not null check (evidence_type in ('quiz', 'explain', 'variant', 'lab', 'artifact', 'review')),
  ref text not null check (char_length(ref) between 1 and 200),
  score numeric not null check (score >= 0 and score <= 1),
  weight numeric not null check (weight >= 0.1 and weight <= 10),
  confidence numeric check (confidence is null or (confidence >= 0 and confidence <= 1)),
  verification_tier text not null default 'self-assessed'
    check (verification_tier in ('self-assessed', 'automated-check', 'rubric-evaluated', 'reviewer-verified')),
  rubric_version text,
  rubric_scores_json jsonb,
  artifact_url text check (artifact_url is null or artifact_url ~ '^(https?://|/[^/])'),
  artifact_notes text check (artifact_notes is null or char_length(artifact_notes) <= 8000),
  reviewer_id uuid references auth.users(id),
  reviewed_at timestamptz,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, idempotency_key)
);

create index if not exists learner_evidence_user_skill_idx
  on public.learner_evidence (user_id, skill_id, occurred_at desc);

alter table public.learner_evidence enable row level security;

-- Learners can read their own evidence; reviewers & admins can inspect for verification
drop policy if exists "learner_evidence_select" on public.learner_evidence;
create policy "learner_evidence_select"
  on public.learner_evidence for select to authenticated
  using (
    user_id = auth.uid()
    or public.current_app_role() in ('reviewer', 'admin')
  );

-- Learners can insert ONLY self-assessed or automated-check evidence for themselves (never reviewer-verified)
drop policy if exists "learner_evidence_self_insert" on public.learner_evidence;
create policy "learner_evidence_self_insert"
  on public.learner_evidence for insert to authenticated
  with check (
    user_id = auth.uid()
    and verification_tier in ('self-assessed', 'automated-check')
    and reviewer_id is null
    and reviewed_at is null
  );

-- Learners can update their own unverified records (never self-escalating tier)
drop policy if exists "learner_evidence_self_update" on public.learner_evidence;
create policy "learner_evidence_self_update"
  on public.learner_evidence for update to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and verification_tier in ('self-assessed', 'automated-check')
    and reviewer_id is null
  );

-- Verified reviewers/admins can elevate verification tier on other users' artifacts
drop policy if exists "learner_evidence_reviewer_update" on public.learner_evidence;
create policy "learner_evidence_reviewer_update"
  on public.learner_evidence for update to authenticated
  using (
    public.current_app_role() in ('reviewer', 'admin')
    and (user_id <> auth.uid() or public.current_app_role() = 'admin')
  )
  with check (
    public.current_app_role() in ('reviewer', 'admin')
    and reviewer_id = auth.uid()
  );

create table if not exists public.learner_state_snapshots (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state_json jsonb not null,
  version integer not null default 1 check (version >= 1),
  updated_at timestamptz not null default now()
);

alter table public.learner_state_snapshots enable row level security;

drop policy if exists "learner_state_snapshots_owner_all" on public.learner_state_snapshots;
create policy "learner_state_snapshots_owner_all"
  on public.learner_state_snapshots for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 3. Immutable Security & CMS Audit Log
-- ----------------------------------------------------------------------------
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id),
  action text not null,
  resource_type text not null,
  resource_id text,
  outcome text not null check (outcome in ('ok', 'denied', 'error')),
  request_id text,
  meta_json jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_log_created_idx on public.audit_log (created_at desc);

alter table public.audit_log enable row level security;

drop policy if exists "audit_log_admin_read" on public.audit_log;
create policy "audit_log_admin_read"
  on public.audit_log for select to authenticated
  using (public.current_app_role() = 'admin');

drop policy if exists "audit_log_staff_insert" on public.audit_log;
create policy "audit_log_staff_insert"
  on public.audit_log for insert to authenticated
  with check (
    actor_user_id = auth.uid()
    and public.current_app_role() in ('reviewer', 'author', 'admin')
  );

-- ----------------------------------------------------------------------------
-- 4. Dynamic Curriculum Tables (Zero Hardcoded Course Lock-In)
-- ----------------------------------------------------------------------------
create table if not exists public.courses (
  id text primary key,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  discipline text not null check (discipline in ('thinking', 'design', 'engineering')),
  title text not null,
  tagline text not null,
  level text not null check (level in ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  about_json jsonb not null default '[]'::jsonb,
  outcomes_json jsonb not null default '[]'::jsonb,
  artifact text not null,
  sort_order integer not null default 100,
  version integer not null default 1,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists courses_status_sort_idx on public.courses (status, sort_order);

create table if not exists public.course_modules (
  id text primary key,
  course_id text not null references public.courses(id) on delete cascade,
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  summary text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, slug)
);

create index if not exists course_modules_course_sort_idx on public.course_modules (course_id, sort_order);

create table if not exists public.course_lessons (
  id text primary key,
  module_id text not null references public.course_modules(id) on delete cascade,
  course_id text not null references public.courses(id) on delete cascade,
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  summary text not null,
  minutes integer not null check (minutes between 1 and 600),
  skill_ids_json jsonb not null default '[]'::jsonb,
  blocks_json jsonb not null default '[]'::jsonb,
  keep_json jsonb not null default '[]'::jsonb,
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  sort_order integer not null default 0,
  version integer not null default 1,
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, slug)
);

create index if not exists course_lessons_module_sort_idx on public.course_lessons (module_id, sort_order);

create table if not exists public.curriculum_competencies (
  id text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  code text not null,
  domain text not null check (domain in ('thinking', 'design', 'engineering')),
  title text not null,
  blurb text not null,
  definition text not null,
  bloom_target text not null check (bloom_target in ('apply', 'analyze', 'evaluate', 'create')),
  prerequisites_json jsonb not null default '[]'::jsonb,
  relations_json jsonb not null default '[]'::jsonb,
  framework_anchors_json jsonb not null default '[]'::jsonb,
  level_descriptors_json jsonb not null,
  mapped_volumes_json jsonb not null default '[]'::jsonb,
  role_tags_json jsonb not null default '[]'::jsonb,
  crosswalk_json jsonb,
  version text not null default '2.0.0',
  sort_order integer not null default 100,
  updated_at timestamptz not null default now()
);

create table if not exists public.curriculum_labs (
  id text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  discipline text not null check (discipline in ('thinking', 'design', 'engineering')),
  skill_id text not null,
  title text not null,
  brief text not null,
  minutes integer not null check (minutes between 5 and 600),
  steps_json jsonb not null default '[]'::jsonb,
  twist text not null,
  artifact text not null,
  evidence_type text not null check (evidence_type in ('lab', 'variant', 'artifact')),
  rubric_json jsonb not null,
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  sort_order integer not null default 100,
  version integer not null default 1,
  updated_at timestamptz not null default now()
);

create table if not exists public.curriculum_scenarios (
  id text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  skill_id text not null,
  title text not null,
  domain_context text not null,
  situation text not null,
  constraints_json jsonb not null default '[]'::jsonb,
  question text not null,
  options_json jsonb not null default '[]'::jsonb,
  invalidation_prompt text not null,
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  sort_order integer not null default 100,
  updated_at timestamptz not null default now()
);

create table if not exists public.curriculum_capstones (
  id text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  version text not null default '2.0.0',
  title text not null,
  summary text not null,
  disclaimer text not null,
  change_impact_json jsonb not null,
  milestones_json jsonb not null,
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  updated_at timestamptz not null default now()
);

create table if not exists public.curriculum_role_profiles (
  id text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  status text not null default 'provisional' check (status = 'provisional'),
  disclaimer text not null,
  summary text not null,
  required_levels_json jsonb not null default '{}'::jsonb,
  sort_order integer not null default 100,
  updated_at timestamptz not null default now()
);

-- Enable RLS across all dynamic curriculum tables
alter table public.courses enable row level security;
alter table public.course_modules enable row level security;
alter table public.course_lessons enable row level security;
alter table public.curriculum_competencies enable row level security;
alter table public.curriculum_labs enable row level security;
alter table public.curriculum_scenarios enable row level security;
alter table public.curriculum_capstones enable row level security;
alter table public.curriculum_role_profiles enable row level security;

-- Public read of published content; authors/admins can read drafts & mutate
drop policy if exists "courses_public_read_published" on public.courses;
create policy "courses_public_read_published"
  on public.courses for select to anon, authenticated
  using (status = 'published' or public.current_app_role() in ('author', 'admin'));

drop policy if exists "courses_author_write" on public.courses;
create policy "courses_author_write"
  on public.courses for all to authenticated
  using (public.current_app_role() in ('author', 'admin'))
  with check (public.current_app_role() in ('author', 'admin'));

drop policy if exists "course_modules_public_read" on public.course_modules;
create policy "course_modules_public_read"
  on public.course_modules for select to anon, authenticated
  using (
    exists (
      select 1 from public.courses c
      where c.id = course_modules.course_id
        and (c.status = 'published' or public.current_app_role() in ('author', 'admin'))
    )
  );

drop policy if exists "course_modules_author_write" on public.course_modules;
create policy "course_modules_author_write"
  on public.course_modules for all to authenticated
  using (public.current_app_role() in ('author', 'admin'))
  with check (public.current_app_role() in ('author', 'admin'));

drop policy if exists "course_lessons_public_read" on public.course_lessons;
create policy "course_lessons_public_read"
  on public.course_lessons for select to anon, authenticated
  using (status = 'published' or public.current_app_role() in ('author', 'admin'));

drop policy if exists "course_lessons_author_write" on public.course_lessons;
create policy "course_lessons_author_write"
  on public.course_lessons for all to authenticated
  using (public.current_app_role() in ('author', 'admin'))
  with check (public.current_app_role() in ('author', 'admin'));

drop policy if exists "curriculum_competencies_read" on public.curriculum_competencies;
create policy "curriculum_competencies_read"
  on public.curriculum_competencies for select to anon, authenticated
  using (true);

drop policy if exists "curriculum_competencies_author_write" on public.curriculum_competencies;
create policy "curriculum_competencies_author_write"
  on public.curriculum_competencies for all to authenticated
  using (public.current_app_role() in ('author', 'admin'))
  with check (public.current_app_role() in ('author', 'admin'));

drop policy if exists "curriculum_labs_read" on public.curriculum_labs;
create policy "curriculum_labs_read"
  on public.curriculum_labs for select to anon, authenticated
  using (status = 'published' or public.current_app_role() in ('author', 'admin'));

drop policy if exists "curriculum_labs_author_write" on public.curriculum_labs;
create policy "curriculum_labs_author_write"
  on public.curriculum_labs for all to authenticated
  using (public.current_app_role() in ('author', 'admin'))
  with check (public.current_app_role() in ('author', 'admin'));

drop policy if exists "curriculum_scenarios_read" on public.curriculum_scenarios;
create policy "curriculum_scenarios_read"
  on public.curriculum_scenarios for select to anon, authenticated
  using (status = 'published' or public.current_app_role() in ('author', 'admin'));

drop policy if exists "curriculum_scenarios_author_write" on public.curriculum_scenarios;
create policy "curriculum_scenarios_author_write"
  on public.curriculum_scenarios for all to authenticated
  using (public.current_app_role() in ('author', 'admin'))
  with check (public.current_app_role() in ('author', 'admin'));

drop policy if exists "curriculum_capstones_read" on public.curriculum_capstones;
create policy "curriculum_capstones_read"
  on public.curriculum_capstones for select to anon, authenticated
  using (status = 'published' or public.current_app_role() in ('author', 'admin'));

drop policy if exists "curriculum_capstones_author_write" on public.curriculum_capstones;
create policy "curriculum_capstones_author_write"
  on public.curriculum_capstones for all to authenticated
  using (public.current_app_role() in ('author', 'admin'))
  with check (public.current_app_role() in ('author', 'admin'));

drop policy if exists "curriculum_role_profiles_read" on public.curriculum_role_profiles;
create policy "curriculum_role_profiles_read"
  on public.curriculum_role_profiles for select to anon, authenticated
  using (true);

drop policy if exists "curriculum_role_profiles_author_write" on public.curriculum_role_profiles;
create policy "curriculum_role_profiles_author_write"
  on public.curriculum_role_profiles for all to authenticated
  using (public.current_app_role() in ('author', 'admin'))
  with check (public.current_app_role() in ('author', 'admin'));
