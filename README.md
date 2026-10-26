# Bhutan Tech Connect — Student–Startup Matching Platform

A mobile-first MVP that connects Bhutanese college students with startup founders:

- **Students** build a profile + CV, then browse and apply to paid projects.
- **Founders** post short paid projects, browse student profiles, view CVs, and can buy a manually curated **Premium Shortlist** (paid by bank/mBoB transfer, confirmed by an admin).
- **Admins** verify and rank students, confirm manual payments, and deliver ranked shortlists.

Built with Next.js (App Router), Supabase (Auth + Postgres + Storage + Row Level Security), Tailwind CSS, and TypeScript.

---

## 1. Prerequisites

- Node.js 18+ and npm
- A Supabase project (free tier is enough) — https://supabase.com/dashboard

## 2. Set up `.env.local`

Create a `.env.local` file in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-key-here>
```

- Get both values from **Supabase Dashboard → Project Settings → API** (or the **Connect** dialog).
- The code reads `NEXT_PUBLIC_SUPABASE_ANON_KEY`. New-format `sb_publishable_...` keys work fine — just set the value under the `ANON_KEY` name shown above.
- `.env.local` is git-ignored. Never commit it.

## 3. Set up the database (SQL)

**Option A — one paste (recommended):**

1. Open `supabase/run-all.sql`
2. Copy the **entire file**
3. Supabase Dashboard → **SQL Editor** → paste → **Run**

This creates all tables, RLS policies, storage buckets (`cvs`, `payment-screenshots`), and triggers in the correct dependency order. Run once on a fresh project.

**Option B — Supabase CLI (migrations):**

Migrations live in `supabase/migrations/`. Push them with the pooler connection string (Dashboard → Connect → Connection string → URI; the direct `db.<ref>.supabase.co` host is IPv6-only):

```bash
npx supabase db push --db-url "postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres"
```

## 4. Create an admin user

There is no admin signup — promote yourself after signing up:

1. Sign up normally at `/signup` (any role).
2. Run this in the Supabase **SQL Editor** (the editor runs as `postgres`, which bypasses the role-change guard trigger):

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'you@example.com');
```

3. Log out and back in — you will land on `/admin`.

> Security note: the `prevent_role_change` trigger stops regular users from promoting themselves through the API. Only the SQL editor (or an existing admin) can change roles.

## 5. Run the app

```bash
npm install
npm run dev
```

Open http://localhost:3000 — you will be redirected to the public landing page.

> **Before real users pay:** the bank account and mBoB number in `config/payment.ts` are placeholders. Replace them with real details.

---

## 6. Main user flows

### Student

1. Sign up → lands on `/student`
2. Complete your profile at `/student/profile` — skills, bio, availability, and a PDF CV (max 5 MB). Aim for 100% completion; founders only see fully completed profiles.
3. Browse paid projects at `/student/projects` and apply.
4. Track your applications at `/student/applications`.

### Founder

1. Sign up → lands on `/founder`
2. Post a project at `/founder/projects/post` — required skills, budget range, duration, deadline.
3. Browse students at `/founder/browse-students` (search + availability filters), open full profiles, view CVs, and request shortlists.
4. Optional: **Premium Shortlist** at `/founder/shortlists` — pick a package, pay by bank transfer or mBoB, upload the payment screenshot, and wait for admin confirmation. Once confirmed, the ranked shortlist unlocks. A service agreement template is downloadable as a PDF.

### Admin

1. Log in → lands on `/admin`
2. `/admin/students` — search and filter students, set manual ranks, toggle the verified badge, then select students and **Generate** a ranked shortlist for a founder (optionally tied to a project). Copy the text or download it as `.txt`.
3. `/admin/payments` — review founder payment orders, open the payment screenshot, then **Confirm** (unlocks their shortlist) or **Reject**. Confirming without a screenshot is blocked.

---

## Notes

- ⚠️ **Seed demo users are for testing only** (`supabase/migrations/20261024020000_seed_test_users.sql` adds admin/students/founders with the public password `TestPass123!`). **Delete them before real users sign up:**
  ```sql
  delete from auth.users where email like '%btc-test.com';
  ```
- CVs and payment screenshots live in **private** storage buckets — access goes through short-lived signed URLs; CVs are proxied via `/api/cv/[id]` with role checks.
- All data access is enforced by Row Level Security — see `supabase/migrations/` for the exact policies (the `has_role()` helper prevents policy recursion).
- Database schema changes should be added as new files in `supabase/migrations/` and pushed with `npx supabase db push`.
- `20261026000000_fix_projects_rls.sql` scopes project visibility: open projects are public, founders see their own, admins see all, students see projects they applied to (via the `student_applied()` helper, which avoids RLS recursion). It also adds `founders_update_project_applications` so founders can set applicant statuses on their own projects.
