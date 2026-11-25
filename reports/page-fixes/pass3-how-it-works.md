# Pass 3 — /how-it-works sticky section headings

## Changed files

- None. `app/how-it-works/page.tsx` was intentionally left unchanged.
- This report: `reports/page-fixes/pass3-how-it-works.md`.

## Sticky sections wired

- None. No `StickySectionHeadings` wrapper, local `sections` array, `data-sticky-section` markers, or manual sticky CSS was added.

## Checks performed

- Read `AGENTS.md` and the App Router guide `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md` before evaluating the change.
- Read `design/brand-system.md`, `design/brand-guidelines.md`, `design/voice-guide.md`, the target page, the shared sticky component and its CSS module, plus the existing chapter progress and pinned chapter components.
- Ran `npx eslint app/how-it-works/page.tsx`; no ESLint findings.

## Issues routed to shared owners

- None. No defect in the shared component was observed; this page is not a suitable consumer for it without a broader page/chrome decision.

## Skipped rationale

The page already has a deliberate pinned-scroll wayfinding system:

- `ChapterProgress` renders a single "On this page" nav with the same five real section ids. `StickySectionHeadings` would add a second, sticky nav with different active-section logic, so the two could show competing active states while covering the same anchors.
- `PinnedScrollChapter` pins its desktop title column at `top+=96`. The site header is `h-16` (`64px`) and the shared sticky bar is `top-16 z-30`, so the bar would occupy the same band as the pinned title and cover it.
- The final chapter already uses `lg:sticky lg:top-24` for its title column, which would be overlapped by the same sticky bar.

Removing or reworking those existing systems is outside this pass: the task says to preserve existing content and forbids editing shared components, CSS, or layout files. Adding the component on top would create conflicting sticky and scroll experiences rather than the intended quiet section index, so the correct outcome here is to skip the page.
