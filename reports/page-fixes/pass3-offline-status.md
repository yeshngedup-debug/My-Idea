# Pass 3 — Global connectivity notice and English-only metadata note (A8 + A10)

## Changed files

- `app/layout.tsx`
  - Imports and mounts `<OfflineStatus />` once in the root body.
  - Adds a short A10 comment beside `alternates` and `openGraph.locale` documenting the English-only decision.
- `components/network/offline-status.tsx` (new)
  - Small client component for global connectivity status.
- `components/network/offline-status.module.css` (new)
  - Quiet fixed-position styling built from existing colour, radius, duration and easing tokens.
- `components/network/offline-status.test.tsx` (new)
  - Focused Testing Library coverage for initial state and offline/online transitions.
- `reports/page-fixes/pass3-offline-status.md` (new)
  - This report.

No other files were edited. No dependencies were added.

## A8 — Behaviour

`OfflineStatus` is a client component mounted once in the root layout. It:

- listens for `window` `online` and `offline` events;
- reads `navigator.onLine` after mount to catch a browser that is already offline;
- renders a small, non-modal `role="status"` message with `aria-live="polite"` and `aria-atomic="true"`;
- says only that the browser appears offline and that a failed submission should be retried when back online;
- briefly shows “You're back online.” after reconnect, then clears the notice after 2.5 seconds;
- stays quiet on a normal online start;
- sits fixed at the bottom edge with `pointer-events: none`, below the `h-16` header and away from sticky page headings;
- uses warm-paper surface, forest text, a vermilion status marker, a one-pixel hairline border, and `250ms var(--ease-out)` motion;
- drops animation/transition under `prefers-reduced-motion: reduce`.

The notice makes no claim about queued mutations or offline persistence.

## A10 — Metadata decision

`app/layout.tsx` now documents the current contract in a code comment next to `alternates` and `openGraph.locale`:

- the site is intentionally English-only for now;
- `lang="en" dir="ltr"` and `og:locale: "en_BT"` are deliberate;
- no fake localized routes or invented `hreflang` alternates are added;
- when translated routes ship, they must add `alternates.languages` / `hreflang` metadata and a locale switcher.

## Tests and checks

- Ran `npx vitest run components/network/offline-status.test.tsx`: 1 file passed, 3 tests passed.
- Ran `npx eslint app/layout.tsx components/network/offline-status.tsx components/network/offline-status.test.tsx`: no findings.
- Ran `npx prettier --check` across the five changed files: clean.
- Read the relevant Next.js 16 App Router guides before editing: server/client components, `use client`, layouts, metadata, offline support, `useOffline`, and internationalization.
- Did not run the full test suite, production build, or a dev server, per task scope.

Test coverage includes:

1. remains silent when `navigator.onLine` is initially `true`;
2. announces an offline browser found on mount;
3. transitions offline → back online on window events and clears the reconnect status after the timeout.

## Remaining limitations

- There is no service worker, so full offline page loads are not supported.
- Failed mutations are not queued or retried automatically; the notice only reports connectivity and advises retrying a failed submission.
- Form input preservation on failed submissions is not part of this pass.
- A11y was implemented with semantic status/live-region attributes and reduced-motion CSS, but no real screen-reader or cross-browser runtime pass was performed here.
- Localization remains out of scope: no translated routes, languages map, `hreflang` entries, or locale switcher were added.
