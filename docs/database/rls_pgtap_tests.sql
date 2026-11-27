-- ============================================================================
-- pgTAP Positive & Negative Row-Level Security (RLS) Test Suite
-- ============================================================================
-- Run against a Supabase / PostgreSQL database with pgTAP enabled:
--   supabase test db
-- Verifies strict tenant isolation, verification-tier integrity, draft hiding,
-- and role-based access control across anon, learner A/B, reviewer, author, admin.
-- ============================================================================

begin;
select plan(12);

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
  $insert into public.courses (id, slug, discipline, title, tagline, level, status, artifact)
    values ('course-author-ok', 'author-ok', 'engineering', 'Author Course', 'Dynamic', 'Advanced', 'draft', 'ADR')$,
  'author can create new dynamic courses'
);

-- 9. JSON-backed lesson competency links prevent deleting a referenced competency
insert into public.curriculum_competencies
  (id, code, domain, title, blurb, definition, bloom_target, level_descriptors_json)
values
  ('ref-check', 'SE-REF-01', 'design', 'Reference Check', 'Reference test', 'A test competency for referential integrity.', 'analyze', '[]'::jsonb);

insert into public.course_modules (id, course_id, slug, title, summary, sort_order)
values ('module-ref', 'course-author-ok', 'reference-module', 'Reference Module', 'Module for FK test', 10);

insert into public.course_lessons
  (id, module_id, course_id, slug, title, summary, minutes, skill_ids_json, blocks_json, status, sort_order)
values
  ('lesson-ref', 'module-ref', 'course-author-ok', 'reference-lesson', 'Reference Lesson', 'Lesson references competency', 10, '["ref-check"]'::jsonb, '[]'::jsonb, 'draft', 10);

select throws_ok(
  $delete from public.curriculum_competencies where id = 'ref-check'$,
  '23503',
  'Competency ref-check is referenced by a course lesson.',
  'author cannot delete competency used by a lesson'
);

-- 10. Scalar lab competency links are protected by a real PostgreSQL foreign key
insert into public.curriculum_competencies
  (id, code, domain, title, blurb, definition, bloom_target, level_descriptors_json)
values
  ('lab-ref', 'SE-REF-02', 'design', 'Lab Reference', 'Reference test', 'A competency referenced by a lab.', 'analyze', '[]'::jsonb);

insert into public.curriculum_labs
  (id, discipline, skill_id, title, brief, minutes, steps_json, twist, artifact, evidence_type, rubric_json, status, sort_order)
values
  ('lab-ref-test', 'design', 'lab-ref', 'Lab FK Test', 'A lab for FK verification.', 10, '[]'::jsonb, 'A constraint change.', 'Test artifact.', 'lab', '{}'::jsonb, 'draft', 10);

select throws_ok(
  $delete from public.curriculum_competencies where id = 'lab-ref'$,
  '23503',
  null,
  'author cannot delete competency used by a lab'
);

select * from finish();
rollback;
