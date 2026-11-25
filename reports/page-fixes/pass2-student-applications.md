# `/student/applications` second pass - feature completeness

Date: 2026-11-25. Scope: `app/student/applications/page.tsx`,
`app/student/applications/applications-client.tsx`, and this report only, per
`reports/page-fixes/MANIFEST.md`. The dirty worktree was treated as the source of
truth. All phase-1 edits and all other agents' uncommitted work were preserved.
No shared file, other page, other report, DB file, server action, config, or
`MANIFEST.md` was edited. No install, Reticle wiring, dev server, build, npm
test, or browser tooling was used.

Skills loaded first: `verify-pagination`, `verify-optimistic-update`.

## Features verified against current source

### List, ownership and status contract

- `app/student/applications/page.tsx:35-50` reads the student id from
  `supabase.auth.getUser()`, calls `listStudentApplications(user.id)`, and maps
  only the fields the list renders. No query-string id is trusted.
- `lib/neon-data.ts:467-486` uses one parameterized join,
  `where a.student_id = ${studentId}`, ordered by `created_at desc`. No N+1 read
  was introduced by this pass.
- The row statuses rendered by `STATUS_LABEL`, `STATUS_DOT`, the filter values,
  `STUDENT_APPLICATION_STEPS`, and the server transition map all use the current
  four values: `pending`, `shortlisted`, `accepted`, `rejected`.
- `app/actions/projects.ts:138-145,217-222` now enforces
  `pending -> shortlisted|rejected` and `shortlisted -> accepted|rejected`.
  `app/founder/projects/[id]/project-detail-client.tsx:294-313` mirrors that map
  by disabling current and invalid transitions. The earlier regression finding
  is resolved in current source and was not re-edited.

### `?status=` preselection, filters and history

- `page.tsx:17-34` accepts the Next 16 `searchParams` promise, validates a single
  `status` string against `all|pending|shortlisted|accepted|rejected`, and falls
  back to `all` for missing, repeated, or unknown values. `page.tsx:64` passes
  the validated value as `initialFilter`.
- `applications-client.tsx:51-78` seeds local state from `initialFilter`, updates
  it immediately on filter change, and writes the same value to `?status=` with
  the native `window.history.pushState` API. Unrelated query keys are preserved,
  `status` is removed for `All`, and the documented Next 16 API was read at
  `node_modules/next/dist/docs/01-app/01-getting-started/04-linking-and-navigating.md:344-375`.
- `applications-client.tsx:61-69` listens for `popstate`, so browser Back and
  Forward re-read the URL. The static chain is present. Actual Back, Forward,
  reload, and deep-link behaviour was not driven in a browser under this scope.
- `SegmentedControl` renders five real toggle buttons with `aria-pressed`, a
  labelled `role="group"`, and Enter or Space selection. The polite live count at
  `applications-client.tsx:120-122` changes with the filtered set.

### Timeline, actions and copy

- `StatusTimeline` in `components/ui/status-timeline.tsx:37-59,122-141` is
  shared and unchanged here. Its terminal branch now says "Earlier stage"
  instead of relabelling reached stages "Not yet", and the student next-step
  copy describes real behaviour. Full history rendering is still not available
  to this route, see Routed findings below.
- Row actions are navigation only. No withdraw, cancel, or delete action exists
  for applications in current source, and `reports/page-audits/student-applications.md:153`
  records that no requirement establishes one. None was invented.
- Page and empty-state copy remains plain and factual. No em-dash, invented
  notification, unearned claim, emoji, or new route was added.

### Empty, error and loading states

- `applications-client.tsx:86-103` covers the no-applications state with a real
  browse link.
- `applications-client.tsx:124-139` covers a filter with no matching rows and
  returns to `All` through the same URL-syncing handler.
- A thrown data error reaches the shared `app/error.tsx:19-64`, which offers
  "Try again" and a role-aware "Back to student workspace" recovery link.
  `app/student/loading.tsx:1-5` covers the server fetch. Neither file is owned by
  this pass, and neither needed a route-local replacement.

### Assigned verification skills

- `verify-pagination`: this page has no page controls, cursor, or next-page
  contract. The owner-scoped read is currently unbounded; that remains a shared
  database scale item, not a route-local fix.
- `verify-optimistic-update`: this route performs no mutation. Filter state is
  local and reversible through browser history, so there is no optimistic server
  result to roll back.

## Fixes made in `app/student/applications/applications-client.tsx`

1. `ApplicationRow.project` now includes `id`. `lib/neon-data.ts:381-405,467-486`
   already selects and maps `p.id`, so the owned type now matches the data the
   server page already forwards.
2. Each row title is now a `Link` to `/student/projects/${item.project.id}` when
   an id exists. The link keeps the existing truncation, adds hover underline and
   a visible `#b23c26` focus ring, and falls back to inert text when the id is
   missing so `/student/projects/undefined` cannot be produced.
3. A rejected row now shows a "Browse open projects" link. This gives the shared
   timeline's "Browse other open projects and apply again." line a real
   destination, using the existing `/student/projects` route and on-palette
   vermilion link style.

`app/student/applications/page.tsx` was reviewed and left unchanged. Its
phase-1 `searchParams` validation and direct `project` forwarding are already
correct, and no server-side change was needed for the new link.

## Checks performed

- `npx eslint app/student/applications/page.tsx app/student/applications/applications-client.tsx`
  - exit 0, no warnings or errors.
- `npx tsc --noEmit --pretty false` - exit 1, but only from two errors outside
  this route's ownership: `app/student/projects/page.tsx(111,13)` passes new
  `initialQuery` and `initialMode` props that the current `ProjectsClient` type
  does not declare, and `app/student/projects/projects-client.tsx(323,12)` is
  missing a newly required `detailHref` prop. Both files are dirty with another
  agent's concurrent work. No diagnostic named either owned applications file.
  They were left untouched per `MANIFEST.md`.
- Read the installed Next 16 guides for this route's APIs:
  `03-api-reference/03-file-conventions/page.md` for the awaited `searchParams`
  promise, `01-getting-started/04-linking-and-navigating.md:344-375` for native
  history integration, and `03-api-reference/03-file-conventions/error.md` and
  `loading.md` for boundary behaviour.
- Read `AGENTS.md`, `design/brand-system.md`, `design/voice-guide.md`,
  `lib/design-tokens.ts`, `app/globals.css`, `reports/page-fixes/MANIFEST.md`,
  the route audit, the phase-1 route report, the three phase-2 shared reports,
  and the current list, action, timeline, loading, error, and project-detail
  sources before editing.
- Not run by design: full `next build`, `npm test`, dev server, browser tooling.
  No runtime assertion is claimed for URL Back/Forward or link navigation.

## Routed findings, not edited here

- **Database (LOW, scale).** `lib/neon-data.ts:467-486` still has no limit on
  `listStudentApplications()`. The current owner predicate and
  `applications_student_idx` make the call correct today, but a student with a
  very large history receives every row. A paging contract needs a shared
  accessor and caller changes, as already noted in
  `reports/page-fixes/shared-database.md:127-131`.
- **Database and design system (LOW).** `applications.updated_at` and
  `application_status_history` now exist, but `listStudentApplications()` does
  not select either and `StatusTimeline` has no history prop. The page therefore
  still cannot show when a decision happened or which stages were actually
  reached. Recommended: add a bounded history field to the accessor, then let
  the shared timeline render reached steps instead of index inference. No shared
  file was edited.
- No workflow finding remains on this route. The status transition guard and
  the founder button map are both present in current source.

## Deliberate non-changes

- Phase-1 `?status=` handling, the applied date year, the sr-only heading, the
  reduced-motion classes, and the `#b23c26` focus ring were verified and
  preserved.
- The shared `StatusTimeline`, `SegmentedControl`, root error boundary, and
  student loading boundary were left unchanged.
- No withdraw or delete control was added because no supported action or product
  requirement exists.
- No new dependency, colour, gradient, token, route, or emoji. All pre-existing
  uncommitted work was preserved; no destructive git command was run.
