# Progress Log

## Current Verified State

- Repository root: `c:\Users\gengj\source\repos\FundamentalValuationStudio`
- Standard startup path: `./init.sh`
- Standard verification path: `./init.sh` for baseline health plus `feature_list.json -> features[*].verification.command` for feature passing
- Current highest-priority unfinished feature: `dash-005`
- Current blocker: none recorded. `dash-005` remains the next roadmap item, and a user-requested `dash-004` exception refinement now keeps the dotted waterfall connector attached to each bar's true entry and exit edge.

## Session Log

### Session 001

- Date: 2026-04-18
- Goal: Establish the repository harness, scaffold the frontend and backend, and verify the standard startup path.
- Completed: Created the repo-level harness files, initialized Git and GitHub sync, created `frontend/` and `backend/`, created `backend/.venv`, scaffolded the Next.js frontend, scaffolded a minimal FastAPI backend, added a health-check test, added Playwright e2e scaffolding for `dash-001`, and tightened `AGENTS.md` and `init.sh` around baseline versus feature-level verification.
- Verification run: `./init.sh`, `cd frontend && npm run typecheck`, `cd backend && ./.venv/Scripts/python.exe -m pytest -q`
- Evidence captured: `./init.sh` completed successfully; backend `./.venv/Scripts/python.exe -m pytest -q` passed with `1 passed`; frontend `npm run lint` passed; frontend `npm run typecheck` passed; `frontend/e2e/dash-001.spec.ts` now exists as the first feature-level verification target.
- Commits: `d0889ac Initialize project workflow artifacts`; `e67b394 Add repository metadata`; `2d7a1d2 Merge remote main`
- Files or artifacts updated: `AGENTS.md`, `.gitignore`, `init.sh`, `feature_list.json`, `progress.md`, `frontend/`, `backend/`
- Known risk or unresolved issue: Topic-doc files are still placeholders, `dash-001` is not implemented yet, and most later feature-level verification files declared in `feature_list.json` still need to be created when those features become active.
- Next best step: Mark `dash-001` as `in_progress` and build the first vertical slice for ticker search and company selection using `frontend/e2e/dash-001.spec.ts` as the passing contract.

### Session 002

- Date: 2026-04-18
- Goal: Implement `dash-001` under the repository harness and record passing evidence.
- Completed: Replaced the scaffolded frontend landing page with a ticker-search experience, added a dashboard workspace route at `frontend/src/app/dashboard/[ticker]/page.tsx`, added a seeded company directory and client search form, updated Playwright to auto-start the Next.js dev server, installed the required Playwright Chromium browser, and captured a passing verification log.
- Verification run: `./init.sh`; `cd frontend && npm run lint`; `cd frontend && npm run typecheck`; `cd frontend && npx playwright test e2e/dash-001.spec.ts`
- Evidence captured: `cd frontend && npx playwright test e2e/dash-001.spec.ts` passed; log saved at `artifacts/verification/dash-001-playwright.log`; implementation commit is `1fba98d`; post-change `./init.sh` completed successfully.
- Commits: `1fba98d Implement dash-001 ticker search workspace`
- Files or artifacts updated: `feature_list.json`, `progress.md`, `session-handoff.md`, `artifacts/verification/dash-001-playwright.log`, `frontend/playwright.config.ts`, `frontend/src/app/layout.tsx`, `frontend/src/app/page.tsx`, `frontend/src/app/globals.css`, `frontend/src/app/_components/ticker-search-form.tsx`, `frontend/src/app/_lib/company-directory.ts`, `frontend/src/app/dashboard/[ticker]/page.tsx`
- Known risk or unresolved issue: The initial workspace is intentionally seeded with demo company data for `AAPL`, `MSFT`, and `KO`; later dashboard features still need real market and company data sources.
- Next best step: Start `dash-002` and use the new `/dashboard/[ticker]` route to render company identity and key stats for the selected company.

### Session 003

- Date: 2026-04-18
- Goal: Clarify the new topic and architecture docs so each has a distinct role without overlapping guidance.
- Completed: Tightened `docs/frontend.md` and `docs/backend.md` into workflow-oriented topic docs, and tightened `frontend/ARCHITECTURE.md` and `backend/ARCHITECTURE.md` into structure-oriented architecture docs. Added explicit scope boundaries in each file so commands and verification stay in `docs/`, while code ownership and layering stay in the architecture files.
- Verification run: `./init.sh`
- Evidence captured: `./init.sh` completed successfully after the doc changes; no feature status changed and `dash-002` remains the highest-priority unfinished feature.
- Commits: none yet
- Files or artifacts updated: `docs/frontend.md`, `docs/backend.md`, `frontend/ARCHITECTURE.md`, `backend/ARCHITECTURE.md`, `progress.md`, `session-handoff.md`
- Known risk or unresolved issue: `AGENTS.md` and `.claude/` contain user changes that were intentionally left untouched; the docs now reference those files but do not supersede them.
- Next best step: Resume feature work with `dash-002`; use the clarified docs to keep workflow guidance in `docs/` and placement guidance in `*/ARCHITECTURE.md`.

### Session 004

- Date: 2026-04-18
- Goal: Implement `dash-002` under the repository harness and record passing evidence.
- Completed: Expanded the seeded company directory with sector, price, market cap, and summary fields; replaced the placeholder dashboard panel with a company overview card plus key-stats cards on `/dashboard/[ticker]`; added `frontend/e2e/dash-002.spec.ts`; and captured the passing Playwright log.
- Verification run: `./init.sh`; `cd frontend && npm run lint`; `cd frontend && npm run typecheck`; `cd frontend && npx playwright test e2e/dash-002.spec.ts`
- Evidence captured: `./init.sh` completed successfully before the feature work; frontend `npm run lint` passed; frontend `npm run typecheck` passed; `cd frontend && npx playwright test e2e/dash-002.spec.ts` passed after rerunning outside the sandbox to avoid a local `spawn EPERM`; log saved at `artifacts/verification/dash-002-playwright.log`; implementation commit is `fc67226`.
- Commits: `fc67226 Implement dash-002 company overview card`
- Files or artifacts updated: `frontend/src/app/_lib/company-directory.ts`, `frontend/src/app/dashboard/[ticker]/page.tsx`, `frontend/src/app/globals.css`, `frontend/e2e/dash-002.spec.ts`, `artifacts/verification/dash-002-playwright.log`, `feature_list.json`, `progress.md`, `session-handoff.md`
- Known risk or unresolved issue: The overview card still uses seeded demo values rather than live market data, so later dashboard slices should treat the overview fields as temporary scaffolding.
- Next best step: Start `dash-003` and add seeded market plus industry context indices that respond to the selected company's sector without disturbing the `dash-001` and `dash-002` contracts.

### Session 005

- Date: 2026-04-18
- Goal: Insert and implement a real-data dashboard feature ahead of `dash-003` so the workspace can show a Yahoo Finance quote snapshot.
- Completed: Added a new roadmap feature `dash-002b` as a justified user-requested exception ahead of `dash-003`; split the backend into routers, schemas, services, and clients for the first external-data path; added a company workspace endpoint at `/companies/{ticker}/workspace`; implemented a Yahoo Finance runtime client plus fixture mode for deterministic tests; updated the frontend dashboard route to consume backend workspace data with seed fallback; added the quote-snapshot UI and the `frontend/e2e/dash-002b.spec.ts` contract; and refreshed the frontend/backend docs to match the new data path.
- Verification run: `./init.sh`; `cd backend && .venv/Scripts/python.exe -m pytest -q`; `cd frontend && npm run lint`; `cd frontend && npm run typecheck`; `cd frontend && npx playwright test e2e/dash-002b.spec.ts`
- Evidence captured: `./init.sh` completed successfully before the feature work; backend `cd backend && .venv/Scripts/python.exe -m pytest -q` passed with `3 passed`; frontend `npm run lint` passed; frontend `npm run typecheck` passed; `cd frontend && npx playwright test e2e/dash-002b.spec.ts` passed after rerunning outside the sandbox to avoid a local `spawn EPERM`; log saved at `artifacts/verification/dash-002b-playwright.log`; implementation commit is `7f8854d`. As an extra regression check, `cd frontend && npx playwright test e2e/dash-002.spec.ts` also passed.
- Commits: `7f8854d Implement dash-002b Yahoo workspace snapshot`
- Files or artifacts updated: `backend/app/main.py`, `backend/app/clients/`, `backend/app/routers/`, `backend/app/schemas/`, `backend/app/services/`, `backend/tests/test_company_workspace.py`, `frontend/src/app/_lib/company-workspace.ts`, `frontend/src/app/dashboard/[ticker]/page.tsx`, `frontend/src/app/globals.css`, `frontend/playwright.config.ts`, `frontend/e2e/dash-002b.spec.ts`, `artifacts/verification/dash-002b-playwright.log`, `feature_list.json`, `docs/frontend.md`, `docs/backend.md`, `frontend/ARCHITECTURE.md`, `backend/ARCHITECTURE.md`
- Known risk or unresolved issue: The live runtime path depends on observed Yahoo Finance endpoints rather than an official supported public API, so upstream response-shape or access-policy changes remain a real risk; automated coverage mitigates this by running the backend in fixture mode.
- Next best step: Resume `dash-003` and build the market plus industry context layer on top of the new backend workspace data path rather than adding more seeded-only dashboard data.

### Session 006

- Date: 2026-04-18
- Goal: Record the live Yahoo Finance runtime problem in the repository artifacts for the next session.
- Completed: Confirmed that the current live backend path still fails for non-seeded tickers because Yahoo Finance is returning `401 / 401` from the quote and quoteSummary endpoints, then recorded that issue in `feature_list.json`, `progress.md`, and `session-handoff.md` without changing feature code.
- Verification run: none; this was a tracking-only handoff update driven by the observed runtime error response `{"detail":"Yahoo Finance returned 401 / 401 for ticker NVDA."}`.
- Evidence captured: Live request for `NVDA` returned `401 / 401` from the Yahoo-backed backend route; seeded fallback behavior still masks that failure for `AAPL`, `MSFT`, and `KO`.
- Commits: none yet
- Files or artifacts updated: `feature_list.json`, `progress.md`, `session-handoff.md`
- Known risk or unresolved issue: `dash-002b` remains recorded as passing because fixture-mode verification succeeded, but the live Yahoo path is currently blocked for non-seeded tickers until cookie/crumb/session handling or a different provider is implemented.
- Next best step: In the next session, investigate the Yahoo auth/session failure before relying further on the live backend data path for non-seeded tickers or building additional dashboard slices on top of it.

### Session 007

- Date: 2026-04-18
- Goal: Resolve the live market-data blocker with `yfinance`, then implement `dash-003` under the repository harness and record passing evidence.
- Completed: Replaced the hand-rolled Yahoo HTTP path with a `yfinance`-backed backend client that stores its cache in a repo-local writable directory, extended the workspace schema and fixtures with market-context cards, added S&P 500 plus sector-benchmark rendering on `/dashboard/[ticker]`, created `frontend/e2e/dash-003.spec.ts`, and moved Playwright's test-only ports to `3100/8100` so feature verification does not accidentally reuse stale local servers on `3000/8000`.
- Verification run: `./init.sh`; `cd backend && .venv/Scripts/python.exe -m pytest -q`; `cd frontend && npm run lint`; `cd frontend && npm run typecheck`; `cd frontend && npx playwright test e2e/dash-003.spec.ts`
- Evidence captured: `./init.sh` completed successfully after the feature changes; backend `cd backend && .venv/Scripts/python.exe -m pytest -q` passed with `3 passed`; frontend `npm run lint` passed; frontend `npm run typecheck` passed; `cd frontend && npx playwright test e2e/dash-003.spec.ts` passed after rerunning outside the sandbox on fresh test ports; log saved at `artifacts/verification/dash-003-playwright.log`; implementation commit is `1e056b9`. A live validation using `yfinance` also resolved `NVDA` successfully after pointing the library cache into the workspace.
- Commits: `1e056b9 Implement dash-003 market context workspace`
- Files or artifacts updated: `backend/app/clients/yahoo_finance.py`, `backend/app/clients/market_data_fixtures.py`, `backend/app/schemas/company_workspace.py`, `backend/tests/test_company_workspace.py`, `backend/requirements.txt`, `frontend/src/app/_lib/company-workspace.ts`, `frontend/src/app/dashboard/[ticker]/page.tsx`, `frontend/src/app/globals.css`, `frontend/e2e/dash-003.spec.ts`, `frontend/playwright.config.ts`, `artifacts/verification/dash-003-playwright.log`, `feature_list.json`, `progress.md`, `session-handoff.md`
- Known risk or unresolved issue: `yfinance` remains an unofficial Yahoo wrapper and its upstream data shape can still drift, but the repo-local cache configuration removes the prior local SQLite permission issue and the fixture-backed verification path remains deterministic.
- Next best step: Start `dash-004` and add backend-sourced key financial metrics to the workspace without regressing the `dash-001` through `dash-003` contracts.

### Session 008

- Date: 2026-04-18
- Goal: Apply a user-requested exception update on the passing dashboard slices by fixing the dividend-yield mapping and replacing the last section with a direct comparison chart.
- Completed: Corrected the `yfinance` forward-dividend formatter so `dividendYield` is treated as percentage points instead of being multiplied by 100 again, extended the workspace schema and fixtures with normalized performance-series data, replaced the last dashboard section with a three-line comparison chart that starts all series at 100, updated the dashboard styles for the chart/legend view, and refreshed the relevant Playwright expectations.
- Verification run: `./init.sh`; `cd backend && .venv/Scripts/python.exe -m pytest -q`; `cd frontend && npm run lint`; `cd frontend && npm run typecheck`; `cd frontend && npx playwright test e2e/dash-002b.spec.ts e2e/dash-003.spec.ts`
- Evidence captured: `./init.sh` completed successfully after the exception update; backend `cd backend && .venv/Scripts/python.exe -m pytest -q` passed with `4 passed`; frontend `npm run lint` passed; frontend `npm run typecheck` passed; `cd frontend && npx playwright test e2e/dash-002b.spec.ts e2e/dash-003.spec.ts` passed after clearing a stale local `next dev` process that blocked Playwright from starting its test server.
- Commits: `9d886c0 Refine dashboard comparison view and dividend yield formatting`
- Files or artifacts updated: `backend/app/clients/yahoo_finance.py`, `backend/app/clients/market_data_fixtures.py`, `backend/app/schemas/company_workspace.py`, `backend/tests/test_company_workspace.py`, `frontend/src/app/_lib/company-workspace.ts`, `frontend/src/app/_components/performance-comparison-chart.tsx`, `frontend/src/app/dashboard/[ticker]/page.tsx`, `frontend/src/app/globals.css`, `frontend/src/app/layout.tsx`, `frontend/e2e/dash-002b.spec.ts`, `frontend/e2e/dash-003.spec.ts`, `feature_list.json`, `progress.md`, `session-handoff.md`
- Known risk or unresolved issue: The chart now depends on recent `yfinance` price history being available for the company and both benchmarks; fixture coverage keeps tests deterministic, but upstream history availability can still drift.
- Next best step: Resume the roadmap at `dash-004`; this exception update was limited to already-passing dashboard behavior and does not change the next unfinished feature.

### Session 009

- Date: 2026-04-18
- Goal: Continue the user-requested dashboard copy and layout cleanup on top of the already-passing dashboard slices.
- Completed: Removed the hero tagline (`yfinance-backed market snapshot...`), moved `Search another ticker` into the hero header where the ticker pill previously sat, and simplified the overview accordion title so it no longer repeats the company name.
- Verification run: `cd frontend && npm run lint`; `cd frontend && npm run typecheck`; `cd frontend && npx playwright test e2e/dash-002b.spec.ts e2e/dash-003.spec.ts`
- Evidence captured: Frontend `npm run lint` passed; frontend `npm run typecheck` passed; `cd frontend && npx playwright test e2e/dash-002b.spec.ts e2e/dash-003.spec.ts` passed after clearing a stale local `next dev` process that blocked Playwright from starting its test server.
- Commits: `9c9c0e6 Polish dashboard overview title and hero scale`
- Files or artifacts updated: `frontend/src/app/dashboard/[ticker]/page.tsx`, `frontend/src/app/globals.css`, `progress.md`, `session-handoff.md`
- Known risk or unresolved issue: This dashboard UX/copy exception is still in progress and should be treated as the current continuation point even though `dash-004` remains the highest-priority unfinished roadmap feature.
- Next best step: Continue the current dashboard polish pass from the latest safe stopping point, then return to `dash-004` once the user is satisfied with the existing dashboard experience.

### Session 010

- Date: 2026-04-18
- Goal: Apply the next user-requested dashboard polish tweaks before resuming `dash-004`.
- Completed: Removed the `At a glance` wording from the company overview accordion by renaming that section title to `Overview`, and reduced the dashboard hero company-name scale with a dedicated `dashboard-company-title` style so the page title reads more professional and less like the landing-page hero.
- Verification run: `./init.sh`; `cd frontend && npm run lint`; `cd frontend && npm run typecheck`; `cd frontend && npx playwright test e2e/dash-002b.spec.ts e2e/dash-003.spec.ts`
- Evidence captured: `./init.sh` completed successfully before the UI change; frontend `npm run lint` passed; frontend `npm run typecheck` passed; `cd frontend && npx playwright test e2e/dash-002b.spec.ts e2e/dash-003.spec.ts` passed after rerunning Playwright outside the sandbox to avoid the local `spawn EPERM`.
- Commits: `2715886 Add selectable dashboard comparison ranges`
- Files or artifacts updated: `frontend/src/app/dashboard/[ticker]/page.tsx`, `frontend/src/app/globals.css`, `progress.md`, `session-handoff.md`
- Known risk or unresolved issue: No new blocker was introduced; this remains a dashboard-polish exception on top of the passing slices, so `dash-004` is still unstarted and its spec file is still missing.
- Next best step: Resume roadmap work at `dash-004` unless the user requests another narrow dashboard polish change first.

### Session 011

- Date: 2026-04-18
- Goal: Add a selectable time range to the normalized comparison chart before resuming `dash-004`.
- Completed: Extended the backend workspace payload so the market-context chart can expose whichever comparison ranges are available, currently `1Y` and `5Y`; updated fixture data and backend tests to cover both ranges; added a client-side selector for the comparison section so users can switch between `1Y` and `5Y`; and updated `dash-003` Playwright coverage to verify the range toggle changes the rendered comparison window.
- Verification run: `./init.sh`; `cd backend && .venv/Scripts/python.exe -m pytest -q`; `cd frontend && npm run lint`; `cd frontend && npm run typecheck`; `cd frontend && npx playwright test e2e/dash-002b.spec.ts e2e/dash-003.spec.ts`
- Evidence captured: `./init.sh` completed successfully before the change; backend `cd backend && .venv/Scripts/python.exe -m pytest -q` passed with `4 passed` and one existing `.pytest_cache` warning; frontend `npm run lint` passed; frontend `npm run typecheck` passed; `cd frontend && npx playwright test e2e/dash-002b.spec.ts e2e/dash-003.spec.ts` passed with the new selector assertions.
- Commits: `2715886 Add selectable dashboard comparison ranges`; `c188c6c Record dashboard range-selector progress evidence`
- Files or artifacts updated: `backend/app/schemas/company_workspace.py`, `backend/app/clients/yahoo_finance.py`, `backend/app/clients/market_data_fixtures.py`, `backend/tests/test_company_workspace.py`, `frontend/src/app/_lib/company-workspace.ts`, `frontend/src/app/_components/performance-comparison-chart.tsx`, `frontend/src/app/_components/performance-comparison-section.tsx`, `frontend/src/app/dashboard/[ticker]/page.tsx`, `frontend/src/app/globals.css`, `frontend/e2e/dash-003.spec.ts`, `progress.md`, `session-handoff.md`
- Known risk or unresolved issue: The live `5Y` selector depends on longer-range `yfinance` history being available for the company, the S&P 500, and the sector benchmark; the backend now skips any unavailable range and only renders what is actually accessible, but upstream availability can still drift.
- Next best step: Resume roadmap work at `dash-004` unless the user requests another narrow dashboard exception update first.

### Session 012

- Date: 2026-04-18
- Goal: Apply the next user-requested dashboard layout cleanup before resuming `dash-004`.
- Completed: Removed the `Company Overview` eyebrow from the hero so the first card now just shows the company name, renamed the overview accordion title to `Business summary and key stats`, adjusted the chart x-axis label anchoring so the first and last dates stay inside the frame, added a small gap below the selected-range status line, and refreshed `dash-002` so its regression coverage matches the intentional hero-plus-overview layout.
- Verification run: `./init.sh`; `cd frontend && npm run lint`; `cd frontend && npm run typecheck`; `cd frontend && npx playwright test e2e/dash-002.spec.ts e2e/dash-002b.spec.ts e2e/dash-003.spec.ts`
- Evidence captured: `./init.sh` completed successfully before the UI change; frontend `npm run lint` passed; frontend `npm run typecheck` passed; `cd frontend && npx playwright test e2e/dash-002.spec.ts e2e/dash-002b.spec.ts e2e/dash-003.spec.ts` passed after rerunning Playwright outside the sandbox to avoid the local `spawn EPERM`.
- Commits: `3a155e7 Polish dashboard hero and chart framing`
- Files or artifacts updated: `frontend/src/app/dashboard/[ticker]/page.tsx`, `frontend/src/app/_components/performance-comparison-chart.tsx`, `frontend/src/app/globals.css`, `frontend/e2e/dash-002.spec.ts`, `progress.md`, `session-handoff.md`
- Known risk or unresolved issue: No new blocker was introduced; this remains a narrow dashboard exception update on top of the passing slices, so `dash-004` is still unstarted and its spec file is still missing.
- Next best step: Resume roadmap work at `dash-004` unless the user requests another narrow dashboard exception update first.

### Session 013

- Date: 2026-04-18
- Goal: Make the market-context cards show selected-range performance percentages instead of daily moves before resuming `dash-004`.
- Completed: Updated the market-context cards to derive percentage return from the active normalized series so the displayed change now matches the selected `1Y` or `5Y` range, removed the daily absolute-change text from those cards, and refreshed `dash-003` so the regression coverage checks the selected-range percentages instead of the prior one-day moves.
- Verification run: `./init.sh`; `cd frontend && npm run lint`; `cd frontend && npm run typecheck`; `cd frontend && npx playwright test e2e/dash-002b.spec.ts e2e/dash-003.spec.ts`
- Evidence captured: `./init.sh` completed successfully before the UI change; frontend `npm run lint` passed; frontend `npm run typecheck` passed; `cd frontend && npx playwright test e2e/dash-002b.spec.ts e2e/dash-003.spec.ts` passed with the updated percentage assertions.
- Commits: `6c67841 Show range returns in market context cards`
- Files or artifacts updated: `frontend/src/app/_components/performance-comparison-section.tsx`, `frontend/e2e/dash-003.spec.ts`, `progress.md`, `session-handoff.md`
- Known risk or unresolved issue: The range percentages are derived from the normalized chart series returned for the selected range, so if a live provider range is unavailable it will still be omitted entirely rather than showing a stale percentage.
- Next best step: Resume roadmap work at `dash-004` unless the user requests another narrow dashboard exception update first.

### Session 014

- Date: 2026-04-18
- Goal: Verify the market-context card percentage math and add a clear negative-performance color treatment before resuming `dash-004`.
- Completed: Confirmed the market-context cards derive their displayed percentage from the first and last points of the selected normalized series, refactored that calculation into an explicit return-and-tone helper, added red styling for negative performance, updated fixture data to include a negative sector-benchmark return case, and refreshed `dash-003` regression coverage to assert the negative styling.
- Verification run: `./init.sh`; `cd backend && .venv/Scripts/python.exe -m pytest tests/test_company_workspace.py -q`; `cd frontend && npm run lint`; `cd frontend && npm run typecheck`; `cd frontend && npx playwright test e2e/dash-003.spec.ts`
- Evidence captured: `./init.sh` completed successfully before the targeted UI change; backend `cd backend && .venv/Scripts/python.exe -m pytest tests/test_company_workspace.py -q` passed with `3 passed`; frontend `npm run lint` passed; frontend `npm run typecheck` passed; `cd frontend && npx playwright test e2e/dash-003.spec.ts` passed after rerunning Playwright outside the sandbox to avoid the local `spawn EPERM`; log saved at `artifacts/verification/dash-003-playwright.log`.
- Commits: none yet
- Files or artifacts updated: `frontend/src/app/_components/performance-comparison-section.tsx`, `frontend/src/app/globals.css`, `backend/app/clients/market_data_fixtures.py`, `frontend/e2e/dash-003.spec.ts`, `artifacts/verification/dash-003-playwright.log`, `progress.md`, `session-handoff.md`, `feature_list.json`
- Known risk or unresolved issue: The displayed return remains only as accurate as the normalized comparison series returned for the selected range; live provider history gaps will still remove the affected range entirely rather than displaying a misleading percentage.
- Next best step: Resume roadmap work at `dash-004` unless the user requests another narrow dashboard exception update first.

### Session 015

- Date: 2026-04-18
- Goal: Fix the market-context range returns so the selected-range percentage ends at the same current quote shown on the card.
- Completed: Refactored the live `yfinance` chart builder to carry both the current display value and the numeric current quote for each comparison series, replaced the final sampled history point with a normalized point derived from the current quote, added a backend unit test for the new endpoint behavior, updated the MSFT fixture to reflect a `+15.0%` one-year return, and refreshed `dash-003` Playwright coverage to assert that MSFT's market-context card shows the corrected one-year gain.
- Verification run: `./init.sh`; `cd backend && .venv/Scripts/python.exe -m pytest tests/test_company_workspace.py -q`; `cd frontend && npm run lint`; `cd frontend && npm run typecheck`; `cd frontend && npx playwright test e2e/dash-003.spec.ts`
- Evidence captured: `./init.sh` completed successfully before the fix; backend `cd backend && .venv/Scripts/python.exe -m pytest tests/test_company_workspace.py -q` passed with `4 passed`; frontend `npm run lint` passed; frontend `npm run typecheck` passed; `cd frontend && npx playwright test e2e/dash-003.spec.ts` passed after rerunning Playwright outside the sandbox to avoid the local `spawn EPERM`; log saved at `artifacts/verification/dash-003-playwright.log`.
- Commits: none yet
- Files or artifacts updated: `backend/app/clients/yahoo_finance.py`, `backend/tests/test_company_workspace.py`, `backend/app/clients/market_data_fixtures.py`, `frontend/e2e/dash-003.spec.ts`, `artifacts/verification/dash-003-playwright.log`, `progress.md`, `session-handoff.md`, `feature_list.json`
- Known risk or unresolved issue: The live chart now ends on the current quote instead of the last sampled history bar, but the first point is still the earliest available sampled bar in the requested period, so upstream `yfinance` history availability still governs the exact anchor date.
- Next best step: Resume roadmap work at `dash-004` unless the user requests another narrow dashboard exception update first.

### Session 016

- Date: 2026-04-18
- Goal: Fix the market-context baseline so `1Y` and `5Y` are anchored to exactly one year or five years ago from today instead of the earliest sparse sample returned by Yahoo.
- Completed: Reworked the live `yfinance` range builder to compute an explicit anchor date from today, fetch the nearest usable daily close around that anchor, normalize each series from that anchor value, and insert the anchor as the first chart point while still ending the chart on today's current quote. Updated fixture data so the one-year charts begin at `Apr 2025`, added backend tests for anchor selection and leap-day-safe year subtraction, and refreshed `dash-003` to assert the corrected one-year anchor label.
- Verification run: `./init.sh`; `cd backend && .venv/Scripts/python.exe -m pytest tests/test_company_workspace.py -q`; `cd frontend && npm run lint`; `cd frontend && npm run typecheck`; `cd frontend && npx playwright test e2e/dash-003.spec.ts`
- Evidence captured: `./init.sh` completed successfully before the fix; backend `cd backend && .venv/Scripts/python.exe -m pytest tests/test_company_workspace.py -q` passed with `6 passed`; frontend `npm run lint` passed; frontend `npm run typecheck` passed; `cd frontend && npx playwright test e2e/dash-003.spec.ts` passed after rerunning Playwright outside the sandbox to avoid the local `spawn EPERM`; log saved at `artifacts/verification/dash-003-playwright.log`.
- Commits: none yet
- Files or artifacts updated: `backend/app/clients/yahoo_finance.py`, `backend/tests/test_company_workspace.py`, `backend/app/clients/market_data_fixtures.py`, `frontend/e2e/dash-003.spec.ts`, `artifacts/verification/dash-003-playwright.log`, `progress.md`, `session-handoff.md`, `feature_list.json`
- Known risk or unresolved issue: The exact anchor still depends on the nearest available trading close returned around the target date, so weekends and holidays will use the closest usable market session rather than a non-trading calendar date.
- Next best step: Resume roadmap work at `dash-004` unless the user requests another narrow dashboard exception update first.

### Session 017

- Date: 2026-04-19
- Goal: Apply a user-requested refinement to the passing Yahoo snapshot before resuming `dash-004`, keeping only valuation-relevant fields that Yahoo Finance provides directly or that can be calculated straightforwardly from Yahoo-provided values.
- Completed: Replaced the hard-coded trading-screen snapshot fields with a valuation-focused list that now includes trailing and forward P/E, price to book, EV / EBITDA, EV / Revenue, PEG, ROE, ROA, profit and operating margins, debt to equity, beta, free cash flow, and relevant earnings or dividend dates. The backend now omits any snapshot field when Yahoo does not provide the needed value directly and there is no straightforward ratio calculation, the fixture snapshots were updated to match the new contract, and the dashboard copy now labels the section as valuation-relevant market details.
- Verification run: `./init.sh`; `cd backend && .venv/Scripts/python.exe -m pytest tests/test_company_workspace.py -q`; `cd frontend && npm run lint`; `cd frontend && npm run typecheck`; `cd frontend && npx playwright test e2e/dash-002b.spec.ts`
- Evidence captured: `./init.sh` completed successfully both before and after the change; backend `cd backend && .venv/Scripts/python.exe -m pytest tests/test_company_workspace.py -q` passed with `6 passed`; frontend `npm run lint` passed; frontend `npm run typecheck` passed; `cd frontend && npx playwright test e2e/dash-002b.spec.ts` passed after rerunning Playwright outside the sandbox to avoid the local `spawn EPERM`.
- Commits: none yet
- Files or artifacts updated: `backend/app/clients/yahoo_finance.py`, `backend/app/clients/market_data_fixtures.py`, `backend/tests/test_company_workspace.py`, `frontend/src/app/dashboard/[ticker]/page.tsx`, `frontend/e2e/dash-002b.spec.ts`, `feature_list.json`, `progress.md`, `session-handoff.md`
- Known risk or unresolved issue: The live snapshot still depends on `yfinance` field availability and naming; when Yahoo omits a field, the workspace now hides it instead of showing a placeholder, so the live card count can vary by ticker.
- Next best step: Resume roadmap work at `dash-004` and add the dedicated key-financial-metrics slice without regressing the newly-trimmed Yahoo snapshot contract.

### Session 018

- Date: 2026-04-19
- Goal: Apply the follow-up snapshot tweak to keep only `Ex-Dividend Date` and remove the separate `Dividend Date` row.
- Completed: Removed `Dividend Date` from the live Yahoo snapshot builder, fixture snapshots, backend assertions, and the `dash-002b` Playwright coverage, leaving `Ex-Dividend Date` as the only dividend-date field in the snapshot.
- Verification run: `cd backend && .venv/Scripts/python.exe -m pytest tests/test_company_workspace.py -q`; `cd frontend && npm run lint`; `cd frontend && npm run typecheck`; `cd frontend && npx playwright test e2e/dash-002b.spec.ts`
- Evidence captured: Backend `cd backend && .venv/Scripts/python.exe -m pytest tests/test_company_workspace.py -q` passed with `6 passed`; frontend `npm run lint` passed; frontend `npm run typecheck` passed; `cd frontend && npx playwright test e2e/dash-002b.spec.ts` passed.
- Commits: none yet
- Files or artifacts updated: `backend/app/clients/yahoo_finance.py`, `backend/app/clients/market_data_fixtures.py`, `backend/tests/test_company_workspace.py`, `frontend/e2e/dash-002b.spec.ts`, `feature_list.json`, `progress.md`, `session-handoff.md`
- Known risk or unresolved issue: The live snapshot still depends on `yfinance` field availability and naming; when Yahoo omits a field, the workspace now hides it instead of showing a placeholder, so the live card count can vary by ticker.
- Next best step: Resume roadmap work at `dash-004` and add the dedicated key-financial-metrics slice without regressing the Yahoo snapshot contract.

### Session 019

- Date: 2026-04-19
- Goal: Apply the next Yahoo snapshot follow-up by removing the two margin rows and restoring `Forward Dividend & Yield` plus `Avg. Volume`.
- Completed: Replaced `Profit Margin` and `Operating Margin` in the snapshot contract with `Forward Dividend & Yield` and `Avg. Volume` in the live builder, fixture payloads, backend tests, and `dash-002b` Playwright coverage, while preserving the earlier `Ex-Dividend Date`-only dividend-date decision.
- Verification run: `cd backend && .venv/Scripts/python.exe -m pytest tests/test_company_workspace.py -q`; `cd frontend && npm run lint`; `cd frontend && npm run typecheck`; `cd frontend && npx playwright test e2e/dash-002b.spec.ts`
- Evidence captured: Backend `cd backend && .venv/Scripts/python.exe -m pytest tests/test_company_workspace.py -q` passed with `6 passed`; frontend `npm run lint` passed; frontend `npm run typecheck` passed; `cd frontend && npx playwright test e2e/dash-002b.spec.ts` passed after stopping a stale local `next dev` process that blocked Playwright from starting its own server.
- Commits: none yet
- Files or artifacts updated: `backend/app/clients/yahoo_finance.py`, `backend/app/clients/market_data_fixtures.py`, `backend/tests/test_company_workspace.py`, `frontend/e2e/dash-002b.spec.ts`, `feature_list.json`, `progress.md`, `session-handoff.md`
- Known risk or unresolved issue: The live snapshot still depends on `yfinance` field availability and naming; when Yahoo omits a field, the workspace now hides it instead of showing a placeholder, so the live card count can vary by ticker.
- Next best step: Resume roadmap work at `dash-004` and add the dedicated key-financial-metrics slice without regressing the Yahoo snapshot contract.

### Session 020

- Date: 2026-04-19
- Goal: Apply the next Yahoo snapshot follow-up by removing `Free Cash Flow`, adding `Trailing Dividend` when Yahoo exposes it, and reordering the card fields for a cleaner valuation-first scan.
- Completed: Removed the snapshot's `Free Cash Flow` row, added `Trailing Dividend` from Yahoo's trailing annual dividend rate when available, and reordered the field list so valuation multiples lead, followed by leverage/risk, return metrics, dividend and volume context, then dates. Updated the fixture payloads, backend assertions, and `dash-002b` Playwright coverage to match the new contract.
- Verification run: `cd backend && .venv/Scripts/python.exe -m pytest tests/test_company_workspace.py -q`; `cd frontend && npm run lint`; `cd frontend && npm run typecheck`; `cd frontend && npx playwright test e2e/dash-002b.spec.ts`
- Evidence captured: Backend `cd backend && .venv/Scripts/python.exe -m pytest tests/test_company_workspace.py -q` passed with `6 passed`; frontend `npm run lint` passed; frontend `npm run typecheck` passed; `cd frontend && npx playwright test e2e/dash-002b.spec.ts` passed.
- Commits: none yet
- Files or artifacts updated: `backend/app/clients/yahoo_finance.py`, `backend/app/clients/market_data_fixtures.py`, `backend/tests/test_company_workspace.py`, `frontend/e2e/dash-002b.spec.ts`, `feature_list.json`, `progress.md`, `session-handoff.md`
- Known risk or unresolved issue: The live snapshot still depends on `yfinance` field availability and naming; when Yahoo omits a field, the workspace now hides it instead of showing a placeholder, so the live card count can vary by ticker.
- Next best step: Resume roadmap work at `dash-004` and add the dedicated key-financial-metrics slice without regressing the Yahoo snapshot contract.

### Session 021

- Date: 2026-04-19
- Goal: Apply the next Yahoo snapshot follow-up by swapping the display order of `Trailing Dividend` and `Avg. Volume`, and formatting trailing dividend with its yield percentage instead of a plain number.
- Completed: Updated the live Yahoo snapshot builder so `Trailing Dividend` now requires both the trailing annual dividend rate and trailing annual dividend yield, renders them together as `rate (yield%)`, and appears before `Avg. Volume`. Updated fixture payloads, backend assertions, and `dash-002b` Playwright coverage to match the new order and formatting.
- Verification run: `cd backend && .venv/Scripts/python.exe -m pytest tests/test_company_workspace.py -q`; `cd frontend && npm run lint`; `cd frontend && npm run typecheck`; `cd frontend && npx playwright test e2e/dash-002b.spec.ts`
- Evidence captured: Backend `cd backend && .venv/Scripts/python.exe -m pytest tests/test_company_workspace.py -q` passed with `6 passed`; frontend `npm run lint` passed; frontend `npm run typecheck` passed; `cd frontend && npx playwright test e2e/dash-002b.spec.ts` passed after stopping a stale local `next dev` process that blocked Playwright from starting its own server.
- Commits: none yet
- Files or artifacts updated: `backend/app/clients/yahoo_finance.py`, `backend/app/clients/market_data_fixtures.py`, `backend/tests/test_company_workspace.py`, `frontend/e2e/dash-002b.spec.ts`, `feature_list.json`, `progress.md`, `session-handoff.md`
- Known risk or unresolved issue: The live snapshot still depends on `yfinance` field availability and naming; when Yahoo omits a field, the workspace now hides it instead of showing a placeholder, so the live card count can vary by ticker.
- Next best step: Resume roadmap work at `dash-004` and add the dedicated key-financial-metrics slice without regressing the Yahoo snapshot contract.

### Session 022

- Date: 2026-04-19
- Goal: Fix the `Trailing Dividend` row so it shows a correct TTM cash dividend amount instead of relying on Yahoo's summary fields.
- Completed: Replaced the prior trailing-dividend formatter with a true last-365-days sum from the ticker's dividend history, removed the percentage from that row, and updated the builder, fixtures, backend tests, and `dash-002b` Playwright coverage to reflect the TTM-cash-only display.
- Verification run: `cd backend && .venv/Scripts/python.exe -m pytest tests/test_company_workspace.py -q`; `cd frontend && npm run lint`; `cd frontend && npm run typecheck`; `cd frontend && npx playwright test e2e/dash-002b.spec.ts`
- Evidence captured: Backend `cd backend && .venv/Scripts/python.exe -m pytest tests/test_company_workspace.py -q` passed with `7 passed`; frontend `npm run lint` passed; frontend `npm run typecheck` passed; `cd frontend && npx playwright test e2e/dash-002b.spec.ts` passed after stopping a stale local `next dev` process that blocked Playwright from starting its own server.
- Commits: none yet
- Files or artifacts updated: `backend/app/clients/yahoo_finance.py`, `backend/app/clients/market_data_fixtures.py`, `backend/tests/test_company_workspace.py`, `frontend/e2e/dash-002b.spec.ts`, `feature_list.json`, `progress.md`, `session-handoff.md`
- Known risk or unresolved issue: The live snapshot still depends on `yfinance` field availability and naming; when Yahoo omits a field, the workspace now hides it instead of showing a placeholder, so the live card count can vary by ticker.
- Next best step: Resume roadmap work at `dash-004` and add the dedicated key-financial-metrics slice without regressing the Yahoo snapshot contract.

### Session 023

- Date: 2026-04-19
- Goal: Apply the next Yahoo snapshot follow-up by formatting debt to equity as a percentage and clarifying the average-volume label as a 3-month figure.
- Completed: Updated the Yahoo snapshot so debt to equity now shows Yahoo's reported numeric value with a trailing percent sign instead of a bare number, and renamed the volume row to `Avg. Volume (3M)`. Updated fixture payloads, backend assertions, and `dash-002b` Playwright coverage to match the new display contract.
- Verification run: `cd backend && .venv/Scripts/python.exe -m pytest tests/test_company_workspace.py -q`; `cd frontend && npm run lint`; `cd frontend && npm run typecheck`; `cd frontend && npx playwright test e2e/dash-002b.spec.ts`
- Evidence captured: Backend `cd backend && .venv/Scripts/python.exe -m pytest tests/test_company_workspace.py -q` passed with `7 passed`; frontend `npm run lint` passed; frontend `npm run typecheck` passed; `cd frontend && npx playwright test e2e/dash-002b.spec.ts` passed after stopping a stale local `next dev` process that blocked Playwright from starting its own server.
- Commits: none yet
- Files or artifacts updated: `backend/app/clients/yahoo_finance.py`, `backend/app/clients/market_data_fixtures.py`, `backend/tests/test_company_workspace.py`, `frontend/e2e/dash-002b.spec.ts`, `feature_list.json`, `progress.md`, `session-handoff.md`
- Known risk or unresolved issue: The live snapshot still depends on `yfinance` field availability and naming; when Yahoo omits a field, the workspace now hides it instead of showing a placeholder, so the live card count can vary by ticker.
- Next best step: Resume roadmap work at `dash-004` and add the dedicated key-financial-metrics slice without regressing the Yahoo snapshot contract.

### Session 024

- Date: 2026-04-19
- Goal: Apply the next Yahoo snapshot follow-up by labeling the trailing valuation rows more explicitly and confirm which snapshot fields come directly from Yahoo info versus fallback math.
- Completed: Renamed the snapshot labels to `Trailing P/E (TTM)` and `Trailing Dividend (TTM)` across the live builder, fixture payloads, backend assertions, and `dash-002b` Playwright coverage. Also confirmed the current sourcing logic for all 15 snapshot fields so the direct-versus-fallback behavior is now easy to explain from code.
- Verification run: `cd backend && .venv/Scripts/python.exe -m pytest tests/test_company_workspace.py -q`; `cd frontend && npm run lint`; `cd frontend && npm run typecheck`; `cd frontend && npx playwright test e2e/dash-002b.spec.ts`
- Evidence captured: Backend `cd backend && .venv/Scripts/python.exe -m pytest tests/test_company_workspace.py -q` passed with `7 passed`; frontend `npm run lint` passed; frontend `npm run typecheck` passed; `cd frontend && npx playwright test e2e/dash-002b.spec.ts` passed.
- Commits: none yet
- Files or artifacts updated: `backend/app/clients/yahoo_finance.py`, `backend/app/clients/market_data_fixtures.py`, `backend/tests/test_company_workspace.py`, `frontend/e2e/dash-002b.spec.ts`, `feature_list.json`, `progress.md`, `session-handoff.md`
- Known risk or unresolved issue: The live snapshot still depends on `yfinance` field availability and naming; when Yahoo omits a field, the workspace now hides it instead of showing a placeholder, so the live card count can vary by ticker.
- Next best step: Resume roadmap work at `dash-004` and add the dedicated key-financial-metrics slice without regressing the Yahoo snapshot contract.

### Session 025

- Date: 2026-04-19
- Goal: Remove the redundant dedicated `dash-004` roadmap item and renumber the remaining dashboard features after the user reverted the unfinished implementation attempt.
- Completed: Deleted the old `dash-004` key-financial-metrics feature from `feature_list.json`, shifted the former `dash-005` / `dash-006` / `dash-007` items up to `dash-004` / `dash-005` / `dash-006`, and updated downstream priorities plus `depends_on` references so the roadmap remains coherent without dangling references to a retired feature ID.
- Verification run: none; this was a tracking-artifact cleanup only.
- Evidence captured: `feature_list.json`, `progress.md`, and `session-handoff.md` now agree that the next unfinished dashboard feature is the revenue-to-net-income waterfall chart at the new `dash-004`, and cross-section dependencies that formerly pointed at the removed feature now point at `dash-002b`.
- Commits: none yet
- Files or artifacts updated: `feature_list.json`, `progress.md`, `session-handoff.md`
- Known risk or unresolved issue: Historical session-log entries still mention the retired old `dash-004` because they describe what the roadmap said at the time; the current top-of-file state and latest session entry are the source of truth going forward.
- Next best step: Start the new `dash-004` waterfall-chart slice and use `cd frontend && npx playwright test e2e/dash-004.spec.ts` as the feature gate.

### Session 026

- Date: 2026-04-19
- Goal: Implement the new `dash-004` revenue-to-net-income waterfall slice under the repository harness and record passing evidence.
- Completed: Extended the backend workspace schema plus fixture payloads with an income-statement waterfall contract, added a live `yfinance` builder that derives revenue, COGS, OpEx, interest, tax, and residual other-items bars from the latest available income-statement data, rendered the new waterfall as a dedicated dashboard section, and replaced the deleted old `dash-004` Playwright file with the new waterfall-chart contract.
- Verification run: `./init.sh`; `cd backend && .venv/Scripts/python.exe -m pytest tests/test_company_workspace.py -q`; `cd frontend && npm run lint`; `cd frontend && npm run typecheck`; `cd frontend && npx playwright test e2e/dash-004.spec.ts`
- Evidence captured: `./init.sh` completed successfully before feature work; backend `cd backend && .venv/Scripts/python.exe -m pytest tests/test_company_workspace.py -q` passed with `8 passed` plus a local pytest cache warning; frontend `npm run lint` passed; frontend `npm run typecheck` passed; `cd frontend && npx playwright test e2e/dash-004.spec.ts` passed after rerunning outside the sandbox to avoid the local `spawn EPERM`; log saved at `artifacts/verification/dash-004-playwright.log`; implementation commit is `f7a46f4`.
- Commits: `f7a46f4 Implement dash-004 income statement waterfall`
- Files or artifacts updated: `backend/app/schemas/company_workspace.py`, `backend/app/clients/market_data_fixtures.py`, `backend/app/clients/yahoo_finance.py`, `backend/tests/test_company_workspace.py`, `frontend/src/app/_lib/company-workspace.ts`, `frontend/src/app/_components/income-statement-waterfall-chart.tsx`, `frontend/src/app/dashboard/[ticker]/page.tsx`, `frontend/src/app/globals.css`, `frontend/e2e/dash-004.spec.ts`, `artifacts/verification/dash-004-playwright.log`, `feature_list.json`, `progress.md`, `session-handoff.md`
- Known risk or unresolved issue: The live waterfall still depends on `yfinance` income-statement row availability and naming, so some live tickers may show zeroed intermediate bars or hide the section entirely if Yahoo omits key fields; fixture-backed verification remains deterministic.
- Next best step: Start `dash-005` and add the revenue segment breakdown slice without regressing the newly passing waterfall, snapshot, or market-context contracts.

### Session 027

- Date: 2026-04-19
- Goal: Apply a user-requested refinement to the passing `dash-004` waterfall so it shows statement subtotals and the exact line items `Revenue`, `Cost of Revenue`, `Gross Profit`, `Operating Expenses`, `Operating Profit`, `Other Income / Cost`, `Taxes`, and `Net Profits`.
- Completed: Reworked the live waterfall builder so it now emits subtotal bars for gross profit and operating profit, collapses below-operating items into a single signed `Other Income / Cost` bridge, renames the expense and ending labels to the requested statement wording, updates the fixture payloads to match that new shape, refreshes backend assertions, and tightens the `dash-004` Playwright coverage around the revised line-item labels and values.
- Verification run: `./init.sh`; `cd backend && .venv/Scripts/python.exe -m pytest tests/test_company_workspace.py -q`; `cd frontend && npm run lint`; `cd frontend && npm run typecheck`; `cd frontend && npx playwright test e2e/dash-004.spec.ts`
- Evidence captured: `./init.sh` completed successfully before the refinement; backend `cd backend && .venv/Scripts/python.exe -m pytest tests/test_company_workspace.py -q` passed with `8 passed` plus a local pytest cache warning; frontend `npm run lint` passed; frontend `npm run typecheck` passed; `cd frontend && npx playwright test e2e/dash-004.spec.ts` passed after rerunning Playwright outside the sandbox; log refreshed at `artifacts/verification/dash-004-playwright.log`; implementation commit is `3b177a0`.
- Commits: `3b177a0 Refine dash-004 waterfall line items`
- Files or artifacts updated: `backend/app/clients/yahoo_finance.py`, `backend/app/clients/market_data_fixtures.py`, `backend/tests/test_company_workspace.py`, `frontend/src/app/_components/income-statement-waterfall-chart.tsx`, `frontend/e2e/dash-004.spec.ts`, `artifacts/verification/dash-004-playwright.log`, `feature_list.json`, `progress.md`, `session-handoff.md`
- Known risk or unresolved issue: The live waterfall still depends on `yfinance` income-statement row availability and naming. When Yahoo omits gross-profit, operating-income, pretax, or tax rows, the builder fills the missing bridge points with derived values or zeros, so live subtotals may be less precise than the deterministic fixture path.
- Next best step: Resume the roadmap at `dash-005` unless the user asks for another narrow refinement to the already-passing dashboard slices.

### Session 028

- Date: 2026-04-19
- Goal: Fix the `dash-004` chart labels so the longer statement names stay readable on the waterfall axis.
- Completed: Updated the waterfall SVG to wrap long x-axis labels onto two lines, increased the chart's bottom padding so those wrapped labels have room to breathe, and kept the underlying `dash-004` line-item contract unchanged.
- Verification run: `cd frontend && npm run lint`; `cd frontend && npm run typecheck`; `cd frontend && npx playwright test e2e/dash-004.spec.ts`
- Evidence captured: Frontend `npm run lint` passed; frontend `npm run typecheck` passed; `cd frontend && npx playwright test e2e/dash-004.spec.ts` passed after stopping a stale local `next dev` process that blocked Playwright from starting its own frontend server; log refreshed at `artifacts/verification/dash-004-playwright.log`; implementation commit is `a21dbc3`.
- Commits: `a21dbc3 Wrap dash-004 waterfall axis labels`
- Files or artifacts updated: `frontend/src/app/_components/income-statement-waterfall-chart.tsx`, `frontend/src/app/globals.css`, `artifacts/verification/dash-004-playwright.log`, `feature_list.json`, `progress.md`, `session-handoff.md`
- Known risk or unresolved issue: The wrapped axis labels are tuned for the current eight-step statement flow. If later roadmap work adds more waterfall bars or much longer labels, the chart may need another spacing pass.
- Next best step: Resume the roadmap at `dash-005` unless the user asks for another narrow waterfall polish tweak first.

### Session 029

- Date: 2026-04-19
- Goal: Revert the most recent `dash-004` bar-tone change at the user's request, returning the waterfall to the pre-change label-wrap state.
- Completed: Restored the `dash-004` waterfall component and CSS back to the pre-bar-tone version from the last passing label-wrap commit, leaving the wrapped axis labels and current statement line-item order intact while removing the most recent negative-subtotal styling change.
- Verification run: `cd frontend && npm run lint`; `cd frontend && npm run typecheck`; `cd frontend && npx playwright test e2e/dash-004.spec.ts`
- Evidence captured: Frontend `npm run lint` passed; frontend `npm run typecheck` passed; `cd frontend && npx playwright test e2e/dash-004.spec.ts` passed after stopping a stale local `next dev` process that blocked Playwright from starting its own frontend server; log refreshed at `artifacts/verification/dash-004-playwright.log`; revert commit is `e8c0433`.
- Commits: `e8c0433 Revert dash-004 bar-tone fix`
- Files or artifacts updated: `frontend/src/app/_components/income-statement-waterfall-chart.tsx`, `frontend/src/app/globals.css`, `artifacts/verification/dash-004-playwright.log`, `feature_list.json`, `progress.md`, `session-handoff.md`
- Known risk or unresolved issue: This revert intentionally undoes only the most recent bar-tone styling change. The wrapped axis labels and the current eight-step statement flow remain in place.
- Next best step: Resume the roadmap at `dash-005` unless the user asks for another narrow waterfall refinement.

### Session 030

- Date: 2026-04-19
- Goal: Apply a user-requested `dash-004` refinement so the dotted waterfall line connects each bar through the correct edge.
- Completed: Reworked the frontend waterfall SVG so it now draws dotted connector paths between every adjacent pair of bars using each bar's real entry and exit edge. Positive delta bars now receive the connector at the lower edge and hand it off from the upper edge, while negative deltas do the reverse. Tightened the `dash-004` Playwright contract so it now asserts all seven inter-bar connectors render for both `AAPL` and `KO`.
- Verification run: `./init.sh`; `cd frontend && npm run lint`; `cd frontend && npm run typecheck`; `cd frontend && npx playwright test e2e/dash-004.spec.ts`
- Evidence captured: `./init.sh` completed successfully before the refinement; frontend `npm run lint` passed; frontend `npm run typecheck` passed; the initial Playwright attempt hit the local sandbox `spawn EPERM`, then `cd frontend && npx playwright test e2e/dash-004.spec.ts` passed when rerun outside the sandbox; log refreshed at `artifacts/verification/dash-004-playwright.log`; implementation commit is `5a270e2`.
- Commits: `5a270e2 Connect dash-004 waterfall bars`
- Files or artifacts updated: `frontend/src/app/_components/income-statement-waterfall-chart.tsx`, `frontend/e2e/dash-004.spec.ts`, `artifacts/verification/dash-004-playwright.log`, `feature_list.json`, `progress.md`, `session-handoff.md`
- Known risk or unresolved issue: The live waterfall still depends on `yfinance` income-statement row availability and naming. When Yahoo omits gross-profit, operating-income, pretax, or tax rows, the builder fills the missing bridge points with derived values or zeros, so live subtotals may be less precise than the deterministic fixture path.
- Next best step: Resume the roadmap at `dash-005` unless the user asks for another narrow `dash-004` refinement.
