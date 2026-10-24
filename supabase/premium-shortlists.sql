-- ============================================================
-- Premium Shortlist orders (manual payment) — run in SQL Editor
-- ============================================================

create table if not exists public.shortlist_orders (
  id uuid primary key default gen_random_uuid(),
  founder_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  package text not null check (package in ('basic', 'full')),
  amount numeric(10,2),
  status text not null default 'pending'
    check (status in ('pending', 'submitted', 'confirmed', 'rejected')),
  screenshot_path text,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz
);

alter table public.shortlist_orders enable row level security;

-- Founder manages own orders
create policy "founders_manage_own_orders"
  on public.shortlist_orders for all
  using (auth.uid() = founder_id)
  with check (auth.uid() = founder_id);

-- Admin reads and confirms all orders
create policy "admin_manage_all_orders"
  on public.shortlist_orders for all
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

-- Storage: private bucket for payment screenshots (images, 5 MB)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('payment-screenshots', 'payment-screenshots', false, 5242880,
        array['image/png','image/jpeg','image/webp'])
on conflict (id) do update
  set file_size_limit = 5242880,
      allowed_mime_types = array['image/png','image/jpeg','image/webp'];

create policy "founders_upload_own_screenshots"
  on storage.objects for insert
  with check (
    bucket_id = 'payment-screenshots'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "screenshots_readable_by_owner_or_admin"
  on storage.objects for select
  using (
    bucket_id = 'payment-screenshots'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or exists (
        select 1 from public.profiles p
        where p.id = auth.uid() and p.role = 'admin'
      )
    )
  );
