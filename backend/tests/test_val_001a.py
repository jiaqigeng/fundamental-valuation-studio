from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_dcf_endpoint_returns_projected_fcf_and_intrinsic_value_per_share() -> None:
    response = client.post(
        "/valuations/dcf",
        json={
            "current_revenue": 1000.0,
            "revenue_growth_rate": 0.08,
            "operating_margin": 0.22,
            "tax_rate": 0.21,
            "sales_to_capital_ratio": 2.5,
            "wacc": 0.09,
            "terminal_growth_rate": 0.03,
            "shares_outstanding": 100.0,
            "net_debt": 150.0,
            "projection_years": 5,
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert len(body["projections"]) == 5
    assert body["projections"][0] == {
        "year": 1,
        "revenue": 1080.0,
        "operating_income": 237.6,
        "nopat": 187.704,
        "reinvestment": 32.0,
        "free_cash_flow": 155.704,
        "present_value": 142.84770642201835,
    }
    assert body["projections"][-1]["free_cash_flow"] == 211.83357302784006
    assert body["terminal_free_cash_flow"] == 245.39835941867528
    assert body["enterprise_value"] == 3359.4545183602745
    assert body["equity_value"] == 3209.4545183602745
    assert body["intrinsic_value_per_share"] == 32.09454518360275


def test_dcf_endpoint_rejects_terminal_growth_at_or_above_wacc() -> None:
    response = client.post(
        "/valuations/dcf",
        json={
            "current_revenue": 1000.0,
            "revenue_growth_rate": 0.08,
            "operating_margin": 0.22,
            "wacc": 0.03,
            "terminal_growth_rate": 0.03,
            "shares_outstanding": 100.0,
        },
    )

    assert response.status_code == 422
    assert "Terminal growth rate must be below WACC." in response.text
