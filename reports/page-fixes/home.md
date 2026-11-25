# `/` (home) page-fix report

## Files changed

- `app/page.tsx`
  - Swapped `redirect` for `permanentRedirect` from `next/navigation` and call
    `permanentRedirect('/public')` (was `redirect('/public')`). This changes the
    root alias from a temporary `307` to a permanent `308` response, matching a
    stable marketing-home alias. This closes the only confirmed finding from
    `reports/page-audits/home.md:64` (LOW).

No other file was edited.

## Checks performed

- Read in full before editing: `reports/page-fixes/MANIFEST.md`,
  `reports/page-audits/home.md`, `reports/page-audits/CONSOLIDATED.md`,
  `AGENTS.md`, `design/brand-system.md`, `design/brand-guidelines.md`,
  `design/voice-guide.md`, `lib/design-tokens.ts`, `app/globals.css`.
- Read the installed Next.js 16 guides for the API touched:
  `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/redirect.md`
  and `permanentRedirect.md` (308 behavior at `permanentRedirect.md:11,49`),
  plus `01-getting-started/03-layouts-and-pages.md`.
  `permanentRedirect` is valid in a Server Component page and needs no `return`
  (it uses TypeScript `never`).
- Source verification: `app/page.tsx` is a two-line Server Component with no
  UI, data fetch, server action, cookies/headers read, or user input. The audit
  claim (`home.md:5,64`) that `/` only emits a redirect and that internal links
  already use `/public` as home was confirmed against current source.
- `npx eslint app/page.tsx` — passed, no findings.
- `git diff -- app/page.tsx` reviewed: two-line change only, no incidental edits.

## Workflow findings routed to the workflow owner

- None originated in this route. `app/page.tsx` has no server action, form,
  redirect chain beyond the single alias, or status contract. The one workflow
  finding (temporary `307` alias) lived inside the owned file and is fixed here.
- Cross-referenced, not re-owned (destination route `/public`, owned by the
  `public` page-fix agent): the compact live-context panel linking to `/about`
  instead of the on-page note (`components/data/live-context.tsx:436-443`), the
  refresh/pause controls and status label, the `aria-controls` IDREF issue in
  `components/interactive/animated-disclosure-list.tsx`, and the public
  `/api/context-data` rate-limit question. Source citations are in
  `reports/page-audits/public.md`; these are not `/` findings and are left to
  that owner / the shared design-system owner as appropriate.

## Database findings routed to the database owner

- No database findings for `/`. `app/page.tsx` issues no query and reads no
  field, so there is nothing to check against `neon/schema.sql` or
  `lib/neon-data.ts` for this route. No stale status values, unbounded reads,
  missing indexes, ownership gaps, or unenforced copy promises are introduced
  or relied upon by `/`.
- Cross-referenced (not re-owned): the destination `/public` reads only public
  aggregate World Bank/WHO series via `getLiveContext()`
  (`lib/data/world-bank.ts:359-437`, `app/api/context-data/route.ts:15-22`) with
  `Cache-Control: public, s-maxage=3600`; no user row, identifier, or RLS-gated
  data. Any rate-limit concern on that endpoint stays with the `public` owner.

## Deliberately not changed

- Destination UI/accessibility/copy issues on `/public` and shared chrome
  (`app/public/page.tsx`, `components/data/live-context.tsx`,
  `components/marketing/*`, `components/interactive/animated-disclosure-list.tsx`)
  — outside the `home` ownership table; owned by `public.md` and the
  design-system owner.
- Root-layout metadata / canonical (`app/layout.tsx:24` canonical `/`) and the
  site header home link (`components/marketing/nav.ts:11,87-91`,
  `SITE.homeHref = "/public"`) — shared files, not owned here. The audit found
  no metadata conflict; on `/` the redirect terminates rendering so only the
  `/public` canonical is emitted.
- No `next.config.ts` 308 redirect was added: the fix is fully contained in the
  owned file and `permanentRedirect` produces the same 308 result without
  touching shared config.
- No full build, test suite, or dev server was run, per the manifest. The 308
  response was not re-verified in a running server by this agent; it is grounded
  in the installed Next.js 16 docs (`permanentRedirect.md:11`).
