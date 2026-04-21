from fastapi.testclient import TestClient
from pytest import approx

from app.clients.yahoo_finance import YahooFinanceLookupError
from app.main import app
from app.schemas.valuation import DcfBaselineResponse


client = TestClient(app)


def test_dcf_endpoint_returns_projected_fcf_and_intrinsic_value_per_share() -> None:
    response = client.post(
        "/valuations/dcf",
        json={
            "current_free_cash_flow": 100.0,
            "short_term_growth_rate": 0.08,
            "terminal_growth_rate": 0.03,
            "equity_risk_premium": 0.05,
            "risk_free_rate": 0.043,
            "beta": 1.1,
            "discount_rate": 0.10,
            "shares_outstanding": 50.0,
            "total_debt": 120.0,
            "cash_and_cash_equivalents": 20.0,
            "projection_years": 5,
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert len(body["projections"]) == 5
    assert body["projections"][0] == {
        "year": 1,
        "free_cash_flow": 108.0,
        "present_value": approx(98.18181818181817),
    }
    assert body["projections"][-1]["free_cash_flow"] == approx(146.93280768)
    assert body["capm_cost_of_equity"] == approx(0.098)
    assert body["terminal_free_cash_flow"] == approx(151.3407919104)
    assert body["enterprise_value"] == approx(1815.8184042854218)
    assert body["equity_value"] == approx(1715.8184042854218)
    assert body["intrinsic_value_per_share"] == approx(34.316368085708434)


def test_dcf_endpoint_rejects_terminal_growth_at_or_above_discount_rate() -> None:
    response = client.post(
        "/valuations/dcf",
        json={
            "current_free_cash_flow": 100.0,
            "short_term_growth_rate": 0.08,
            "terminal_growth_rate": 0.03,
            "equity_risk_premium": 0.05,
            "discount_rate": 0.03,
            "shares_outstanding": 100.0,
            "projection_years": 5,
        },
    )

    assert response.status_code == 422
    assert "Terminal growth rate must be below the discount rate." in response.text


def test_dcf_endpoint_rejects_projection_horizons_outside_5_or_10_years() -> None:
    response = client.post(
        "/valuations/dcf",
        json={
            "current_free_cash_flow": 100.0,
            "short_term_growth_rate": 0.08,
            "terminal_growth_rate": 0.03,
            "equity_risk_premium": 0.05,
            "discount_rate": 0.09,
            "shares_outstanding": 100.0,
            "projection_years": 7,
        },
    )

    assert response.status_code == 422
    assert "Projection years must be either 5 or 10." in response.text


def test_dcf_baseline_uses_yfinance_backed_values(monkeypatch) -> None:
    baseline = DcfBaselineResponse(
        ticker="AAPL",
        company_name="Apple Inc.",
        sector="Technology",
        current_price=212.48,
        current_price_display="$212.48",
        current_free_cash_flow=99_600_000_000.0,
        current_free_cash_flow_display="$99.6B",
        shares_outstanding=15_100_000_000.0,
        shares_outstanding_display="15.100B",
        total_debt=109_000_000_000.0,
        total_debt_display="$109.0B",
        cash_and_cash_equivalents=62_000_000_000.0,
        cash_and_cash_equivalents_display="$62.0B",
        risk_free_rate=0.043,
        risk_free_rate_display="4.30%",
        beta=1.24,
        beta_display="1.24",
        assumption_notes=[
            "Current free cash flow starts from Yahoo Finance data.",
            "Debt and cash are fetched from Yahoo Finance.",
            "Risk-free rate and beta are fetched from Yahoo Finance.",
        ],
    )

    def fake_fetch_dcf_baseline(self, ticker: str) -> DcfBaselineResponse:
        assert ticker == "AAPL"
        return baseline

    monkeypatch.setattr(
        "app.services.valuation.YahooFinanceClient.fetch_dcf_baseline",
        fake_fetch_dcf_baseline,
    )

    response = client.get("/valuations/dcf/AAPL/baseline")

    assert response.status_code == 200
    body = response.json()
    assert body["ticker"] == "AAPL"
    assert body["current_free_cash_flow"] == 99_600_000_000.0
    assert body["total_debt"] == 109_000_000_000.0
    assert body["cash_and_cash_equivalents"] == 62_000_000_000.0
    assert body["risk_free_rate"] == 0.043
    assert body["beta"] == 1.24


def test_dcf_baseline_returns_404_when_yfinance_has_no_match(monkeypatch) -> None:
    def fake_fetch_dcf_baseline(self, ticker: str) -> DcfBaselineResponse:
        raise YahooFinanceLookupError(
            f"Yahoo Finance returned no result for ticker {ticker}."
        )

    monkeypatch.setattr(
        "app.services.valuation.YahooFinanceClient.fetch_dcf_baseline",
        fake_fetch_dcf_baseline,
    )

    response = client.get("/valuations/dcf/ZZZZ/baseline")

    assert response.status_code == 404
