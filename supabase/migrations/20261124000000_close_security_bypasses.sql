-- ============================================================
-- Close the founder payment bypass, the free-CV-harvest bypass,
-- and the shortlist regeneration collision.
--
-- Apply after 20261122000000_security_hardening.sql.
-- All founder writes that create privileged state route through
-- SECURITY DEFINER functions or are constrained by triggers, so
-- direct PostgREST calls with the public anon key cannot bypass
-- admin approval.
-- ============================================================

-- ------------------------------------------------------------
-- 1. shortlist_orders: founders may read and create orders and
--    update only their receipt. Confirm/reject is admin-only,
--    enforced by a trigger so every write path is covered.
-- ------------------------------------------------------------
drop policy if exists "founders_manage_own_orders" on public.shortlist_orders;

create policy "founders_read_own_orders"
  on public.shortlist_orders for select
  using (auth.uid() = founder_id);

create policy "founders_insert_own_orders"
  on public.shortlist_orders for insert
  with check (auth.uid() = founder_id);

create policy "founders_update_own_order_receipt"
  on public.shortlist_orders for update
  using (auth.uid() = founder_id)
  with check (auth.uid() = founder_id);

create or replace function public.protect_shortlist_order_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.has_role('admin') then
    -- Ownership, package, amount and project must not be reassigned.
    if new.founder_id is distinct from old.founder_id
       or new.package is distinct from old.package
       or new.amount is distinct from old.amount
       or new.project_id is distinct from old.project_id then
      raise exception 'Only admins may change payment order details';
    end if;

    -- Status transitions into the privileged states are admin-only.
    if new.status is distinct from old.status
       and new.status in ('confirmed', 'rejected') then
      raise exception 'Only admins may confirm or reject a payment order';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists protect_shortlist_order_status on public.shortlist_orders;
create trigger protect_shortlist_order_status
  before update on public.shortlist_orders
  for each row execute function public.protect_shortlist_order_status();

-- ------------------------------------------------------------
-- 2. shortlists: founders may read their own rows, but creation
--    must go through a SECURITY DEFINER RPC that verifies a real
--    relationship (an application to the founder's project, or a
--    confirmed paid order). Direct INSERT is no longer permitted.
-- ------------------------------------------------------------
drop policy if exists "founders_manage_own_shortlists" on public.shortlists;

create policy "founders_read_own_shortlists"
  on public.shortlists for select
  using (auth.uid() = founder_id);

-- Include `source` so an admin-generated row and a founder-requested
-- row for the same student can coexist instead of throwing 23505.
drop index if exists public.shortlists_one_per_founder_student_general;
create unique index shortlists_one_per_founder_student_general
  on public.shortlists (founder_id, student_id, source)
  where project_id is null;

create or replace function public.request_shortlist(
  p_student_id uuid,
  p_project_id uuid default null
)
returns public.shortlists
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.shortlists;
begin
  if not public.has_role('founder') then
    raise exception 'Only founders can shortlist students';
  end if;

  if not exists (
    select 1 from public.profiles
    where id = p_student_id and role = 'student'
  ) then
    raise exception 'Student not found';
  end if;

  -- A founder may shortlist a student who applied to one of their
  -- projects, or any student once they hold a confirmed paid order.
  if not exists (
    select 1
    from public.applications a
    join public.projects p on p.id = a.project_id
    where a.student_id = p_student_id and p.founder_id = auth.uid()
  )
  and not exists (
    select 1 from public.shortlist_orders o
    where o.founder_id = auth.uid()
      and o.status = 'confirmed'
      and (o.project_id is null or o.project_id = p_project_id)
  ) then
    raise exception 'No relationship with this student';
  end if;

  -- NULL project_id does not participate in the composite unique
  -- constraint, so handle the general row explicitly.
  if p_project_id is null then
    select * into v_row
      from public.shortlists
     where founder_id = auth.uid()
       and student_id = p_student_id
       and project_id is null
       and source = 'founder';

    if found then
      return v_row;
    end if;
  end if;

  insert into public.shortlists (founder_id, student_id, project_id, status, source)
  values (auth.uid(), p_student_id, p_project_id, 'requested', 'founder')
  on conflict (founder_id, student_id, project_id)
  do update set status = 'requested'
  returning * into v_row;

  return v_row;
end;
$$;

revoke all on function public.request_shortlist(uuid, uuid) from public;
grant execute on function public.request_shortlist(uuid, uuid) to authenticated;

-- ------------------------------------------------------------
-- 3. CV storage: a shortlist row alone is no longer enough.
--    Founders need a confirmed order in addition to the row.
-- ------------------------------------------------------------
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
        where p.founder_id = auth.uid() and sp.cv_path = name
      )
      or exists (
        select 1
        from public.shortlists s
        join public.student_profiles sp on sp.id = s.student_id
        join public.shortlist_orders o
          on o.founder_id = s.founder_id
         and o.status = 'confirmed'
         and (o.project_id is null or o.project_id = s.project_id)
        where s.founder_id = auth.uid() and sp.cv_path = name
      )
    )
  );

-- ------------------------------------------------------------
-- 4. Defence in depth: a user cannot create their own profile
--    with an admin/founder role via direct PostgREST INSERT.
--    Signup's SECURITY DEFINER trigger always inserts 'student'.
-- ------------------------------------------------------------
drop policy if exists "users_insert_own_profile" on public.profiles;
create policy "users_insert_own_profile"
  on public.profiles for insert
  with check (auth.uid() = id and role = 'student');
