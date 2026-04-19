# Session Handoff

## Verified Now

- What is currently working: The repo boots with `./init.sh`, the landing page accepts a ticker, `/dashboard/[ticker]` loads company identity plus key stats, the valuation-focused Yahoo snapshot remains intact, the market-context section still renders normalized `1Y` / `5Y` comparison ranges, and the dashboard still presents the revenue mix and waterfall together inside one `Income Statement Bridge` card. Within that shared card, `Revenue breakdown by segments` renders first and `Revenue to profits waterfall bridge` renders second. The segment view now uses a donut-style pie chart with the total in the center plus a color-matched legend. For `AAPL`, `MSFT`, and `KO`, the runtime still falls back to the fixture segment mix when the live Yahoo path omits segment detail, so the segment section is visible in normal local use for those supported tickers. The single-segment `KO` case renders as one full slice. The `dash-004` waterfall still follows the requested statement order: `Revenue`, `Cost of Revenue`, `Gross Profit`, `Operating Expenses`, `Operating Profit`, `Others`, `Taxes`, and `Net Profits`; the longer x-axis labels still wrap onto two lines when needed; the dotted bridge still connects every adjacent bar using the correct entry and exit edge; `Others` is still the residual balancing bucket; the dedicated zero baseline line is still absent; and the y-axis still uses a zero-anchored step size equal to one-fifth of the full chart span, labeling each step on the left until both the positive and negative ranges are covered, including `0`. Backend workspace tests from the prior refinement still pass, and `dash-001` through `dash-005` remain recorded as passing.
- What verification actually ran: `cd frontend && npm run lint`; `cd frontend && npm run typecheck`; `cd frontend && npx playwright test e2e/dash-005.spec.ts`

## Changed This Session

- Code or behavior added: Reworked the passing `dash-005` segment view from horizontal bars into a donut-style pie chart with a centered total and color-matched legend, while keeping it inside the same combined financial-bridge card ahead of the waterfall.
- Infrastructure or harness changes: Refreshed the passing `dash-005` Playwright log at `artifacts/verification/dash-005-playwright.log` after stopping a stray local `next dev` process that blocked the outside-sandbox run.
- Documentation changes: `feature_list.json`, `progress.md`, and this handoff now point `dash-005` evidence at the pie-chart refinement commit `de3bad1` while leaving `dash-006` as the next roadmap slice.

## Broken Or Unverified

- Unverified path: Later per-feature verification files in `feature_list.json` remain unstarted until their features become active.
- Risk for the next session: `yfinance` is still an unofficial Yahoo wrapper, so upstream field names and field availability can drift. The waterfall remains best-effort for live tickers, and the revenue segment section still depends on curated fixture-backed data for the supported fallback tickers because the live provider path does not yet expose segment detail. The pie-chart palette is currently sized for the current supported segment counts.
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
