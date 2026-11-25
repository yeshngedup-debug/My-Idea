# admin-projects — per-page fixes

## Files changed

- `app/admin/projects/page.tsx`
  - Imported `redirect` from `next/navigation` and `type Role` from the typed Neon helper module.
  - Split authentication, authorization, and data-load outcomes:
    - no session → `redirect("/login")`;
    - non-admin → `redirect("/founder")` or `redirect("/student")`;
    - session/role/data lookup failures → retryable error-only state.
  - Kept `redirect()` calls outside `try`/`catch` so the framework redirect signal is not swallowed as a generic load error.
  - Built the row list only after both the project query and the batched founder-name query succeed; cleared `rows` in the catch path so a failed name lookup can no longer render a normal-looking list full of “Unknown founder”.
- `app/admin/projects/projects-client.tsx`
  - `projects-client.tsx:189-194` and `:240-245`: removed `truncate`/`max-w-xs truncate`, allowed full title wrapping with `break-words`, and added `title={row.title}` as a hover convenience. The full value is now visible by touch and keyboard, not only in a tooltip.
  - `projects-client.tsx:38,45`: replaced off-token amber badge text with canonical `border`/`secondary`/`smallTextAccent` colors and changed the open-status dot to the canonical amber logo tone. Status still uses label + dot, never color alone.
  - `projects-client.tsx:66-100`: the arrow/Home/End filter handler now derives the current segment from button order via `closest("button")` instead of matching visible `textContent`. This keeps focus movement and selection in sync for localized or decorated labels without touching the shared control.

The working tree already contained uncommitted user changes in both owned files. They were preserved and extended; no shared file was edited.

## Checks performed

- Read `reports/page-fixes/MANIFEST.md` in full and followed the ownership rules.
- Read `reports/page-audits/admin-projects.md`, the relevant `reports/page-audits/CONSOLIDATED.md` sections, `AGENTS.md`, and the required Next.js 16 docs: layouts/pages, server/client components, mutating data, error handling, `redirect`, and proxy.
- Read `design/brand-system.md`, `design/brand-guidelines.md`, `design/voice-guide.md`, `lib/design-tokens.ts`, `app/globals.css`, `lib/neon-data.ts`, `neon/schema.sql`, `proxy.ts`, and `components/interactive/segmented-control.tsx` before editing.
- Verified the audit leads against the current source rather than assuming the report was current.
- `npx eslint app/admin/projects/page.tsx app/admin/projects/projects-client.tsx` — passed with no findings.
- `git diff --stat` / `git status --short` confirmed only the two owned source files were changed.
- No full build, `npm test`, or dev server was started, per manifest instruction. No browser/runtime assertion was attempted.

## Workflow findings routed to workflow owner

- **W3 — transient role lookup failure misroutes admins to `/student`.**
  - `proxy.ts:27-34`: `safeRole()` catches every Neon error and returns `null`.
  - `proxy.ts:123-131`: `null` is mapped through `ROLE_HOME[role ?? 'student']`, so a brief database failure drops an admin into the student workspace.
  - Recommended fix: represent “role lookup failed” separately from “role is student”. On lookup failure, return an error/503 route or redirect to `/login` with a retry message; never infer `student` from a failed lookup.
  - The page-level guard now fails safe for this route, but the proxy remains the first gate for almost every request and still needs the shared fix.

## Database findings routed to database owner

- **D1 — unbounded, over-fetching admin list query.**
  - `lib/neon-data.ts:322-328`: `select * from public.projects order by created_at desc` with no `LIMIT` or pagination.
  - The page uses only `id`, `title`, `status`, `created_at`, and `founder_id` (`app/admin/projects/page.tsx:58-65`), while `lib/neon-data.ts:191-208` still materializes description, budget, skills, deadline, and other unused columns.
  - `neon/schema.sql:87` indexes `(founder_id, created_at desc)` only; there is no index supporting a full-table `created_at desc` scan or status-filtered reads.
  - Recommended fix: add a dedicated narrow list helper selecting only the five required columns, add a bounded `LIMIT` or server-side pagination, and consider an index on `(created_at desc)` or `(status, created_at desc)` after checking the query plan. `lib/neon-data.ts:334-344` shows the existing narrow-helper pattern.
- **D1 follow-up — duplicate row DOM.**
  - `projects-client.tsx:182-208` (mobile list) and `:210-264` (desktop table) render every visible row twice, with one half hidden by CSS. This is acceptable only for small bounded lists; the database owner should pair the paginated query with a single responsive row set where practical.
- **Verified controls — no finding.**
  - Parameters are tagged and bound in `getProfileRole` (`lib/neon-data.ts:47-55`), `listProfilesByIds` (`:74-87`), and `listAllProjectsWithDetails` (`:322-328`). No SQL injection or browser-supplied object ID was found.
  - `neon/schema.sql:25` constrains `projects.status` to the same four values mirrored by `FILTERS` in `projects-client.tsx:22-28`; no stale status label was found.
  - Neon has no RLS by design (`lib/neon-data.ts:1-7`); authorization is enforced in application code, now including the explicit server-side admin recheck in `page.tsx:33-48`.

## Shared design-system findings routed to design-system owner

- `components/layout/workspace-page-heading.tsx:21` still uses off-token `text-[#8a5a00]` for the eyebrow. Recommended fix: use `colors.smallTextAccent` (`#b23c26`) or `colors.textMuted` (`#657069`). Not edited here because it is a shared component.
- `components/interactive/segmented-control.tsx:21-24,37-63` documents arrow/Home/End as focus-only and has no value-keyed selection prop. The wrapper mitigation in `projects-client.tsx:66-100` should be removed once the shared control exposes an explicit `selectOnArrow` prop derived from `option.value`/`data-value`. Not edited here because it is owned by the design-system owner.

## Deliberate non-changes

- **S1 — hard-coded `en-GB` date formatting** (`projects-client.tsx:134-139`) was left alone. The app renders `lang="en"` and has no locale switcher, so this is future-proofing rather than a current defect; centralizing locale across workspace tables is outside this page's scope.
- **No admin project-detail route or link was added.** It would require new files outside this page's ownership. Full title wrapping plus `title={row.title}` makes the value reachable now.
- **No loading state file was added.** `loading.tsx` is not in this route's ownership list, and the client already handles empty/error states.
- **No shared component, proxy, schema, or data-access file was edited.** Those fixes are routed above to their respective owners.
- **No new dependencies, gradients, violet, emoji, or wholesale rewrite** was introduced; the diff stays within the warm-paper / forest / vermilion / amber token system.
