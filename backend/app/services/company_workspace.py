from __future__ import annotations

import os

from app.clients.market_data_fixtures import FIXTURE_WORKSPACES
from app.clients.yahoo_finance import YahooFinanceClient, YahooFinanceLookupError
from app.schemas.company_workspace import CompanyWorkspaceSnapshot


MARKET_DATA_PROVIDER_ENV = "FVS_MARKET_DATA_PROVIDER"


class CompanyWorkspaceNotFoundError(RuntimeError):
    """Raised when no workspace data exists for a ticker."""


class CompanyWorkspaceUnavailableError(RuntimeError):
    """Raised when the upstream provider cannot be reached."""


def get_company_workspace_snapshot(ticker: str) -> CompanyWorkspaceSnapshot:
    normalized_ticker = ticker.upper()
    provider = os.getenv(MARKET_DATA_PROVIDER_ENV, "yahoo").strip().lower()

    if provider == "fixture":
        fixture = FIXTURE_WORKSPACES.get(normalized_ticker)
        if fixture is None:
            raise CompanyWorkspaceNotFoundError(
                f"No fixture workspace exists for ticker {normalized_ticker}."
            )
        return fixture

    client = YahooFinanceClient()
    try:
        snapshot = client.fetch_company_workspace_snapshot(normalized_ticker)
    except YahooFinanceLookupError as exc:
        message = str(exc)
        if "no result" in message.lower():
            raise CompanyWorkspaceNotFoundError(message) from exc
        raise CompanyWorkspaceUnavailableError(message) from exc

    fixture = FIXTURE_WORKSPACES.get(normalized_ticker)
    if snapshot.revenue_segment_breakdown is None and fixture is not None:
        return snapshot.model_copy(
            update={
                "revenue_segment_breakdown": fixture.revenue_segment_breakdown,
            }
        )

    return snapshot
