# Second-pass feature completeness — `/founder` (founder-overview)

Date: 2026-11-25. Scope: owned file `app/founder/page.tsx` plus this report.
The dirty working tree was treated as the source of truth. No destructive git
command, dev server, browser, full build, full test suite, or shared-file edit
was used. Skills applied: `better-interface` and `test-error-states`.

## Files changed

### `app/founder/page.tsx`

- **Line 73 — hero copy no longer promises an automatic unlock.** Changed
  "unlock a shortlist when you are ready" to "request a shortlist when you are
  ready". `confirmOrder()` only sets `status = 'confirmed'`
  (`app/actions/shortlist-order.ts:205-213`); it does not create or rank rows in
  `public.shortlists` (`neon/schema.sql:78-85`). The founder can request a
  shortlist, but an admin still finalizes and ranks it
  (`app/founder/shortlists/shortlists-client.tsx:452`).
- **Line 155 — "verified" claim removed from the Find talent shortcut.**
  Changed "Browse verified student profiles" to "Browse student profiles with
  CVs". `listBrowseableStudents()` selects a completed profile with a CV
  (`lib/neon-data.ts:698-709`) but has no `verified = true` predicate, even
  though `student_profiles.verified` exists (`neon/schema.sql:74`).
- **Line 157 — shortlist shortcut describes the real state.** Changed "Track
  payment and unlock a list" to "Track payment and shortlist progress". The
  shortlist route already tells founders that ranked results appear after admin
  finalization; the old wording promised a release before that step.

No styling, routing, data-fetching, or component structure was changed. No new
dependency or route was added. The palette remains warm paper / forest /
vermilion / amber.

### `reports/page-fixes/pass2-founder-overview.md`

- Created this second-pass report.

## Features verified

Verification was source-based; runtime forcing of empty, loading, or error
states was unavailable under this pass's constraints.

| Area | Current source evidence | Result |
|---|---|---|
| Auth / role gate | `app/founder/page.tsx:35-45` redirects unauthenticated users to `/login`, re-reads the Neon role, and sends non-founders to `/`. `proxy.ts:117-138` now distinguishes failed lookups from unknown roles and uses an exact `/founder` path boundary. | Pass. Fail-closed; no client-supplied identity is trusted. |
| Stats cards | `:47-66` computes three figures from `listProjectsByFounder(user.id)`: total, `open`, `in_progress`. `neon/schema.sql:25` allows `open`, `in_progress`, `review`, `completed`; the two counted literals are current. | Pass. Figures are derived from the owner-scoped rows; no stale status literal. |
| Recent projects | `:118-144` renders `projects.slice(0, 5)` after the helper's `order by created_at desc` (`lib/neon-data.ts:321-327`). Row links target `/founder/projects/${project.id}`, whose page re-checks project ownership. | Pass. Ordered, bounded display and safe destination. |
| Dates | `:14-32` formats with `Asia/Thimphu` and adds the year for a different Thimphu year. `lib/neon-data.ts:39-44` normalizes driver timestamps before the row reaches the page. | Pass in source. Prior-year and near-midnight rows were not runtime-forced. |
| Status badges | `:132-141` uses the stored status text and marks the decorative dot `aria-hidden="true"`; `in_progress` is humanized. | Pass. Status is not conveyed by color alone. |
| Links / quick actions | Hero and empty-state CTAs target `/founder/projects/post`; `View all` targets `/founder/projects`; rows target project detail; shortcuts target `/founder/browse-students`, `/founder/projects`, and `/founder/shortlists`. All five route targets exist. | Pass. All page controls are `min-h-11` and carry `focus-visible` rings. |
| Shortcut claims | "Manage your briefs and applicants" matches the projects list and detail views (`app/founder/projects/page.tsx:60`, `app/founder/projects/[id]/page.tsx:35-89`). "Find talent" and "Shortlists" claims were corrected above. | Pass after copy fixes. |
| Empty state | `:100-115` renders only when `projects.length === 0`, with a 44px CTA and explanatory copy. | Pass in source; the zero-project branch was not runtime-forced. |
| Loading state | `app/founder/loading.tsx:1-5` renders `WorkspaceLoading` with `role="status"` and a stable hero/stats/list shape (`components/layout/workspace-loading.tsx:14-45`). | Pass. No shimmer or layout jump is introduced. |
| Error state | Throws from this server component bubble to `app/error.tsx`; it is now route-aware (`:25-30`) and offers "Try again" plus "Back to founder workspace" (`:50-56`). | Pass in source. A Neon outage was not simulated; no page-owned error file is needed. |
| Structure / a11y | One `h1`, two `h2`s, labelled hero/stats/shortcuts regions, and existing focus rings were preserved. Focus rings on forest use an explicit paper offset. | Pass. No ARIA or focus change was needed. |

## Checks performed

- `npx eslint app/founder/page.tsx` — clean, no findings.
- `npx tsc --noEmit --pretty false` — clean, no findings.
- `git diff -- app/founder/page.tsx` — reviewed; only the three copy lines above
  were added by this pass. Pre-existing user work (role guard, title fix, date
  helper, motion-wrapper removal, `View all` sizing, empty-state CTA sizing)
  was left intact.
- Source verification: `AGENTS.md`, the installed Next 16 guides
  (`03-layouts-and-pages.md`, `05-server-and-client-components.md`,
  `10-error-handling.md`), `app/globals.css`, `lib/design-tokens.ts`, the brand
  and voice guides, the phase-1 page report, the three phase-2 shared reports,
  the original audit, current owner-scoped data helpers, schema, auth gate,
  loading/error boundaries, and destination pages for every link.
- Contrast spot-check for the retained `#657069` meta text: approximately 5.11:1
  on `#fffefa` and 4.61:1 on `#f5f2ea`, above the 4.5:1 small-text threshold.
- Not run by design: dev server, browser tooling, full `next build`, `npm test`,
  and live database mutation. Error/empty/loading branches are therefore
  statically verified, not runtime-verified.

## Workflow findings routed

These live outside the owned file and were not edited.

- **Payment confirmation still claims an unlock before admin finalization
  (MED).** `app/actions/shortlist-order.ts:213` returns
  "Payment confirmed. Shortlist unlocked." after only setting the order status
  (`205-206`). The same promise remains in
  `components/founder/live-order-status.tsx:19` and
  `components/ui/status-timeline.tsx:182`, while
  `components/ui/status-timeline.tsx:187` and
  `app/founder/shortlists/shortlists-client.tsx:452` correctly name admin
  finalization. **Recommended (workflow owner):** either create and rank the
  shortlist rows before returning success, or change the action and shared
  status copy to "Payment confirmed. An admin finalizes and ranks the shortlist
  before release." This page's copy is now aligned with the latter.
- **Role-lookup failure has no explicit retry state (MED, already routed).**
  `proxy.ts:121-138` now fails closed instead of defaulting to `/student`, and
  `app/error.tsx:25-30` links back to the role workspace. The older W1 finding
  is stale; a distinct retryable error state would still need a shared
  workflow/error-boundary change. No partial patch was attempted here.

## Database findings routed

- **Overview still reads all founder projects to render five (LOW).**
  `lib/neon-data.ts:316-332` now uses an explicit column projection, but it has
  no `limit`; `app/founder/page.tsx:47-66` maps every row for the counts and
  `:118` slices five for display. **Recommended (database owner):** add a
  narrow overview helper selecting `id, title, status, created_at` with
  `limit 5`, plus an aggregate query for total/open/in-progress counts. Keep
  the owner predicate, ordering, and the unbounded projects-list helper
  separate.
- **"Verified" is not enforced for the browse directory (LOW, copy corrected
  here).** `lib/neon-data.ts:701-709` filters on CV/profile completeness but not
  `verified`; `neon/schema.sql:74` has the column and defaults it to `false`.
  **Recommended (database owner):** if the directory is meant to be
  verified-only, add `verified = true` to the query and keep the projection
  narrow; otherwise leave the corrected copy as the contract.
- **Shortlist finalization is not representable in the schema (MED).**
  `neon/schema.sql:78-85` has no per-shortlist rank, `finalized_at`, or released
  state; `rank` lives only on `student_profiles` (`neon/schema.sql:73`). The
  page no longer promises an unlock, but the workflow still needs a data model
  for admin finalization. **Recommended (database owner):** add a per-founder,
  per-project rank and a release/finalization marker with appropriate unique
  constraints before restoring any "unlocked" copy.
- **Repeated session/profile reads remain (LOW).** `proxy.ts`, this page
  (`:35-45`), and `components/layout/simple-layout.tsx:26-30` each read auth
  and role/profile data on a `/founder` view. **Recommended:** share one
  request-scoped verified session/profile loader; do not replace server checks
  with an untrusted proxy header.
- No IDOR, injection sink, stale project status literal, or ownership bypass was
  found in this page's data path.

## Deliberately not changed

- **Shared UI and layout:** `WorkspaceHero`, `WorkspaceStats`, `Badge`,
  `SimpleLayout`, `app/error.tsx`, and `app/founder/loading.tsx` are owned
  elsewhere and already pass the route's structural/a11y checks.
- **`app/founder/error.tsx`:** not created. It is outside this slug's ownership,
  and the shared root boundary is now route-aware.
- **Motion wrappers, stat layout, arrow glyphs, and token-only rewrite of
  existing hex utilities:** the current source already reflects passing audit
  findings and pre-existing user work; a broad refactor would add risk without
  fixing a defect. Retained `#657069` text meets small-text contrast on both
  surfaces used here.
- **Shared shortlist, actions, schema, proxy, and database helpers:** findings
  are routed above instead of being partially patched from a page-owned file.
- **Runtime state forcing:** skipped because the pass forbids dev servers and
  browser tooling; all state claims are explicitly labelled source-verified.

## Final summary

The `/founder` dashboard's cards, counts, routes, quick actions, dates, empty
state, loading shape, and error recovery path are complete against current
source. Three data-claim defects were fixed in page copy: no automatic shortlist
unlock, no unsupported "verified" filter, and no premature "list unlocked"
promise. ESLint and TypeScript are clean; remaining gaps are routed to the
workflow and database owners.
