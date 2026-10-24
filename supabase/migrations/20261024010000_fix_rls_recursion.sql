-- ============================================================
-- Fix RLS infinite recursion (42P17).
--
-- Root cause: policies on `profiles` queried `profiles` inside their
-- own USING clause, and policies on other tables subqueried `profiles`,
-- so Postgres recursed into the same policies forever.
--
-- Fix: one SECURITY DEFINER helper (runs as table owner, bypasses RLS,
-- no recursion possible) + every profiles-lookup rewritten to use it.
-- ============================================================

create or replace function public.has_role(target_role text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = target_role
  );
$$;

grant execute on function public.has_role(text) to anon, authenticated, service_role;

-- ---------------- profiles ----------------
drop policy if exists "admins_read_all_profiles" on public.profiles;
create policy "admins_read_all_profiles"
  on public.profiles for select
  using (public.has_role('admin'));

drop policy if exists "founders_read_student_profile_rows" on public.profiles;
create policy "founders_read_student_profile_rows"
  on public.profiles for select
  using (role = 'student' and public.has_role('founder'));

-- ---------------- student_profiles ----------------
drop policy if exists "founders_read_student_profiles" on public.student_profiles;
create policy "founders_read_student_profiles"
  on public.student_profiles for select
  using (public.has_role('founder') or public.has_role('admin'));

drop policy if exists "admins_update_student_profiles" on public.student_profiles;
create policy "admins_update_student_profiles"
  on public.student_profiles for update
  using (public.has_role('admin'))
  with check (public.has_role('admin'));

drop policy if exists "students_insert_own" on public.student_profiles;
create policy "students_insert_own"
  on public.student_profiles for insert
  with check (auth.uid() = id and public.has_role('student'));

-- ---------------- shortlists ----------------
drop policy if exists "admins_manage_all_shortlists" on public.shortlists;
create policy "admins_manage_all_shortlists"
  on public.shortlists for all
  using (public.has_role('admin'))
  with check (public.has_role('admin'));

-- ---------------- applications ----------------
drop policy if exists "admins_read_all_applications" on public.applications;
create policy "admins_read_all_applications"
  on public.applications for select
  using (public.has_role('admin'));

-- ---------------- shortlist_orders ----------------
drop policy if exists "admin_manage_all_orders" on public.shortlist_orders;
create policy "admin_manage_all_orders"
  on public.shortlist_orders for all
  using (public.has_role('admin'))
  with check (public.has_role('admin'));

-- ---------------- storage ----------------
drop policy if exists "users_read_cvs" on storage.objects;
create policy "users_read_cvs"
  on storage.objects for select
  using (
    bucket_id = 'cvs'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.has_role('founder')
      or public.has_role('admin')
    )
  );

drop policy if exists "screenshots_readable_by_owner_or_admin" on storage.objects;
create policy "screenshots_readable_by_owner_or_admin"
  on storage.objects for select
  using (
    bucket_id = 'payment-screenshots'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.has_role('admin')
    )
  );
