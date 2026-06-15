-- ============================================================
-- v2 fix: let students see who teaches their courses (for Evaluare).
-- Run once in the Supabase SQL editor (after v2_schema.sql).
-- ============================================================

-- 1. Course→professor assignments are not sensitive: any authenticated user
--    may read them. (Existing prof/admin policies remain; this OR-adds.)
drop policy if exists "pc_select_all" on public.professor_courses;
create policy "pc_select_all" on public.professor_courses
  for select to authenticated using (true);

-- 2. Safe, read-only view of professor identity — exposes ONLY non-sensitive
--    columns (no CNP/IBAN/address/phone). Runs as owner, so it bypasses the
--    profiles RLS but only reveals these columns, and only for professors.
create or replace view public.professors_public as
select
  p.id,
  p.full_name,
  p.short_name,
  p.initials,
  p.academic_rank,
  p.honorifics,
  p.faculty
from public.profiles p
where exists (
  select 1
  from public.user_roles ur
  join public.roles r on r.id = ur.role_id
  where ur.user_id = p.id and r.name = 'profesor'
);

grant select on public.professors_public to anon, authenticated;
