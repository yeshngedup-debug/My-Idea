# Page fixes — `/signup`

Date: 2026-11-24. Scope: per-page fix pass defined in
`reports/page-fixes/MANIFEST.md`. Only the two owned source files and this
report were written. The working tree was treated as the source of truth; the
pre-existing uncommitted footer-link change in `app/(auth)/signup/page.tsx`
(`inline-flex min-h-11 items-center`) was preserved.

## Files changed

- `app/(auth)/signup/page.tsx`
  - Replaced hardcoded heading/link colours with token-backed utilities
    (`text-primary`, `text-body-secondary`, `decoration-accent`, and a CSS
    variable populated from `colors.smallTextAccent`) so the warm-paper /
    forest / vermilion palette stays token-driven.
  - Tightened small-screen vertical rhythm (`mt-5` → `sm:mt-6` for the form,
    `mt-6` → `sm:mt-7` for the footer) to help keep the submit button in view
    on a short phone viewport without shrinking the 44px link/button targets.
  - Kept metadata, error map, error copy, canonical URL, and both footer links
    unchanged in behaviour.

- `components/auth/signup-form.tsx`
  - U1 (HIGH): validation now runs inside the form action via
    `useActionState` (`submitAction`, `:99-118`; `formAction`, `:120-123`), so
    the `signup` server action is never called for an invalid submission.
    This removes the reliance on `onSubmit` + `preventDefault` ordering.
  - Controlled field values (state at `:93`, read from `FormData` at
    `:103-108`, rendered back through the `value` props) survive React's
    post-action form reset, so a failed validation pass no longer clears what
    was typed.
  - U2: replaced the callback ref with `serverErrorRef` + `useEffect`
    (`:81`, `:125-127`, `:151`) so the `role="alert"` banner is focused after
    commit when `?error=` changes. `role="alert"`, `tabIndex={-1}` and the
    form-level `aria-describedby` remain.
  - U3: added an accessible `Show password` / `Hide password` toggle
    (`:271-289`) with `aria-pressed`, `aria-controls`, a 44px target, and
    `onMouseDown` focus preservation.
  - U4: reduced small-screen field spacing (`space-y-4 sm:space-y-5`,
    `gap-3 sm:gap-4`) while keeping the shared `SubmitButton` and its 44px
    minimum height.
  - U5: moved repeated input/label colours to token utilities
    (`inputClassName`, `labelClassName`) using `border-border`,
    `bg-background`, `text-body`, `text-body-secondary`, `text-primary`,
    `border-accent`, `ring-accent/20`; restored `sm:text-sm` on inputs.
  - W2 client half: added an 80-character name limit with field-level errors
    (`MAX_NAME_LENGTH`, `:26`; validation, `:49-56`). The server half is
    routed below.

- `reports/page-fixes/signup.md`: this report.

## Checks performed

- Read `AGENTS.md`, `reports/page-fixes/MANIFEST.md`, the `/signup` audit, the
  relevant `CONSOLIDATED.md` sections, `design/brand-system.md`,
  `design/brand-guidelines.md`, `design/voice-guide.md`, `lib/design-tokens.ts`,
  and `app/globals.css` before editing.
- Read the relevant Next.js 16 docs: layouts/pages, server/client components,
  mutating data, error handling, and `02-guides/forms.md` (validation errors,
  `useActionState`, `useFormStatus`). Also checked React 19's form-action
  listener and post-action form reset in `react-dom-client.development.js` to
  confirm why validation must not rely solely on `onSubmit`.
- Verified current source against the audit rather than trusting it: error map,
  footer links, form action, ARIA wiring, shared `SubmitButton`, signup server
  action, `neon/schema.sql`, and `lib/neon-data.ts`.
- `npx eslint "app/(auth)/signup/page.tsx" "components/auth/signup-form.tsx"`
  — clean.
- Deliberately did **not** run `next build`, `npm test`, a dev server, or a
  browser session, per `MANIFEST.md`. The orchestrator should re-run the
  empty-submit, `?error=`, password-toggle, and 375×667/812 checks in a real
  browser after the phase-2 owners land their changes.

## UI / accessibility outcome

- U1: invalid submissions are rejected in the form action before `signup()`
  can run; submitted values are restored through controlled state and the
  first invalid field is focused. Browser verification is still pending (see
  Checks).
- U2: the server error banner is now focused on route-driven error changes.
- U3: password visibility can be toggled with a named, pressed-state button.
- U4: small-screen spacing was reduced without touching shared shell styles.
- U5: owned surfaces now use token utilities; remaining hardcoded error-banner
  reds and the shared submit button's forest background are outside this
  route's ownership.

## Workflow findings routed to the workflow owner

- **W1 (MED)** — `app/actions/auth.ts:117-119`: every Supabase signup error is
  redirected as `exists`, so weak passwords, malformed emails, and transient
  service errors are presented as “An account with this email already exists.”
  Recommended fix: switch on `error.code` / `error.message`; map duplicate
  email (`23505`) to `exists`, weak/invalid input to `invalid` or a specific
  new code, and unknown errors to the existing generic fallback at
  `app/(auth)/signup/page.tsx:24`. Owned by the workflow owner; no shared file
  was edited.
- **W2 server half (MED)** — `app/actions/auth.ts:86-89,110-113`: the action
  trims `firstName`/`lastName` but has no length boundary before writing
  `raw_user_meta_data.full_name`. The client side is now guarded at
  `components/auth/signup-form.tsx:26,49-56`; the server must reject names
  over 80 characters too, rather than silently truncate.
- **W3 (MED, suspected)** — `proxy.ts:27-33,115-120,123-131` and
  `app/actions/auth.ts:145-170`: when the Neon role lookup throws,
  `safeRole()` returns `null` and a signed-in founder/admin can be sent to
  `/student`. Recommended fix: resolve the role from the Supabase profile
  first (as login already does at `app/actions/auth.ts:61-69`) and use one
  shared resolver for the redirect and proxy.

Copy for `invalid` and `rate-limited` was intentionally left unchanged;
`reports/copy-critic.md:25` already owns that wording.

## Database findings routed to the database owner

- **D1 (MED)** — `app/actions/auth.ts:22-29,95-99` and
  `lib/rate-limit.ts:18,28-38,40-59`: the 3/minute signup limiter is a
  module-level `Map`, so counters are per process and the client IP comes from
  proxy-controlled headers. In a multi-instance deploy the limit can be
  bypassed. Recommended fix: atomic counters in a shared store and a trusted
  platform IP header.
- **D2 (MED)** — `app/actions/auth.ts:124-132,145-170` and
  `lib/neon-data.ts:129-143`: `ensureProfile` failure is swallowed, and the
  success redirect's `getProfileRole` failure also falls back to `/student`.
  A user can reach a dashboard with no Neon profile row. Recommended fix:
  retry once, log with a correlation id, and expose an explicit retry /
  “profile setup incomplete” state through one shared role resolver.

Verified against `neon/schema.sql:8-16`: `profiles.role` defaults to `student`
with a check constraint, and `full_name` is a nullable text column. The client
name-length guard above prevents oversized values from this page; the schema
itself has no length constraint, which the database owner may consider as part
of W2. Role assignment remains server-controlled; no new role-escalation or
schema defect was found for this route.

## Deliberately not changed

- `app/actions/auth.ts`, `proxy.ts`, `lib/rate-limit.ts`, `lib/neon-data.ts`,
  `neon/schema.sql`, `supabase/**`, and any test/config file: shared owners
  own these under `MANIFEST.md:88-94`.
- `components/auth/auth-shell.tsx`, `auth-shell.module.css`,
  `components/auth/styles.ts`, `components/ui/submit-button.tsx`,
  `lib/design-tokens.ts`, and `app/globals.css`: design-system ownership.
- `components/auth/login-form.tsx`: password-reveal parity with `/login`
  belongs to the login page agent.
- Existing error copy, metadata, canonical URL, and footer destinations;
  no new dependencies, gradients, violet, emoji, or wholesale rewrites.
- `reports/page-fixes/MANIFEST.md` and every other agent's report.
