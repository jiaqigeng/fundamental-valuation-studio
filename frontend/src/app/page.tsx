import Link from "next/link";

import { TickerSearchForm } from "@/app/_components/ticker-search-form";

export default function Home() {
  return (
    <main className="landing-shell">
      <section className="landing-hero">
        <p className="eyebrow">Fundamental Valuation Studio</p>
        <h1>Open a company workspace by ticker.</h1>
        <p className="hero-copy">
          Start with a public ticker, then build toward dashboard context,
          intrinsic value models, and AI-assisted analysis from one workspace.
        </p>
        <TickerSearchForm />
        <div className="landing-hero-actions">
          <Link className="back-link landing-valuation-link" href="/valuation">
            Open valuation workspace
          </Link>
        </div>
      </section>

      <section className="supported-companies project-overview" aria-label="Project overview">
        <p className="panel-label">Platform roadmap</p>
        <div className="project-overview-grid">
          <article className="project-overview-card">
            <h2>Dashboard</h2>
            <p>
              Open a company workspace, pull current market data, compare the
              stock against the market and sector, and inspect revenue and
              profitability bridges from reported statements.
            </p>
          </article>
          <article className="project-overview-card">
            <h2>Valuation</h2>
            <p>
              Build DCF, dividend, residual-income, and peer-comp views with
              editable assumptions, scenario ranges, and sensitivity analysis in
              one connected workflow.
            </p>
          </article>
          <article className="project-overview-card">
            <h2>AI analysis</h2>
            <p>
              Generate industry, moat, management, and scenario analysis that
              stays grounded in company-specific data instead of generic market
              commentary.
            </p>
          </article>
        </div>
        <p className="project-overview-footnote">
          The goal is one research workspace that moves from raw market context
          to valuation judgment without bouncing between disconnected tools.
        </p>
      </section>
    </main>
  );
}
