# Session Handoff

## Verified Now

- What is currently working: The repo boots with `./init.sh`, the landing page accepts a ticker, validates it inline, and keeps invalid user-entered tickers on `/` with a clear message instead of routing to a 404 page. The landing page no longer shows demo ticker shortcuts; it now explains the dashboard, valuation, and AI-analysis parts of the project, and it includes a direct button to `/valuation`. `/valuation` is now a real calculator workspace with a live DCF panel that fetches company inputs from yfinance instead of using hardcoded valuation data: current free cash flow, shares outstanding, total debt, cash and cash equivalents, a 10-year Treasury proxy risk-free rate, beta, and current stock price. The user now enters short-term FCF growth, terminal growth, equity risk premium, and WACC or discount rate, sees a CAPM cost-of-equity reference, and can switch between 5-year and 10-year projection horizons while intrinsic value plus projected cash flows recompute in place. The backend still exposes both `GET /valuations/dcf/{ticker}/baseline` and `POST /valuations/dcf` for that flow. `/dashboard/[ticker]` still loads company identity plus key stats, the valuation-focused Yahoo snapshot remains intact, the market-context section still renders normalized `1Y` / `5Y` comparison ranges, and the shared `Income Statement Bridge` card still renders the segment pie ahead of the waterfall when real annual segment data exists. `dash-001` through `dash-005`, `val-001a`, and `val-001b` are recorded as passing.
- What verification actually ran: `./init.sh`; `cd backend && .venv/Scripts/python.exe -m pytest tests/test_val_001a.py -q`; `cd backend && .venv/Scripts/python.exe -m pytest tests/test_company_workspace.py -q`; `cd frontend && npm.cmd run lint`; `cd frontend && npm.cmd run typecheck`; `cd frontend && cmd /c npx playwright test e2e/val-001b.spec.ts`

## Changed This Session

- Code or behavior added: Replaced the old revenue-and-margin DCF contract with a direct FCF DCF contract, removed the hardcoded valuation baseline path from the app, taught the Yahoo client to fetch current free cash flow plus debt, cash, shares, beta, risk-free rate, and price, rewired the frontend DCF panel around those fetched company inputs, changed the user-editable assumptions to short-term FCF growth, terminal growth, equity risk premium, WACC or discount rate, and a 5-year or 10-year projection horizon, and then parallelized the stacked live dashboard fetches so Yahoo market-context, statement, and history requests plus the two FMP segment requests no longer run one by one.
- Infrastructure or harness changes: Refreshed `artifacts/verification/val-001a-pytest.log` and `artifacts/verification/val-001b-playwright.log`, and re-ran `./init.sh` after the refactor to confirm the baseline repo path is still healthy.
- Documentation changes: Updated `backend/ARCHITECTURE.md`, `docs/backend.md`, `docs/frontend.md`, `frontend/ARCHITECTURE.md`, `feature_list.json`, `progress.md`, and this handoff to reflect the live FCF DCF path and the new user-assumption contract.

## Broken Or Unverified

- Unverified path: Later per-feature verification files in `feature_list.json` remain unstarted until their features become active.
- Risk for the next session: The valuation app path no longer relies on hardcoded DCF data, but it now depends directly on live yfinance availability for the baseline fetch. The DCF math is intentionally a simple direct-FCF growth model, so it does not yet support staged growth curves, margin-led operating forecasts, or scenario persistence. The dashboard fetch path should be less blocked on stacked upstream calls now, but it still depends on unofficial Yahoo and FMP providers and still does live work on every request because there is not yet a backend workspace cache.
- Ongoing work note: The user explicitly said the dashboard is already good enough and `dash-006` is no longer needed right now. That feature remains intentionally de-prioritized in `feature_list.json`, and the roadmap should now continue at `val-002`.
- Working tree note: User-owned changes still exist in `AGENTS.md` and `.claude/`; they were intentionally left untouched.

## Next Best Step

- Highest-priority unfinished feature: `val-002`
- Why it is next: The DCF contract has now been tightened around live yfinance company inputs and user-entered assumptions, so the next roadmap step is extending the visible valuation lineup into the dividend discount model for dividend-paying companies without disturbing the new DCF flow.
- What counts as passing: The DDM calculator works for a dividend payer like `KO`, handles non-payers gracefully, and `cd frontend && npx playwright test e2e/val-002.spec.ts` passes with evidence recorded.
- What must not change during that step: Preserve the passing `val-001a` and `val-001b` DCF contracts, keep the `/valuation` workspace usable, and avoid reopening `dash-006` unless the user explicitly asks for it.

## Commands

- Startup: `./init.sh`
- Verification: `./init.sh` for baseline; `feature_list.json -> features[*].verification.command` for feature passing
- Focused debug command: `cd frontend && npx playwright test e2e/val-002.spec.ts`
