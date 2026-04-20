# Session Handoff

## Verified Now

- What is currently working: The repo boots with `./init.sh`, the landing page accepts a ticker, `/dashboard/[ticker]` loads company identity plus key stats, the valuation-focused Yahoo snapshot remains intact, the market-context section still renders normalized `1Y` / `5Y` comparison ranges, and the shared `Income Statement Bridge` card still renders the segment pie ahead of the waterfall. That card now exposes a synchronized `Year` / `Quarter` toggle, so both the pie chart and the waterfall switch together to the same reporting period. Supported fixture tickers `AAPL`, `MSFT`, and `KO` now have curated quarterly bridge data, while the live runtime builds annual and quarterly waterfalls from Yahoo income statements and requests annual plus quarterly segment mixes from FMP before falling back to fixtures for the supported tickers. The `dash-004` waterfall still follows the requested statement order: `Revenue`, `Cost of Revenue`, `Gross Profit`, `Operating Expenses`, `Operating Profit`, `Others`, `Taxes`, and `Net Profits`; the longer x-axis labels still wrap onto two lines when needed; the dotted bridge still connects every adjacent bar using the correct entry and exit edge; `Others` is still the residual balancing bucket; the dedicated zero baseline line is still absent; and the y-axis still uses a zero-anchored step size equal to one-fifth of the full chart span, labeling each step on the left until both the positive and negative ranges are covered, including `0`. Backend tests, the `dash-004` regression spec, and the updated `dash-005` Playwright gate all pass, and `dash-001` through `dash-005` remain recorded as passing.
- What verification actually ran: `./init.sh`; `cd backend && .venv/Scripts/python.exe -m pytest tests/test_company_workspace.py -q`; `cd frontend && npm run lint`; `cd frontend && npm run typecheck`; `cd frontend && npx playwright test e2e/dash-004.spec.ts`; `cd frontend && npx playwright test e2e/dash-005.spec.ts`

## Changed This Session

- Code or behavior added: Added period-aware `financial_bridge_periods` to the backend workspace payload, created a client-side `FinancialBridgeSection` toggle, taught the revenue pie and waterfall to switch together between yearly and quarterly data, and added curated quarter bridge data for the supported fixture tickers.
- Infrastructure or harness changes: Refreshed both `artifacts/verification/dash-004-playwright.log` and `artifacts/verification/dash-005-playwright.log`, and extended backend tests plus the `dash-005` Playwright gate to cover the new period toggle behavior via implementation commit `477f9f8`.
- Documentation changes: Updated `feature_list.json`, `progress.md`, and this handoff to reflect the year/quarter bridge toggle while leaving `dash-006` as the next roadmap slice.

## Broken Or Unverified

- Unverified path: Later per-feature verification files in `feature_list.json` remain unstarted until their features become active.
- Risk for the next session: `yfinance` is still an unofficial Yahoo wrapper, so upstream field names and field availability can drift. The full live workspace route still depends on Yahoo for the broader company snapshot, so a network or provider failure there can still prevent the dashboard from reaching the FMP segment fetch. Quarterly segment detail now also depends on FMP's quarter response shape and availability; unsupported live tickers can still end up with a quarter waterfall and no quarter segment pie if FMP does not return usable quarterly segmentation. The product-vs-geography selector remains heuristic-based, the pie-chart palette is currently sized for the current supported segment counts, and `backend/.env` remains local-only and ignored by git.
- Ongoing work note: This was a narrow `dash-005` exception update on top of the passing dashboard slices. Resume roadmap work at `dash-006` unless the user asks for another focused revenue-bridge refinement first.
- Working tree note: User-owned changes still exist in `AGENTS.md` and `.claude/`; they were intentionally left untouched.

## Next Best Step

- Highest-priority unfinished feature: `dash-006`
- Why it is next: With `dash-005` now passing, the next unfinished dashboard slice is the historical trend chart section for revenue, earnings, and cash flow.
- What counts as passing: The dashboard shows multi-year trend charts for revenue, earnings, and cash flow, and `cd frontend && npx playwright test e2e/dash-006.spec.ts` passes with evidence recorded.
- What must not change during that step: Preserve the `/dashboard/[ticker]` route plus the `dash-001` through `dash-005` contracts, keep the backend-for-frontend workspace path deterministic in fixture mode, preserve the valuation-focused Yahoo snapshot, market-context section, waterfall, and revenue segment breakdown contracts, and avoid widening scope beyond the historical-chart slice.

## Commands

- Startup: `./init.sh`
- Verification: `./init.sh` for baseline; `feature_list.json -> features[*].verification.command` for feature passing
- Focused debug command: `cd frontend && npx playwright test e2e/dash-006.spec.ts`
