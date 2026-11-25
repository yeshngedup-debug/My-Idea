# Page fix — `/faq`

Slug: `faq`. Route: `/faq`. Owned file: `app/faq/page.tsx`.
Uncommitted working-tree changes were treated as authoritative. No shared file,
schema, config, test, or other agent's report was edited. No full build, test
suite, or dev server was run.

## Files changed

- `app/faq/page.tsx` — UI/accessibility fixes, four descriptive protected-path
  links, three copy corrections, and one `FAQPage` JSON-LD block. No shared
  component, style, action, route, or database file was changed.

## Key changes

- **UI-1 (LOW, redundant topic index)** — deleted the
  `nav aria-label="Question topics"` block and its `topics` data. The three
  `Chapter` section headings remain as the page index. This resolves the
  still-present duplication described at `reports/page-audits/faq.md:47` and
  `reports/visual-recheck.md:29`.
- **UI-2 (LOW, mobile viewport)** — `app/faq/page.tsx:247` now uses
  `min-h-[100dvh]` instead of `min-h-screen`, avoiding mobile browser chrome
  height jumps without changing surrounding layout.
- **WF-1 (MED, raw protected paths)** — replaced `/login`, `/student/projects`,
  `/student/applications`, and `/founder/shortlists` prose at
  `app/faq/page.tsx:93,140,144,176` with descriptive `Link` elements using the
  existing inline-link styling, now extracted as `INLINE_LINK_CLASS` at `:42`.
- **WF-2 (LOW, missing FAQ structured data)** — added one static `FAQPage`
  JSON-LD block at `app/faq/page.tsx:219-255`. `plainText()` unwraps the existing
  `ReactNode` answers so all 11 question/answer pairs stay in sync with
  `clusters`; `JSON.stringify(...).replace(/</g, "\\u003c")` follows
  `node_modules/next/dist/docs/01-app/02-guides/json-ld.md:9-36`. The nonce is
  read from `x-nonce` at `:244` and applied at `:250` so the inline block is not
  blocked by the CSP at `proxy.ts:39-49`. `app/layout.tsx:62` already reads the
  same header, so the route was already dynamically rendered in practice; no
  shared file was touched.
- **Backend-copy corrections inside the owned file** — the profile answer at
  `:112-114` now matches the fields returned by `listBrowseableStudents()`
  (`lib/neon-data.ts:641-655`); the CV answer at `:156-159` now states both
  access paths enforced by `app/api/cv/[id]/route.ts:59-82`; the demo-account
  answer at `:209-211` now distinguishes legacy `@btc-test.com` cleanup from the
  current `@btc-e2e.test` seed users.

## Checks performed

- Read `AGENTS.md`, `reports/page-fixes/MANIFEST.md`,
  `reports/page-audits/faq.md`, relevant `reports/page-audits/CONSOLIDATED.md`
  sections, `design/brand-system.md`, `design/brand-guidelines.md`,
  `design/voice-guide.md`, `lib/design-tokens.ts`, and `app/globals.css`.
- Read the relevant Next 16 guides before editing: `json-ld.md`,
  `content-security-policy.md`, `scripts.md`, `headers.md`,
  `01-getting-started/03-layouts-and-pages.md`,
  `05-server-and-client-components.md`, `07-mutating-data.md`, and
  `10-error-handling.md` under `node_modules/next/dist/docs/01-app/`.
- `npx eslint app/faq/page.tsx` — passed, no diagnostics.
- `git diff -- app/faq/page.tsx` reviewed; pre-existing dirty-tree edits (the
  `Reveal` → `div` chapter heading, the `from-[#17352b]/85` gradient, and the
  added inline-link min-height classes) were preserved, not reverted.
- Source-verified the FAQ claims against `app/founder/browse-students/page.tsx:56-69`,
  `app/founder/browse-students/browse-client.tsx:10-21,120-135`,
  `app/api/cv/[id]/route.ts:1-93`, `app/founder/shortlists/page.tsx:87-131`,
  `app/actions/shortlist-order.ts:169-192`, `app/actions/admin-students.ts:42-79`,
  `neon/schema.sql:35-85`, `lib/neon-data.ts:492-508,641-655,885-911,943-958,1046-1058`,
  `lib/env.ts:38-52`, `scripts/neon-setup.mjs:35-45`, and
  `supabase/migrations/20261122000000_security_hardening.sql:1-4`.
- No production build, full test suite, dev server, or browser run was started,
  per `reports/page-fixes/MANIFEST.md:50-51`.

## Workflow findings routed to the workflow owner

- **No route-level workflow bug remains in the owned file.** All four raw
  protected-path mentions are now links, and all in-page anchor targets still
  exist because only the redundant nav block was removed.
- **CV access is broader than the old FAQ copy implied.** `app/api/cv/[id]/route.ts:59-82`
  allows a founder with any application to one of their projects, or a shortlist
  row plus a confirmed paid order. The FAQ copy at `app/faq/page.tsx:156-159` was
  corrected to match this route; no API code was changed.
- **Payment confirmation is admin-only.** `app/actions/shortlist-order.ts:169-192`
  requires `requireAdmin()` and a non-null `screenshot_path` before setting
  `status = 'confirmed'`. The shortlist unlock at
  `app/founder/shortlists/page.tsx:87-131` depends on that status. No workflow
  bug found in this chain.

## Database findings routed to the database owner

- **CV access is application-layer only.** `neon/schema.sql:1-4` explicitly says
  authorization stays in server actions/middleware and creates no RLS policies.
  The FAQ promise “role-checked links” is delivered by
  `app/api/cv/[id]/route.ts:36-82`, not by a database constraint. If the rule
  must survive direct SQL access, add a DB-side view/RPC or policy; otherwise
  keep the API route as the documented authority.
- **Confirmed orders are not DB-guaranteed to have proof.** `neon/schema.sql:75-85`
  allows `status = 'confirmed'` with `screenshot_path` or `confirmed_at` null.
  The screenshot rule is enforced only in `app/actions/shortlist-order.ts:173-185`.
  Recommend a check constraint or trigger if the DB must reject that state; the
  FAQ copy at `app/faq/page.tsx:179-181` currently describes the application
  behavior accurately.
- **Demo-account cleanup is split and easy to misstate.** Legacy
  `@btc-test.com` users are deleted in
  `supabase/migrations/20261122000000_security_hardening.sql:1-4`, but the
  current Neon seed creates `@btc-e2e.test` users at
  `scripts/neon-setup.mjs:35-45`. `lib/env.ts:38-52` defines an
  `assertNoDemoUsers()` production guard, but a repository search found no call
  site. The FAQ copy now says current seeded users must be removed before
  launch. Recommend wiring the guard into a startup/action or adding a dedicated
  launch migration for the `@btc-e2e.test` domain.
- **Founder directory query is unbounded.** `lib/neon-data.ts:641-655` returns
  every qualifying student with no `LIMIT` or pagination. This backs the
  “founders browse profiles” claim at `app/faq/page.tsx:112` but could grow
  without bound. Recommend a limit/pagination contract for
  `listBrowseableStudents()`.
- **Status vocabulary checked.** Application values (`pending`, `shortlisted`,
  `accepted`, `rejected`) at `neon/schema.sql:39` and order values (`pending`,
  `submitted`, `confirmed`, `rejected`) at `:81` match the actions and UI; no
  stale status value was found in this page's copy.

## Deliberately not changed

- **UI-3 (11-item scan)** — kept the native `<details>` disclosures. The audit
  allows recording this as an accepted tradeoff; a bespoke search widget would
  add client state and a new pattern beyond the small-diff rule
  (`reports/page-audits/faq.md:49,97`).
- **Root JSON-LD and CSP** — `app/layout.tsx:110-125` still emits only the
  `Organization` block, and `proxy.ts:39-49` still owns the CSP nonce. The page
  adds a separate `FAQPage` block rather than editing shared files.
- **Design-system and database/workflow files** — untouched per ownership in
  `reports/page-fixes/MANIFEST.md:88-94`.
- Pre-existing dirty-tree changes in `app/faq/page.tsx` were left intact; this
  pass only added the fixes listed above.
