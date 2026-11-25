# Second-pass verification — `/founder/browse-students` (`founder-browse-students`)

Scope: source-verified pass after the phase-1 page fixes and the three completed
phase-2 shared-owner passes. Only `app/founder/browse-students/page.tsx`,
`app/founder/browse-students/browse-client.tsx`, and this new report were within
edit scope. The dirty worktree was treated as the source of truth; no
`git checkout`, `reset`, `stash`, `clean`, install, dev server, full build, test
suite, or browser tooling was used. Skills loaded before the pass:
`verify-pagination` and `frontend-a11y`.

## Features verified

### Authorization and private data

- `app/founder/browse-students/page.tsx:23-39` authenticates with
  `supabase.auth.getUser()`, awaits `getProfileRole(user.id)`, and redirects
  before any directory, shortlist, project, or order read. A signed-in
  non-founder never reaches the data block.
- `app/founder/browse-students/page.tsx:56-70` serializes only eight directory
  fields plus the computed eligibility flag. `cv_path`, `cv_url`,
  `contact_email`, `rank`, `verified`, and timestamps stay out of the client
  payload. `lib/neon-data.ts:698-719` already narrows the query to the same
  eight fields.
- The signed-CV gate was re-read at `app/api/cv/[id]/route.ts:62-104`. Founders
  get a signed URL only for an application to their own project, or for a
  shortlist row backed by a confirmed general/project order. Admins retain
  unrestricted access. The browse page itself makes no CV or proof claim.

### Row actions

- `View full profile` at `app/founder/browse-students/browse-client.tsx:205-207`
  links to the existing `/founder/students/[id]` route. That route validates the
  UUID, checks the viewer role, and resolves the linked student at
  `app/founder/students/[id]/page.tsx:34-55`.
- Eligible cards keep `Request shortlist`; the server-computed flag at
  `app/founder/browse-students/page.tsx:41-66` mirrors the action gate at
  `lib/neon-data.ts:801-818`: an application to any founder-owned project, or a
  confirmed general (`project_id is null`) order. `listProjectsByFounder()` has
  no status filter, so it matches the action's join at
  `lib/neon-data.ts:537-552`.
- Ineligible cards get `View shortlist options` at
  `app/founder/browse-students/browse-client.tsx:235-243`, which resolves to the
  existing `/founder/shortlists` route. No predictably rejected button remains.
- `shortlistedIds` is scoped to `source === 'founder' && project_id == null`
  (`page.tsx:41-45`), matching the action's idempotency check at
  `lib/neon-data.ts:820-829`. Admin and project rows no longer disable the
  general request.
- The action contract at `app/actions/shortlist.ts:36-60` now logs raw driver
  detail server-side and returns either explicit relationship guidance or a
  friendly generic failure. Both messages render verbatim in the card status.

### Search, filters, and result states

- Search matches skills, college, and name
  (`browse-client.tsx:56-66`), and the input label states exactly that. The
  native `type="search"` control can be cleared.
- Availability uses the shared `SegmentedControl` with an `All` option, a named
  `role="group"`, `aria-pressed` on each option, and 44 px targets
  (`browse-client.tsx:23-30,118-125`;
  `components/interactive/segmented-control.tsx:75-107`). Every option stays in
  the Tab order; Enter/Space selects. Arrow/Home/End move focus. Leaving
  `selectOnArrow` at its default is intentional for a group of toggle buttons
  and is not a dead end.
- The mounted result count at `browse-client.tsx:127-131` is a polite live
  region. An unknown availability value from the database still renders under
  `All`, so the filter cannot trap the user.
- Empty states at `browse-client.tsx:152-163` distinguish "no directory rows
  yet" from "no rows match these filters" and give the correct next step. There
  is no separate loading state in the owned files; the parent
  `app/founder/loading.tsx` and shared root `app/error.tsx` cover this route and
  belong to other owners.
- Action feedback is both announced in the persistent live region
  (`browse-client.tsx:133-150`) and shown under the clicked card
  (`browse-client.tsx:245-251`). `try/catch/finally` at
  `browse-client.tsx:68-90` prevents a rejected or thrown action from leaving a
  card stuck on `Sending...`.

### Accessibility and palette

- Card headings sit under the screen-reader `h2` at `browse-client.tsx:127`.
  Both row actions have student-specific accessible names
  (`browse-client.tsx:214-220,238`).
- The pending button now exposes `aria-busy` and an accessible name that matches
  its visible `Sending...` state. The decorative search icon is
  `aria-hidden` and `focusable="false"` (`browse-client.tsx:97-108`).
- All row actions and filter buttons use `min-h-11` (44 px) and visible
  `focus-visible` rings. New CSS uses only existing warm-paper, forest,
  vermilion, and amber tokens; no gradients, violet, emoji, or new dependency
  was introduced.

## Fixes made this pass

### `app/founder/browse-students/browse-client.tsx`

- **Lines 73-77 — removed stale error-text shim.** The phase-1 client still
  rewrote `Shortlist request failed: ...` and carried a comment claiming the
  action leaked raw driver text. The shared workflow fix at
  `app/actions/shortlist.ts:48-53` now returns a sanitized message, so the
  client passes `res.message` through directly. This removes the last owned-file
  dependency on the old action contract without weakening error handling.
- **Lines 164-167, 209-231 — pending-state ARIA now matches the UI.** Added a
  local `isPending` flag and `studentName`, set `aria-busy` while a request is
  in flight, and changed the accessible name to
  `Sending shortlist request for <name>` while the visible label reads
  `Sending...`. The settled names remain `Shortlisted: <name>` and
  `Request shortlist for <name>`.
- **Line 238 — reused `studentName`** for the ineligible link's accessible name
  instead of repeating the nullish fallback.

### `app/founder/browse-students/page.tsx`

- No change this pass. Its phase-1 auth ordering, scoped shortlist state, and
  server-side eligibility gate were re-verified against the current shared data
  and action code and still hold.

## Checks performed

- `npx eslint app/founder/browse-students/page.tsx app/founder/browse-students/browse-client.tsx`
  — exit 0, no errors or warnings.
- Scoped typecheck of the two owned files plus `next-env.d.ts` via a temporary
  config extending the repo `tsconfig.json` —
  `npx tsc --noEmit --pretty false -p <temp-config>` — exit 0. The temporary
  config was outside the repo and removed after the check.
- For context, the unscoped `npx tsc --noEmit --pretty false` was also observed
  to fail only at `app/student/projects/page.tsx:111` and
  `app/student/projects/projects-client.tsx:327`, both outside this slug's
  ownership. Those pre-existing errors were not touched here.
- `git diff --check -- app/founder/browse-students/page.tsx app/founder/browse-students/browse-client.tsx`
  — clean apart from the existing LF/CRLF normalization warning.
- Re-read the Next 16 guides for layouts/pages, server/client boundaries,
  data mutation, error handling, and linking before judging these files.
  Re-read `AGENTS.md`, the brand/voice guides, `app/globals.css`,
  `lib/design-tokens.ts`, the manifest, the phase-1 report, the three phase-2
  shared reports, and the audit. Source-verified the current action, CV proxy,
  data helpers, detail page, shortlist route, `SegmentedControl`, `Badge`, and
  `Input`.
- No full `next build`, `npm test`, dev server, or browser tool was run, per
  scope. Runtime behaviour was not re-observed; the earlier `NO_SERVER`
  observation still applies.

## Routed findings

### Workflow / other page owners

- **CV-access wording is less precise than the signed-URL rule —**
  `app/founder/students/[id]/page.tsx:126-129`. The copy says CV access opens
  with "a confirmed premium shortlist". The actual gate at
  `app/api/cv/[id]/route.ts:79-98` and `lib/neon-data.ts:963-985` requires a
  shortlist row for that student plus a confirmed order, or an application to
  a founder-owned project. `app/how-it-works/page.tsx:89` already words this
  correctly. **Recommended fix (founder-student-detail owner):** reword to
  "CV access opens when this student applies to one of your projects, or when
  you shortlist them under a confirmed paid plan." Not edited here because that
  page is outside this slug's ownership.
- **Rejection-branch regression coverage is still absent —**
  `tests/e2e/founder-flow.test.ts:90-99`. The seeded test proves only the happy
  path. **Recommended fix (workflow/test owner):** add a founder with no
  application and no confirmed general order, assert the browse card shows
  `View shortlist options`, and assert a direct action call returns the
  guidance message without inserting a general founder shortlist row.
- The stale client-side error-prefix dependency is **resolved**, not re-routed:
  `app/actions/shortlist.ts:48-53` now sanitizes the message before it reaches
  any caller.

### Database owner (carried forward, still open)

- **N+1 and PII over-fetch in eligibility computation —**
  `app/founder/browse-students/page.tsx:51-54` calls `listProjectApplicants()`
  once per founder project, and `lib/neon-data.ts:508-514` fetches `cv_path`
  and `contact_email` even though this page needs only `student_id`.
  **Recommended fix:** add one batched, ID-only helper such as
  `listShortlistEligibleStudentIds(founderId)` using `exists` against
  `applications join projects` plus a confirmed-general-order check, and use it
  from both this page and `lib/neon-data.ts:801-818`. Already routed in the
  phase-1 and shared-database reports; no new defect was introduced.
- **Unbounded directory read —** `lib/neon-data.ts:698-709` has no `limit` and
  orders only by `updated_at`. **Recommended fix:** add cursor pagination with
  `updated_at desc, id desc` before the directory grows. The first page of the
  fix (narrow projection) is already present.

## Deliberately not changed

- No shared file was edited: `app/actions/shortlist.ts`, `app/api/cv/[id]/route.ts`,
  `lib/neon-data.ts`, `proxy.ts`, `neon/schema.sql`, `components/**`, tests,
  `MANIFEST.md`, or another agent's report.
- No route-specific loading/error boundary was added. The parent founder
  loading boundary and shared root error boundary are owned elsewhere.
- No `selectOnArrow` change was made. The shared component documents
  focus-only arrows by default; Tab plus Enter/Space is a complete keyboard
  path for toggle buttons.
- No extra "Clear filters" button was added. The search field is natively
  clearable and the availability group always offers `All`, so the empty state
  has a reachable recovery path without new UI.
- No palette, voice, layout, or dependency rewrite. Pre-existing uncommitted
  work in both owned source files was preserved.
