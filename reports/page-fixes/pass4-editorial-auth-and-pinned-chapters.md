# Pass 4: editorial auth shell and pinned marketing chapters

## Scope

Finished the editorial redesign on the auth routes and completed the conversion
of the remaining two-column marketing sections to `PinnedScrollChapter`. No
server action, database, proxy, or API file was touched.

## Files changed

### Auth shell

- `src/features/auth/components/auth-shell.tsx`
  - Replaced the glass-card shell with a thin editorial wrapper: `SiteHeader`,
    the page's own `<main id="main-content">`, and `SiteFooter compact`.
  - The shell renders no form surface of its own any more; each page owns its
    editorial layout.
- `src/styles/auth-shell.module.css`
  - Deleted. Its canvas, image wash and glass-card rules were scoped to the old
    shell and had no consumer after the rewrite.
- `src/features/auth/components/styles.ts`
  - Reduced to `focusRing` and `authInputClassName`.
  - Removed `displayFont` and `authMotionStyles`; both were only consumed by the
    old auth surface.
  - `authInputClassName` is now squared (`rounded-[2px]`) with a flat hairline
    border, matching the editorial rule language.

### Auth pages

- `src/app/(auth)/login/page.tsx`, `signup/page.tsx`,
  `forgot-password/page.tsx`, `reset-password/page.tsx`
  - Rewritten to the shared editorial vocabulary: `Band`, `RuleLink`,
    `index-label`, one `<h1>`, hairline rules, and magenta reserved for the
    single filled action.
  - Metadata now uses the shared `pageMetadata` helper, so the auth pages get
    the same canonical and social-card treatment as the marketing pages. The
    old titles carried the brand themselves and the root template appended it a
    second time (`Reset password — Bhutan Tech Connect | Bhutan Tech Connect`);
    the titles now drop the brand suffix.
- `src/features/auth/components/login-form.tsx`, `signup-form.tsx`,
  `forgot-password-form.tsx`, `reset-password-form.tsx`
  - Visual shell only: squared fields, squared message banners, no inset glass
    shadow. Validation, focus management, `aria-describedby` wiring and the
    server-action contracts are unchanged.
  - Removed the `data-auth-message` hooks and their comments. They existed only
    for the deleted shell stylesheet.
- `src/components/ui/submit-button.tsx`
  - The submit button is now the squared magenta plate used across the site
    (`rounded-[2px]`, `min-h-12`, 13px semibold) instead of a rounded button.

### Marketing chapters

- `src/app/(marketing)/public/page.tsx`
  - "Two sides", "How it works", "Local context", "The place" and
    "Verified facts" are now `PinnedScrollChapter` sections. Each one passes
    the heading (`<h2>` plus its `id`) and the lead through `title`, and keeps
    only scrolling content in `children`.
  - Section ids: `audience`, `steps`, `context`, `place`, `trust`.
  - Added the shared `ChapterProgress` wayfinding bar with one link per
    chapter, matching the other long marketing pages.
  - All five chapters pass `pinOffset={152}` so the parked title clears the
    sticky progress bar.
- `src/app/(marketing)/how-it-works/page.tsx`
  - The brief section is a `PinnedScrollChapter` (`id="brief"`) and passes
    `pinOffset={152}` so the parked title clears the sticky `ChapterProgress`
    bar that sits below the 64px header on this page.
- `src/components/motion/pinned-scroll-chapter.tsx`
  - Added the optional `pinOffset` prop (default `96`, which clears the header).
    The pin start offset and the GSAP dependency list both use it.
  - The section now carries `scroll-mt-24`, so an in-page link to a chapter
    lands below the sticky header and progress bar instead of under them.

### Sticky chrome fix

- `src/app/(marketing)/*/page.tsx`, `src/features/auth/components/auth-shell.tsx`
  - Every `<main>` used `overflow-x-hidden`. Per CSS, `overflow-x: hidden`
    forces the other axis to `auto`, which turned `<main>` into a scroll
    container and silently broke every `position: sticky` descendant: the
    `ChapterProgress` bar scrolled away with the page instead of sticking
    under the header.
  - Changed to `overflow-x-clip`, which clips the same content without
    creating a scroll container. The bar now sticks at `top: 64px`, the
    header still sticks at `top: 0`, and no page gains a horizontal
    scrollbar (checked `scrollWidth > clientWidth` on every route).

## Checks performed

- `npx tsc --noEmit`: clean.
- `npm run lint`: clean.
- `npm test`: 23 files, 279 tests passed.
- `npm run build`: success, 22 prerendered routes plus the dynamic routes.
- Browser (Chromium, 1440x900, dev server):
  - `/public`: no duplicate ids, exactly one `<h1>`, five chapter `<h2>`s with
    matching `aria-labelledby` targets, zero console errors. Each chapter
    reports `data-pin-active="true"` with the title parked at `top: 152px`
    while the content column scrolls. The chapter bar sticks at `top: 64px`,
    the parked title clears it by 9px, and the active chapter link follows the
    section in view ("Local context" while the local-context chapter is open).
  - `/how-it-works`: the brief chapter parks at `top: 152px`, clear of the
    sticky progress bar. Zero console errors.
  - `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/about`,
    `/contact`, `/faq`, `/for-students`, `/for-founders`, `/privacy`,
    `/terms`: one `<h1>` each, no duplicate ids, zero console errors, no
    horizontal overflow.
  - `/reset-password` without the recovery cookie still redirects to
    `/forgot-password?error=session` and shows the expiry message.
  - Empty login submission: the form shows `Email is required.` and
    `Password is required.` and sends no request.
  - Empty signup submission: the form shows `First name is required.`,
    `Last name is required.`, `Email is required.` and `Password is
    required.` and sends no request.

## Notes for the next pass

- The Mesurer dev panel (`NEXT_PUBLIC_MESURER_ENABLED=1`) mounts a fixed,
  full-viewport overlay. It paints over the page in a headless capture, so a
  screenshot taken in dev shows a blank ground unless the `.mesurer-root`
  element is hidden first. The page DOM, layout and console are unaffected.
  This is a dev-tool behaviour, not an application defect.
- `ChapterProgress` is still absent from `/about` and `/contact`. Both pages
  are shorter and use a single-column editorial rhythm, so a chapter bar
  would have nothing to navigate between. `/privacy` and `/terms` carry their
  own in-page chapter list.

### Pass 5 — photo-attribution removal (included in this commit)

- `src/lib/photo-credits.ts`
  - New central attribution registry: every Wikimedia Commons photograph used
    on the site, with author, subject, licence and file page URL. All files are
    CC BY-SA 3.0 or CC BY-SA 4.0, both of which require author attribution.
- `src/components/marketing/nav.ts`
  - `PHOTO_CREDITS` now derives from `PHOTO_ATTRIBUTIONS` instead of hardcoding
    URLs.
- `src/components/ui/photo-credit.tsx`
  - Deleted. Per-image credit strips were removed from every page; attribution
    now lives on `/about#photos-heading` and one footer line.
- `src/components/marketing/editorial.tsx` — `Figure`
  - Removed `credit`, `caption`, `inverse`, `position` props and the entire
    `figcaption` credit strip. Photographs stand on their own.
- `src/components/marketing/editorial-hero.tsx` — `EditorialHero`
  - Removed `creditFileUrl` and `caption` props and the `figcaption` credit
    strip. `MarketingImage.fileUrl` is now optional.
- `src/components/editorial/editorial-image.tsx` — `EditorialImage`
  - Removed `creditFileUrl` and `caption` props and the `figcaption` credit
    strip.
- `src/components/editorial/inline-image-text.tsx` — `InlineImageText`
  - Removed `creditFileUrl` prop and the `PhotoCredit` line below the heading.
- `src/components/layout/workspace-hero.tsx` and `src/app/(app)/admin/page.tsx`
  - Removed the `PhotoCredit` credit line from the dashboard hero/admin panel.
- All marketing page call sites
  - Stripped `credit`, `caption`, `creditFileUrl` from every `Figure`,
    `EditorialHero`, `InlineImageText` and `MarketingImage` usage.
- `src/app/(marketing)/about/page.tsx`
  - Replaced the inline "credited photographs are by..." paragraph with a
    bulleted credits list rendered from `PHOTO_CREDIT_LIST`, each entry linking
    to the Commons file page and naming author, subject and licence.

