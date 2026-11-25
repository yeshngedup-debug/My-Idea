# `/for-founders` second pass — feature completeness and accessibility

Date: 2026-11-25. Scope: `app/for-founders/page.tsx` and this report only, per
`reports/page-fixes/MANIFEST.md`. The dirty worktree was treated as the source of
truth. All phase-1 edits and every other agent's uncommitted work were preserved.
No shared file, other page, other report, config, schema, action, or route was
edited. No install, Reticle wiring, dev server, build, `npm test`, or browser
tooling was used.

Skills loaded first: `better-interface`, `better-writing`.

## Features verified against current source

### CTA destinations

All destinations resolve to files that exist in the tree. No route was added.

| Location | Destination | Verdict |
| --- | --- | --- |
| `:181` hero primary "Ask for founder access" | `/contact` | Exists at `app/contact/page.tsx`; the page has a dedicated "Request founder access" mailto at `:217-219` |
| `:182` hero secondary "See how it works" | `/how-it-works` | Exists at `app/how-it-works/page.tsx` |
| `:66` access-step "Log in" | `/login` | Real `Link`; exists at `app/(auth)/login/page.tsx` |
| `:256` mid-page "Ask for founder access" | `/contact` | Same verified contact path |
| `:504` closing "Ask for founder access" | `/contact` | Same verified contact path |

No `/signup` link exists on this page. That is intentional: founder accounts are
assigned by an admin, and `/contact` is the correct entry point. Student signup
is a separate flow; adding a founder signup link would contradict
`app/faq/page.tsx:81-93` and the voice guide.

### CV-access wording

The two page-owned CV statements now match the actual authorization path, not
just the phase-1 wording:

- `app/api/cv/[id]/route.ts:79-101` allows (1) admins, (2) founders with an
  application to one of their projects, and (3) founders with a confirmed order
  **plus** a shortlist row for that student.
- `lib/neon-data.ts:963-985` requires a `public.shortlists` row for the student;
  `lib/neon-data.ts:1144-1155` requires the order to be `confirmed`.
- Page copy at `:107` and `:324-326` now says "founders whose confirmed
  shortlist includes the student", so it no longer implies that any confirmed
  order opens any CV.
- Access step 3 at `:76` now says "Browse profiles, review applicants, and
  request a shortlist." The earlier "open CVs" promise was premature for a
  founder who has neither an application nor a confirmed final shortlist; the
  detailed access rule stays in the profile section.

### Payment and shortlist sequence

- `:121-137` keeps the real order: transfer by bank or mBoB, upload a screenshot
  in the shortlists area, then admin confirmation.
- `:135` names admin confirmation, finalization, ranking, and release, and
  retains "Founders cannot confirm their own orders." This matches
  `app/actions/shortlist-order.ts:176-178` (`requireAdmin`) and the live founder
  UI at `app/founder/shortlists/shortlists-client.tsx:461-464`, which still says
  the ranked shortlist appears after the admin finalizes it.
- Package ranges and all nine features come from `config/payment.ts:10-36`.
  `:143-147`, `:151-156`, and `:160-168` read those values directly. The Q2
  sentence now preserves the proper package name "Basic" instead of lowercasing
  it into "basic".
- The "Premium Shortlist" phrase in metadata at `:34` was kept. It is consistent
  with the FAQ, terms, README, and founder workspace naming; no contradiction
  was found in this pass.

### Preview and shared fixes already landed

- `ShortlistPreview` is mounted at `:448`. The shared component now says an
  admin confirms payment, finalizes and ranks the shortlist, then releases it
  (`components/marketing/product-preview/shortlist-preview.tsx:42-45,57-60`),
  and uses `text-body-secondary` for the small labels and sample disclaimer
  (`:48,76`). No shared edit was needed here.
- Reduced-motion stacking is fixed in shared CSS:
  `app/globals.css:141-146` gates sticky on
  `(min-width: 768px) and (prefers-reduced-motion: no-preference)`, and
  `:160-165` forces `position: static; top: auto` under reduce. The page keeps
  using `StackedCards` at `:475-484` without a page-level override.

### Accessibility and layout (source review)

- One page-owned `h1`, section `h2`s with matching `aria-labelledby` ids, and
  `h3`s for package/payment steps. `SectionIntro` renders the referenced id on
  its `h2` (`components/marketing/section-intro.tsx:29-34`).
- `StackedCards` exposes an ordered list with `aria-label="Payment steps"`
  (`components/motion/stacked-cards.tsx:99-105`). The founder-access disclosure
  uses `role="group"` with `aria-label`, native buttons, `aria-expanded`, and
  `aria-controls` (`components/interactive/animated-disclosure-list.tsx:83-123`).
- The package accordion uses native `<details>/<summary>` with a 44px-minimum
  summary row and decorative caret hidden from assistive tech
  (`components/interactive/accordion.tsx:28-39`).
- `TextReveal` keeps the intact heading string for assistive tech and under
  reduced motion (`components/ui/text-reveal.tsx:60-68`).
- Decorative icons are `aria-hidden`; images have descriptive alt text; hero and
  `PhotoFeature` pass photo credit URLs. The outer wrapper uses `min-h-[100dvh]`
  at `:174`, preserving the phase-1 mobile-address-bar fix.
- No new colour, gradient, emoji, off-palette token, or structural rewrite was
  introduced.

## Fixes made in `app/for-founders/page.tsx`

1. `:76` — access step 3 changed from "Browse profiles, open CVs, and request a
   shortlist" to "Browse profiles, review applicants, and request a shortlist"
   so the page does not promise CV access before an application or a finalized
   shortlist exists.
2. `:107` — "CV links" now names founders whose confirmed shortlist includes the
   student, matching the shortlist-row check in the API/data helpers.
3. `:324-326` — the profile prose uses the same precise shortlist wording and
   keeps the short-lived-link fact.
4. `:155` — the package comparison now renders "Full Support includes everything
   in Basic" instead of lowercasing the proper package name through
   `features[0].toLowerCase()`.

Phase-1 fixes remain intact: admin-assigned access copy, the `/login` `Link`,
the `/contact` CTAs, the admin finalization payment copy, and `min-h-[100dvh]`.

## Checks performed

- Re-read the current `app/for-founders/page.tsx`, the phase-1 fix report, the
  page audit, `MANIFEST.md`, and the relevant shared workflow/design reports.
- Re-read current shared components and data sources used by the page:
  `page-hero.tsx`, `cta-band.tsx`, `section-intro.tsx`, `accordion.tsx`,
  `pinned-heading-section.tsx`, `animated-disclosure-list.tsx`,
  `stacked-cards.tsx`, `motion/index.ts`, `text-reveal.tsx`, `shortlist-preview.tsx`,
  `site-header.tsx`, `nav.ts`, `app/globals.css`, `config/payment.ts`,
  `app/api/cv/[id]/route.ts`, `app/actions/shortlist-order.ts`,
  `app/founder/shortlists/shortlists-client.tsx`, and `lib/neon-data.ts`.
- Re-read the relevant local Next.js 16 guides before editing:
  `04-linking-and-navigating.md`, `05-server-and-client-components.md`, and
  `14-metadata-and-og-images.md`. The page remains a static Server Component;
  the only navigation primitive used is the already-imported `Link`.
- Verified CTA targets exist on disk: `/login`, `/contact`, `/how-it-works`.
- `npx eslint app/for-founders/page.tsx` — clean, no findings.
- `npx tsc --noEmit --pretty false` — clean, no errors.
- Reviewed `git diff -- app/for-founders/page.tsx`. Only the owned page and this
  new report changed. No build, test suite, dev server, or browser drive was
  performed, per the manifest boundary.

## Routed finding — shared file, not edited here

1. **Admin order confirmation still reports an unlocked shortlist too early.
   (MED, workflow owner)**
   - Evidence: `app/actions/shortlist-order.ts:206-213` sets the order to
     `confirmed` and returns "Payment confirmed. Shortlist unlocked." without
     creating or ranking `shortlists` rows in that action. The live founder UI
     at `app/founder/shortlists/shortlists-client.tsx:461-464` still says the
     ranked shortlist appears once the admin finalizes it.
   - Page action: this page's copy already names the admin finalization step, so
     no further page edit is needed.
   - Owner: **workflow owner** for the action and its success message.
   - Recommended fix: change the message at `app/actions/shortlist-order.ts:213`
     to "Payment confirmed. An admin will finalize and rank the shortlist.", or
     create/rank the rows before returning the "unlocked" message. Add a
     regression check for the confirmed-but-empty state.

No new shared a11y finding is routed: the preview contrast/copy and reduced-motion
sticky-card issues from phase 1 are already fixed in shared files and were
verified in current source.

## Deliberately not changed

- No `/signup` link or route: founder access is admin-assigned and `/contact` is
  the correct destination.
- No metadata rewrite: "Premium Shortlist" is used consistently elsewhere and
  was not contradicted by current source.
- No new dependencies, routes, shared components, DB/schema, actions, API
  routes, or config values.
- The repeated three-column payment prose-row treatment was left alone. It is a
  carried LOW design note outside this pass's small-diff boundary; the three
  real steps and their order are preserved.
- Shared files were read only, even where fixes were confirmed as already
  landed.
- Header CTA, OG image, agreement-template copy, photo credits, and component
  relevance were verified earlier and remain unchanged.
