# Session Handoff

## Verified Now

- What is currently working: The repo boots with `./init.sh`, the landing page accepts a ticker, `/dashboard/[ticker]` loads company identity plus key stats, the valuation-focused Yahoo snapshot remains intact, the market-context section still renders normalized `1Y` / `5Y` comparison ranges, and the dashboard still shows the dedicated `dash-004` waterfall section. That waterfall still follows the requested statement order: `Revenue`, `Cost of Revenue`, `Gross Profit`, `Operating Expenses`, `Operating Profit`, `Other Income / Cost`, `Taxes`, and `Net Profits`, and the longer x-axis labels now wrap onto two lines instead of colliding. In fixture mode, those values render deterministically for `AAPL`, `MSFT`, and `KO`, and the backend live path derives the same bridge from the latest available `yfinance` income-statement rows. Backend workspace tests pass, and `dash-001` through `dash-004` remain recorded as passing.
- What verification actually ran: `cd frontend && npm run lint`; `cd frontend && npm run typecheck`; `cd frontend && npx playwright test e2e/dash-004.spec.ts`

## Changed This Session

- Code or behavior added: Reverted the most recent `dash-004` bar-tone styling change, restoring the waterfall visuals to the prior label-wrap state while keeping the wrapped x-axis labels and current statement line-item order intact.
- Infrastructure or harness changes: Refreshed the passing Playwright log at `artifacts/verification/dash-004-playwright.log` after stopping a stale local `next dev` process that blocked Playwright from starting its own frontend server.
- Documentation changes: `feature_list.json`, `progress.md`, and this handoff now point `dash-004` evidence at the new revert commit while preserving the pre-change waterfall notes.

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
