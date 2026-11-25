# `/founder/projects` — fix report

Slug: `founder-projects`. `reports/page-fixes/MANIFEST.md` was read in full and
its ownership rules were followed. The dirty working tree was treated as the
source of truth; no `git checkout`, `reset`, `stash`, or `clean` was run.

## Files changed

- `app/founder/projects/page.tsx`
  - Accepts the Next 16 `searchParams: Promise<...>` prop and allow-lists
    `?status=` to `all`, `open`, `in_progress`, `review`, or `completed`. Unknown
    and repeated values fall back to `all`.
  - Passes the value as `initialFilter` and uses `key={initialFilter}` so a
    later client navigation to a different filtered URL remounts the client
    state instead of keeping the old segment selected.
  - The founder id still comes only from `supabase.auth.getUser()`; no request
    data is used to scope the Neon read.
- `app/founder/projects/projects-client.tsx`
  - New optional `initialFilter` prop, validated again in the client before
    seeding `useState`, so bookmarked/shareable filters preselect correctly
    (audit W2).
  - Arrow/Home/End handling is now one capture-phase handler that calls
    `stopPropagation()`: the next segment is focused and selected once instead
    of two handlers reacting to the same keydown (audit W3, fixed as far as the
    owned file allows).
  - Each `View applicants` link now has the unique accessible name
    `View applicants for {title}` through visually hidden text, and the desktop
    project title is a `th scope="row"` so the row supplies context (U1).
  - Row links are `min-h-11`; the mobile card link is full width and centered
    (U2).
  - Long titles wrap (`line-clamp-2 break-words` on mobile, `break-words` on the
    row header) with `title` retained, instead of being truncated to one line
    (U3).
  - Posted dates now include the year, e.g. `24 Nov 2026` (U4). The locale stays
    centralized in this file's single date formatter.

## Checks performed

- Read `reports/page-fixes/MANIFEST.md`, `reports/page-audits/founder-projects.md`,
  the relevant rows and themes in `reports/page-audits/CONSOLIDATED.md`,
  `AGENTS.md`, `node_modules/next/AGENTS.md`, and the Next 16 guides
  `01-app/01-getting-started/03-layouts-and-pages.md` (search params must be
  awaited; server prop is correct for a list already loaded via props),
  `05-server-and-client-components.md`, and `10-error-handling.md`.
- Read `design/brand-system.md`, `design/brand-guidelines.md`,
  `design/voice-guide.md`, `lib/design-tokens.ts`, and `app/globals.css`. All
  edited classes keep the existing warm-paper/forest/vermilion palette, tokens,
  and focus-ring conventions; no new dependency, gradient, violet, or emoji was
  added.
- Verified every audit finding against the current source before acting. The
  audit described code that a prior pass had already changed in these files,
  so line references were re-derived from the current files.
- Source-traced workflow and data paths: `page.tsx`, `projects-client.tsx`,
  `proxy.ts`, `app/founder/projects/[id]/page.tsx`, `app/actions/projects.ts`,
  `lib/neon-data.ts`, and `neon/schema.sql`.
- `npx eslint app/founder/projects/page.tsx app/founder/projects/projects-client.tsx`
  completed with no findings (exit 0).
- Per the manifest, no full build, no test suite, and no dev server was run.
  The browser-observed W1 symptom was therefore not re-driven here; the owned
  fixes were verified by source inspection only.

## Workflow findings routed to the workflow owner

- **W1 (audit MED, runtime symptom not reproduced here).** The audit observed
  that clicking `Open` left `aria-pressed` on `All`, the count at
  `Showing all 7 projects`, and all rows visible; `ArrowRight` also left focus
  unchanged. That combination (no state change *and* no focus change) is
  consistent with the page not having hydrated in that dev session, which the
  audit notes as HMR WebSocket noise, rather than with a proven logic defect.
  Current source wiring is intact: `onChange={setFilter}` at
  `app/founder/projects/projects-client.tsx:170`, derived `filtered` at
  `:105-111`, count at `:157-160`, empty state and reset at `:184-199`. The
  owned-file changes make the initial state deterministic and remove the
  duplicate key path. If the no-op still reproduces on a clean production
  build, the workflow owner should investigate hydration/runtime behaviour at
  `components/interactive/segmented-control.tsx` and the app shell, not the
  filter derivation. This route performs no writes, redirects, or status
  transitions.
- **W3 (shared component).** `components/interactive/segmented-control.tsx:12-25,37-63`
  documents arrow/Home/End as focus-only and has no select-on-arrow option, so
  pages that want selection to follow focus must wrap it. Recommended shared
  fix: add an optional `selectOnArrow` prop and key navigation by
  `option.value` (for example via a `data-value` attribute on each button),
  then remove the wrapper handler here and the duplicate in
  `app/founder/browse-projects/browse-projects-client.tsx:71-75,82-110,115-131`.
  The shared file was not edited.
- Verified controls, no new finding: signed-out protected requests redirect to
  `/login` via `proxy.ts:110-113`; the defensive signed-in card in
  `projects-client.tsx:124-139` remains harmless; the error boundary logs the
  error, uses `role="alert"`, and offers retry plus a founder-home link; the
  loading boundary uses `role="status"`, `aria-busy`, and
  `motion-reduce:animate-none`; the downstream detail page rechecks ownership
  at `app/founder/projects/[id]/page.tsx:33-39`.

## Database findings routed to the database owner

- **D1 (audit LOW, confirmed).** `lib/neon-data.ts:297-310` runs
  `select * from public.projects where founder_id = …` and maps every column at
  `:191-208`, while this page keeps only `id`, `title`, `status`, and
  `created_at` (`app/founder/projects/page.tsx:42-51`). Recommended: add a
  narrow founder-list projection (and a bounded limit or pagination if the
  founder's history can grow) and type the page against that row. No DB file
  was edited.
- **D2 (audit LOW, downstream only).** `app/actions/projects.ts:192-204` loads
  the application and project, then performs a separate status update;
  `lib/neon-data.ts:395-410` (`getApplication`) and `:412-422`
  (`updateApplicationStatus`, imported as `updateApplicationStatusRow`) are
  separate statements and the update is keyed by application id alone.
  Recommended: one conditional update such as
  `update applications … where id = … and exists (select 1 from projects where id = project_id and founder_id = …)`,
  treating zero affected rows as an authorization failure. No write occurs on
  `/founder/projects`; this is routed for the shared workflow/database owners,
  not fixed here.
- Verified controls, no new finding: `neon/schema.sql:25` bounds project status
  to exactly the four values used by `FILTERS`
  (`projects-client.tsx:25-31`); `neon/schema.sql:87` indexes
  `(founder_id, created_at desc)` for this list; the query at
  `lib/neon-data.ts:302-305` is parameterized and the founder id is never taken
  from the URL; `neon/schema.sql:1-4` states that Neon has no RLS and
  authorization stays in application code. The stale Supabase open-project
  policy is explicitly superseded by
  `supabase/migrations/20261026000000_fix_projects_rls.sql` and is not active on
  this Neon-backed route.

## Deliberately not changed

- `app/founder/projects/error.tsx` and `app/founder/projects/loading.tsx`: the
  audit found no defects. Both already provide the correct roles, retry/back
  actions, `aria-busy`, and reduced-motion handling. Editing them would be
  churn.
- `components/interactive/segmented-control.tsx`: owned by the design-system
  owner. The capture-phase wrapper keeps the desired select-on-arrow behaviour
  inside this route until a shared `selectOnArrow` prop exists.
- `lib/neon-data.ts`, `neon/schema.sql`, `app/actions/projects.ts`, and
  `proxy.ts`: owned by the database/workflow owners; findings are routed above.
- Date locale (audit S1): kept `en-GB` because the app renders `lang="en"` and
  has no locale switcher. A single formatter already centralizes the choice in
  this owned file; changing it needs a product decision and should be applied
  consistently across workspace tables by the design-system owner.
- Writing `?status=` back to the URL when a segment is clicked was not added.
  Audit W2 asked for deep-link preselection only; client-side URL synchronization
  would add router state and a larger diff without fixing the reported symptom.
