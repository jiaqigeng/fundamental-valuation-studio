# Session Handoff

## Verified Now

- What is currently working: The repo boots with `./init.sh`, the landing page accepts a ticker, validates it inline, and keeps invalid user-entered tickers on `/` with a clear message instead of routing to a 404 page. The landing page no longer shows demo ticker shortcuts; it now explains the dashboard, valuation, and AI-analysis parts of the project, and it includes a direct button to `/valuation`. `/valuation` is now a real calculator workspace: it shows a calculator lineup, featured ticker chips, and a live DCF panel that preloads baseline assumptions for `AAPL`, `MSFT`, and `KO`, lets the user override growth, margin, WACC, terminal growth, and model settings, and recomputes intrinsic value plus projected cash flows in place. The backend now exposes both `GET /valuations/dcf/{ticker}/baseline` and `POST /valuations/dcf` for that flow. `/dashboard/[ticker]` still loads company identity plus key stats, the valuation-focused Yahoo snapshot remains intact, the market-context section still renders normalized `1Y` / `5Y` comparison ranges, and the shared `Income Statement Bridge` card still renders the segment pie ahead of the waterfall when real annual segment data exists. `dash-001` through `dash-005`, `val-001a`, and `val-001b` are recorded as passing.
- What verification actually ran: `./init.sh`; `cd backend && .venv/Scripts/python.exe -m pytest -q`; `cd frontend && npm run lint`; `cd frontend && npm run typecheck`; `cd frontend && npx playwright test e2e/val-001b.spec.ts`

## Changed This Session

- Code or behavior added: Replaced the valuation placeholder with a real DCF calculator workspace, added a backend baseline endpoint for company-derived assumptions, added a local frontend proxy for DCF recalculation, and added the `val-001b` Playwright contract.
- Infrastructure or harness changes: Captured the passing feature log at `artifacts/verification/val-001b-playwright.log`, and further de-prioritized `dash-006` so the roadmap continues through valuation instead of optional dashboard work.
- Documentation changes: Updated `backend/ARCHITECTURE.md`, `docs/backend.md`, `docs/frontend.md`, `frontend/ARCHITECTURE.md`, `feature_list.json`, `progress.md`, and this handoff to reflect the live DCF calculator path and the new baseline endpoint.

## Broken Or Unverified

- Unverified path: Later per-feature verification files in `feature_list.json` remain unstarted until their features become active.
- Risk for the next session: The live DCF baseline derivation is still heuristic-heavy. Revenue growth uses the latest annual comparison when available, WACC uses a beta-based estimate, and sales-to-capital remains sector-based until richer reinvestment history is wired in. The calculator lineup is visible, but only the DCF card is interactive so far. Separately, the live dashboard path still depends on unofficial Yahoo and FMP providers, so upstream field drift or outages can still remove sections from `/dashboard/[ticker]`.
- Ongoing work note: The user explicitly said the dashboard is already good enough and `dash-006` is no longer needed right now. That feature remains intentionally de-prioritized in `feature_list.json`, and the roadmap should now continue at `val-002`.
- Working tree note: User-owned changes still exist in `AGENTS.md` and `.claude/`; they were intentionally left untouched.

## Next Best Step

- Highest-priority unfinished feature: `val-002`
- Why it is next: The first calculator UI is now live, so the next roadmap step is extending the visible valuation lineup into the dividend discount model for dividend-paying companies.
- What counts as passing: The DDM calculator works for a dividend payer like `KO`, handles non-payers gracefully, and `cd frontend && npx playwright test e2e/val-002.spec.ts` passes with evidence recorded.
- What must not change during that step: Preserve the passing `val-001a` and `val-001b` DCF contracts, keep the `/valuation` workspace usable, and avoid reopening `dash-006` unless the user explicitly asks for it.

## Commands

- Startup: `./init.sh`
- Verification: `./init.sh` for baseline; `feature_list.json -> features[*].verification.command` for feature passing
- Focused debug command: `cd frontend && npx playwright test e2e/val-002.spec.ts`
