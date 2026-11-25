# Pass 3 — F-07 partial live-data warning (shared live panel)

## Changed files

- `components/data/live-context.tsx`
  - Adds `PartialDataNote` at `:241-280`.
  - Renders it in `FullPanel` at `:403-405` and `CompactPanel` at `:473-475`.
- `components/data/live-context.test.tsx` (new)
  - Focused Testing Library coverage for full, compact, healthy, and refreshed-partial states.
- `reports/page-fixes/pass3-international-f07.md` (new)
  - This report.

No other files were edited. No dependencies were added. The worktree was already dirty; the pre-existing changes in this file (rAF clock seeding, `min-h-11` controls, in-page `#why-two-numbers` link) were preserved and are not part of this fix.

## Exact behaviour

- The warning renders only when `data.partial === true`. In the `LiveContextResult` union only an `ok: true` payload can be partial (`lib/data/world-bank.ts:61-88,434-446`), so an `ok: false` result keeps the existing `UnavailableNote` and does not show the partial note.
- It is a quiet `role="status"` region with `aria-live="polite"` and `aria-atomic="true"`. It is not a modal, not `role="alert"`, and does not block interaction.
- It is placed after the existing metadata/`UnavailableNote` and immediately before the indicator list in both panel variants, so available figures remain visible at the same position.
- Copy is derived only from fields the server supplies:
  - `This check is incomplete.`
  - `Not included in this check: {missing.join(", ")}.` — rendered only when `missing.length > 0`; `missing` holds indicator names from `missingIndicators()` (`lib/data/world-bank.ts:161-166`).
  - `Source reports: {unique errors joined with a space}` — rendered only when `errors.length > 0`; duplicate source messages are collapsed.
  - `Figures that are available are still shown below.`
- No recovery time, retry promise, cache explanation, or "stale" claim is added. The note does not change `unavailable`, `notice`, `paused`, the refresh handler, the 10-minute poll, or the hourly-server-refresh copy.
- Styling uses existing tokens only: `mt-6 rounded-lg border border-[#18251f]/15 bg-[#f5f2ea] px-4 py-3 text-sm leading-6 text-[#17352b]`, `text-body-secondary`, and `font-semibold`. No new animation or CSS file. The neutral paper surface and hairline border keep it quieter than the red `UnavailableNote`.
- `RefreshControls`, `CheckedLabel`, `SourceList`, `IndicatorItem`, `WhyTwoNumbers`, the empty-state copy, and both full/compact layouts are unchanged.

## Verification

Commands run in the repo root (Windows PowerShell):

| Command | Result |
| --- | --- |
| `npx vitest run components/data/live-context.test.tsx` | 1 file passed, 4 tests passed (final run 2026-11-25 02:28:47). |
| `npx eslint components/data/live-context.tsx components/data/live-context.test.tsx` | No findings. |
| `npx prettier --check components/data/live-context.test.tsx` | Clean. |
| `npx prettier components/data/live-context.tsx` compared with the working file | No differences in the new `PartialDataNote` block or either render insertion; see routed R3 for pre-existing drift elsewhere. |
| Read `AGENTS.md` and installed Next 16 guides | Read before editing: server/client components, fetching data, client-side data fetching, and the Vitest guide in `node_modules/next/dist/docs/`. |

Test coverage added:

1. Full panel with `partial: true` exposes a polite, atomic status naming the missing indicator and the distinct source message, keeps the figure and both controls, and does not show the unavailable note.
2. Compact panel with `partial: true` shows the same notice and keeps its figure and controls.
3. A complete payload stays quiet.
4. A refresh from a complete payload to a partial payload reveals the notice, keeps the figure, does not show the unavailable note, and still calls `/api/context-data` with `{ cache: "no-store" }`.

Not run by scope: the full test suite, `npm run build`, dependency installation, and a dev server. No real screen-reader or cross-browser runtime pass was performed; a11y was implemented with semantic live-region attributes and checked in jsdom.

## Routed findings (not changed here)

- **R1 — MED — pause control can be hidden while polling continues.** `app/public/page.tsx:301` opens the `<details>` by default and the compact panel mounts the only pause control inside it (`components/data/live-context.tsx:459-470` in the current file). Collapsing the disclosure hides the control while the 10-minute poll continues. Owner: page/design-system. Already recorded in `reports/page-fixes/pass2-home.md:124-131`; no page file was edited.
- **R2 — LOW — public `/api/context-data` has no explicit rate limit or request coalescer.** `app/api/context-data/route.ts:13-22` relies on hourly revalidation; direct cache-busting calls can still amplify upstream fetches. Owner: workflow/API. Cross-reference `reports/page-fixes/shared-workflow.md:155-166`.
- **R3 — LOW — pre-existing Prettier drift in `components/data/live-context.tsx`.** `npx prettier --check` on that file reports differences in untouched ranges: the `@/data/landing` import, `CheckedLabel`, `IndicatorItem`'s `dd`, the `why-two-numbers` div, `FullPanel`'s `youth` lookup and `IndicatorItem` call, the compact `RefreshControls` indentation, the compact `IndicatorItem` call, and the `LiveContext` signature. Several come from the dirty user work. Prettier was not run with `--write` on this file to avoid rewriting work outside this fix's scope. Owner: design-system, after the dirty work is settled.
- **R4 — INFO — data contract semantics.** `lib/data/world-bank.ts:436` defines `partial` as `errors.length > 0 || missing.length > 0`. The UI consumes those arrays verbatim; changing what "partial" means belongs to the data owner, not this component.
- **R5 — LOW — closed disclosure rows can reference an unmounted panel.** `components/interactive/animated-disclosure-list.tsx:99-104,124-129`. Already recorded in `reports/page-fixes/pass2-home.md:132-138`; cross-referenced only, not re-fixed here.
