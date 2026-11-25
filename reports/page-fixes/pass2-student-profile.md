# Pass 2 fix report: `/student/profile`

Scope: second-pass feature-completeness review of `/student/profile`. Owned files
follow `reports/page-fixes/MANIFEST.md:80`: `app/student/profile/page.tsx`,
`app/student/profile/profile-form.tsx`, and this report. The dirty worktree was
treated as the source of truth. All pre-existing uncommitted work was preserved.
No shared file, other page, other report, `MANIFEST.md`, phase-2 report,
dependency, route, build, test, dev server, or browser tool was touched.

## Features verified

- Route guards: `page.tsx:63-95` resolves the verified Supabase session, calls
  `redirect('/login')` with no session, redirects known non-student roles to
  their role home, and returns a `ProfileNotice` for a failed role lookup or a
  null role. No profile row, CV URL, or form renders behind those states.
- Own-row read: `page.tsx:111-136` passes only the authenticated `user.id` to
  `getStudentProfile`. No URL-supplied profile id is accepted by this page.
  A failed profile read now returns a recovery notice with "Try again" and
  "Go to home" links.
- CV preview and authorization: `page.tsx:138-146` mints a fresh one-hour signed
  URL for the student's own `cv_path` and sets `cvPreviewUnavailable` when the
  mint fails. Founder and admin access remains in `app/api/cv/[id]/route.ts:44-105`,
  which rejects invalid ids, non-founder/admin roles, missing CVs, and founders
  without an application or confirmed-order relationship.
- Required and optional semantics: only `full_name` is required. The client
  requires a trimmed two-character name at `profile-form.tsx:189-195` and the
  shared server schema enforces the same rule at `lib/validators.ts:50-62`.
  College, course, year, skills, bio, availability, and CV are optional.
  Completion is now labelled "Details added" and no longer calls optional data
  "Still needed" or claims a profile is "Complete".
- Invalid input: profile submit validates the name, skill cap, and bio length
  before calling the action. Skill additions are checked as a whole batch, so
  duplicates or an over-cap batch cannot partly apply. The CV is checked at
  select and submit for MIME type, `.pdf` suffix, non-zero size, the 5 MB cap,
  and the `%PDF-` header. The server action applies the same PDF checks at
  `app/actions/student-profile.ts:92-105`.
- No password-like field exists on this route. There is no current password,
  new password, confirmation, secret, or token input to audit.
- Focus and ARIA: forms have `aria-labelledby`; the full name, file, skills, and
  bio inputs have `aria-describedby`; the progress bar exposes a real
  `aria-valuetext`; skill removal buttons have names; the file label shows a
  visible focus ring through `peer-focus-visible`; reachable validation errors
  move focus to the offending full-name, skills, or CV control.
- Feedback and retained state: one banner slot keeps a single live region across
  pending, success, and error states. Pending save and upload transitions
  disable only their own submit button. Client state is preserved after a server
  error, so a rejected save does not clear typed values. `router.refresh()` is
  called only after success, and a successful upload clears the stale file input
  before refreshing the signed preview.

## Fixes made

### `app/student/profile/page.tsx`

- Added a fail-closed profile-read guard at `:111-121`. A `getStudentProfile`
  failure now returns the existing `ProfileNotice` style recovery state instead
  of escaping to a generic error boundary. The successful path, metadata seed
  from `user.user_metadata.full_name`, and signed-CV logic are unchanged.

### `app/student/profile/profile-form.tsx`

- Added `hasPdfHeader()` at `:36-44` to mirror the server action's `%PDF-`
  signature check. It reads only the first five bytes and fails closed if the
  slice cannot be decoded.
- Added refs for the full name and skills inputs and a selection id for the CV
  file at `:84-87`. Validation errors now focus the related control, and a stale
  async CV validation cannot overwrite a newer file selection.
- Changed CV selection and submission at `:154-187` and `:229-277` to validate
  the PDF header before upload, keep the selected file on failure only when it
  is still current, and show the accurate "Use a valid PDF file." message.
- Added manual submit validation with `noValidate` at `:425-428` plus focused
  errors at `:189-204`. Native required styling remains semantic, while the
  visible error and focus behaviour are predictable.
- Reworded the progress panel at `:295-321` from mandatory-sounding "Completion"
  and "Still needed" copy to "Details added" and optional-language guidance.
  The progress bar now says how many details were added, not how many tasks are
  required.
- Added an explicit visible and assistive hint at `:435-451`: "Required. The
  other details are optional." The full name input points to it with
  `aria-describedby`.
- Added focus back to the skills input for duplicate and over-cap batches at
  `:125-152`.

## Checks performed

- Loaded `verify-form-validation` and `better-interface` before review.
- Read `AGENTS.md`, the installed Next 16 docs for server/client components,
  forms, mutating data, and error handling, `reports/page-fixes/MANIFEST.md`,
  the page audit, the consolidated audit, phase-1 fix report, and
  `reports/page-fixes/shared-workflow.md`.
- Verified current shared behaviour in `app/actions/student-profile.ts`,
  `lib/validators.ts`, `lib/neon-data.ts`, `components/ui/label.tsx`,
  `components/ui/shadcn/progress.tsx`, `app/api/cv/[id]/route.ts`,
  `next.config.ts`, `design/brand-system.md`, `design/voice-guide.md`,
  `lib/design-tokens.ts`, and `app/globals.css`.
- `npx eslint app/student/profile/page.tsx app/student/profile/profile-form.tsx`
  passed with no diagnostics.
- `npx tsc --noEmit --pretty false` passed with no diagnostics.
- Reviewed `git diff` for the two owned files. No destructive git command was
  run. No build, full test suite, dev server, browser drive, database mutation,
  or Storage mutation was performed.

## Routed findings

### Workflow and config owner

- Server Action body limit: `next.config.ts:6` leaves `experimental` empty.
  Next's documented default action body limit is 1 MB, while this route and
  `app/actions/student-profile.ts:103-104` accept up to 5 MB. Larger CVs can be
  rejected before the action runs. Recommended fix: set
  `experimental.serverActions.bodySizeLimit` above 5 MB, such as `6mb`, or move
  the upload to a route handler and keep the client and action caps aligned.
- Profile save is not atomic: `app/actions/student-profile.ts:65-72` commits
  `upsertStudentProfile` before `updateProfileFullName`. If the second write
  fails, `student_profiles` can disagree with `profiles.full_name`. Recommended
  fix: put both writes in one transaction or a database RPC and return success
  only after both commit.
- Storage and Neon can disagree: `app/actions/student-profile.ts:109-122`
  uploads the CV before `setStudentProfileCv`. A failed DB write leaves an
  object at `${user.id}/cv.pdf` while `cv_path` stays stale, and the retry
  message claims a partial success. Recommended fix: delete the uploaded object
  when the DB write fails, or reconcile both stores in one idempotent helper and
  report one outcome.
- Misleading CV comment: `app/actions/student-profile.ts:115-117` says CVs are
  opened only through `/api/cv/[id]`, but the student's own preview is signed
  directly at `page.tsx:138-146`. No access-control defect was proven.
  Recommended fix: update the shared comment when that file is next edited.
- Previously routed `W1`, `W2`, `W3`, and `W5/D1` are now resolved in shared
  files. Current evidence: `lib/validators.ts:13-24,50-62` enforces the 15-skill
  cap and two-character name; `app/actions/student-profile.ts:69-71,96-105`
  returns generic errors and checks the PDF signature. They are not re-routed.

### Database owner

- Profile helpers trust caller-supplied ids: `lib/neon-data.ts:616-679` accepts a
  raw id for `upsertStudentProfile`, `setStudentProfileCv`, and
  `getStudentProfile` without comparing an actor to an owner.
  `neon/schema.sql:1-4` states that authorization lives in the application
  layer and Neon has no RLS. Current callers pass `user.id`, so no exploit was
  found. Recommended fix: require `actorId` and `ownerId`, compare before SQL,
  and throw on mismatch, or expose a narrow own-profile repository that accepts
  only the authenticated session.
- No new schema, index, status, or Storage policy finding was found for this
  route. The parameterized own-row read and role rechecks remain in place.

## Deliberate non-changes

- No shared file was edited, especially `app/actions/student-profile.ts`,
  `lib/validators.ts`, `lib/neon-data.ts`, `next.config.ts`, `neon/schema.sql`,
  or `supabase/**`. Findings above are routed, not patched here.
- No new route, dependency, password-reset flow, or founder/admin CV access
  change was introduced.
- No hard application-completeness gate was added. Current product copy treats
  completion as guidance, so making optional profile fields mandatory would
  contradict the shipped flow.
- No transaction, body-size config, actor/owner guard, or Storage reconciliation
  was faked in the UI. Those need shared fixes owned elsewhere.
- No build, full test suite, dev server, browser tooling, database write, or
  Storage write was run, per `MANIFEST.md:50-51`.
