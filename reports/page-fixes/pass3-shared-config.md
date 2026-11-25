# Pass 3 shared config and format closeout

## Scope

These items were outside the active page and workflow agents' owned files, so
they were handled directly. No commit was made and no destructive git command
was used.

## F-16 — “Local time” contrast

`components/layout/workspace-clock.tsx` already used `text-[#657069]` for the
visible “Local time” label in the current worktree. This replaces the stale
`#8d948e` value recorded in the earlier audit.

- Measured with a small relative-luminance calculation against `#f5f2ea`.
- Result: **4.61:1**, above the WCAG 2.2 AA 4.5:1 minimum for normal text.
- No copy or accessible-name change was needed.

## Body size limit for uploads

`next.config.ts` now sets:

- `experimental.serverActions.bodySizeLimit = '6mb'`.

Reason:

- Two accepted upload paths cap individual files at 5 MB:
  `app/actions/shortlist-order.ts` and `app/actions/student-profile.ts`.
- The Next.js default Server Action body cap is 1 MB.
- The local Next.js guide at
  `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/serverActions.md`
  says the limit applies to the raw multipart request body and recommends room
  for multipart metadata.
- A 6 MB cap leaves about 1 MB for boundaries, part headers, and field data
  above a 5 MB file.

No runtime upload test was performed, so this is a source/config fix, not a
runtime pass.

## A6/F-17 — World Bank number grouping

`lib/data/world-bank.ts` now uses `en-GB` for World Bank percentage formatting
instead of `en-US`. This aligns public statistics with the `en-GB` convention
already used in the workspace tables.

The payment and admin date/currency portion of A6/F-17 remains with the payment
workflow agent. The final report must record the exact convention that agent
chose and any residual items outside its ownership.

## Verification performed here

- `npx eslint lib/data/world-bank.ts` — clean.
- `npx eslint next.config.ts` — clean.
- `npx tsc --noEmit --pretty false` was passed earlier after the sticky-heading
  component landed, but has not been rerun after the active agents' changes.

## Residual status

- No dev server or authenticated browser session was available.
- No runtime upload, contrast, or rendered number-format check was performed.
- Product-wide locale, timezone, and currency policy remains a scope-gated
  item until the project owner chooses a locale strategy and translated routes.
