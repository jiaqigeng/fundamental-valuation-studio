from pathlib import Path

from fastapi import FastAPI
from dotenv import load_dotenv

from app.routers.companies import router as companies_router
from app.routers.valuations import router as valuations_router

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

app = FastAPI(title="Fundamental Valuation Studio API")
app.include_router(companies_router)
app.include_router(valuations_router)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
