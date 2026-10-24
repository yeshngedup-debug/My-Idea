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
