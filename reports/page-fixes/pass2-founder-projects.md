# `/founder/projects` second-pass report

Date: 2026-11-25. The dirty worktree is the source of truth. No destructive git
command, build, test suite, dev server, browser tool, install, or Reticle wiring
was used. Skills `better-interface` and `test-error-states` were loaded.

## Files changed

- `app/founder/projects/projects-client.tsx`
  - Replaced the local capture-phase keyboard wrapper with the shared
    `selectOnArrow` opt-in at `:125-132`; arrow/Home/End still focus and select
    once. Removed the redundant `ref`, handler, and `KeyboardEvent` import and
    updated the file comment at `:3-11`.
- `app/founder/projects/error.tsx`
  - Changed "Try again" from `reset` to Next 16's stable `retry` at `:7-13,32-38`.
    The installed Next 16.4.5 docs say `retry()` re-fetches and re-renders the
    boundary children, while `reset()` only clears the error state
    (`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/error.md:117-121,155-157,331`).
- `reports/page-fixes/pass2-founder-projects.md` — this report.

`app/founder/projects/page.tsx` and `app/founder/projects/loading.tsx` needed no
change.

## Features verified

Source inspection only; runtime hydration and visual behavior were not driven.

- **Auth and data.** `page.tsx:27-50` awaits `searchParams`, allow-lists
  `?status=`, gets the founder from `supabase.auth.getUser()`, and reads only
  that founder's rows through `listProjectsByFounder(user.id)`. No request data
  scopes the query. The heading count is `${projects.length} posted`, not a
  invented stat.
- **Destinations.** `/founder/projects/post`, `/login`, `/founder`, and
  `/founder/projects/[id]` all exist. Signed-out protected requests redirect to
  `/login` (`proxy.ts:105-118`); cross-role founder requests go to the user's
  role home (`proxy.ts:128-138`). The defensive signed-in card is at
  `projects-client.tsx:83-98`.
- **Rows.** Mobile and desktop row links both target
  `/founder/projects/${p.id}` (`:184-190,245-251`) and carry the unique
  accessible name `View applicants for {title}`. The detail page checks UUID
  shape, session, and ownership before rendering
  (`app/founder/projects/[id]/page.tsx:42-74`).
- **Filters.** Status values and labels align across `FILTERS`/`STATUS_LABEL`
  (`projects-client.tsx:24-37`), `page.tsx:19-35`,
  `app/actions/projects.ts:138-139`, and `neon/schema.sql:25`; unknown values
  fall back to title case (`:79-81`). Filtering is derived from props
  (`:64-70`), performs no fetch or write, and reports changes in a polite
  `role="status"` count (`:116-140`). Zero matches show a real empty state and
  a working `Show all projects` reset (`:142-157`). `key={initialFilter}`
  (`page.tsx:70-75`) handles later filtered navigations.
- **Keyboard and a11y.** `components/interactive/segmented-control.tsx:19-23,37,43-73`
  provides `selectOnArrow`; this page now opts in. Long titles wrap with `title`
  attributes, dates include the year (`:72-77`), row links meet the 44px
  target convention, and the desktop title is `th scope="row"`. Focus/ring
  colors match the warm-paper / forest / vermilion palette; no gradient,
  violet, or emoji was added.
- **Empty/loading/error.** `projects-client.tsx:100-114` shows the true empty
  state with a post CTA. `loading.tsx:2-18` uses `role="status"`, an accessible
  label, `aria-busy`, readable text, and `motion-reduce:animate-none`.
  `error.tsx` logs the error, uses `role="alert"`, avoids raw error text, and
  now offers a real refetch plus a founder-home link.

## Workflow findings routed to the workflow owner

- **LOW — application status check-then-update remains.**
  `app/actions/projects.ts:199-225` reads current status and checks the
  transition map, then calls a helper that updates by application id alone
  (`lib/neon-data.ts:439-465`). Observed: no active bypass today because the
  action checks project ownership and rejects regressive transitions first; the
  residual issue is a TOCTOU/narrowing gap for any direct caller. Recommended:
  make the write one founder-scoped conditional statement and treat zero
  affected rows as an authorization/conflict failure. Not edited here.
- **Verified resolved; not re-raised.** The phase-1 regressive-status lead is
  stale: the detail UI mirrors the server map and disables illegal buttons
  (`app/founder/projects/[id]/project-detail-client.tsx:54-75,294-317`), and the
  server enforces the map at `app/actions/projects.ts:138-145,195-225`.
- No workflow defect lives on `/founder/projects`; it performs no mutation,
  redirect, status transition, URL write, or server action.

## Database findings routed to the database owner

- **LOW — founder history is still unbounded.**
  `lib/neon-data.ts:316-332` selects explicit columns but has no limit or
  cursor. Observed: a founder with a long history loads every row although the
  page renders only id/title/status/date. Recommended: add a bounded or
  paginated founder-list variant and have this page opt in; do not silently
  truncate real rows. Not edited here.
- **Phase-1 D1 is stale.** `listProjectsByFounder()` no longer uses `select *`;
  it uses an explicit projection at `lib/neon-data.ts:321-327`. Do not re-fix.
- Verified: `neon/schema.sql:100-101` indexes founder history and status;
  `neon/schema.sql:25` bounds status to the four UI values; the query is
  parameterized; and Neon's no-RLS posture at `neon/schema.sql:1-4` keeps
  authorization in application code.

## Design-system findings

- **Resolved; not re-raised.** The phase-1 W3 lead is stale because
  `selectOnArrow` now exists in the shared component and this page uses it.
  No shared file was edited.

## Deliberately not changed

- `page.tsx` and `loading.tsx`: no confirmed defect.
- URL synchronization for clicked filters: deep-link preselection is already
  present; router state would add churn without fixing a reported symptom.
- Shared components, DB/schema, server actions, proxy, and detail-page files:
  outside this route's ownership; findings are routed only.
- Browser/error-forcing, build, tests, and dev-server verification were excluded
  by the pass constraints, so state claims are static-source claims.

## Checks performed

- `npx eslint app/founder/projects/page.tsx app/founder/projects/projects-client.tsx app/founder/projects/error.tsx app/founder/projects/loading.tsx`
  — clean, exit 0.
- `npx tsc --noEmit --pretty false` — clean, exit 0.
- Source verification of all cited owned, shared, action, database, route, and
  design references. Pre-existing uncommitted work was preserved.

## Self-evaluation

- Accuracy: 4 — all claims are source- or tool-backed; runtime claims are
  explicitly static-only because browser checks were forbidden.
- Completeness: 5 — listing, navigation, filters, status language, row links,
  empty/error/loading states, data claims, fixes, and routed findings are covered.
- Clarity: 4 — structured by concern, but line references may drift if other
  agents edit cited shared files concurrently.
- Actionability: 5 — each routed finding has a current `file:line`, observed
  behavior, and recommended fix; checks are reproducible.
- Conciseness: 4 — the report is compact but still longer than a one-page note
  because the manifest requires separate routed sections.

Overall: 4.4. No fixable substantive gap remains within the pass constraints.
