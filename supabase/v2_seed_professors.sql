-- ============================================================
-- OPTIONAL: extra professor accounts (so Evaluare Profesori shows
-- several professors). Creates real auth.users via SQL.
--
-- Run SEPARATELY from v2_seed.sql (run this on its own) — if your
-- Supabase version rejects direct auth.users inserts, it fails in
-- isolation without affecting the rest of the seed. You can instead
-- add professors through the admin UI once the create-user function
-- is deployed.
--
-- Each professor logs in with password: profesor123
-- They teach some of the student's PAST/other courses, so they appear
-- in Evaluare Profesori alongside Ion Popescu (who keeps the 5 current
-- courses for grading/exams).
-- ============================================================

do $$
declare
  profs jsonb := '[
    {"id":"aa000000-0000-0000-0000-000000000002","email":"andreea.vasilescu@ubbcluj.ro","full_name":"Vasilescu Andreea","rank":"Profesor","hon":"dr.","courses":["c2010000-0000-0000-0000-000000000001","c2010000-0000-0000-0000-000000000004"]},
    {"id":"aa000000-0000-0000-0000-000000000003","email":"mihai.dumitrescu@ubbcluj.ro","full_name":"Dumitrescu Mihai","rank":"Lector","hon":"dr.","courses":["c1010000-0000-0000-0000-000000000001","c1010000-0000-0000-0000-000000000002"]},
    {"id":"aa000000-0000-0000-0000-000000000004","email":"carmen.stanescu@ubbcluj.ro","full_name":"Stănescu Carmen","rank":"Conferențiar","hon":"dr. habil.","courses":["c1020000-0000-0000-0000-000000000001","c1020000-0000-0000-0000-000000000002"]}
  ]'::jsonb;
  p jsonb;
  pid uuid;
  prof_role_id uuid;
  cid text;
  tokens text[];
begin
  select id into prof_role_id from public.roles where name = 'profesor';

  for p in select * from jsonb_array_elements(profs) loop
    pid := (p->>'id')::uuid;
    tokens := regexp_split_to_array(p->>'full_name', '\s+');

    -- auth user
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      '00000000-0000-0000-0000-000000000000', pid, 'authenticated', 'authenticated',
      p->>'email', extensions.crypt('profesor123', extensions.gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}', '{}',
      '', '', '', ''
    ) on conflict (id) do nothing;

    -- identity
    insert into auth.identities (
      provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
    ) values (
      pid::text, pid,
      jsonb_build_object('sub', pid::text, 'email', p->>'email'),
      'email', now(), now(), now()
    ) on conflict do nothing;

    -- profile
    insert into public.profiles (id, full_name, short_name, initials, email, faculty, academic_rank, honorifics)
    values (
      pid, p->>'full_name',
      left(tokens[1], 1) || '. ' || array_to_string(tokens[2:], ' '),
      upper(left(tokens[1],1) || left(coalesce(tokens[2],''),1)),
      p->>'email', 'Matematică și Informatică', p->>'rank', p->>'hon'
    ) on conflict (id) do update
      set full_name = excluded.full_name,
          academic_rank = excluded.academic_rank,
          honorifics = excluded.honorifics;

    -- primary role: profesor
    insert into public.user_roles (user_id, role_id, is_primary)
    values (pid, prof_role_id, true)
    on conflict (user_id, role_id) do nothing;

    -- course assignments
    for cid in select jsonb_array_elements_text(p->'courses') loop
      insert into public.professor_courses (professor_id, course_id, type, student_count, study_year_label)
      values (pid, cid::uuid, 'CURS + LAB', 25, 'Anul I-II')
      on conflict do nothing;
    end loop;
  end loop;
end $$;
