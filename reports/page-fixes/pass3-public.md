# Pass 3: `/public` sticky section headings

## Changed files

- None. `app/public/page.tsx` was intentionally left unchanged.
- This report: `reports/page-fixes/pass3-public.md`.

No shared component, CSS file, token file, layout, action, database file, or test file was edited. The pre-existing uncommitted changes in `app/public/page.tsx` were preserved. No checkout, reset, stash, clean, or commit was run.

## Sticky sections wired

- None. No `StickySectionHeadings` wrapper, local `sections` array, `data-sticky-section` marker, or manual sticky CSS was added.
- Existing ids remain as-is: `home`, `home-heading`, `how-it-works`, `journey-heading`, `bhutan`, `bhutan-heading`, and `why-two-numbers`. No duplicate id was introduced.

## Checks performed

- Read the Next.js 16 guides before evaluating the change: `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`, `03-layouts-and-pages.md`, and `03-api-reference/01-directives/use-client.md`. No Next.js API was changed, so no client boundary was added.
- Read `design/brand-system.md`, `design/brand-guidelines.md`, `design/voice-guide.md`, `lib/design-tokens.ts`, and `app/globals.css` for the surface, hairline, focus, motion, and copy contracts.
- Read `app/public/page.tsx`, `components/layout/sticky-section-headings.tsx`, `components/layout/sticky-section-headings.module.css`, `components/layout/pinned-heading-section.tsx`, and the pass-2 and pass-3 reports for the same surface.
- Ran `npx eslint app/public/page.tsx`; no findings, exit 0.
- Checked `git status --short -- app/public/page.tsx reports/page-fixes/pass3-public.md` before writing this report. Only the pre-existing modification to `app/public/page.tsx` was present.
- Not run by design: `npm test`, `npm run build`, full `tsc`, dev server, and browser tooling.

## Issues routed to shared owners

- None. No defect in `StickySectionHeadings` or its stylesheet was observed. The blocker below is a page-level chrome decision, not a shared-component bug, and it cannot be resolved without editing shared sticky primitives or removing an existing page behavior.

## Skipped rationale

The page is long enough for the component, but the editorial spine cannot take the wrapper without colliding with an existing pinned primitive.

- `app/public/page.tsx:217-294` uses `PinnedHeadingSection` for the national context chapter. `components/layout/pinned-heading-section.tsx:22` pins its heading column at `lg:top-24`, which is 96px from the viewport top.
- `components/layout/sticky-section-headings.tsx:127` pins its bar at `top-16 z-30`. The bar is roughly 64px to 130px tall once its padding and nav targets are included. On desktop it occupies the same band as the pinned chapter heading and, because it has `z-30`, it would paint over the white-on-forest `bhutan-heading`.
- The shared stylesheet adds `scroll-margin-top: 10.5rem` and `9.5rem` to marked targets (`sticky-section-headings.module.css:6-13`). That changes anchor landing for every marked heading, while the pinned chapter already relies on its own offset.
- A wrapper that covers the real sequence `home`, `how-it-works`, `bhutan`, and `why-two-numbers` must include the pinned chapter, so the overlap is unavoidable. Marking `bhutan-heading` with `data-sticky-section` does not resolve the stacking conflict.
- Narrower wrappers are not a clean fit. Ending after `how-it-works` avoids the pinned chapter but leaves only two nav items and puts a paper sticky bar over the dark cinematic hero. Starting after the pinned chapter leaves one real page heading, `why-two-numbers`; the following local bridge and shortlist headings live in shared components and cannot be marked from this page. Splitting the page into two sticky islands would add two competing bars.
- `Official statistics` at `app/public/page.tsx:302-304` is a `<summary>`, not a heading, so it should not become a synthetic nav target.

Adding the component on top would create a second wayfinding system with competing sticky offsets rather than the intended quiet section index. Removing or reworking `PinnedHeadingSection` is outside this pass, so the correct outcome for `/public` is to skip the edit.
