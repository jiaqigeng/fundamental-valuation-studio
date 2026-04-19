# Session Handoff

## Verified Now

- What is currently working: The repo boots with `./init.sh`, the landing page accepts a ticker, `/dashboard/[ticker]` loads company identity plus key stats, the valuation-focused Yahoo snapshot remains intact, the market-context section still renders normalized `1Y` / `5Y` comparison ranges, and the dashboard still shows the dedicated `dash-004` waterfall section. That waterfall still follows the requested statement order: `Revenue`, `Cost of Revenue`, `Gross Profit`, `Operating Expenses`, `Operating Profit`, `Other Income / Cost`, `Taxes`, and `Net Profits`; the longer x-axis labels still wrap onto two lines; the dotted bridge still connects every adjacent bar using the correct entry and exit edge; `Other Income / Cost` is still the residual balancing bucket; the dotted zero baseline line is back with the same visual treatment as the other dotted chart lines and renders above the bars so it stays visible; and the y-axis now uses a zero-anchored step size equal to one-fifth of the full chart span, labeling each step on the left until both the positive and negative ranges are covered. Backend workspace tests pass, and `dash-001` through `dash-004` remain recorded as passing.
- What verification actually ran: `./init.sh`; `cd frontend && npm run lint`; `cd frontend && npm run typecheck`; `cd frontend && npx playwright test e2e/dash-004.spec.ts`

## Changed This Session

- Code or behavior added: Refined the `dash-004` y-axis so it now derives a step from the full chart span divided by five, then labels every step above and below zero on the left axis while keeping the dotted zero baseline visible above the bars.
- Infrastructure or harness changes: Refreshed the passing Playwright log at `artifacts/verification/dash-004-playwright.log`; the first test attempt was blocked by a stale local `next dev` process on PID `93416`, and the rerun passed after that process was terminated.
- Documentation changes: `feature_list.json`, `progress.md`, and this handoff now point `dash-004` evidence at the zero-anchored axis-step refinement while keeping `dash-005` as the next roadmap slice.

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
