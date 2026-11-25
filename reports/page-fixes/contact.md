# `/contact` page fixes

Route: `/contact`
Owner file: `app/contact/page.tsx` (only product file changed)

## Files changed

- `app/contact/page.tsx` — UI, copy, mailto context, and small-screen cleanup.
- `reports/page-fixes/contact.md` — this report (new file).

## Changes in `app/contact/page.tsx`

- **Mailto context (audit MED, route-specific):** both email actions now carry
  encoded `subject` and `body` (`:22-34`). The general draft prompts for role,
  page or feature, and project or order reference; the founder draft prompts
  for name, organisation, and project idea. Prompts mirror the on-page guidance
  at `:155-163` and `:212-215`, so the context travels with the message.
- **Duplicate actions (audit MED, carried from `reports/cold-eyes.md:20`):**
  kept the giant mailto at `:73-89` as the single primary email action and
  removed both repeated "Email the team" `ActionLink` instances. `ActionLink`
  remains only on the founder access card (`:217`).
- **Duplicate FAQ paths (audit MED, carried from `reports/cold-eyes.md:20`):**
  removed the hero "Read the FAQ" link and the `helpfulLinks[0]` FAQ card. The
  closing `CtaBand` at `:281-286` is now the only FAQ path. Updated the helpful
  pages grid from three columns to two (`:260`) so the two remaining cards
  (`/public`, `/how-it-works`) fill the row without a gap.
- **Response expectation (audit LOW, route-specific):** added one honest line
  under the hero, "We read every message and reply as soon as we can."
  (`:69-71`). No unverified SLA was promised. Softened the metadata description
  to remove "we will help" (`:15-20`) so metadata and visible copy match.
- **Small-screen height (audit LOW, carried from `reports/cold-eyes.md:25`):**
  page wrapper now uses `min-h-[100dvh]` (`:54`) instead of `min-h-screen`.
- **Small-screen address polish (audit LOW, static-only lead):** the giant
  email address uses `break-words` with `text-[clamp(1.75rem,7vw,4.5rem)]`
  (`:86`). This lowers the mobile end of the clamp and avoids forced word
  breaks. Rendered verification at 320px and 375px was not possible (see
  Checks).

No new dependencies, gradients, violet, emoji, or wholesale rewrites were
introduced. All colors and components remain inside the existing warm-paper /
forest / vermilion / amber system.

## Checks performed

- Read `reports/page-fixes/MANIFEST.md` in full and followed its ownership and
  workflow rules.
- Read the route audit, `CONSOLIDATED.md`, `AGENTS.md`, brand/voice/design
  guides, `app/globals.css`, and the relevant Next 16 docs under
  `node_modules/next/dist/docs/01-app/`
  (`01-getting-started/03-layouts-and-pages.md`,
  `05-server-and-client-components.md`, `14-metadata-and-og-images.md`).
- Verified every audit-cited line target against the current working-tree
  source before editing; the tree was dirty with user work and nothing was
  reverted, stashed, or reset.
- Re-read `app/contact/page.tsx` after editing to confirm the final JSX,
  imports, and link/mmailto wiring.
- `npx eslint app/contact/page.tsx` completed with no diagnostics.
- Targeted grep for `fetch|use server|async |supabase|neon|createClient|cookies\(|headers\(|redirect\(|revalidate|insert|update|delete|mutation|formAction` in `app/contact/page.tsx` returned no matches.
- Read-only verification of `config/app.ts:4-6`, `lib/metadata.ts`,
  `neon/schema.sql:50-79`, and `lib/neon-data.ts` contact-related lines.
- No full `next build`, `npm test`, or dev server was run, as required by the
  manifest. No browser or rendered check was possible (no dev server is
  reachable on ports 3000-3002), so the address-wrap change is source-level
  reasoning only and should be confirmed at 320px and 375px later.

## Workflow findings routed to owners

- **HIGH — shared header CTA (carried from `reports/cold-eyes.md:19`; not
  duplicated here).** `components/marketing/site-header.tsx:29-34` and
  `components/marketing/nav.ts:52-55`, rendered on this route via
  `app/contact/page.tsx:55`. The header's `founderContext` covers `/for-founders`
  and `/founder` but not `/contact`, so the default primary CTA still says
  "Create student account" on a page that explains founder access is arranged
  by admin request. Recommended fix, for the design-system owner (MANIFEST
  lines 95-99, since the fix lives in shared components): include `/contact` in
  the founder context, and on `/contact` hide the primary CTA or point it at
  the founder mailto instead of self-linking to `/contact`. Not edited here.
- **No workflow-owner findings.** There are no server actions, API routes,
  redirects, mutations, or status contracts on this route. The two
  route-specific workflow gaps found by the audit (mailto context and response
  expectation) were fixed inside the owned file.

## Database findings routed to owners

- **No findings.** `/contact` has no server actions, database queries,
  mutations, API calls, `fetch`, auth work, or user input. The `contact_email`
  column at `neon/schema.sql:62` and its use in `lib/neon-data.ts` belong to
  profile data, not to this static page. No stale status values, unbounded
  reads, missing indexes, ownership gaps, or DB-enforced copy promises were
  found for this route. Nothing routed to the database owner.

## Deliberately not changed

- Did not add a contact form: the page deliberately states "No form to fill in
  and no ticket queue" (`:124-127`) and the audit does not recommend adding
  one.
- Did not edit `components/marketing/site-header.tsx`,
  `components/marketing/nav.ts`, `components/marketing/cta-band.tsx`,
  `components/marketing/guides/primitives.tsx`, `components/ui/photo-credit.tsx`,
  `config/app.ts`, or `lib/metadata.ts`: all are outside this route's ownership
  and were only read for verification.
- Did not change the external Wikimedia credit links: `components/ui/photo-credit.tsx`
  already uses `target="_blank"` with `rel="noopener noreferrer"`.
- Did not add a numeric reply window: no verified SLA exists, so the honest
  no-SLA line was used instead.
- Did not run a rendered/responsive pass: forbidden to start a dev server and
  none was already reachable. The address clamp/wrap change remains a
  source-level fix pending visual confirmation.
