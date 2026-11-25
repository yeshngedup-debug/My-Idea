# Fix report — `/student/profile`

Slug: `student-profile`. Route: `/student/profile`. Owned files follow
`reports/page-fixes/MANIFEST.md:80`: `app/student/profile/page.tsx` and
`app/student/profile/profile-form.tsx`, plus this report. No shared file,
schema, SQL, config, other report, or git history was changed. All pre-existing
uncommitted user edits were preserved and treated as the source of truth.

## Files changed

### `app/student/profile/page.tsx`

- Added a fail-closed guard using the same pattern as `app/student/page.tsx`:
  no session calls `redirect('/login')` (`:69`); a known non-student role calls
  `redirect(ROLE_HOME[role] ?? '/')` (`:86`), so founder → `/founder`,
  admin → `/admin`, and any other known role → `/`.
- Added `ProfileNotice` (`:21-61`) for the two states that cannot safely
  redirect: a null role gets a setup notice (`:88-95`), and a role lookup error
  gets a recovery notice (`:77-84`). Both include “Try again” and “Go to home”
  links and use the existing warm-paper/forest palette with the `#d84f37` focus
  token.
- Removed the previous static alert branch and its zeroed profile form. Every
  guarded state now returns before `getStudentProfile`, signed-URL minting, and
  `ProfileForm` render.
- Kept the student path unchanged: own-row read with `user.id`, one-hour signed
  CV URL, and `ProfileForm` with `cvPreviewUnavailable`.

### `app/student/profile/profile-form.tsx`

- Added one client PDF predicate (`:31-34`) so select and submit agree:
  `application/pdf` **and** a `.pdf` extension. Submit now focuses the file
  input and shows the accurate “Use a PDF file.” message instead of the old
  mixed-format “Use a PDF of 5 MB or smaller.” message.
- Rejected zero-byte files at both select and submit (`:151-156`, `:212-216`).
- Made skill additions atomic (`:112-137`): duplicated or over-cap comma
  batches are rejected in full with the input preserved; clean batches are
  added in full. This closes audit W7 without partial application.
- Kept the browser full-name rule strict (`minLength={2}` at `:404` and
  `fullName.trim().length < 2` at `:163`) and added a submit-side skills cap
  guard (`:167-170`).
- Made long CV filenames fully available instead of visually truncated:
  `break-all`, normal leading, and `title` on the uploaded filename (`:325-329`)
  and on the selected-file preview (`:367-374`). Skill chips keep `truncate`
  for layout but now expose the full value via `title` (`:483`).
- Applied the shared token split from `lib/design-tokens.ts:44-48,70-71`:
  focus rings now use `#d84f37`, while `#b23c26` remains only for small error
  text/hover copy (`:38`, `:336`, `:362`, `:488`). Added `motion-reduce`
  variants and 44px-plus targets on the CV controls.
- Added `aria-labelledby` on both forms, `aria-describedby` on the file input,
  skills input, and bio, a labelled “Progress” heading, semantic skill `<li>`
  items, and `role="alert"` on the CV preview failure. The single banner slot
  keeps one live region across pending → settled states (`:104-110`, `:286-306`).

## Checks performed

- Read `reports/page-fixes/MANIFEST.md`, `reports/page-audits/student-profile.md`,
  relevant `reports/page-audits/CONSOLIDATED.md` sections, `AGENTS.md`, design
  docs (`design/brand-system.md`, `design/brand-guidelines.md`,
  `design/voice-guide.md`), `lib/design-tokens.ts`, and `app/globals.css`.
- Read installed Next 16 docs for layouts/pages, server/client components,
  mutating data, error handling, forms, server actions, `redirect`, and
  `serverActions.bodySizeLimit` before editing.
- Verified current source in `app/actions/student-profile.ts`,
  `lib/validators.ts`, `lib/neon-data.ts`, `neon/schema.sql`,
  `next.config.ts`, `supabase/run-all.sql`, and
  `supabase/migrations/20261124000000_close_security_bypasses.sql`.
- `npx eslint app/student/profile/page.tsx app/student/profile/profile-form.tsx`
  — passed with no diagnostics.
- `git diff -- app/student/profile/page.tsx app/student/profile/profile-form.tsx`
  reviewed; only LF→CRLF warnings appeared, and no destructive git command was run.
- No `next build`, `npm test`, dev server, browser drive, database mutation, or
  Storage mutation was performed.

## Behaviour for guarded states

| State | Result |
|---|---|
| No session | `redirect('/login')`; no profile row read, no CV URL, no form |
| Known founder/admin/other-role session | Redirect to that role’s home (or `/`); no student form or zeroed stats |
| Session with null role | Setup `ProfileNotice`; no student form or zeroed stats |
| Role lookup throws | Recovery `ProfileNotice`; no student form or zeroed stats |
| Student role | Existing profile load, signed CV URL, and editable form |

## Workflow findings routed to the workflow/config owner

These live outside the owned files and were not edited.

- **Server Action body limit vs 5 MB CV** — `next.config.ts:5-51` has no
  `serverActions.bodySizeLimit`; installed Next docs
  (`node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/serverActions.md:61-71`)
  state a 1 MB default. The client accepts up to 5 MB
  (`profile-form.tsx:29,151-155,212-216`) and `uploadCv` accepts up to 5 MB
  (`app/actions/student-profile.ts:99-101`), so larger files can be rejected
  before the action runs. Recommended: set `experimental.serverActions.bodySizeLimit`
  above 5 MB (or move the upload to a route handler) and keep the client/server
  limit aligned.
- **W1 — full-name rule still differs server-side** —
  `lib/validators.ts:44` uses `min(1)` while the form uses a 2-character rule
  (`profile-form.tsx:86,163-166,404`). Recommended: export one shared rule and
  set the server schema to `min(2, 'Enter your full name (at least 2 characters).')`.
- **W2 — skill cap truncates at the server** — `lib/validators.ts:14-23` calls
  `.slice(0, 15)` with no issue. Recommended: parse all values and `.refine`
  to return “You can add up to 15 skills.” instead of dropping data.
- **W3 — server PDF check is still MIME-only** —
  `app/actions/student-profile.ts:96-107` accepts only exact
  `application/pdf`, and `supabase/run-all.sql:271-275` enforces only the
  declared MIME type and extension policy. The client is now internally
  consistent, but a mislabelled non-PDF can still be uploaded. Recommended:
  check the `%PDF-` signature plus normalized MIME/extension on the server
  before upload and mirror that predicate in the client.
- **W4 — profile save is not atomic** — `app/actions/student-profile.ts:65-72`
  commits `upsertStudentProfile` before `updateProfileFullName`. Recommended:
  one transaction or database RPC so both succeed or neither does.
- **W5 / D1 — raw driver text crosses to the browser** —
  `app/actions/student-profile.ts:69-71` returns `error.message` from
  `NeonDataError` (`lib/neon-data.ts:23-27`), and the form prints it at
  `profile-form.tsx:188`. Recommended: log details server-side with a
  correlation ID and return a generic safe message.
- **W6 — Storage and Neon can disagree** —
  `app/actions/student-profile.ts:105-118` uploads before
  `setStudentProfileCv`; if the DB write fails, the object remains at
  `${user.id}/cv.pdf` while `cv_path` stays stale. Recommended: delete the
  object on DB failure or reconcile both sides in one idempotent helper.
- **Comment mismatch (documentation only)** —
  `app/actions/student-profile.ts:111-113` says CVs open only through
  `/api/cv/[id]`, but the student’s own preview is signed directly at
  `page.tsx:130-135`. No access-control bug was proven; update the comment
  when that shared action is next edited.

## Database findings routed to the database owner

- **D2 — profile helpers trust caller-supplied id** —
  `lib/neon-data.ts:594-624` accepts a raw `id` for CV write and own-profile
  read with no actor/owner comparison; `neon/schema.sql:1-4` states that
  authorization stays in the application layer and Neon has no RLS. Current
  callers pass `user.id`, so no exploit was found. Recommended: require
  `actorId` and `ownerId`, compare before SQL, and throw on mismatch, or expose
  a narrow “own profile” repository that only accepts the authenticated session.
- Confirmed controls left intact: parameterized own-row read at
  `page.tsx:111` / `lib/neon-data.ts:614-624`; role rechecks in both actions at
  `app/actions/student-profile.ts:22-33,79-90`; private 5 MB PDF-only `cvs`
  bucket with owner-folder insert/update policies at `supabase/run-all.sql:270-292`;
  final CV SELECT policy limited to owner/admin/application relationship or
  shortlist plus confirmed order at
  `supabase/migrations/20261124000000_close_security_bypasses.sql:155-181`.
- No schema, SQL, seed, Storage policy, or `lib/neon-data.ts` file was edited.

## Deliberately not changed

- No shared file was edited: especially not `app/actions/student-profile.ts`,
  `lib/validators.ts`, `lib/neon-data.ts`, `neon/schema.sql`, `supabase/**`,
  or `next.config.ts`. Findings above are routed, not patched here.
- No server-side PDF signature check was added to the client file; it belongs
  in the server action and Storage policy layer.
- No generic server error message, transaction, or DB actor/owner guard was
  faked in the UI; those need shared fixes.
- No build, test suite, or dev server was run, per `MANIFEST.md:50-51`.
