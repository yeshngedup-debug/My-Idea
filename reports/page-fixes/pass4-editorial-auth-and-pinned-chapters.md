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
- `SiteFooter` - Holds photo attribution for non-auth pages
- `Band` - Now carries `.scroll-mt-chapter` utility class

### CSS/Globals
- `globals.css` - Added `--chapter-bar-height` CSS variable, `.scroll-mt-chapter` utility
- Anchor-offset system: `scroll-padding-top: 4rem` + `scroll-margin-top: calc(1rem + var(--chapter-bar-height, 0px))`

### Photo Credits Removal
- Per-image photo credit strips removed from all pages
- `src/components/ui/photo-credit.tsx` deleted
- Attribution now lives in `src/lib/photo-credits.ts` and rendered in site footer

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