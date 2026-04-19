from fastapi.testclient import TestClient

from app.clients.yahoo_finance import _format_forward_dividend
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
    assert len(body["performance_chart"]) == 3
    assert body["performance_chart"][0]["symbol"] == "MSFT"
    assert body["performance_chart"][0]["points"][0] == {
        "label": "Mar 18",
        "value": 100.0,
    }
    assert body["performance_chart"][1]["symbol"] == "^GSPC"
    assert body["performance_chart"][2]["symbol"] == "XLK"


def test_company_workspace_fixture_404(monkeypatch) -> None:
    monkeypatch.setenv("FVS_MARKET_DATA_PROVIDER", "fixture")

    response = client.get("/companies/ZZZZ/workspace")

    assert response.status_code == 404


def test_format_forward_dividend_uses_yfinance_percent_points() -> None:
    assert _format_forward_dividend(1.04, 0.38) == "1.04 (0.38%)"
