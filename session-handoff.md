# Session Handoff

## Verified Now

- What is currently working: The repo boots with `./init.sh`, the frontend and backend are scaffolded, backend health-check testing passes, frontend lint and typecheck pass, and the first feature-level e2e target file for `dash-001` exists.
- What verification actually ran: `./init.sh`; `cd frontend && npm run lint`; `cd frontend && npm run typecheck`; `cd backend && ./.venv/Scripts/python.exe -m pytest -q`

## Changed This Session

- Code or behavior added: Added FastAPI app baseline, Next.js app scaffold, backend health endpoint test, and the first Playwright spec file at `frontend/e2e/dash-001.spec.ts`.
- Infrastructure or harness changes: Tightened `AGENTS.md` around feature-level verification, added frontend Playwright scaffolding, added frontend `typecheck` and `test:e2e` scripts, and aligned the startup contract with the richer feature-list schema.

## Broken Or Unverified

- Known defect: `dash-001` is not implemented yet, so `frontend/e2e/dash-001.spec.ts` is expected to fail until the ticker-search workflow exists.
- Unverified path: Most later per-feature verification files referenced in `feature_list.json` do not exist yet because those features have not been started.
- Risk for the next session: The repo now enforces a stronger feature-verification contract, so the next session should avoid widening scope beyond `dash-001`.

## Next Best Step

- Highest-priority unfinished feature: `dash-001`
- Why it is next: It is the top unfinished feature in `feature_list.json` and the root dependency for all later dashboard, valuation, AI, and UX work.
- What counts as passing: The ticker-search workflow is implemented and `cd frontend && npx playwright test e2e/dash-001.spec.ts` passes with evidence recorded.
- What must not change during that step: Do not mark later dashboard or valuation features as active, and do not rewrite the feature-level verification contract unless the repo artifacts are updated together.

## Commands

- Startup: `./init.sh`
- Verification: `./init.sh` for baseline; `feature_list.json -> features[*].verification.command` for feature passing
- Focused debug command: `cd frontend && npx playwright test e2e/dash-001.spec.ts`
