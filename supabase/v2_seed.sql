-- ============================================================
-- UBB Info — v2 seed data
-- Run AFTER v2_schema.sql (and after grades_admin.sql / orar.sql).
-- Idempotent: clears the data it owns, then re-inserts.
-- ============================================================

-- ---- clear dependents that reference rooms/exams (so we can re-seed) ----
delete from public.exam_registrations;
delete from public.exams;
delete from public.orar where coalesce(semigroup, group_name) in ('221/1', '221/2');
delete from public.rooms;
delete from public.buildings;

-- ============================================================
-- Buildings (CS-relevant first via sort_order)
-- 'Cladirea' stripped from FSEGA / Mathematica per request.
-- ============================================================
insert into public.buildings (code, name, address, sort_order) values
  ('FSEGA',      'FSEGA',                       'str. Teodor Mihali, nr. 58-60', 1),
  ('MATH',       'Mathematica',                 'str. Ploiești, nr. 23-25',      2),
  ('CENTRAL',    'Clădirea Centrală UBB',       'str. Mihail Kogălniceanu, nr. 1', 3),
  ('FIZICA',     'Facultatea de Fizică',        'str. Mihail Kogălniceanu, nr. 1 (Clădirea Centrală)', 4),
  ('NTT',        'NTT Data',                    'str. Constanța, nr. 19-21',     5),
  ('CANTEMIR',   'Universitatea Dimitrie Cantemir', 'str. Teodor Mihali, nr. 56', 6),
  ('AVRAM',      'Clădirea Avram Iancu',        'str. Avram Iancu',              10),
  ('CHIMIE',     'Facultatea de Chimie',        'str. Arany János, nr. 11',      11),
  ('DPPD',       'DPPD',                        'Departamentul pentru Pregătirea Personalului Didactic', 12),
  ('ISTORIE',    'Facultatea de Istorie și Filosofie', 'str. Napoca / str. Moților, nr. 11', 13),
  ('LITERE',     'Facultatea de Litere',        'str. Horea, nr. 31',            14),
  ('PSIH',       'Facultatea de Psihologie',    'str. Sindicatelor, nr. 7',      15),
  ('STEUR',      'Facultatea de Studii Europene', 'str. Avram Iancu, nr. 19',    16),
  ('OBS',        'Observatorul Astronomic',     'str. Cireșilor',                17),
  ('CODESPRING', 'Codespring',                  'Sediul firmei Codespring',      18),
  ('MHP',        'MHP',                         'Sediu MHP',                     19),
  ('ALTELE',     'Altele',                      '—',                             99);

-- ============================================================
-- Rooms (sorted per building; notes added where useful)
-- ============================================================
insert into public.rooms (building_id, code, note, location)
select b.id, r.code, r.note, r.location
from (values
  -- FSEGA
  ('FSEGA','C036', null, 'Parter'),
  ('FSEGA','C310', null, 'Etaj 3'),
  ('FSEGA','C335', null, 'Etaj 3'),
  ('FSEGA','C510', null, 'Etaj 5'),
  ('FSEGA','C512', null, 'Etaj 5'),
  ('FSEGA','L001', null, 'Demisol'),
  ('FSEGA','L002', null, 'Demisol'),
  ('FSEGA','L320', null, 'Etaj 3'),
  ('FSEGA','L321', null, 'Etaj 3'),
  ('FSEGA','L336', null, 'Etaj 3'),
  ('FSEGA','L338', null, 'Etaj 3'),
  ('FSEGA','L402', null, 'Etaj 4'),
  ('FSEGA','L404', 'Lab IoT', 'Etaj 4'),
  ('FSEGA','L439', null, 'Etaj 4'),
  ('FSEGA','S01',  null, 'Demisol'),
  -- Mathematica
  ('MATH','e',          null, 'Etaj 1'),
  ('MATH','gamma',      null, null),
  ('MATH','lambda',     null, null),
  ('MATH','Multimedia', null, null),
  ('MATH','pi',         null, 'Parter'),
  -- Clădirea Centrală UBB
  ('CENTRAL','2/I',        'Sala Nicolae Iorga',      'Etaj 1'),
  ('CENTRAL','5/I',        'Sala Tiberiu Popoviciu',  'Etaj 2'),
  ('CENTRAL','6/II',       'Sala Gheorghe Călugăreanu','Etaj 2'),
  ('CENTRAL','7/I',        'Sala D.V. Ionescu',       'Etaj 1'),
  ('CENTRAL','9/I',        null,                      'Etaj 1'),
  ('CENTRAL','Ist_Blaga',  'Sala Blaga',              'Etaj 2'),
  ('CENTRAL','Ist_Goanga', 'Sala Goanga',            'Etaj 2'),
  ('CENTRAL','Ist_Rosca',  'Sala Roșca',              'Etaj 2'),
  ('CENTRAL','MOS-S15',    'Centrul MOS, S15',        'Demisol'),
  ('CENTRAL','MOS-S16',    'Centrul MOS, S16',        'Demisol'),
  -- Facultatea de Fizică
  ('FIZICA','242',        'Sala Fizică',          'Etaj 2'),
  ('FIZICA','AAM',        'Amf. Augustin Maior',  'Etaj 2'),
  ('FIZICA','AVM',        'Amf. Victor Marian',   'Etaj 2'),
  ('FIZICA','Fizica-215', 'Laborator 215',        null),
  ('FIZICA','Fizica-233', 'Laborator 233',        null),
  -- NTT Data
  ('NTT','NTTSocrate', 'Amf. Socrate',          'Parter'),
  ('NTT','Platon',     'Sala seminar Platon',   'Parter'),
  ('NTT','Saturn',     'Sala laborator Saturn', 'Parter'),
  -- Dimitrie Cantemir
  ('CANTEMIR','DC401', null, 'Etaj 4'),
  ('CANTEMIR','DC402', null, 'Etaj 4'),
  ('CANTEMIR','DC403', null, 'Etaj 4'),
  ('CANTEMIR','DC404', null, 'Etaj 4'),
  ('CANTEMIR','DC405', null, 'Etaj 4'),
  ('CANTEMIR','DC501', null, 'Etaj 5'),
  ('CANTEMIR','DC502', null, 'Etaj 5'),
  ('CANTEMIR','DC503', null, 'Etaj 5'),
  ('CANTEMIR','DC504', null, 'Etaj 5'),
  ('CANTEMIR','DC505', null, 'Etaj 5'),
  -- Avram Iancu
  ('AVRAM','A310', null, 'Etaj 3'),
  ('AVRAM','A311', null, 'Etaj 3'),
  ('AVRAM','A312', null, 'Etaj 3'),
  ('AVRAM','A313', null, 'Etaj 3'),
  ('AVRAM','A314', null, 'Etaj 3'),
  -- Chimie
  ('CHIMIE','Chimie204', 'Laborator 204', null),
  ('CHIMIE','Chimie88',  'Sala curs 88',  null),
  -- DPPD
  ('DPPD','DPPD-204',  'Sala 204',  null),
  ('DPPD','DPPD-205',  'Sala 205',  null),
  ('DPPD','DPPD-306',  'Sala 306',  null),
  ('DPPD','DPPD-A307', 'Sala A307', null),
  -- Istorie
  ('ISTORIE','Ist_Vatasianau', 'Sala Vătășianu (Echinox)', null),
  ('ISTORIE','Ist_406',        'Sala curs 406',            null),
  ('ISTORIE','Ist_407',        'Sala curs 407',            null),
  -- Litere
  ('LITERE','Lit-302',      'Sala 302',    null),
  ('LITERE','Lit-Puskin',   'Sala Pușkin', null),
  ('LITERE','Litere_11',    'Sala 11',     null),
  ('LITERE','Litere_Auger', 'Sala Auger',  null),
  ('LITERE','Litere_Blaga', 'Sala Blaga',  null),
  ('LITERE','Litere_Cosbuc','Sala Coșbuc', null),
  ('LITERE','Litere_Lenau', 'Sala Lenau',  null),
  -- Psihologie
  ('PSIH','Ionascu', 'Sala Ionașcu',         'str. Avram Iancu, nr. 11'),
  ('PSIH','KuTi',    'Amf. Kulcsár Tibor',   'str. Sindicatelor, nr. 7'),
  -- Studii Europene
  ('STEUR','StEur_103',       'Sala 103',         null),
  ('STEUR','StEur_104',       'Sala 104',         null),
  ('STEUR','StEur_105',       'Sala 105',         null),
  ('STEUR','StEur_Ferdinand', 'Sala Ferdinand',   'str. Brătianu, nr. 22'),
  ('STEUR','StEur_Jmonnet',   'Sala Jean Monnet', 'str. Martonne, nr. 1'),
  ('STEUR','StEur_Lovinescu', 'Sala Lovinescu',   null),
  ('STEUR','StEur_Margineanu','Sala Mărgineanu',  null),
  ('STEUR','StEur_Sveil',     'Sala Simone Veil', 'str. Martonne, nr. 1'),
  -- Observator
  ('OBS','Obs', 'Observatorul Astronomic', null),
  -- Codespring
  ('CODESPRING','Codespring1', 'Sediul Codespring', null),
  ('CODESPRING','Codespring2', 'Sediul Codespring', null),
  -- MHP
  ('MHP','Sala-MHP', 'Sediu MHP', null),
  -- Altele
  ('ALTELE','Virtual',    'Online',            null),
  ('ALTELE','Catedra',    'Birou îndrumător',  null),
  ('ALTELE','neprecizat', 'Neprecizat',        null)
) as r(bcode, code, note, location)
join public.buildings b on b.code = r.bcode;

-- ============================================================
-- Academic calendar: 2025-2026 sem 2 (current) + next year start
-- ============================================================
delete from public.semester_config where academic_year in ('2025-2026', '2026-2027');
insert into public.semester_config (academic_year, semester, start_date, end_date) values
  ('2025-2026', 2, '2026-02-23', '2026-06-26'),
  ('2026-2027', 1, '2026-09-28', '2027-01-22');

delete from public.vacations;
insert into public.vacations (name, start_date, end_date) values
  ('Vacanța de Paște',    '2026-04-13', '2026-04-19'),
  ('1 Mai',               '2026-05-01', '2026-05-01'),
  ('Vacanța de iarnă',    '2026-12-21', '2027-01-04');

-- ============================================================
-- Orar per semigroup (221/1 and 221/2), now with room_id
-- ============================================================
-- helper for room id by code
-- (codes are effectively unique across buildings)
with rid as (select code, id from public.rooms)
insert into public.orar
  (group_name, semigroup, day_of_week, start_time, end_time, course_name, type, room, professor, week_parity, room_id)
select v.group_name, v.semigroup, v.day_of_week, v.start_time::time, v.end_time::time,
       v.course_name, v.type, v.room, v.professor, v.week_parity, rid.id
from (values
  -- ===== 221/1 =====
  ('221/1','221/1',1,'08:00','10:00','Inteligență artificială',               'CURS',     'C310','Conf. dr. habil. Ion Popescu','saptamanal','C310'),
  ('221/1','221/1',1,'10:00','12:00','Programare web',                        'CURS',     'C335','Conf. Dr. Maria Ionescu',     'saptamanal','C335'),
  ('221/1','221/1',2,'12:00','14:00','Sisteme de gestiune a bazelor de date', 'CURS',     'C510','Lect. Dr. Andrei Pop',        'saptamanal','C510'),
  ('221/1','221/1',2,'14:00','16:00','Inteligență artificială',               'LABORATOR','L404','Asist. Dr. Elena Munteanu',   'par',       'L404'),
  ('221/1','221/1',3,'08:00','10:00','Medii de proiectare și programare',     'CURS',     'C310','Conf. Dr. Radu Georgescu',    'saptamanal','C310'),
  ('221/1','221/1',3,'10:00','12:00','Programare web',                        'LABORATOR','L320','Asist. Dr. Dan Vasile',       'saptamanal','L320'),
  ('221/1','221/1',4,'10:00','12:00','Proiectare interfețe utilizator',       'CURS',     'pi',  'Lect. Dr. Ana Florea',        'saptamanal','pi'),
  ('221/1','221/1',4,'12:00','14:00','Sisteme de gestiune a bazelor de date', 'SEMINAR',  'S01', 'Lect. Dr. Andrei Pop',        'impar',     'S01'),
  ('221/1','221/1',5,'08:00','10:00','Medii de proiectare și programare',     'LABORATOR','L321','Asist. Dr. Mihai Cristea',    'saptamanal','L321'),
  ('221/1','221/1',5,'10:00','12:00','Proiectare interfețe utilizator',       'LABORATOR','L336','Asist. Dr. Ana Florea',       'saptamanal','L336'),
  -- ===== 221/2 =====
  ('221/2','221/2',1,'08:00','10:00','Inteligență artificială',               'CURS',     'C310','Conf. dr. habil. Ion Popescu','saptamanal','C310'),
  ('221/2','221/2',1,'10:00','12:00','Programare web',                        'CURS',     'C335','Conf. Dr. Maria Ionescu',     'saptamanal','C335'),
  ('221/2','221/2',2,'12:00','14:00','Sisteme de gestiune a bazelor de date', 'CURS',     'C510','Lect. Dr. Andrei Pop',        'saptamanal','C510'),
  ('221/2','221/2',2,'16:00','18:00','Inteligență artificială',               'LABORATOR','L402','Asist. Dr. Elena Munteanu',   'par',       'L402'),
  ('221/2','221/2',3,'08:00','10:00','Medii de proiectare și programare',     'CURS',     'C310','Conf. Dr. Radu Georgescu',    'saptamanal','C310'),
  ('221/2','221/2',3,'12:00','14:00','Programare web',                        'LABORATOR','L321','Asist. Dr. Dan Vasile',       'saptamanal','L321'),
  ('221/2','221/2',4,'10:00','12:00','Proiectare interfețe utilizator',       'CURS',     'pi',  'Lect. Dr. Ana Florea',        'saptamanal','pi'),
  ('221/2','221/2',4,'14:00','16:00','Sisteme de gestiune a bazelor de date', 'SEMINAR',  'L001','Lect. Dr. Andrei Pop',        'impar',     'L001'),
  ('221/2','221/2',5,'08:00','10:00','Medii de proiectare și programare',     'LABORATOR','L336','Asist. Dr. Mihai Cristea',    'saptamanal','L336'),
  ('221/2','221/2',5,'12:00','14:00','Proiectare interfețe utilizator',       'LABORATOR','L404','Asist. Dr. Ana Florea',       'saptamanal','L404')
) as v(group_name, semigroup, day_of_week, start_time, end_time, course_name, type, room, professor, week_parity, rcode)
left join rid on rid.code = v.rcode;

-- ============================================================
-- Exams for the 5 current-semester courses (sesiune vară).
-- Each course: principal + secundar + restanță/mărire. Examiner = Ion Popescu.
-- ============================================================
insert into public.exams
  (course_id, professor_id, exam_date, exam_time, room, enrolled_count, session_type, kind, room_id)
select v.course_id::uuid, 'f290cdcb-5a50-499f-a5ef-93fae3a497e6'::uuid,
       v.exam_date::date, v.exam_time::time, v.room, v.enrolled_count,
       v.session_type, v.kind, rid.id
from (values
  -- Inteligență artificială
  ('c2020000-0000-0000-0000-000000000001','2026-06-16','09:00','C510',28,'vara','principal','C510'),
  ('c2020000-0000-0000-0000-000000000001','2026-06-23','09:00','C510',28,'vara','secundar','C510'),
  ('c2020000-0000-0000-0000-000000000001','2026-09-01','10:00','C310',28,'restante','restanta_marire','C310'),
  -- Medii de proiectare și programare
  ('c2020000-0000-0000-0000-000000000002','2026-06-18','09:00','C335',30,'vara','principal','C335'),
  ('c2020000-0000-0000-0000-000000000002','2026-06-25','09:00','C335',30,'vara','secundar','C335'),
  ('c2020000-0000-0000-0000-000000000002','2026-09-02','10:00','C310',30,'restante','restanta_marire','C310'),
  -- Programare web
  ('c2020000-0000-0000-0000-000000000003','2026-06-17','12:00','L404',28,'vara','principal','L404'),
  ('c2020000-0000-0000-0000-000000000003','2026-06-24','12:00','L404',28,'vara','secundar','L404'),
  ('c2020000-0000-0000-0000-000000000003','2026-09-01','12:00','L320',28,'restante','restanta_marire','L320'),
  -- Sisteme de gestiune a bazelor de date
  ('c2020000-0000-0000-0000-000000000004','2026-06-19','09:00','C510',25,'vara','principal','C510'),
  ('c2020000-0000-0000-0000-000000000004','2026-06-26','09:00','C510',25,'vara','secundar','C510'),
  ('c2020000-0000-0000-0000-000000000004','2026-09-03','10:00','C310',25,'restante','restanta_marire','C310'),
  -- Proiectare interfețe utilizator
  ('c2020000-0000-0000-0000-000000000005','2026-06-22','11:00','pi',  26,'vara','principal','pi'),
  ('c2020000-0000-0000-0000-000000000005','2026-06-29','11:00','pi',  26,'vara','secundar','pi'),
  ('c2020000-0000-0000-0000-000000000005','2026-09-02','12:00','L336',26,'restante','restanta_marire','L336')
) as v(course_id, exam_date, exam_time, room, enrolled_count, session_type, kind, rcode)
left join public.rooms rid on rid.code = v.rcode;

-- ============================================================
-- Professor profile: rank + honorifics for Ion Popescu
-- ============================================================
update public.profiles
set academic_rank = 'Conferențiar', honorifics = 'dr. habil.'
where id = 'f290cdcb-5a50-499f-a5ef-93fae3a497e6';
