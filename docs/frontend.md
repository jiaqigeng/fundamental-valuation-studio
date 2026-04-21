# Frontend Topic Doc

Load this doc when working inside `frontend/` - editing routes, components, styling, Playwright specs, or anything consumed by `cd frontend && npm run dev`.

## Purpose

This file is the frontend working guide:

- what commands to run
- what framework-specific rules to remember while editing
- how verification works for frontend tasks

It should not be the source of truth for folder ownership or long-lived code structure. That belongs in [../frontend/ARCHITECTURE.md](../frontend/ARCHITECTURE.md).

## Stack

- Next.js 16.2.4 (App Router, Turbopack dev) with React 19.2.4
- TypeScript 5 with `strict: true` and `"@/*" -> "./src/*"` alias
- Tailwind CSS v4 via `@tailwindcss/postcss` plus hand-written classes in `globals.css`
- Playwright 1.59+ for end-to-end verification
- npm 11.11.0, Node.js 24.14.1

## Breaking-change caveat

`frontend/AGENTS.md` states this Next.js release has API, convention, and file-structure differences from what prior model training data assumes. Before writing or modifying Next.js code, read the relevant guide in `frontend/node_modules/next/dist/docs/` and honor any deprecation notices there. Do not invent APIs from memory.

## Scope boundary

- Read [../frontend/ARCHITECTURE.md](../frontend/ARCHITECTURE.md) when deciding where new frontend code belongs.
- Read this file when deciding how to run, verify, or safely edit frontend code.
- If a rule would need to be true over time even as the app grows, prefer putting it in the architecture doc instead of here.

## Conventions

- Client-only components declare `"use client"` on the first line (see `_components/ticker-search-form.tsx`).
- Dynamic route segments receive `params` as a `Promise` and must be `await`ed inside the component (see `dashboard/[ticker]/page.tsx`).
- Unknown tickers call `notFound()` from `next/navigation` instead of rendering an ad-hoc error.
- Imports use the `@/` alias; do not use long relative chains.
- Keep tailwind utility classes alongside existing hand-written class names; do not rip out `globals.css` styling without a design task.
- Keep feature verification aligned with `feature_list.json`; the spec file named there is the passing gate, not a substitute command.

## Current implementation notes

- The dashboard now relies on backend-backed workspace data through `frontend/src/app/_lib/company-workspace.ts`; the old frontend seed fallback path has been removed.
- The landing-page search form now validates tickers through the local route handler at `frontend/src/app/api/companies/[ticker]/validate/route.ts` before routing, so invalid tickers stay on `/` with an inline error instead of navigating to a 404 page.
- The landing page exposes a direct CTA to `frontend/src/app/valuation/page.tsx`, and that route now renders the first real calculator UI: a DCF workspace with live yfinance-backed company inputs, user-entered FCF growth plus discount assumptions, and a local API proxy at `frontend/src/app/api/valuations/dcf/route.ts` for recalculation.
- `frontend/playwright.config.ts` declares multiple `webServer` entries so Playwright can auto-start both the frontend and backend during e2e runs.

## Commands

Run from the repo root unless noted.

- Dev server: `cd frontend && npm run dev`
- Lint: `cd frontend && npm run lint`
- Typecheck: `cd frontend && npm run typecheck`
- All e2e specs: `cd frontend && npm run test:e2e`
- Single feature spec: `cd frontend && npx playwright test e2e/<feature-id>.spec.ts`

`./init.sh` installs dependencies and runs lint + typecheck automatically. It does not run Playwright — that is the per-feature passing gate.

## Adding a feature spec

1. Find the feature in `feature_list.json`. Its `verification.command` names the spec file (e.g. `e2e/dash-002.spec.ts`).
2. Create that spec under `frontend/e2e/` using the style of `dash-001.spec.ts` (role-based locators, `expect(...).toBeVisible()`).
3. Implement the feature until the spec passes.
4. Capture the run to `artifacts/verification/<feature-id>-playwright.log` and record evidence per `AGENTS.md`.

## Do not

- Do not mark a feature passing without the spec file existing and exiting zero.
- Do not add new dependencies casually; the stack is deliberately small. If a feature requires one, record the reason in `progress.md`.
- Do not edit generated artifacts under `frontend/.next/`.

## Source, applicability, expiry

- Source: project scaffold from Session 001 and `dash-001` implementation in Session 002 (`progress.md`).
- Applicability: any task that touches files under `frontend/`.
- Expiry: revisit when Next.js, React, Tailwind, or Playwright majors change, when the app router structure grows beyond `_components` / `_lib`, or when the dashboard data path changes substantially again.
