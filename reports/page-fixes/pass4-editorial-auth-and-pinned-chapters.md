# Pass 4: Editorial Redesign + Auth Shell + Pinned Chapters

## Summary
Complete visual and functional overhaul of all marketing pages and authentication pages, including:
- New editorial design language with brand palette
- Auth shell redesigned with thin wrapper and shared header/footer
- `PinnedScrollChapter` component for two-column pinned sections
- `ChapterProgress` for in-page navigation on long marketing pages
- Anchor-offset system for smooth in-page linking

## Changes

### Marketing Pages (7 files)
- `/public` - Homepage with `PinnedScrollChapter` sections and `ChapterProgress` bar
- `/about` - Editorial redesign, photo credits removed
- `/contact` - Editorial redesign
- `/faq` - Editorial redesign with collapsible Q&A
- `/for-founders` - Editorial redesign
- `/for-students` - Editorial redesign
- `/how-it-works` - Editorial redesign with `PinnedScrollChapter` for the "Brief" section

### Auth Pages (4 files)
- `/login` - New thin `AuthShell` wrapper, shared `SiteHeader`/`SiteFooter`
- `/signup` - Same auth shell pattern
- `/forgot-password` - Same pattern
- `/reset-password` - Same pattern

### Components Added/Modified
- `PinnedScrollChapter` - New component for two-column layouts with pinned titles
- `ChapterProgress` - Sticky chapter navigation bar (desktop), measures its own height for anchor offsets
- `SiteHeader` - Now used by both marketing and auth pages
- `SiteFooter` - Holds no photo attribution; see Pass 8 for the removal
- `Band` - Now carries `.scroll-mt-chapter` utility class

### CSS/Globals
- `globals.css` - Added `--chapter-bar-height` CSS variable, `.scroll-mt-chapter` utility
- Anchor-offset system: `scroll-padding-top: 4rem` + `scroll-margin-top: calc(1rem + var(--chapter-bar-height, 0px))`

### Photo Credits Removal
- Per-image photo credit strips removed from all pages
- `src/components/ui/photo-credit.tsx` deleted
- Attribution now lives in `src/lib/photo-credits.ts` as an unrendered source record

---

# Pass 5: Photo Credits Removal & Anchor Fix

## Summary
Completed photo credit removal across all pages and fixed stale `#photography` anchor comments.

## Changes

### Files Modified
- `src/components/marketing/nav.ts` - Removed `PHOTO_CREDITS` export and dead `PHOTO_ATTRIBUTIONS` import (cleaned)
- `src/lib/photo-credits.ts` - Updated docs, fixed subject description
- `src/app/(app)/admin/page.tsx` - Fixed stale anchor comment: `#photography` → footer attribution
- `src/components/layout/workspace-hero.tsx` - Fixed stale anchor comment
- `src/components/marketing/editorial.tsx` - Fixed stale anchor comment
- `src/components/marketing/site-footer.tsx` - Added `PHOTO_CREDIT_LIST` import and render with live links

### Footer Attribution
- Site footer now renders linked attribution for each photo via `PHOTO_CREDIT_LIST`
- Each attribution links to both the Commons file and the licence

---

# Pass 6: Unslop Polish

## Summary
Tightened vertical rhythm, reduced dead space, and verified anchor-offset behavior. All tests pass.

## Changes

### Files Modified
- `src/components/marketing/nav.ts` - Removed `PHOTO_CREDITS` export and dead `PHOTO_ATTRIBUTIONS` import
- `src/lib/photo-credits.ts` - Updated docs, fixed subject description
- `src/app/(app)/admin/page.tsx` - Fixed stale anchor comment
- `src/components/layout/workspace-hero.tsx` - Fixed stale anchor comment
- `src/components/marketing/editorial.tsx` - Fixed stale anchor comment

### Footer Attribution
- Site footer now renders linked attribution for each photo via `PHOTO_CREDIT_LIST`
- Each attribution links to both the Commons file and the licence

---

# Pass 6: Unslop Polish (In Progress)

## Summary
Tightened vertical rhythm, reduced dead space, and verified anchor-offset behavior.

## Spacing Changes Applied
| Component | Before | After | Files Affected |
|---|---|---|---|
| Main section padding | `py-20 md:py-28` | `py-16 md:py-24` | public, about, contact, faq, for-founders, for-students, how-it-works |
| Smaller section padding | `py-7 sm:py-8` | `py-6 sm:py-7` | auth pages |
| Margin-top | `mt-14` | `mt-12` | various |
| Margin-top | `mt-16` | `mt-14` | various |
| Auth page padding | `py-14 md:py-20` | `py-12 md:py-16` | login, signup, forgot-password, reset-password |

## Anchor-Offset Verification
Testing at 1440×900 and 390×844 viewport sizes.

All chapter links land below:
- Sticky site header (64px)
- Sticky `ChapterProgress` bar (79-131px, wraps to 2 rows on mobile)

### Test Results
| Page | Chapter | CSS Variable | Bar Height | Heading Top | Clears Bar? |
|---|---|---|---|---|---|
| /public | context | 79px | 79px | 346px | ✅ |
| /public | place | 79px | 79px | 330px | ✅ |
| /faq | profiles-and-projects | 79px | 79px | 292px | ✅ |
| /for-students | rooted | 79px | 79px | 255px | ✅ |
| /how-it-works | brief | 131px | 131px | 346px | ✅ |
| /how-it-works | place | 131px | 131px | 305px | ✅ |

### ScrollTrigger ID Fix
Changed from duplicated literal `"pinned-chapter-title"` to unique `pinned-title-${id}` to prevent scroll jump conflicts.

## Remaining Tasks
- [ ] Generate updated screenshots with real scroll-through (not full-page auto-scroll) - **Deferred**: MarketingReveal `whileInView` opacity behavior produces capture artifacts in full-page screenshots. The `PHOTO_CREDIT_LIST` footer attribution renders correctly.

## Post-Commit Cleanup
- `npm run build` green (22 static routes)
- `npm test` green (279/279 tests)
- `npm run lint` clean
- `npx tsc --noEmit` clean
- Pushed to `origin/main`: `72655fe`

## Verification Commands
```bash
npx tsc --noEmit    # ✅ 0 errors
npm run lint        # ✅ 0 errors  
npm test            # ✅ 279/279 tests pass
npm run build       # ✅ 22 static routes generated
```

---

# Pass 7: Pinned Chapter Overlap Fix

## Symptom
Every `PinnedScrollChapter` heading stayed parked at `top: 152px` after its own
section had scrolled away, so the title painted over the section below it.

## Measurement (Playwright, 1440×900, `/public#audience`)

| Scroll Y | Position | Title top | Section bottom | Next section top | Overlap |
|---|---|---|---|---|---|
| 1100 | fixed | 152 | 726 | 726 | 0 |
| 1300 | fixed | 152 | 526 | 526 | 7 |
| 1400 | fixed | 152 | 426 | 426 | **107** |
| 1600 | fixed | 152 | 226 | 226 | **307** |
| 1800 | static | -330 | 26 | 26 | 24 |

The pin length came from `contentEl.offsetHeight - titleEl.offsetHeight + 120`,
a value measured once at load and never re-derived correctly. `pinSpacing:
false` meant nothing reserved the pinned space, so GSAP kept the title
`position: fixed` well past the section's box.

## Fix
`PinnedScrollChapter` no longer uses GSAP at all. The title column is plain CSS
`position: sticky`, gated to `motion-safe:lg:` so mobile and reduced-motion
readers keep the stacked layout:

```tsx
<div
  data-pinned-title=""
  style={{ top: pinOffset }}
  className="self-start motion-safe:lg:sticky lg:border-t lg:border-[#66bfbf]/15 lg:pt-6 lg:pr-6"
>
```

Sticky is bounded by the title's own grid area, so the title can never outlive
the chapter. The `pinOffset` contract is unchanged (152 on pages with the
sticky `ChapterProgress` bar, 96 default). The `data-pin-progress` /
`data-pin-active` attributes were dropped; nothing consumed them.

## Verification

| Page | Chapter | Max overlap with next section | Parks at 152? |
|---|---|---|---|
| /public | audience | 0px | ✅ |
| /public | steps | 0px | ✅ |
| /public | context | 0px | ✅ |
| /public | place | 0px | ✅ |
| /public | trust | 0px | ✅ |
| /how-it-works | brief | 0px | ✅ |

Also verified:
- In-page chapter links on `/public` land every heading 171–188px below the
  sticky bar.
- 390×844: title column computes `position: static` (stacked layout).
- `prefers-reduced-motion: reduce` at 1440: `position: static`.
- Screenshots at the two previously failing scroll positions are clean:
  `reports/artifacts/pinned-fix/after-1400.png`, `after-1600.png`,
  `hiw-2450.png`.

## Gates
- `npx tsc --noEmit` ✅
- `npm run lint` ✅
- `npm test` ✅ 279/279
- `npm run build` ✅ 22 routes

---

# Pass 8: Footer Attribution Removed

## Change
The Wikimedia/CC BY-SA credit paragraph was removed from `SiteFooter`, along
with its `PHOTO_CREDIT_LIST` import. The footer now ends on the © row, which
gained `pb-10` so the previous bottom spacing is preserved.

`src/lib/photo-credits.ts` is kept as the project's attribution record (author,
Commons file, licence per image) but is no longer rendered anywhere; its header
comment says so.

## Verification (Playwright, 1440×900)
Checked `/public`, `/about`, `/how-it-works`, `/contact`, `/login`:

| Check | Result |
|---|---|
| Credit text present in footer | false on all pages |
| `commons.wikimedia.org` / `creativecommons.org` links in footer | 0 on all pages |
| Marketing footer height | 702px (was 780px) |
| Compact auth footer | unchanged, 379px |

Screenshot: `reports/artifacts/pinned-fix/footer-public-1440.png`.

## Gates
- `npx tsc --noEmit` ✅
- `npm run lint` ✅
- `npm test` ✅ 279/279
- `npm run build` ✅ 22 routes

---

# Pass 9: Equal Image Grids + Relevant CC0 Thimphu Photography

## Request
"Add more images — these images aren't relevant with this website", with the
earlier constraint: images in the same grid must be the same size; do not force
one ratio across the whole site.

## Decision
Use one active set of six photographs, all about Bhutanese people, work and
Thimphu:

- `bhutanese-students.jpg`
- `thimphu-city.jpg`
- `thimphu-street.jpg`
- `thimphu-hills.jpg`
- `thimphu-bank.jpg`
- `thimphu-housing.jpg`

Retired from page/background references: `bhutanese-team.jpg` (national-dress
performance), `bhutanese-community.jpg` (stone wall), and the older tourism
files (`bhutan-archery.jpg`, `prayer-flags.jpg`, `kira-textile.jpg`,
`founder-briefing.jpg`, `students-collaborating.jpg`, `team-project-work.jpg`).
The unused files remain on disk under `public/images/`.

## New CC0 photographs
Downloaded from Wikimedia Commons via Openverse (`license=cc0,pdm`), cropped and
normalised locally:

| File | Source | Author | Local size |
|---|---|---|---|
| `thimphu-street.jpg` | [A Main Road in Thimphu](https://commons.wikimedia.org/wiki/File:A_Main_Road_in_Thimphu.jpg) | Veera.sj | 1800×1350 |
| `thimphu-hills.jpg` | [Main Road with Hill in the backdrop](https://commons.wikimedia.org/wiki/File:Main_Road_with_Hill_in_the_backdrop.jpg) | Veera.sj | 1800×1350 |
| `thimphu-bank.jpg` | [Bhutan Post office & Bhutan Bank building](https://commons.wikimedia.org/wiki/File:%27Bhutan_Post_office_%26_Bhutan_Bank%27_building..JPG) | Rudolph.A.furtado | 1600×1090 |
| `thimphu-housing.jpg` | [Common public housing in Thimphu](https://commons.wikimedia.org/wiki/File:Common_public_housing_in_Thimphu..JPG) | Rudolph.A.furtado | 1600×810 |

`thimphu-bank.jpg` was cropped to remove an embedded date stamp;
`thimphu-housing.jpg` was cropped to remove unrelated shopfront signage.

`src/lib/photo-credits.ts` records author, Commons file and licence for the six
active images. It is still an unrendered source record; no credit strip or
footer attribution was reintroduced.

## Page rewiring
| Page | Images now used |
|---|---|
| `/public` | students hero paths; students + housing context pair; four-photo Thimphu gallery; city hero plate |
| `/about` | students hero; city wide plate; street inline pill; students bridge figure; hills + bank + housing 3-up band |
| `/contact` | city hero; street reach plate; students inline pill; hills wide plate |
| `/for-students` | students hero; housing inline pill; city wide plate; bank pay figure |
| `/faq` | hills hero; students inline pill; city wide plate |
| `/for-founders` | bank hero; students inline pill |
| `/how-it-works` | students hero; city place figure |
| `/admin` | city login/background plate |

All multi-image grids keep one crop inside that grid:
`/public` paths `aspect-[5/4]`, `/public` context and gallery `aspect-[4/3]`,
`/about` photo band `aspect-[4/3]`. Single plates keep their existing ratio.

## Playwright verification
Checked at 1440×900 and 390×844. Every grid's images render at identical
CSS pixel width and height:

| Viewport | Grid | Images | Rendered size |
|---|---|---:|---|
| 1440×900 | `/public` paths | 2 | 370×296 each |
| 1440×900 | `/public` context | 2 | 362×271 each |
| 1440×900 | `/public` place gallery | 4 | 362×271 each |
| 1440×900 | `/about` photo band | 3 | 432×324 each |
| 390×844 | `/public` paths | 2 | 335×268 each |
| 390×844 | `/public` context | 2 | 160×120 each |
| 390×844 | `/public` place gallery | 4 | 335×251 each |
| 390×844 | `/about` photo band | 3 | 335×251 each |

Also checked across `/public`, `/about`, `/contact`, `/for-students`, `/faq`,
`/for-founders` and `/how-it-works` at both viewports:

| Check | Result |
|---|---|
| Retired source references in rendered `<img>` elements | 0 |
| Tourism source references in rendered `<img>` elements | 0 |
| Sources outside the six-image active set | 0 |
| Images failing `decode()` after load | 0 |

Screenshots: `reports/artifacts/image-pass/{1440,390}-{public-paths,public-context,public-gallery,about-photos,contact-reach,students-pay,faq-hero,founders-hero,hiw-place}.png` (18 files).

## Gates
- `npx tsc --noEmit` ✅
- `npm run lint` ✅
- `npm test` ✅ 279/279
- `npm run build` ✅ 22 static/route entries generated

---

# Pass 10: Final Refinement, Dev Inspector Removal, and Verification

## Scope
This pass completes the work left after the image commit `278de8d`. It is a
consolidation and verification pass: shared behaviour is centralised, repeated
copy is removed, accessibility contracts are made explicit, and the unused dev
inspector is deleted from the project.

## Navigation and CTAs
- `resolvePrimaryCta` in `src/components/marketing/nav.ts` is the single
  audience/intent resolver used by the header, footer, heroes and closing CTAs.
- `isInternalHref` distinguishes `#...` and `/...` anchors from `mailto:` and
  external URLs. Internal anchors use `ArrowRight`; only external links use
  `ArrowUpRight`.
- Locked labels remain exact: “Create student account”, “Log in”, “See how it
  works”, “Ask for founder access”, “Make your next move”.
- `FOUNDER_ACCESS` is shared rather than duplicated. Header and footer use
  `isActivePath` for the active marker.
- The mobile header traps focus, marks the page inert and locks body scroll
  while open; Escape closes it and returns focus to the trigger.
- Root layout uses `%s | Bhutan Tech Connect`; no page title repeats the brand.

## Auth and Shared UI
- Repeated auth help is rendered once by `AuthHelpBand`.
- `FieldError` and `StatusMessage` are shared across login, signup,
  forgot-password and reset-password. Each form has one focusable status
  region; errors use `role="alert"` / `aria-live="assertive"`, other statuses
  use `role="status"` / `aria-live="polite"`.
- Dashboards use one shared `EmptyState`. Error states use `retry()` and the
  global error page no longer promises a home link that may not exist.
- `StatusTimeline` copy no longer invents status beyond the stored application
  state. Founder navigation label is “My projects”.

## Password and Email Boundary
- Shared auth constants remain authoritative. Signup password length is
  6–128 on client and server; `isValidPassword` still backs reset-password
  validation.
- `signup()` now validates the whole `signupSchema` with `safeParse` before
  calling Neon Auth.
- Client signup also checks `MAX_EMAIL_LENGTH` (254 characters).
- Two regression tests cover malformed and oversized emails; both assert that
  Neon Auth is never called.

## Keyboard and Selection
- `SegmentedControl` implements arrow/Home/End selection that follows focus,
  with `aria-pressed` buttons in a labelled `role="group"`.
- The post-project work-mode picker is a local `role="radiogroup"` with real
  `role="radio"` buttons; `SegmentedControl` remains authoritative elsewhere.

## Preserved Design Contracts
- Palette remains `#66bfbf`, `#eaf6f6`, `#ffffff`, `#ff0063`, dark teal
  `#0b5c5c` / `#0b2e2e` and deep accent `#c2004b`; Geist remains the font.
- `.scroll-mt-chapter` and `--chapter-bar-height` remain in place. Measured
  sticky heights are 79px desktop and 131px mobile; the header is 64px.
- Public-page steps stay unnumbered so chapter numbering remains `01 → 06`.
- `src/lib/photo-credits.ts` and `PHOTO_CREDIT_LIST` remain unrendered. No
  credit text or attribution links appear on any page.
- No invented metrics, names or quotes were introduced. World Bank indicator
  `SL.UEM.1524.ZS` remains live.

## Dev Inspector Removal
The development-only visual inspector is fully removed from active code and
project configuration:

| Surface | Removal |
|---|---|
| Runtime | Inspector import/render deleted from `src/app/layout.tsx` |
| Component | Dedicated dev panel component deleted |
| Feature flag | Inspector flag removed from env schema and feature flags |
| Config | Inspector flag removed from `.env.example`, `Dockerfile`, `docker-compose.yml`, `playwright.config.ts` |
| Docs | Inspector documentation removed from `README.md` and `reports/page-audits/terms.md` |
| Dependencies | Inspector package and its two lockfile entries removed with `npm uninstall` |

A tracked-file grep finds no remaining reference to the removed package or its
flag. Stale strings in gitignored `.reticle`, `test-results` and `.next`
artifacts are not part of the commit. The unrelated untracked
`llm-explainer.html` stays excluded.

## Screenshots
Final refinement captures are in `reports/artifacts/pass4-refinement/`:

- `desktop-public-hero.png`
- `desktop-public-chapter.png`
- `desktop-faq-open.png`
- `desktop-founders-cta.png`
- `mobile-public-menu.png`
- `mobile-public-chapter.png`
- `mobile-faq-open.png`

`impeccable.json` and `impeccable-stderr.txt` are also stored there. The stderr
file contains only npm's one-time `impeccable@4.11.1` install notice.

## Final Verification and Gates
The corrected browser pass completed 23/23 checks with `pageErrors: []` and
`checkErrors: []`. The source of truth is the local, gitignored artifact
`reports/artifacts/pass4-refinement/final-browser-checks.json`.

- Desktop and mobile `/public`: 9 images each, with no failed decode, no
  missing `alt`, and no credit text. All five in-page chapter anchors landed at
  or below the sticky header/ChapterProgress obstacle (0–16px clearance). The
  FAQ has 11 disclosures and the first opens from closed on both viewports.
- Mobile menu: opens with `aria-expanded="true"`, body scroll locked and the
  page marked inert; Escape restores `aria-expanded="false"` and returns focus
  to the trigger.
- Additional image audits on `/about`, `/contact`, `/for-students`,
  `/for-founders` and `/how-it-works` found no failed decode, no missing `alt`
  and no credit text. Decorative images with an intentionally empty `alt` are
  the only empty-alt entries.
- Logins landed correctly for student, admin and founder. Student projects,
  student applications, admin projects and admin payments segmented controls
  matched their expected labels, and ArrowRight/Home/End moved focus and
  selection together in every case.
- Empty states rendered in student projects (no-match search), admin projects
  (Completed filter) and admin payments (Rejected filter), each with a working
  “Show all” action. The founder post-project work-mode control passed as a
  real `radiogroup` with ArrowRight/Home/End selection following focus.
- `npx tsc --noEmit` ✅
- `npm run lint` ✅
- `npm test` ✅ 23 files / 281 tests
- `npm run build` ✅ compiled successfully and generated 22 static/route entries
- `git diff --check` ✅ clean apart from normal LF/CRLF warnings
- Tracked-file grep for the removed inspector name and flag: no matches.