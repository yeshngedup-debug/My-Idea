# Project structure

A map of the repository and where new code belongs. `README.md` is authoritative for setup and deployment; files under `reports/` are point-in-time audit snapshots, not live documentation.

## Top level

| Path | Purpose |
| --- | --- |
| `src/` | All application source. The `@/*` alias points here. |
| `public/` | Static assets served as-is. |
| `tests/e2e/` | Playwright E2E specs. `tests/neon-auth.mock.ts` is the shared Vitest mock. |
| `scripts/` | Setup, smoke-test, verification and screenshot scripts. |
| `neon/` | The Neon SQL schema (`schema.sql`). |
| `design/`, `functions/` | Brand assets and the deployed `platform` Neon Function. |
| `reports/` | Audit/fix reports; `artifacts/` holds ignored local outputs. |
| `neon.ts` | Neon CLI config (`@neon/config/v1`). Stays at the root. |
| `proxy.ts` | Next.js 16 proxy — session refresh and route protection. |
| `instrumentation.ts` | Reserved for telemetry initialization. |
| `*.config.*` | Build, lint, test and format configuration. |
| `.env.example` | Complete Neon-only variable list with no real secrets. |

## `src/app/` — routing only

Pages stay thin (< 40 lines); business logic lives in `features/`.

| Path | Purpose |
| --- | --- |
| `layout.tsx`, `globals.css` | Root shell, Tailwind 4 `@theme` tokens, global providers. |
| `error.tsx`, `not-found.tsx` | Route-level fallback UI. |
| `robots.ts`, `sitemap.ts` | Generated dynamically (no static `public/` copies). |
| `(marketing)/` | Public pages — landing, about, contact, FAQ, for-founders, for-students, how-it-works, privacy, public, terms. |
| `(auth)/` | Login, signup, forgot-password, reset-password. Each page renders its own `AuthShell`. |
| `auth/callback/route.ts` | Neon Managed Auth callback. Intentionally **outside** `(auth)` so the URL stays `/auth/callback`. |
| `(app)/` | Authenticated pages — admin, founder, student. |
| `api/` | Route handlers: `cv/[id]`, `health`, `neon`, `realtime/orders`, `context-data`. |

Route groups do not appear in URLs, so moving a page into `(marketing)` or `(app)` does not change its path. The group layouts are intentionally thin pass-throughs; auth is enforced by `proxy.ts` and re-checked in each page and Server Action.

The landing page lives at `/public`. The root path `/` is redirected to it by a
server-level rule in `next.config.ts`, so the browser gets a `308` before any
page is rendered. `src/app/(marketing)/page.tsx` is only the route-level
fallback — a page-level redirect is thrown after the shell has flushed and
would leave the first paint as an empty loading skeleton.

Pages that read cookies/sessions use `export const dynamic = 'force-dynamic'` so Next.js does not prerender them at build time.

## `src/components/` — shared UI

| Folder | Contents |
| --- | --- |
| `ui/` | Domain-free primitives (button, input, card, badge, progress, …). Must not import app data. |
| `layout/` | Headers, page headings, workspace chrome, navigation, loading. |
| `shared/` | Reserved for cross-feature components that are not pure primitives. |
| `interactive/`, `editorial/`, `marketing/`, `motion/`, `library/` | Landing-page sections, effects and content patterns. |
| `data/`, `network/` | Live-data providers and connectivity indicators. |
| `brand/`, `dev/` | Brand marks and local development helpers. |

## `src/features/` — domain modules

Each feature owns its Server Actions (`actions.ts`), co-located unit tests (`actions.test.ts`), and domain-specific components.

| Feature | Owns |
| --- | --- |
| `auth/` | Login/signup forms, auth shell, auth Server Actions. |
| `admin/` | Admin roster, verification, shortlist generation actions. |
| `projects/` | Project and application actions. |
| `shortlist/` | Shortlist request actions. |
| `payments/` | Order actions and the live payment-status component. |
| `users/` | Student profile and CV actions. |

Page-specific client components that only one route uses remain next to that route.

The full module shape is `components/`, `hooks/`, `actions.ts`, `queries.ts`, `schemas.ts`, `types.ts`, `index.ts`; only files that exist today are present, the rest are added as each feature grows.

## `src/lib/` — infrastructure

| File | Purpose |
| --- | --- |
| `neon-data.ts` | All application tables via raw tagged SQL. Single source of truth for data access. |
| `neon.ts` | Neon HTTP client factory. |
| `neon-realtime.ts` | Realtime query sealing for payment status. |
| `auth.ts`, `auth/server.ts`, `auth/client.ts` | Neon Managed Better Auth helpers for server and browser code. |
| `storage.ts` | Neon Object Storage client, uploads and signed URLs. |
| `env.ts` | Required-variable validation, called when a client is created (never at import). |
| `validators.ts` | Shared Zod schemas. |
| `format.ts`, `order-status.ts`, `metadata.ts`, `design-tokens.ts` | Formatting, domain copy, SEO helpers, design tokens. |

The auth screens (`src/app/(auth)/**` and `src/features/auth/components/**`) carry the BTC brand palette: teal `#66bfbf`, mist `#eaf6f6`, white `#ffffff` and magenta `#ff0063`, with derived legibility roles ink `#0b2e2e`, muted `#356464`, brand text `#0b5c5c`, accent text `#c2004b` and black `#000000` on magenta.
| `pdf.ts` | Hand-built PDF 1.4 byte stream. |
| `rate-limit.ts` | In-memory limiter — documented multi-instance limitation. |
| `utils.ts` | `cn()` and small helpers. |

## Data, auth and storage: all Neon

| Concern | Owned by | Entry point |
| --- | --- | --- |
| Application tables | Neon Postgres | `src/lib/neon-data.ts` |
| Identities and sessions | Neon Managed Better Auth | `src/lib/auth*` |
| Private CV files | Neon Object Storage (`cvs` bucket) | `src/lib/storage.ts` |
| Private payment proofs | Neon Object Storage (`payment-screenshots` bucket) | `src/features/payments/actions.ts` |
| Live payment status | Neon Realtime | `src/lib/neon-realtime.ts` |
| Row types | Hand-maintained Neon row shapes | `src/types/database.ts` |

There is no RLS layer and no separate auth database. Authorization happens in
`proxy.ts`, Server Actions and route handlers against `public.profiles.role`.
Do not import `src/lib/neon-data.ts` from a Client Component.

## Tests

- **Vitest** — `vitest.config.mts`, setup in `vitest.setup.ts`. Unit tests are co-located (`*.test.ts`). Shared mocks live in `tests/`, imported as `@tests/neon-auth.mock`.
- **Playwright** — specs in `tests/e2e/`, config in `playwright.config.ts`. E2E tests share a seeded Neon branch with real Neon Auth accounts, so workers run serially.

## Generated and ignored paths

`node_modules/`, `.next/`, `coverage/`, `.playwright-mcp/`, `.reticle/`, `playwright-report/`, `test-results/`, `reports/artifacts/`, `.env*`, `*.tsbuildinfo`, `.neon/`.

## Where to add new code

| Task | Location |
| --- | --- |
| New page or API endpoint | `src/app/<group>/<route>/` |
| New Server Action | `src/features/<domain>/actions.ts` |
| New domain component | `src/features/<domain>/components/` |
| New reusable UI primitive | `src/components/ui/` |
| New database query | `src/lib/neon-data.ts` |
| New validation rule | `src/lib/validators.ts` |
| New public config value | `src/config/app.ts` or `src/config/payment.ts` |
| New schema change | `neon/schema.sql`, then re-run `scripts/neon-setup.mjs` |
| New environment variable | `.env.local`, Vercel settings, `.env.example` and the README env table |
