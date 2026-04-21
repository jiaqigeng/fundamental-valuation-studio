from fastapi import APIRouter

from app.schemas.valuation import DcfValuationRequest, DcfValuationResponse
from app.services.valuation import calculate_dcf_valuation


router = APIRouter(prefix="/valuations", tags=["valuations"])


@router.post("/dcf", response_model=DcfValuationResponse)
def discounted_cash_flow(payload: DcfValuationRequest) -> DcfValuationResponse:
    return calculate_dcf_valuation(payload)
