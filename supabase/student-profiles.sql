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
