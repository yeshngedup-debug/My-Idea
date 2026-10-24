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
