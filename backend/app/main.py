from fastapi import FastAPI

from app.routers.companies import router as companies_router

app = FastAPI(title="Fundamental Valuation Studio API")
app.include_router(companies_router)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
