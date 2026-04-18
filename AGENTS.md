# AGENTS.md

## Project Overview

Fundamental Valuation Studio is a full-stack equity research platform for fundamental company analysis, intrinsic value modeling, and AI-assisted company analysis.

- Frontend: Next.js 16.2.4 with React 19.2.4
- Backend: FastAPI 0.136.0 with Uvicorn 0.44.0
- Database layer: SQLAlchemy 2.0.49
- Validation layer: Pydantic 2.13.2
- Frontend package manager: npm 11.11.0
- Frontend runtime: Node.js 24.14.1
- Python: 3.14.3
- Backend test runner: pytest 9.0.3
- Shell: Git Bash on Windows
- Frontend dev command: `cd frontend && npm run dev`
- Frontend verification command: `cd frontend && npm run lint`
- Backend dev command: `cd backend && .venv/Scripts/python.exe -m uvicorn app.main:app --reload`
- Backend verification command: `cd backend && .venv/Scripts/python.exe -m pytest -q`
- Standard startup contract: `./init.sh`

## Startup Workflow

Before writing code:

1. Confirm the working directory with `pwd`.
2. Read `progress.md` for the latest verified state and next step.
3. Read `feature_list.json` and choose the highest-priority unfinished feature.
4. Review recent commits with `git log --oneline -5`.
5. Run `./init.sh`.
6. Use the standard commands above when working directly in the frontend or backend.
7. Run the required verification for the active feature before starting new work if the repository is already scaffolded.

If baseline verification is already failing, fix that first. Do not stack new feature work on top of a broken starting state.

## Hard Constraints

- The agent MUST work on only one feature at a time.
- The agent MUST read `progress.md` and `feature_list.json` before starting work.
- The agent MUST pick the highest-priority unfinished feature unless `progress.md` records a justified exception.
- The agent MUST NOT mark a feature as `passing` without recorded evidence.
- The agent MUST NOT skip required verification for the active feature.
- The agent MUST NOT widen scope beyond the active feature unless a narrow supporting fix is required to unblock it.
- The agent MUST update repository artifacts instead of relying on chat memory for cross-session continuity.
- The agent MUST NOT silently change verification expectations during implementation.
- The agent MUST leave the repository in a state where the next session can continue without guessing.

## Topic Docs

- Architecture: TBD
- API contracts: TBD
- Data ingestion and caching: TBD
- Valuation methodology: TBD
- AI prompting and evidence policy: TBD

## Required Artifacts

- `feature_list.json`: source of truth for feature state, priority, verification, and evidence
- `progress.md`: current verified state, session log, blockers, and next step
- `init.sh`: standard startup and baseline verification entry point for frontend and backend
- `session-handoff.md`: optional compact handoff for larger sessions or incomplete work

## Definition Of Done

A feature is done only when all of the following are true:

- the target behavior is implemented
- the required verification actually ran
- evidence is recorded in `feature_list.json` or `progress.md`
- any blocker or residual risk is documented
- the repository remains restartable from the standard startup path

## End Of Session

Before ending a session:

1. Update `progress.md`.
2. Update `feature_list.json`.
3. Record any unresolved risk or blocker.
4. Update `session-handoff.md` if the work spans multiple logical steps or needs a compact continuation note.
5. Commit with a descriptive message once the work is in a safe state.
6. Leave the repository clean enough for the next session to run `./init.sh` immediately.
