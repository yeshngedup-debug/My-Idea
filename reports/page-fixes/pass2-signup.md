# Page fixes — `/signup` (second pass)

Date: 2026-11-25. Scope: second feature-completeness pass under
`reports/page-fixes/MANIFEST.md`. The dirty worktree was treated as the source
of truth. Only `components/auth/signup-form.tsx` was changed in this pass;
`app/(auth)/signup/page.tsx` was reviewed and left as-is. No destructive git
command, dev server, browser session, full build, or full test suite was run.

## Files changed

- `components/auth/signup-form.tsx`
  - Added `MAX_FULL_NAME_LENGTH = 80` and combined-name validation
    (`:27`, `:47`, `:58-59`) so two names that are each at most 80 characters
    but join to more than 80 are rejected before `signup()` is called. This now
    matches `app/actions/auth.ts:135-137`, which trims both names, joins them
    with one space, and rejects `fullName.length > 80`.
  - The combined-length error is attached to the last-name field, whose
    `aria-invalid` / `aria-describedby` wiring already exists (`:213-214`).
    First-name-specific errors are left intact, so the existing focus loop still
    targets the earliest invalid field (`:133-137`).

- `app/(auth)/signup/page.tsx` — reviewed; no change needed.
- `reports/page-fixes/pass2-signup.md` — this report.

## Features verified

Verification is source-based because browser/Reticle proof is outside this
assignment. “Verified” below means the current source implements the behavior;
it is not a claim of a runtime click-through.

| Feature | Evidence | Result |
|---|---|---|
| Empty submit / required fields | `validate()` checks all four fields (`:43-68`); `submitAction()` only calls `signup()` when there are no errors (`:116-121`). | Verified in source. |
| Invalid email | Trimmed value is tested with `EMAIL_PATTERN` (`:24`, `:48`, `:62`). `noValidate` prevents the browser from masking the app error (`:167`). | Verified in source. |
| Short password | `< 6` characters is rejected client-side (`:25`, `:64-66`); shared server action applies the same minimum (`app/actions/auth.ts:136`). | Verified in source. |
| Overlong name | Each field is capped at 80 (`:51-57`); the new combined check caps the joined name at 80 (`:47`, `:58-59`). | Fixed and verified in source. |
| First invalid field focus | `FIELD_ORDER` plus refs focus the first field with an error after each submit (`:23`, `:81-95`, `:133-137`). | Verified in source. |
| Password show/hide toggle | `type` flips between `password` and `text` (`:269`); button is `type="button"` with `aria-controls`, `aria-pressed`, a 44px minimum target, and `onMouseDown` focus preservation (`:285-294`). | Verified in source. |
| Password help / error wiring | Hint id is always described; error id is added when invalid (`:77`, `:275-279`, `:296-307`). | Verified in source. |
| Server-error banner and focus | Page maps `invalid`, `exists`, `rate-limited` and falls back to a generic message (`app/(auth)/signup/page.tsx:17-25`, `:46`). Form renders `role="alert"` + `tabIndex={-1}`, links it with form `aria-describedby`, and focuses it when `serverError` changes (`:79`, `:129-131`, `:153-168`). | Verified in source. |
| Controlled values | `FormData` is read back into state on submit (`:107-113`), rendered through `value` props (`:181`, `:210`, `:240`, `:270`), and edits clear only that field’s stale error (`:146-149`). | Verified in source for client-validation failures. |
| Pending submit state | Shared `SubmitButton` disables itself and sets `aria-busy` while pending (`components/ui/submit-button.tsx:17-24`). | Verified in source; shared file not edited. |
| Role behavior / escalation | No role input exists on this route. Server ignores client `role` and sets `role: 'student'` for new users (`app/actions/auth.ts:148-159`). Founder access is routed through the `/contact` footer link (`app/(auth)/signup/page.tsx:49-56`). | Verified in source. |
| Success redirects | With a session, signup mirrors the profile and redirects via `dashboardPathForCurrentUser()` (`app/actions/auth.ts:169-178`); that resolver returns `/student`, `/founder`, or `/admin` only for a trustworthy role and otherwise signs out and returns `/login?error=profile-sync` (`:190-219`). Without a session it returns `/login?message=check-email` (`:180-181`), which the login page renders (`app/(auth)/login/page.tsx:28-31`, `:52`). | Verified in source. |
| Already-signed-in visitors | Proxy sends them away from `/signup` to a known role home; a failed lookup leaves the request alone rather than guessing a role (`proxy.ts:112-125`). | Verified in source. |
| Layout / tokens / headings | Page uses token utilities and `colors.smallTextAccent` for footer links (`app/(auth)/signup/page.tsx:27-30`, `:49-67`). Shared shell supplies the page `h1` while the signup card keeps its `h2` (`components/auth/auth-shell.tsx:10-22`, `:61-63`). | Verified in source. |

## Fixes made

1. **Client/server validation drift (fixed).** Before this pass, the client
   allowed, for example, a 79-character first name and a 2-character last name:
   both passed the per-field 80-character check, but the server joined them to
   81 characters and redirected to `?error=invalid`. The new combined check
   rejects that case before the network request and names the last field so the
   message is attached to a visible control.

## Checks performed

- Read `AGENTS.md`, `reports/page-fixes/MANIFEST.md`, `app/globals.css`,
  `reports/page-fixes/signup.md`, `reports/page-fixes/shared-workflow.md`,
  `reports/page-fixes/shared-design-system.md`, `design/brand-system.md`,
  `design/voice-guide.md`, and `lib/design-tokens.ts`.
- Read the relevant Next.js 16 guides before editing:
  `01-app/01-getting-started/05-server-and-client-components.md`,
  `07-mutating-data.md`, `10-error-handling.md`,
  `01-app/02-guides/forms.md`, `01-app/02-guides/redirecting.md`, and
  `01-app/03-api-reference/02-components/form.md`.
- Re-read the current shared action (`app/actions/auth.ts`), login page,
  proxy, submit button, auth shell, and signup server-auth test rather than
  trusting older reports.
- `npx eslint "app/(auth)/signup/page.tsx" "components/auth/signup-form.tsx"`
  — clean, exit 0.
- `npx tsc --noEmit --pretty false` — clean, exit 0.
- Not run by design: `next build`, `npm test`, dev server, browser/Reticle.
  Runtime checks for the empty submit, password toggle, error banner focus, and
  small viewport remain for the orchestrator.

## Findings routed to the workflow owner

- **Validation rules are duplicated (LOW).** `components/auth/signup-form.tsx`
  now mirrors the direct checks in `app/actions/auth.ts:130-137`, but there is
  still no single signup schema in `lib/validators.ts`. If more rules are added,
  the two copies can drift again. Recommended: add a shared signup schema (or
  exported constants/helper) and have both the client wrapper and server action
  call it. No shared file was edited here.
- **Server-error values are not preserved (LOW, product decision).** Server
  errors arrive as `?error=` redirects, which remount the page and clear the
  controlled form state. Restoring values would require a shared error/value
  channel; persisting the password would be a security regression. Recommended:
  only if product needs it, pass sanitized non-password values through session
  state or action state. Not changed here.
- Already routed by earlier passes and still applicable: process-local signup
  rate limiting (`app/actions/auth.ts:140-144`, `lib/rate-limit.ts`) and the
  explicit proxy role-lookup failure state (`proxy.ts:120-126`). Not duplicated
  as new findings.

## Database findings

- No new database finding from this route. `neon/schema.sql` does not enforce a
  name length, but the owned client now blocks the only known path that could
  exceed the server boundary, and the server already rejects it. Earlier
  schema/rate-limit findings remain with the database owner and were not
  re-edited.

## Deliberately not changed

- `app/actions/auth.ts`, `proxy.ts`, `lib/validators.ts`, `lib/rate-limit.ts`,
  `neon/schema.sql`, tests, and all other shared files — outside this route’s
  ownership.
- Existing error copy, metadata, canonical URL, footer destinations, and the
  token-backed footer-link change already present in the worktree — no defect
  found and copy ownership was not expanded.
- `components/ui/submit-button.tsx`, `components/auth/auth-shell.tsx`,
  `components/auth/styles.ts`, and `app/globals.css` — shared design-system
  ownership; current behavior is correct for this route.
- No role selector was added. Student-only self-signup is intentional, and the
  server explicitly ignores any client-supplied role.
- No `maxLength` attributes were added. The accessible validation message is
  preferable to silently preventing input, and the server still needs its own
  boundary for direct POSTs.
- `reports/page-fixes/MANIFEST.md` and every other agent’s report.
