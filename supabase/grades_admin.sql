-- ============================================================
-- Professor grading + Admin dashboard support.
-- Run this once in the Supabase SQL editor (Database -> SQL Editor).
-- Safe to re-run.
--
-- Adds:
--   1. Seed: Prof. Ion Popescu teaches the 5 current-semester courses
--   2. Helper functions (SECURITY DEFINER -> avoid RLS recursion)
--   3. RLS so professors can read/grade enrollments of their courses
--   4. RLS so admins can read aggregate data + manage courses/links/roles
-- ============================================================

-- ------------------------------------------------------------
-- 1. Seed professor_courses for Ion Popescu
--    (f290cdcb-5a50-499f-a5ef-93fae3a497e6)
-- ------------------------------------------------------------
delete from public.professor_courses
where professor_id = 'f290cdcb-5a50-499f-a5ef-93fae3a497e6';

insert into public.professor_courses
  (professor_id, course_id, type, student_count, study_year_label)
values
  ('f290cdcb-5a50-499f-a5ef-93fae3a497e6', 'c2020000-0000-0000-0000-000000000001', 'CURS + LAB', 28, 'Anul II'), -- Inteligență artificială
  ('f290cdcb-5a50-499f-a5ef-93fae3a497e6', 'c2020000-0000-0000-0000-000000000002', 'CURS',       30, 'Anul II'), -- Medii de proiectare și programare
  ('f290cdcb-5a50-499f-a5ef-93fae3a497e6', 'c2020000-0000-0000-0000-000000000003', 'CURS + LAB', 28, 'Anul II'), -- Programare web
  ('f290cdcb-5a50-499f-a5ef-93fae3a497e6', 'c2020000-0000-0000-0000-000000000004', 'SEMINAR',    25, 'Anul II'), -- Sisteme de gestiune a bazelor de date
  ('f290cdcb-5a50-499f-a5ef-93fae3a497e6', 'c2020000-0000-0000-0000-000000000005', 'CURS',       26, 'Anul II'); -- Proiectare interfețe utilizator

-- ------------------------------------------------------------
-- 2. Helper functions
-- ------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from user_roles ur
    join roles r on r.id = ur.role_id
    where ur.user_id = auth.uid()
      and r.name = 'administrator'
  );
$$;

create or replace function public.teaches_course(cid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from professor_courses pc
    where pc.course_id = cid
      and pc.professor_id = auth.uid()
  );
$$;

create or replace function public.can_view_student(pid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from enrollments e
    join professor_courses pc on pc.course_id = e.course_id
    where e.student_id = pid
      and pc.professor_id = auth.uid()
  );
$$;

-- ------------------------------------------------------------
-- 3. Professor RLS — read + grade enrollments of own courses,
--    read profiles of students in those courses
-- ------------------------------------------------------------
drop policy if exists "prof_select_enrollments" on public.enrollments;
create policy "prof_select_enrollments"
  on public.enrollments for select to authenticated
  using (public.teaches_course(course_id));

drop policy if exists "prof_update_enrollments" on public.enrollments;
create policy "prof_update_enrollments"
  on public.enrollments for update to authenticated
  using (public.teaches_course(course_id))
  with check (public.teaches_course(course_id));

drop policy if exists "prof_select_student_profiles" on public.profiles;
create policy "prof_select_student_profiles"
  on public.profiles for select to authenticated
  using (public.can_view_student(id));

-- ------------------------------------------------------------
-- 4. Admin RLS
-- ------------------------------------------------------------
-- profiles: read all + edit
drop policy if exists "admin_select_profiles" on public.profiles;
create policy "admin_select_profiles"
  on public.profiles for select to authenticated using (public.is_admin());
drop policy if exists "admin_update_profiles" on public.profiles;
create policy "admin_update_profiles"
  on public.profiles for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- user_roles: read all + assign/remove
drop policy if exists "admin_select_user_roles" on public.user_roles;
create policy "admin_select_user_roles"
  on public.user_roles for select to authenticated using (public.is_admin());
drop policy if exists "admin_insert_user_roles" on public.user_roles;
create policy "admin_insert_user_roles"
  on public.user_roles for insert to authenticated with check (public.is_admin());
drop policy if exists "admin_delete_user_roles" on public.user_roles;
create policy "admin_delete_user_roles"
  on public.user_roles for delete to authenticated using (public.is_admin());

-- enrollments: read all (for stats)
drop policy if exists "admin_select_enrollments" on public.enrollments;
create policy "admin_select_enrollments"
  on public.enrollments for select to authenticated using (public.is_admin());

-- professor_courses: read all (for stats)
drop policy if exists "admin_select_professor_courses" on public.professor_courses;
create policy "admin_select_professor_courses"
  on public.professor_courses for select to authenticated using (public.is_admin());

-- courses: manage (SELECT already world-readable)
drop policy if exists "admin_insert_courses" on public.courses;
create policy "admin_insert_courses"
  on public.courses for insert to authenticated with check (public.is_admin());
drop policy if exists "admin_update_courses" on public.courses;
create policy "admin_update_courses"
  on public.courses for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin_delete_courses" on public.courses;
create policy "admin_delete_courses"
  on public.courses for delete to authenticated using (public.is_admin());

-- useful_links: manage (SELECT already world-readable)
drop policy if exists "admin_insert_links" on public.useful_links;
create policy "admin_insert_links"
  on public.useful_links for insert to authenticated with check (public.is_admin());
drop policy if exists "admin_update_links" on public.useful_links;
create policy "admin_update_links"
  on public.useful_links for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin_delete_links" on public.useful_links;
create policy "admin_delete_links"
  on public.useful_links for delete to authenticated using (public.is_admin());
