# Session Handoff

## Verified Now

- What is currently working: The repo boots with `./init.sh`, the landing page accepts a ticker, `/dashboard/[ticker]` loads company identity plus key stats, the Yahoo snapshot shows a valuation-focused field set, the market-context comparison section remains switchable between `1Y` and `5Y`, and the dashboard now includes a dedicated key-financial-metrics accordion. That new section is fed through the backend workspace payload and shows revenue, EPS, free cash flow, gross margin, operating margin, and a return metric that prefers ROIC when Yahoo exposes it and otherwise falls back to ROE. Backend health-check and workspace tests pass, and `dash-001` through `dash-004` are now recorded as passing.
- What verification actually ran: `./init.sh`; `cd backend && .venv/Scripts/python.exe -m pytest tests/test_company_workspace.py -q`; `cd frontend && npm run lint`; `cd frontend && npm run typecheck`; `cd frontend && npx playwright test e2e/dash-004.spec.ts`

## Changed This Session

- Code or behavior added: Added a first-class `key_financial_metrics` payload to the workspace contract, populated it in both fixture mode and the live `yfinance` client, and rendered it as a dedicated dashboard accordion. The live builder formats revenue, EPS, free cash flow, gross margin, operating margin, and a return metric that prefers ROIC when Yahoo exposes it and otherwise falls back to ROE.
- Infrastructure or harness changes: Added backend pytest coverage for the new metric builder, updated the fixture workspace test response, and created `frontend/e2e/dash-004.spec.ts` as the exact passing gate for the feature. Captured the passing Playwright output at `artifacts/verification/dash-004-playwright.log`.
- Documentation changes: Repository tracking artifacts now explicitly record `dash-004` as passing and move the roadmap focus forward to `dash-005`.

## Broken Or Unverified

- Unverified path: Later per-feature verification files in `feature_list.json` remain unstarted until their features become active.
- Risk for the next session: `yfinance` is still an unofficial Yahoo wrapper, so upstream field names and field availability can drift. The new key-metrics section also hides unavailable live values instead of inventing placeholders, so live tickers can still render fewer cards than the fixtures when Yahoo omits a metric.
- Ongoing work note: `dash-004` is verified. Resume the roadmap at `dash-005` unless the user asks for another narrow dashboard exception update.
- Working tree note: User-owned changes still exist in `AGENTS.md` and `.claude/`; they were intentionally left untouched while recording the `dash-004` completion evidence.

## Next Best Step

- Highest-priority unfinished feature: `dash-005`
- Why it is next: `dash-004` is now passing, so the roadmap advances to the first charting feature that depends on the newly verified financial-metrics slice.
- What counts as passing: The dashboard shows a waterfall chart that starts at revenue, walks through major expense lines, ends at net income, and `cd frontend && npx playwright test e2e/dash-005.spec.ts` passes with evidence recorded.
- What must not change during that step: Preserve the `/dashboard/[ticker]` route plus the `dash-001` through `dash-004` contracts, keep the backend-for-frontend workspace path deterministic in fixture mode, preserve the valuation-focused Yahoo snapshot and new key-metrics contract, and avoid jumping ahead into later trend-chart or valuation-calculator work before the waterfall slice is stable.

## Commands

- Startup: `./init.sh`
- Verification: `./init.sh` for baseline; `feature_list.json -> features[*].verification.command` for feature passing
- Focused debug command: `cd frontend && npx playwright test e2e/dash-005.spec.ts`
