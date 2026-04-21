# Backend Topic Doc

Load this doc when working inside `backend/` - editing FastAPI routes, Pydantic models, SQLAlchemy layers, or pytest suites invoked by `feature_list.json`.

## Purpose

This file is the backend working guide:

- what commands to run
- what environment and testing rules to follow
- how backend verification is expected to work

It should not be the source of truth for where backend code belongs as the service grows. That belongs in [../backend/ARCHITECTURE.md](../backend/ARCHITECTURE.md).

## Stack

- FastAPI 0.136.0 served by Uvicorn 0.44.0 (`--reload` in dev)
- SQLAlchemy 2.0.49 for the eventual persistence layer (not yet wired)
- Pydantic 2.13.2 for request/response schemas
- pytest 9.0.3 with `httpx` + `fastapi.testclient` for HTTP-level tests
- Python 3.14.3 in a project-local virtual environment at `backend/.venv/`
- Shell: Git Bash on Windows; always invoke the venv Python as `./.venv/Scripts/python.exe`

## Scope boundary

- Read [../backend/ARCHITECTURE.md](../backend/ARCHITECTURE.md) when deciding where new backend code belongs.
- Read this file when deciding how to run, verify, or safely edit backend code.
- If guidance is about enduring package boundaries rather than day-to-day workflow, it belongs in the architecture doc instead of here.

## Conventions

- Route handlers return plain dict or Pydantic models; FastAPI serializes both. `main.py:health_check` is the current reference.
- Tests instantiate `TestClient(app)` at module scope (see `tests/test_health.py`) and assert both `status_code` and JSON body.
- New modules under `backend/app/` should import from `app.*` (absolute), matching the test import style.
- Local backend secrets can live in `backend/.env`; `backend/app/main.py` now loads that file at startup for local development variables such as `FVS_FMP_API_KEY`.
- When a feature needs a new dependency, add it to `requirements.txt` and rerun `./init.sh` so the venv reflects the change.
- Keep feature verification aligned with `feature_list.json`; the named pytest file is the passing gate for backend features.

## Current implementation notes

- `backend/app/main.py` now constructs the FastAPI app and includes routers rather than owning every responsibility directly.
- `backend/app/routers/companies.py`, `app/services/company_workspace.py`, `app/clients/yahoo_finance.py`, and `app/schemas/company_workspace.py` are the reference shape for the first external-data feature.
- `backend/app/routers/valuations.py`, `app/services/valuation.py`, and `app/schemas/valuation.py` are the reference shape for backend-only valuation math.
- `GET /valuations/dcf/{ticker}/baseline` now provides the frontend-facing DCF baseline contract by pulling live yfinance company inputs such as free cash flow, shares outstanding, debt, cash, beta, Treasury proxy, and current price.
- `backend/tests/test_health.py`, `backend/tests/test_company_workspace.py`, and `backend/tests/test_val_001a.py` are the current backend reference tests.
- SQLAlchemy is installed but not yet used by the running app.

## Commands

Run from the repo root unless noted.

- Dev server: `cd backend && ./.venv/Scripts/python.exe -m uvicorn app.main:app --reload`
- Full test suite (baseline verification): `cd backend && ./.venv/Scripts/python.exe -m pytest -q`
- Single feature test: `cd backend && ./.venv/Scripts/python.exe -m pytest tests/test_<feature-id>.py -q`
- Install or refresh dependencies: `./init.sh` (creates `.venv` if missing, then `pip install -r requirements.txt`)

## Adding a feature test

1. Find the feature in `feature_list.json`. Backend-verified features set `verification.kind = "backend"` and name a file like `tests/test_val_001a.py`.
2. Create that test module under `backend/tests/` using `TestClient(app)` and asserting the behavior described in the feature's `behavior` field.
3. Implement the route, schema, and any service layer the test needs.
4. Run the exact `verification.command` from `feature_list.json`, capture stdout to `artifacts/verification/<feature-id>-pytest.log`, and record evidence per `AGENTS.md`.

## Do not

- Do not invoke `python` or `python3` directly for app work on this machine - always use `./.venv/Scripts/python.exe` so dependency versions match `requirements.txt`.
- Do not mark a backend feature passing if the declared pytest file is missing or any assertion fails.
- Do not add database, auth, or external-API clients until a feature in `feature_list.json` requires them.

## Source, applicability, expiry

- Source: project scaffold from Session 001 (`progress.md`) and the current `backend/app/main.py` + `backend/tests/test_health.py`.
- Applicability: any task that touches files under `backend/`, or any feature whose `verification.kind` is `backend`.
- Expiry: revisit when `app/` grows beyond a single `main.py`, when a database or external client is introduced, or when Python, FastAPI, SQLAlchemy, or Pydantic majors change.
