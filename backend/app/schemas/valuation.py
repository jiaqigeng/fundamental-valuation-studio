from pydantic import BaseModel, Field, model_validator


class DcfValuationRequest(BaseModel):
    current_revenue: float = Field(..., gt=0)
    revenue_growth_rate: float = Field(..., gt=-0.99, lt=1)
    operating_margin: float = Field(..., ge=0, le=1)
    tax_rate: float = Field(default=0.21, ge=0, le=1)
    sales_to_capital_ratio: float = Field(default=2.0, gt=0)
    wacc: float = Field(..., gt=0, lt=1)
    terminal_growth_rate: float = Field(..., gt=-0.99, lt=1)
    shares_outstanding: float = Field(..., gt=0)
    net_debt: float = 0.0
    projection_years: int = Field(default=5, ge=1, le=10)

    @model_validator(mode="after")
    def validate_terminal_growth(self) -> "DcfValuationRequest":
        if self.terminal_growth_rate >= self.wacc:
            raise ValueError("Terminal growth rate must be below WACC.")
        return self


class DcfProjectionYear(BaseModel):
    year: int
    revenue: float
    operating_income: float
    nopat: float
    reinvestment: float
    free_cash_flow: float
    present_value: float


class DcfValuationResponse(BaseModel):
    projections: list[DcfProjectionYear]
    terminal_free_cash_flow: float
    terminal_value: float
    terminal_present_value: float
    enterprise_value: float
    equity_value: float
    intrinsic_value_per_share: float


class DcfBaselineResponse(BaseModel):
    ticker: str
    company_name: str
    sector: str
    current_price: float | None = None
    current_price_display: str
    current_revenue: float
    current_revenue_display: str
    revenue_growth_rate: float
    operating_margin: float
    tax_rate: float
    sales_to_capital_ratio: float
    wacc: float
    terminal_growth_rate: float
    shares_outstanding: float
    shares_outstanding_display: str
    net_debt: float
    net_debt_display: str
    projection_years: int
    assumption_notes: list[str]
