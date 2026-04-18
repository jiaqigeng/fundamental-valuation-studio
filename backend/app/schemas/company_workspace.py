from pydantic import BaseModel


class QuoteDetail(BaseModel):
    label: str
    value: str


class CompanyWorkspaceSnapshot(BaseModel):
    ticker: str
    name: str
    sector: str
    summary: str
    workspace_tagline: str
    current_price_display: str
    market_cap_display: str
    quote_details: list[QuoteDetail]
