# `/about` (about) page-fix report

## Files changed

- `app/about/page.tsx` (only owned source file)
  - Added a local `contextFactId()` helper (`app/about/page.tsx:60-70`) that
    turns each context-fact label into a whitespace-free ID. The shared
    `data/landing.ts` could not be edited, so no `id` field was added there.
  - Passed that ID to `AnimatedDisclosureList` for both `defaultValue` and each
    item `id` (`app/about/page.tsx:184,187`). The disclosure component builds
    `button.id`, `panel.id` and `aria-controls` from `item.id`
    (`components/interactive/animated-disclosure-list.tsx:77-78,90-93,117-119`);
    the labels in `data/landing.ts:39,44,49` contain spaces and an apostrophe,
    which made `aria-controls` an invalid multi-token IDREF. IDs are now one
    valid token per row. Closes audit U1 (MED).
  - Included the already-supplied `imageAlt` in the `accessibleLabel` of the
    inline photo heading (`app/about/page.tsx:266-270`). Previously the override
    discarded `imageAlt`, so "Bhutanese students working together" was never
    announced (`components/editorial/inline-image-text.tsx:46-50,64-70`). The
    image stays a decorative `alt=""` inside the heading, as the component
    contract requires. Closes audit U2 (LOW).

No other file was edited.

## Checks performed

- Read in full before editing: `reports/page-fixes/MANIFEST.md`,
  `reports/page-audits/about.md`, the `/about` row and overlap notes in
  `reports/page-audits/CONSOLIDATED.md`, `AGENTS.md`,
  `design/brand-system.md`, `design/brand-guidelines.md`,
  `design/voice-guide.md`, `lib/design-tokens.ts`, `app/globals.css`,
  `data/landing.ts`, and the shared components this route renders
  (`components/interactive/animated-disclosure-list.tsx`,
  `components/editorial/inline-image-text.tsx`,
  `components/ui/photo-credit.tsx`, `components/marketing/nav.ts`,
  `components/data/live-context.tsx`, `lib/data/world-bank.ts`,
  `app/api/context-data/route.ts`).
- Read the installed Next.js 16 guides for the APIs this route uses:
  `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`,
  `05-server-and-client-components.md`, `10-error-handling.md`, `12-images.md`.
  `/about` remains an async Server Component with `pageMetadata`, `next/image`
  with `fill`, and a client component (`LiveContext`) receiving serializable
  props. No unsupported API was introduced.
- Source verification against the current files: the two audit findings above
  were still present; the metadata, internal destinations (`/public`,
  `/how-it-works`, `/faq`, `/contact` all exist as route files) and external
  links (`target="_blank" rel="noopener noreferrer"`) are intact. Native
  `<details>/<summary>` at `app/about/page.tsx:250-255` still wraps the live
  panel.
- `npx eslint app/about/page.tsx` — passed, no findings.
- `git diff -- app/about/page.tsx` reviewed: three small changes, no incidental
  edits. No build, test suite, or dev server was run, per the manifest.

## Workflow findings routed to the workflow owner

- None originated in the owned file. There is no form, server action, redirect,
  mutation, role gate, or user input on `/about`; the only data call is
  `getLiveContext()` at `app/about/page.tsx:78`, and the only client refresh is
  the shared public endpoint `app/api/context-data/route.ts:15-22` (GET, hourly
  revalidation, no cookies, user IDs or writes). The audit's "no route-specific
  workflow defect" conclusion was confirmed.
- Error/empty states are handled by the shared panel, not this route:
  `lib/data/world-bank.ts:398-409,422-434` returns `ok: false` with an error,
  `components/data/live-context.tsx:70,98-105` keeps last good values on a
  failed poll, and `:354-366` renders an unavailable note / empty message. No
  route-owned loading or error boundary exists or is needed here.
- Cross-referenced, not re-owned: the partial-upstream-failure issue below and
  the live-panel pause/refresh behavior belong to shared owners.

## Database findings routed to the database owner

- `/about` issues no Neon query and reads no database field. `getLiveContext()`
  (`lib/data/world-bank.ts:359-437`) fetches public World Bank/WHO series only;
  `app/api/context-data/route.ts:15-22` is a public aggregate endpoint. Nothing
  on this route depends on `neon/schema.sql` or `lib/neon-data.ts`, so there are
  no stale status values, unbounded reads, missing indexes, or ownership gaps
  to report for this page.
- Copy check: the verification section (`app/about/page.tsx:306-354`) says an
  admin checks identity/institution details and CV and sets rank and the
  verified badge. `neon/schema.sql:44-63` stores `cv_url`, `cv_path`, `rank` and
  `verified boolean not null default false`, but `neon/schema.sql:1-4` states
  explicitly that authorization stays in the application layer and no RLS
  policies exist. The copy describes a manual product process, not a
  database-enforced rule, so no misleading "DB enforces this" claim was found.
- **Routed out (D1, MED, audit `about.md:69`): partial upstream failures are
  collected then dropped.** `lib/data/world-bank.ts:369-381` accumulates
  `errors` from failed World Bank/WHO fetches, but the success result at
  `:412-421` returns `ok: true` with no error list or partial flag.
  `components/data/live-context.tsx:70,94-100` derives `unavailable` only from
  `ok`, and `:354-366` renders all remaining indicators as if complete. Under a
  partial outage the "Official statistics" panel can therefore look complete
  while missing a series. Recommended fix (data-layer half, closest to the
  database/data owner): add `partial` and `missing`/`errors` to
  `LiveContextResult`, populate them from `errors` at
  `lib/data/world-bank.ts:376,381,412-421`. Recommended fix (UI half,
  design-system owner for `components/**`): render a warning at
  `components/data/live-context.tsx:354` naming the unavailable source(s) while
  keeping last good values. Neither file is owned by this page agent; no edit
  was made.

## Shared UI / design-system items routed out

- **S1 (suspected, MED, audit `about.md:45,90`): no visible provenance for
  `/images/thimphu-market.webp`.** The figure at
  `app/about/page.tsx:208-221` has only a caption, while the rest of the
  route's photographs use `PhotoCredit`. Repo-wide search found no source URL
  or licence for this asset, and it is absent from the only Commons registry
  (`components/marketing/nav.ts:68-74`,
  `components/ui/photo-credit.tsx:7-23`). The page says "Each photo credit
  links to the original file" at `app/about/page.tsx:375-377`, so the gap is
  visible to readers. Recommended fix for the design-system/data owner: verify
  the asset's source and licence, add a registry entry plus a visible
  `PhotoCredit`, or replace it with one of the three registered Commons files.
  No author or licence was guessed, and the shared registry was not edited.
- The suspected stock-classroom alt-text question on the reused
  `bhutanese-community.jpg` / `bhutanese-students.jpg` images is already owned
  by `reports/page-audits/for-students.md:27`; it was not re-scored or changed
  here.

## Deliberately not changed

- `data/landing.ts` was not edited (not in the `about` ownership table). Adding
  explicit `id` fields there would be a cleaner long-term home for the
  disclosure IDs, but the local slug helper fixes the IDREF defect without
  touching shared data.
- `components/interactive/animated-disclosure-list.tsx`,
  `components/editorial/inline-image-text.tsx`,
  `components/data/live-context.tsx`, `lib/data/world-bank.ts`,
  `components/ui/photo-credit.tsx` and `components/marketing/nav.ts` are
  shared files; findings there were routed out with `file:line` above.
- National-indicator wording, the verified World Bank source link, the
  "Why two numbers?" honesty rule, the native `<details>` live panel, and the
  reduced-motion disclosure behavior were left intact. No new dependency,
  gradient, emoji, off-palette colour, or wholesale rewrite was introduced.
