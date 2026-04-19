from datetime import date

from fastapi.testclient import TestClient

from app.clients.yahoo_finance import _build_normalized_points
from app.clients.yahoo_finance import _format_forward_dividend
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
    assert body["quote_details"][0] == {
        "label": "Previous Close",
        "value": "336.02",
    }
    assert body["quote_details"][-1] == {
        "label": "Ex-Dividend Date",
        "value": "Mar 9, 2026",
    }
    assert body["quote_details"][-2] == {
        "label": "Forward Dividend & Yield",
        "value": "3.64 (0.86%)",
    }
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


def test_format_forward_dividend_uses_yfinance_percent_points() -> None:
    assert _format_forward_dividend(1.04, 0.38) == "1.04 (0.38%)"


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
