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
