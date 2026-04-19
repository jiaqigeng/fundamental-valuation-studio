from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from datetime import UTC, datetime
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path
from threading import Lock

import yfinance as yf

from app.schemas.company_workspace import (
    CompanyWorkspaceSnapshot,
    MarketContextCard,
    PerformancePoint,
    PerformanceSeries,
    QuoteDetail,
)


YFINANCE_CACHE_DIR = Path(__file__).resolve().parents[2] / "tmp" / "yfinance-cache"
_CACHE_CONFIGURED = False
_CACHE_LOCK = Lock()

SECTOR_INDEXES: dict[str, tuple[str, str]] = {
    "Basic Materials": ("XLB", "Materials sector benchmark"),
    "Communication Services": ("XLC", "Communication Services sector benchmark"),
    "Consumer Cyclical": ("XLY", "Consumer Discretionary sector benchmark"),
    "Consumer Defensive": ("XLP", "Consumer Staples sector benchmark"),
    "Consumer Discretionary": ("XLY", "Consumer Discretionary sector benchmark"),
    "Consumer Staples": ("XLP", "Consumer Staples sector benchmark"),
    "Energy": ("XLE", "Energy sector benchmark"),
    "Financial Services": ("XLF", "Financials sector benchmark"),
    "Financials": ("XLF", "Financials sector benchmark"),
    "Healthcare": ("XLV", "Health Care sector benchmark"),
    "Health Care": ("XLV", "Health Care sector benchmark"),
    "Industrials": ("XLI", "Industrials sector benchmark"),
    "Real Estate": ("XLRE", "Real Estate sector benchmark"),
    "Technology": ("XLK", "Technology sector benchmark"),
    "Utilities": ("XLU", "Utilities sector benchmark"),
}


class YahooFinanceLookupError(RuntimeError):
    """Raised when Yahoo Finance data is missing or unavailable."""


@dataclass(frozen=True)
class YahooWorkspacePayload:
    company_info: dict
    market_contexts: list[MarketContextCard]
    performance_chart: list[PerformanceSeries]


class YahooFinanceClient:
    def __init__(self, timeout: float = 10.0) -> None:
        self._timeout = timeout
        _configure_yfinance_cache()

    def fetch_company_workspace_snapshot(self, ticker: str) -> CompanyWorkspaceSnapshot:
        payload = self._fetch_payload(ticker)
        info = payload.company_info

        name = (
            _string_field(info, "longName")
            or _string_field(info, "shortName")
            or ticker
        )
        sector = _string_field(info, "sector") or "Unknown sector"
        summary_text = _string_field(info, "longBusinessSummary") or (
            "Yahoo Finance returned market data for this company, but not a long "
            "business summary."
        )
        current_price = _first_number(
            info.get("currentPrice"),
            info.get("regularMarketPrice"),
        )
        market_cap = _first_number(info.get("marketCap"))
        company_daily_change = _format_daily_change(
            _first_number(info.get("regularMarketChange")),
            _first_number(info.get("regularMarketChangePercent")),
        )

        return CompanyWorkspaceSnapshot(
            ticker=ticker,
            name=name,
            sector=sector,
            summary=summary_text,
            workspace_tagline=(
                "yfinance-backed market snapshot ready for deeper context, "
                "sector context, valuation work, and AI analysis."
            ),
            current_price_display=_format_currency(current_price),
            market_cap_display=_format_compact_currency(market_cap),
            quote_details=[
                QuoteDetail(
                    label="Previous Close",
                    value=_format_number(_first_number(info.get("previousClose"))),
                ),
                QuoteDetail(
                    label="Open",
                    value=_format_number(_first_number(info.get("open"))),
                ),
                QuoteDetail(
                    label="Bid",
                    value=_format_bid_ask(info.get("bid"), info.get("bidSize")),
                ),
                QuoteDetail(
                    label="Ask",
                    value=_format_bid_ask(info.get("ask"), info.get("askSize")),
                ),
                QuoteDetail(
                    label="Day's Range",
                    value=_format_range(info.get("dayLow"), info.get("dayHigh")),
                ),
                QuoteDetail(
                    label="52 Week Range",
                    value=_format_range(
                        info.get("fiftyTwoWeekLow"),
                        info.get("fiftyTwoWeekHigh"),
                    ),
                ),
                QuoteDetail(
                    label="Volume",
                    value=_format_integer(info.get("volume")),
                ),
                QuoteDetail(
                    label="Avg. Volume",
                    value=_format_integer(_first_number(info.get("averageVolume"))),
                ),
                QuoteDetail(
                    label="Market Cap (intraday)",
                    value=_format_compact_number(market_cap),
                ),
                QuoteDetail(
                    label="Beta (5Y Monthly)",
                    value=_format_number(_first_number(info.get("beta"))),
                ),
                QuoteDetail(
                    label="PE Ratio (TTM)",
                    value=_format_number(_first_number(info.get("trailingPE"))),
                ),
                QuoteDetail(
                    label="EPS (TTM)",
                    value=_format_number(_first_number(info.get("trailingEps"))),
                ),
                QuoteDetail(
                    label="Earnings Date",
                    value=_format_date(
                        _first_number(
                            info.get("earningsTimestamp"),
                            info.get("earningsTimestampStart"),
                            info.get("earningsTimestampEnd"),
                        ),
                    ),
                ),
                QuoteDetail(
                    label="Forward Dividend & Yield",
                    value=_format_forward_dividend(
                        _first_number(info.get("dividendRate")),
                        _first_number(info.get("dividendYield")),
                    ),
                ),
                QuoteDetail(
                    label="Ex-Dividend Date",
                    value=_format_date(_first_number(info.get("exDividendDate"))),
                ),
            ],
            market_contexts=payload.market_contexts,
            performance_chart=payload.performance_chart,
        )

    def _fetch_payload(self, ticker: str) -> YahooWorkspacePayload:
        try:
            company_info = dict(yf.Ticker(ticker).info)
        except Exception as exc:  # pragma: no cover - upstream library errors vary.
            raise YahooFinanceLookupError(
                f"yfinance request failed for ticker {ticker}."
            ) from exc

        if _looks_like_missing_ticker(company_info):
            raise YahooFinanceLookupError(
                f"Yahoo Finance returned no result for ticker {ticker}."
            )

        sector = _string_field(company_info, "sector") or "Unknown sector"
        current_price = _first_number(
            company_info.get("currentPrice"),
            company_info.get("regularMarketPrice"),
        )
        company_daily_change = _format_daily_change(
            _first_number(company_info.get("regularMarketChange")),
            _first_number(company_info.get("regularMarketChangePercent")),
        )
        benchmark_symbol, benchmark_label = SECTOR_INDEXES.get(
            sector,
            ("XLK", "Sector benchmark"),
        )
        market_contexts = [
            _build_market_context_card(
                label="S&P 500",
                symbol="^GSPC",
                description="Broad-market baseline for the current U.S. session.",
            ),
            _build_market_context_card(
                label=benchmark_label,
                symbol=benchmark_symbol,
                description="Sector proxy chosen from the company's reported sector.",
            ),
        ]

        return YahooWorkspacePayload(
            company_info=company_info,
            market_contexts=market_contexts,
            performance_chart=_build_performance_chart(
                ticker=ticker,
                company_name=_string_field(company_info, "shortName") or ticker,
                company_current_value=_format_currency(current_price),
                company_daily_change=company_daily_change,
                market_contexts=market_contexts,
            ),
        )


def _configure_yfinance_cache() -> None:
    global _CACHE_CONFIGURED
    if _CACHE_CONFIGURED:
        return

    with _CACHE_LOCK:
        if _CACHE_CONFIGURED:
            return
        YFINANCE_CACHE_DIR.mkdir(parents=True, exist_ok=True)
        yf.set_tz_cache_location(str(YFINANCE_CACHE_DIR))
        _CACHE_CONFIGURED = True


def _build_market_context_card(
    *,
    label: str,
    symbol: str,
    description: str,
) -> MarketContextCard:
    try:
        info = dict(yf.Ticker(symbol).info)
    except Exception as exc:  # pragma: no cover - upstream library errors vary.
        raise YahooFinanceLookupError(
            f"yfinance request failed for symbol {symbol}."
        ) from exc

    if _looks_like_missing_ticker(info):
        raise YahooFinanceLookupError(
            f"Yahoo Finance returned no result for symbol {symbol}."
        )

    return MarketContextCard(
        label=label,
        symbol=symbol,
        value=_format_metric_value(
            _first_number(
                info.get("regularMarketPrice"),
                info.get("currentPrice"),
            ),
        ),
        daily_change=_format_daily_change(
            _first_number(info.get("regularMarketChange")),
            _first_number(info.get("regularMarketChangePercent")),
        ),
        description=description,
    )


def _build_performance_chart(
    *,
    ticker: str,
    company_name: str,
    company_current_value: str,
    company_daily_change: str,
    market_contexts: list[MarketContextCard],
) -> list[PerformanceSeries]:
    comparison_series = [
        (
            company_name,
            ticker,
            company_current_value,
            company_daily_change,
            "#21409A",
        ),
        (
            market_contexts[0].label,
            market_contexts[0].symbol,
            market_contexts[0].value,
            market_contexts[0].daily_change,
            "#0F766E",
        ),
        (
            market_contexts[1].label,
            market_contexts[1].symbol,
            market_contexts[1].value,
            market_contexts[1].daily_change,
            "#C48A2C",
        ),
    ]

    history_by_symbol = {
        symbol: _fetch_history_points(symbol) for _, symbol, _, _, _ in comparison_series
    }
    common_dates = sorted(
        set.intersection(*(set(history.keys()) for history in history_by_symbol.values()))
    )[-20:]

    if len(common_dates) < 2:
        raise YahooFinanceLookupError(
            f"Yahoo Finance returned insufficient history to compare ticker {ticker}."
        )

    chart_series: list[PerformanceSeries] = []
    for label, symbol, current_value, daily_change, line_color in comparison_series:
        history = history_by_symbol[symbol]
        baseline = history[common_dates[0]]
        chart_series.append(
            PerformanceSeries(
                label=label,
                symbol=symbol,
                current_value=current_value,
                daily_change=daily_change,
                line_color=line_color,
                points=[
                    PerformancePoint(
                        label=_format_history_label(point_date),
                        value=_normalize_history_value(history[point_date], baseline),
                    )
                    for point_date in common_dates
                ],
            )
        )

    return chart_series


def _fetch_history_points(symbol: str) -> dict[date, float]:
    try:
        history = yf.Ticker(symbol).history(period="1mo", interval="1d", auto_adjust=False)
    except Exception as exc:  # pragma: no cover - upstream library errors vary.
        raise YahooFinanceLookupError(
            f"yfinance history request failed for symbol {symbol}."
        ) from exc

    close_history = history.get("Close")
    if close_history is None:
        raise YahooFinanceLookupError(
            f"Yahoo Finance returned no close history for symbol {symbol}."
        )

    history_points: dict[date, float] = {}
    for timestamp, close_value in close_history.items():
        if isinstance(close_value, (int, float)):
            history_points[timestamp.to_pydatetime().date()] = float(close_value)

    if not history_points:
        raise YahooFinanceLookupError(
            f"Yahoo Finance returned empty history for symbol {symbol}."
        )

    return history_points


def _format_history_label(value: date) -> str:
    return value.strftime("%b %d").replace(" 0", " ")


def _normalize_history_value(value: float, baseline: float) -> float:
    if baseline == 0:
        return 100.0
    normalized = Decimal(str((value / baseline) * 100)).quantize(
        Decimal("0.01"), rounding=ROUND_HALF_UP
    )
    return float(normalized)


def _string_field(payload: dict, key: str) -> str | None:
    value = payload.get(key)
    if isinstance(value, str) and value.strip():
        return value.strip()
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


def _format_metric_value(value: float | int | None) -> str:
    if value is None:
        return "N/A"
    return f"{float(value):,.2f}"


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


def _looks_like_missing_ticker(info: dict) -> bool:
    if not info:
        return True
    if _string_field(info, "symbol") or _string_field(info, "shortName"):
        return False
    if _first_number(info.get("regularMarketPrice"), info.get("currentPrice")) is not None:
        return False
    quote_type = _string_field(info, "quoteType")
    if quote_type and quote_type.lower() == "none":
        return True
    return True


def _format_daily_change(
    change: float | int | None,
    change_percent: float | int | None,
) -> str:
    if change is None and change_percent is None:
        return "N/A"
    change_text = _format_signed_number(change)
    percent_text = _format_signed_percent(change_percent)
    if change_text == "N/A":
        return percent_text
    if percent_text == "N/A":
        return change_text
    return f"{change_text} ({percent_text})"


def _format_signed_number(value: float | int | None) -> str:
    if value is None:
        return "N/A"
    decimal_text = _decimal_text(abs(float(value)), "0.01")
    sign = "+" if float(value) >= 0 else "-"
    return f"{sign}{decimal_text}"


def _format_signed_percent(value: float | int | None) -> str:
    if value is None:
        return "N/A"
    decimal_text = _decimal_text(abs(float(value)), "0.01")
    sign = "+" if float(value) >= 0 else "-"
    return f"{sign}{decimal_text}%"


def _format_forward_dividend(
    dividend_rate: float | int | None,
    dividend_yield: float | int | None,
) -> str:
    if dividend_rate is None and dividend_yield is None:
        return "N/A"

    rate_text = _format_number(dividend_rate) if dividend_rate is not None else "N/A"
    if dividend_yield is None:
        return rate_text

    yield_percent = Decimal(str(float(dividend_yield))).quantize(
        Decimal("0.01"), rounding=ROUND_HALF_UP
    )
    return f"{rate_text} ({yield_percent}%)"
