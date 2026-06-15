-- ============================================================
-- True anonymity for professor evaluations.
-- Admins read evaluations through a function that NEVER returns
-- student_id, and lose direct SELECT access to the raw table.
-- Run once in the Supabase SQL editor (after v2_schema.sql).
-- ============================================================

-- 1. Remove admin's direct read of the raw table (which exposed student_id)
drop policy if exists "eval_admin_select" on public.professor_evaluations;

-- 2. Anonymized accessor — only admins get rows, and student_id is omitted.
create or replace function public.admin_professor_evaluations()
returns table (
  professor_id uuid,
  course_id    uuid,
  ratings      jsonb,
  comment      text,
  created_at   timestamptz
)
language sql
security definer
stable
set search_path = public
as $$
  select e.professor_id, e.course_id, e.ratings, e.comment, e.created_at
  from public.professor_evaluations e
  where public.is_admin()
$$;

grant execute on function public.admin_professor_evaluations() to authenticated;

-- Students keep full read/write of their OWN evaluations (eval_student_rw policy).
