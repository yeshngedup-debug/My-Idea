-- ============================================================
-- LOCAL-ONLY seed for the Docker/Supabase CLI stack.
--
-- NEVER load this into a production database. The passwords below
-- are fixed on purpose so local development and Playwright runs are
-- repeatable. All accounts use the reserved `.test` TLD, so the
-- production hardening migration (which deletes @btc-test.com users)
-- will not remove them.
--
-- Password for all three accounts: LocalTest123!
-- ============================================================

do $$
declare
  u jsonb;
  new_id uuid;
  local_users jsonb := '[
    {"email":"admin@btc-e2e.test","role":"admin","full_name":"Local Admin"},
    {"email":"student.tashi@btc-e2e.test","role":"student","full_name":"Tashi Dorji"},
    {"email":"student.pema@btc-e2e.test","role":"student","full_name":"Pema Choden"},
    {"email":"founder.dorji@btc-e2e.test","role":"founder","full_name":"Ugyen Dorji"},
    {"email":"founder.pema@btc-e2e.test","role":"founder","full_name":"Pema Lhamo"}
  ]'::jsonb;
begin
  for u in select * from jsonb_array_elements(local_users) loop
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
        extensions.crypt('LocalTest123!', extensions.gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}',
        jsonb_build_object('role', u->>'role', 'full_name', u->>'full_name'),
        now(), now(), '', '', '', ''
      ) returning id into new_id;

      insert into auth.identities (
        provider_id, provider, user_id, identity_data, last_sign_in_at, created_at, updated_at
      ) values (
        u->>'email', 'email', new_id,
        jsonb_build_object('sub', new_id::text, 'email', u->>'email', 'email_verified', true),
        now(), now(), now()
      );
    end if;
  end loop;
end $$;

-- handle_new_user() always creates a 'student' profile, so sync the roles
-- intended for these local accounts (postgres may bypass the role guard).
update public.profiles set role = 'admin'
  where id = (select id from auth.users where email = 'admin@btc-e2e.test');
update public.profiles set role = 'founder'
  where id in (
    select id from auth.users
    where email in ('founder.dorji@btc-e2e.test', 'founder.pema@btc-e2e.test')
  );

-- Completed student profiles (cv_path is enough for the CV link UI).
insert into public.student_profiles
  (id, full_name, college, course, year, skills, bio, availability, contact_email, rank, verified, cv_path)
values
  ((select id from auth.users where email = 'student.tashi@btc-e2e.test'),
   'Tashi Dorji', 'Royal Thimphu College', 'BSc Computer Science', '3rd',
   array['React','TypeScript','Node.js'],
   'Final-year CS student building small web apps and learning fast.',
   'weekdays', 'student.tashi@btc-e2e.test', 1, true,
   (select id::text from auth.users where email = 'student.tashi@btc-e2e.test') || '/demo-cv.pdf'),
  ((select id from auth.users where email = 'student.pema@btc-e2e.test'),
   'Pema Choden', 'Royal Thimphu College', 'BCom Business Analytics', 'Graduate',
   array['SQL','Excel','Power BI'],
   'Analytics graduate who turns messy data into useful dashboards.',
   'weekends', 'student.pema@btc-e2e.test', 2, true,
   (select id::text from auth.users where email = 'student.pema@btc-e2e.test') || '/demo-cv.pdf')
on conflict (id) do nothing;

-- One founder-owned open project, plus one extra open project for applications.
insert into public.projects
  (title, description, founder_id, required_skills, duration, budget_min, budget_max, work_mode, deadline, status)
select 'Student attendance tracker web app',
       'Tutors mark attendance per session, students see their percentage, admins export a monthly report.',
       (select id from auth.users where email = 'founder.dorji@btc-e2e.test'),
       array['React','Node.js'], '1 month', 4000, 8000, 'remote', current_date + 30, 'open'
where not exists (select 1 from public.projects where title = 'Student attendance tracker web app');

insert into public.projects
  (title, description, founder_id, required_skills, duration, budget_min, budget_max, work_mode, deadline, status)
select 'Campus event promo pack',
       'Five posters, three short vertical videos, and a reusable brand kit.',
       (select id from auth.users where email = 'founder.dorji@btc-e2e.test'),
       array['Figma','Video editing'], '2 weeks', 3000, 5000, 'onsite', current_date + 21, 'open'
where not exists (select 1 from public.projects where title = 'Campus event promo pack');

-- A real founder <-> student relationship so shortlist requests are allowed.
insert into public.applications (student_id, project_id, status)
select au.id, p.id, 'pending'
from auth.users au, public.projects p
where au.email = 'student.tashi@btc-e2e.test'
  and p.title = 'Student attendance tracker web app'
on conflict do nothing;

-- One submitted order with proof, for the admin payment flow.
insert into public.shortlist_orders (founder_id, package, amount, status, screenshot_path)
select id, 'basic', 750, 'submitted', id::text || '/local-receipt.png'
from auth.users where email = 'founder.dorji@btc-e2e.test'
and not exists (
  select 1 from public.shortlist_orders o
  where o.founder_id = (select id from auth.users where email = 'founder.dorji@btc-e2e.test')
    and o.status = 'submitted'
);
