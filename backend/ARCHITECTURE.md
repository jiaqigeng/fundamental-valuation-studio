# Backend Architecture

Describes how `backend/` is organized today and where new code belongs. For conventions, commands, and the venv-Python rule, read [../docs/backend.md](../docs/backend.md) alongside this file.

## Purpose

This file is the backend structure guide:

- what the backend is responsible for
- how backend code should be layered as it grows
- where new backend modules should live

It should avoid repeating day-to-day command usage, environment setup, and verification workflow that already live in [../docs/backend.md](../docs/backend.md).

## What the backend does

The backend is a FastAPI service that will serve the company, market, valuation, and AI-analysis data the frontend needs. Today only a `/health` probe exists; every backend-verified feature in `feature_list.json` — DCF math, AI industry analysis, AI moat analysis, AI management analysis, AI scrubbing, AI synthesis, AI scenarios, AI evidence grounding — will land on top of this same FastAPI app.

## Top-level shape

```
backend/
├── app/
│   ├── __init__.py             Package marker only
│   └── main.py                 FastAPI instance + route declarations
├── tests/
│   └── test_health.py          Baseline /health assertion
├── requirements.txt            Unpinned runtime + test dependencies
└── .venv/                      Local Python 3.14.3 virtualenv (not committed)
```

The repository ships with no `pyproject.toml`; dependencies are declared in `requirements.txt` and installed into `.venv/` by `./init.sh`.

## Layering (target)

The current code is single-file. As features land, code should stratify into these layers, each allowed to depend only on the layer below it. Create each folder only when a feature needs it.

1. **Routers** (`app/routers/*.py`) — FastAPI `APIRouter` instances grouped by domain (e.g. `companies`, `valuation`, `ai`). `main.py` stays small: construct `app`, include routers, configure middleware.
2. **Schemas** (`app/schemas/*.py`) — Pydantic request/response models. Shared between routers and services; never import FastAPI here.
3. **Services** (`app/services/*.py`) — Business logic (DCF math, prompt assembly, data fetching). Pure Python, unit-testable without `TestClient`.
4. **Clients / Data** (`app/clients/*.py`, future `app/db/*.py`) — External boundaries: market-data APIs, AI providers, and — once persistence lands — SQLAlchemy sessions and models.

`main.py` today owns all four responsibilities because there is exactly one route. Split it the moment the second router lands, not before.

## Request flow (target)

```
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

| Method | Path      | Handler                    | Purpose                |
| ------ | --------- | -------------------------- | ---------------------- |
| GET    | `/health` | `main.health_check`        | Liveness probe for CI  |

Every new feature adds rows here.

## Data boundaries

- **No database yet.** SQLAlchemy is installed but unused. The first persistence feature (`val-007` "Save and reload valuation scenarios" is a candidate) decides engine, session management, and migration tooling.
- **No external clients yet.** Market-data and AI-provider integrations are deferred until their first feature. When added, isolate each provider in its own module so request shape and retry policy stay auditable.
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
- New external client: add `app/clients/<provider>.py`. One module per provider; no cross-provider fallbacks inside a single file.
- New dependency: append to `requirements.txt` and rerun `./init.sh`.

## Known architectural constraints

- `app/` is a package; use absolute imports (`from app.services.valuation import ...`) so the test runner and Uvicorn resolve modules the same way.
- Avoid speculative abstractions. A single-route app does not need routers, schemas, and services yet - promote each layer only when a second member of that layer appears.
- The service is stateless today. Introducing process-level caches, background tasks, or websockets requires a feature ticket and an update to this document.
