-- ============================================================
-- Tighten project visibility + let founders manage application status.
-- Idempotent, safe to re-run.
--
--   public_read_open_projects   anyone can see OPEN projects only
--   founders_read_own_projects  founders see their own postings
--   admins_read_all_projects    admins see everything (via has_role)
--   students_read_applied_projects  students see projects they applied to
--     (needed because the student pages join project titles; uses a
--      SECURITY DEFINER helper so no policy recursion like 42P17)
--   founders_update_project_applications  founders set application status
-- ============================================================

-- Helper: did the caller apply to this project? Definer = bypasses RLS,
-- which prevents policy recursion between projects <-> applications.
create or replace function public.student_applied(p_project uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.applications
    where project_id = p_project and student_id = auth.uid()
  );
$$;

grant execute on function public.student_applied(uuid) to anon, authenticated, service_role;

-- 1. Replace the over-broad public read
drop policy if exists "anyone_read_open_projects" on public.projects;
drop policy if exists "public_read_open_projects" on public.projects;
create policy "public_read_open_projects"
  on public.projects for select
  using (status = 'open');

-- 2. Founders see their own postings (open or not)
drop policy if exists "founders_read_own_projects" on public.projects;
create policy "founders_read_own_projects"
  on public.projects for select
  using (founder_id = auth.uid());

-- 3. Admins see all projects
drop policy if exists "admins_read_all_projects" on public.projects;
create policy "admins_read_all_projects"
  on public.projects for select
  using (public.has_role('admin'));

-- 4. Students see projects they applied to (for their applications list)
drop policy if exists "students_read_applied_projects" on public.projects;
create policy "students_read_applied_projects"
  on public.projects for select
  using (public.student_applied(id));

-- 5. Founders set application status on their own projects
drop policy if exists "founders_update_project_applications" on public.applications;
create policy "founders_update_project_applications"
  on public.applications for update
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.founder_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.founder_id = auth.uid()
    )
  );
