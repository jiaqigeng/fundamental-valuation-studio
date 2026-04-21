# Session Handoff

## Verified Now

- What is currently working: The repo boots with `./init.sh`, the landing page accepts a ticker, validates it inline, and keeps invalid user-entered tickers on `/` with a clear message instead of routing to a 404 page. The landing page no longer shows demo ticker shortcuts; it now explains the dashboard, valuation, and AI-analysis parts of the project, and it now includes a direct button to `/valuation`. `/valuation` is now a real top-level route with a lightweight valuation entry shell instead of a missing destination. `/dashboard/[ticker]` still loads company identity plus key stats, the valuation-focused Yahoo snapshot remains intact, the market-context section still renders normalized `1Y` / `5Y` comparison ranges, and the shared `Income Statement Bridge` card still renders the segment pie ahead of the waterfall when real annual segment data exists. The pie chart is intentionally annual-only, while the waterfall alone can switch between `Year` and `Quarter` in the live path when Yahoo exposes real quarterly statement data, and that toggle sits in the waterfall subsection's top-right header corner. Both subsections show explicit period labels plus exact date ranges to avoid ambiguity. In fixture mode, the supported dashboard tickers stay annual-only; in the live path, quarter appears whenever Yahoo yields a usable quarter waterfall, without any quarter fixture fallback, and the annual pie is now omitted when FMP does not return a usable segment mix instead of falling back to hard-coded live segment data. The backend now also exposes `POST /valuations/dcf`, which computes a manual-input DCF projection with yearly revenue, operating income, NOPAT, reinvestment, free cash flow, terminal value, enterprise value, equity value, and intrinsic value per share. `dash-001` through `dash-005` and `val-001a` are recorded as passing.
- What verification actually ran: `./init.sh`; `cd frontend && npm run lint`; `cd frontend && npm run typecheck`

## Changed This Session

- Code or behavior added: Added a direct landing-page CTA to `/valuation` and created `frontend/src/app/valuation/page.tsx` as a lightweight valuation entry route.
- Infrastructure or harness changes: No new verification artifact was needed; this was a narrow frontend routing refinement on top of the already-passing baseline.
- Documentation changes: Updated `frontend/ARCHITECTURE.md`, `docs/frontend.md`, `progress.md`, and this handoff to reflect the new valuation entry route.

## Broken Or Unverified

- Unverified path: Later per-feature verification files in `feature_list.json` remain unstarted until their features become active.
- Risk for the next session: `val-001a` is intentionally a backend-only manual-input math slice. The new `/valuation` route is only an entry shell; there is still no full frontend DCF calculator yet, and the service currently assumes a flat growth rate, flat operating margin, constant sales-to-capital ratio, and a simple terminal value formula. `val-001b` still needs to define how company-data baselines feed this endpoint. Separately, the live dashboard path still depends on unofficial Yahoo and FMP providers, so upstream field drift or outages can still remove sections from `/dashboard/[ticker]`.
- Ongoing work note: The user explicitly said the dashboard is already good enough and `dash-006` is no longer needed right now. That feature was de-prioritized in `feature_list.json`, and the roadmap should continue at `val-001b` unless the user reopens the dashboard-scope question.
- Working tree note: User-owned changes still exist in `AGENTS.md` and `.claude/`; they were intentionally left untouched.

## Next Best Step

- Highest-priority unfinished feature: `val-001b`
- Why it is next: `val-001a` now provides the backend DCF math layer, and the user explicitly de-prioritized `dash-006`, so the next roadmap step is pre-filling the DCF calculator assumptions from company data while keeping them user-overridable.
- What counts as passing: Opening the DCF calculator for a supported ticker shows company-data baseline assumptions, user overrides recompute the output, and `cd frontend && npx playwright test e2e/val-001b.spec.ts` passes with evidence recorded.
- What must not change during that step: Preserve the passing `val-001a` math contract and the existing `dash-001` through `dash-005` dashboard behavior; avoid reopening `dash-006` unless the user explicitly asks for it.

## Commands

- Startup: `./init.sh`
- Verification: `./init.sh` for baseline; `feature_list.json -> features[*].verification.command` for feature passing
- Focused debug command: `cd frontend && npx playwright test e2e/val-001b.spec.ts`
