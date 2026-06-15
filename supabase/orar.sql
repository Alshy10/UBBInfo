-- ============================================================
-- Orar (timetable) — run this in the Supabase SQL editor.
-- Creates the table, enables RLS, and seeds a sample weekly
-- schedule for group '221/1'. Safe to re-run (it re-seeds 221/1).
-- ============================================================

-- 1. Table -----------------------------------------------------
create table if not exists public.orar (
  id          uuid primary key default gen_random_uuid(),
  group_name  text not null,                 -- links to profiles.group_name (e.g. '221/1')
  day_of_week int  not null check (day_of_week between 1 and 7), -- 1=Luni … 7=Duminică
  start_time  time not null,
  end_time    time not null,
  course_name text not null,
  type        text not null check (type in ('CURS', 'SEMINAR', 'LABORATOR')),
  room        text,
  professor   text,
  week_parity text not null default 'saptamanal'
              check (week_parity in ('saptamanal', 'par', 'impar'))
);

create index if not exists orar_group_name_idx on public.orar (group_name);

-- 2. Row-level security ---------------------------------------
alter table public.orar enable row level security;

-- All authenticated users may read the timetable; the app filters
-- by the logged-in student's group_name.
drop policy if exists "orar_select_authenticated" on public.orar;
create policy "orar_select_authenticated"
  on public.orar
  for select
  to authenticated
  using (true);

-- 3. Seed: weekly schedule for group 221/1 --------------------
-- (re-runnable: clears this group's rows first)
delete from public.orar where group_name = '221/1';

insert into public.orar
  (group_name, day_of_week, start_time, end_time, course_name, type, room, professor, week_parity)
values
  -- Luni
  ('221/1', 1, '08:00', '10:00', 'Inteligență artificială',                'CURS',      'Sala A1', 'Prof. Dr. Ion Popescu',     'saptamanal'),
  ('221/1', 1, '10:00', '12:00', 'Programare web',                         'CURS',      'Sala A2', 'Conf. Dr. Maria Ionescu',   'saptamanal'),
  -- Marți
  ('221/1', 2, '12:00', '14:00', 'Sisteme de gestiune a bazelor de date',  'CURS',      'Sala C3', 'Lect. Dr. Andrei Pop',      'saptamanal'),
  ('221/1', 2, '14:00', '16:00', 'Inteligență artificială',                'LABORATOR', 'Lab 5',   'Asist. Dr. Elena Munteanu', 'par'),
  -- Miercuri
  ('221/1', 3, '08:00', '10:00', 'Medii de proiectare și programare',      'CURS',      'Sala A1', 'Conf. Dr. Radu Georgescu',  'saptamanal'),
  ('221/1', 3, '10:00', '12:00', 'Programare web',                         'LABORATOR', 'Lab 2',   'Asist. Dr. Dan Vasile',     'saptamanal'),
  -- Joi
  ('221/1', 4, '10:00', '12:00', 'Proiectare interfețe utilizator',        'CURS',      'Sala B2', 'Lect. Dr. Ana Florea',      'saptamanal'),
  ('221/1', 4, '12:00', '14:00', 'Sisteme de gestiune a bazelor de date',  'SEMINAR',   'Sala C1', 'Lect. Dr. Andrei Pop',      'impar'),
  -- Vineri
  ('221/1', 5, '08:00', '10:00', 'Medii de proiectare și programare',      'LABORATOR', 'Lab 3',   'Asist. Dr. Mihai Cristea',  'saptamanal'),
  ('221/1', 5, '10:00', '12:00', 'Proiectare interfețe utilizator',        'LABORATOR', 'Lab 4',   'Asist. Dr. Ana Florea',     'saptamanal');
