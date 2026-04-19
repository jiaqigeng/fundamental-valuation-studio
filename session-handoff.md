# Session Handoff

## Verified Now

- What is currently working: The repo boots with `./init.sh`, the landing page accepts a ticker, `/dashboard/[ticker]` loads company identity plus key stats, the quote snapshot now formats forward dividend and yield without the 100x inflation bug, the last dashboard section renders a normalized comparison chart for the company, the S&P 500, and the sector benchmark, and users can switch that section between `1Y` and `5Y` when the range data is available. The market-context cards now show percentage performance for the selected range instead of one-day change text. The latest safe UI pass also removes the hero tagline, moves `Search another ticker` into the hero header, removes the `Company Overview` eyebrow so the hero card only shows the company name, renames the overview accordion to `Business summary and key stats`, keeps the chart dates inside the frame edges, adds breathing room under the selected-range status line, removes the `At a glance` wording, and tones down the company-name hero size to a more professional scale. Backend health-check and workspace tests pass, and `dash-001`, `dash-002`, `dash-002b`, and `dash-003` remain recorded as passing.
- What verification actually ran: `./init.sh`; `cd backend && .venv/Scripts/python.exe -m pytest -q`; `cd frontend && npm run lint`; `cd frontend && npm run typecheck`; `cd frontend && npx playwright test e2e/dash-002b.spec.ts e2e/dash-003.spec.ts`

## Changed This Session

- Code or behavior added: Corrected the `yfinance` forward-dividend formatter so yields are no longer inflated by 100x, extended the workspace payload with normalized recent-history series, replaced the last dashboard section with a chart that starts the company, S&P 500, and sector benchmark at the same baseline, continued the dashboard polish pass by removing the hero tagline, moving the search action into the hero header, simplifying the overview section title, renaming `At a glance` to `Overview`, reducing the dashboard company-title scale with a dedicated style, adding a selectable `1Y` / `5Y` time range to the comparison section when longer history is available, removing the hero eyebrow, renaming the overview accordion to `Business summary and key stats`, keeping the chart edge dates inside the frame, and replacing the market-context cards' one-day move text with selected-range percentage returns.
- Infrastructure or harness changes: Extended backend pytest coverage with a forward-dividend formatting assertion plus fixture assertions for both chart ranges, and updated the affected Playwright specs for `dash-002`, `dash-002b`, and `dash-003` so the regression checks match the current hero/overview layout, the market-context selector, and the selected-range percentage cards.
- Documentation changes: Repository tracking artifacts now explicitly record that this user-requested dashboard exception update is verified and that `dash-004` is the next unfinished roadmap feature to resume.

## Broken Or Unverified

- Unverified path: Later per-feature verification files in `feature_list.json` remain unstarted until their features become active.
- Risk for the next session: `yfinance` is still an unofficial Yahoo wrapper, so upstream field names and recent-history availability can drift even though the current live checks succeeded after the provider swap. The new `5Y` selector depends on longer history being available for all three plotted symbols.
- Ongoing work note: The current requested dashboard layout/copy and market-context polish changes are verified. Resume `dash-004` next unless the user asks for another narrow dashboard exception update.
- Working tree note: User-owned changes still exist in `AGENTS.md` and `.claude/`; they were intentionally left untouched while recording this exception update.

## Next Best Step

- Highest-priority unfinished feature: `dash-004`
- Why it is next: `dash-003` is now recorded as passing, and the latest requested dashboard polish update is also verified, so the roadmap can move back to the first financial-metrics slice that depends on the live workspace path.
- What counts as passing: The selected company workspace shows revenue, EPS, free cash flow, gross and operating margins, and ROIC or ROE, and `cd frontend && npx playwright test e2e/dash-004.spec.ts` passes with evidence recorded.
- What must not change during that step: First continue from the latest safe dashboard polish state if the user wants more UX/copy changes, then preserve the `/dashboard/[ticker]` route plus the `dash-001` through `dash-003` contracts, keep the backend-for-frontend workspace path deterministic in fixture mode, and avoid jumping ahead into chart work before the key metrics slice is stable.

## Commands

- Startup: `./init.sh`
- Verification: `./init.sh` for baseline; `feature_list.json -> features[*].verification.command` for feature passing
- Focused debug command: `cd frontend && npx playwright test e2e/dash-004.spec.ts`
