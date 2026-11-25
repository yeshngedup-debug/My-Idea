# Page fixes — `/founder` (founder-overview)

Per `reports/page-fixes/MANIFEST.md`. Only `app/founder/page.tsx` and this report
were edited. The dirty working tree was treated as source of truth; no git
checkout/reset/stash/clean was run, and no shared file was touched.

## Files changed

### `app/founder/page.tsx`

- **Line 12 — duplicate brand in the document title (XR1).** Changed
  `title: "Founder Dashboard | Bhutan Tech Connect"` to
  `title: "Founder Dashboard"`. `app/layout.tsx:19` already applies the
  `%s | Bhutan Tech Connect` template, so the old value rendered the brand
  twice. The root template now appends it once.
- **Lines 14-32 — date locale/timezone and year (U1).** Added a small
  `formatPostedDate()` helper that formats with `timeZone: "Asia/Thimphu"`
  and adds the year when the project's Thimphu year differs from the current
  Thimphu year. This replaces the server-locale `toLocaleDateString("en-GB", …)`
  call that omitted the year and could shift the day for a near-midnight
  timestamp.
- **Line 129 — date call site.** Now renders `Posted {formatPostedDate(project.created_at)}`.
- **Line 111 — empty-state CTA target (U2).** `min-h-10` → `min-h-11`, matching
  the 44px target used by the other workspace controls (`min-h-11` at lines 76,
  93 and 122).

No new dependencies, colours, gradients, emoji or copy were introduced. The
palette remains warm paper / forest / vermilion / amber, and existing focus-ring
utilities are unchanged.

## Checks performed

- Read `reports/page-fixes/MANIFEST.md` in full, `reports/page-audits/founder-overview.md`,
  the `/founder` rows and cross-reference notes in
  `reports/page-audits/CONSOLIDATED.md` (lines 47, 136, 212-214), `AGENTS.md`,
  `design/brand-system.md`, `design/brand-guidelines.md`, `design/voice-guide.md`,
  `lib/design-tokens.ts` and `app/globals.css`.
- Read the relevant Next 16 guides before editing:
  `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`
  (pages/layouts, `<Link>`), `05-server-and-client-components.md` (server
  components may read secrets and data close to the source), and
  `10-error-handling.md` (Server Component error states, `redirect`, `notFound`,
  nested error boundaries). Installed version: Next 16.4.5.
- Source-verified every audit lead against the current file before acting:
  U1, U2 and XR1 were confirmed and are fixed above. The audit's
  "verified passing" list still holds for the untouched structure (one `h1`,
  two `h2`s, labelled hero/stats/shortcuts, `aria-hidden` status dot, focus
  rings, contained 320px nav overflow).
- `node_modules/.bin/eslint.cmd app/founder/page.tsx` — clean (no findings).
- Checked `git diff -- app/founder/page.tsx`: the diff also contains pre-existing
  user work (role guard, removal of motion wrappers, `View all` sizing). None of
  that pre-existing work was altered by this pass.
- No full build, test suite or dev server was run, per the manifest.

## Workflow findings routed to the workflow owner

These need shared files and are **not** fixed here.

- **W1 (MED) — role-lookup failure misroutes a founder to the student area,
  then to a generic error page.** `proxy.ts:28-34` collapses any
  `getProfileRole` error to `null`; `proxy.ts:117-126` treats `null` as the
  `student` home, so a `/founder` request from a founder becomes `/student`.
  `lib/neon-data.ts:47-54` rethrows database errors, and the page guard at
  `app/founder/page.tsx:44-47` calls the same helper directly, so the redirected
  `/student` render throws; a project-read failure at `:47` throws the same way.
  `app/error.tsx:33-49` offers only "Try again" and "Back to home" (`/public`),
  with no route back to the founder workspace.
  **Recommended fix (workflow owner):** share one `safeRole`-style helper that
  distinguishes "role is null" from "lookup failed"; on failure return a 503 /
  error state with a verified role home instead of defaulting to `/student`.
  Add a founder-aware error boundary with a `/founder` link and retry. The
  boundary file (`app/founder/error.tsx`) is outside this agent's ownership, so
  it was not created here.

No server action, mutation, `fetch`, API call or client-supplied object ID exists
on this route, so there is no other workflow surface to fix in the owned file.
The `role !== "founder" → redirect("/")` guard at `:45` was left intact as
defence in depth behind the proxy gate.

## Database findings routed to the database owner

Fields/query verification (read-only):

- `listProjectsByFounder` at `lib/neon-data.ts:297-310` runs a parameterized
  `where founder_id = ${founderId}` with `order by created_at desc`. The page
  uses only `id`, `title`, `status`, `created_at` (`:48-53`), all present on
  `public.projects` in `neon/schema.sql:18-33`.
- `status` has a DB check constraint for `open`, `in_progress`, `review`,
  `completed` (`neon/schema.sql:25`). The page counts `open` and `in_progress`
  (`:55-60`) and title-cases any other value for the pill (`:137-140`), so no
  stale or unhandled status value was found. `founder_id` is a foreign key to
  `profiles(id)` (`:22`), and the identity is session-derived; no IDOR path.
- The ordering is index-supported: `neon/schema.sql:87`
  `projects_founder_idx (founder_id, created_at desc)` and
  `supabase/run-all.sql:167-168` `projects_founder_id_idx (founder_id, created_at desc)`.
- `neon/schema.sql:1-4` confirms Neon uses no RLS and authorization stays in
  application code. This route adds no bypass; the global architecture risk is
  already owned by `reports/FINAL-AUDIT.md:59-60` and is not duplicated here.

Findings for the database owner:

- **D1 (LOW) — overview overfetches.** `lib/neon-data.ts:302-305` selects
  `*` with no `limit`; `app/founder/page.tsx:47-53,118` maps every project and
  renders only five, while `:55-60` computes counts from the full array.
  **Recommended fix:** add a narrow bounded helper selecting only
  `id, title, status, created_at` with `limit 5`, plus a separate aggregate
  (`count(*)`, `count(*) filter (where status = 'open')`,
  `count(*) filter (where status = 'in_progress')`) over the same `founder_id`.
  Keep the parameterized predicate, ordering and the list route's unbounded
  helper separate.
- **D2 (LOW) — three session/profile reads per view.**
  `proxy.ts:101-103,124-126` validates the JWT and reads the Neon role;
  `app/founder/page.tsx:36-44` repeats `getUser()` + `getProfileRole()`;
  `components/layout/simple-layout.tsx:26-30` calls `getUser()` +
  `getProfile()` a third time.
  **Recommended fix:** wrap session + profile loading in a request-scoped
  server cache shared by the page and layout, and do not trust a plain
  proxy-set header as authorization in the server components.

## Deliberately not changed

- **W1, D1, D2** — all root causes live in shared files (`proxy.ts`,
  `app/error.tsx`, `lib/neon-data.ts`, `components/layout/simple-layout.tsx`)
  or in files not owned by this slug (`app/founder/error.tsx`). They are routed
  above instead of being partially patched.
- **Pre-existing user work** in `app/founder/page.tsx` (role guard, removal of
  `Reveal`/`HoverLift`/`StaggerGroup` wrappers, `View all` sizing) was left as
  found. The audit had already marked the stat-card and arrow findings as
  fixed, so no motion or layout rewrite was attempted.
- **Copy** was left unchanged: the voice-guide check found no invented metric,
  unearned social proof or banned phrase on this route. Rewording the hero
  would be a larger, non-required edit.
- **Shared `WorkspaceHero`, `WorkspaceStats`, `Badge`, `SimpleLayout` and
  `WorkspaceNav`** are design-system-owned; their audit findings were verified
  as passing for this route and were not edited.
