# Pass 3 — auth recovery and privacy deletion SLA (A7/A9)

## Scope

Implemented the A9 self-service password recovery flow and the A7 privacy deletion copy changes inside the owned auth/privacy files. No shared layout, design-system, payment, proxy, or unrelated page files were changed.

## Changes made

### New self-service reset flow

- `config/app.ts`
  - Added safe `APP_URL`, resolved from `NEXT_PUBLIC_SITE_URL` with `https://bhutantech.bt` as the fallback. Invalid or credential-bearing values fall back rather than trusting a hostile request `Host`.
  - Added the short-lived recovery marker cookie name and max age.
- `app/actions/auth.ts`
  - Added `requestPasswordReset(formData)`: validates email, rate limits by IP + email, calls Supabase `resetPasswordForEmail` with a pinned `${APP_URL}/auth/callback` redirect, and always redirects to `/forgot-password?sent=1` on provider success or failure so account existence is not disclosed.
  - Added `resetPassword(formData)`: validates length and confirmation, requires both a Supabase-authenticated user and the recovery marker cookie, rate limits by IP + email, calls `auth.updateUser({ password })`, clears the marker, signs the user out, and redirects to `/login?message=password-updated`.
  - Added `isValidEmail`, `isValidPassword`, and recovery cookie helpers. Existing login/signup/logout behaviour was preserved.
- `app/auth/callback/route.ts`
  - Kept the existing confirmation and role-based dashboard routing, but now exchanges the PKCE `code` through `auth.exchangeCodeForSession(code)` before routing.
  - Routes `redirectType === 'recovery'` to `/reset-password` and sets the `HttpOnly`, `Secure` (HTTPS only), `SameSite=Lax` recovery marker for 15 minutes.
  - Builds all redirects from `APP_URL`; the request `Host`/`origin` is no longer used as a redirect source.
  - Failed exchanges and missing codes fail closed to `/login?error=invalid`.
- `app/(auth)/forgot-password/page.tsx` and `components/auth/forgot-password-form.tsx`
  - New email request page with accessible client validation, focus management, and a non-enumerating success message.
- `app/(auth)/reset-password/page.tsx` and `components/auth/reset-password-form.tsx`
  - New authenticated reset page. The server component rejects requests without both the recovery marker and a verified Supabase user. The client form validates length and matching entries before the server action runs and announces/focuses errors.
- `app/(auth)/login/page.tsx` and `components/auth/login-form.tsx`
  - `Forgot password?` is now the primary link to `/forgot-password`.
  - The server-built mailto remains as a secondary `Contact us` fallback for undelivered reset email.
  - A9 exact copy changed from `Too many login attempts. Wait a minute and try again.` to `Try again in a moment.`
  - Added the `password-updated` success message.
- `app/privacy/page.tsx`
  - A7 deletion copy now states the 5-working-day acknowledgement target, the 30-day completion target where deletion is required, the verification step, the data removed from live services, and the order/payment records that may be retained for transaction completion, refunds/disputes, and accounting or legal obligations. The targets are explicitly described as operational, not a legal guarantee.

### Test support

- `tests/supabase.mock.ts`
  - Added `resetPasswordForEmail`, `updateUser`, and `exchangeCodeForSession` auth mocks.
  - Auth overrides passed to `mockSupabaseClient()` are now merged instead of discarded.
- `app/actions/auth.test.ts`
  - Added focused tests for reset request redirect contract, non-enumerating provider failure, input validation, request rate limiting, recovery-marker enforcement, password update/session termination, and reset rate limiting.
- `app/auth/callback/route.test.ts`
  - Added focused tests for PKCE exchange, recovery routing, role dashboard routing after exchange, marker cookie behaviour, failed exchange handling, and ignoring a hostile request origin.

## Validation run

- `npx vitest run app/actions/auth.test.ts app/auth/callback/route.test.ts`
  - Result: 2 test files passed, 15 tests passed.
- No full `npm test`, no `npm run build`, and no dev server were run, per the task constraint.
- No commit, stash, reset, checkout, or clean was performed. The pre-existing dirty working tree was left intact.

## Deployment/runtime checks still required

These were not verifiable in this task and must be checked before release:

1. Set `NEXT_PUBLIC_APP_URL` in every deployment environment (`NEXT_PUBLIC_SITE_URL` is still accepted as a legacy alias). It is required in production; if unset, `validateEnv()` fails when a Supabase client is created. See README "Deploying to Vercel" for the full variable list.
2. Add `https://bhutantech.bt/auth/callback` (and the staging origin's `/auth/callback` when configured) to the Supabase Auth redirect URL allow-list. Supabase rejects `resetPasswordForEmail` redirects that are not allow-listed.
3. Confirm the Supabase recovery email template points to the callback URL and that email delivery works; the UI fallback contact link covers undelivered mail but does not replace provider configuration.
4. Verify in a real browser that the Supabase session cookies written during `exchangeCodeForSession` are present after the route handler returns `NextResponse.redirect`. Unit tests mock `next/server` and cannot prove cookie propagation through the Next.js runtime.
5. Confirm the recovery marker cookie is not stripped by an intermediary and that `Secure` behaves correctly behind TLS termination.
6. Re-check rate limiting after deployment. `lib/rate-limit.ts` is in-memory and per-instance; a multi-instance deployment needs a shared store for effective limits.
