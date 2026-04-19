from datetime import date

from fastapi.testclient import TestClient

from app.clients.yahoo_finance import _build_income_statement_waterfall_from_values
from app.clients.yahoo_finance import _build_quote_details
from app.clients.yahoo_finance import _build_normalized_points
from app.clients.yahoo_finance import _select_anchor_value
from app.clients.yahoo_finance import _subtract_years
from app.clients.yahoo_finance import _sum_ttm_dividends
from app.main import app


client = TestClient(app)


def test_company_workspace_fixture_response(monkeypatch) -> None:
    monkeypatch.setenv("FVS_MARKET_DATA_PROVIDER", "fixture")

    response = client.get("/companies/MSFT/workspace")

    assert response.status_code == 200
    body = response.json()
    assert body["ticker"] == "MSFT"
    assert body["name"] == "Microsoft Corporation"
    assert body["current_price_display"] == "$338.12"
    assert body["market_cap_display"] == "$4.1T"
    assert body["income_statement_waterfall"] == [
        {
            "label": "Revenue",
            "value": 245100000000.0,
            "display_value": "$245.1B",
            "step_type": "total",
        },
        {
            "label": "Cost of Revenue",
            "value": -76000000000.0,
            "display_value": "-$76.0B",
            "step_type": "delta",
        },
        {
            "label": "Gross Profit",
            "value": 169100000000.0,
            "display_value": "$169.1B",
            "step_type": "total",
        },
        {
            "label": "Operating Expenses",
            "value": -87300000000.0,
            "display_value": "-$87.3B",
            "step_type": "delta",
        },
        {
            "label": "Operating Profit",
            "value": 81800000000.0,
            "display_value": "$81.8B",
            "step_type": "total",
        },
        {
            "label": "Other Income / Cost",
            "value": -200000000.0,
            "display_value": "-$200.0M",
            "step_type": "delta",
        },
        {
            "label": "Taxes",
            "value": -11400000000.0,
            "display_value": "-$11.4B",
            "step_type": "delta",
        },
        {
            "label": "Net Profits",
            "value": 70200000000.0,
            "display_value": "$70.2B",
            "step_type": "total",
        },
    ]
    assert body["quote_details"] == [
        {"label": "Trailing P/E (TTM)", "value": "31.64"},
        {"label": "Forward P/E", "value": "28.10"},
        {"label": "Price to Book", "value": "10.78"},
        {"label": "EV / EBITDA", "value": "20.45"},
        {"label": "EV / Revenue", "value": "12.88"},
        {"label": "PEG Ratio", "value": "2.21"},
        {"label": "Debt to Equity", "value": "32.11%"},
        {"label": "Beta (5Y Monthly)", "value": "1.13"},
        {"label": "Return on Equity (ROE)", "value": "33.74%"},
        {"label": "Return on Assets (ROA)", "value": "14.95%"},
        {"label": "Forward Dividend & Yield", "value": "3.64 (0.86%)"},
        {"label": "Trailing Dividend (TTM)", "value": "3.32"},
        {"label": "Avg. Volume (3M)", "value": "32,964,050"},
        {"label": "Earnings Date", "value": "Apr 29, 2026"},
        {"label": "Ex-Dividend Date", "value": "Mar 9, 2026"},
    ]
    assert body["market_contexts"] == [
        {
            "label": "S&P 500",
            "symbol": "^GSPC",
            "value": "7,126.06",
            "daily_change": "+84.78 (+1.20%)",
            "description": "Broad-market baseline for the current U.S. session.",
        },
        {
            "label": "Technology sector benchmark",
            "symbol": "XLK",
            "value": "154.35",
            "daily_change": "+2.33 (+1.53%)",
            "description": "Sector proxy chosen from the company's reported sector.",
        },
    ]
    assert [entry["range_key"] for entry in body["performance_chart_ranges"]] == [
        "1Y",
        "5Y",
    ]
    assert body["performance_chart_ranges"][0]["label"] == "1 year"
    assert len(body["performance_chart_ranges"][0]["series"]) == 3
    assert body["performance_chart_ranges"][0]["series"][0]["symbol"] == "MSFT"
    assert body["performance_chart_ranges"][0]["series"][0]["points"][0] == {
        "label": "Apr 2025",
        "value": 100.0,
    }
    assert body["performance_chart_ranges"][1]["series"][1]["symbol"] == "^GSPC"
    assert body["performance_chart_ranges"][1]["series"][2]["symbol"] == "XLK"


def test_company_workspace_fixture_404(monkeypatch) -> None:
    monkeypatch.setenv("FVS_MARKET_DATA_PROVIDER", "fixture")

    response = client.get("/companies/ZZZZ/workspace")

    assert response.status_code == 404


def test_build_quote_details_skips_missing_metrics() -> None:
    assert _build_quote_details({}, current_price=None) == []

    details = _build_quote_details(
        {
            "trailingPE": 22.345,
            "debtToEquity": 32.11,
            "beta": 1.13,
            "returnOnEquity": 0.1876,
            "dividendRate": 1.04,
            "dividendYield": 0.38,
            "averageVolume": 57_391_204,
            "earningsTimestampStart": 1_777_687_200,
        },
        current_price=150.0,
        trailing_ttm_dividend=0.96,
    )

    assert [detail.model_dump() for detail in details] == [
        {"label": "Trailing P/E (TTM)", "value": "22.35"},
        {"label": "Debt to Equity", "value": "32.11%"},
        {"label": "Beta (5Y Monthly)", "value": "1.13"},
        {"label": "Return on Equity (ROE)", "value": "18.76%"},
        {"label": "Forward Dividend & Yield", "value": "1.04 (0.38%)"},
        {"label": "Trailing Dividend (TTM)", "value": "0.96"},
        {"label": "Avg. Volume (3M)", "value": "57,391,204"},
        {"label": "Earnings Date", "value": "May 2, 2026"},
    ]


def test_build_income_statement_waterfall_balances_to_net_income() -> None:
    steps = _build_income_statement_waterfall_from_values(
        info={
            "totalRevenue": 245_100_000_000,
            "netIncomeToCommon": 70_200_000_000,
        },
        statement_values={
            "cost_of_revenue": 76_000_000_000,
            "gross_profit": 169_100_000_000,
            "operating_expense": 87_300_000_000,
            "operating_income": 81_800_000_000,
            "tax_provision": 11_400_000_000,
        },
    )

    assert [step.model_dump() for step in steps] == [
        {
            "label": "Revenue",
            "value": 245100000000.0,
            "display_value": "$245.1B",
            "step_type": "total",
        },
        {
            "label": "Cost of Revenue",
            "value": -76000000000.0,
            "display_value": "-$76.0B",
            "step_type": "delta",
        },
        {
            "label": "Gross Profit",
            "value": 169100000000.0,
            "display_value": "$169.1B",
            "step_type": "total",
        },
        {
            "label": "Operating Expenses",
            "value": -87300000000.0,
            "display_value": "-$87.3B",
            "step_type": "delta",
        },
        {
            "label": "Operating Profit",
            "value": 81800000000.0,
            "display_value": "$81.8B",
            "step_type": "total",
        },
        {
            "label": "Other Income / Cost",
            "value": -200000000.0,
            "display_value": "-$200.0M",
            "step_type": "delta",
        },
        {
            "label": "Taxes",
            "value": -11400000000.0,
            "display_value": "-$11.4B",
            "step_type": "delta",
        },
        {
            "label": "Net Profits",
            "value": 70200000000.0,
            "display_value": "$70.2B",
            "step_type": "total",
        },
    ]


def test_build_income_statement_waterfall_computes_other_as_residual_bucket() -> None:
    steps = _build_income_statement_waterfall_from_values(
        info={
            "totalRevenue": 70_900_000,
            "netIncomeToCommon": -341_900_000,
        },
        statement_values={
            "cost_of_revenue": 35_200_000,
            "gross_profit": 35_700_000,
            "operating_expense": 323_400_000,
            "operating_income": -287_700_000,
            "pretax_income": -457_100_000,
            "tax_provision": 3_900_000,
        },
    )

    assert [step.model_dump() for step in steps] == [
        {
            "label": "Revenue",
            "value": 70900000.0,
            "display_value": "$70.9M",
            "step_type": "total",
        },
        {
            "label": "Cost of Revenue",
            "value": -35200000.0,
            "display_value": "-$35.2M",
            "step_type": "delta",
        },
        {
            "label": "Gross Profit",
            "value": 35700000.0,
            "display_value": "$35.7M",
            "step_type": "total",
        },
        {
            "label": "Operating Expenses",
            "value": -323400000.0,
            "display_value": "-$323.4M",
            "step_type": "delta",
        },
        {
            "label": "Operating Profit",
            "value": -287700000.0,
            "display_value": "-$287.7M",
            "step_type": "total",
        },
        {
            "label": "Other Income / Cost",
            "value": -50300000.0,
            "display_value": "-$50.3M",
            "step_type": "delta",
        },
        {
            "label": "Taxes",
            "value": -3900000.0,
            "display_value": "-$3.9M",
            "step_type": "delta",
        },
        {
            "label": "Net Profits",
            "value": -341900000.0,
            "display_value": "-$341.9M",
            "step_type": "total",
        },
    ]


def test_sum_ttm_dividends_uses_only_last_365_days() -> None:
    dividends = {
        date(2024, 4, 18): 0.75,
        date(2024, 7, 18): 0.80,
        date(2024, 10, 17): 0.80,
        date(2025, 1, 16): 0.80,
        date(2025, 4, 17): 0.82,
    }

    assert _sum_ttm_dividends(dividends, as_of=date(2025, 4, 18)) == 3.22


def test_build_normalized_points_ends_series_at_current_quote() -> None:
    history = {
        date(2025, 4, 20): 103.0,
        date(2025, 5, 1): 100.0,
        date(2025, 7, 1): 92.0,
        date(2026, 4, 1): 111.0,
    }

    points = _build_normalized_points(
        history=history,
        ordered_dates=sorted(history.keys()),
        anchor_date=date(2025, 4, 18),
        current_date=date(2026, 4, 18),
        baseline=100.0,
        current_value=115.0,
    )

    assert points[0].value == 100.0
    assert points[0].label == "Apr 2025"
    assert points[-1].value == 115.0
    assert points[-1].label == "Apr 2026"


def test_select_anchor_value_prefers_latest_point_on_or_before_target_date() -> None:
    history = {
        date(2025, 4, 15): 97.0,
        date(2025, 4, 17): 99.5,
        date(2025, 4, 21): 101.0,
    }

    assert _select_anchor_value(history, date(2025, 4, 18)) == 99.5


def test_subtract_years_handles_leap_day() -> None:
    assert _subtract_years(date(2024, 2, 29), 1) == date(2023, 2, 28)
