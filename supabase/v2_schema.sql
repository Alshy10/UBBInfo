-- ============================================================
-- UBB Info — v2 schema migration
-- Run once in the Supabase SQL editor BEFORE v2_seed.sql.
-- Safe to re-run (idempotent: IF NOT EXISTS + drop/create policies).
--
-- Adds: academic calendar + vacations, buildings + rooms,
-- orar room/semigroup, professor rank/honorifics, exam scheduling
-- (kinds + session + room), exam registrations, professor evaluations.
-- Plus RLS for students / professors / admins.
-- Requires helper functions is_admin()/teaches_course() from grades_admin.sql.
-- ============================================================

-- ---------- helper: is the caller this student? (trivial, but kept for symmetry)
-- (none needed; students use auth.uid() directly)

-- ============================================================
-- 1. Academic calendar
-- ============================================================
create table if not exists public.semester_config (
  id           uuid primary key default gen_random_uuid(),
  academic_year text not null,
  semester      int  not null check (semester in (1, 2)),
  start_date    date not null,
  end_date      date,
  unique (academic_year, semester)
);

create table if not exists public.vacations (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  start_date date not null,
  end_date   date not null
);

alter table public.semester_config enable row level security;
alter table public.vacations       enable row level security;

drop policy if exists "semcfg_select_all" on public.semester_config;
create policy "semcfg_select_all" on public.semester_config
  for select to authenticated using (true);
drop policy if exists "semcfg_admin_write" on public.semester_config;
create policy "semcfg_admin_write" on public.semester_config
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "vac_select_all" on public.vacations;
create policy "vac_select_all" on public.vacations
  for select to authenticated using (true);
drop policy if exists "vac_admin_write" on public.vacations;
create policy "vac_admin_write" on public.vacations
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- 2. Buildings & rooms
-- ============================================================
create table if not exists public.buildings (
  id      uuid primary key default gen_random_uuid(),
  code    text unique not null,
  name    text not null,
  address text,
  sort_order int default 100
);

create table if not exists public.rooms (
  id          uuid primary key default gen_random_uuid(),
  building_id uuid references public.buildings(id) on delete cascade,
  code        text not null,
  note        text,        -- e.g. 'Lab IoT'
  location    text,        -- floor / extra detail
  unique (building_id, code)
);

alter table public.buildings enable row level security;
alter table public.rooms     enable row level security;

drop policy if exists "buildings_select_all" on public.buildings;
create policy "buildings_select_all" on public.buildings
  for select to authenticated using (true);
drop policy if exists "buildings_admin_write" on public.buildings;
create policy "buildings_admin_write" on public.buildings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "rooms_select_all" on public.rooms;
create policy "rooms_select_all" on public.rooms
  for select to authenticated using (true);
drop policy if exists "rooms_admin_write" on public.rooms;
create policy "rooms_admin_write" on public.rooms
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- 3. Orar additions: room reference + semigroup
-- ============================================================
alter table public.orar add column if not exists room_id   uuid references public.rooms(id);
alter table public.orar add column if not exists semigroup text;

-- Admin can fully manage the timetable (SELECT already authenticated from orar.sql)
drop policy if exists "orar_admin_write" on public.orar;
create policy "orar_admin_write" on public.orar
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- 4. Professor profile fields
-- ============================================================
alter table public.profiles add column if not exists academic_rank text;  -- doctorand/asistent/lector/conferentiar/profesor
alter table public.profiles add column if not exists honorifics    text;  -- e.g. 'dr. habil.'

-- ============================================================
-- 5. Exams redesign
-- ============================================================
alter table public.exams add column if not exists session_type text default 'vara';   -- vara / iarna / restante
alter table public.exams add column if not exists kind         text default 'principal'; -- principal / secundar / restanta_marire
alter table public.exams add column if not exists room_id      uuid references public.rooms(id);

-- exams: SELECT already authenticated (original schema). Add professor + admin write.
drop policy if exists "prof_manage_exams" on public.exams;
create policy "prof_manage_exams" on public.exams
  for all to authenticated
  using (professor_id = auth.uid() and public.teaches_course(course_id))
  with check (professor_id = auth.uid() and public.teaches_course(course_id));

drop policy if exists "admin_manage_exams" on public.exams;
create policy "admin_manage_exams" on public.exams
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- 6. Exam registrations (student picks principal/secundar per course)
-- ============================================================
create table if not exists public.exam_registrations (
  id         uuid primary key default gen_random_uuid(),
  student_id uuid not null,
  exam_id    uuid not null references public.exams(id) on delete cascade,
  course_id  uuid not null references public.courses(id),
  created_at timestamptz default now(),
  unique (student_id, course_id)   -- one registration per course
);

alter table public.exam_registrations enable row level security;

drop policy if exists "examreg_student_rw" on public.exam_registrations;
create policy "examreg_student_rw" on public.exam_registrations
  for all to authenticated
  using (student_id = auth.uid()) with check (student_id = auth.uid());

drop policy if exists "examreg_admin_select" on public.exam_registrations;
create policy "examreg_admin_select" on public.exam_registrations
  for select to authenticated using (public.is_admin());

-- Professors can see who registered for their exams
drop policy if exists "examreg_prof_select" on public.exam_registrations;
create policy "examreg_prof_select" on public.exam_registrations
  for select to authenticated using (public.teaches_course(course_id));

-- ============================================================
-- 7. Professor evaluations
-- ============================================================
create table if not exists public.professor_evaluations (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null,
  professor_id uuid not null,
  course_id    uuid references public.courses(id),
  ratings      jsonb not null,   -- { "criterion_key": 1..5 }
  comment      text,
  created_at   timestamptz default now(),
  unique (student_id, professor_id, course_id)
);

alter table public.professor_evaluations enable row level security;

drop policy if exists "eval_student_rw" on public.professor_evaluations;
create policy "eval_student_rw" on public.professor_evaluations
  for all to authenticated
  using (student_id = auth.uid()) with check (student_id = auth.uid());

drop policy if exists "eval_admin_select" on public.professor_evaluations;
create policy "eval_admin_select" on public.professor_evaluations
  for select to authenticated using (public.is_admin());
