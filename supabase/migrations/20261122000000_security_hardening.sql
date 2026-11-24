-- Remove legacy demo accounts, including accounts created with the old
-- publicly documented password.
delete from auth.users
where email like '%@btc-test.com';

-- Tighten CV storage access. Students may read their own CV; admins may
-- read all CVs; founders may read CVs only through an existing application
-- or shortlist relationship.
drop policy if exists "users_read_cvs" on storage.objects;
create policy "users_read_cvs"
  on storage.objects for select
  using (
    bucket_id = 'cvs'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.has_role('admin')
      or exists (
        select 1
        from public.applications a
        join public.projects p on p.id = a.project_id
        join public.student_profiles sp on sp.id = a.student_id
        where p.founder_id = auth.uid()
          and sp.cv_path = name
      )
      or exists (
        select 1
        from public.shortlists s
        join public.student_profiles sp on sp.id = s.student_id
        where s.founder_id = auth.uid()
          and sp.cv_path = name
      )
    )
  );
