from typing import Literal

from pydantic import BaseModel


class QuoteDetail(BaseModel):
    label: str
    value: str


class IncomeStatementWaterfallStep(BaseModel):
    label: str
    value: float
    display_value: str
    step_type: Literal["total", "delta"]


class RevenueSegment(BaseModel):
    label: str
    value: float
    display_value: str
    share_of_total: float


class RevenueSegmentBreakdown(BaseModel):
    total_revenue: float
    total_revenue_display: str
    segments: list[RevenueSegment]


class FinancialBridgePeriod(BaseModel):
    period_key: Literal["year", "quarter"]
    label: str
    period_label: str
    date_range_label: str
    income_statement_waterfall: list[IncomeStatementWaterfallStep]
    revenue_segment_breakdown: RevenueSegmentBreakdown | None = None


class MarketContextCard(BaseModel):
    label: str
    symbol: str
    value: str
    daily_change: str
    description: str


class PerformancePoint(BaseModel):
    label: str
    value: float


class PerformanceSeries(BaseModel):
    label: str
    symbol: str
    current_value: str
    daily_change: str
    line_color: str
    points: list[PerformancePoint]


class PerformanceChartRange(BaseModel):
    range_key: str
    label: str
    series: list[PerformanceSeries]


class CompanyWorkspaceSnapshot(BaseModel):
    ticker: str
    name: str
    sector: str
    summary: str
    workspace_tagline: str
    current_price_display: str
    market_cap_display: str
    income_statement_waterfall: list[IncomeStatementWaterfallStep]
    revenue_segment_breakdown: RevenueSegmentBreakdown | None = None
    financial_bridge_periods: list[FinancialBridgePeriod] = []
    quote_details: list[QuoteDetail]
    market_contexts: list[MarketContextCard]
    performance_chart_ranges: list[PerformanceChartRange]
