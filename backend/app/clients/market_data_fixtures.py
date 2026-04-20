from app.schemas.company_workspace import (
    CompanyWorkspaceSnapshot,
    FinancialBridgePeriod,
    IncomeStatementWaterfallStep,
    MarketContextCard,
    PerformanceChartRange,
    PerformancePoint,
    PerformanceSeries,
    QuoteDetail,
    RevenueSegment,
    RevenueSegmentBreakdown,
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
        income_statement_waterfall=[
            IncomeStatementWaterfallStep(
                label="Revenue",
                value=391_000_000_000,
                display_value="$391.0B",
                step_type="total",
            ),
            IncomeStatementWaterfallStep(
                label="Cost of Revenue",
                value=-223_500_000_000,
                display_value="-$223.5B",
                step_type="delta",
            ),
            IncomeStatementWaterfallStep(
                label="Gross Profit",
                value=167_500_000_000,
                display_value="$167.5B",
                step_type="total",
            ),
            IncomeStatementWaterfallStep(
                label="Operating Expenses",
                value=-57_500_000_000,
                display_value="-$57.5B",
                step_type="delta",
            ),
            IncomeStatementWaterfallStep(
                label="Operating Profit",
                value=110_000_000_000,
                display_value="$110.0B",
                step_type="total",
            ),
            IncomeStatementWaterfallStep(
                label="Others",
                value=-5_300_000_000,
                display_value="-$5.3B",
                step_type="delta",
            ),
            IncomeStatementWaterfallStep(
                label="Taxes",
                value=-17_200_000_000,
                display_value="-$17.2B",
                step_type="delta",
            ),
            IncomeStatementWaterfallStep(
                label="Net Profits",
                value=87_500_000_000,
                display_value="$87.5B",
                step_type="total",
            ),
        ],
        revenue_segment_breakdown=RevenueSegmentBreakdown(
            total_revenue=391_000_000_000,
            total_revenue_display="$391.0B",
            segments=[
                RevenueSegment(
                    label="iPhone",
                    value=201_200_000_000,
                    display_value="$201.2B",
                    share_of_total=201_200_000_000 / 391_000_000_000,
                ),
                RevenueSegment(
                    label="Mac",
                    value=29_900_000_000,
                    display_value="$29.9B",
                    share_of_total=29_900_000_000 / 391_000_000_000,
                ),
                RevenueSegment(
                    label="iPad",
                    value=28_300_000_000,
                    display_value="$28.3B",
                    share_of_total=28_300_000_000 / 391_000_000_000,
                ),
                RevenueSegment(
                    label="Wearables, Home & Accessories",
                    value=39_800_000_000,
                    display_value="$39.8B",
                    share_of_total=39_800_000_000 / 391_000_000_000,
                ),
                RevenueSegment(
                    label="Services",
                    value=91_800_000_000,
                    display_value="$91.8B",
                    share_of_total=91_800_000_000 / 391_000_000_000,
                ),
            ],
        ),
        quote_details=[
            QuoteDetail(label="Trailing P/E (TTM)", value="33.19"),
            QuoteDetail(label="Forward P/E", value="29.44"),
            QuoteDetail(label="Price to Book", value="45.12"),
            QuoteDetail(label="EV / EBITDA", value="24.67"),
            QuoteDetail(label="EV / Revenue", value="7.84"),
            QuoteDetail(label="PEG Ratio", value="2.61"),
            QuoteDetail(label="Debt to Equity", value="151.27%"),
            QuoteDetail(label="Beta (5Y Monthly)", value="1.24"),
            QuoteDetail(label="Return on Equity (ROE)", value="151.32%"),
            QuoteDetail(label="Return on Assets (ROA)", value="27.51%"),
            QuoteDetail(label="Forward Dividend & Yield", value="1.04 (0.38%)"),
            QuoteDetail(label="Trailing Dividend (TTM)", value="0.96"),
            QuoteDetail(label="Avg. Volume (3M)", value="57,391,204"),
            QuoteDetail(label="Earnings Date", value="May 1, 2026"),
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
        performance_chart_ranges=[
            PerformanceChartRange(
                range_key="1Y",
                label="1 year",
                series=[
                    PerformanceSeries(
                        label="Apple Inc.",
                        symbol="AAPL",
                        current_value="$212.48",
                        daily_change="+2.41 (+1.15%)",
                        line_color="#21409A",
                        points=[
                            PerformancePoint(label="Apr 2025", value=100.0),
                            PerformancePoint(label="Jul 2025", value=102.4),
                            PerformancePoint(label="Sep 2025", value=101.1),
                            PerformancePoint(label="Nov 2025", value=104.8),
                            PerformancePoint(label="Jan 2026", value=106.9),
                            PerformancePoint(label="Apr 2026", value=108.2),
                        ],
                    ),
                    PerformanceSeries(
                        label="S&P 500",
                        symbol="^GSPC",
                        current_value="7,126.06",
                        daily_change="+84.78 (+1.20%)",
                        line_color="#0F766E",
                        points=[
                            PerformancePoint(label="Apr 2025", value=100.0),
                            PerformancePoint(label="Jul 2025", value=100.9),
                            PerformancePoint(label="Sep 2025", value=101.6),
                            PerformancePoint(label="Nov 2025", value=102.4),
                            PerformancePoint(label="Jan 2026", value=103.7),
                            PerformancePoint(label="Apr 2026", value=105.0),
                        ],
                    ),
                    PerformanceSeries(
                        label="Technology sector benchmark",
                        symbol="XLK",
                        current_value="154.35",
                        daily_change="+2.33 (+1.53%)",
                        line_color="#C48A2C",
                        points=[
                            PerformancePoint(label="Apr 2025", value=100.0),
                            PerformancePoint(label="Jul 2025", value=102.7),
                            PerformancePoint(label="Sep 2025", value=103.3),
                            PerformancePoint(label="Nov 2025", value=105.6),
                            PerformancePoint(label="Jan 2026", value=107.4),
                            PerformancePoint(label="Apr 2026", value=109.6),
                        ],
                    ),
                ],
            ),
            PerformanceChartRange(
                range_key="5Y",
                label="5 year",
                series=[
                    PerformanceSeries(
                        label="Apple Inc.",
                        symbol="AAPL",
                        current_value="$212.48",
                        daily_change="+2.41 (+1.15%)",
                        line_color="#21409A",
                        points=[
                            PerformancePoint(label="Apr 2021", value=100.0),
                            PerformancePoint(label="Apr 2022", value=118.6),
                            PerformancePoint(label="Apr 2023", value=129.1),
                            PerformancePoint(label="Apr 2024", value=147.9),
                            PerformancePoint(label="Apr 2025", value=162.7),
                            PerformancePoint(label="Apr 2026", value=176.4),
                        ],
                    ),
                    PerformanceSeries(
                        label="S&P 500",
                        symbol="^GSPC",
                        current_value="7,126.06",
                        daily_change="+84.78 (+1.20%)",
                        line_color="#0F766E",
                        points=[
                            PerformancePoint(label="Apr 2021", value=100.0),
                            PerformancePoint(label="Apr 2022", value=111.2),
                            PerformancePoint(label="Apr 2023", value=118.9),
                            PerformancePoint(label="Apr 2024", value=129.4),
                            PerformancePoint(label="Apr 2025", value=138.1),
                            PerformancePoint(label="Apr 2026", value=146.0),
                        ],
                    ),
                    PerformanceSeries(
                        label="Technology sector benchmark",
                        symbol="XLK",
                        current_value="154.35",
                        daily_change="+2.33 (+1.53%)",
                        line_color="#C48A2C",
                        points=[
                            PerformancePoint(label="Apr 2021", value=100.0),
                            PerformancePoint(label="Apr 2022", value=116.4),
                            PerformancePoint(label="Apr 2023", value=126.8),
                            PerformancePoint(label="Apr 2024", value=142.9),
                            PerformancePoint(label="Apr 2025", value=156.1),
                            PerformancePoint(label="Apr 2026", value=168.8),
                        ],
                    ),
                ],
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
        income_statement_waterfall=[
            IncomeStatementWaterfallStep(
                label="Revenue",
                value=47_100_000_000,
                display_value="$47.1B",
                step_type="total",
            ),
            IncomeStatementWaterfallStep(
                label="Cost of Revenue",
                value=-18_500_000_000,
                display_value="-$18.5B",
                step_type="delta",
            ),
            IncomeStatementWaterfallStep(
                label="Gross Profit",
                value=28_600_000_000,
                display_value="$28.6B",
                step_type="total",
            ),
            IncomeStatementWaterfallStep(
                label="Operating Expenses",
                value=-14_000_000_000,
                display_value="-$14.0B",
                step_type="delta",
            ),
            IncomeStatementWaterfallStep(
                label="Operating Profit",
                value=14_600_000_000,
                display_value="$14.6B",
                step_type="total",
            ),
            IncomeStatementWaterfallStep(
                label="Others",
                value=-1_100_000_000,
                display_value="-$1.1B",
                step_type="delta",
            ),
            IncomeStatementWaterfallStep(
                label="Taxes",
                value=-2_500_000_000,
                display_value="-$2.5B",
                step_type="delta",
            ),
            IncomeStatementWaterfallStep(
                label="Net Profits",
                value=11_000_000_000,
                display_value="$11.0B",
                step_type="total",
            ),
        ],
        revenue_segment_breakdown=RevenueSegmentBreakdown(
            total_revenue=47_100_000_000,
            total_revenue_display="$47.1B",
            segments=[
                RevenueSegment(
                    label="Single reporting segment",
                    value=47_100_000_000,
                    display_value="$47.1B",
                    share_of_total=1.0,
                ),
            ],
        ),
        quote_details=[
            QuoteDetail(label="Trailing P/E (TTM)", value="25.88"),
            QuoteDetail(label="Forward P/E", value="23.54"),
            QuoteDetail(label="Price to Book", value="10.21"),
            QuoteDetail(label="EV / EBITDA", value="18.42"),
            QuoteDetail(label="EV / Revenue", value="6.52"),
            QuoteDetail(label="PEG Ratio", value="2.84"),
            QuoteDetail(label="Debt to Equity", value="162.44%"),
            QuoteDetail(label="Beta (5Y Monthly)", value="0.52"),
            QuoteDetail(label="Return on Equity (ROE)", value="41.87%"),
            QuoteDetail(label="Return on Assets (ROA)", value="9.14%"),
            QuoteDetail(label="Forward Dividend & Yield", value="2.06 (2.72%)"),
            QuoteDetail(label="Trailing Dividend (TTM)", value="1.94"),
            QuoteDetail(label="Avg. Volume (3M)", value="14,802,119"),
            QuoteDetail(label="Earnings Date", value="Apr 28, 2026"),
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
        performance_chart_ranges=[
            PerformanceChartRange(
                range_key="1Y",
                label="1 year",
                series=[
                    PerformanceSeries(
                        label="The Coca-Cola Company",
                        symbol="KO",
                        current_value="$62.15",
                        daily_change="+0.54 (+0.88%)",
                        line_color="#21409A",
                        points=[
                            PerformancePoint(label="Apr 2025", value=100.0),
                            PerformancePoint(label="Jul 2025", value=100.8),
                            PerformancePoint(label="Sep 2025", value=101.5),
                            PerformancePoint(label="Nov 2025", value=102.7),
                            PerformancePoint(label="Jan 2026", value=103.6),
                            PerformancePoint(label="Apr 2026", value=104.4),
                        ],
                    ),
                    PerformanceSeries(
                        label="S&P 500",
                        symbol="^GSPC",
                        current_value="7,126.06",
                        daily_change="+84.78 (+1.20%)",
                        line_color="#0F766E",
                        points=[
                            PerformancePoint(label="Apr 2025", value=100.0),
                            PerformancePoint(label="Jul 2025", value=100.9),
                            PerformancePoint(label="Sep 2025", value=101.6),
                            PerformancePoint(label="Nov 2025", value=102.4),
                            PerformancePoint(label="Jan 2026", value=103.7),
                            PerformancePoint(label="Apr 2026", value=105.0),
                        ],
                    ),
                    PerformanceSeries(
                        label="Consumer Staples sector benchmark",
                        symbol="XLP",
                        current_value="82.46",
                        daily_change="+1.03 (+1.26%)",
                        line_color="#C48A2C",
                        points=[
                            PerformancePoint(label="Apr 2025", value=100.0),
                            PerformancePoint(label="Jul 2025", value=99.6),
                            PerformancePoint(label="Sep 2025", value=99.1),
                            PerformancePoint(label="Nov 2025", value=98.8),
                            PerformancePoint(label="Jan 2026", value=98.4),
                            PerformancePoint(label="Apr 2026", value=98.1),
                        ],
                    ),
                ],
            ),
            PerformanceChartRange(
                range_key="5Y",
                label="5 year",
                series=[
                    PerformanceSeries(
                        label="The Coca-Cola Company",
                        symbol="KO",
                        current_value="$62.15",
                        daily_change="+0.54 (+0.88%)",
                        line_color="#21409A",
                        points=[
                            PerformancePoint(label="Apr 2021", value=100.0),
                            PerformancePoint(label="Apr 2022", value=104.1),
                            PerformancePoint(label="Apr 2023", value=109.8),
                            PerformancePoint(label="Apr 2024", value=115.3),
                            PerformancePoint(label="Apr 2025", value=121.0),
                            PerformancePoint(label="Apr 2026", value=126.4),
                        ],
                    ),
                    PerformanceSeries(
                        label="S&P 500",
                        symbol="^GSPC",
                        current_value="7,126.06",
                        daily_change="+84.78 (+1.20%)",
                        line_color="#0F766E",
                        points=[
                            PerformancePoint(label="Apr 2021", value=100.0),
                            PerformancePoint(label="Apr 2022", value=111.2),
                            PerformancePoint(label="Apr 2023", value=118.9),
                            PerformancePoint(label="Apr 2024", value=129.4),
                            PerformancePoint(label="Apr 2025", value=138.1),
                            PerformancePoint(label="Apr 2026", value=146.0),
                        ],
                    ),
                    PerformanceSeries(
                        label="Consumer Staples sector benchmark",
                        symbol="XLP",
                        current_value="82.46",
                        daily_change="+1.03 (+1.26%)",
                        line_color="#C48A2C",
                        points=[
                            PerformancePoint(label="Apr 2021", value=100.0),
                            PerformancePoint(label="Apr 2022", value=103.8),
                            PerformancePoint(label="Apr 2023", value=109.2),
                            PerformancePoint(label="Apr 2024", value=114.0),
                            PerformancePoint(label="Apr 2025", value=118.4),
                            PerformancePoint(label="Apr 2026", value=123.5),
                        ],
                    ),
                ],
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
        income_statement_waterfall=[
            IncomeStatementWaterfallStep(
                label="Revenue",
                value=245_100_000_000,
                display_value="$245.1B",
                step_type="total",
            ),
            IncomeStatementWaterfallStep(
                label="Cost of Revenue",
                value=-76_000_000_000,
                display_value="-$76.0B",
                step_type="delta",
            ),
            IncomeStatementWaterfallStep(
                label="Gross Profit",
                value=169_100_000_000,
                display_value="$169.1B",
                step_type="total",
            ),
            IncomeStatementWaterfallStep(
                label="Operating Expenses",
                value=-87_300_000_000,
                display_value="-$87.3B",
                step_type="delta",
            ),
            IncomeStatementWaterfallStep(
                label="Operating Profit",
                value=81_800_000_000,
                display_value="$81.8B",
                step_type="total",
            ),
            IncomeStatementWaterfallStep(
                label="Others",
                value=-200_000_000,
                display_value="-$200.0M",
                step_type="delta",
            ),
            IncomeStatementWaterfallStep(
                label="Taxes",
                value=-11_400_000_000,
                display_value="-$11.4B",
                step_type="delta",
            ),
            IncomeStatementWaterfallStep(
                label="Net Profits",
                value=70_200_000_000,
                display_value="$70.2B",
                step_type="total",
            ),
        ],
        revenue_segment_breakdown=RevenueSegmentBreakdown(
            total_revenue=245_100_000_000,
            total_revenue_display="$245.1B",
            segments=[
                RevenueSegment(
                    label="Productivity and Business Processes",
                    value=77_600_000_000,
                    display_value="$77.6B",
                    share_of_total=77_600_000_000 / 245_100_000_000,
                ),
                RevenueSegment(
                    label="Intelligent Cloud",
                    value=105_400_000_000,
                    display_value="$105.4B",
                    share_of_total=105_400_000_000 / 245_100_000_000,
                ),
                RevenueSegment(
                    label="More Personal Computing",
                    value=62_100_000_000,
                    display_value="$62.1B",
                    share_of_total=62_100_000_000 / 245_100_000_000,
                ),
            ],
        ),
        quote_details=[
            QuoteDetail(label="Trailing P/E (TTM)", value="31.64"),
            QuoteDetail(label="Forward P/E", value="28.10"),
            QuoteDetail(label="Price to Book", value="10.78"),
            QuoteDetail(label="EV / EBITDA", value="20.45"),
            QuoteDetail(label="EV / Revenue", value="12.88"),
            QuoteDetail(label="PEG Ratio", value="2.21"),
            QuoteDetail(label="Debt to Equity", value="32.11%"),
            QuoteDetail(label="Beta (5Y Monthly)", value="1.13"),
            QuoteDetail(label="Return on Equity (ROE)", value="33.74%"),
            QuoteDetail(label="Return on Assets (ROA)", value="14.95%"),
            QuoteDetail(label="Forward Dividend & Yield", value="3.64 (0.86%)"),
            QuoteDetail(label="Trailing Dividend (TTM)", value="3.32"),
            QuoteDetail(label="Avg. Volume (3M)", value="32,964,050"),
            QuoteDetail(label="Earnings Date", value="Apr 29, 2026"),
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
        performance_chart_ranges=[
            PerformanceChartRange(
                range_key="1Y",
                label="1 year",
                series=[
                    PerformanceSeries(
                        label="Microsoft Corporation",
                        symbol="MSFT",
                        current_value="$338.12",
                        daily_change="+3.12 (+0.93%)",
                        line_color="#21409A",
                        points=[
                            PerformancePoint(label="Apr 2025", value=100.0),
                            PerformancePoint(label="Jul 2025", value=102.3),
                            PerformancePoint(label="Sep 2025", value=104.8),
                            PerformancePoint(label="Nov 2025", value=106.1),
                            PerformancePoint(label="Jan 2026", value=108.7),
                            PerformancePoint(label="Apr 2026", value=115.0),
                        ],
                    ),
                    PerformanceSeries(
                        label="S&P 500",
                        symbol="^GSPC",
                        current_value="7,126.06",
                        daily_change="+84.78 (+1.20%)",
                        line_color="#0F766E",
                        points=[
                            PerformancePoint(label="Apr 2025", value=100.0),
                            PerformancePoint(label="Jul 2025", value=100.9),
                            PerformancePoint(label="Sep 2025", value=101.6),
                            PerformancePoint(label="Nov 2025", value=102.4),
                            PerformancePoint(label="Jan 2026", value=103.7),
                            PerformancePoint(label="Apr 2026", value=105.0),
                        ],
                    ),
                    PerformanceSeries(
                        label="Technology sector benchmark",
                        symbol="XLK",
                        current_value="154.35",
                        daily_change="+2.33 (+1.53%)",
                        line_color="#C48A2C",
                        points=[
                            PerformancePoint(label="Apr 2025", value=100.0),
                            PerformancePoint(label="Jul 2025", value=102.7),
                            PerformancePoint(label="Sep 2025", value=103.3),
                            PerformancePoint(label="Nov 2025", value=105.6),
                            PerformancePoint(label="Jan 2026", value=107.4),
                            PerformancePoint(label="Apr 2026", value=109.6),
                        ],
                    ),
                ],
            ),
            PerformanceChartRange(
                range_key="5Y",
                label="5 year",
                series=[
                    PerformanceSeries(
                        label="Microsoft Corporation",
                        symbol="MSFT",
                        current_value="$338.12",
                        daily_change="+3.12 (+0.93%)",
                        line_color="#21409A",
                        points=[
                            PerformancePoint(label="Apr 2021", value=100.0),
                            PerformancePoint(label="Apr 2022", value=114.5),
                            PerformancePoint(label="Apr 2023", value=132.1),
                            PerformancePoint(label="Apr 2024", value=151.6),
                            PerformancePoint(label="Apr 2025", value=173.2),
                            PerformancePoint(label="Apr 2026", value=191.4),
                        ],
                    ),
                    PerformanceSeries(
                        label="S&P 500",
                        symbol="^GSPC",
                        current_value="7,126.06",
                        daily_change="+84.78 (+1.20%)",
                        line_color="#0F766E",
                        points=[
                            PerformancePoint(label="Apr 2021", value=100.0),
                            PerformancePoint(label="Apr 2022", value=111.2),
                            PerformancePoint(label="Apr 2023", value=118.9),
                            PerformancePoint(label="Apr 2024", value=129.4),
                            PerformancePoint(label="Apr 2025", value=138.1),
                            PerformancePoint(label="Apr 2026", value=146.0),
                        ],
                    ),
                    PerformanceSeries(
                        label="Technology sector benchmark",
                        symbol="XLK",
                        current_value="154.35",
                        daily_change="+2.33 (+1.53%)",
                        line_color="#C48A2C",
                        points=[
                            PerformancePoint(label="Apr 2021", value=100.0),
                            PerformancePoint(label="Apr 2022", value=116.4),
                            PerformancePoint(label="Apr 2023", value=126.8),
                            PerformancePoint(label="Apr 2024", value=142.9),
                            PerformancePoint(label="Apr 2025", value=156.1),
                            PerformancePoint(label="Apr 2026", value=168.8),
                        ],
                    ),
                ],
            ),
        ],
    ),
}


def _build_revenue_segment_breakdown(
    *,
    total_revenue: float,
    segments: list[tuple[str, float]],
) -> RevenueSegmentBreakdown:
    return RevenueSegmentBreakdown(
        total_revenue=total_revenue,
        total_revenue_display=_format_compact_currency(total_revenue),
        segments=[
            RevenueSegment(
                label=label,
                value=value,
                display_value=_format_compact_currency(value),
                share_of_total=value / total_revenue if total_revenue else 0.0,
            )
            for label, value in segments
        ],
    )


def _with_financial_bridge_periods(
    snapshot: CompanyWorkspaceSnapshot,
    *,
    quarterly_waterfall: list[IncomeStatementWaterfallStep],
    quarterly_breakdown: RevenueSegmentBreakdown | None,
) -> CompanyWorkspaceSnapshot:
    return snapshot.model_copy(
        update={
            "financial_bridge_periods": [
                FinancialBridgePeriod(
                    period_key="year",
                    label="Year",
                    income_statement_waterfall=snapshot.income_statement_waterfall,
                    revenue_segment_breakdown=snapshot.revenue_segment_breakdown,
                ),
                FinancialBridgePeriod(
                    period_key="quarter",
                    label="Quarter",
                    income_statement_waterfall=quarterly_waterfall,
                    revenue_segment_breakdown=quarterly_breakdown,
                ),
            ]
        }
    )


def _format_compact_currency(value: float) -> str:
    absolute_value = abs(float(value))
    suffixes = (
        (1_000_000_000_000, "T"),
        (1_000_000_000, "B"),
        (1_000_000, "M"),
        (1_000, "K"),
    )
    for threshold, suffix in suffixes:
        if absolute_value >= threshold:
            scaled_value = value / threshold
            return f"${scaled_value:.1f}{suffix}"

    return f"${value:,.2f}"


FIXTURE_WORKSPACES["AAPL"] = _with_financial_bridge_periods(
    FIXTURE_WORKSPACES["AAPL"],
    quarterly_waterfall=[
        IncomeStatementWaterfallStep(
            label="Revenue",
            value=124_300_000_000,
            display_value="$124.3B",
            step_type="total",
        ),
        IncomeStatementWaterfallStep(
            label="Cost of Revenue",
            value=-64_800_000_000,
            display_value="-$64.8B",
            step_type="delta",
        ),
        IncomeStatementWaterfallStep(
            label="Gross Profit",
            value=59_500_000_000,
            display_value="$59.5B",
            step_type="total",
        ),
        IncomeStatementWaterfallStep(
            label="Operating Expenses",
            value=-15_200_000_000,
            display_value="-$15.2B",
            step_type="delta",
        ),
        IncomeStatementWaterfallStep(
            label="Operating Profit",
            value=44_300_000_000,
            display_value="$44.3B",
            step_type="total",
        ),
        IncomeStatementWaterfallStep(
            label="Others",
            value=-1_100_000_000,
            display_value="-$1.1B",
            step_type="delta",
        ),
        IncomeStatementWaterfallStep(
            label="Taxes",
            value=-8_400_000_000,
            display_value="-$8.4B",
            step_type="delta",
        ),
        IncomeStatementWaterfallStep(
            label="Net Profits",
            value=34_800_000_000,
            display_value="$34.8B",
            step_type="total",
        ),
    ],
    quarterly_breakdown=_build_revenue_segment_breakdown(
        total_revenue=124_300_000_000,
        segments=[
            ("iPhone", 68_700_000_000),
            ("Services", 26_300_000_000),
            ("Wearables, Home & Accessories", 12_000_000_000),
            ("Mac", 9_100_000_000),
            ("iPad", 8_200_000_000),
        ],
    ),
)

FIXTURE_WORKSPACES["KO"] = _with_financial_bridge_periods(
    FIXTURE_WORKSPACES["KO"],
    quarterly_waterfall=[
        IncomeStatementWaterfallStep(
            label="Revenue",
            value=11_400_000_000,
            display_value="$11.4B",
            step_type="total",
        ),
        IncomeStatementWaterfallStep(
            label="Cost of Revenue",
            value=-4_400_000_000,
            display_value="-$4.4B",
            step_type="delta",
        ),
        IncomeStatementWaterfallStep(
            label="Gross Profit",
            value=7_000_000_000,
            display_value="$7.0B",
            step_type="total",
        ),
        IncomeStatementWaterfallStep(
            label="Operating Expenses",
            value=-3_300_000_000,
            display_value="-$3.3B",
            step_type="delta",
        ),
        IncomeStatementWaterfallStep(
            label="Operating Profit",
            value=3_700_000_000,
            display_value="$3.7B",
            step_type="total",
        ),
        IncomeStatementWaterfallStep(
            label="Others",
            value=-200_000_000,
            display_value="-$200.0M",
            step_type="delta",
        ),
        IncomeStatementWaterfallStep(
            label="Taxes",
            value=-800_000_000,
            display_value="-$800.0M",
            step_type="delta",
        ),
        IncomeStatementWaterfallStep(
            label="Net Profits",
            value=2_700_000_000,
            display_value="$2.7B",
            step_type="total",
        ),
    ],
    quarterly_breakdown=_build_revenue_segment_breakdown(
        total_revenue=11_400_000_000,
        segments=[
            ("Single reporting segment", 11_400_000_000),
        ],
    ),
)

FIXTURE_WORKSPACES["MSFT"] = _with_financial_bridge_periods(
    FIXTURE_WORKSPACES["MSFT"],
    quarterly_waterfall=[
        IncomeStatementWaterfallStep(
            label="Revenue",
            value=62_000_000_000,
            display_value="$62.0B",
            step_type="total",
        ),
        IncomeStatementWaterfallStep(
            label="Cost of Revenue",
            value=-19_000_000_000,
            display_value="-$19.0B",
            step_type="delta",
        ),
        IncomeStatementWaterfallStep(
            label="Gross Profit",
            value=43_000_000_000,
            display_value="$43.0B",
            step_type="total",
        ),
        IncomeStatementWaterfallStep(
            label="Operating Expenses",
            value=-21_000_000_000,
            display_value="-$21.0B",
            step_type="delta",
        ),
        IncomeStatementWaterfallStep(
            label="Operating Profit",
            value=22_000_000_000,
            display_value="$22.0B",
            step_type="total",
        ),
        IncomeStatementWaterfallStep(
            label="Others",
            value=700_000_000,
            display_value="$700.0M",
            step_type="delta",
        ),
        IncomeStatementWaterfallStep(
            label="Taxes",
            value=-4_900_000_000,
            display_value="-$4.9B",
            step_type="delta",
        ),
        IncomeStatementWaterfallStep(
            label="Net Profits",
            value=17_800_000_000,
            display_value="$17.8B",
            step_type="total",
        ),
    ],
    quarterly_breakdown=_build_revenue_segment_breakdown(
        total_revenue=62_000_000_000,
        segments=[
            ("Intelligent Cloud", 27_500_000_000),
            ("Productivity and Business Processes", 19_200_000_000),
            ("More Personal Computing", 15_300_000_000),
        ],
    ),
)
