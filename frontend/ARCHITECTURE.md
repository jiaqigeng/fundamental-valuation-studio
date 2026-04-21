# Frontend Architecture

Describes how `frontend/` is organized today and where new code belongs. For conventions, commands, and the Next.js breaking-change caveat, read [../docs/frontend.md](../docs/frontend.md) alongside this file.

## Purpose

This file is the frontend structure guide:

- what the frontend is responsible for
- how code is layered
- where new frontend code should live

It should avoid repeating routine commands, test-running instructions, and edit-time caveats that already live in [../docs/frontend.md](../docs/frontend.md).

## What the frontend does

The frontend is the user's entry point into Fundamental Valuation Studio. A user lands on a ticker-search page, can either submit a ticker into the dashboard flow or jump directly to the valuation route, and is routed into dedicated workspace pages. The dashboard route now depends on backend-backed workspace data, while the landing-page search form validates tickers through a small local route handler before navigation so invalid input can be handled inline.

## Top-level shape

```text
frontend/
|- src/app/                         App Router tree
|  |- layout.tsx                   Root HTML shell, fonts, global CSS
|  |- page.tsx                     Landing page (server component)
|  |- valuation/
|  |  `- page.tsx                  Valuation entry route (server component)
|  |- api/companies/[ticker]/validate/
|  |  `- route.ts                  Server route: validate ticker before navigation
|  |- globals.css                  Hand-written + Tailwind v4 styles
|  |- _components/                 Shared UI (underscore = off-route)
|  |  |- ticker-search-form.tsx    Client component: form + inline validation + router.push
|  |- _lib/                        Non-UI helpers (off-route)
|  |  `- company-workspace.ts      Backend-backed workspace fetcher
|  |- dashboard/[ticker]/
|     |- page.tsx                  Server component: renders workspace shell
|- e2e/                            Playwright specs, one per feature id
|- playwright.config.ts            Auto-starts frontend and backend for tests
|- next.config.ts                  Currently empty config
`- tsconfig.json                   Strict TS, `@/* -> ./src/*` alias
```

## Layering

Three layers, each allowed to depend only on the layer below it:

1. **Routes** (`src/app/**/page.tsx`, `layout.tsx`) - Server components by default. Own the page shell, read route params, call into the lib layer, and render components.
2. **Components** (`src/app/_components/**`) - Reusable UI. Client components opt in with `"use client"`. They receive data via props and trigger navigation through `next/navigation` hooks.
3. **Lib** (`src/app/_lib/**`) - Pure data and helpers. No React imports, no `"use client"`. Today this includes `company-workspace.ts` for backend-backed dashboard fetches.

The underscore prefix on `_components/` and `_lib/` keeps them out of the Next.js route tree so URLs stay dedicated to real pages.

## Request / navigation flow

```text
User -> / (page.tsx)
     -> <Link href="/valuation"> from landing CTA
     -> <TickerSearchForm> client component
        -> /api/companies/[ticker]/validate route handler
        -> inline error when ticker is invalid
        -> router.push(`/dashboard/${TICKER}`) when valid
     -> /valuation (page.tsx)
        -> renders valuation entry shell
     -> /dashboard/[ticker] (page.tsx)
        -> getCompanyWorkspaceData(ticker)  // from _lib
        -> backend workspace route
        -> notFound() if no workspace data exists
        -> renders workspace shell
```

Server components handle data lookup and 404s. The only client-side JavaScript on the landing page is the search form and its inline validation flow.

## Data sources today

`_lib/company-workspace.ts` is the primary frontend data entrypoint for the dashboard route. It calls the FastAPI backend for workspace data and returns `null` when the company cannot be loaded, leaving the dashboard route responsible for its not-found behavior. The landing page handles invalid-input UX earlier through the validation route handler.

## Verification boundary

Frontend verification behavior is documented in [../docs/frontend.md](../docs/frontend.md). This file only cares about architecture implications:

- feature specs exist at the frontend boundary, not inside route folders
- route structure should stay easy for Playwright to navigate
- shared UI and helper layers should remain reusable across feature specs

## Extension points

As features come online they should land in these places without introducing new top-level folders:

- New page: add `src/app/<segment>/page.tsx`. Nested segments become folders.
- New shared UI: add to `src/app/_components/`.
- New data fetcher or math helper: add to `src/app/_lib/`. If it calls the backend, keep the HTTP client isolated in a single module so request shape stays grep-able.
  Current example: `company-workspace.ts`.
- New e2e spec: add `e2e/<feature-id>.spec.ts`.

Promote a subfolder (for example `_lib/api/` or `_lib/valuation/`) only when the flat layout starts to hurt navigation. Do not create `hooks/`, `utils/`, `types/`, or `services/` folders preemptively.

## Known architectural constraints

- Dynamic route params arrive as a `Promise` and must be awaited in the route component.
- Client components are the exception, not the default. Prefer server components and lift interactivity into small client leaves.
- Third-party charting, state management, and data-fetching libraries have not been chosen. Each arrives with a feature ticket that justifies it.
