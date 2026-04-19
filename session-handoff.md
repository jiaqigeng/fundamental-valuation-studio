# Session Handoff

## Verified Now

- What is currently working: The repo boots with `./init.sh`, the landing page accepts a ticker, `/dashboard/[ticker]` loads company identity plus key stats, the valuation-focused Yahoo snapshot remains intact, the market-context section still renders normalized `1Y` / `5Y` comparison ranges, the dashboard still shows the dedicated `dash-004` waterfall section, and the new `dash-005` revenue mix section is now live for the fixture-backed dashboard tickers. That segment section reconciles reported segment rows to total revenue, shows multi-segment mixes for `AAPL` and `MSFT`, and handles the single-segment `KO` case as one 100% bucket. The `dash-004` waterfall still follows the requested statement order: `Revenue`, `Cost of Revenue`, `Gross Profit`, `Operating Expenses`, `Operating Profit`, `Others`, `Taxes`, and `Net Profits`; the longer x-axis labels still wrap onto two lines when needed; the dotted bridge still connects every adjacent bar using the correct entry and exit edge; `Others` is still the residual balancing bucket; the dedicated zero baseline line is still absent; and the y-axis still uses a zero-anchored step size equal to one-fifth of the full chart span, labeling each step on the left until both the positive and negative ranges are covered, including `0`. Backend workspace tests pass, and `dash-001` through `dash-005` remain recorded as passing.
- What verification actually ran: `./init.sh`; `cd backend && .venv/Scripts/python.exe -m pytest tests/test_company_workspace.py -q`; `cd frontend && npm run lint`; `cd frontend && npm run typecheck`; `cd frontend && npx playwright test e2e/dash-005.spec.ts`

## Changed This Session

- Code or behavior added: Added a new revenue segment breakdown slice to the dashboard, backed by a `revenue_segment_breakdown` payload in the backend workspace contract. The fixture path now provides reconciled segment mixes for `AAPL`, `MSFT`, and a single-segment `KO` case, while the live Yahoo path gracefully omits the section when segment detail is unavailable.
- Infrastructure or harness changes: Added the new feature gate at `frontend/e2e/dash-005.spec.ts` and captured the passing log at `artifacts/verification/dash-005-playwright.log`.
- Documentation changes: `feature_list.json`, `progress.md`, and this handoff now record `dash-005` as passing and move the roadmap continuation point to `dash-006`.

## Broken Or Unverified

- Unverified path: Later per-feature verification files in `feature_list.json` remain unstarted until their features become active.
- Risk for the next session: `yfinance` is still an unofficial Yahoo wrapper, so upstream field names and field availability can drift. The waterfall remains best-effort for live tickers, and the new revenue segment section currently depends on fixture-backed segment data because the live provider path does not yet expose segment detail.
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
