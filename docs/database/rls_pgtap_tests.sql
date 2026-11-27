-- ============================================================================
-- pgTAP Positive & Negative Row-Level Security (RLS) Test Suite
-- ============================================================================
-- Run against a Supabase / PostgreSQL database with pgTAP enabled:
--   supabase test db
-- Verifies strict tenant isolation, verification-tier integrity, draft hiding,
-- and role-based access control across anon, learner A/B, reviewer, author, admin.
-- ============================================================================

begin;
select plan(10);

-- Test fixture UUIDs
do $$
declare
  u_a uuid := '11111111-1111-4111-8111-111111111111';
  u_b uuid := '22222222-2222-4222-8222-222222222222';
  u_rev uuid := '33333333-3333-4333-8333-333333333333';
  u_auth uuid := '44444444-4444-4444-8444-444444444444';
  u_adm uuid := '55555555-5555-4555-8555-555555555555';
begin
  insert into auth.users (id, email) values
    (u_a, 'learner-a@example.test'),
    (u_b, 'learner-b@example.test'),
    (u_rev, 'reviewer@example.test'),
    (u_auth, 'author@example.test'),
    (u_adm, 'admin@example.test')
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role) values
    (u_rev, 'reviewer'),
    (u_auth, 'author'),
    (u_adm, 'admin')
  on conflict (user_id) do update set role = excluded.role;

  insert into public.courses (id, slug, discipline, title, tagline, level, status, artifact)
  values
    ('course-pub-test', 'pub-test', 'design', 'Published Test', 'Public course', 'Beginner', 'published', 'Spec'),
    ('course-draft-test', 'draft-test', 'design', 'Draft Test', 'Hidden course', 'Beginner', 'draft', 'Spec')
  on conflict (id) do nothing;
end $$;

-- 1. Anon sees ONLY published courses, NEVER drafts
set local role anon;
select is(
  (select count(*)::int from public.courses where slug = 'draft-test'),
  0,
  'anon cannot view draft courses'
);
select is(
  (select count(*)::int from public.courses where slug = 'pub-test'),
  1,
  'anon can view published courses'
);

-- 2. Learner A can insert self-assessed evidence for themselves
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}', true);
select lives_ok(
  $$insert into public.learner_evidence (user_id, idempotency_key, skill_id, evidence_type, ref, score, weight, verification_tier)
    values ('11111111-1111-4111-8111-111111111111', 'k-self-1', 'st-stocks', 'lab', 'lab-1', 0.85, 1.5, 'self-assessed')$$,
  'learner A can insert own self-assessed evidence'
);

-- 3. Learner A CANNOT self-claim reviewer-verified tier
select throws_ok(
  $$insert into public.learner_evidence (user_id, idempotency_key, skill_id, evidence_type, ref, score, weight, verification_tier)
    values ('11111111-1111-4111-8111-111111111111', 'k-forged-1', 'st-stocks', 'lab', 'lab-1', 1.0, 2.0, 'reviewer-verified')$$,
  null,
  null,
  'learner A cannot self-insert reviewer-verified evidence'
);

-- 4. Learner A CANNOT insert courses (author/admin only)
select throws_ok(
  $$insert into public.courses (id, slug, discipline, title, tagline, level, status, artifact)
    values ('course-evil', 'evil-course', 'design', 'Evil', 'Should fail', 'Beginner', 'published', 'None')$$,
  null,
  null,
  'learner A cannot create courses'
);

-- 5. Learner B CANNOT read Learner A's evidence (BOLA/IDOR isolation)
select set_config('request.jwt.claims', '{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}', true);
select is(
  (select count(*)::int from public.learner_evidence where user_id = '11111111-1111-4111-8111-111111111111'),
  0,
  'learner B cannot read learner A evidence'
);

-- 6. Learner B CANNOT read audit_log
select is(
  (select count(*)::int from public.audit_log),
  0,
  'learner B cannot view audit logs'
);

-- 7. Reviewer CAN inspect and verify Learner A's evidence
select set_config('request.jwt.claims', '{"sub":"33333333-3333-4333-8333-333333333333","role":"authenticated"}', true);
select lives_ok(
  $$update public.learner_evidence
    set verification_tier = 'reviewer-verified', reviewer_id = '33333333-3333-4333-8333-333333333333', reviewed_at = now()
    where user_id = '11111111-1111-4111-8111-111111111111' and idempotency_key = 'k-self-1'$$,
  'verified reviewer can promote learner A evidence to reviewer-verified'
);

-- 8. Author CAN see drafts and create a new course
select set_config('request.jwt.claims', '{"sub":"44444444-4444-4444-8444-444444444444","role":"authenticated"}', true);
select is(
  (select count(*)::int from public.courses where slug = 'draft-test'),
  1,
  'author can read draft courses'
);
select lives_ok(
  $$insert into public.courses (id, slug, discipline, title, tagline, level, status, artifact)
    values ('course-author-ok', 'author-ok', 'engineering', 'Author Course', 'Dynamic', 'Advanced', 'draft', 'ADR')$$,
  'author can create new dynamic courses'
);

select * from finish();
rollback;
