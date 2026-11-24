# Bhutan Tech Connect — Student–Startup Matching Platform

A mobile-first MVP that connects Bhutanese college students with startup founders:

- **Students** build a profile + CV, then browse and apply to paid projects.
- **Founders** post short paid projects, browse student profiles, view CVs, and can buy a manually curated **Premium Shortlist** (paid by bank/mBoB transfer, confirmed by an admin).
- **Admins** verify and rank students, confirm manual payments, and deliver ranked shortlists.

Built with Next.js (App Router), Tailwind CSS, and TypeScript. **Supabase provides Auth and private file Storage. Application data lives in Neon Postgres.** Authorization that used to rely on Supabase RLS is now enforced in server actions, route handlers and `proxy.ts`.

---

## Data setup with Neon

Put the pooled connection string in `.env.local` (never commit it):

```
DATABASE_URL=<pooled Neon connection string>
```

`neon deploy` writes the Neon-managed variables to `.env` (Postgres, branch,
Auth, Functions, AI Gateway and Realtime). Run it once with the CLI signed in:

```bash
neon deploy
```

The browser needs the Realtime URL. Copy the value of `NEON_REALTIME_URL` from
`.env` into `.env.local` as `NEXT_PUBLIC_NEON_REALTIME_URL`. This URL is public
by design; the sealing secret stays server-only.

Apply the Neon schema and mirror the local Supabase identities into it:

```bash
node scripts/neon-setup.mjs                # create tables and seed demo rows
node scripts/neon-mirror-identities.mjs    # copy real auth IDs + data from local Supabase
```

`scripts/neon-mirror-identities.mjs` reads `DATABASE_URL` from `.env.local` and connects to local Postgres at `postgresql://postgres:postgres@127.0.0.1:54322/postgres` (override with `LOCAL_SUPABASE_DB_URL`). It uses the Supabase auth user IDs as `public.profiles.id`, so JWTs from Supabase Auth resolve to the correct Neon role. Run it again before E2E tests to reset seeded data.

`GET /api/neon` reports Neon table counts and open projects. It calls the
deployed `platform` Neon Function first and falls back to a direct query.
`GET /api/health` reports Neon reachability.

**Provisioned services and scope**

| Service | Status | Use in this app |
| --- | --- | --- |
| Postgres | Migrated | All application reads and writes |
| Functions | `platform` deployed | Public status endpoint behind `/api/neon` |
| Realtime | Enabled | Founder shortlist payment status updates live after admin confirmation |
| Auth | Enabled on the branch, not adopted | Supabase Auth remains the identity provider; Managed Better Auth would require replacing sessions and users, so it was not wired |
| AI Gateway | Enabled but unusable | `/v1/models` returns models, but `/v1/chat/completions` returns 403 `paid_plan_required`; no feature was added |

Signup mirrors the new student profile into Neon, while roles changed out of
band in Supabase need a re-run of `scripts/neon-mirror-identities.mjs`.

---

## Local development with Docker (recommended)

The hosted Supabase project in `.env.local` may be unavailable. A complete local stack — Postgres, Auth, REST, Storage and Studio — runs in Docker via the Supabase CLI, with the app on port 3000.

```powershell
# Requires Docker Desktop running
powershell -ExecutionPolicy Bypass -File scripts/local-up.ps1
```

That script starts the containers, applies **all** migrations plus `supabase/seeds/local-dev.sql`, writes `.env.local` / `.env` with the generated local keys, and starts `npm run dev`. Seeded logins (local-only password `LocalTest123!`):

| Role | Email |
|---|---|
| Student | `student.tashi@btc-e2e.test` |
| Founder | `founder.dorji@btc-e2e.test` |
| Admin | `admin@btc-e2e.test` |

Useful URLs: app `http://127.0.0.1:3000`, Supabase Studio `http://127.0.0.1:54323`.

To run the app itself in a container instead:

```powershell
docker compose up --build
```

The compose file builds `Dockerfile` and reaches the local Supabase stack through `host.docker.internal`. Stop everything with `powershell -File scripts/local-down.ps1`.

> The seed file is for local development only. It uses fixed passwords and must never be loaded into a production database.

---

## 1. Prerequisites

- Node.js 18+ and npm
- A Supabase project (free tier is enough) — https://supabase.com/dashboard

## 2. Set up `.env.local`

Create a `.env.local` file in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-key-here>
NEXT_PUBLIC_APP_URL=https://<your-deployed-domain>
```

- Get both Supabase values from **Supabase Dashboard → Project Settings → API** (or the **Connect** dialog).
- The code reads `NEXT_PUBLIC_SUPABASE_ANON_KEY`. New-format `sb_publishable_...` keys work fine — just set the value under the `ANON_KEY` name shown above.
- Set `NEXT_PUBLIC_APP_URL` to the real public origin in production. Generated shortlist text uses it for CV links instead of an untrusted `Host` header.
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

**Existing projects:** migrations are additive and must be applied in filename order. The newest one, `20261124000000_close_security_bypasses.sql`, is **required** — it stops founders from confirming their own payments and from reading CVs without a confirmed order. After applying it, check `shortlist_orders` for rows with `status = 'confirmed'` that were never approved by an admin, and review them manually.

## 4. Create an admin user

There is no admin signup — promote yourself after signing up:

1. Sign up normally at `/signup`; new accounts are students by default.
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

### Frontend inspection with Mesurer

Mesurer is an open-source UI inspector for precise visual feedback. It is mounted
in `app/layout.tsx` through `components/dev/mesurer-panel.tsx`, but only in
development and only when `NEXT_PUBLIC_MESURER_ENABLED=1`. Production builds and
normal visitors never load it. The flag is already set in `.env.local` for local
work.

Enable or disable it:

```bash
# .env.local
NEXT_PUBLIC_MESURER_ENABLED=1   # on (default for local work)
NEXT_PUBLIC_MESURER_ENABLED=0   # off
```

It starts minimized to a toolbar button in the top-left. Useful shortcuts while
redesigning:

| Key | Action |
|---|---|
| `I` | Inspect element bounds and spacing |
| `G` | Pixel guides; `H` horizontal, `V` vertical |
| `R` | Pixel rulers; hold `Alt` for distance overlays |
| `D` / `N` / `T` | Arrows, freehand pen, text notes |
| `M` | Comments pinned to live elements |
| `X` / `B` | X-ray structure / responsive preview |
| `C` / `V` | Region screenshot / short video capture |
| `Cmd/Ctrl + K` | Copy comments as structured feedback for a coding agent |
| `Esc` | Cancel the current tool, then minimize |

Use **Comments** (`M`) to pin feedback to an element, then `Cmd/Ctrl + K` to copy
it and paste it into a prompt for an agent. Workspace state persists per page in
local storage under `bhutan-tech-connect-mesurer`.

---

## 6. Main user flows

### Student

1. Sign up → lands on `/student`
2. Complete your profile at `/student/profile` — skills, bio, availability, and a PDF CV (max 5 MB). Aim for 100% completion; founders only see fully completed profiles.
3. Browse paid projects at `/student/projects` and apply.
4. Track your applications at `/student/applications`.

### Founder

1. Ask an admin to assign founder access, then log in at `/login`.
2. Post a project at `/founder/projects/post` — required skills, budget range, duration, deadline.
3. Browse students at `/founder/browse-students` (search + availability filters), open full profiles, view CVs, and request shortlists.
4. Optional: **Premium Shortlist** at `/founder/shortlists` — pick a package, pay by bank transfer or mBoB, upload the payment screenshot, and wait for admin confirmation. Once confirmed, the ranked shortlist unlocks. A service agreement template is downloadable as a PDF.

### Admin

1. Log in → lands on `/admin`
2. `/admin/students` — search and filter students, set manual ranks, toggle the verified badge, then select students and **Generate** a ranked shortlist for a founder (optionally tied to a project). Copy the text or download it as `.txt`.
3. `/admin/payments` — review founder payment orders, open the payment screenshot, then **Confirm** (unlocks their shortlist) or **Reject**. Confirming without a screenshot is blocked.

---

## Design and imagery

The public experience uses an editorial, photo-led layout with oversized type, clear hierarchy, and responsive motion. The photographs in `public/images/` show Bhutanese people in gho and kira, sourced from Wikimedia Commons under CC BY-SA licences; `components/ui/photo-credit.tsx` holds the per-image author and licence, and credit links appear with each image.

---

## End-to-end tests

Playwright covers the student, founder, admin, and payment journeys. They require a **seeded Supabase project** — there are no self-registering founders or admins. The seed requirements and credential variable names are documented in `tests/e2e/demo-users.ts`.

```bash
export E2E_STUDENT_EMAIL=... E2E_STUDENT_PASSWORD=...
export E2E_FOUNDER_EMAIL=... E2E_FOUNDER_PASSWORD=...
export E2E_ADMIN_EMAIL=...   E2E_ADMIN_PASSWORD=...
export E2E_PAYMENT_FOUNDER_EMAIL=... E2E_PAYMENT_FOUNDER_PASSWORD=...
npm run test:e2e
```

If Supabase is unreachable the suite **skips** with an explicit reason, so a local run without credentials is not mistaken for a green build. In CI, set the `E2E_*` secrets and repository variable `E2E_ENABLED=true`; the `e2e` job sets `E2E_REQUIRE_DB=1` so a missing database fails the job.

---

## Notes

- ⚠️ **Seed demo users are for testing only** (`supabase/migrations/20261024020000_seed_test_users.sql` creates demo accounts with randomly generated passwords). The security migration removes all accounts whose email ends in `@btc-test.com` before production use:
  ```sql
  delete from auth.users where email like '%btc-test.com';
  ```
- CVs and payment screenshots live in **private** storage buckets — access goes through short-lived signed URLs; CVs are proxied via `/api/cv/[id]` with role checks.
- All data access is enforced by Row Level Security — see `supabase/migrations/` for the exact policies (the `has_role()` helper prevents policy recursion).
- Database schema changes should be added as new files in `supabase/migrations/` and pushed with `npx supabase db push`.
- `20261026000000_fix_projects_rls.sql` scopes project visibility: open projects are public, founders see their own, admins see all, students see projects they applied to (via the `student_applied()` helper, which avoids RLS recursion). It also adds `founders_update_project_applications` so founders can set applicant statuses on their own projects.
