# Session Handoff

## Verified Now

- What is currently working: The repo boots with `./init.sh`, the landing page accepts a ticker, `/dashboard/[ticker]` loads company identity plus key stats, the valuation-focused Yahoo snapshot remains intact, the market-context section still renders normalized `1Y` / `5Y` comparison ranges, and the dashboard still presents the revenue mix and waterfall together inside one `Income Statement Bridge` card. Within that shared card, `Revenue breakdown by segments` renders first and `Revenue to profits waterfall bridge` renders second. The segment view uses a donut-style pie chart with the total in the center plus a color-matched legend. The backend now loads `backend/.env` at startup and uses `FVS_FMP_API_KEY` to call Financial Modeling Prep's stable revenue product segmentation endpoint for live segment data. A direct live FMP check for `AAPL` now returns a real breakdown with `iPhone`, `Services`, `Wearables, Home and Accessories`, `Mac`, and `iPad`, totaling `$391.0B`. For supported fixture tickers, the service still falls back to curated fixture segment data when live segment detail is unavailable. The `dash-004` waterfall still follows the requested statement order: `Revenue`, `Cost of Revenue`, `Gross Profit`, `Operating Expenses`, `Operating Profit`, `Others`, `Taxes`, and `Net Profits`; the longer x-axis labels still wrap onto two lines when needed; the dotted bridge still connects every adjacent bar using the correct entry and exit edge; `Others` is still the residual balancing bucket; the dedicated zero baseline line is still absent; and the y-axis still uses a zero-anchored step size equal to one-fifth of the full chart span, labeling each step on the left until both the positive and negative ranges are covered, including `0`. Backend tests and the `dash-005` Playwright gate pass, and `dash-001` through `dash-005` remain recorded as passing.
- What verification actually ran: `cd backend && .venv/Scripts/python.exe -m pytest tests/test_company_workspace.py -q`; `cd frontend && npx playwright test e2e/dash-005.spec.ts`; direct outside-sandbox FMP client check for `AAPL`

## Changed This Session

- Code or behavior added: Added a real FMP-backed revenue-segmentation client under `backend/app/clients/financial_modeling_prep.py` and wired the company workspace service to prefer that live segment data before falling back to fixtures. The client now uses FMP's stable endpoint rather than the deprecated legacy endpoint and picks the annual row whose total is closest to the current company revenue anchor.
- Infrastructure or harness changes: Refreshed the passing `dash-005` Playwright log at `artifacts/verification/dash-005-playwright.log` and added backend tests covering the stable FMP parser plus service preference order.
- Documentation changes: Updated `feature_list.json`, `progress.md`, and this handoff to reflect that live segment data is now wired through FMP via implementation commit `a40305c` while leaving `dash-006` as the next roadmap slice.

## Broken Or Unverified

- Unverified path: Later per-feature verification files in `feature_list.json` remain unstarted until their features become active.
- Risk for the next session: `yfinance` is still an unofficial Yahoo wrapper, so upstream field names and field availability can drift. The full live workspace route still depends on Yahoo for the broader company snapshot, so a network or provider failure there can still prevent the dashboard from reaching the now-working FMP segment fetch. The pie-chart palette is currently sized for the current supported segment counts, and `backend/.env` remains local-only and ignored by git.
- Ongoing work note: `dash-005` is complete. Resume roadmap work at `dash-006` unless the user asks for another narrow dashboard exception update first.
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
