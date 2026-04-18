from app.schemas.company_workspace import (
    CompanyWorkspaceSnapshot,
    MarketContextCard,
    QuoteDetail,
)


FIXTURE_WORKSPACES: dict[str, CompanyWorkspaceSnapshot] = {
    "AAPL": CompanyWorkspaceSnapshot(
        ticker="AAPL",
        name="Apple Inc.",
        sector="Technology",
        summary=(
            "Apple designs consumer electronics, software, and services across "
            "the iPhone, Mac, iPad, wearables, and a growing installed-base ecosystem."
        ),
        workspace_tagline=(
            "Yahoo Finance-backed market snapshot ready for deeper context, "
            "valuation work, and AI analysis."
        ),
        current_price_display="$212.48",
        market_cap_display="$3.2T",
        quote_details=[
            QuoteDetail(label="Previous Close", value="211.97"),
            QuoteDetail(label="Open", value="212.63"),
            QuoteDetail(label="Bid", value="212.35 x 100"),
            QuoteDetail(label="Ask", value="212.60 x 200"),
            QuoteDetail(label="Day's Range", value="211.12 - 213.44"),
            QuoteDetail(label="52 Week Range", value="164.08 - 237.23"),
            QuoteDetail(label="Volume", value="48,220,114"),
            QuoteDetail(label="Avg. Volume", value="57,391,204"),
            QuoteDetail(label="Market Cap (intraday)", value="3.200T"),
            QuoteDetail(label="Beta (5Y Monthly)", value="1.24"),
            QuoteDetail(label="PE Ratio (TTM)", value="33.19"),
            QuoteDetail(label="EPS (TTM)", value="6.40"),
            QuoteDetail(label="Earnings Date", value="May 1, 2026"),
            QuoteDetail(label="Forward Dividend & Yield", value="1.04 (0.49%)"),
            QuoteDetail(label="Ex-Dividend Date", value="Feb 9, 2026"),
        ],
        market_contexts=[
            MarketContextCard(
                label="S&P 500",
                symbol="^GSPC",
                value="7,126.06",
                daily_change="+84.78 (+1.20%)",
                description="Broad-market baseline for the current U.S. session.",
            ),
            MarketContextCard(
                label="Technology sector benchmark",
                symbol="XLK",
                value="154.35",
                daily_change="+2.33 (+1.53%)",
                description="Sector proxy chosen from the company's reported sector.",
            ),
        ],
    ),
    "KO": CompanyWorkspaceSnapshot(
        ticker="KO",
        name="The Coca-Cola Company",
        sector="Consumer Staples",
        summary=(
            "Coca-Cola is a global beverage company anchored by sparkling soft drinks, "
            "juices, water, coffee, and a wide bottling and distribution network."
        ),
        workspace_tagline=(
            "Yahoo Finance-backed market snapshot ready for deeper context, "
            "valuation work, and AI analysis."
        ),
        current_price_display="$62.15",
        market_cap_display="$267.0B",
        quote_details=[
            QuoteDetail(label="Previous Close", value="61.92"),
            QuoteDetail(label="Open", value="62.01"),
            QuoteDetail(label="Bid", value="62.08 x 100"),
            QuoteDetail(label="Ask", value="62.16 x 100"),
            QuoteDetail(label="Day's Range", value="61.88 - 62.29"),
            QuoteDetail(label="52 Week Range", value="56.45 - 66.04"),
            QuoteDetail(label="Volume", value="15,114,207"),
            QuoteDetail(label="Avg. Volume", value="14,802,119"),
            QuoteDetail(label="Market Cap (intraday)", value="267.000B"),
            QuoteDetail(label="Beta (5Y Monthly)", value="0.52"),
            QuoteDetail(label="PE Ratio (TTM)", value="25.88"),
            QuoteDetail(label="EPS (TTM)", value="2.40"),
            QuoteDetail(label="Earnings Date", value="Apr 28, 2026"),
            QuoteDetail(label="Forward Dividend & Yield", value="2.04 (3.28%)"),
            QuoteDetail(label="Ex-Dividend Date", value="Mar 13, 2026"),
        ],
        market_contexts=[
            MarketContextCard(
                label="S&P 500",
                symbol="^GSPC",
                value="7,126.06",
                daily_change="+84.78 (+1.20%)",
                description="Broad-market baseline for the current U.S. session.",
            ),
            MarketContextCard(
                label="Consumer Staples sector benchmark",
                symbol="XLP",
                value="82.46",
                daily_change="+1.03 (+1.26%)",
                description="Sector proxy chosen from the company's reported sector.",
            ),
        ],
    ),
    "MSFT": CompanyWorkspaceSnapshot(
        ticker="MSFT",
        name="Microsoft Corporation",
        sector="Technology",
        summary=(
            "Microsoft operates productivity, cloud, infrastructure, gaming, and AI "
            "platforms that span enterprise software, Azure, and consumer services."
        ),
        workspace_tagline=(
            "Yahoo Finance-backed market snapshot ready for deeper context, "
            "valuation work, and AI analysis."
        ),
        current_price_display="$338.12",
        market_cap_display="$4.1T",
        quote_details=[
            QuoteDetail(label="Previous Close", value="336.02"),
            QuoteDetail(label="Open", value="337.73"),
            QuoteDetail(label="Bid", value="320.66 x 100"),
            QuoteDetail(label="Ask", value="341.74 x 200"),
            QuoteDetail(label="Day's Range", value="336.24 - 342.32"),
            QuoteDetail(label="52 Week Range", value="146.10 - 349.00"),
            QuoteDetail(label="Volume", value="25,487,532"),
            QuoteDetail(label="Avg. Volume", value="32,964,050"),
            QuoteDetail(label="Market Cap (intraday)", value="4.133T"),
            QuoteDetail(label="Beta (5Y Monthly)", value="1.13"),
            QuoteDetail(label="PE Ratio (TTM)", value="31.64"),
            QuoteDetail(label="EPS (TTM)", value="10.80"),
            QuoteDetail(label="Earnings Date", value="Apr 29, 2026"),
            QuoteDetail(label="Forward Dividend & Yield", value="0.84 (0.25%)"),
            QuoteDetail(label="Ex-Dividend Date", value="Mar 9, 2026"),
        ],
        market_contexts=[
            MarketContextCard(
                label="S&P 500",
                symbol="^GSPC",
                value="7,126.06",
                daily_change="+84.78 (+1.20%)",
                description="Broad-market baseline for the current U.S. session.",
            ),
            MarketContextCard(
                label="Technology sector benchmark",
                symbol="XLK",
                value="154.35",
                daily_change="+2.33 (+1.53%)",
                description="Sector proxy chosen from the company's reported sector.",
            ),
        ],
    ),
}
