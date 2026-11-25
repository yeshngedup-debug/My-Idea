# Page fixes: `/founder/projects/post`

Slug: `founder-projects-post`. Audit: `reports/page-audits/founder-projects-post.md`.

## Files changed

Only `app/founder/projects/post/post-project-form.tsx` was edited in this pass.
`app/founder/projects/post/page.tsx` was reviewed but left unchanged (see
"Deliberately not changed"). No shared file, other report, or config was touched.

Changes in `app/founder/projects/post/post-project-form.tsx`:

- **U1 — field-level errors.** Added `invalidFields` state and a `FieldId` union.
  Each `requirements` entry now carries an `id` and a short `error` message.
  On submit, the failing IDs are recorded, a message is rendered beside each
  failing control, `aria-invalid` / `aria-describedby` are wired via the
  existing `Input` / `Textarea` add-on props (and directly on the `<select>`),
  and the first invalid control is focused. A field clears its error as soon
  as its value becomes valid. The top-level `role="alert"` summary stays.
- **U2 — radio keyboard semantics.** Added a roving `tabIndex` (only the
  checked radio is in the Tab order), button refs, and an Arrow / Home / End
  handler that selects the next mode and moves focus. The group is wrapped in
  a `<fieldset>` / `<legend>` so the visible name is not only an ARIA label.
- **U3 — progress description (local mitigation).** Removed the misleading
  `aria-describedby="post-form-missing"` from `Progress`; the paragraph is
  kept as an `aria-live="polite"` region, which is how the "Still needed" text
  was already announced. The shared `progress.tsx` was not edited.
- **W1 — skill entry.** `addSkill()` now splits the input on commas, trims and
  filters each token, dedupes per token, and caps the badge state at 15, so
  one badge always equals one stored skill and matches the server transform.
- **W2 — rejected action (client half).** The `createProject(fd)` awaited
  inside `startSave` is now wrapped in `try/catch`; a rejected action sets the
  same `role="alert"` message as a returned `{ ok: false }` result instead of
  silently leaving the user on "Posting..." → "Post project".
- **D1 — budget bound (client half).** Added a `MAX_BUDGET = 99999999.99`
  constant matching `numeric(10,2)`, set it as `max` on both number inputs,
  changed `step` to `0.01`, and added the same upper bound to the readiness
  checks. An out-of-range budget is now flagged on the field before submit.

## Checks performed

- Re-read both owned files in full before and after editing; treated the
  pre-existing dirty working tree as the source of truth.
- Verified each audit finding against current source, not just the report.
- Verified `Input` / `Textarea` accept `invalid` and `describedBy` add-on props
  (`components/ui/input.tsx`, `components/ui/textarea.tsx`).
- Verified the DB contract: `neon/schema.sql:24` budget columns are
  `numeric(10,2)`; `lib/neon-data.ts:222-240` `insertProject` writes
  `budget_min` / `budget_max`; `lib/validators.ts:25-41` is the shared schema.
- Verified the workflow: `createProject` derives `founderId` from the session
  and rechecks the founder role (`app/actions/projects.ts:26-91`); the form
  never sends a founder ID.
- `npx eslint app/founder/projects/post/page.tsx app/founder/projects/post/post-project-form.tsx`
  — clean (0 errors, 0 warnings) after simplifying the `FieldId` type.
- No `next build`, `npm test`, or dev server was run, per the manifest.

## Workflow findings routed to the workflow owner

- **W2 (action half) — `app/actions/projects.ts:35` and `:71-85`.**
  `getProfileRole(user.id)` runs before the `try` at `:71`, and
  `lib/neon-data.ts:47-54` rethrows database errors. A transient Neon failure
  rejects the action before it can return `ProjectResult`. The client half is
  fixed here (`post-project-form.tsx:173-186`), but the server should also wrap
  the role lookup and insert in one `try/catch`, log the real error
  server-side, and return `{ ok: false, message: 'Could not post project. Try
  again.' }` so every failure path has a stable contract.
- **S1 (LOW, defence-in-depth) — `app/founder/projects/post/page.tsx:19-22`,
  `:40-41`.** The wrapper checks only `user`, not founder role. This is not
  reachable in the verified routing setup (`proxy.ts` gates `/founder/*` and
  the action rechecks founder), and the manifest assigns server-side
  authorization fixes to the workflow owner, so it was not implemented here.
  Recommended: call `getProfileRole(user.id)` in the page and render a
  role-appropriate denial before the form, with a `try/catch` fallback that
  does not turn a transient DB error into a false denial or a 500.

## Database findings routed to the database owner

- **D1 (Zod half) — `lib/validators.ts:34-35`.** `budgetMin` / `budgetMax`
  require only positive numbers; `neon/schema.sql:24` stores `numeric(10,2)`
  (max `99999999.99`). Add `.max(99999999.99, 'Budget must be at most
  99999999.99.')` to both fields so the shared schema matches the column and
  the client bound added here. Keep `step` at `0.01` in all layers.
- **D2 (LOW) — `lib/validators.ts:27`.** The 120-character title cap exists
  only in the client (`maxLength={120}`); the schema uses `.min(5)` only and
  `neon/schema.sql:20` is unconstrained `text`. Add `.max(120, 'Title must be
  at most 120 characters.')` to `createProjectSchema.title`.
- No database file was edited. Verified passes (no IDOR on create, no SQL
  injection via the parameterized insert, server-enforced deadline, cache
  invalidation for the three dashboards) remain as recorded in the audit.

## Deliberately not changed

- **`app/founder/projects/post/page.tsx` — no edit.** The only open finding in
  this owned file is S1, a server-side authorization fix owned by the workflow
  owner. The existing auth guard, sign-in fallback, and `PinnedHeadingSection`
  layout were left as-is; they are pre-existing working-tree changes.
- **`components/ui/shadcn/progress.tsx` — shared.** U3 was mitigated locally by
  dropping the unusable `aria-describedby` and relying on the live region.
  Forwarding `aria-describedby` to the inner progressbar is a design-system
  owner change (`progress.tsx:43`, `:53-63`) and was not made here.
- **Pre-existing palette / layout work in the owned files was preserved.**
  The form already used the warm-paper / forest / vermilion tokens and
  `focus-visible` rings; no gradients, violet, emoji, new dependencies, or
  wholesale rewrites were introduced. Field errors use the existing vermilion
  `#b23c26` text token.
- **`createProjectFormAction` (`app/actions/projects.ts:98-100`) is unused by
  this form** and was not touched; the remaining client-side browser findings
  in the audit were dev/harness hydration failures, not product defects, so no
  runtime-only workaround was added.
