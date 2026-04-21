from fastapi import APIRouter, HTTPException

from app.schemas.valuation import (
    DcfBaselineResponse,
    DcfValuationRequest,
    DcfValuationResponse,
)
from app.services.valuation import (
    DcfBaselineNotFoundError,
    DcfBaselineUnavailableError,
    calculate_dcf_valuation,
    get_dcf_baseline,
)


router = APIRouter(prefix="/valuations", tags=["valuations"])


@router.get("/dcf/{ticker}/baseline", response_model=DcfBaselineResponse)
def dcf_baseline(ticker: str) -> DcfBaselineResponse:
    try:
        return get_dcf_baseline(ticker)
    except DcfBaselineNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except DcfBaselineUnavailableError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.post("/dcf", response_model=DcfValuationResponse)
def discounted_cash_flow(payload: DcfValuationRequest) -> DcfValuationResponse:
    return calculate_dcf_valuation(payload)
