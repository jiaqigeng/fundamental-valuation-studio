# Session Handoff

## Verified Now

- What is currently working: The repo boots with `./init.sh`, the landing page accepts a ticker, `/dashboard/[ticker]` loads company identity plus key stats, the quote snapshot now formats forward dividend and yield without the 100x inflation bug, and the last dashboard section renders a normalized three-line comparison chart for the company, the S&P 500, and the sector benchmark. Backend health-check and workspace tests pass, and `dash-001`, `dash-002`, `dash-002b`, and `dash-003` remain recorded as passing.
- What verification actually ran: `./init.sh`; `cd backend && .venv/Scripts/python.exe -m pytest -q`; `cd frontend && npm run lint`; `cd frontend && npm run typecheck`; `cd frontend && npx playwright test e2e/dash-002b.spec.ts e2e/dash-003.spec.ts`

## Changed This Session

- Code or behavior added: Corrected the `yfinance` forward-dividend formatter so yields are no longer inflated by 100x, extended the workspace payload with normalized recent-history series, and replaced the last dashboard section with a chart that starts the company, S&P 500, and sector benchmark at the same baseline so their growth paths are directly comparable.
- Infrastructure or harness changes: Extended backend pytest coverage with a forward-dividend formatting assertion and fixture performance-chart assertions, and updated the affected Playwright specs for `dash-002b` and `dash-003`.
- Documentation changes: Repository tracking artifacts now record this user-requested exception update while keeping `dash-004` as the next unfinished feature.

## Broken Or Unverified

- Unverified path: Later per-feature verification files in `feature_list.json` remain unstarted until their features become active.
- Risk for the next session: `yfinance` is still an unofficial Yahoo wrapper, so upstream field names and recent-history availability can drift even though the current live checks succeeded after the provider swap.
- Working tree note: User-owned changes still exist in `AGENTS.md` and `.claude/`; they were intentionally left untouched while recording this exception update.

## Next Best Step

- Highest-priority unfinished feature: `dash-004`
- Why it is next: `dash-003` is now recorded as passing, so the roadmap moves to the first financial-metrics slice that depends on the live workspace path.
- What counts as passing: The selected company workspace shows revenue, EPS, free cash flow, gross and operating margins, and ROIC or ROE, and `cd frontend && npx playwright test e2e/dash-004.spec.ts` passes with evidence recorded.
- What must not change during that step: Preserve the `/dashboard/[ticker]` route plus the `dash-001` through `dash-003` contracts, keep the backend-for-frontend workspace path deterministic in fixture mode, and avoid jumping ahead into chart work before the key metrics slice is stable.

## Commands

- Startup: `./init.sh`
- Verification: `./init.sh` for baseline; `feature_list.json -> features[*].verification.command` for feature passing
- Focused debug command: `cd frontend && npx playwright test e2e/dash-004.spec.ts`
