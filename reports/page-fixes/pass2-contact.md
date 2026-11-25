# `/contact` page fixes — pass 2

Date: 2026-11-25
Route: `/contact`
Owner file: `app/contact/page.tsx` (only product file changed)

## Files changed

- `app/contact/page.tsx` — mailto line endings, tokenised secondary copy, and one founder-access wording fix.
- `reports/page-fixes/pass2-contact.md` — this report (new file).

All pre-existing uncommitted work was kept. The working-tree file was treated as the source of truth; no checkout, reset, stash, or clean was run.

## Features verified

- **Primary mailto** (`:22-34`, `:73-89`): uses `APP_CONTACT.email` from `config/app.ts:4-6`, with an encoded subject and body. The body prompts ask for role, page or feature, and project or order reference, matching the on-page guidance at `:154-163`.
- **Founder mailto** (`:32-34`, `:217-219`): uses an encoded subject and body. The prompts ask for name, organisation, and project idea, matching the card copy at `:212-215`. The shared `ActionLink` gives it a visible focus ring and a 48px minimum target.
- **FAQ path** (`:281-286`): the closing `CtaBand` is the only FAQ action on the page. It points to `/faq`, which exists and renders the FAQ content. The earlier duplicate hero and helpful-links FAQ actions remain removed.
- **Copy and expectations** (`:65-71`, `:124-127`, `:198-202`): there is no numeric reply window or invented SLA. The response line says the team replies as soon as it can. Founder access now says an admin arranges it, matching `design/voice-guide.md:11`.
- **Accessibility**: one `h1`; each `Chapter` is labelled by its heading; decorative envelope icons are `aria-hidden`; all interactive elements have visible focus styles. The hero address is a large text target with `break-words`, and the shared `ActionLink` and `CtaBand` focus classes were read directly in `components/marketing/guides/primitives.tsx:83-108` and `components/marketing/cta-band.tsx:51-57`.
- **Workflow and data**: this is a static page. No server action, API call, redirect, mutation, auth call, `fetch`, or database read exists in the owned file.

## Fixes made in `app/contact/page.tsx`

- **Mailto line endings (RFC 6068 compliance):** both draft bodies now join prompt lines with `\r\n` (`:26-27`) instead of `\n`, so `encodeURIComponent()` emits `%0D%0A` line breaks. This is the line-break form required by the mailto URI scheme and is more reliable across mail clients. Subject/body encoding was already correct and was kept.
- **Secondary text uses the semantic token:** all body-secondary copy now uses `text-body-secondary` (`:65`, `:69`, `:124`, `:142`, `:160`, `:198`, `:212`, `:226`, `:270`). This replaces the off-token `#5e554a`, `#56645c`, and opacity-derived `#18251f/70` and `/65` greys with the defined `#56645c` role from `app/globals.css:23-27`, which is documented as the AA-passing secondary-text colour. No palette colours were introduced.
- **Founder access wording:** "we will arrange access" became "so an admin can arrange access" (`:198-202`). The page now names the real manual step instead of implying an automatic guarantee.

No new dependencies, gradients, violet, emoji, routes, or wholesale rewrites were introduced. The phase-1 fixes (encoded mailto context, single primary email action, single FAQ path, honest response line, `100dvh`, and address wrapping) remain intact.

## Checks performed

- Read `reports/page-fixes/MANIFEST.md`, `reports/page-fixes/contact.md`, the phase-2 shared reports, `reports/page-audits/contact.md`, and the relevant `reports/page-audits/CONSOLIDATED.md` rows before editing.
- Read `AGENTS.md`, `design/brand-system.md`, `design/brand-guidelines.md`, `design/voice-guide.md`, `lib/design-tokens.ts`, and `app/globals.css`; also read the relevant Next 16 guides under `node_modules/next/dist/docs/01-app/` (`01-getting-started/03-layouts-and-pages.md`, `05-server-and-client-components.md`, `14-metadata-and-og-images.md`, `03-api-reference/02-components/link.md`).
- Read the shared `ActionLink`, `CtaBand`, `SiteHeader`, and nav source read-only to verify focus targets and the stale header finding against current code.
- Reviewed `git diff -- app/contact/page.tsx` before and after the edits. Existing user changes were preserved; only the changes listed above were added.
- `npx eslint app/contact/page.tsx` — clean, no diagnostics.
- `npx tsc --noEmit --pretty false` — clean, no diagnostics.
- No `next build`, `npm test`, dev server, or browser tooling was run, per the manifest.

## Workflow findings routed to owners

- **No new workflow findings.** `/contact` has no server actions, API routes, redirects, status contracts, or error/loading states. Nothing needs the workflow owner.
- **Stale phase-1 finding verified resolved, not re-routed.** The earlier HIGH finding at `components/marketing/site-header.tsx:29-34` / `components/marketing/nav.ts:52-55` said the header CTA still said "Create student account" on `/contact`. Current source at `components/marketing/site-header.tsx:28-39`, `:119-130`, and `:201-213` puts `/contact` in founder context and hides both desktop and mobile CTAs there. The shared design-system report already records this fix at `reports/page-fixes/shared-design-system.md:19`. No action is needed; if it regresses, it belongs to the design-system owner, not this page.

## Database findings routed to owners

- **No findings.** The page reads only `APP_CONTACT.email` from `config/app.ts`. There are no database queries, mutations, schema fields, ownership rules, or status values tied to this route. Nothing routed to the database owner.

## Deliberately not changed

- Did not add a contact form. The page intentionally says "No form to fill in and no ticket queue" (`:124-127`), and the audit does not ask for one.
- Did not add a numeric reply time. No verified SLA exists; the honest "as soon as we can" line stays.
- Did not edit shared components, `config/app.ts`, `lib/metadata.ts`, `app/globals.css`, `MANIFEST.md`, or another agent's report. They were read only for verification.
- Did not change the Wikimedia photo credits or their external links; `components/ui/photo-credit.tsx` already owns safe `target`/`rel` behaviour.
- Did not run a rendered responsive check. Starting a dev server and using browser tooling are outside this pass, so the earlier 320px/375px address-wrap fix remains source-level reasoning only.
