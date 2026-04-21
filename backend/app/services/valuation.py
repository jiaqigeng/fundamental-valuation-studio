import os

from app.clients.yahoo_finance import YahooFinanceClient, YahooFinanceLookupError
from app.schemas.valuation import (
    DcfBaselineResponse,
    DcfProjectionYear,
    DcfValuationRequest,
    DcfValuationResponse,
)


MARKET_DATA_PROVIDER_ENV = "FVS_MARKET_DATA_PROVIDER"


class DcfBaselineNotFoundError(RuntimeError):
    """Raised when a baseline cannot be found for a ticker."""


class DcfBaselineUnavailableError(RuntimeError):
    """Raised when the upstream provider cannot be reached."""


FIXTURE_DCF_BASELINES: dict[str, DcfBaselineResponse] = {
    "AAPL": DcfBaselineResponse(
        ticker="AAPL",
        company_name="Apple Inc.",
        sector="Technology",
        current_price=212.48,
        current_price_display="$212.48",
        current_revenue=391_000_000_000.0,
        current_revenue_display="$391.0B",
        revenue_growth_rate=0.06,
        operating_margin=110_000_000_000.0 / 391_000_000_000.0,
        tax_rate=0.17,
        sales_to_capital_ratio=2.6,
        wacc=0.102,
        terminal_growth_rate=0.03,
        shares_outstanding=15_100_000_000.0,
        shares_outstanding_display="15.100B",
        net_debt=-57_000_000_000.0,
        net_debt_display="-$57.0B",
        projection_years=5,
        assumption_notes=[
            "Revenue growth starts from the latest Apple annual revenue base.",
            "Operating margin is anchored to Apple's latest reported operating profit margin.",
            "WACC uses a beta-informed cost-of-equity estimate for the current company profile.",
        ],
    ),
    "MSFT": DcfBaselineResponse(
        ticker="MSFT",
        company_name="Microsoft Corporation",
        sector="Technology",
        current_price=338.12,
        current_price_display="$338.12",
        current_revenue=245_100_000_000.0,
        current_revenue_display="$245.1B",
        revenue_growth_rate=0.11,
        operating_margin=81_800_000_000.0 / 245_100_000_000.0,
        tax_rate=0.16,
        sales_to_capital_ratio=2.7,
        wacc=0.099,
        terminal_growth_rate=0.03,
        shares_outstanding=7_425_000_000.0,
        shares_outstanding_display="7.425B",
        net_debt=-38_000_000_000.0,
        net_debt_display="-$38.0B",
        projection_years=5,
        assumption_notes=[
            "Revenue growth starts from Microsoft's latest annual revenue base.",
            "Operating margin reflects the latest reported operating income over revenue.",
            "WACC uses a beta-informed cost-of-equity estimate for the current company profile.",
        ],
    ),
    "KO": DcfBaselineResponse(
        ticker="KO",
        company_name="The Coca-Cola Company",
        sector="Consumer Defensive",
        current_price=68.14,
        current_price_display="$68.14",
        current_revenue=45_800_000_000.0,
        current_revenue_display="$45.8B",
        revenue_growth_rate=0.05,
        operating_margin=13_600_000_000.0 / 45_800_000_000.0,
        tax_rate=0.19,
        sales_to_capital_ratio=1.8,
        wacc=0.084,
        terminal_growth_rate=0.025,
        shares_outstanding=4_320_000_000.0,
        shares_outstanding_display="4.320B",
        net_debt=28_000_000_000.0,
        net_debt_display="$28.0B",
        projection_years=5,
        assumption_notes=[
            "Revenue growth starts from Coca-Cola's latest annual revenue base.",
            "Operating margin reflects the latest reported operating income over revenue.",
            "WACC uses a lower beta-informed cost-of-equity estimate for a defensive consumer business.",
        ],
    ),
}


def get_dcf_baseline(ticker: str) -> DcfBaselineResponse:
    normalized_ticker = ticker.upper()
    provider = os.getenv(MARKET_DATA_PROVIDER_ENV, "yahoo").strip().lower()

    if provider == "fixture":
        fixture = FIXTURE_DCF_BASELINES.get(normalized_ticker)
        if fixture is None:
            raise DcfBaselineNotFoundError(
                f"No fixture valuation baseline exists for ticker {normalized_ticker}."
            )
        return fixture

    client = YahooFinanceClient()
    try:
        return client.fetch_dcf_baseline(normalized_ticker)
    except YahooFinanceLookupError as exc:
        message = str(exc)
        if "no result" in message.lower():
            raise DcfBaselineNotFoundError(message) from exc
        raise DcfBaselineUnavailableError(message) from exc


def calculate_dcf_valuation(payload: DcfValuationRequest) -> DcfValuationResponse:
    previous_revenue = payload.current_revenue
    projections: list[DcfProjectionYear] = []
    present_value_sum = 0.0

    for year in range(1, payload.projection_years + 1):
        revenue = previous_revenue * (1 + payload.revenue_growth_rate)
        operating_income = revenue * payload.operating_margin
        nopat = operating_income * (1 - payload.tax_rate)
        reinvestment = (revenue - previous_revenue) / payload.sales_to_capital_ratio
        free_cash_flow = nopat - reinvestment
        present_value = free_cash_flow / ((1 + payload.wacc) ** year)

        projections.append(
            DcfProjectionYear(
                year=year,
                revenue=revenue,
                operating_income=operating_income,
                nopat=nopat,
                reinvestment=reinvestment,
                free_cash_flow=free_cash_flow,
                present_value=present_value,
            )
        )
        present_value_sum += present_value
        previous_revenue = revenue

    terminal_revenue = previous_revenue * (1 + payload.terminal_growth_rate)
    terminal_operating_income = terminal_revenue * payload.operating_margin
    terminal_nopat = terminal_operating_income * (1 - payload.tax_rate)
    terminal_reinvestment = (
        terminal_revenue - previous_revenue
    ) / payload.sales_to_capital_ratio
    terminal_free_cash_flow = terminal_nopat - terminal_reinvestment
    terminal_value = terminal_free_cash_flow / (
        payload.wacc - payload.terminal_growth_rate
    )
    terminal_present_value = terminal_value / (
        (1 + payload.wacc) ** payload.projection_years
    )

    enterprise_value = present_value_sum + terminal_present_value
    equity_value = enterprise_value - payload.net_debt
    intrinsic_value_per_share = equity_value / payload.shares_outstanding

    return DcfValuationResponse(
        projections=projections,
        terminal_free_cash_flow=terminal_free_cash_flow,
        terminal_value=terminal_value,
        terminal_present_value=terminal_present_value,
        enterprise_value=enterprise_value,
        equity_value=equity_value,
        intrinsic_value_per_share=intrinsic_value_per_share,
    )
