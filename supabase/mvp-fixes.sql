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
