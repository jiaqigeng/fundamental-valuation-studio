from pydantic import BaseModel


class QuoteDetail(BaseModel):
    label: str
    value: str


class MarketContextCard(BaseModel):
    label: str
    symbol: str
    value: str
    daily_change: str
    description: str


class CompanyWorkspaceSnapshot(BaseModel):
    ticker: str
    name: str
    sector: str
    summary: str
    workspace_tagline: str
    current_price_display: str
    market_cap_display: str
    quote_details: list[QuoteDetail]
    market_contexts: list[MarketContextCard]
