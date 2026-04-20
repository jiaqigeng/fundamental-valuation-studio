from __future__ import annotations

import os

from app.clients.financial_modeling_prep import FinancialModelingPrepClient
from app.clients.market_data_fixtures import FIXTURE_WORKSPACES
from app.clients.yahoo_finance import YahooFinanceClient, YahooFinanceLookupError
from app.schemas.company_workspace import CompanyWorkspaceSnapshot, FinancialBridgePeriod


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
    financial_bridge_periods = _normalize_financial_bridge_periods(snapshot)
    fmp_client = FinancialModelingPrepClient()
    enriched_periods = [
        _enrich_financial_bridge_period(
            ticker=normalized_ticker,
            period=period,
            fmp_client=fmp_client,
            fixture=fixture,
        )
        for period in financial_bridge_periods
    ]
    enriched_periods = [
        period for period in enriched_periods if _period_has_visible_content(period)
    ]
    annual_period = next(
        (period for period in enriched_periods if period.period_key == "year"),
        None,
    )
    default_period = _select_default_financial_bridge_period(enriched_periods)

    if default_period is not None:
        return snapshot.model_copy(
            update={
                "income_statement_waterfall": default_period.income_statement_waterfall,
                "revenue_segment_breakdown": (
                    annual_period.revenue_segment_breakdown
                    if annual_period is not None
                    else default_period.revenue_segment_breakdown
                ),
                "financial_bridge_periods": enriched_periods,
            }
        )

    if snapshot.revenue_segment_breakdown is None and fixture is not None:
        return snapshot.model_copy(
            update={
                "revenue_segment_breakdown": fixture.revenue_segment_breakdown,
                "financial_bridge_periods": _normalize_financial_bridge_periods(fixture),
            }
        )

    return snapshot


def _normalize_financial_bridge_periods(
    snapshot: CompanyWorkspaceSnapshot,
) -> list[FinancialBridgePeriod]:
    if snapshot.financial_bridge_periods:
        return list(snapshot.financial_bridge_periods)

    if (
        snapshot.income_statement_waterfall
        or snapshot.revenue_segment_breakdown is not None
    ):
        return [
            FinancialBridgePeriod(
                period_key="year",
                label="Year",
                period_label="Latest annual period",
                date_range_label="Latest reported period",
                income_statement_waterfall=snapshot.income_statement_waterfall,
                revenue_segment_breakdown=snapshot.revenue_segment_breakdown,
            )
        ]

    return []


def _enrich_financial_bridge_period(
    *,
    ticker: str,
    period: FinancialBridgePeriod,
    fmp_client: FinancialModelingPrepClient,
    fixture: CompanyWorkspaceSnapshot | None,
) -> FinancialBridgePeriod:
    if period.period_key == "quarter":
        return period

    if period.revenue_segment_breakdown is not None:
        return period

    fmp_breakdown = fmp_client.fetch_revenue_segment_breakdown(
        ticker,
        target_revenue=_get_total_revenue(period),
        period_key=period.period_key,
    )
    if fmp_breakdown is not None:
        return period.model_copy(
            update={"revenue_segment_breakdown": fmp_breakdown}
        )

    if fixture is None:
        return period

    fixture_period = next(
        (
            candidate
            for candidate in _normalize_financial_bridge_periods(fixture)
            if candidate.period_key == period.period_key
        ),
        None,
    )
    if fixture_period is None or fixture_period.revenue_segment_breakdown is None:
        return period

    return period.model_copy(
        update={
            "revenue_segment_breakdown": fixture_period.revenue_segment_breakdown,
        }
    )


def _select_default_financial_bridge_period(
    periods: list[FinancialBridgePeriod],
) -> FinancialBridgePeriod | None:
    for period in periods:
        if period.period_key == "year":
            return period
    return periods[0] if periods else None


def _period_has_visible_content(period: FinancialBridgePeriod) -> bool:
    return (
        bool(period.income_statement_waterfall)
        or period.revenue_segment_breakdown is not None
    )


def _get_total_revenue(period: FinancialBridgePeriod) -> float | None:
    revenue_step = next(
        (
            step
            for step in period.income_statement_waterfall
            if step.label == "Revenue"
        ),
        None,
    )
    return None if revenue_step is None else float(revenue_step.value)
