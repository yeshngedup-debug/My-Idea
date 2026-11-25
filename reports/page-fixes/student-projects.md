# `/student/projects` (student-projects) page-fix report

## Files changed

- `app/student/projects/page.tsx`
  - Set route metadata to `{ title: 'Open Projects' }` so the root template in
    `app/layout.tsx` adds the brand suffix once instead of twice.
  - Added an explicit `if (!user) redirect('/login')` before any data read. A
    failed `getUser()` can no longer masquerade as an empty feed.
  - Made the authenticated data load unconditional and constant (`const
    projects`, `const appliedIds`), removing the old mutable empty-feed branch.
  - Softened the heading copy from "Paid briefs you can apply to" to "Paid
    briefs posted by founders. Check the scope and deadline before you apply."
    The page no longer promises that every listed brief is immediately
    applicable.
  - Preserved the pre-existing uncommitted scoped founder-name lookup
    (`listProfilesByIds`) and its comment; no user work was reverted.
- `app/student/projects/projects-client.tsx`
  - Added a `deadlinePassed()` helper that treats a date-only `deadline` as open
    through the end of its local calendar day. Expired rows now show a `Closed`
    badge and a disabled `Closed` button with an `aria-label` naming the date,
    instead of an enabled `Apply`.
  - Exposed silently truncated skills as a `+N more` link to the detail route,
    with an accessible name such as `+3 more required skills`.
  - Replaced all page-local hex utilities with existing semantic roles:
    `border-border`, `bg-card`, `bg-secondary`, `bg-background`, `bg-muted`,
    `text-primary`, `text-body-secondary`, `text-muted-foreground`,
    `text-destructive`, `ring-accent`. Added `break-words` to the card title and
    status line to keep long values inside the card.
  - Kept server props authoritative for applied state. A local optimistic ID
    covers only the gap until `router.refresh()` returns the updated server
    list; no `setState` call was added inside an effect.
  - Changed the empty state to "No current project briefs. Check back soon." so
    it does not assert a queue of open projects that the DB does not guarantee.
  - Preserved the pre-existing uncommitted defensive `ApplyResult` parsing and
    `try/catch/finally` handling; a rejected server action still produces a
    visible `role="alert"` rather than a stuck `Sending...` button.
- `reports/page-fixes/student-projects.md` (this report).

## Checks performed

- Read in full before editing: `reports/page-fixes/MANIFEST.md`,
  `reports/page-audits/student-projects.md`, the relevant sections of
  `reports/page-audits/CONSOLIDATED.md`, `AGENTS.md`,
  `design/brand-system.md`, `design/brand-guidelines.md`,
  `design/voice-guide.md`, `lib/design-tokens.ts` and `app/globals.css`.
- Read the installed Next.js 16 guides relevant to the APIs touched:
  `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`,
  `05-server-and-client-components.md`, `07-mutating-data.md` and
  `10-error-handling.md`.
- Source-verified the current worktree:
  - `app/layout.tsx:17-19` supplies the `%s | Bhutan Tech Connect` template that
    caused the duplicated suffix.
  - `neon/schema.sql:18-33` constrains project `status` and stores `deadline` as
    a `date`; `neon/schema.sql:35-42` enforces one application per
    `(student_id, project_id)`.
  - `app/actions/projects.ts:103-134` validates the signed-in student role,
    project status and duplicate insert, but does **not** re-check `deadline`.
  - `proxy.ts:110-131` is the first-line role guard; the new server redirect is
    defence in depth, not a replacement.
  - `lib/neon-data.ts:443-455` parameterizes the applied-ID read with the
    server-session `user.id`; no browser-supplied ID reaches SQL.
  - `app/student/projects/[id]/page.tsx:104-160` was read only. Its current
    worktree copy still renders a read-only brief with no Apply control.
- `npx eslint app/student/projects/page.tsx app/student/projects/projects-client.tsx`
  — passed, no findings.
- `git diff --check -- app/student/projects/page.tsx app/student/projects/projects-client.tsx`
  — clean (only Git's local LF/CRLF normalization notice).
- Grep for `#rrggbb`-style literals in `app/student/projects/*.tsx` — no
  matches after the token swap.
- Reviewed `git diff` for the two owned files; no shared file, schema, action,
  config, report, `MANIFEST.md` or detail route was edited by this pass.
- No `next build`, `npm test`, dev server, Apply click or data mutation was
  performed, per the manifest and the read-only verification constraint.

## Workflow findings routed to the workflow owner

- **W1 — HIGH — carried, not duplicated.** The Apply decision cannot be
  completed on `app/student/projects/[id]/page.tsx`: the detail view is still
  read-only, while the only Apply control is in the listing card. Owner reports:
  `reports/component-relevance-audit.md:42,81-82` and
  `reports/page-audits/student-project-detail.md:64-69`.
  Recommended shared fix: extract the card control
  (`app/student/projects/projects-client.tsx:198-237`) into a reusable Apply
  control, mount it on the detail route with the same `Apply -> Sending... ->
  Applied` states and `role=status`/`role=alert` feedback, and add
  `/student/projects/[id]` to the `revalidatePath` list at
  `app/actions/projects.ts:131-134`. That action file and the detail route are
  outside this route's ownership, so no edit was attempted here.
- **W2 — MED — server-side gap remains.** The client now disables Apply for an
  expired deadline, but this is presentation only. `applyToProject` at
  `app/actions/projects.ts:116-120` still checks only `status !== 'open'`; a
  direct call can accept an application after the deadline. Recommended fix:
  add a deadline comparison in the action using the same end-of-day rule, and
  add the SQL deadline predicate listed below. Route to the workflow owner for
  the action and the database owner for the query.
- **W3 — LOW — resolved in owned files.** Applied state now derives from
  `appliedIds` plus a small local optimistic set, and a successful apply calls
  `router.refresh()`. This avoids the lint-rejected synchronous `setState` in
  an effect and avoids remounting cards (which would have erased the success
  status). No shared action change was needed.

## Database findings routed to the database owner

- **D1 — MED — unbounded read remains.** `app/student/projects/page.tsx:51-55`
  still calls `listAllProjectsWithDetails()` and filters `status === 'open'` in
  JavaScript. `lib/neon-data.ts:268-295` already has `listOpenProjects()`, but
  its `OpenProjectRow` omits `founder_id` and `status`, which is why the page
  bypasses it.
  Recommended shared fix: extend `OpenProjectRow` and `listOpenProjects()` to
  select `founder_id` and `status`, add
  `deadline is null or deadline >= current_date`, then call that helper from
  the page and remove the in-memory filter. Do not edit the shared helper from
  this route pass.
- **D2 — LOW — resolved in owned files.** The explicit `redirect('/login')`
  stops a missing user from being rendered as an empty project feed.
- **Deadline semantics.** `neon/schema.sql:32` stores `deadline` as a `date`.
  The client treats a date-only value as open through `23:59:59.999` of that
  local day; the action and query should use the same calendar-day rule so UI,
  read path and write path agree.
- **Positive verification, not findings.** All traced SQL uses tagged-template
  parameters; the student ID comes from `user.id`; application uniqueness is
  a DB constraint; and `neon/schema.sql:1-4` states that this schema has no
  RLS, so authorization belongs in the server action and proxy guard.

## Deliberately not changed

- No search or skill/work-mode filter (audit U1): the fix calls for reusing
  shared `Input` and `SegmentedControl` components, which belong to the
  design-system/component owner (`reports/page-fixes/MANIFEST.md:95-103`).
- No Apply UI, `applyToProject`, `revalidatePath`, query helper, schema,
  `proxy.ts`, global CSS, token file, layout or detail-route edit. Each is in
  another owner's scope.
- No wholesale copy or visual rewrite. The page keeps the warm-paper / forest /
  vermilion / amber palette, the `Open Projects` metadata title recommended by
  the audit, and the existing heading/section structure.
- No runtime Apply click, no application/project/profile/order mutation and no
  dev server or build. The expired-deadline state was verified by source
  inspection only; no seeded row had a past deadline in the audit evidence.
- No pre-existing uncommitted change was discarded. The working tree was dirty
  with many agents' work; only the two owned source files and this report were
  touched.
