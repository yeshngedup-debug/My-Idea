-- Neon-compatible schema for Bhutan Tech Connect.
-- Mirrors the tables used by the app without Supabase-specific auth/storage
-- schemas. Authorization stays in the application layer (server actions and
-- middleware), so no RLS policies are created here.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key,
  role text not null default 'student' check (role in ('student', 'founder', 'admin')),
  full_name text,
  college text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  founder_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid references public.profiles(id),
  budget numeric(10,2),
  status text not null default 'open' check (status in ('open', 'in_progress', 'review', 'completed')),
  created_at timestamptz not null default now(),
  required_skills text[] not null default '{}',
  duration text,
  budget_min numeric(10,2),
  budget_max numeric(10,2),
  work_mode text not null default 'remote',
  deadline date
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'shortlisted', 'accepted', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, project_id)
);

-- Existing databases created before the status audit need the new column.
alter table public.applications add column if not exists updated_at timestamptz not null default now();

create table if not exists public.application_status_history (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  from_status text,
  to_status text not null,
  changed_at timestamptz not null default now(),
  changed_by_ref text
);

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
  updated_at timestamptz not null default now(),
  rank int,
  verified boolean not null default false,
  contact_email text
);

create table if not exists public.shortlists (
  id uuid primary key default gen_random_uuid(),
  founder_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'requested' check (status in ('requested', 'contacted', 'hired', 'rejected')),
  created_at timestamptz not null default now(),
  project_id uuid references public.projects(id) on delete cascade,
  source text not null default 'admin' check (source in ('admin', 'founder'))
);

create table if not exists public.shortlist_orders (
  id uuid primary key default gen_random_uuid(),
  founder_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  package text not null check (package in ('basic', 'full')),
  amount numeric(10,2),
  status text not null default 'pending' check (status in ('pending', 'submitted', 'confirmed', 'rejected')),
  screenshot_path text,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz
);

create index if not exists projects_founder_idx on public.projects (founder_id, created_at desc);
create index if not exists projects_founder_status_idx on public.projects (founder_id, status);
create index if not exists applications_student_idx on public.applications (student_id);
create index if not exists applications_project_idx on public.applications (project_id);
create index if not exists application_status_history_app_idx on public.application_status_history (application_id, changed_at desc);
create index if not exists shortlists_founder_idx on public.shortlists (founder_id, created_at desc);
create index if not exists shortlists_student_idx on public.shortlists (student_id);
create index if not exists shortlist_orders_founder_idx on public.shortlist_orders (founder_id, created_at desc);
create index if not exists shortlist_orders_founder_status_idx on public.shortlist_orders (founder_id, status);

-- Shortlist uniqueness mirrors the Supabase constraints. A founder-student
-- pair may have one general row per source and one row per project.
create unique index if not exists shortlists_one_per_founder_student_general
  on public.shortlists (founder_id, student_id, source)
  where project_id is null;
create unique index if not exists shortlists_one_per_founder_student_project
  on public.shortlists (founder_id, student_id, project_id)
  where project_id is not null;
