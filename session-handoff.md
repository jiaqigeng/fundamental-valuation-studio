# Session Handoff

## Verified Now

- What is currently working: The repo boots with `./init.sh`, the landing page accepts a ticker, `/dashboard/[ticker]` loads company identity plus key stats, the valuation-focused Yahoo snapshot remains intact, the market-context section still renders normalized `1Y` / `5Y` comparison ranges, and the dashboard still shows the dedicated `dash-004` waterfall section. That waterfall now follows the requested statement order: `Revenue`, `Cost of Revenue`, `Gross Profit`, `Operating Expenses`, `Operating Profit`, `Other Income / Cost`, `Taxes`, and `Net Profits`. In fixture mode, those values render deterministically for `AAPL`, `MSFT`, and `KO`, and the backend live path derives the same bridge from the latest available `yfinance` income-statement rows. Backend workspace tests pass, and `dash-001` through `dash-004` remain recorded as passing.
- What verification actually ran: `./init.sh`; `cd backend && .venv/Scripts/python.exe -m pytest tests/test_company_workspace.py -q`; `cd frontend && npm run lint`; `cd frontend && npm run typecheck`; `cd frontend && npx playwright test e2e/dash-004.spec.ts`

## Changed This Session

- Code or behavior added: Refined the existing `dash-004` waterfall so it now exposes statement subtotals for `Gross Profit` and `Operating Profit`, renames the other bars to `Cost of Revenue`, `Operating Expenses`, `Other Income / Cost`, `Taxes`, and `Net Profits`, and removes the separate `Interest` / `Other Items` presentation from the chart.
- Infrastructure or harness changes: Refreshed the deterministic fixture payloads and the `frontend/e2e/dash-004.spec.ts` contract to match the new line-item wording and order, and refreshed the passing Playwright log at `artifacts/verification/dash-004-playwright.log`.
- Documentation changes: `feature_list.json`, `progress.md`, and this handoff now describe the refined `dash-004` line-item contract while still pointing the next roadmap session at `dash-005`.

## Broken Or Unverified

- Unverified path: Later per-feature verification files in `feature_list.json` remain unstarted until their features become active.
- Risk for the next session: `yfinance` is still an unofficial Yahoo wrapper, so upstream field names and field availability can drift. The refined waterfall builder is still best-effort for live tickers and may derive subtotal or bridge values when Yahoo omits gross-profit, operating-income, pretax, or tax rows.
- Ongoing work note: `dash-004` is complete. Resume roadmap work at `dash-005` unless the user asks for another narrow dashboard exception update first.
- Working tree note: User-owned changes still exist in `AGENTS.md` and `.claude/`; they were intentionally left untouched.

## Next Best Step

- Highest-priority unfinished feature: `dash-005`
- Why it is next: With `dash-004` now passing, the next unfinished dashboard slice is the revenue segment breakdown chart.
- What counts as passing: The dashboard shows a revenue breakdown that reconciles segment totals to company revenue, and `cd frontend && npx playwright test e2e/dash-005.spec.ts` passes with evidence recorded.
- What must not change during that step: Preserve the `/dashboard/[ticker]` route plus the `dash-001` through `dash-004` contracts, keep the backend-for-frontend workspace path deterministic in fixture mode, preserve the valuation-focused Yahoo snapshot and passing waterfall contracts, and avoid widening scope beyond the segment-breakdown slice.

## Commands

- Startup: `./init.sh`
- Verification: `./init.sh` for baseline; `feature_list.json -> features[*].verification.command` for feature passing
- Focused debug command: `cd frontend && npx playwright test e2e/dash-005.spec.ts`
