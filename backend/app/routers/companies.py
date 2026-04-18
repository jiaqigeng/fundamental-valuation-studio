from fastapi import APIRouter, HTTPException

from app.schemas.company_workspace import CompanyWorkspaceSnapshot
from app.services.company_workspace import (
    CompanyWorkspaceNotFoundError,
    CompanyWorkspaceUnavailableError,
    get_company_workspace_snapshot,
)


router = APIRouter(prefix="/companies", tags=["companies"])


@router.get("/{ticker}/workspace", response_model=CompanyWorkspaceSnapshot)
def company_workspace(ticker: str) -> CompanyWorkspaceSnapshot:
    try:
        return get_company_workspace_snapshot(ticker)
    except CompanyWorkspaceNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except CompanyWorkspaceUnavailableError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
