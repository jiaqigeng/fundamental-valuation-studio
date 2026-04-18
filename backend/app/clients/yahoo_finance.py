from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime
from decimal import Decimal, ROUND_HALF_UP

import httpx

from app.schemas.company_workspace import CompanyWorkspaceSnapshot, QuoteDetail


QUOTE_URL = "https://query1.finance.yahoo.com/v7/finance/quote"
SUMMARY_URL = "https://query2.finance.yahoo.com/v10/finance/quoteSummary/{ticker}"
YAHOO_HEADERS = {
    "Accept": "application/json",
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36"
    ),
}
SUMMARY_MODULES = "assetProfile,price,summaryDetail,defaultKeyStatistics,calendarEvents"


class YahooFinanceLookupError(RuntimeError):
    """Raised when Yahoo Finance data is missing or unavailable."""


@dataclass(frozen=True)
class YahooWorkspacePayload:
    quote: dict
    summary: dict


class YahooFinanceClient:
    def __init__(self, timeout: float = 10.0) -> None:
        self._timeout = timeout

    def fetch_company_workspace_snapshot(self, ticker: str) -> CompanyWorkspaceSnapshot:
        payload = self._fetch_payload(ticker)
        quote = payload.quote
        summary = payload.summary

        asset_profile = summary.get("assetProfile", {})
        summary_detail = summary.get("summaryDetail", {})
        default_stats = summary.get("defaultKeyStatistics", {})
        calendar_events = summary.get("calendarEvents", {})
        price = summary.get("price", {})

        name = (
            quote.get("longName")
            or quote.get("shortName")
            or _formatted_field(price.get("longName"))
            or _formatted_field(price.get("shortName"))
            or ticker
        )
        sector = asset_profile.get("sector") or "Unknown sector"
        summary_text = asset_profile.get("longBusinessSummary") or (
            "Yahoo Finance returned market data for this company, but not a long "
            "business summary."
        )
        current_price = _first_number(
            quote.get("regularMarketPrice"),
            _raw_field(price.get("regularMarketPrice")),
        )
        market_cap = _first_number(
            quote.get("marketCap"),
            _raw_field(price.get("marketCap")),
        )

        return CompanyWorkspaceSnapshot(
            ticker=ticker,
            name=name,
            sector=sector,
            summary=summary_text,
            workspace_tagline=(
                "Yahoo Finance-backed market snapshot ready for deeper context, "
                "valuation work, and AI analysis."
            ),
            current_price_display=_format_currency(current_price),
            market_cap_display=_format_compact_currency(market_cap),
            quote_details=[
                QuoteDetail(
                    label="Previous Close",
                    value=_format_number(
                        _first_number(
                            quote.get("regularMarketPreviousClose"),
                            _raw_field(summary_detail.get("previousClose")),
                        ),
                    ),
                ),
                QuoteDetail(
                    label="Open",
                    value=_format_number(
                        _first_number(
                            quote.get("regularMarketOpen"),
                            _raw_field(summary_detail.get("open")),
                        ),
                    ),
                ),
                QuoteDetail(
                    label="Bid",
                    value=_format_bid_ask(quote.get("bid"), quote.get("bidSize")),
                ),
                QuoteDetail(
                    label="Ask",
                    value=_format_bid_ask(quote.get("ask"), quote.get("askSize")),
                ),
                QuoteDetail(
                    label="Day's Range",
                    value=_format_range(
                        quote.get("regularMarketDayLow"),
                        quote.get("regularMarketDayHigh"),
                    ),
                ),
                QuoteDetail(
                    label="52 Week Range",
                    value=_format_range(
                        quote.get("fiftyTwoWeekLow"),
                        quote.get("fiftyTwoWeekHigh"),
                    ),
                ),
                QuoteDetail(
                    label="Volume",
                    value=_format_integer(quote.get("regularMarketVolume")),
                ),
                QuoteDetail(
                    label="Avg. Volume",
                    value=_format_integer(
                        _first_number(
                            quote.get("averageDailyVolume3Month"),
                            quote.get("averageVolume"),
                            _raw_field(summary_detail.get("averageVolume")),
                        ),
                    ),
                ),
                QuoteDetail(
                    label="Market Cap (intraday)",
                    value=_format_compact_number(market_cap),
                ),
                QuoteDetail(
                    label="Beta (5Y Monthly)",
                    value=_formatted_field(default_stats.get("beta"))
                    or _format_number(_raw_field(default_stats.get("beta"))),
                ),
                QuoteDetail(
                    label="PE Ratio (TTM)",
                    value=_format_number(
                        _first_number(
                            quote.get("trailingPE"),
                            _raw_field(summary_detail.get("trailingPE")),
                        ),
                    ),
                ),
                QuoteDetail(
                    label="EPS (TTM)",
                    value=_format_number(
                        _first_number(
                            quote.get("epsTrailingTwelveMonths"),
                            _raw_field(default_stats.get("trailingEps")),
                        ),
                    ),
                ),
                QuoteDetail(
                    label="Earnings Date",
                    value=_format_earnings_date(calendar_events.get("earnings")),
                ),
                QuoteDetail(
                    label="Forward Dividend & Yield",
                    value=_format_forward_dividend(
                        _first_number(
                            quote.get("dividendRate"),
                            _raw_field(summary_detail.get("dividendRate")),
                        ),
                        _first_number(
                            quote.get("dividendYield"),
                            _raw_field(summary_detail.get("dividendYield")),
                        ),
                    ),
                ),
                QuoteDetail(
                    label="Ex-Dividend Date",
                    value=_format_date(
                        _first_number(
                            quote.get("exDividendDate"),
                            _raw_field(summary_detail.get("exDividendDate")),
                        ),
                    ),
                ),
            ],
        )

    def _fetch_payload(self, ticker: str) -> YahooWorkspacePayload:
        try:
            with httpx.Client(
                headers=YAHOO_HEADERS,
                timeout=self._timeout,
                follow_redirects=True,
            ) as client:
                quote_response = client.get(
                    QUOTE_URL,
                    params={"symbols": ticker, "lang": "en-US", "region": "US"},
                )
                summary_response = client.get(
                    SUMMARY_URL.format(ticker=ticker),
                    params={
                        "modules": SUMMARY_MODULES,
                        "formatted": "true",
                        "lang": "en-US",
                        "region": "US",
                        "corsDomain": "finance.yahoo.com",
                    },
                )
        except httpx.HTTPError as exc:
            raise YahooFinanceLookupError(
                f"Yahoo Finance request failed for ticker {ticker}."
            ) from exc

        if quote_response.status_code != 200 or summary_response.status_code != 200:
            raise YahooFinanceLookupError(
                f"Yahoo Finance returned {quote_response.status_code} / "
                f"{summary_response.status_code} for ticker {ticker}."
            )

        quote_payload = quote_response.json()
        summary_payload = summary_response.json()

        quote_results = quote_payload.get("quoteResponse", {}).get("result", [])
        summary_results = summary_payload.get("quoteSummary", {}).get("result", [])

        if not quote_results or not summary_results:
            raise YahooFinanceLookupError(
                f"Yahoo Finance returned no result for ticker {ticker}."
            )

        return YahooWorkspacePayload(
            quote=quote_results[0],
            summary=summary_results[0],
        )


def _raw_field(value: object) -> float | int | None:
    if isinstance(value, dict):
        raw_value = value.get("raw")
        if isinstance(raw_value, (int, float)):
            return raw_value
    return None


def _formatted_field(value: object) -> str | None:
    if isinstance(value, dict):
        for key in ("fmt", "longFmt"):
            formatted = value.get(key)
            if isinstance(formatted, str) and formatted:
                return formatted
    return None


def _first_number(*values: object) -> float | int | None:
    for value in values:
        if isinstance(value, (int, float)):
            return value
    return None


def _decimal_text(value: float | int, places: str) -> str:
    quantized = Decimal(str(value)).quantize(Decimal(places), rounding=ROUND_HALF_UP)
    return f"{quantized}"


def _format_currency(value: float | int | None) -> str:
    if value is None:
        return "N/A"
    return f"${_decimal_text(value, '0.01')}"


def _format_number(value: float | int | None) -> str:
    if value is None:
        return "N/A"
    return _decimal_text(value, "0.01")


def _format_integer(value: float | int | None) -> str:
    if value is None:
        return "N/A"
    return f"{int(round(float(value))):,}"


def _format_bid_ask(price: object, size: object) -> str:
    if not isinstance(price, (int, float)) or not isinstance(size, (int, float)):
        return "N/A"
    return f"{_format_number(price)} x {int(size)}"


def _format_range(low: object, high: object) -> str:
    if not isinstance(low, (int, float)) or not isinstance(high, (int, float)):
        return "N/A"
    return f"{_format_number(low)} - {_format_number(high)}"


def _format_compact_number(value: float | int | None) -> str:
    if value is None:
        return "N/A"

    absolute_value = abs(float(value))
    suffixes = (
        (1_000_000_000_000, "T"),
        (1_000_000_000, "B"),
        (1_000_000, "M"),
        (1_000, "K"),
    )
    for threshold, suffix in suffixes:
        if absolute_value >= threshold:
            scaled_value = float(value) / threshold
            return f"{_decimal_text(scaled_value, '0.001')}{suffix}"

    return _format_integer(value)


def _format_compact_currency(value: float | int | None) -> str:
    if value is None:
        return "N/A"

    absolute_value = abs(float(value))
    suffixes = (
        (1_000_000_000_000, "T"),
        (1_000_000_000, "B"),
        (1_000_000, "M"),
        (1_000, "K"),
    )
    for threshold, suffix in suffixes:
        if absolute_value >= threshold:
            scaled_value = Decimal(str(float(value) / threshold)).quantize(
                Decimal("0.1"), rounding=ROUND_HALF_UP
            )
            return f"${scaled_value}{suffix}"

    return _format_currency(value)


def _format_date(value: float | int | None) -> str:
    if value is None:
        return "N/A"
    dt = datetime.fromtimestamp(float(value), tz=UTC)
    return f"{dt.strftime('%b')} {dt.day}, {dt.year}"


def _format_earnings_date(value: object) -> str:
    if not isinstance(value, dict):
        return "N/A"

    earnings_dates = value.get("earningsDate")
    if isinstance(earnings_dates, list):
        for entry in earnings_dates:
            raw_value = _raw_field(entry)
            if raw_value is not None:
                return _format_date(raw_value)

    return "N/A"


def _format_forward_dividend(
    dividend_rate: float | int | None,
    dividend_yield: float | int | None,
) -> str:
    if dividend_rate is None and dividend_yield is None:
        return "N/A"

    rate_text = _format_number(dividend_rate) if dividend_rate is not None else "N/A"
    if dividend_yield is None:
        return rate_text

    yield_percent = Decimal(str(dividend_yield * 100)).quantize(
        Decimal("0.01"), rounding=ROUND_HALF_UP
    )
    return f"{rate_text} ({yield_percent}%)"
