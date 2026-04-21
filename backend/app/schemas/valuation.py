from pydantic import BaseModel, Field, model_validator


class DcfValuationRequest(BaseModel):
    current_free_cash_flow: float
    short_term_growth_rate: float = Field(..., gt=-0.99, lt=1)
    terminal_growth_rate: float = Field(..., gt=-0.99, lt=1)
    discount_rate: float = Field(..., gt=0, lt=1)
    shares_outstanding: float = Field(..., gt=0)
    total_debt: float = Field(default=0.0, ge=0)
    cash_and_cash_equivalents: float = Field(default=0.0, ge=0)
    projection_years: int = Field(default=5, ge=5, le=10)

    @model_validator(mode="after")
    def validate_terminal_growth(self) -> "DcfValuationRequest":
        if self.terminal_growth_rate >= self.discount_rate:
            raise ValueError("Terminal growth rate must be below the discount rate.")
        if self.projection_years not in {5, 10}:
            raise ValueError("Projection years must be either 5 or 10.")
        return self


class DcfProjectionYear(BaseModel):
    year: int
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
    current_free_cash_flow: float
    current_free_cash_flow_display: str
    total_cash: float
    total_cash_display: str
    total_debt: float
    total_debt_display: str
    shares_outstanding: float
    shares_outstanding_display: str
