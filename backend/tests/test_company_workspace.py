from datetime import date

from fastapi.testclient import TestClient

from app.clients.yahoo_finance import _build_quote_details
from app.clients.yahoo_finance import _build_normalized_points
from app.clients.yahoo_finance import _select_anchor_value
from app.clients.yahoo_finance import _subtract_years
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
    assert body["quote_details"] == [
        {"label": "Trailing P/E", "value": "31.64"},
        {"label": "Forward P/E", "value": "28.10"},
        {"label": "Price to Book", "value": "10.78"},
        {"label": "EV / EBITDA", "value": "20.45"},
        {"label": "EV / Revenue", "value": "12.88"},
        {"label": "PEG Ratio", "value": "2.21"},
        {"label": "Return on Equity (ROE)", "value": "33.74%"},
        {"label": "Return on Assets (ROA)", "value": "14.95%"},
        {"label": "Forward Dividend & Yield", "value": "3.64 (0.86%)"},
        {"label": "Avg. Volume", "value": "32,964,050"},
        {"label": "Debt to Equity", "value": "32.11"},
        {"label": "Beta (5Y Monthly)", "value": "1.13"},
        {"label": "Free Cash Flow", "value": "$71.9B"},
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
            "returnOnEquity": 0.1876,
            "dividendRate": 1.04,
            "dividendYield": 0.38,
            "averageVolume": 57_391_204,
            "freeCashflow": 1_250_000_000,
            "earningsTimestampStart": 1_777_687_200,
        },
        current_price=150.0,
    )

    assert [detail.model_dump() for detail in details] == [
        {"label": "Trailing P/E", "value": "22.35"},
        {"label": "Return on Equity (ROE)", "value": "18.76%"},
        {"label": "Forward Dividend & Yield", "value": "1.04 (0.38%)"},
        {"label": "Avg. Volume", "value": "57,391,204"},
        {"label": "Free Cash Flow", "value": "$1.3B"},
        {"label": "Earnings Date", "value": "May 2, 2026"},
    ]


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
