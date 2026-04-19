from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from datetime import UTC, datetime
from datetime import timedelta
from decimal import Decimal, ROUND_HALF_UP
from numbers import Real
from pathlib import Path
from threading import Lock

import yfinance as yf

from app.schemas.company_workspace import (
    CompanyWorkspaceSnapshot,
    IncomeStatementWaterfallStep,
    MarketContextCard,
    PerformanceChartRange,
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

PERFORMANCE_RANGE_SPECS: tuple[tuple[str, str, int, str, str], ...] = (
    ("1Y", "1 year", 1, "1y", "1mo"),
    ("5Y", "5 year", 5, "5y", "3mo"),
)


class YahooFinanceLookupError(RuntimeError):
    """Raised when Yahoo Finance data is missing or unavailable."""


@dataclass(frozen=True)
class YahooWorkspacePayload:
    company_info: dict
    market_contexts: list[MarketContextCard]
    performance_chart_ranges: list[PerformanceChartRange]


@dataclass(frozen=True)
class MarketContextSnapshot:
    card: MarketContextCard
    current_value_number: float | int | None


@dataclass(frozen=True)
class ComparisonSeriesSeed:
    label: str
    symbol: str
    current_value_display: str
    current_value_number: float | int | None
    daily_change: str
    line_color: str


class YahooFinanceClient:
    def __init__(self, timeout: float = 10.0) -> None:
        self._timeout = timeout
        _configure_yfinance_cache()

    def fetch_company_workspace_snapshot(self, ticker: str) -> CompanyWorkspaceSnapshot:
        payload = self._fetch_payload(ticker)
        info = payload.company_info
        trailing_ttm_dividend = _fetch_ttm_dividend(ticker)

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
            income_statement_waterfall=_build_income_statement_waterfall(
                ticker=ticker,
                info=info,
            ),
            quote_details=_build_quote_details(
                info,
                current_price=current_price,
                trailing_ttm_dividend=trailing_ttm_dividend,
            ),
            market_contexts=payload.market_contexts,
            performance_chart_ranges=payload.performance_chart_ranges,
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
        market_context_snapshots = [
            _build_market_context_snapshot(
                label="S&P 500",
                symbol="^GSPC",
                description="Broad-market baseline for the current U.S. session.",
            ),
            _build_market_context_snapshot(
                label=benchmark_label,
                symbol=benchmark_symbol,
                description="Sector proxy chosen from the company's reported sector.",
            ),
        ]
        market_contexts = [snapshot.card for snapshot in market_context_snapshots]
        comparison_series = [
            ComparisonSeriesSeed(
                label=_string_field(company_info, "shortName") or ticker,
                symbol=ticker,
                current_value_display=_format_currency(current_price),
                current_value_number=current_price,
                daily_change=company_daily_change,
                line_color="#21409A",
            ),
            ComparisonSeriesSeed(
                label=market_context_snapshots[0].card.label,
                symbol=market_context_snapshots[0].card.symbol,
                current_value_display=market_context_snapshots[0].card.value,
                current_value_number=market_context_snapshots[0].current_value_number,
                daily_change=market_context_snapshots[0].card.daily_change,
                line_color="#0F766E",
            ),
            ComparisonSeriesSeed(
                label=market_context_snapshots[1].card.label,
                symbol=market_context_snapshots[1].card.symbol,
                current_value_display=market_context_snapshots[1].card.value,
                current_value_number=market_context_snapshots[1].current_value_number,
                daily_change=market_context_snapshots[1].card.daily_change,
                line_color="#C48A2C",
            ),
        ]

        return YahooWorkspacePayload(
            company_info=company_info,
            market_contexts=market_contexts,
            performance_chart_ranges=_build_performance_chart_ranges(
                ticker=ticker,
                comparison_series=comparison_series,
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


def _build_market_context_snapshot(
    *,
    label: str,
    symbol: str,
    description: str,
) -> MarketContextSnapshot:
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

    current_value = _first_number(
        info.get("regularMarketPrice"),
        info.get("currentPrice"),
    )
    return MarketContextSnapshot(
        card=MarketContextCard(
            label=label,
            symbol=symbol,
            value=_format_metric_value(current_value),
            daily_change=_format_daily_change(
                _first_number(info.get("regularMarketChange")),
                _first_number(info.get("regularMarketChangePercent")),
            ),
            description=description,
        ),
        current_value_number=current_value,
    )


def _build_quote_details(
    info: dict,
    *,
    current_price: float | int | None,
    trailing_ttm_dividend: float | None = None,
) -> list[QuoteDetail]:
    trailing_pe = _resolve_ratio(
        direct_value=_first_number(info.get("trailingPE")),
        numerator=current_price,
        denominator=_first_number(info.get("trailingEps")),
    )
    forward_pe = _resolve_ratio(
        direct_value=_first_number(info.get("forwardPE")),
        numerator=current_price,
        denominator=_first_number(info.get("forwardEps")),
    )
    price_to_book = _resolve_ratio(
        direct_value=_first_number(info.get("priceToBook")),
        numerator=current_price,
        denominator=_first_number(info.get("bookValue")),
    )
    ev_to_ebitda = _resolve_ratio(
        direct_value=_first_number(info.get("enterpriseToEbitda")),
        numerator=_first_number(info.get("enterpriseValue")),
        denominator=_first_number(info.get("ebitda")),
    )
    ev_to_revenue = _resolve_ratio(
        direct_value=_first_number(info.get("enterpriseToRevenue")),
        numerator=_first_number(info.get("enterpriseValue")),
        denominator=_first_number(info.get("totalRevenue")),
    )

    quote_details = [
        _optional_quote_detail("Trailing P/E (TTM)", _format_optional_number(trailing_pe)),
        _optional_quote_detail("Forward P/E", _format_optional_number(forward_pe)),
        _optional_quote_detail("Price to Book", _format_optional_number(price_to_book)),
        _optional_quote_detail("EV / EBITDA", _format_optional_number(ev_to_ebitda)),
        _optional_quote_detail("EV / Revenue", _format_optional_number(ev_to_revenue)),
        _optional_quote_detail(
            "PEG Ratio",
            _format_optional_number(_first_number(info.get("pegRatio"))),
        ),
        _optional_quote_detail(
            "Debt to Equity",
            _format_optional_suffix_percent(_first_number(info.get("debtToEquity"))),
        ),
        _optional_quote_detail(
            "Beta (5Y Monthly)",
            _format_optional_number(_first_number(info.get("beta"))),
        ),
        _optional_quote_detail(
            "Return on Equity (ROE)",
            _format_optional_percent(_first_number(info.get("returnOnEquity"))),
        ),
        _optional_quote_detail(
            "Return on Assets (ROA)",
            _format_optional_percent(_first_number(info.get("returnOnAssets"))),
        ),
        _optional_quote_detail(
            "Forward Dividend & Yield",
            _format_optional_forward_dividend(
                _first_number(info.get("dividendRate")),
                _first_number(info.get("dividendYield")),
            ),
        ),
        _optional_quote_detail(
            "Trailing Dividend (TTM)",
            _format_optional_number(trailing_ttm_dividend),
        ),
        _optional_quote_detail(
            "Avg. Volume (3M)",
            _format_optional_integer(_first_number(info.get("averageVolume"))),
        ),
        _optional_quote_detail(
            "Earnings Date",
            _format_optional_date(
                _first_number(
                    info.get("earningsTimestamp"),
                    info.get("earningsTimestampStart"),
                    info.get("earningsTimestampEnd"),
                )
            ),
        ),
        _optional_quote_detail(
            "Ex-Dividend Date",
            _format_optional_date(_first_number(info.get("exDividendDate"))),
        ),
    ]

    return [detail for detail in quote_details if detail is not None]


INCOME_STATEMENT_ROW_ALIASES: dict[str, tuple[str, ...]] = {
    "revenue": ("Total Revenue", "Operating Revenue"),
    "cost_of_revenue": ("Cost Of Revenue",),
    "gross_profit": ("Gross Profit",),
    "operating_expense": ("Operating Expense", "Operating Expenses"),
    "operating_income": (
        "Operating Income",
        "Total Operating Income As Reported",
    ),
    "pretax_income": ("Pretax Income", "Pre Tax Income"),
    "tax_provision": ("Tax Provision", "Provision For Income Taxes"),
    "net_income": (
        "Net Income",
        "Net Income Common Stockholders",
        "Net Income From Continuing Ops",
    ),
}


def _build_income_statement_waterfall(
    *,
    ticker: str,
    info: dict,
) -> list[IncomeStatementWaterfallStep]:
    statement_values = _fetch_income_statement_values(ticker)
    return _build_income_statement_waterfall_from_values(
        info=info,
        statement_values=statement_values,
    )


def _build_income_statement_waterfall_from_values(
    *,
    info: dict,
    statement_values: dict[str, float],
) -> list[IncomeStatementWaterfallStep]:
    revenue = _first_number(
        statement_values.get("revenue"),
        info.get("totalRevenue"),
    )
    net_income = _first_number(
        statement_values.get("net_income"),
        info.get("netIncomeToCommon"),
        info.get("netIncome"),
    )
    gross_profit = _first_number(
        statement_values.get("gross_profit"),
        info.get("grossProfits"),
    )
    operating_income = _first_number(statement_values.get("operating_income"))
    pretax_income = _first_number(statement_values.get("pretax_income"))

    if revenue is None or net_income is None:
        return []

    cost_of_revenue = _first_number(statement_values.get("cost_of_revenue"))
    if cost_of_revenue is None and gross_profit is not None:
        cost_of_revenue = max(float(revenue) - float(gross_profit), 0.0)
    if cost_of_revenue is None:
        cost_of_revenue = 0.0

    gross_profit_value = _first_number(gross_profit)
    if gross_profit_value is None:
        gross_profit_value = float(revenue) - abs(float(cost_of_revenue))

    operating_expense = _first_number(statement_values.get("operating_expense"))
    if (
        operating_expense is None
        and gross_profit_value is not None
        and operating_income is not None
    ):
        operating_expense = max(
            float(gross_profit_value) - float(operating_income),
            0.0,
        )
    if operating_expense is None:
        operating_expense = 0.0

    operating_profit_value = _first_number(operating_income)
    if operating_profit_value is None:
        operating_profit_value = float(gross_profit_value) - abs(float(operating_expense))

    tax_provision = _first_number(statement_values.get("tax_provision"))
    if tax_provision is None and pretax_income is not None:
        tax_provision = float(pretax_income) - float(net_income)
    if tax_provision is None:
        tax_provision = 0.0

    revenue_value = float(revenue)
    cost_of_revenue_delta = -_expense_magnitude(cost_of_revenue)
    operating_expense_delta = -_expense_magnitude(operating_expense)
    taxes_delta = -float(tax_provision)

    other_income_or_cost_delta = (
        float(net_income)
        - float(operating_profit_value)
        - float(taxes_delta)
    )
    if abs(other_income_or_cost_delta) < 0.005:
        other_income_or_cost_delta = 0.0

    return [
        _build_waterfall_step("Revenue", revenue_value, "total"),
        _build_waterfall_step("Cost of Revenue", cost_of_revenue_delta, "delta"),
        _build_waterfall_step("Gross Profit", float(gross_profit_value), "total"),
        _build_waterfall_step("Operating Expenses", operating_expense_delta, "delta"),
        _build_waterfall_step("Operating Profit", float(operating_profit_value), "total"),
        _build_waterfall_step("Other Income / Cost", other_income_or_cost_delta, "delta"),
        _build_waterfall_step("Taxes", taxes_delta, "delta"),
        _build_waterfall_step("Net Profits", float(net_income), "total"),
    ]


def _fetch_income_statement_values(ticker: str) -> dict[str, float]:
    try:
        statement = yf.Ticker(ticker).income_stmt
    except Exception:
        return {}

    if statement is None or getattr(statement, "empty", True):
        return {}

    values: dict[str, float] = {}
    for field_name, aliases in INCOME_STATEMENT_ROW_ALIASES.items():
        value = _lookup_statement_value(statement, aliases)
        if value is not None:
            values[field_name] = value

    return values


def _lookup_statement_value(statement: object, aliases: tuple[str, ...]) -> float | None:
    index = getattr(statement, "index", [])
    columns = getattr(statement, "columns", [])

    for alias in aliases:
        if alias not in index:
            continue

        row = statement.loc[alias]
        for column in columns:
            value = row[column]
            if _is_number(value):
                return float(value)

    return None


def _expense_magnitude(value: float | int | None) -> float:
    if value is None:
        return 0.0
    return abs(float(value))


def _build_waterfall_step(
    label: str,
    value: float,
    step_type: str,
) -> IncomeStatementWaterfallStep:
    rounded_value = float(
        Decimal(str(value)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    )
    return IncomeStatementWaterfallStep(
        label=label,
        value=rounded_value,
        display_value=_format_signed_compact_currency(rounded_value),
        step_type=step_type,
    )


def _build_performance_chart_ranges(
    *,
    ticker: str,
    comparison_series: list[ComparisonSeriesSeed],
) -> list[PerformanceChartRange]:
    chart_ranges: list[PerformanceChartRange] = []
    last_error: YahooFinanceLookupError | None = None

    for range_key, label, years, period, interval in PERFORMANCE_RANGE_SPECS:
        try:
            chart_ranges.append(
                PerformanceChartRange(
                    range_key=range_key,
                    label=label,
                    series=_build_performance_chart(
                        ticker=ticker,
                        comparison_series=comparison_series,
                        years=years,
                        period=period,
                        interval=interval,
                    ),
                )
            )
        except YahooFinanceLookupError as exc:
            last_error = exc

    if chart_ranges:
        return chart_ranges

    if last_error is not None:
        raise last_error

    raise YahooFinanceLookupError(
        f"Yahoo Finance returned insufficient history to compare ticker {ticker}."
    )


def _build_performance_chart(
    *,
    ticker: str,
    comparison_series: list[ComparisonSeriesSeed],
    years: int,
    period: str,
    interval: str,
) -> list[PerformanceSeries]:
    current_date = datetime.now(UTC).date()
    anchor_date = _subtract_years(current_date, years)
    history_by_symbol = {
        symbol: _fetch_history_points(symbol, period=period, interval=interval)
        for symbol in {series.symbol for series in comparison_series}
    }
    anchor_value_by_symbol = {
        symbol: _fetch_anchor_value(symbol, anchor_date)
        for symbol in {series.symbol for series in comparison_series}
    }
    common_dates = sorted(
        set.intersection(*(set(history.keys()) for history in history_by_symbol.values()))
    )

    if len(common_dates) < 2:
        raise YahooFinanceLookupError(
            f"Yahoo Finance returned insufficient history to compare ticker {ticker}."
        )

    chart_series: list[PerformanceSeries] = []
    for series in comparison_series:
        chart_series.append(
            PerformanceSeries(
                label=series.label,
                symbol=series.symbol,
                current_value=series.current_value_display,
                daily_change=series.daily_change,
                line_color=series.line_color,
                points=_build_normalized_points(
                    history=history_by_symbol[series.symbol],
                    ordered_dates=common_dates,
                    anchor_date=anchor_date,
                    current_date=current_date,
                    baseline=anchor_value_by_symbol[series.symbol],
                    current_value=series.current_value_number,
                ),
            )
        )

    return chart_series


def _build_normalized_points(
    *,
    history: dict[date, float],
    ordered_dates: list[date],
    anchor_date: date,
    current_date: date,
    baseline: float,
    current_value: float | int | None,
) -> list[PerformancePoint]:
    anchor_label = _format_history_label(anchor_date)
    current_label = _format_history_label(current_date)
    points = [PerformancePoint(label=anchor_label, value=100.0)]

    for point_date in ordered_dates:
        if point_date <= anchor_date:
            continue

        point_label = _format_history_label(point_date)
        if point_label in {anchor_label, current_label}:
            continue

        points.append(
            PerformancePoint(
                label=point_label,
                value=_normalize_history_value(history[point_date], baseline),
            )
        )

    if current_value is not None:
        points.append(
            PerformancePoint(
                label=current_label,
                value=_normalize_history_value(float(current_value), baseline),
            )
        )

    return points


def _fetch_history_points(
    symbol: str,
    *,
    period: str,
    interval: str,
) -> dict[date, float]:
    try:
        history = yf.Ticker(symbol).history(
            period=period,
            interval=interval,
            auto_adjust=False,
        )
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
        if _is_number(close_value):
            history_points[timestamp.to_pydatetime().date()] = float(close_value)

    if not history_points:
        raise YahooFinanceLookupError(
            f"Yahoo Finance returned empty history for symbol {symbol}."
        )

    return history_points


def _fetch_ttm_dividend(ticker: str) -> float | None:
    try:
        dividends = yf.Ticker(ticker).dividends
    except Exception:
        return None

    if dividends is None:
        return None

    dividend_points: dict[date, float] = {}
    for timestamp, dividend_value in dividends.items():
        if _is_number(dividend_value):
            dividend_points[timestamp.to_pydatetime().date()] = float(dividend_value)

    return _sum_ttm_dividends(dividend_points, as_of=datetime.now(UTC).date())


def _sum_ttm_dividends(
    dividend_points: dict[date, float],
    *,
    as_of: date,
) -> float | None:
    if not dividend_points:
        return None

    window_start = as_of - timedelta(days=365)
    total = sum(
        dividend
        for point_date, dividend in dividend_points.items()
        if window_start < point_date <= as_of
    )
    if total <= 0:
        return None
    return float(
        Decimal(str(total)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    )


def _fetch_anchor_value(symbol: str, target_date: date) -> float:
    history = _fetch_history_points_for_dates(
        symbol,
        start_date=target_date - timedelta(days=14),
        end_date=target_date + timedelta(days=14),
        interval="1d",
    )
    return _select_anchor_value(history, target_date)


def _fetch_history_points_for_dates(
    symbol: str,
    *,
    start_date: date,
    end_date: date,
    interval: str,
) -> dict[date, float]:
    try:
        history = yf.Ticker(symbol).history(
            start=start_date.isoformat(),
            end=(end_date + timedelta(days=1)).isoformat(),
            interval=interval,
            auto_adjust=False,
        )
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
        if _is_number(close_value):
            history_points[timestamp.to_pydatetime().date()] = float(close_value)

    if not history_points:
        raise YahooFinanceLookupError(
            f"Yahoo Finance returned empty history for symbol {symbol}."
        )

    return history_points


def _select_anchor_value(history: dict[date, float], target_date: date) -> float:
    dates = sorted(history)
    on_or_before = [point_date for point_date in dates if point_date <= target_date]
    if on_or_before:
        return history[on_or_before[-1]]

    on_or_after = [point_date for point_date in dates if point_date > target_date]
    if on_or_after:
        return history[on_or_after[0]]

    raise YahooFinanceLookupError(
        f"Yahoo Finance returned no usable anchor point near {target_date.isoformat()}."
    )


def _subtract_years(value: date, years: int) -> date:
    try:
        return value.replace(year=value.year - years)
    except ValueError:
        return value.replace(month=2, day=28, year=value.year - years)


def _format_history_label(value: date) -> str:
    return value.strftime("%b %Y")


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


def _is_number(value: object) -> bool:
    return isinstance(value, Real) and not isinstance(value, bool)


def _first_number(*values: object) -> float | int | None:
    for value in values:
        if _is_number(value):
            return value
    return None


def _resolve_ratio(
    *,
    direct_value: float | int | None,
    numerator: float | int | None,
    denominator: float | int | None,
) -> float | None:
    if direct_value is not None:
        return float(direct_value)
    if numerator is None or denominator in (None, 0):
        return None
    return float(numerator) / float(denominator)


def _optional_quote_detail(label: str, value: str | None) -> QuoteDetail | None:
    if value is None:
        return None
    return QuoteDetail(label=label, value=value)


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
    if not _is_number(price) or not _is_number(size):
        return "N/A"
    return f"{_format_number(price)} x {int(size)}"


def _format_range(low: object, high: object) -> str:
    if not _is_number(low) or not _is_number(high):
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


def _format_signed_compact_currency(value: float | int | None) -> str:
    if value is None:
        return "N/A"
    if float(value) < 0:
        return f"-{_format_compact_currency(abs(float(value)))}"
    return _format_compact_currency(value)


def _format_date(value: float | int | None) -> str:
    if value is None:
        return "N/A"
    dt = datetime.fromtimestamp(float(value), tz=UTC)
    return f"{dt.strftime('%b')} {dt.day}, {dt.year}"


def _format_optional_number(value: float | int | None) -> str | None:
    if value is None:
        return None
    return _format_number(value)


def _format_optional_percent(value: float | int | None) -> str | None:
    if value is None:
        return None
    percent_value = Decimal(str(float(value) * 100)).quantize(
        Decimal("0.01"), rounding=ROUND_HALF_UP
    )
    return f"{percent_value}%"


def _format_optional_suffix_percent(value: float | int | None) -> str | None:
    if value is None:
        return None
    return f"{_format_number(value)}%"


def _format_optional_integer(value: float | int | None) -> str | None:
    if value is None:
        return None
    return _format_integer(value)


def _format_optional_date(value: float | int | None) -> str | None:
    if value is None:
        return None
    return _format_date(value)


def _format_optional_forward_dividend(
    dividend_rate: float | int | None,
    dividend_yield: float | int | None,
) -> str | None:
    formatted = _format_forward_dividend(dividend_rate, dividend_yield)
    if formatted == "N/A":
        return None
    return formatted


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
