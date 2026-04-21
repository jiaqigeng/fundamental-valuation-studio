from app.clients.yahoo_finance import YahooFinanceClient, YahooFinanceLookupError
from app.schemas.valuation import (
    DcfBaselineResponse,
    DcfProjectionYear,
    DcfValuationRequest,
    DcfValuationResponse,
)


class DcfBaselineNotFoundError(RuntimeError):
    """Raised when a baseline cannot be found for a ticker."""


class DcfBaselineUnavailableError(RuntimeError):
    """Raised when the upstream provider cannot be reached."""


def get_dcf_baseline(ticker: str) -> DcfBaselineResponse:
    normalized_ticker = ticker.upper()
    client = YahooFinanceClient()

    try:
        return client.fetch_dcf_baseline(normalized_ticker)
    except YahooFinanceLookupError as exc:
        message = str(exc)
        if "no result" in message.lower():
            raise DcfBaselineNotFoundError(message) from exc
        raise DcfBaselineUnavailableError(message) from exc


def calculate_dcf_valuation(payload: DcfValuationRequest) -> DcfValuationResponse:
    previous_free_cash_flow = payload.current_free_cash_flow
    projections: list[DcfProjectionYear] = []
    present_value_sum = 0.0

    for year in range(1, payload.projection_years + 1):
        projected_free_cash_flow = previous_free_cash_flow * (
            1 + payload.short_term_growth_rate
        )
        present_value = projected_free_cash_flow / ((1 + payload.discount_rate) ** year)

        projections.append(
            DcfProjectionYear(
                year=year,
                free_cash_flow=projected_free_cash_flow,
                present_value=present_value,
            )
        )
        present_value_sum += present_value
        previous_free_cash_flow = projected_free_cash_flow

    terminal_free_cash_flow = previous_free_cash_flow * (
        1 + payload.terminal_growth_rate
    )
    terminal_value = terminal_free_cash_flow / (
        payload.discount_rate - payload.terminal_growth_rate
    )
    terminal_present_value = terminal_value / (
        (1 + payload.discount_rate) ** payload.projection_years
    )

    enterprise_value = present_value_sum + terminal_present_value
    equity_value = (
        enterprise_value - payload.total_debt + payload.cash_and_cash_equivalents
    )
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
