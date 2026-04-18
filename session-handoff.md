# Session Handoff

## Verified Now

- What is currently working: The repo boots with `./init.sh`, the landing page accepts a ticker, `/dashboard/[ticker]` loads seeded workspaces for `AAPL`, `MSFT`, and `KO`, the dashboard shows company identity plus key stats and a Yahoo Finance-style quote snapshot in fixture-backed verification, backend health-check and workspace tests pass, and `dash-001`, `dash-002`, and `dash-002b` are recorded as passing.
- What verification actually ran: `./init.sh`; `cd backend && .venv/Scripts/python.exe -m pytest -q`; `cd frontend && npm run lint`; `cd frontend && npm run typecheck`; `cd frontend && npx playwright test e2e/dash-002b.spec.ts`; extra regression check `cd frontend && npx playwright test e2e/dash-002.spec.ts`

## Changed This Session

- Code or behavior added: Added a backend `/companies/{ticker}/workspace` route, a Yahoo Finance runtime client plus fixture provider, a frontend backend-fetch helper with seed fallback, and a quote-snapshot section on `/dashboard/[ticker]` that displays previous close, open, bid/ask, range, volume, market cap, beta, PE, EPS, earnings date, dividend data, and ex-dividend date.
- Infrastructure or harness changes: Updated Playwright to start both backend and frontend for e2e runs, added backend pytest coverage for the workspace route, inserted `dash-002b` into the roadmap ahead of `dash-003`, and captured the passing output at `artifacts/verification/dash-002b-playwright.log`.
- Documentation changes: Refreshed the frontend/backend topic docs and architecture docs so they describe the new backend-for-frontend market-data path.

## Broken Or Unverified

- Known defect: The live `dash-002b` runtime path is currently broken for non-seeded tickers because Yahoo Finance is returning `401 / 401` from the upstream quote endpoints; `NVDA` reproduced this directly from the backend route.
- Unverified path: Later per-feature verification files in `feature_list.json` remain unstarted until their features become active.
- Risk for the next session: The live runtime path depends on observed Yahoo Finance endpoints rather than an official public API, and it is currently blocked by Yahoo `401 / 401` responses for non-seeded tickers. `dash-003` should not assume the backend path is healthy until that auth/session problem is addressed.
- Working tree note: User-owned changes still exist in `AGENTS.md` and `.claude/`; they were intentionally left untouched while recording `dash-002b`.

## Next Best Step

- Highest-priority unfinished feature: `dash-003`
- Why it is next: `dash-002b` is recorded as passing in fixture-backed verification, but the immediate blocking issue before relying on the live path is the Yahoo `401 / 401` failure for non-seeded tickers.
- What counts as passing: The selected company workspace shows the S&P 500 and a sector-relevant industry index, and `cd frontend && npx playwright test e2e/dash-003.spec.ts` passes with evidence recorded.
- What must not change during that step: First resolve or explicitly work around the live Yahoo auth/session blocker, then keep focus on `dash-003`, preserve the `/dashboard/[ticker]` route plus the `dash-001`, `dash-002`, and `dash-002b` contracts, and avoid jumping ahead into financial metrics or chart work.

## Commands

- Startup: `./init.sh`
- Verification: `./init.sh` for baseline; `feature_list.json -> features[*].verification.command` for feature passing
- Focused debug command: `cd frontend && npx playwright test e2e/dash-003.spec.ts`
