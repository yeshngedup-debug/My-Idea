-- ============================================================
-- Fix shortlist race condition + track entry source
--
-- 1. Partial unique index prevents duplicate general (project_id IS NULL)
--    shortlist rows for the same founder + student. PostgreSQL treats
--    NULL != NULL, so the regular (founder_id, student_id, project_id)
--    constraint does not block concurrent inserts of NULL-project rows.
--
-- 2. source column ('admin' | 'founder') lets admin-generated shortlists
--    replace only admin rows, so founder-requested entries are never
--    silently wiped on regeneration.
-- ============================================================

-- 1. Atomic guard against duplicate general shortlist entries
CREATE UNIQUE INDEX IF NOT EXISTS shortlists_one_per_founder_student_general
  ON public.shortlists (founder_id, student_id) WHERE project_id IS NULL;

-- 2. Track who created each shortlist entry
ALTER TABLE public.shortlists
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'admin'
  CHECK (source in ('admin', 'founder'));

CREATE INDEX IF NOT EXISTS shortlists_source_idx ON public.shortlists (source);

-- 3. Backfill existing rows as 'admin' (they were admin-generated)
UPDATE public.shortlists SET source = 'admin' WHERE source IS NULL;
