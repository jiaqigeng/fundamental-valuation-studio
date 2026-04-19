# Session Handoff

## Verified Now

- What is currently working: The repo boots with `./init.sh`, the landing page accepts a ticker, `/dashboard/[ticker]` loads company identity plus key stats, the valuation-focused Yahoo snapshot remains intact, the market-context section still renders normalized `1Y` / `5Y` comparison ranges, and the dashboard now also shows a dedicated revenue-to-net-income waterfall section. In fixture mode, that new chart walks through revenue, COGS, OpEx, interest, other items, tax, and net income for `AAPL`, `MSFT`, and `KO`, and the backend live path now attempts to derive the same walk from the latest available `yfinance` income-statement rows. Backend workspace tests pass, and `dash-001` through `dash-004` are now recorded as passing.
- What verification actually ran: `./init.sh`; `cd backend && .venv/Scripts/python.exe -m pytest tests/test_company_workspace.py -q`; `cd frontend && npm run lint`; `cd frontend && npm run typecheck`; `cd frontend && npx playwright test e2e/dash-004.spec.ts`

## Changed This Session

- Code or behavior added: Added an income-statement waterfall payload to the backend workspace response, seeded fixture data for `AAPL`, `MSFT`, and `KO`, a live `yfinance` derivation path from the latest income statement, and a new dashboard chart section that walks from revenue to net income with matching step cards.
- Infrastructure or harness changes: Replaced the deleted old `frontend/e2e/dash-004.spec.ts` with the new waterfall-chart contract and captured a passing Playwright log at `artifacts/verification/dash-004-playwright.log`.
- Documentation changes: `feature_list.json`, `progress.md`, and this handoff now record `dash-004` as passing and point the next session at `dash-005`.

## Broken Or Unverified

- Unverified path: Later per-feature verification files in `feature_list.json` remain unstarted until their features become active.
- Risk for the next session: `yfinance` is still an unofficial Yahoo wrapper, so upstream field names and field availability can drift. The new waterfall builder is best-effort for live tickers and may show zeroed intermediate bars or hide the section if Yahoo omits critical statement rows.
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
