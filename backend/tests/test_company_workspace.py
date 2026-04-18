from fastapi.testclient import TestClient

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


def test_company_workspace_fixture_404(monkeypatch) -> None:
    monkeypatch.setenv("FVS_MARKET_DATA_PROVIDER", "fixture")

    response = client.get("/companies/ZZZZ/workspace")

    assert response.status_code == 404
