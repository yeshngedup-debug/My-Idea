# Page fixes, pass 2: `/founder/projects/post`

Date: 2026-11-25. Scope: second-pass feature-completeness verification of the
post-project form. Skills applied: `verify-form-validation` and
`better-writing`. The dirty working tree was treated as source of truth. No
destructive git command, install, dev server, browser tooling, full build, or
full test suite was used.

## Files changed

Only `app/founder/projects/post/post-project-form.tsx` was edited in this pass.
`app/founder/projects/post/page.tsx` was reviewed and left unchanged. This
report is new. No shared file, other page file, test, config, or existing report
was touched.

Changes in `app/founder/projects/post/post-project-form.tsx`:

- **Duplicate submit guard** (`:159-162`). `if (saving) return;` now blocks a
  second `createProject` call through an implicit submit or programmatic event,
  not just the disabled submit button.
- **Fresh error state on retry** (`:175-176`). A valid resubmit clears the old
  `role="alert"` banner before the new attempt, so a stale failure does not
  stay visible behind `Posting...`.
- **Budget precision** (`:22-28`, `:120-140`, `:373-375`). Added a two-decimal
  input check, wired it into both readiness checks, expanded both field errors,
  and added a visible "up to 2 decimal places" hint. This closes the gap where
  `type="number"` plus `noValidate` accepted `0.001`, which `numeric(10,2)`
  would round to `0.00` after a successful server validation.
- **Skills optional/cap copy** (`:262-290`). The label is now
  "Skills students need" so it cannot be read as a required field label, and a
  hint says "Optional. Add up to 15 skills, separated by commas." The Add
  button is disabled at the 15-skill cap instead of silently doing nothing.
- Prior pass fixes were preserved: field-level errors and focus, roving
  radio `tabIndex` with Arrow/Home/End, comma-split skills, rejected-action
  `try/catch`, and the `99999999.99` budget maximum.

## Feature verification

- **Required fields.** Title, description, duration, and both budget inputs are
  marked `*` and are in the readiness checklist. Client checks mirror the
  server: title >= 5 trimmed chars and <= 120, description >= 20 trimmed chars
  and <= 2000, duration in the shared enum, positive ordered budgets with a
  shared upper bound, and now two-decimal precision.
- **Optional fields.** Skills are labelled and hinted as optional and are not
  in the checklist. Deadline remains outside the checklist and says
  "Optional. Students see this on the project card." Work mode is not marked
  required because it defaults to `remote`, which matches the Zod default and
  the schema default.
- **Validation and errors.** `noValidate` is intentional; custom submit sets
  per-field errors, `aria-invalid`, `aria-describedby`, a top-level
  `role="alert"`, and focuses the first invalid required field. Errors clear
  when the value becomes valid. Server failures and rejected actions use the
  same banner and keep all state-backed values, so nothing is lost on failure.
- **Deadline semantics.** The field is sent as a `YYYY-MM-DD` string or `''`.
  `createProject` maps `''` to `null` and rejects invalid or past dates before
  insert (`app/actions/projects.ts:61-70`). The student project card renders
  the stored deadline under "Apply by" and closes applications after it passes
  (`app/student/projects/projects-client.tsx:50-70`, `:189-193`), so the form's
  copy promise is true.
- **Work-mode semantics.** The form sends `remote` or `onsite`; the action
  validates the same enum and writes it to `work_mode`. Project cards map
  `onsite` to "On-site" and everything else to "Remote"
  (`app/student/projects/projects-client.tsx:183-187`). The custom radio group
  has one tab stop and Arrow/Home/End selection.
- **Submit states.** The button is `disabled={saving}`, reads `Posting...` while
  pending, and returns to `Post project` after a returned failure or thrown
  action. The new guard covers non-button submit paths.
- **Redirect.** On `{ ok: true }`, the client calls
  `router.push('/founder/projects')` (`:191`). The action revalidates
  `/founder/projects`, `/founder`, and `/student/projects` before returning
  (`app/actions/projects.ts:88-90`). Runtime navigation was not driven because
  browser tooling was out of scope.
- **Copy promises.** The page description says "Describe the work, set a
  budget and publish a clear brief." The signed-out fallback says only
  signed-in founders can publish. No banned voice-guide phrases, invented
  proof, emoji, or new claims were added.

## Checks performed

- Re-read both owned files in full against `lib/validators.ts`,
  `app/actions/projects.ts`, `neon/schema.sql`, `lib/neon-data.ts`, the student
  project card, `components/ui/input.tsx`, `components/ui/textarea.tsx`,
  `components/ui/button.tsx`, and `components/ui/shadcn/progress.tsx`.
- Read the Next.js 16 mutating-data, forms, and error-handling guides under
  `node_modules/next/dist/docs/01-app/` before editing.
- `git diff --check -- app/founder/projects/post/page.tsx app/founder/projects/post/post-project-form.tsx`
  — clean apart from Git's CRLF normalization warnings for these two files.
- `npx eslint app/founder/projects/post/page.tsx app/founder/projects/post/post-project-form.tsx`
  — clean, exit 0.
- `npx tsc --noEmit --pretty false` — clean on the final run. An earlier run
  briefly reported `app/student/projects/page.tsx:111` while another owner's
  working-tree change was in flux; that file now declares `initialQuery` and
  `initialMode`, and the rerun produced no diagnostics. It was not edited here.
- No `next build`, `npm test`, dev server, Reticle wiring, or browser run.

## Workflow findings routed to the workflow owner

- **Stable action result still open (MED).** `app/actions/projects.ts:35-39`
  calls `getProfileRole(user.id)` outside the `try` at `:72-86`, and
  `lib/neon-data.ts:55-62` rethrows database errors. A transient Neon failure
  still rejects the action before it can return `ProjectResult`. The client
  catch at `post-project-form.tsx:187-199` shows the banner, but the server
  should also wrap the role lookup and insert in one `try/catch`, log the real
  error server-side, and return
  `{ ok: false, message: 'Could not post project. Try again.' }`.
- **Deadline parsing is timezone-dependent (MED).** `app/actions/projects.ts:61-70`
  parses `YYYY-MM-DD` with `new Date(deadline)`, which is UTC midnight, then
  compares it with a local-midnight `today`. In timezones west of UTC, a
  deadline for the current local day is rejected as past. Recommended: compare
  date-only strings, or construct the deadline with local components
  (`new Date(`${deadline}T00:00:00`)`) and compare as date values. No client
  `min` was added until this server rule is fixed, because a local-date `min`
  would disagree with the current action in those timezones.
- **Founder role guard still open (LOW, defence-in-depth).**
  `app/founder/projects/post/page.tsx:18-22` and `:40-41` check only `user`,
  not `getProfileRole`. Normal traffic is gated by `proxy.ts` and the action
  rechecks founder, but the page should still deny non-founders directly, with
  a `try/catch` fallback that does not turn a transient DB error into a false
  denial or a 500.
- **Server validation messages are not field-associated (LOW).**
  `app/actions/projects.ts:53-56` returns only the first Zod message, so a
  server-only failure cannot focus its field. If field-level recovery is
  required, return `path`/field data in `ProjectResult` and have the client map
  it to the existing `invalidFields` state.

## Database findings routed to the database owner

- **Budget precision is not enforced at the shared layers (MED).**
  `lib/validators.ts:37-42` accepts any positive number below the cap, while
  `neon/schema.sql:24`, `:29`, and `:30` store `numeric(10,2)` and silently
  round extra decimals. The client now rejects them, but a crafted FormData
  still reaches the DB. Recommended: validate the raw string as at most two
  decimal places before `z.coerce.number()`, or add a rounding-safe refine,
  and consider a DB CHECK if direct writes are possible.
- **Budget ordering and positivity are app-only (LOW).**
  `neon/schema.sql:29-30` has no CHECK for `budget_min > 0` or
  `budget_min <= budget_max`; the action enforces both. This is acceptable for
  the current single write path, but a CHECK would protect future direct
  inserts. The deadline "not in the past" rule is time-dependent and remains a
  workflow rule, not a schema constraint.

## Deliberately not changed

- **`app/founder/projects/post/page.tsx` — no edit.** Its only open finding is
  the role guard, which is workflow-owned. The existing auth fallback and
  `PinnedHeadingSection` copy were preserved as pre-existing working-tree work.
- **No client deadline validation.** The server rejects invalid and past dates
  and the error banner reports the result. Adding a local `min` would mask the
  timezone defect routed above rather than fix it.
- **No shared files.** `lib/validators.ts`, `app/actions/projects.ts`,
  `lib/neon-data.ts`, `neon/schema.sql`, and `components/**` were read-only.
- **No new dependencies, gradients, violet, emoji, or wholesale rewrite.**
  All new hints reuse the existing 12px secondary-text treatment and the
  vermilion error token.
- **No runtime verification was attempted** because the manifest excludes dev
  servers and browser tooling for this pass; behavior claims are source-verified
  except where explicitly noted.
