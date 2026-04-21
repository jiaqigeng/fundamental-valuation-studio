from app.schemas.valuation import (
    DcfProjectionYear,
    DcfValuationRequest,
    DcfValuationResponse,
)


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
