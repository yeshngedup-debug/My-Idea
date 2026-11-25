# `/login` second-pass fix report

Date: 2026-11-25. Pass: 2. Scope: feature completeness of the current `/login`
flow. This pass reviewed the live source in the dirty working tree; it did not
discard or rewrite earlier uncommitted work.

## Files changed

- `app/(auth)/login/page.tsx`
  - Added an explicit `profile-sync` error message at `:21-22`. The server emits
    this token after a Supabase profile read failure or a failed Neon role
    mirror; the previous generic fallback hid that distinct state.
  - Shortened the unknown-error fallback to `We couldn't log you in. Try again.`
    at `:26`, cutting routine filler without changing the meaning.
  - Changed the password-help mailto subject to `Password help request` at
    `:41`, so the destination subject matches the visible support-path copy.
  - Preserved the earlier pass's `h1`, server-built contact href, and enlarged
    signup CTA target.
- `components/auth/login-form.tsx`
  - Replaced the mount-only callback ref with a `useEffect` keyed to
    `serverError` at `:41-52`. A repeat server-action failure that changes the
    alert text now moves focus again instead of relying on the first mount.
  - Removed redundant `aria-required="true"` from both inputs at `:131` and
    `:169`; native `required` already exposes the state.
  - Changed the help link text from `Forgot password?` to
    `Email us for password help` at `:161`. The link opens a support email; the
    old label implied a self-service reset that does not exist.
  - Preserved the earlier pass's trimmed-email write-back, strong focus rings,
    and password-help link placement.

No shared file, route, dependency, test, or config was edited by this pass.

## Scope and coverage

**Scope:** `/login` only: `app/(auth)/login/page.tsx` and
`components/auth/login-form.tsx`. Read-only trace also covered
`app/actions/auth.ts`, `proxy.ts`, `components/auth/auth-shell.tsx`,
`components/ui/submit-button.tsx`, `components/auth/styles.ts`, `config/app.ts`,
`lib/rate-limit.ts`, `lib/neon-data.ts`, `neon/schema.sql`, the Next.js 16
getting-started guides, design/voice/token docs, and the prior page, audit,
copy, and shared-owner reports.

**Stack and conventions:** Next.js 16 App Router, Server Component page with a
client form shell, native form `action={login}`, React 19 `useFormStatus`
pending state, Tailwind utilities with project hex tokens, and the shared
`focusRing` constant. Copy follows `design/voice-guide.md`: plain, local,
human. No new dependency, gradient, emoji, violet, or wholesale rewrite was
introduced.

**Review boundary:** Runtime verification was explicitly out of scope for this
pass. No dev server, browser tool, full build, or test suite was run.

| Domain | Evidence inspected | Result |
| --- | --- | --- |
| Accessibility | Server alert and field error markup, focus refs, `role`/`tabIndex`, native `required`, `aria-invalid`, `aria-describedby`, `focusRing`, `SubmitButton` pending state | 2 owned fixes; no owned finding left. Screen-reader and keyboard runtime states are **Not verified**. |
| Layout | Password label/help flex row, 24px inline target, 44px signup CTA and submit target, field spacing, heading structure | Clear at source. 320px reflow and 200% zoom are **Not verified**. |
| Writing | Error/message maps, generic fallback, field errors, password-help label and mailto subject, rate-limit copy against `design/voice-guide.md` and `reports/copy-critic.md:25` | 3 owned fixes. Full self-service reset remains routed, not implemented. |
| Typography | `text-sm`/`text-base` inputs, 16px input size with no `sm:text-sm`, h1 clamp, wrapping rows, underlines | Clear at source. Rendered wrapping is **Not verified**. |
| Colors | Warm-paper/forest/vermilion hexes, amber/red alert pairing, token-based focus ring, `design/brand-guidelines.md` role mapping | Clear at source. Rendered contrast ratios were not measured; no pass is claimed. |
| UI | Existing radii, shared button, visible focus treatment, pending spinner, absence of decorative motion | Clear at source. No new polish was added. |

## Findings

| Severity | Domain | Location | Before | After | Why |
| --- | --- | --- | --- | --- | --- |
| MEDIUM | Writing | `app/(auth)/login/page.tsx:21-22` | `profile-sync` fell through to the generic login error. | Explicit copy: `We couldn't confirm your account details. Try logging in again.` | The server has a distinct account-sync failure state; generic copy gives the user no useful next step. |
| MEDIUM | Writing | `components/auth/login-form.tsx:157-162`; `app/(auth)/login/page.tsx:41` | `Forgot password?` opened a mail with subject `Password reset request`. | `Email us for password help` with subject `Password help request`. | The label promised a reset flow that does not exist; the link now describes the support path it actually opens. |
| MEDIUM | Accessibility | `components/auth/login-form.tsx:41-52` | A callback ref focused the server alert on mount only. | A stored ref plus `useEffect` keyed to `serverError` focuses the alert on each message change. | A client-side redirect back to the same route can change the error without remounting; repeat failures could be missed by keyboard and screen-reader users. |
| LOW | Writing | `app/(auth)/login/page.tsx:26` | `We couldn't log you in. Please try again.` | `We couldn't log you in. Try again.` | Routine `Please` is filler under the project voice and copy-critic guidance. |
| LOW | Accessibility | `components/auth/login-form.tsx:131,169` | Native `required` plus `aria-required="true"`. | Native `required` only. | Duplicating native state adds no information; platform semantics are preferred over custom ARIA. |

## Verification

### Passed checks

- Read the required Next.js 16 guides before editing: layouts/pages (async
  `searchParams`), server/client component boundaries, mutating data with native
  form actions, and error handling.
- Read the required project context before editing: `AGENTS.md`,
  `design/brand-system.md`, `design/brand-guidelines.md`,
  `design/voice-guide.md`, `lib/design-tokens.ts`, `app/globals.css`,
  `reports/page-fixes/MANIFEST.md`, `reports/page-audits/login.md`, the `/login`
  rows and cross-cutting sections of `reports/page-audits/CONSOLIDATED.md`,
  `reports/page-fixes/login.md`, `reports/page-fixes/shared-workflow.md`, and
  the phase-1 shared database/design reports.
- Source-verified `missing`, `invalid`, `rate-limited`, `profile-sync`, and
  unknown-error copy in `app/(auth)/login/page.tsx:16-31` against the redirect
  tokens in `app/actions/auth.ts:66-100,114-126,218`.
- Source-verified the 60-second window in `lib/rate-limit.ts:19-20` and the
  login limit of 5/minute in `app/actions/auth.ts:71` against the copy
  `Too many login attempts. Wait a minute and try again.`
- Source-verified email normalization on both sides:
  `components/auth/login-form.tsx:60,73-75` writes the trimmed value back before
  submit, and `app/actions/auth.ts:63` trims before rate limiting and sign-in.
- Source-verified role redirects are allow-listed to `/admin`, `/founder`, or
  `/student` at `app/actions/auth.ts:126`; no user-controlled redirect target
  is accepted.
- Source-verified logged-in auth-page handling at `proxy.ts:112-125`; the
  lookup-failure gap is routed below.
- Source-verified progressive enhancement and pending state:
  `components/auth/login-form.tsx:112-118` keeps `action={login}` and the shared
  `SubmitButton` at `components/ui/submit-button.tsx:17-37` exposes `pending`
  and `aria-busy`.
- Repo search found no `/reset-password` route and no `resetPasswordForEmail`
  implementation; the current password-help link is a real support email, not
  a link to a missing route.
- `npx eslint "app/(auth)/login/page.tsx" "components/auth/login-form.tsx"`
  passed with exit code 0.
- `npx tsc --noEmit --pretty false` passed with exit code 0.
- Reviewed the diff of the two owned files. All pre-existing dirty-tree edits,
  including the signup CTA sizing and removal of `sm:text-sm`, remain intact.

### Not verified

- Real sign-in, logout, and expired-session behaviour.
- Runtime success redirects to `/admin`, `/founder`, and `/student`.
- Focus movement after an actual server-action redirect, including repeated
  failures with the same error token.
- Screen-reader announcement of `role="alert"` and `role="status"` regions.
- 320px reflow, 200% zoom, and translated-text wrapping.
- Rendered contrast ratios and visual hover/focus states.

These remain **Not verified** because the user restricted this pass to source
review plus ESLint and TypeScript checks.

## Workflow findings routed to the workflow owner

- **HIGH — full self-service password recovery is still absent.**
  `app/actions/auth.ts:129-219` exports signup and logout flows but no
  `resetPasswordForEmail` action, and no `/reset-password` route exists. The
  owned files now show `Email us for password help` with a real mailto target,
  which satisfies the support-path fallback but is not account recovery.
  Recommended fix in the shared owner: add a reset-request action using a fixed
  allow-listed redirect, add the `/reset-password` page that accepts a new
  password, then repoint `passwordHelpHref` at `app/(auth)/login/page.tsx:41`.
  Keep redirect construction as constrained as `app/auth/callback/route.ts:10-36`.
- **MEDIUM — rate limiting remains process-local.** `lib/rate-limit.ts:18-21,40-65`
  uses a module `Map`. Multi-instance deploys keep separate counters.
  `app/actions/auth.ts:52-60` now uses the rightmost forwarded hop, which is a
  real improvement, but IP trust still depends on deployment topology.
  Recommended fix: shared Redis/Upstash or DB-backed counters plus a
  platform-trusted client address. No dependency or config was added here.
- **LOW — `/login` role-lookup failure has no page guard.**
  `proxy.ts:121-125` lets a request through when `lookupRole` fails, and
  `:129` says the page's own guard will fail closed. The current
  `app/(auth)/login/page.tsx` has no such guard, so an authenticated user with
  an unreadable role can still see the login form. Recommended fix: either add
  an explicit already-signed-in/sign-out state for that case, sign out when the
  role cannot be resolved, or update the proxy comment if the fall-through is
  intentional. No privilege escalation was observed from source alone.

Verified clean in shared workflow code: server-side email trim at
`app/actions/auth.ts:63`, trusted-hop rate-limit key at `:51-60`, profile-read
failure sign-out at `:97-101`, and role-mirror failure sign-out plus
`profile-sync` redirect at `:114-123`.

## Database findings routed to the database owner

- No new database defect was found on this login path.
- The earlier `DB-1` concern in `reports/page-fixes/login.md:117-125` is now
  mitigated in shared code: `app/actions/auth.ts:97-101` signs out on a failed
  Supabase profile read, and `:114-123` signs out and redirects with
  `?error=profile-sync` when the Neon role mirror throws. Login no longer
  proceeds with a stale elevated role in that path.
- `neon/schema.sql:8-16` constrains `profiles.role` to `student`, `founder`, or
  `admin`; `app/actions/auth.ts:103-126` maps to the same allow-list.
  `lib/neon-data.ts:47-55,150-168` remains parameterized and bounded by
  `where id = ... limit 1`. No index, query, or schema change is needed for this
  pass.
- No Neon RLS finding is restated: it is a global, already-owned posture.

## Deliberately not changed

- No `/reset-password` route or reset action was added. It needs shared auth
  files and a new route outside the `login` ownership boundary.
- No shared file was edited: `app/actions/auth.ts`, `proxy.ts`,
  `lib/rate-limit.ts`, `lib/neon-data.ts`, `config/app.ts`, `neon/schema.sql`,
  `components/auth/auth-shell.tsx`, `components/ui/submit-button.tsx`, and
  `components/auth/styles.ts` remain read-only for this pass.
- No generic handler was added for unknown `?message=` values. `MESSAGES` at
  `app/(auth)/login/page.tsx:28-31` retains the only known token; inventing copy
  for an unemitted token would be speculative. Unknown `?error=` values already
  receive a visible fallback.
- No password-reveal toggle was added. That gap is owned by
  `reports/component-relevance-audit.md:37`, outside this route's files.
- No palette, radius, spacing, or motion repaint was attempted. The existing
  warm-paper/forest/vermilion/amber system and shared `focusRing` were kept.
- No dev server, browser tool, full build, or test suite was run, per the
  manifest and the user's check boundary.

## Verdict

`Block` — no HIGH finding remains in the two owned files, but the routed HIGH
self-service password-recovery gap is still open outside this page's ownership.
The pass-2 owned-file work is complete; the full login flow should not ship
until the workflow owner resolves that route/action gap. All six interface
domains were inspected at source level; the runtime items listed under **Not
verified** were not claimed as passing.
