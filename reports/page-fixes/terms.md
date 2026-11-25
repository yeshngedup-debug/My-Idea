# `/terms` (terms) page-fix report

## Files changed

- `reports/page-fixes/terms.md` (this report). No product source file was edited.
- `app/terms/page.tsx` was **not** edited. It already carries an uncommitted
  working-tree change at `:208` (`inline-flex min-h-6 items-center` on the
  mailto link) from `reports/page-audits/terms.md:130-131`. That change was
  treated as authoritative user work and left intact.

## Checks performed

- Read in full before deciding: `reports/page-fixes/MANIFEST.md`,
  `reports/page-audits/terms.md`, `reports/page-audits/CONSOLIDATED.md`,
  `AGENTS.md`, `design/brand-system.md`, `design/brand-guidelines.md`,
  `design/voice-guide.md`, `lib/design-tokens.ts`, `app/globals.css`.
- Read the installed Next.js 16 guides relevant to this static Server Component
  page: `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`,
  `05-server-and-client-components.md`, `07-mutating-data.md`,
  `10-error-handling.md`, `14-metadata-and-og-images.md`, and
  `02-guides/css-in-js.md`. The page uses no server action, mutation, dynamic
  route prop, or client boundary; static `metadata` export and a plain `<style>`
  element are both valid in this Server Component.
- `npx eslint app/terms/page.tsx` — passed, no findings.
- Source verification against current worktree (`app/terms/page.tsx:1-220`):
  - One `h1` (`:58-60`) and five sections with matching `aria-labelledby`
    headings (`:89-213`); the on-page `<nav aria-label="On this page">`
    (`:69-85`) lists exactly those five `#` targets and all ids exist.
  - Root skip link in `app/layout.tsx:128-134` targets `#main-content`, which
    matches `app/terms/page.tsx:39`.
  - Focus-visible rings use the legal-UI small-text accent `#b23c26` with a
    2px ring, 2px offset and explicit paper offset colour (`:46,78,208`).
    The mailto link is `min-h-6` (24px), clearing WCAG 2.5.8 for inline links.
  - Muted copy `#657069` on `#f5f2ea` measures about 4.6:1 and body copy at
    `/75` opacity measures about 6.8:1, both above 4.5:1. Palette values match
    `lib/design-tokens.ts` and `design/brand-guidelines.md`.
  - `legal-mount` animation (`:16-27`) is transform/opacity only, 240ms, and
    explicitly set to `animation: none` under `prefers-reduced-motion: reduce`.
  - The inline `<style>` (`:40`) is permitted by the CSP in `proxy.ts:42`
    (`style-src 'self' 'unsafe-inline'`); no CSP change is needed.
  - Static metadata (`:7-14`) follows the same untyped-object convention as the
    sibling legal page `app/privacy/page.tsx:7-14` and composes with the root
    title template in `app/layout.tsx:15-20`.
- `git diff -- app/terms/page.tsx` reviewed: only the pre-existing mailto class
  change; this agent added no diff.

## Workflow findings routed to the workflow owner

- None originate in `/terms`. The route has no server action, route handler,
  form, redirect, fetch, or status transition; the only interactive elements
  are links (`:44-49`, `:76-81`, `:206-211`).
- Verified and **not** routed: the back-home link targets `/`, and
  `app/page.tsx:1-2` permanently redirects that to `/public`; the mailto target
  resolves from `config/app.ts:5` (`hello@bhutantech.bt` default); the
  "template is provided in the founder dashboard" claim at `:135-136` is backed
  by the live download at `app/founder/shortlists/shortlists-client.tsx:345-349`
  and the PDF response in `app/founder/shortlists/agreement/route.ts:54-64`.
- The shared agreement download and root alias are outside this ownership
  table; no change was attempted.

## Database findings routed to the database owner

- `/terms` itself issues no query and reads no database field, so there are no
  route-local stale status values, unbounded reads, missing indexes, or
  ownership gaps to report.
- One copy-versus-schema gap to review (not fixed here):
  `app/terms/page.tsx:189` states "We may suspend accounts that abuse the
  platform." `neon/schema.sql:8-16` gives `public.profiles` only `id`, `role`
  (`student`/`founder`/`admin`), name/college/avatar and timestamps. There is
  no account-state or suspension column, and `lib/neon-data.ts:47-54,119-162`
  exposes no helper to disable an account; role-based gating in `proxy.ts`
  therefore has no suspended state to honour. Recommended fix for the database
  + workflow owners: add an explicit account status (for example
  `active`/`suspended`) with a migration, an admin-only transition, and a
  check in the shared authorization gate; or, if suspension is intended only
  as a manual/off-platform action, agree to soften the sentence with the copy
  owner. Do not edit legal copy in this route without that decision.
- Positive verification, not a finding: the "shortlists are prepared after
  payment is confirmed" claim at `:162-163` matches the `status = 'confirmed'`
  guard used before shortlist creation in `lib/neon-data.ts:739-740` and the
  `shortlist_orders.status` check constraint in `neon/schema.sql:81`.

## Deliberately not changed

- No UI, layout, contrast, focus, live-region, or copy edits: both the audit
  (`reports/page-audits/terms.md:46-140`) and independent source verification
  found zero confirmed defects, and the manifest asks for small, purposeful
  diffs only.
- The existing uncommitted mailto class change at `:208` was preserved, not
  reverted or restyled.
- The inline `<style>` block was left as-is: it is CSP-compatible and the
  reduced-motion path is correct; replacing it with a new CSS file belongs to
  the design-system owner and would enlarge the diff for no defect.
- Overlapping findings cited by the audit stay with their existing owners:
  canonical/OG/SEO and reduced-motion in `reports/performance-seo.md:140`,
  WCAG/contrast in `reports/accessibility-critic.md:41-42`, legal text and link
  integrity in `reports/content-integrity.md:48-50,63-66`, voice/typography in
  `reports/copy-critic.md:8,23,44`, and component relevance in
  `reports/component-relevance-audit.md:36`.
- No full `next build`, `npm test`, or dev server was run, per the manifest;
  the checks above are source verification plus a single-file lint.
