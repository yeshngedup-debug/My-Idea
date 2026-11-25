# `/student/projects` second-pass feature-completeness report

## Scope and evidence limits

- Worked from the current dirty worktree as the source of truth. No `git checkout`,
  `git reset`, `git stash`, `git clean`, or other change-discarding command was run.
- Edited only the two owned source files and this new report.
- Loaded `verify-pagination` and `better-interface` before this pass.
- Runtime browser proof was explicitly out of scope: no dev server, browser tool,
  Reticle wiring, Apply click, or data mutation was performed. All pass/fail
  statements below are source-verified, not runtime-verified.

## Files changed

### `app/student/projects/page.tsx`

- Added the Next.js 16 `searchParams: Promise<...>` signature and read the initial
  `q` / `mode` values before the data load. The page now hydrates the client feed
  with the same filters that are present in the address bar.
- De-duplicated open rows by project ID with a `Map` before founder lookup and
  mapping, so an unexpected duplicate row can never produce duplicate React keys
  or two identical cards.
- Preserved all phase-1 work: single brand suffix, explicit auth redirect, scoped
  founder-name lookup, and the softened heading copy.

### `app/student/projects/projects-client.tsx`

- Reused the existing `Input` and `SegmentedControl` to add text search and an
  All / Remote / Onsite filter, instead of building new controls or editing shared
  components.
- Added a live `role="status"` count (`Showing X of Y project briefs`), a
  conditional `Clear filters` control, and a distinct filtered-empty state with a
  `Show all briefs` recovery action. The unfiltered empty state still says to
  check back soon.
- Made filters addressable through `?q=` and `?mode=`. Initial values come from
  the server; updates use the Next.js-supported native History API
  (`replaceState`, avoiding one history entry per keystroke) and a `popstate`
  listener restores state on Back/Forward. Input is capped at 120 characters.
- Detail links now carry the active `q` / `mode` values so the detail URL retains
  the student's context. The remaining back-link gap is routed below.
- Replaced `useMemo` with a derived `filteredProjects` value after ESLint reported
  `react-hooks/preserve-manual-memoization`; React Compiler can optimize the
  simpler form and the rerun passed.
- Kept the phase-1 deadline handling: date-only deadlines stay open through the
  local calendar day; expired rows show a `Closed` badge, a disabled `Closed`
  button, and an accessible label such as `Applications closed on 15 Dec 2026`.
- Kept the defensive `ApplyResult` parsing, `try/catch/finally`, local optimistic
  applied ID, and `router.refresh()` after success.
- Kept all colors on existing semantic tokens and all interactive targets at
  `min-h-11` with visible focus rings.

## Verified in this pass (source-level)

- **Filters, reset, count:** text search covers title, description, founder name,
  and skills; work mode is normalized from row data; `Clear filters` resets both
  state and URL; the count is announced politely.
- **No duplicate rows:** `page.tsx:65-68` de-duplicates by `id`; the client maps
  the de-duplicated array with `key={project.id}`.
- **Closed / deadline projects are non-actionable:** the badge and disabled button
  are derived from the parsed deadline, not from decorative copy.
- **Empty state:** unfiltered and filtered-empty cases have different headings,
  guidance, and recovery actions.
- **ARIA / focus / targets:** reused components provide a labelled search input
  with `aria-describedby`, a named `role="group"` filter control, and 44px toggle
  targets; card actions and both clear/reset buttons use `min-h-11` and
  `focus-visible` rings. Apply feedback still uses `role="status"` for success and
  `role="alert"` for failure.
- **Loading / error:** inherited `app/student/loading.tsx` and `app/error.tsx`
  already provide a workspace skeleton and a retry / workspace-recovery path.
  No route-local boundary was added because it is outside owned scope.
- **Pagination:** there is no pager, cursor, or "next batch" control in this feed,
  so there is no second-page request to prove. The missing server-side paging is
  routed to the database owner below.

## Checks performed

- `npx eslint app/student/projects/page.tsx app/student/projects/projects-client.tsx`
  — first run found one `react-hooks/preserve-manual-memoization` error on the
  former `useMemo` dependency array; after removing that memoization, the rerun
  passed with no findings.
- `npx tsc --noEmit --pretty false` — passed.
- Read the installed Next.js 16 guides for server `searchParams` and the native
  History API before editing.
- Reviewed the final `git diff` for the two owned source files and grepped the
  touched code for stale `.slice(0, 5)` skill truncation and hardcoded page-local
  hex classes; none remain in this feed.
- No `next build`, `npm test`, dev server, browser tool, or Reticle action was run.

## Findings routed to the workflow / detail owner

- **Detail back link loses filter context.** `app/student/projects/[id]/page.tsx:264-269`
  still hardcodes `href="/student/projects"`. The listing now appends `q` / `mode`
  to detail links, but that context is not carried by the in-app back link.
  Recommended fix: read `q` / `mode` from the detail route's `searchParams` and
  append them to the back href, validating the same way the listing does. That
  route is owned by `student-project-detail`, so it was not edited here.
- **Apply redirect drops filter context.** `app/student/projects/[id]/page.tsx:144-146`
  redirects to `/student/projects/${id}?apply=${notice}` only. After applying from
  the detail view, the back link cannot recover the prior filters. Preserve the
  safe `q` / `mode` values through `finishApply` and the detail action.
- **Server-side deadline enforcement still missing.** `app/actions/projects.ts:117-121`
  checks status but not deadline. The listing disables Apply for expired rows, yet
  a direct call to `applyToProject` can still accept one. Add the same end-of-day
  deadline rule on the write path. The detail route already re-checks deadline at
  `app/student/projects/[id]/page.tsx:153-175` and disables Apply via `canApply`
  at `:231-233`; that earlier workflow gap is resolved outside this pass.
- **`revalidatePath` scope.** The shared apply action revalidates the listing,
  applications, and admin students at `app/actions/projects.ts:132-134`, but not
  the detail path. The detail route performs its own revalidation in
  `finishApply`; confirm the combined behavior when the context-preserving
  redirect is added.

## Findings routed to the database owner

- **Unbounded read remains.** `app/student/projects/page.tsx:61-64` still calls
  `listAllProjectsWithDetails()`, which selects every project ordered by
  `created_at` at `lib/neon-data.ts:344-352`. The page keeps only `status === 'open'`
  in memory.
- **Narrower helper is not sufficient yet.** `listOpenProjects()` at
  `lib/neon-data.ts:287-314` filters status in SQL but omits `founder_id`, `status`,
  and a deadline predicate, so this page cannot use it as-is. Recommended shared
  fix: extend the row type/helper with those fields, add
  `deadline is null or deadline >= current_date`, then add a real page size /
  cursor and use that helper from the route. The de-duplication added here is
  defensive UI protection, not a substitute for query correctness.
- **Deadline semantics must agree across layers.** The schema stores `deadline`
  as a `date`; the client treats date-only values as open through local end of
  day. The SQL predicate and server action should use the same calendar-day rule.

## Deliberately not changed

- No shared component, action, data helper, schema, layout, global CSS, loading /
  error boundary, or detail-route edit; each belongs to another owner.
- No new dependency, route, pagination UI, or wholesale visual rewrite. The
  warm-paper / forest / vermilion / amber token system is unchanged.
- No browser/runtime verdict was invented. Browser proof of the filter, reset,
  detail-context, and closed-deadline flows remains for the orchestrator's final
  verification pass.
- No pre-existing uncommitted work was discarded; the dirty worktree was treated
  as the source of truth throughout.
