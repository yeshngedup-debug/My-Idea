# `/public` pass-2 fix report

Second-pass feature-completeness review against the current source. Only
`app/public/page.tsx` and this new report were written. All existing uncommitted
work was preserved; no checkout, reset, stash, clean, install, dev server,
build, or browser tooling was used.

## Features verified

- **Structure and navigation.** One `h1` at `:83-88`, labelled chapters, and
  `main#main-content` as the skip target are intact. The native disclosure is
  open at `:301`, so the pause/refresh controls in the compact panel are
  visible on first paint. No new client boundary, action, route, or dependency
  was added; this remains a Server Component that awaits `getLiveContext()`.
- **CTAs resolve.** Hero `:92` and `:98`, bento `:199`, and closing band `:381`
  use `CTA_HREFS.signup` (`/signup` → `app/(auth)/signup/page.tsx`) and
  `CTA_HREFS.howItWorks` (`/how-it-works` → `app/how-it-works/page.tsx`). The
  in-page link from the compact panel resolves to the single `why-two-numbers`
  anchor at `:310`. External source links use `target="_blank"` with
  `rel="noopener noreferrer"`.
- **Live data and freshness.** `LiveContext` at `:305` receives the full
  `getLiveContext()` result; both union variants carry `indicators` and
  `checkedAt` (`lib/data/world-bank.ts:61-88`), so the youth lookup at `:45-47`
  is type-safe. The shared compact panel renders `CheckedLabel` with absolute
  and relative time and the source list
  (`components/data/live-context.tsx:190-224,398-454`). The design owner's
  in-page `#why-two-numbers` link is live at
  `components/data/live-context.tsx:445`; the compact variant does not render
  `WhyTwoNumbers`, so `/public` has no duplicate id.
- **Attribution.** Hero `:106` uses `PHOTO_CREDITS.valley` and bento `:148-151`
  uses `PHOTO_CREDITS.dzong`; both URLs are registered in
  `components/ui/photo-credit.tsx:7-23`, and their Commons descriptions match
  the local files used on `/about` and `/for-students`. The hero credit keeps
  its legible dark chip from phase 1.
- **Copy and schema.** The 20.6% press-release figure at `:167` and the modeled
  API youth estimate at `:318-323` remain separately attributed, with no
  platform-result claim, per `design/voice-guide.md:29-31`. Disclosure ids
  produced by `contextFactId()` are valid slugs, matching the stable
  `CONTEXT_FACTS` ids and the shared `idPart()` normalisation.
- **Next.js 16 guides read before editing:** `01-getting-started/05-server-and-client-components.md`
  and `12-images.md` in `node_modules/next/dist/docs/`.

## Fixes made in `app/public/page.tsx`

- **Hero alt corrected (`:66`).** Changed "in gho and kira working together at
  computers" to "working in groups at a training day in Thimphu". Phase 1 of
  `/for-students` verified that description against the Wikimedia Commons file
  description for `File:Bhutanese_youth.jpg`, which is the same credited source
  image. The old "at computers" detail was an unverified guess and
  misdescribed the photo to screen-reader users.
- **Honest fallback copy (`:313,346-348`).** When the youth indicator is absent
  (upstream outage or partial data), the page no longer claims to explain a
  difference between two figures when only one is shown. The heading becomes
  "About this figure", the id stays `why-two-numbers` for the shared link, and
  the copy says the API series is unavailable so no comparison can be made.
  The fully populated branch at `:318-343` is unchanged.

## Checks

- `npx eslint app/public/page.tsx` — clean, no findings (exit 0).
- `npx tsc --noEmit --pretty false` — two **pre-existing** errors outside the
  owned file: `app/student/projects/page.tsx:111` (`initialQuery` not in props)
  and `app/student/projects/projects-client.tsx:323` (missing `detailHref`).
  No error references `app/public/page.tsx`; both files are untouched by this
  pass.
- Reviewed `git diff -- app/public/page.tsx`: the three pass-2 changes sit on
  top of the existing user/phase-1 edits (Reveal swap, subhead removal, credit
  chip, `min-h-6` links, `open` details) and nothing else changed.
- Not run by design: `next build`, `npm test`, dev server, browser/Reticle.

## Routed findings (not edited — shared or upstream ownership)

- **Partial live-data outage (MED).** `lib/data/world-bank.ts:61-88,434-446`
  now returns `partial`, `missing`, and `errors`, but
  `components/data/live-context.tsx:70,94-101,230-239,360,426` still treats any
  `ok: true` as fully healthy; only `ok: false` or a failed refresh shows the
  unavailable note. Recommended: when `partial === true`, show a non-blocking
  warning naming the missing series while keeping available figures visible;
  reserve the full "unavailable" note for `ok: false`. Already routed to the
  design-system owner in `reports/page-fixes/shared-workflow.md:134-141`,
  which confirms it was not implemented there. Not duplicated at page level.
- **Closed disclosure IDREF (LOW).**
  `components/interactive/animated-disclosure-list.tsx:103,124-156` emits
  `aria-controls` while the referenced panel is unmounted when closed. The
  design owner fixed slug normalisation at `:25-31`, not panel mounting.
  Recommended: keep the panel container mounted with `hidden`/`inert` toggled,
  or omit `aria-controls` while closed (same pattern applied to the mobile
  menu in `components/marketing/site-header.tsx`).
- **Provenance of `punakha-dzong.webp` (LOW, suspected).**
  `app/public/page.tsx:244-257` has only a location figcaption; no visible
  attribution. The asset is outside the three allowed Commons files
  (`components/marketing/nav.ts:68-74`, `components/ui/photo-credit.tsx:7-23`),
  repo-wide search found no source URL or licence, and the WebP has no EXIF/XMP
  metadata. This mirrors `reports/page-audits/about.md:45` for
  `thimphu-market.webp`. Recommended: verify the source and licence, then add a
  visible credit with a new registry entry, or replace the image with one of
  the three registered Commons files. No provenance was guessed here.

## Deliberate non-changes

- Did not re-fix the phase-1 items (duplicate hero subhead, credit chip,
  `contextFactId()` helper, `open` on `<details>`) or re-add the local helper
  duplication of `CONTEXT_FACTS[].id` / shared `idPart()`; the design owner
  explicitly left that harmless for page owners.
- Did not edit shared components, shared data, other pages, the API route,
  MANIFEST.md, or phase-2 owner reports.
- Did not change the 20.6% press-release figure, the modeled API figure, or
  their source links; both are attributed and non-contradictory in current
  source.
- Did not add a page-level partial-data banner: that belongs to the shared
  live panel and is routed above, so the page does not duplicate status UI.
- No new route, dependency, gradient, emoji, or visual rewrite was introduced;
  the edits are copy and alt text only, using existing on-palette classes.
