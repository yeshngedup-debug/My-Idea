-- ============================================================
-- RUN ALL - complete database setup for Bhutan Tech Connect.
-- Paste this WHOLE file into Supabase Dashboard > SQL Editor and click Run.
-- Creates every table, RLS policy, storage bucket, and trigger,
-- in dependency order (profiles -> projects -> student_profiles ->
-- shortlists -> orders -> admin fields -> mvp fixes).
-- Run ONCE on a fresh project.
-- ============================================================
-- ============================================================
-- FROM FILE: schema.sql
-- ============================================================
-- ============================================================
-- Bhutan Tech Connect — Auth Schema
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Profiles table (role source of truth)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'student' check (role in ('student', 'founder', 'admin')),
  full_name text,
  college text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Row Level Security
alter table public.profiles enable row level security;

create policy "users_select_own_profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "users_insert_own_profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "users_update_own_profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Admins can read everything (used by /admin)
create policy "admins_read_all_profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- 3. Auto-create profile on signup (reads role from signup metadata)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4. Projects + applications tables (already referenced by app)
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  founder_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid references public.profiles(id),
  budget numeric(10,2),
  status text not null default 'open' check (status in ('open', 'in_progress', 'review', 'completed')),
  created_at timestamptz not null default now()
);

alter table public.projects enable row level security;

create policy "anyone_read_open_projects" on public.projects for select using (true);
create policy "founder_insert_projects" on public.projects for insert with check (founder_id = auth.uid());
create policy "founder_update_own_projects" on public.projects for update using (founder_id = auth.uid());

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'shortlisted', 'accepted', 'rejected')),
  created_at timestamptz not null default now(),
  unique (student_id, project_id)
);

alter table public.applications enable row level security;

create policy "students_read_own_applications" on public.applications for select using (student_id = auth.uid());
create policy "students_insert_applications" on public.applications for insert with check (student_id = auth.uid());
create policy "founders_read_project_applications" on public.applications for select using (
  exists (select 1 from public.projects p where p.id = project_id and p.founder_id = auth.uid())
);


-- ============================================================
-- FROM FILE: projects-table.sql
-- ============================================================
-- ============================================================
-- Projects table upgrade — run in Supabase Dashboard > SQL Editor
-- Adds posting fields (skills, duration, budget range, mode, deadline)
-- Safe to run once on an existing projects table.
-- ============================================================

alter table public.projects
  add column if not exists required_skills text[] not null default '{}';

alter table public.projects
  add column if not exists duration text;

alter table public.projects
  add column if not exists budget_min numeric(10,2);

alter table public.projects
  add column if not exists budget_max numeric(10,2);

alter table public.projects
  add column if not exists work_mode text not null default 'remote';

alter table public.projects
  add column if not exists deadline date;

-- The old single budget column is replaced by the range
alter table public.projects drop column if exists budget;

-- Fast "My Projects" lookups
create index if not exists projects_founder_id_idx
  on public.projects (founder_id, created_at desc);

-- Restrict duration values (idempotent via DO block)
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'projects_duration_check'
  ) then
    alter table public.projects add constraint projects_duration_check
      check (duration in ('1 week', '2 weeks', '1 month', '2 months', '3 months'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'projects_work_mode_check'
  ) then
    alter table public.projects add constraint projects_work_mode_check
      check (work_mode in ('remote', 'onsite'));
  end if;
end $$;


-- ============================================================
-- FROM FILE: student-profiles.sql
-- ============================================================
-- ============================================================
-- Student Profiles — run in Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. student_profiles table (1:1 with profiles for students)
create table if not exists public.student_profiles (
  id uuid primary key references public.profiles(id) on delete cascade,
  full_name text,
  college text,
  course text,
  year text check (year in ('1st', '2nd', '3rd', '4th', 'Graduate') or year is null),
  skills text[] not null default '{}',
  bio text,
  availability text check (
    availability in ('weekdays', 'weekends', 'evenings', 'full_time', 'flexible')
    or availability is null
  ),
  cv_url text,
  cv_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. RLS: a student sees and edits only their own row
alter table public.student_profiles enable row level security;

create policy "students_select_own"
  on public.student_profiles for select
  using (auth.uid() = id);

create policy "students_insert_own"
  on public.student_profiles for insert
  with check (auth.uid() = id);

create policy "students_update_own"
  on public.student_profiles for update
  using (auth.uid() = id);

-- Founders (and admins) can read student profiles for browsing/shortlisting
create policy "founders_read_student_profiles"
  on public.student_profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('founder', 'admin')
    )
  );

-- 3. Storage bucket for CVs (private; access via signed URLs)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('cvs', 'cvs', false, 5242880, array['application/pdf'])
on conflict (id) do update
  set file_size_limit = 5242880,
      allowed_mime_types = array['application/pdf'];

-- 4. Storage policies: students manage files inside their own folder
create policy "students_upload_own_cv"
  on storage.objects for insert
  with check (
    bucket_id = 'cvs'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "students_update_own_cv"
  on storage.objects for update
  using (
    bucket_id = 'cvs'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "users_read_cvs"
  on storage.objects for select
  using (
    bucket_id = 'cvs'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or exists (
        select 1 from public.profiles p
        where p.id = auth.uid() and p.role in ('founder', 'admin')
      )
    )
  );


-- ============================================================
-- FROM FILE: shortlists.sql
-- ============================================================
-- ============================================================
-- Shortlists — run in Supabase Dashboard > SQL Editor
-- Founders shortlist/request students; students can see their own rows.
-- ============================================================

create table if not exists public.shortlists (
  id uuid primary key default gen_random_uuid(),
  founder_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'requested'
    check (status in ('requested', 'contacted', 'hired', 'rejected')),
  created_at timestamptz not null default now(),
  unique (founder_id, student_id)
);

alter table public.shortlists enable row level security;

-- Founder manages their own shortlist rows
create policy "founders_manage_own_shortlists"
  on public.shortlists for all
  using (auth.uid() = founder_id)
  with check (auth.uid() = founder_id);

-- Student can see when they have been shortlisted
create policy "students_read_own_shortlists"
  on public.shortlists for select
  using (auth.uid() = student_id);

create index if not exists shortlists_founder_idx
  on public.shortlists (founder_id, created_at desc);

create index if not exists shortlists_student_idx
  on public.shortlists (student_id);


-- ============================================================
-- FROM FILE: premium-shortlists.sql
-- ============================================================
-- ============================================================
-- Premium Shortlist orders (manual payment) — run in SQL Editor
-- ============================================================

create table if not exists public.shortlist_orders (
  id uuid primary key default gen_random_uuid(),
  founder_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  package text not null check (package in ('basic', 'full')),
  amount numeric(10,2),
  status text not null default 'pending'
    check (status in ('pending', 'submitted', 'confirmed', 'rejected')),
  screenshot_path text,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz
);

alter table public.shortlist_orders enable row level security;

-- Founder manages own orders
create policy "founders_manage_own_orders"
  on public.shortlist_orders for all
  using (auth.uid() = founder_id)
  with check (auth.uid() = founder_id);

-- Admin reads and confirms all orders
create policy "admin_manage_all_orders"
  on public.shortlist_orders for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Storage: private bucket for payment screenshots (images, 5 MB)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('payment-screenshots', 'payment-screenshots', false, 5242880,
        array['image/png','image/jpeg','image/webp'])
on conflict (id) do update
  set file_size_limit = 5242880,
      allowed_mime_types = array['image/png','image/jpeg','image/webp'];

create policy "founders_upload_own_screenshots"
  on storage.objects for insert
  with check (
    bucket_id = 'payment-screenshots'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "screenshots_readable_by_owner_or_admin"
  on storage.objects for select
  using (
    bucket_id = 'payment-screenshots'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or exists (
        select 1 from public.profiles p
        where p.id = auth.uid() and p.role = 'admin'
      )
    )
  );


-- ============================================================
-- FROM FILE: admin-students.sql
-- ============================================================
-- ============================================================
-- Admin student management — run in Supabase Dashboard > SQL Editor
-- Adds manual ranking, verification flag, contact email,
-- and makes shortlists project-aware.
-- ============================================================

-- 1. Ranking + verification + contact on student_profiles
alter table public.student_profiles
  add column if not exists rank int;

alter table public.student_profiles
  add column if not exists verified boolean not null default false;

alter table public.student_profiles
  add column if not exists contact_email text;

-- Backfill contact emails from auth users
update public.student_profiles sp
set contact_email = au.email
from auth.users au
where sp.id = au.id and sp.contact_email is null;

-- 2. Shortlists become project-aware (regeneratable per founder/project)
alter table public.shortlists
  add column if not exists project_id uuid references public.projects(id) on delete cascade;

-- Old pair-unique blocks per-project shortlists; replace it
alter table public.shortlists
  drop constraint if exists shortlists_founder_id_student_id_key;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'shortlists_founder_student_project_key'
  ) then
    alter table public.shortlists add constraint shortlists_founder_student_project_key
      unique (founder_id, student_id, project_id);
  end if;
end $$;


-- ============================================================
-- FROM FILE: mvp-fixes.sql
-- ============================================================
-- ============================================================
-- MVP fixes — run this ONCE in Supabase Dashboard > SQL Editor,
-- AFTER the other 6 SQL files. Safe to re-run (idempotent).
--
-- Fixes:
--   1. Founders can read student rows in `profiles`
--      (/founder/students/[id] 404'd because RLS only allowed own row,
--       and requestShortlist returned "Student not found")
--   2. Admin write access:
--        - UPDATE on student_profiles (rank/verified were silent no-ops)
--        - ALL on shortlists (generateShortlist insert failed)
--        - SELECT on applications (counts + "Applied" filter always empty)
--   4. Role-escalation guard: nobody can change profiles.role
--      unless they are already an admin (or running in the SQL editor)
--   5. payment-screenshots storage: owners can re-upload (UPDATE policy)
--   + Hardening: only students can create their own student_profiles row
-- ============================================================

-- ------------------------------------------------------------
-- 1. Founders read student rows in profiles
-- ------------------------------------------------------------
drop policy if exists "founders_read_student_profile_rows" on public.profiles;
create policy "founders_read_student_profile_rows"
  on public.profiles for select
  using (
    role = 'student'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'founder'
    )
  );

-- ------------------------------------------------------------
-- 2a. Admins can update student_profiles (rank, verified)
-- ------------------------------------------------------------
drop policy if exists "admins_update_student_profiles" on public.student_profiles;
create policy "admins_update_student_profiles"
  on public.student_profiles for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ------------------------------------------------------------
-- 2b. Admins manage all shortlists (generateShortlist needs delete+insert)
-- ------------------------------------------------------------
drop policy if exists "admins_manage_all_shortlists" on public.shortlists;
create policy "admins_manage_all_shortlists"
  on public.shortlists for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ------------------------------------------------------------
-- 2c. Admins read all applications
-- ------------------------------------------------------------
drop policy if exists "admins_read_all_applications" on public.applications;
create policy "admins_read_all_applications"
  on public.applications for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ------------------------------------------------------------
-- 4. Role-escalation guard (security fix)
-- ------------------------------------------------------------
create or replace function public.prevent_role_change()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- The SQL editor / migrations run as postgres — allow those
  if current_user in ('postgres', 'supabase_admin') then
    return new;
  end if;

  if new.role is distinct from old.role then
    if not exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    ) then
      raise exception 'Changing your role is not allowed.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_role_change_trigger on public.profiles;
create trigger prevent_role_change_trigger
  before update on public.profiles
  for each row execute function public.prevent_role_change();

-- ------------------------------------------------------------
-- 5a. Payment screenshots: owner can replace their upload
--     (uploadPaymentScreenshot uses upsert → needs UPDATE)
-- ------------------------------------------------------------
drop policy if exists "founders_update_own_screenshots" on storage.objects;
create policy "founders_update_own_screenshots"
  on storage.objects for update
  using (
    bucket_id = 'payment-screenshots'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ------------------------------------------------------------
-- 5b. Clear expired signed URLs already stored in the database
-- ------------------------------------------------------------
update public.student_profiles
set cv_url = null
where cv_url is not null;

-- ------------------------------------------------------------
-- Hardening: only students can create their own student_profiles row
-- (prevents a founder account from appearing in founder browse results)
-- ------------------------------------------------------------
drop policy if exists "students_insert_own" on public.student_profiles;
create policy "students_insert_own"
  on public.student_profiles for insert
  with check (
    auth.uid() = id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'student'
    )
  );

