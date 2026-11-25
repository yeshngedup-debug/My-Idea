# Page audit — `/signup`

Date: 2026-11-24. Role: one read-only page critic; no child agents were spawned.
No product source, config, schema, test, existing report, or `INDEX.md` was
edited. The working-tree version of `app/(auth)/signup/page.tsx` was treated as
authoritative; its uncommitted change adds `inline-flex min-h-11 items-center`
to both footer links (`:45`, `:55`). That change was not reverted.

## Route

`/signup` — student account creation. A server component passes a mapped
`?error=` string into a client form (`app/(auth)/signup/page.tsx:25-40`). The
form renders inside `AuthShell` (`components/auth/auth-shell.tsx:10-72`) and
calls the `signup` server action (`components/auth/signup-form.tsx:99-105`,
`app/actions/auth.ts:85-137`). Supabase creates the auth user; a database
trigger creates a `student` profile; the action mirrors that profile into Neon
and redirects to the role dashboard. `proxy.ts:107-121` sends already signed-in
visitors away from `/signup`.

## Files traced

| File | Why it is in scope |
|---|---|
| `app/(auth)/signup/page.tsx:1-62` | Target route: metadata, error map, footer links |
| `components/auth/signup-form.tsx:1-246` | Client validation, ARIA wiring, field rendering, submit |
| `components/auth/auth-shell.tsx:1-73` | Rendered shell, hero, card placement |
| `components/auth/auth-shell.module.css:1-98` | Glass card, press feedback, reduced-motion/contrast fallbacks |
| `components/auth/styles.ts:6-7` | Shared auth-link focus ring |
| `components/ui/submit-button.tsx:1-39` | Pending state and 44px submit target |
| `app/actions/auth.ts:1-171` | Signup action, error redirects, rate limit, role redirect |
| `lib/rate-limit.ts:1-59` | In-memory limiter used by signup |
| `lib/supabase/server.ts:16-42` | Server-side Supabase client and cookie handling |
| `lib/neon-data.ts:1-169` | Neon profile mirror and role lookup |
| `proxy.ts:25-143` | Auth-page redirect and role fallback |
| `supabase/migrations/20261024000000_init_btc.sql:17-73,519-549` | Profiles table, signup trigger, role-change guard |
| `supabase/migrations/20261024010000_fix_rls_recursion.sql:12-36` | `has_role()` helper and profiles RLS |
| `supabase/migrations/20261122000000_security_hardening.sql:1-33` | Demo-account removal and CV access hardening |
| `supabase/migrations/20261124000000_close_security_bypasses.sql:185-191` | Direct profile insert restricted to `student` |

Existing reports were read before finalizing, including all current
`reports/*.md` and `reports/page-audits/*.md`. Overlaps are referenced below
instead of being repeated.

## Skills used

Loaded and applied per `reports/SKILL-ASSIGNMENTS.md:5-13`:

- `unslop` — minimal copy and no decorative UI tell; authoritative for copy under `:8`.
- `better-interface`, `better-layout`, `better-ui` — evidence-based rendered layout and surface findings.
- `better-writing` — error and hint copy.
- `frontend-a11y`, `better-accessibility` — WCAG 2.2 focus, alert announcement, labels, targets.
- `apple-design`, `animate` — checked card entrance, press feedback, reduced-motion/transparency/contrast behaviour.
- `webapp-testing` — Playwright MCP against the running dev server.
- `security-review`, `api-security-testing` — server action, rate limiting, role assignment, RLS/data layer.

Not used: `design-taste-frontend` (not a landing/portfolio aesthetic review) and
`gpt-taste` (would only apply as a stricter non-conflicting variant).

## UI/UX findings

### Confirmed

| ID | Severity | Exact location | Evidence / why it matters | Concrete fix |
|---|---|---|---|---|
| U1 | **HIGH** | `components/auth/signup-form.tsx:50-83`; `app/(auth)/signup/page.tsx:15-20,38-40` | In a fresh Playwright run, submitting the empty form navigated to `/signup?error=invalid` after ~1.8s instead of being stopped by `handleSubmit`. The generic banner appeared, `document.activeElement` stayed `BODY`, and the first-name value was cleared. Users lose entered data and receive no field-level explanation even though the source intends inline validation. The runtime behaviour is confirmed; the cause is **suspected** to be React 19 form-action/`onSubmit` ordering or pre-hydration submission, not proven. | Make the validation gate authoritative: move field validation into the action path with `useActionState` returning field errors, or test and use a submit handler that reliably cancels the form action before it starts. Keep the current server-side guard. Re-run the empty-submit browser check after the change. |
| U2 | **MED** | `components/auth/signup-form.tsx:42-44,87-97,103` | `focusServerError` is a callback ref on the `role="alert"` banner. Runtime check showed focus remained on `BODY` after both a direct `?error=invalid` load and a failed submit. Keyboard and screen-reader users are not taken to the error; the form-level `aria-describedby` alone did not move focus. `reports/accessibility-critic.md:46` verified this wiring only at source level; this adds runtime proof. | Replace the callback ref with `useRef` + `useEffect` keyed on `serverError`, focusing after the route commit. Re-focus when the error code changes without a remount. Keep `role="alert"` and `tabIndex={-1}`. |
| U3 | **MED** | `components/auth/signup-form.tsx:208-226` | The password is masked with no reveal control and there is no confirmation field. With only the hint at `:227-229`, a typo is invisible until login fails. Already noted at `reports/component-relevance-audit.md:38` for both auth pages. | Add an adjacent `Show password` / `Hide password` button with an accessible name and `aria-pressed`, preserving input focus. Apply the same treatment to `/login` so the two forms behave consistently. |
| U4 | **LOW** | `components/auth/auth-shell.tsx:34-35,63-65`; `components/auth/signup-form.tsx:104,106,240-242`; `components/ui/submit-button.tsx:24` | At 375×812 the submit button measured at y=817, below the fold. No horizontal overflow occurred, but the primary action needs a scroll to be seen on a short phone viewport. | Reduce the small-screen hero/card vertical footprint or tighten the form's `space-y-5`, keeping the 44px submit target. Alternatively use a sticky bottom action inside the card. Recheck at 375×667 and 375×812. |
| U5 | **LOW** | `app/(auth)/signup/page.tsx:34,45,55`; `components/auth/signup-form.tsx:126,157,189,225`; `components/auth/auth-shell.module.css:4-11,27-37` | Auth surfaces still hardcode navy/vermilion/paper hex values instead of the canonical tokens. `reports/brand-tokens.md:12` records that `components/auth/**` was left outside token scope; `reports/icon-fix.md:40-51` and `reports/orchestrator-audit.md:31` cover the earlier navy focus correction. This is token drift, not a new colour-direction defect. | Replace the hardcoded values with the named constants from `lib/design-tokens.ts:18-47` (or CSS custom properties mirrored from them). Keep the existing focus ring at `components/auth/styles.ts:6-7`. |

No motion defect was found: the card entrance uses opacity/transform
(`components/auth/auth-shell.module.css:36-48`) and reduced-motion,
reduced-transparency and increased-contrast fallbacks ship at `:68-97`. The
submit press feedback at `:52-66` is a 44px target with a visible focus ring.

## Workflow findings

### Confirmed

| ID | Severity | Exact location | Evidence / why it matters | Concrete fix |
|---|---|---|---|---|
| W1 | **MED** | `app/actions/auth.ts:117-119`; `app/(auth)/signup/page.tsx:15-20` | Every Supabase signup error is redirected as `exists`, so a weak password, malformed email or transient service error is presented as “An account with this email already exists.” Once U1 lets a bad submission reach the server, the message is actively misleading. | Switch on `error.code` / `error.message`: map duplicate-email (`23505`) to `exists`, weak/invalid input to `invalid` or a new `weak-password` / `invalid-email` code, and unknown errors to the existing `GENERIC_ERROR` fallback at `app/(auth)/signup/page.tsx:23`. |
| W2 | **MED** | `components/auth/signup-form.tsx:114-127,145-157`; `app/actions/auth.ts:86-89,110-113` | Neither name input has `maxLength`, and the action only trims them. Arbitrarily long strings are placed in `raw_user_meta_data.full_name` and Neon `profiles.full_name`, then rendered in dashboards; this can break layout and inflate stored rows. Impact severity depends on hostile input, but the missing boundary is confirmed. | Enforce a shared limit (e.g. 80 characters) in both client validation and the server action before calling `signUp`, with a specific field error. Reject rather than silently truncate. |

### Suspected

| ID | Severity | Exact location | Evidence / why it matters | Concrete fix |
|---|---|---|---|---|
| W3 | **MED** | `proxy.ts:27-33,115-120,123-131`; `app/actions/auth.ts:145-170` | When the Neon role lookup throws, `safeRole()` returns `null` and logged-in visitors on `/signup` are sent to `/student` even if their Supabase profile says `founder` or `admin`. The same fallback governs protected areas, so elevated areas remain fail-closed but the landing dashboard can be wrong. Not reproduced because no outage/failure was injected. | Resolve the role from the already-available Supabase profile first (`app/actions/auth.ts:61-69` does this on login) and treat Neon as a mirror. If Neon must be authoritative, show a retry state instead of silently defaulting to `student`. Make `dashboardPathForCurrentUser` and `proxy` use the same resolver. |

A valid positive path was checked and needs no finding: when Supabase returns
no session, `app/actions/auth.ts:135-136` redirects to
`/login?message=check-email`, and `app/(auth)/login/page.tsx:25-28,43-47`
renders that message. It was not reproduced because confirmation was disabled
in the tested setup.

## Database/RLS findings

### Confirmed implementation, suspected impact

| ID | Severity | Exact location | Evidence / why it matters | Concrete fix |
|---|---|---|---|---|
| D1 | **MED** | `app/actions/auth.ts:22-29,95-99`; `lib/rate-limit.ts:18,28-38,40-59` | The 3/minute signup limit uses a module-level `Map`. It is per process, so each serverless instance or replica has its own counter; the IP comes from `x-forwarded-for` / `x-real-ip`, which is attacker-controlled unless the deploy guarantees a trusted proxy. The limiter is confirmed; bypass in a multi-instance deploy is suspected, not measured here. | Move counters to a shared store (Neon/Redis/Upstash) with atomic increments, derive the client IP only from the platform's trusted header, and add a server-side CAPTCHA or email verification for repeat abuse. Keep the 5,000-bucket sweep at `lib/rate-limit.ts:28-38`. |
| D2 | **MED** | `app/actions/auth.ts:124-132,145-170`; `lib/neon-data.ts:125-143` | `ensureProfile` failure is swallowed, then the success redirect calls `dashboardPathForCurrentUser`, whose `getProfileRole` failure is also swallowed and defaults to `/student`. A user can therefore enter a dashboard with no Neon profile row and no error signal; role-dependent data calls may fail later. Code path is confirmed; user-visible failure depends on a Neon outage and was not injected. | Retry the mirror once, log the failure with a correlation id, and either redirect to a retry page or render an explicit “profile setup incomplete” state. Use the same role resolver as `proxy.ts` so the two decisions cannot diverge. |

### Checked, no new defect

Role assignment is correctly server-controlled. The client-supplied role is
ignored (`app/actions/auth.ts:103-114`); the signup trigger always inserts
`student` (`supabase/migrations/20261024000000_init_btc.sql:53-73`); direct
profile insert is restricted to `role = 'student'`
(`supabase/migrations/20261124000000_close_security_bypasses.sql:185-191`); role
changes are blocked for non-admins
(`supabase/migrations/20261024000000_init_btc.sql:519-549`); and profiles RLS
uses a non-recursive `has_role()` helper
(`supabase/migrations/20261024010000_fix_rls_recursion.sql:12-36`). The
founder-access → `/contact` link is also intentional and already owned by
`reports/content-integrity.md:42,64` and `reports/cold-eyes.md:19`; no duplicate
finding is added here.

## Severity summary

| Severity | IDs | Count |
|---|---|---|
| HIGH | U1 | 1 |
| MED | U2, U3, W1, W2, W3, D1, D2 | 7 |
| LOW | U4, U5 | 2 |
| **Total** | U1-U5, W1-W3, D1-D2 | **10** |

No BLOCK finding was identified. U1 is HIGH because it is a reproduced,
user-blocking validation failure that discards input.

## Recommended fixes

1. **U1 + U2 + W1:** make validation and error presentation authoritative before touching layout. Re-test the empty-submit and `?error=` paths in a real browser; assert field errors, banner focus and correct error text.
2. **W2 + D2:** add a server-side name-length boundary and make the Neon profile mirror observable instead of silently swallowed.
3. **D1 + W3:** replace the process-local limiter with a shared store and unify role resolution between the signup redirect and `proxy.ts`.
4. **U3:** add an accessible password reveal toggle on both auth forms.
5. **U4 + U5:** tighten the small-screen fold and tokenize the auth colours. Reference `reports/brand-tokens.md:12` so the fixer does not undo the already-applied navy focus work.

Do not update `reports/page-audits/INDEX.md` from this critic pass;
`reports/PROTOCOL.md:16-17` gives the orchestrator ownership of status changes.

## Notes/limitations

- Playwright MCP was used against the running dev server at
  `http://10.9.95.184:3000/signup` while it was available in this session.
  `http://127.0.0.1:3000/signup` returned 200 from the shell, but the LAN URL
  was the reachable browser endpoint; `host.docker.internal:3000` timed out.
  A later connection re-check was refused, so no new browser run was started
  after that point. U1/U2/U4 and the DOM inventory are from the earlier live
  run; all source findings are from the current working tree.
- `npm run build` was not run while `next dev` was active, per the task rule.
- HMR WebSocket errors seen in the browser console on the LAN URL
  (`ws://10.9.95.184:3000/_next/hmr` handshake failures) are treated as a dev
  transport artifact and are not counted as product findings.
- Copy overlaps are not repeated: `reports/copy-critic.md:25` already records
  the current `invalid`/`rate-limited` strings as the agreed fix. U1/U2 add new
  runtime evidence only.
- Existing-account CTA behaviour for signed-in students is owned by
  `reports/page-audits/for-students.md:28`; sitemap exposure of `/signup` is
  owned by `reports/performance-seo.md:130`.
- Only this file was written. Product source, config, schema, tests and
  existing reports remain unchanged.
