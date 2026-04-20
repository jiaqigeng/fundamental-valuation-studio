# Session Handoff

## Verified Now

- What is currently working: The repo boots with `./init.sh`, the landing page accepts a ticker, validates it inline, and keeps invalid user-entered tickers on `/` with a clear message instead of routing to a 404 page. The landing page no longer shows demo ticker shortcuts; it now explains the dashboard, valuation, and AI-analysis parts of the project. `/dashboard/[ticker]` still loads company identity plus key stats, the valuation-focused Yahoo snapshot remains intact, the market-context section still renders normalized `1Y` / `5Y` comparison ranges, and the shared `Income Statement Bridge` card still renders the segment pie ahead of the waterfall when real annual segment data exists. The pie chart is intentionally annual-only, while the waterfall alone can switch between `Year` and `Quarter` in the live path when Yahoo exposes real quarterly statement data, and that toggle sits in the waterfall subsection's top-right header corner. Both subsections show explicit period labels plus exact date ranges to avoid ambiguity. In fixture mode, the supported dashboard tickers stay annual-only; in the live path, quarter appears whenever Yahoo yields a usable quarter waterfall, without any quarter fixture fallback, and the annual pie is now omitted when FMP does not return a usable segment mix instead of falling back to hard-coded live segment data. The `dash-004` waterfall still follows the requested statement order: `Revenue`, `Cost of Revenue`, `Gross Profit`, `Operating Expenses`, `Operating Profit`, `Others`, `Taxes`, and `Net Profits`; the longer x-axis labels still wrap onto two lines when needed; the dotted bridge still connects every adjacent bar using the correct entry and exit edge; `Others` is still the residual balancing bucket; the dedicated zero baseline line is still absent; and the y-axis still uses a zero-anchored step size equal to one-fifth of the full chart span, labeling each step on the left until both the positive and negative ranges are covered, including `0`. Backend tests plus the updated `dash-001` and `dash-005` Playwright gates pass, and `dash-001` through `dash-005` remain recorded as passing.
- What verification actually ran: `./init.sh`; `cd frontend && npx playwright test e2e/dash-001.spec.ts`; `cd frontend && npx playwright test e2e/dash-005.spec.ts`

## Changed This Session

- Code or behavior added: Removed the live hardcoded annual segment fallback so no real FMP segment data now means no pie chart, removed the frontend seed fallback path, added inline ticker validation to the landing-page search flow, and replaced the old demo ticker block with project-overview copy.
- Infrastructure or harness changes: Added `frontend/src/app/api/companies/[ticker]/validate/route.ts`, refreshed `artifacts/verification/dash-001-playwright.log` and `artifacts/verification/dash-005-playwright.log`, and updated the repo artifacts around the new search and no-hardcoded-fallback behavior via implementation commit `9bd535b`.
- Documentation changes: Updated `docs/frontend.md`, `frontend/ARCHITECTURE.md`, `feature_list.json`, `progress.md`, and this handoff to reflect the removed seed fallback path and the new validation flow while leaving `dash-006` as the next roadmap slice.

## Broken Or Unverified

- Unverified path: Later per-feature verification files in `feature_list.json` remain unstarted until their features become active.
- Risk for the next session: `yfinance` is still an unofficial Yahoo wrapper, so upstream field names and field availability can drift. The full live workspace route still depends on Yahoo for the broader company snapshot, so a network or provider failure there can still prevent the dashboard from loading at all. Annual segment detail still depends on FMP, quarter waterfall visibility depends on Yahoo quarter statement availability, and the displayed date ranges are inferred from consecutive statement end dates. Direct navigation to an invalid `/dashboard/[ticker]` URL still uses the route-level not-found path; only the search-form flow was changed this session. The product-vs-geography selector remains heuristic-based, the pie-chart palette is currently sized for the current supported segment counts, and `backend/.env` remains local-only and ignored by git.
- Ongoing work note: This was a narrow `dash-001` / `dash-005` exception update on top of the passing dashboard slices. Resume roadmap work at `dash-006` unless the user asks for another focused dashboard refinement first.
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
