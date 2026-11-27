# Production audit — Bhutan Tech Connect

**Verdict at audit time: 30/100 — BLOCKED.** The redesign had unwired every interactive component, and two RLS policies let a founder bypass payment approval and read any student's CV with only the public anon key.

**Current status (2026-11-26): all code findings below were remediated.** The app now runs entirely on Neon (Postgres, Managed Better Auth, Object Storage, Realtime). `README.md` owns current setup and deployment; there is no Supabase migration or RLS layer to apply. Supabase/RLS details below are a point-in-time record, not live instructions. No re-audit score is asserted here.

**Latest pass (2026-11-27):** the final audit/fix round covered the remaining
first-paint, authorisation, payment and media findings:

- Reveal wrappers start fully visible on the server render and the first client
  render; only below-fold elements animate, and reduced motion stays static.
- The root path `/` now serves the public landing page directly. `/public` is a
  compatibility alias with a server-level `308` redirect to `/`, preserving
  query strings. Before this, the root URL rendered an empty loading skeleton
  and only redirected once JavaScript ran.
- `proxy.ts`, the Server Actions and `src/lib/neon-data.ts` fail closed on
  role and ownership checks; no gate is client-only.
- Bank and mBoB details come from deployment environment variables only. No
  account number is invented in source, blank values pause new orders, and the
  admin payment screen always opens a freshly signed proof link.
- Every `/images/*` homepage asset loads with a real layout box, with a teal
  fallback plate and no zero-sized references.
- The production origin `https://myidea-virid.vercel.app` is registered as a
  trusted Neon Auth domain, and the canonical URL, JSON-LD, contact and
  repository documentation use that origin.

Verification on the live seeded Neon branch: `npx tsc --noEmit` clean ·
`npm run lint` clean · `npm test` 285/285 · `npm run test:e2e` 10/10 (student,
founder, admin, payment and homepage first-paint flows, no skips).

Audit date: 2026-11-24. Source of truth: current working tree (branch `main`, base `a00a6c8`, 65 modified/untracked files, ~5,329 insertions / 3,710 deletions).

> **Historical note (2026-11-25):** this audit was written when Supabase was the Auth and Storage provider. The app now runs entirely on Neon (Managed Better Auth, Postgres, Object Storage, Realtime, Functions); the Supabase references below record the state at audit time and are not current setup instructions. Password hashes could not migrate, so existing users re-registered and application user IDs changed.

> **Brand note (2026-11-25):** the auth screens and their documentation now use the BTC palette — teal `#66bfbf`, mist `#eaf6f6`, white `#ffffff` and magenta `#ff0063` — with derived roles ink `#0b2e2e`, muted `#356464`, brand text `#0b5c5c`, accent text `#c2004b` and black `#000000` on magenta. This is presentation only: validation, redirects, cookie checks, action names, ARIA, focus management, pending labels and copy are unchanged.

> **Current brand note (2026-11-27):** the active interface has since moved to the locked palette — white `#FFFFFF`, quiet gray `#F5F5F7`, ink `#1D1D1F`, secondary text `#6E6E73`, border `#D2D2D7` and deep teal `#0B5C5C` as the only accent. Website photography is removed in favour of neutral icon panels. The 2026-11-25 note above records an earlier state and is not current design guidance.

---

## 0. Remediation applied (same day)

Every blocker and high-value item in sections 2–3 has been addressed. The findings below remain as the record of what was found; this section records the fixes.

**Blockers**

- **B1** — All seven client components are wired back into their pages with their original props. Added `app/student/projects/[id]/page.tsx` so students no longer get bounced into the founder area. Founder applicants/status controls, premium order + screenshot upload, admin rank/verify/generate and payment confirm/reject are live again. Admin payments now mints 1-hour signed URLs and loads founder names/project titles, so admins can actually see the transfer proof.
- **B2 / B3** — New migration `supabase/migrations/20261124000000_close_security_bypasses.sql`: founder order writes are restricted by policy plus a `BEFORE UPDATE` trigger (confirm/reject is admin-only); shortlist creation moved into a `SECURITY DEFINER` RPC that requires an application or confirmed order; `requestShortlist()` in `app/actions/shortlist.ts` now calls it; the CV proxy and Storage RLS both require a confirmed order for shortlist-based access. The partial unique index now includes `source`; admin regeneration deletes all stale `source='admin'` rows.
- **B4** — E2E suite rewritten around seeded logins and current DOM labels/selectors. It now **skips explicitly** when Supabase is unreachable and hard-fails when `E2E_REQUIRE_DB=1` (set in the opt-in CI `e2e` job). Result locally: `4 skipped`, not 4 false failures.
- **B5** — Fixed in the same migration and in `app/actions/admin-students.ts`.

**High-value items**

- `middleware.ts` → `proxy.ts` (Next 16 convention; build no longer prints the deprecation warning), with refreshed auth cookies copied onto every redirect and static assets / `robots.txt` / `sitemap.xml` excluded from the matcher.
- SVG attributes fixed to React camelCase on `/privacy` and `/terms`; dev log is clean.
- `run-all.sql` appended with the hardened policies so the documented one-paste path matches the migrations.
- `lib/rate-limit.ts` auto-sweeps expired buckets and caps map size; login/signup keys now include client IP; order creation is rate-limited.
- `app/actions/student-profile.ts` now checks `role === 'student'`; CI declares `permissions: contents: read`; `app/actions/auth.ts` comments and Supabase client comments updated for the proxy rename.

**Verification after fixes:** `tsc --noEmit` clean · `npm run lint` 0 errors · `npm test` 45/45 · `npm run build` clean (27 routes, no deprecation warning) · E2E 4 skipped without DB · Playwright re-drove the public/auth/legal pages with zero app console errors.

**Historical verification gap at audit time:** no live Supabase database was reachable, so authenticated end-to-end flows could not run. That Supabase migration path is obsolete: the current schema is `neon/schema.sql`, and authenticated E2E requires the seeded Neon branch and accounts described in `tests/e2e/demo-users.ts`. Current setup steps are in `README.md`.

---

## 1. Changes made in this audit — verified real information

The landing page cited a World Bank statistic. I opened the cited source with Playwright and confirmed it is real and accurate, then added more verified facts from the same source.

**Source verified live:** [World Bank, "Bhutan's Growth Outlook Remains Strong, Job Creation Must Accelerate Amid Global Uncertainty", 9 April 2026](https://www.worldbank.org/en/news/press-release/2026/04/09/bhutan-s-growth-outlook-remains-strong).

- The existing `20.6%` youth-unemployment figure on the page matches the press release exactly. It was not fabricated.
- Added a direct quote from Xavier Furtado (World Bank Group Country Manager for Bhutan): "The challenge is to translate this growth into jobs, particularly for women and young people."
- Added three more verified national indicators: `7.1%` real GDP growth projected for FY25/26 (`6.4%` for FY26/27), `~9%` of the population emigrated as of 2025, and `55%` of employed people in the agrifood system (`71%` of rural workers).
- Added an explicit source link and a note that every figure is a national Bhutan indicator, not a platform result.

Files changed:

- `data/landing.ts` — replaced the unused, diverging `STEPS` constant with a single source of truth for the verified facts (`WORLD_BANK_SOURCE`, `YOUTH_UNEMPLOYMENT`, `CONTEXT_FACTS`, `CONTEXT_QUOTE`).
- `src/app/(marketing)/page.tsx` — imports that data, renders the quote + fact strip in the "Bhutan context" section, and links the source; `src/app/(marketing)/public/page.tsx` re-exports it for the compatibility alias.

Verified in the running app with Playwright: the section renders all new facts, the source link is present, and the browser console shows 0 errors.

---

## 2. Blockers — must fix before any deploy

### B1. Core flows are dead: interactive components were removed from pages (P0, verified)

The redesign replaced the client components with read-only server markup. Grep shows the client components still exist but are **imported nowhere**: `ProjectsClient`, `ProfileForm`, `AdminStudentsClient`, `PaymentsClient`, `BrowseClient`, `ShortlistsClient`, `PostProjectForm`.

- `app/student/projects/page.tsx:69-75` — "Apply" is a `<button type="button">` with no handler. `applyToProject()` is unreachable.
- `app/student/profile/page.tsx:41-86` — read-only profile; no edit form and no CV upload.
- `app/founder/browse-students/page.tsx:63-84` and `app/founder/students/[id]/page.tsx:71-76` — no shortlist button.
- `app/founder/projects/[id]/page.tsx:16-25` — renders only a heading; no applicants, no status controls.
- `app/founder/shortlists/page.tsx:56-112` — read-only order list; no package purchase or screenshot upload.
- `app/admin/students/page.tsx:47-84` — read-only table; no rank, verify, or shortlist generation.
- `app/admin/payments/page.tsx:28-58` — read-only list; no confirm/reject buttons.
- `app/founder/projects/post/page.tsx:58` — `<textarea value="">` with no `onChange` cannot be typed into.

**Fix:** restore each client component with its original props and error/status UI, or rewrite each interaction as an explicit `<form action={serverAction}>` with visible results.

### B2. Founder can self-confirm a payment and unlock the shortlist (P0, verified)

`supabase/migrations/20261024000000_init_btc.sql:316-319`:

```sql
create policy "founders_manage_own_orders"
  on public.shortlist_orders for all
  using (auth.uid() = founder_id) with check (auth.uid() = founder_id);
```

`FOR ALL` includes `UPDATE`. No trigger protects `status`, and the status CHECK allows `confirmed`. The UI gate at `app/founder/shortlists/page.tsx:27-33` trusts `o.status === 'confirmed'` only. A founder can `PATCH /rest/v1/shortlist_orders?id=eq.<own-id> {"status":"confirmed"}` with their own JWT and unlock the paid shortlist and CV links without paying or waiting for admin approval. The server-side admin check in `app/actions/shortlist-order.ts` is bypassed because the attacker never calls it.

Same policy is duplicated in `supabase/premium-shortlists.sql:21-22` and `supabase/run-all.sql:359-360`.

**Fix:** grant founders `SELECT` and `INSERT`, restrict their `UPDATE` to `screenshot_path`, and move status changes into a `SECURITY DEFINER` RPC that checks admin role and `screenshot_path IS NOT NULL`. Audit existing orders for self-confirmed rows.

### B3. Founder can harvest any student's CV and contact email for free (P0, verified)

`supabase/migrations/20261024000000_init_btc.sql:276-279` grants founders `FOR ALL` on `shortlists`, so they can INSERT a row for any `student_id` with no application or confirmed order. Both `app/api/cv/[id]/route.ts` and `supabase/migrations/20261122000000_security_hardening.sql:25-31` treat "a shortlist row exists" as sufficient authorization. `app/founder/shortlists/page.tsx:37-50` then exposes `contact_email` and `cv_path` for that student.

**Fix:** make shortlist INSERT a `SECURITY DEFINER` RPC that requires a confirmed order or an existing application; require a confirmed order in both the CV proxy and the Storage policy.

### B4. E2E suite fails 100% and proves nothing (P0, verified)

`npm run test:e2e` → 4 failed / 4. Every flow dies at `tests/e2e/auth-helper.ts:31`, which waits for `select[name="role"]` — a control removed from the redesigned auth pages. Demo accounts are also `@btc-test.com`, deleted by `20261122000000_security_hardening.sql`. CI does not run E2E at all, so nothing catches B1.

### B5. Shortlist regeneration can fail on a unique-index collision (P1, verified in SQL)

`supabase/migrations/20261105000000_fix_shortlist_race_and_source.sql:15-16` adds a unique index on `(founder_id, student_id) WHERE project_id IS NULL` but omits `source`. `app/actions/admin-students.ts` inserts `source='admin'` rows for the same pairs that founders may already have as `source='founder'` → `23505` duplicate key, "Failed to save shortlist". The cleanup at `app/actions/admin-students.ts:167-177` is also scoped by student IDs, so removed students keep stale admin rows.

**Fix:** include `source` in the index predicate (or use separate partial indexes) and delete all `source='admin'` rows for the founder/project before reinserting, ideally in one RPC.

---

## 3. High-value fixes (after blockers)

- **`middleware.ts:50-54`** — `redirectWithCsp()` creates a fresh `NextResponse.redirect()` and drops cookies refreshed by `setAll()` into `response` (line 71). A token refresh on `/login`, role mismatch, or unauthenticated redirect is lost → possible logout loops. Copy cookies onto redirect responses.
- **`middleware.ts:127-129`** — matcher excludes `public/.*` but not `/robots.txt`, `/sitemap.xml`, or `/images/*`, so those requests still hit Supabase `getUser()` (confirmed in dev logs: ~22 ms per request).
- **`middleware.ts` + `middleware` export** — Next.js 16 warns it is deprecated; the repo deleted the correct `proxy.ts` convention. Migrate with `npx @next/codemod@canary middleware-to-proxy`.
- **`app/privacy/page.tsx:24,30` and `app/terms/page.tsx:24,30`** — raw SVG attributes `stroke-width`, `stroke-linecap`, `stroke-linejoin` produce React "Invalid DOM property" warnings. Use camelCase.
- **`supabase/run-all.sql`** — the documented one-paste setup still contains the recursive profile RLS policy; the `has_role()` fix exists only in a separate migration. Folding the fix into `run-all.sql` prevents 42P17 recursion on fresh installs.
- **`lib/rate-limit.ts`** — in-process `Map`, 5/min login and 3/min signup keyed by email only; `sweepRateLimitBuckets()` is never called. Use a shared store keyed by IP + email, and apply limits to order creation and the CV proxy.
- **`app/admin/payments/page.tsx`** — no signed URL is generated for `screenshot_path`; the "View payment screenshot" control in `payments-client.tsx` is dead code. Admins are asked to confirm transfers they cannot see.
- **`app/actions/student-profile.ts:15,67`** — check authentication but not `role === 'student'` (defense in depth).
- **`.github/workflows/ci.yml`** — add `permissions: contents: read`. Run E2E in CI once fixed.
- **Role INSERT guard** — `profiles` INSERT policy has no `role` check and the trigger is `BEFORE UPDATE` only; add a `BEFORE INSERT` guard.

---

## 4. Verification evidence

| Check | Result |
|---|---|
| `npm run lint` | 0 errors; 2 warnings in generated `coverage/` |
| `npm test` (Vitest) | 6 files, 44/44 passed |
| `npx tsc --noEmit` via `npm run build` | passed |
| `npm run build` | passed, 26 pages generated |
| `npm run test:e2e` | **4/4 failed** at stale `select[name="role"]` |
| `GET /api/health` | **503** `{"status":"degraded","db":"down","error":"TypeError: fetch failed"}` — Supabase unreachable from this environment |
| Public pages (Playwright) | `/` → 200 landing page, `/public` → `308` to `/`, `/login`, `/signup`, `/privacy`, `/terms`, `/robots.txt`, `/sitemap.xml` → 200; 404 page works; no app console errors |
| Protected routes (Playwright) | `/student`, `/founder`, `/admin` → redirect to `/login` correctly |
| Signup form (Playwright) | empty submit blocked by native validation on all four fields |
| World Bank source (Playwright) | page loads; all added facts quoted verbatim from it |

Agents used: `explore` (architecture map), `code-reviewer` (working-tree diff review), `security-reviewer` (auth/RLS/API audit). Framework: `production-audit` skill.

---

## 5. Historical evidence gaps

- **At audit time:** Supabase credentials and a deployed URL were missing, so authenticated flows could not be exercised live and the RLS exploits were confirmed by policy inspection rather than an unauthorized request.
- **Current status:** there is no Supabase dependency, no RLS layer and no pending Supabase migration. The seven unwired components were restored; current setup and verification steps live in `README.md` and `tests/e2e/`.
