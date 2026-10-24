-- ============================================================
-- Test users (fake demo accounts) — idempotent, safe to re-run.
--
-- Password for ALL demo accounts: TestPass123!
--
--   admin@btc-test.com        admin
--   student.tashi@btc-test.com   student (verified, rank 1)
--   student.pema@btc-test.com    student (verified, rank 2)
--   student.karma@btc-test.com   student (unverified)
--   founder.dorji@btc-test.com   founder (Dorji Labs)
--   founder.sonam@btc-test.com   founder (Thimphu Tech)
--
-- The on_auth_user_created trigger creates each profile row with the
-- correct role. CV files are uploaded separately; this file also seeds
-- 3 demo projects and 1 application so every page has real content.
-- ============================================================

-- 1. Auth users (login works immediately: email confirmed)
do $$
declare
  new_id uuid;
  u jsonb;
  demo_users jsonb := '[
    {"email":"admin@btc-test.com","role":"admin","full_name":"Demo Admin"},
    {"email":"student.tashi@btc-test.com","role":"student","full_name":"Tashi Dorji"},
    {"email":"student.pema@btc-test.com","role":"student","full_name":"Pema Choden"},
    {"email":"student.karma@btc-test.com","role":"student","full_name":"Karma Wangdi"},
    {"email":"founder.dorji@btc-test.com","role":"founder","full_name":"Ugyen Dorji"},
    {"email":"founder.sonam@btc-test.com","role":"founder","full_name":"Sonam Lhamo"}
  ]'::jsonb;
begin
  for u in select * from jsonb_array_elements(demo_users) loop
    if not exists (select 1 from auth.users where email = u->>'email') then
      insert into auth.users (
        instance_id, id, aud, role, email, encrypted_password,
        email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
        created_at, updated_at, confirmation_token, recovery_token,
        email_change, email_change_token_new
      ) values (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        u->>'email',
        extensions.crypt('TestPass123!', extensions.gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}',
        jsonb_build_object('role', u->>'role', 'full_name', u->>'full_name'),
        now(), now(), '', '', '', ''
      ) returning id into new_id;

      insert into auth.identities (
        provider_id, provider, user_id, identity_data, last_sign_in_at, created_at, updated_at
      ) values (
        u->>'email',
        'email',
        new_id,
        jsonb_build_object('sub', new_id::text, 'email', u->>'email', 'email_verified', true),
        now(), now(), now()
      );
    end if;
  end loop;
end $$;

-- 2. Completed student profiles (visible in browse once CV is attached)
insert into public.student_profiles
  (id, full_name, college, course, year, skills, bio, availability, contact_email, rank, verified)
values
  ((select id from auth.users where email = 'student.tashi@btc-test.com'),
   'Tashi Dorji', 'Royal Thimphu College', 'BSc Computer Science', '3rd',
   array['React','TypeScript','Node.js'],
   'Final-year CS student. Built two campus web apps and love clean, fast interfaces. Looking for part-time product work.',
   'weekdays', 'student.tashi@btc-test.com', 1, true),
  ((select id from auth.users where email = 'student.pema@btc-test.com'),
   'Pema Choden', 'Royal Thimphu College', 'BCom Business Analytics', 'Graduate',
   array['SQL','Excel','Power BI'],
   'Analytics graduate. Turned messy survey data into dashboards the student union actually used.',
   'weekends', 'student.pema@btc-test.com', 2, true),
  ((select id from auth.users where email = 'student.karma@btc-test.com'),
   'Karma Wangdi', 'Sherubtse College', 'BA Media and Design', '4th',
   array['Figma','Illustrator','Video editing'],
   'Media and design student. I make posters, short promo videos, and simple brand kits.',
   'flexible', 'student.karma@btc-test.com', null, false)
on conflict (id) do nothing;

-- 3. Demo projects (guarded by title so re-runs do not duplicate)
insert into public.projects
  (title, description, founder_id, required_skills, duration, budget_min, budget_max, work_mode, deadline, status)
select 'Student attendance tracker web app',
       'A simple web app for our training centre: tutors mark attendance per session, students see their percentage, and admins export a monthly report.',
       (select id from auth.users where email = 'founder.dorji@btc-test.com'),
       array['React','Node.js'], '1 month', 4000, 8000, 'remote', current_date + 30, 'open'
where not exists (select 1 from public.projects where title = 'Student attendance tracker web app');

insert into public.projects
  (title, description, founder_id, required_skills, duration, budget_min, budget_max, work_mode, deadline, status)
select 'Marketing website revamp',
       'Our 4-page marketing site feels dated. Redesign and rebuild it with a modern look, a clear pricing section, and a contact form that works on phones.',
       (select id from auth.users where email = 'founder.sonam@btc-test.com'),
       array['Figma','Web design'], '2 weeks', 2500, 4000, 'remote', current_date + 14, 'open'
where not exists (select 1 from public.projects where title = 'Marketing website revamp');

insert into public.projects
  (title, description, founder_id, required_skills, duration, budget_min, budget_max, work_mode, deadline, status)
select 'Campus event promo pack',
       'Create a promo pack for our campus launch event: 5 posters, 3 short vertical videos, and a simple brand kit we can reuse on social media.',
       (select id from auth.users where email = 'founder.dorji@btc-test.com'),
       array['Figma','Illustrator','Video editing'], '2 weeks', 3000, 5000, 'onsite', current_date + 21, 'open'
where not exists (select 1 from public.projects where title = 'Campus event promo pack');

-- 4. One demo application (Tashi applied to the attendance tracker)
insert into public.applications (student_id, project_id, status)
select au.id, p.id, 'pending'
from auth.users au, public.projects p
where au.email = 'student.tashi@btc-test.com'
  and p.title = 'Student attendance tracker web app'
on conflict do nothing;
