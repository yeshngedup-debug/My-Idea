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
