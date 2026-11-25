# Page audit: `/login`

## Route

- **Route audited:** `/login` only.
- **Mode:** read-only critic pass across UI design, accessibility, workflow, and the data/RLS path. Uncommitted work in the tree was treated as authoritative.
- **Runtime evidence:** a fresh isolated Playwright context at 1444×900 loaded `http://127.0.0.1:3000/login` with title `Log in | Bhutan Tech Connect`, `h1 ["Paid project work in Bhutan"]`, `h2 ["Log in"]`, a form with labels `Email` and `Password`, `autocomplete="email"` / `autocomplete="current-password"`, both inputs `required`, submit button `Log in`, no rendered alerts, and links limited to `Skip to main content`, `/`, `/public`, the photo credit, and `/signup`. No horizontal overflow was measured (`innerWidth=1444`, document scroll width `1429`, body scroll width `1429`).
- **Runtime limitation:** the final 320px recheck could not load the dev server (`net::ERR_CONNECTION_REFUSED` on `127.0.0.1:3000`), so the mobile observations here are source-based only. The untracked `auth-login-320.png` was not treated as authoritative evidence.

## Files traced

- `app/(auth)/login/page.tsx:6-13` metadata; `:15-28` error/message maps; `:30-48` server props and form mount; `:50-58` signup CTA.
- `components/auth/login-form.tsx:31-47` error ids and server-error focus; `:53-78` client validation; `:80-106` alerts/status and form wiring; `:109-171` fields and submit button.
- `components/auth/auth-shell.tsx:12-35` shell/header; `:48-69` marketing copy, photo credit, and form card.
- `components/auth/auth-shell.module.css:27-37` card surface; `:52-80` button states and reduced-motion handling; `:82-98` reduced-transparency and high-contrast fallbacks.
- `components/ui/submit-button.tsx:10-37` pending state and 44px minimum target.
- `app/actions/auth.ts:22-43` rate-limit key and login guard; `:45-82` Supabase sign-in, role read, Neon role mirror, and role redirect; `:85-143` signup/logout context.
- `app/auth/callback/route.ts:10-36` email-confirmation callback, traced for recovery parity.
- `proxy.ts:100-134` session validation, auth-page bounce, and role protection.
- `lib/rate-limit.ts:18-59` in-memory limiter.
- `lib/supabase/server.ts:16-41` SSR Supabase client and cookie writes.
- `lib/neon-data.ts:1-7` data-layer authorization model; `:47-64` role read; `:129-168` profile insert and login-time role sync.
- `supabase/run-all.sql:28-51` profile RLS; `:562-592` role-change guard; `:781-783` hardened insert policy.
- `supabase/migrations/20261124000000_close_security_bypasses.sql:183-191` latest direct-insert hardening.

## Skills used

Loaded and applied the required skills from `reports/SKILL-ASSIGNMENTS.md:3-12,19-28`:

- `unslop` for minimal, product-specific copy and for rejecting decorative or template-like additions.
- `better-interface`, `better-layout`, and `better-ui` for evidence-based UI findings; these `better-*` skills govern interface evidence under the precedence rule at `reports/SKILL-ASSIGNMENTS.md:11`.
- `better-writing` for field labels, error copy, and CTA wording.
- `frontend-a11y` and `better-accessibility` for WCAG 2.2 checks on labels, focus, ARIA state, and target size.
- `webapp-testing` for the Playwright DOM evidence.
- `security-review` and `api-security-testing` for the login action, rate limiting, role sync, and RLS trace.

No landing/portfolio aesthetic conflict arose, so the `design-taste-frontend` precedence rule was not needed for this auth route.

## UI/UX findings

### Confirmed

- **LOW — UI-1: the page task is visually and semantically below a repeated marketing statement.** `components/auth/auth-shell.tsx:49-54`; `app/(auth)/login/page.tsx:39-41`. The only `h1` is `Paid project work in Bhutan`, the following paragraph repeats almost the same sentence, and the actual task heading `Log in` is an `h2`. Why it matters: heading navigation announces the marketing claim before the task, and the duplicated sentence gives a scanner no new information. Fix: let the login page own the `h1` (`Log in`), demote the marketing line to a paragraph, and either remove `components/auth/auth-shell.tsx:52-54` or replace it with a distinct benefit such as what the visitor can do after signing in.

### Confirmed passes, not findings

- Labels, autocomplete, required state, and visible focus treatment are present at `components/auth/login-form.tsx:109-160`; field errors use `aria-invalid`, `aria-describedby`, and `role="alert"` at `:123-124`, `:130-137`, `:154-155`, and `:161-168`.
- Server errors use `role="alert"` and receive focus at `components/auth/login-form.tsx:82-92`; informational messages use `role="status"` at `:93-100`.
- Submit target is at least 44px and has a focus ring at `components/ui/submit-button.tsx:20-24` and `components/auth/auth-shell.module.css:52-66`.
- Reduced motion, reduced transparency, and higher contrast are handled at `components/auth/auth-shell.module.css:68-98`.
- Source-level ARIA wiring was already verified in `reports/accessibility-critic.md:46`; this audit does not restate it or claim physical screen-reader testing.

### Overlaps, not restated as findings

- Password reveal on `/login` is already owned with a concrete fix at `reports/component-relevance-audit.md:37`.
- Rate-limit copy is already owned at `reports/copy-critic.md:25`; the current source at `app/(auth)/login/page.tsx:18-19` uses the requested wording, so no stale-copy finding is added here.

## Workflow findings

### Confirmed

- **HIGH — WF-1: a user who forgets their password has no self-service recovery step on `/login`.** `components/auth/login-form.tsx:140-170`; `app/(auth)/login/page.tsx:50-58`; `app/actions/auth.ts:31-143`. The password block ends with the field and submit button, the page's only secondary CTA is `Create a student account`, and the auth server actions cover only `login`, `signup`, and `logout`. Why it matters: the blocked user's only next step is to create a different account, which can lead to duplicate identities or abandonment. Fix: add a `Forgot password?` link beside the password label, implement a server action that calls Supabase `resetPasswordForEmail` with a fixed allow-listed redirect, add a `/reset-password` page that sets the new password, and keep the redirect construction as constrained as the existing callback pattern at `app/auth/callback/route.ts:10-36`. If self-service reset is intentionally disabled, replace the missing affordance with a visible support path.

- **MED — WF-2: client-side email normalization does not match what the server action submits.** `components/auth/login-form.tsx:54-66`; `app/actions/auth.ts:31-40`. The client trims `email` only into a local validation variable and then lets the native form action continue; the server action reads the raw `FormData` value. Why it matters: an email pasted with leading or trailing whitespace passes the client pattern check but reaches Supabase with the whitespace intact, then returns the generic invalid-credentials error from `app/actions/auth.ts:47-50`. The rate-limit key at `:28` lowercases but also keeps the whitespace, so the same user can get separate buckets. Fix: normalize once in `login` before rate limiting and sign-in, for example `const email = String(formData.get('email') ?? '').trim();`, and optionally write the trimmed value back to the input before allowing submit.

### Suspected

- **MED — WF-3: brute-force protection may be bypassable outside a single process or when the IP header is not trusted.** `lib/rate-limit.ts:18-21,40-58`; `app/actions/auth.ts:23-29,39-43`. The limiter is a module-local `Map`, and the key's IP comes from the first `x-forwarded-for` value or `x-real-ip`. Why it matters: separate serverless instances or workers each hold their own counters, and a deployment that does not sanitize client-supplied `x-forwarded-for` lets an attacker choose bucket keys. This is deployment-dependent and was not runtime-proven in this audit. Fix: move counters to a shared store such as Redis/Upstash or a database-backed limiter, derive the client IP from the platform's trusted proxy value or socket address, and test the limit across two instances.

### Confirmed passes, not findings

- Unknown `?error=` values fall back to a visible generic message instead of a dead button at `app/(auth)/login/page.tsx:22-23,45`.
- Missing, invalid, and rate-limited failures use distinct messages at `app/(auth)/login/page.tsx:15-20` and `app/actions/auth.ts:35-49`.
- Logged-in users are bounced away from `/login` to their role dashboard at `proxy.ts:115-121`, and successful login redirects by allow-listed role at `app/actions/auth.ts:66-82`.

## Database/RLS findings

### Confirmed

- **No new route-specific data-layer or RLS defect found on the traced `/login` path.** Login authenticates through the SSR Supabase client at `app/actions/auth.ts:45-47` and `lib/supabase/server.ts:16-41`, then reads only the signed-in user's `profiles.role` and `full_name` at `app/actions/auth.ts:56-65`. The Neon `syncProfileRole` write is parameterized and role values are allow-listed to `student`, `founder`, or `admin` at `app/actions/auth.ts:66-76` and `lib/neon-data.ts:150-168`.
- Supabase profile RLS is enabled with own-row select/insert/update at `supabase/run-all.sql:28-41`, admins can read all profiles at `:43-51`, the role-change trigger blocks non-admin self-escalation at `:562-592`, and the insert policy now requires `role = 'student'` at `:781-783` and `supabase/migrations/20261124000000_close_security_bypasses.sql:183-191`.
- Neon has no RLS by design at `lib/neon-data.ts:1-7`; authorization is application-layer. This posture is already tracked in `reports/FINAL-AUDIT.md:59-60` and `reports/orchestrator-audit.md:116`, so it is not restated as a new `/login` finding.

### Suspected / overlap

- **MED — DB-1: a failed Neon role mirror on login is swallowed and can leave a stale role in the database used by the proxy.** `app/actions/auth.ts:71-82`; `lib/neon-data.ts:145-168`; `proxy.ts:115-130`. Why it matters: `syncProfileRole` can throw, login proceeds anyway, and the proxy reads the Neon role on later requests; a demotion made only in Supabase can remain elevated until a mirror runs. This is the login-side instance of the two-provider sync risk already owned at `reports/orchestrator-audit.md:128` and `reports/FINAL-AUDIT.md:57-60`, so it is referenced rather than duplicated here. Fix in that owner: make identity mirroring automatic or read the authoritative role from the identity provider, while keeping transient Neon failures from returning a 500 on login.

## Severity summary

| Severity | Confirmed new | Suspected / overlap | Findings |
|---|---:|---:|---|
| HIGH | 1 | 0 | WF-1 password recovery gap |
| MED | 1 | 2 | WF-2 email normalization; WF-3 rate-limit distribution/IP trust; DB-1 role-mirror overlap |
| LOW | 1 | 0 | UI-1 heading hierarchy and repeated copy |

## Recommended fixes

1. **WF-1 (HIGH):** add a `Forgot password?` affordance in `components/auth/login-form.tsx` near the password field, implement `resetPasswordForEmail` with a fixed allow-listed redirect, and add the matching `/reset-password` page. Ship the support-path alternative if self-service reset is intentionally unsupported.
2. **WF-2 (MED):** trim the email in `app/actions/auth.ts` before the rate-limit key and `signInWithPassword`, so client-side validation and server submission agree.
3. **WF-3 (MED):** replace the process-local `Map` in `lib/rate-limit.ts` with a shared store and derive the IP from a trusted source rather than the first raw `x-forwarded-for` segment.
4. **UI-1 (LOW):** make `Log in` the page `h1`, demote the auth-shell marketing statement, and remove or differentiate the repeated sentence at `components/auth/auth-shell.tsx:52-54`.
5. **DB-1 (MED, overlap):** follow the existing owner at `reports/orchestrator-audit.md:128` for automatic role mirroring or an authoritative identity-provider role; do not open a duplicate work item from this page audit.

## Notes/limitations

- Only this file was written. No product source, config, schema, test, existing report, or `reports/page-audits/INDEX.md` was edited. `reports/page-audits/INDEX.md:10` still lists `/login` as pending and was intentionally left untouched.
- No build was run and no child agents were spawned.
- Repository-wide search found no forgot-password, `resetPasswordForEmail`, reset route, or password-recovery action; `app/actions/auth.ts:31-143` exports only `login`, `signup`, and `logout`.
- The desktop DOM was verified in Playwright in an earlier pass. The final mobile recheck failed because the dev server was no longer reachable at `127.0.0.1:3000`; 320px reflow, 200% zoom, keyboard traversal, and physical screen-reader announcements are therefore not claimed as runtime-verified here.
- Console messages seen during the shared Playwright session were HMR WebSocket noise (`net::ERR_INVALID_HTTP_RESPONSE`), not `/login` page defects.
- Existing report overlaps were read before finalizing and are referenced, not duplicated: password reveal at `reports/component-relevance-audit.md:37`; rate-limit copy at `reports/copy-critic.md:25`; public agreement CTA at `reports/content-integrity.md:55` and `reports/copy-critic.md:22`; ARIA verification at `reports/accessibility-critic.md:46`; general RLS/two-provider posture at `reports/FINAL-AUDIT.md:57-60` and `reports/orchestrator-audit.md:116,128`.
