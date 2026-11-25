# `/founder/browse-projects` second-pass feature-completeness report

Date: 2026-11-25. Scope: second pass after the page owner and phase-2 shared
owners finished. The dirty worktree is the source of truth. Only the owned route
files and this report were touched. No destructive git command, install,
Reticle wiring, dev server, browser tool, build, or `npm test` was used.
Runtime behavior was not driven in this pass; source-verified behavior and
unverified behavior are separated below.

Skills read first: `verify-pagination`, `better-interface`. Repo/design context
and the installed Next.js 16 guides were read before review and edits.

## Files changed in this pass

- `app/founder/browse-projects/browse-projects-client.tsx`
  - Made `aria-controls` conditional on a skills region existing. The
    `View full brief` button no longer points at `skills-${p.id}` when a card has
    no skills (`browse-projects-client.tsx:277-293`).
  - Added `workModeLabel()` so only `onsite` and `remote` render as known modes;
    unknown values now read `Not set` instead of being silently shown as
    `Remote` (`browse-projects-client.tsx:88-92,312-324`). The decorative icon is
    now omitted for an unknown mode instead of showing the remote icon.
- `reports/page-fixes/pass2-founder-browse-projects.md` — this report.

`app/founder/browse-projects/page.tsx` and
`app/founder/browse-projects/loading.tsx` were reviewed and left unchanged in
this pass. Existing phase-1 changes in the owned files were preserved.

## Features verified by source

### Authentication, data mapping, and honesty

- `page.tsx:21-30` requires a Supabase user and redirects to `/login`; a Neon
  role other than `founder` redirects to `/`. No public or student row read is
  performed before that guard.
- `page.tsx:32-36` loads projects, removes the signed-in founder's own rows in
  memory, deduplicates the remaining founder IDs, and batch-loads display names.
  Missing names fall back to `Founder` at `page.tsx:40`. No browser-supplied
  founder or project ID reaches SQL.
- `page.tsx:38-51` maps only displayed fields into `OtherProject`. The cards
  describe real briefs only; no engagement, applicant, or shortlist data is
  invented. The read-only note remains at
  `browse-projects-client.tsx:336-338`.
- Displayed fields exist on `public.projects`
  (`neon/schema.sql:20-33`), and the current shared helper uses an explicit
  projection rather than `select *` (`lib/neon-data.ts:344-353`).

### Filters, count, and keyboard wrappers

- `FILTERS` at `browse-projects-client.tsx:38-44` contains `All` plus exactly the
  four schema statuses allowed at `neon/schema.sql:25`:
  `open`, `in_progress`, `review`, `completed`. `STATUS_LABEL` at `:46-51`
  matches those values.
- Local `status` state at `:99-104` drives both `filtered` rows and the live
  count at `:175-182`. The shared control still receives the same state and
  `onChange`; the wrapper's click/arrow handlers also set that state, so
  `aria-pressed`, count text, and rows cannot diverge by source.
- Arrow/Home/End handling at `:106-157` wraps correctly, moves focus, calls
  `preventDefault()`, and applies the filter at the target position. Click
  handling maps the clicked button by position. Focus rings and 44 px targets
  come from the existing shared control.
- Runtime click, Arrow/Home/End, focus movement, and screen-reader announcements
  were **not** verified. The phase-1 audit's hydration root cause remains
  unproven; the local wrapper is still a mitigation, not runtime proof.

### Search, sort, pagination, and limits

- No search field, sort control, pagination control, page size selector, or
  client-side cap exists in the three owned files. This was verified by source,
  not by browser interaction.
- The route renders all server-loaded rows that pass the local status filter.
  Because no pagination feature exists, pagination correctness cannot be
  claimed as passing. The missing server-side limit is routed to the database
  owner below.
- Sorting is fixed to the helper's `order by created_at desc`
  (`lib/neon-data.ts:347-352`). No misleading sort affordance is rendered.

### Row links and next steps

- Card titles are plain headings at `browse-projects-client.tsx:204-206`; no row
  is wrapped in a link and no card action is rendered. The copy says these are
  read-only briefs. This is a deliberate dead end, not a broken link.
- The adjacent `/founder/projects/[id]` route rejects another founder's project
  (`app/founder/projects/[id]/page.tsx:58-61`), so inventing a row link to it
  would produce a 404. No safe read-only detail route exists in current source.

### Disclosure, status, and field rendering

- `expandedId` at `browse-projects-client.tsx:100` drives one open card at a
  time. The description and skills region carry stable IDs, the control exposes
  `aria-expanded`, and the `+N` control is a real button with an explicit
  accessible label (`:227-293`).
- The second-pass fix removes the invalid `aria-controls` IDREF when a card has
  no skills. Cards with at most six skills and a description still get a
  `View full brief` control that references only the brief region.
- Status dots at `:53-59,218-224` use existing on-palette colors and stay
  `aria-hidden`; the visible text label remains the accessible status.
- Budget, duration, work mode, and deadline render with `Not set` fallbacks
  (`:296-334`). Date-only deadlines are parsed from local calendar parts
  (`:64-78`), so a bare `YYYY-MM-DD` value does not shift backwards in
  UTC-negative time zones.
- Unknown work-mode values now read `Not set` with no misleading icon. This
  keeps the UI honest while the missing database constraint is routed below.

### Empty, loading, and error states

- `browse-projects-client.tsx:185-197` distinguishes `No other projects yet`
  from `No projects with this status` and gives a matching next step. Both are
  derived from the loaded rows and local filter state.
- `loading.tsx:1-5` uses the shared `WorkspaceLoading` with a route-specific
  label and representative row counts. Appearance was not runtime-verified.
- No route-owned error file exists. Shared `app/error.tsx` is route-aware and
  sends `/founder` failures back to the founder workspace; the shared root
  boundary was verified by source only.

## Fixes made in this pass

1. **Accessibility — dangling ARIA target.** The `View full brief` control
   previously included `skills-${p.id}` in `aria-controls` even when no skills
   region was mounted. It now targets only regions that exist
   (`browse-projects-client.tsx:277-293`).
2. **Data honesty — unknown work mode.** `Remote` was the fallback for every
   non-`onsite` value. It is now `Not set`, and no location/globe icon is shown
   for an unknown value (`browse-projects-client.tsx:88-92,312-324`).

No new dependency, route, component, gradient, emoji, invented data, or
wholesale rewrite was introduced. The diff stays within the warm-paper /
forest / vermilion / amber palette.

## Checks performed

- Source-verified every audit and phase-1 lead against the current owned files,
  the schema, the shared helper, the shared control, and the detail route.
- `npx eslint app/founder/browse-projects/page.tsx app/founder/browse-projects/browse-projects-client.tsx app/founder/browse-projects/loading.tsx`
  — clean, exit 0.
- `npx tsc --noEmit --pretty false` — clean, exit 0.
- `git diff --check -- app/founder/browse-projects/...` — no whitespace errors;
  only the expected LF-to-CRLF checkout warning was reported.
- `git status --short` and `git diff -- app/founder/browse-projects/...` were
  inspected. No unrelated dirty file was changed and no uncommitted work was
  discarded.
- Not run by design: `next build`, `npm test`, dev server, browser tools,
  installs, and Reticle wiring.

## Findings routed to shared owners

### Workflow / product owner

- **LOW — the ledger is intentionally a dead end.** The card at
  `browse-projects-client.tsx:204-206,336-338` offers no action, and
  `app/founder/projects/[id]/page.tsx:58-61` rejects non-owners. Recommended:
  either document the page as an inspiration ledger, as the current copy does,
  or add a separately authorized read-only detail/intro route with no applicant
  data. No next step was invented in this pass.
- **Unproven runtime filter behavior.** The local wrappers at
  `browse-projects-client.tsx:106-157` are source-correct, but click,
  Arrow/Home/End, focus, and live-region effects were not driven. Recommended:
  with a running app, assert that `aria-pressed`, the count text, and rendered
  rows all change together. Do not treat the source fix as runtime proof.

### Design-system owner

- **LOW — local `SegmentedControl` wrapper is still functional.** Phase 2 added
  opt-in `selectOnArrow` at `components/interactive/segmented-control.tsx:37,43-73`;
  the page wrapper at `browse-projects-client.tsx:162-174` is redundant but
  harmless. Recommended: after the runtime filter check passes, simplify the
  page to pass `selectOnArrow` instead of maintaining its own key/click mapping.
  It was not changed here because the current wrapper works by source and
  preserves pre-existing user work.
- Root error handling remains shared. `app/error.tsx` is route-aware; no
  page-owned error boundary was added. If runtime error copy or recovery links
  are wrong, route that to the design-system owner rather than duplicating a
  boundary here.

### Database owner

- **MED — platform-wide read still relies on page-level authorization.**
  `page.tsx:32-35` calls `listAllProjectsWithDetails()` and filters out the
  signed-in founder after fetching. The helper at `lib/neon-data.ts:344-353`
  reads `public.projects` without a founder predicate and Neon has no RLS
  (`neon/schema.sql:1-4`). Recommended: add a role-aware, read-only helper such
  as `listProjectsExceptFounder(founderId, ...)` and call it from this route.
- **LOW — unbounded read despite the explicit projection.** The helper at
  `lib/neon-data.ts:344-353` now selects named columns but has no `limit` or
  cursor, so the full table is fetched and sorted. Indexes exist at
  `neon/schema.sql:100-101`, but no pagination contract exists. Recommended:
  provide a bounded/cursor variant and move callers to it; add an index only if
  a measured query plan justifies one.
- **LOW — `work_mode` has no database constraint.**
  `neon/schema.sql:31` allows any non-empty text with a `remote` default. The
  UI now shows `Not set` for unknown values instead of lying, but the stored
  data contract is still weak. Recommended: add a check constraint for the
  product's allowed modes if `onsite`/`remote` is the intended contract.
- Verified clear: project statuses match the `open`, `in_progress`, `review`,
  `completed` constraint at `neon/schema.sql:25`; profile names are fetched in
  one parameterized `id = any(...)` query at `lib/neon-data.ts:88-97`, so this
  route has no N+1 or IDOR path; there is no server action, route handler,
  mutation, or browser-supplied ID on the route.

## Deliberate non-changes

- No search, sort, pagination, page-size control, or row link was added. No
  audit, spec, or product copy in scope calls for those features, and no safe
  read-only detail route exists. Adding them would be new behavior, not a fix.
- No shared component, server action, page outside this route, schema, query
  helper, other report, `MANIFEST.md`, or phase-2 report was edited. Findings
  that live outside ownership are routed above instead.
- The stale W1 claim that failed role lookup sends founders to `/student` was
  not re-routed. Phase 2 changed `proxy.ts` to return `{ role, ok }` and sends
  unknown roles to `/` (`reports/page-fixes/shared-workflow.md:52-57`).
- The stale `select *` wording from phase 1 was not repeated. The shared
  project helper now uses an explicit projection
  (`lib/neon-data.ts:344-353`); only its unbounded scope remains.
- No tests were added. Runtime behavior is out of scope here, and the current
  suite has no browser harness for this route without starting a server.
- Existing phase-1 and phase-2 uncommitted work was preserved, including the
  local filter wrapper, metadata title fix, status-dot map, disclosures, icon
  changes, and date parsing.
