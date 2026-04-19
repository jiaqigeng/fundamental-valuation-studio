# Session Handoff

## Verified Now

- What is currently working: The repo boots with `./init.sh`, the landing page accepts a ticker, `/dashboard/[ticker]` loads company identity plus key stats, the valuation-focused Yahoo snapshot remains intact, the market-context section still renders normalized `1Y` / `5Y` comparison ranges, and the dashboard still presents the revenue mix and waterfall together inside one `Income Statement Bridge` card. Within that shared card, `Revenue breakdown by segments` renders first and `Revenue to profits waterfall bridge` renders second. The segment view now uses a donut-style pie chart with the total in the center plus a color-matched legend. For `AAPL`, `MSFT`, and `KO`, the runtime still falls back to the fixture segment mix when the live Yahoo path omits segment detail, so the segment section is visible in normal local use for those supported tickers. The single-segment `KO` case renders as one full slice. The `dash-004` waterfall still follows the requested statement order: `Revenue`, `Cost of Revenue`, `Gross Profit`, `Operating Expenses`, `Operating Profit`, `Others`, `Taxes`, and `Net Profits`; the longer x-axis labels still wrap onto two lines when needed; the dotted bridge still connects every adjacent bar using the correct entry and exit edge; `Others` is still the residual balancing bucket; the dedicated zero baseline line is still absent; and the y-axis still uses a zero-anchored step size equal to one-fifth of the full chart span, labeling each step on the left until both the positive and negative ranges are covered, including `0`. The backend now also loads `backend/.env` at startup, and that is the local place to put `FVS_FMP_API_KEY` for the upcoming FMP integration. Backend tests still pass, and `dash-001` through `dash-005` remain recorded as passing.
- What verification actually ran: `cd backend && .venv/Scripts/python.exe -m pytest -q`

## Changed This Session

- Code or behavior added: Added backend startup loading for `backend/.env` so local secrets such as `FVS_FMP_API_KEY` can live in an ignored env file instead of only in the shell environment.
- Infrastructure or harness changes: Added `python-dotenv` as an explicit backend dependency and created a local ignored `backend/.env` file with `FVS_FMP_API_KEY=` ready for the user to fill in.
- Documentation changes: Updated `docs/backend.md`, `progress.md`, and this handoff to note that `backend/.env` is now the local config path for the FMP key while leaving `dash-006` as the next roadmap slice.

## Broken Or Unverified

- Unverified path: Later per-feature verification files in `feature_list.json` remain unstarted until their features become active.
- Risk for the next session: `yfinance` is still an unofficial Yahoo wrapper, so upstream field names and field availability can drift. The waterfall remains best-effort for live tickers, and the revenue segment section still depends on curated fixture-backed data for the supported fallback tickers because the live provider path does not yet expose segment detail. The pie-chart palette is currently sized for the current supported segment counts. The new `backend/.env` file is local-only and ignored by git, so collaborators still need to create their own copy.
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
