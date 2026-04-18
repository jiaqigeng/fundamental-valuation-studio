# Backend Architecture

Describes how `backend/` is organized today and where new code belongs. For conventions, commands, and the venv-Python rule, read [../docs/backend.md](../docs/backend.md) alongside this file.

## Purpose

This file is the backend structure guide:

- what the backend is responsible for
- how backend code should be layered as it grows
- where new backend modules should live

It should avoid repeating day-to-day command usage, environment setup, and verification workflow that already live in [../docs/backend.md](../docs/backend.md).

## What the backend does

The backend is a FastAPI service that serves the company, market, valuation, and AI-analysis data the frontend needs. It now exposes `/health` plus a company workspace market-data route, and every later backend-verified feature in `feature_list.json` will land on top of this same FastAPI app.

## Top-level shape

```text
backend/
|- app/
|  |- __init__.py                  Package marker only
|  |- clients/                     External provider clients + fixtures
|  |- routers/                     FastAPI route groups
|  |- schemas/                     Pydantic response models
|  |- services/                    Backend business logic
|  `- main.py                      FastAPI instance + router registration
|- tests/                          HTTP-level and service-oriented test modules
|- requirements.txt                Unpinned runtime + test dependencies
`- .venv/                          Local Python 3.14.3 virtualenv (not committed)
```

The repository ships with no `pyproject.toml`; dependencies are declared in `requirements.txt` and installed into `.venv/` by `./init.sh`.

## Layering

The app now uses these layers, each allowed to depend only on the layer below it:

1. **Routers** (`app/routers/*.py`) - FastAPI `APIRouter` instances grouped by domain (for example `companies`, `valuation`, `ai`). `main.py` stays small: construct `app`, include routers, configure middleware.
2. **Schemas** (`app/schemas/*.py`) - Pydantic request/response models. Shared between routers and services; never import FastAPI here.
3. **Services** (`app/services/*.py`) - Business logic (DCF math, prompt assembly, data fetching). Pure Python, unit-testable without `TestClient`.
4. **Clients / Data** (`app/clients/*.py`, future `app/db/*.py`) - External boundaries: market-data APIs, AI providers, and, once persistence lands, SQLAlchemy sessions and models.

`main.py` now constructs the app and includes routers. Keep future feature work aligned with this layering instead of growing `main.py` back into a catch-all file.

## Request flow

```text
HTTP request
  -> FastAPI app (main.py)
     -> router (app/routers/<domain>.py)
        -> schema validation (app/schemas/<domain>.py)
        -> service call (app/services/<domain>.py)
           -> external client or pure computation
        -> schema-shaped response
```

Keep this direction one-way. Routers call services; services call clients. Services never import routers; clients never import services.

## Current routes

| Method | Path                           | Handler                               | Purpose                                  |
| ------ | ------------------------------ | ------------------------------------- | ---------------------------------------- |
| GET    | `/health`                      | `main.health_check`                   | Liveness probe for CI                    |
| GET    | `/companies/{ticker}/workspace` | `routers.companies.company_workspace` | Dashboard workspace market-data snapshot |

Every new feature adds rows here.

## Data boundaries

- **No database yet.** SQLAlchemy is installed but unused. The first persistence feature decides engine, session management, and migration tooling.
- **Yahoo Finance client exists now.** The market-data provider lives in `app/clients/yahoo_finance.py`, and deterministic fixture responses for test coverage live in `app/clients/market_data_fixtures.py`. Keep future providers isolated the same way so request shape and retry policy stay auditable.
- **No auth yet.** Endpoints are unauthenticated. Auth arrives only when a feature requires user-scoped data.

## Verification boundary

Backend verification workflow is documented in [../docs/backend.md](../docs/backend.md). This file only cares about architecture implications:

- HTTP-level tests exercise the backend from the outside in
- routers, schemas, services, and clients should remain separable enough to test independently when needed
- the public API surface should stay visible at the router layer instead of being hidden inside `main.py`

## Extension points

- New route group: add `app/routers/<domain>.py`, include it in `main.py` with `app.include_router(...)`.
- New schema: add `app/schemas/<domain>.py`. Import from routers and services; never from clients.
- New service: add `app/services/<domain>.py`. Pure functions preferred; classes only when state or dependency injection is required.
- New external client: add `app/clients/<provider>.py`. One module per provider; fixture or fake implementations can sit beside the client in separate modules when tests need deterministic responses.
- New dependency: append to `requirements.txt` and rerun `./init.sh`.

## Known architectural constraints

- `app/` is a package; use absolute imports (`from app.services.valuation import ...`) so the test runner and Uvicorn resolve modules the same way.
- Avoid speculative abstractions. The current router/schema/service/client split exists because the backend now has multiple responsibilities; only add deeper substructure when another feature actually needs it.
- The service is stateless today. Introducing process-level caches, background tasks, or websockets requires a feature ticket and an update to this document.
