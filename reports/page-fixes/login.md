# `/login` page-fix report

## Files changed

- `app/(auth)/login/page.tsx`
  - Promoted the task heading from `h2` to `h1` so heading navigation reaches
    `Log in` as a level-one heading (`:43-45`). This is the owned half of UI-1
    from `reports/page-audits/login.md:43`; the shared half is routed below.
  - Built the password-help `mailto:` href in this Server Component with
    `APP_CONTACT.email` (`:36-39`) and passed it to `LoginForm` (`:48-52`).
    Reading the contact module here keeps the non-public `CONTACT_EMAIL`
    variable out of the browser bundle; no env access was added to the client.
- `components/auth/login-form.tsx`
  - Added a visible `Forgot password?` link beside the password label (`:149-163`),
    using the shared `focusRing`, the small-text accent `#b23c26`, a vermilion
    underline, and a 24px inline-link target. It opens a support email with the
    subject "Password reset request". This closes the user's dead end without
    pointing at a route that does not exist. The full self-service reset is
    routed to the workflow owner below.
  - On a valid client submit, the trimmed email is written back to the
    uncontrolled input before the action builds `FormData` (`:69-77`), so the
    browser sends exactly the value that passed validation. This is the client
    half of WF-2; the server half is routed below.
  - Strengthened both input focus indicators from a 20%-opacity ring to a full
    `#d84f37` 2px ring with a 2px offset on the surface colour (`:138`, `:177`).
    The old 20% ring was about 1.1:1 against the input's own background; the
    brand contract (`design/brand-guidelines.md:129-130`) asks for a 2px
    `#d84f37` ring with 2px offset.

No other file was edited. Pre-existing dirty-tree edits in these two files
(the signup CTA's `inline-flex min-h-11 items-center`, and the removal of
`sm:text-sm` from both inputs) were left intact; they are user work, not part
of this diff.

## Checks performed

- Read in full before editing: `reports/page-fixes/MANIFEST.md`,
  `reports/page-audits/login.md`, the `/login` rows and the cross-cutting,
  master-list, prioritized-plan, verification-gap and overlap sections of
  `reports/page-audits/CONSOLIDATED.md`, `AGENTS.md`,
  `design/brand-system.md`, `design/brand-guidelines.md`,
  `design/voice-guide.md`, `lib/design-tokens.ts`, `app/globals.css`.
- Read the installed Next.js 16 getting-started guides for the APIs in scope:
  `03-layouts-and-pages.md` (async `searchParams` is awaited at
  `app/(auth)/login/page.tsx:36`), `05-server-and-client-components.md`
  (client boundary and event handlers), `07-mutating-data.md` (native form
  actions and progressive enhancement). No server action, redirect or route
  API was changed here, so no further API docs were needed.
- Source verification of the audit leads:
  - `app/(auth)/login/page.tsx:15-28` still maps `missing`, `invalid` and
    `rate-limited` to distinct messages, with a generic fallback for unknown
    codes. The rate-limit copy already matches `reports/copy-critic.md:25`.
  - `components/auth/login-form.tsx:92-117` still wires `role="alert"` with
    focus-on-mount for server errors and `role="status"` for the check-email
    message; labels, `autoComplete`, `required`, `aria-required`,
    `aria-invalid` and `aria-describedby` are intact.
  - `app/actions/auth.ts:31-83` confirms the audit's WF-2 trace: `login()` reads
    raw `FormData` with no trim, while the client validated a trimmed copy.
  - `proxy.ts:115-121` bounces an authenticated user off `/login`;
    `app/actions/auth.ts:66-82` allow-lists the role redirect. Both still
    hold.
  - Read-only trace of `components/auth/auth-shell.tsx`,
    `components/auth/auth-shell.module.css`, `components/auth/styles.ts`,
    `components/ui/submit-button.tsx`, `app/actions/auth.ts`, `proxy.ts`,
    `lib/rate-limit.ts`, `lib/neon-data.ts`, `config/app.ts`, `neon/schema.sql`,
    `reports/component-relevance-audit.md:37` and `reports/copy-critic.md:25`.
- `npx eslint "app/(auth)/login/page.tsx" "components/auth/login-form.tsx"`
  passed (exit 0).
- `git diff -- <the two owned files>` reviewed; only the bullets above were
  added on top of the pre-existing user edits.
- No full build, test suite, dev server or browser run, per the manifest. The
  320px reflow, 200% zoom and screen-reader announcements are therefore not
  claimed as runtime-verified here.

## Workflow findings routed to the workflow owner

- **HIGH — WF-1, full self-service password reset.** `app/actions/auth.ts:31-143`
  exports only `login`, `signup` and `logout`; no `resetPasswordForEmail` action
  and no `/reset-password` route exist (`reports/page-audits/login.md:62,108`).
  The new `Forgot password?` link in `components/auth/login-form.tsx:157-162`
  is a real support path (mailto with a password-reset subject), not a dead
  link, but it is not account recovery. Recommended fix in the shared owner:
  add a `resetPasswordForEmail` server action with a fixed allow-listed redirect,
  add the `/reset-password` page that accepts a new password, then repoint the
  link's `passwordHelpHref` at `app/(auth)/login/page.tsx:39` to that route.
  Keep redirect construction as constrained as `app/auth/callback/route.ts:10-36`.
- **MED — WF-2, server-side email normalization.**
  `app/actions/auth.ts:32,40,47`: `login()` reads
  `String(formData.get('email') ?? '')` without `.trim()`, then uses the raw
  value both in the rate-limit key (`rateLimitKey` lowercases but keeps
  whitespace, `:28`) and in `signInWithPassword`. A no-JS submission still
  sends the pasted whitespace and gets the generic invalid-credentials result.
  Recommended fix: `const email = String(formData.get('email') ?? '').trim();`
  before the empty check, rate limit and sign-in. The client write-back in this
  pass covers only the JS path.
- **MED — WF-3, rate-limit distribution and IP trust.**
  `lib/rate-limit.ts:18,40-58` is a module-local `Map`; `app/actions/auth.ts:23-29`
  takes the first raw `x-forwarded-for` segment. Separate instances keep
  separate counters and a client-controlled header can pick a bucket.
  Recommended fix: shared store (Redis/Upstash or DB-backed) plus an IP from
  the platform's trusted proxy value or socket address. Suspected, not
  runtime-proven in the audit; not edited here.
- **Shared UI owner — UI-1 needs its other half.**
  `components/auth/auth-shell.tsx:49-51` still renders `Paid project work in
  Bhutan` as the only shell `h1`, and `:52-54` repeats nearly the same
  sentence. With the owned heading promoted, `/login` temporarily has two
  `h1` elements until the shell is fixed. Recommended fix in the design-system
  owner: demote the shell heading to a paragraph (or a smaller non-heading
  line) and remove or differentiate `:52-54`. Coordinate with the `signup`
  agent, which owns the sibling task heading in the same shell.
- **Overlap, not re-owned:** the password-reveal toggle gap stays with
  `reports/component-relevance-audit.md:37`; no icon/Tooltip dependency was
  added here.

## Database findings routed to the database owner

- **DB-1 (MED, overlap) — failed Neon role mirror can leave a stale proxy role.**
  `app/actions/auth.ts:71-82` swallows a `syncProfileRole` throw so login
  succeeds on a transient Neon outage, while `proxy.ts:115-130` later reads the
  Neon role via `safeRole`. A Supabase-only demotion can therefore stay
  elevated until a mirror runs. Recommended fix follows the existing owner at
  `reports/orchestrator-audit.md:128` and
  `reports/FINAL-AUDIT.md:57-60`: make identity mirroring automatic or read the
  authoritative role from the identity provider, while keeping transient Neon
  failures from returning a 500 on login. No DB file was edited.
- **Verified clean on this path:** `neon/schema.sql:8-16` defines
  `public.profiles.role` as `text not null ... check (role in ('student',
  'founder', 'admin'))`, `full_name text`, and `id uuid primary key`; the
  `Role` union in `app/actions/auth.ts:20` and the allow-list at `:66-69` match
  the check constraint. `lib/neon-data.ts:150-168` (`syncProfileRole`) and
  `:47-55` (`getProfileRole`) are parameterized and bounded by
  `where id = ${id} limit 1`, so this route contributes no unbounded read and
  needs no new index. The Supabase profile RLS and role-change guard traced in
  `reports/page-audits/login.md:81` were not changed.
- No Neon RLS is a global, already-owned posture (`lib/neon-data.ts:1-7`,
  `reports/page-audits/CONSOLIDATED.md:101-106`); it is not restated as a new
  `/login` finding.

## Deliberately not changed

- `components/auth/auth-shell.tsx`, `components/auth/auth-shell.module.css`,
  `components/auth/styles.ts`, `components/ui/submit-button.tsx`,
  `app/actions/auth.ts`, `proxy.ts`, `lib/rate-limit.ts`,
  `lib/neon-data.ts`, `config/app.ts`, `neon/schema.sql` — shared files outside
  the `login` ownership table. Findings against them are routed above.
- No `/reset-password` route was created: it is outside the owned files, and a
  half-built reset flow would be worse than the visible support path.
- No self-service reset claim was added to the UI copy. The link text is the
  requested `Forgot password?`, but its destination is a support email until
  the workflow owner implements reset.
- Off-palette card/input hexes, Tailwind red/amber alert colours, and the small
  `text-xs` field errors were left alone: none is a confirmed finding in the
  `/login` audit and changing them would be a repaint beyond this small pass.
- No full build, tests, dev server or browser verification, per the manifest.
