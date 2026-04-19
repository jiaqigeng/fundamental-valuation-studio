# Session Handoff

## Verified Now

- What is currently working: The repo boots with `./init.sh`, the landing page accepts a ticker, `/dashboard/[ticker]` loads company identity plus key stats, the Yahoo snapshot now shows a valuation-focused field set instead of trading-tape fields, and it omits any metric that Yahoo does not provide directly or via a straightforward ratio calculation. The live snapshot now targets trailing and forward P/E, price to book, EV multiples, PEG, ROE, ROA, profit and operating margins, debt to equity, beta, free cash flow, earnings date, and ex-dividend date only. The last dashboard section still renders a normalized comparison chart for the company, the S&P 500, and the sector benchmark, users can switch that section between `1Y` and `5Y` when the range data is available, negative selected-range performance is rendered in red, the selected-range percentage ends on the same current quote shown on each card, and the baseline for `1Y` / `5Y` is anchored to the quote nearest exactly one year or five years ago from today. Backend health-check and workspace tests pass, and `dash-001`, `dash-002`, `dash-002b`, and `dash-003` remain recorded as passing.
- What verification actually ran: `cd backend && .venv/Scripts/python.exe -m pytest tests/test_company_workspace.py -q`; `cd frontend && npm run lint`; `cd frontend && npm run typecheck`; `cd frontend && npx playwright test e2e/dash-002b.spec.ts`

## Changed This Session

- Code or behavior added: Replaced the hard-coded Yahoo snapshot detail list with a valuation-focused builder that only emits fields Yahoo provides directly or via straightforward ratio math from Yahoo values. The snapshot now prefers trailing and forward P/E, price to book, EV / EBITDA, EV / Revenue, PEG, ROE, ROA, profit margin, operating margin, debt to equity, beta, free cash flow, earnings date, and ex-dividend date, while dropping previous close, open, bid, ask, day range, 52-week range, volume, the dividend-yield row, and the separate dividend payment-date row. The dashboard copy now labels this section as `Valuation-relevant market details`.
- Infrastructure or harness changes: Fixture-mode workspace data and backend pytest coverage were updated to match the new snapshot contract, including an omission test that confirms missing Yahoo metrics do not render placeholder rows. The `dash-002b` Playwright spec now verifies the new field list and asserts that the removed trading-screen fields are absent.
- Documentation changes: Repository tracking artifacts now explicitly record this verified snapshot-contract refinement and that `dash-004` remains the next unfinished roadmap feature.

## Broken Or Unverified

- Unverified path: Later per-feature verification files in `feature_list.json` remain unstarted until their features become active.
- Risk for the next session: `yfinance` is still an unofficial Yahoo wrapper, so upstream field names and field availability can drift. The snapshot now intentionally hides unavailable values instead of showing `N/A`, so the number of rendered quote-detail cards may vary across live tickers.
- Ongoing work note: This user-requested snapshot refinement is verified. Resume `dash-004` next unless the user asks for another narrow dashboard exception update.
- Working tree note: User-owned changes still exist in `AGENTS.md` and `.claude/`; they were intentionally left untouched while recording this exception update.

## Next Best Step

- Highest-priority unfinished feature: `dash-004`
- Why it is next: The latest requested Yahoo snapshot refinement is verified, so the roadmap can move back to the first dedicated financial-metrics slice that depends on the live workspace path.
- What counts as passing: The selected company workspace shows revenue, EPS, free cash flow, gross and operating margins, and ROIC or ROE, and `cd frontend && npx playwright test e2e/dash-004.spec.ts` passes with evidence recorded.
- What must not change during that step: Preserve the `/dashboard/[ticker]` route plus the `dash-001` through `dash-003` contracts, keep the backend-for-frontend workspace path deterministic in fixture mode, preserve the new valuation-focused Yahoo snapshot contract, and avoid jumping ahead into chart work before the key metrics slice is stable.

## Commands

- Startup: `./init.sh`
- Verification: `./init.sh` for baseline; `feature_list.json -> features[*].verification.command` for feature passing
- Focused debug command: `cd frontend && npx playwright test e2e/dash-004.spec.ts`
