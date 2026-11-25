# Bhutan Tech Connect — Student–Startup Matching Platform

A mobile-first MVP that connects Bhutanese college students with startup founders:

- **Students** build a profile + CV, then browse and apply to paid projects.
- **Founders** post short paid projects, browse student profiles, view CVs, and can buy a manually curated **Premium Shortlist** (paid by bank/mBoB transfer, confirmed by an admin).
- **Admins** verify and rank students, confirm manual payments, and deliver ranked shortlists.

Built with Next.js (App Router), Tailwind CSS, and TypeScript on an **all-Neon
stack**:

| Service | Use in this app |
| --- | --- |
| Neon Postgres | All application tables — profiles, projects, applications, shortlists, orders |
| Neon Managed Better Auth | Sign-up, sign-in and sessions |
| Neon Object Storage | Private CV and payment-proof uploads |
| Neon Realtime | Live shortlist payment status |
| Neon Functions | `platform` function behind the public status endpoint |

Authorization is enforced in Server Actions, route handlers and `proxy.ts`
against the role stored in `public.profiles`. There is no RLS layer and no
separate auth database: Neon owns both identities and application data.

See [STRUCTURE.md](STRUCTURE.md) for a map of the repository and where new code
belongs.

> **Migrating from Supabase:** password hashes cannot be migrated to Managed
> Better Auth. **Every existing user must re-register.** Application user IDs
> also change — old Supabase IDs are not valid foreign keys in the Neon tables,
> and there is no identity-mirroring step. Do not copy Supabase auth rows or
> expect old sessions/tokens to work. Seed fresh Neon Auth accounts for E2E.

---

## 1. Prerequisites

- Node.js 18+ and npm
- The Neon CLI (`neon`), signed in (`neon login`) with access to this project
- A Neon branch with Auth, Realtime and the private `cvs` bucket enabled —
  see [`neon.ts`](neon.ts) for the declared services

## 2. Set up `.env.local`

Copy `.env.example` to `.env.local` and fill in the real values. `.env.local`
is git-ignored; never commit secrets.

```bash
cp .env.example .env.local
```

```dotenv
# Neon Managed Auth — from `neon neon-auth status`
NEON_AUTH_BASE_URL=https://<branch-auth-host>.auth.neon.app
# Generate your own: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
NEON_AUTH_COOKIE_SECRET=<at-least-32-character-random-secret>

# Pooled Neon Postgres connection string (server-only)
DATABASE_URL=postgresql://<user>:<password>@<host>-pooler.<region>.neon.tech/<db>?sslmode=require

# Public origin — pins auth redirects and generated CV links
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Neon Realtime — the sealing secret stays server-only
NEON_REALTIME_SECRET=<sealing-secret>
NEXT_PUBLIC_NEON_REALTIME_URL=<public-realtime-url>
```

Notes on the variables:

- `NEON_AUTH_BASE_URL` is the Managed Auth URL for the current branch. Check the
  branch with `neon neon-auth status`.
- `NEON_AUTH_COOKIE_SECRET` is app-generated: create a random string of at least
  32 characters with the command above and keep it identical across deploys and
  local runs. Changing it invalidates all sessions.
- `DATABASE_URL` must be the **pooled** Neon connection string.
- `NEXT_PUBLIC_APP_URL` is the real public origin (required in production).
  It prevents Host-header spoofing in auth redirects and CV links. The legacy
  alias `NEXT_PUBLIC_SITE_URL` is still accepted.
- `NEXT_PUBLIC_NEON_REALTIME_URL` is public by design; `NEON_REALTIME_SECRET`
  must stay server-only.
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_ENDPOINT_URL_S3` and
  `AWS_REGION` are injected by `neon deploy` / `neon env pull` for Object
  Storage. Do not hardcode or commit them.
- `.env.example` lists every variable with placeholder values. Runtime
  validation of `NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET` and
  `DATABASE_URL` happens when a server client is created, not on import.

### Provision with the Neon CLI

```bash
neon deploy         # provision services and write Neon-managed variables to .env
neon env pull       # refresh those variables after a branch or config change
neon neon-auth status  # confirm Managed Auth is enabled; read the branch auth URL
```

`neon env pull` writes to `.env`; Next.js also reads that file. Keep manual
overrides (E2E credentials, payment placeholders, Mesurer flag) in `.env.local`,
which takes precedence.

### Deploying to Vercel

Vercel does not read `.env.local` or `.env`. Add every variable below under
**Project Settings → Environment Variables** (Production and Preview), then
redeploy. Copy the generated values from `neon env pull` / the Neon console —
the build machine does not run the Neon CLI.

`NEXT_PUBLIC_*` values are **inlined into the bundle at build time**, so they
must be present before the build starts. The build itself needs no secrets:
`validateEnv()` runs at client creation, not on import. A build with no env
vars succeeds but the deployed app throws a clear error on its first auth or
database request — set the variables anyway.

| Variable | Used for | Needed at build? |
| --- | --- | --- |
| `NEON_AUTH_BASE_URL` | Managed Better Auth base URL | No (runtime) |
| `NEON_AUTH_COOKIE_SECRET` | Session cookie signing (>= 32 chars) | No (runtime) |
| `DATABASE_URL` | Neon Postgres — all reads/writes | No (read lazily per query) |
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_ENDPOINT_URL_S3`, `AWS_REGION` | Object Storage uploads and signed URLs | No (runtime) |
| `NEXT_PUBLIC_APP_URL` | Auth redirects, CV links | Yes (inlined; validated at runtime) |
| `NEXT_PUBLIC_NEON_REALTIME_URL` | Live shortlist payment status | Yes |
| `NEON_REALTIME_SECRET` | Seal Realtime queries | No (runtime) |
| `NEON_BRANCH_ID`, `NEON_FUNCTION_HOST_SUFFIX` | `/api/neon` status endpoint | No (runtime) |
| `CONTACT_EMAIL`, `NEXT_PUBLIC_MESURER_ENABLED` | Contact link, dev inspector | `MESURER` yes; `CONTACT_EMAIL` no |

## 3. Set up the database (Neon)

The schema lives in [`neon/schema.sql`](neon/schema.sql) — plain Postgres
tables, indexes and constraints, with no auth/storage schemas and no RLS
policies. Apply it and seed local-only demo rows with:

```bash
DATABASE_URL=<pooled-neon-url> node scripts/neon-setup.mjs
```

The script is idempotent: it applies the schema, inserts placeholder profiles
and a small project/application/order set, then prints row counts. The
placeholder IDs are **not** auth users; they exist so data-driven pages have
something to render. Real accounts come from Neon Auth sign-up.

Verify the connection and the data with:

```bash
node scripts/neon-smoke.mjs      # DB round-trip
node scripts/neon-verify.mjs     # counts + recent applications/orders/shortlists
```

`GET /api/neon` reports table counts and open projects. It calls the deployed
`platform` Neon Function first and falls back to a direct query.
`GET /api/health` reports Neon reachability.

**Schema changes:** edit `neon/schema.sql` and re-run `scripts/neon-setup.mjs`.
There are no generated migrations and no SQL editor-specific policies to push.

## 4. Create an admin user

There is no admin signup — promote yourself after signing up:

1. Sign up normally at `/signup`; new accounts are students by default.
2. Open the Neon SQL editor (or use any Postgres client with `DATABASE_URL`),
   find your new profile, and promote it:

```sql
select id, role, full_name, created_at from public.profiles order by created_at desc limit 10;

update public.profiles
set role = 'admin', updated_at = now()
where id = '<your-profile-uuid>';
```

3. Log out and back in — you will land on `/admin`.

> Only an existing admin or someone with direct database access can change a
> role. The application never lets a user promote themselves.

## 5. Run the app

```bash
npm install
npm run dev
```

Open http://localhost:3000 — you will be redirected to the public landing page.

> **Before real users pay:** the bank account and mBoB number in
> `src/config/payment.ts` are placeholders. Replace them with real details.

### Local development

The Neon CLI script pulls the branch environment and starts the dev server:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/local-up.ps1
```

Stop it with:

```powershell
powershell -File scripts/local-down.ps1
```

There is no local Docker backend and no Studio: Postgres, Auth, Object Storage
and Realtime are the hosted Neon branch named in `neon.ts`. To run the app
container itself instead:

```powershell
docker compose up --build
```

`docker-compose.yml` passes the Neon variables through to the app and has no
service dependency on a local database stack.

### Frontend inspection with Mesurer

Mesurer is an open-source UI inspector for precise visual feedback. It is
mounted in `src/app/layout.tsx` through `components/dev/mesurer-panel.tsx`, but
only in development and only when `NEXT_PUBLIC_MESURER_ENABLED=1`. Production
builds and normal visitors never load it.

```bash
# .env.local
NEXT_PUBLIC_MESURER_ENABLED=1   # on (default for local work)
NEXT_PUBLIC_MESURER_ENABLED=0   # off
```

It starts minimized to a toolbar button in the top-left. Useful shortcuts:

| Key | Action |
| --- | --- |
| `I` | Inspect element bounds and spacing |
| `G` | Pixel guides; `H` horizontal, `V` vertical |
| `R` | Pixel rulers; hold `Alt` for distance overlays |
| `D` / `N` / `T` | Arrows, freehand pen, text notes |
| `M` | Comments pinned to live elements |
| `X` / `B` | X-ray structure / responsive preview |
| `C` / `V` | Region screenshot / short video capture |
| `Cmd/Ctrl + K` | Copy comments as structured feedback for a coding agent |
| `Esc` | Cancel the current tool, then minimize |

Workspace state persists per page in local storage under
`bhutan-tech-connect-mesurer`.

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

The public experience uses an editorial, photo-led layout with oversized type, clear hierarchy, and responsive motion. The photographs in `public/assets/` show Bhutanese people in gho and kira, sourced from Wikimedia Commons under CC BY-SA licences; the per-image author and licence are kept with the image credits, and credit links appear with each image.

---

## Testing

- **Unit tests:** `npm test` (Vitest). Tests are co-located with the code as
  `*.test.ts`; the shared Neon Auth mock is `tests/neon-auth.mock.ts`.
- **Other checks:** `npm run lint` and `npx tsc --noEmit`.

Playwright covers the student, founder, admin and payment journeys. The E2E
flows need a **seeded Neon branch with real Neon Auth accounts** — there are no
self-registering founders or admins. Create the accounts with the passwords you
intend to use, seed the data described in `tests/e2e/demo-users.ts`, then set
the matching credentials:

```bash
export E2E_STUDENT_EMAIL=... E2E_STUDENT_PASSWORD=...
export E2E_FOUNDER_EMAIL=... E2E_FOUNDER_PASSWORD=...
export E2E_ADMIN_EMAIL=...   E2E_ADMIN_PASSWORD=...
export E2E_PAYMENT_FOUNDER_EMAIL=... E2E_PAYMENT_FOUNDER_PASSWORD=...
npm run test:e2e
```

If the Neon branch is unreachable the suite **skips** with an explicit reason,
so a local run without credentials is not mistaken for a green build. In CI,
set the `E2E_*` secrets and repository variable `E2E_ENABLED=true`; the `e2e`
job sets `E2E_REQUIRE_DB=1` so a missing database fails the job instead.

---

## Notes

- ⚠️ Seed users created by `scripts/neon-setup.mjs` have fixed placeholder IDs
  and are **not** Neon Auth identities. Real logins must be registered through
  Neon Auth; never use seeded IDs as real user accounts.
- CVs and payment screenshots live in a private Neon Object Storage bucket —
  access goes through short-lived signed URLs; CVs are proxied via
  `/api/cv/[id]` with role checks.
- There is no Row Level Security. Every data access is checked in the
  application layer; see `src/lib/neon-data.ts` and `proxy.ts`.
- Database schema changes belong in `neon/schema.sql`; apply them by re-running
  `scripts/neon-setup.mjs`.
- User IDs come from Neon Auth and differ from any legacy Supabase IDs. Old
  Supabase sessions, passwords and signed URLs cannot be reused.
