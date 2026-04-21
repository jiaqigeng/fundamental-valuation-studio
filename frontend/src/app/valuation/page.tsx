import { DcfCalculatorPanel } from "@/app/_components/dcf-calculator-panel";
import { getDcfBaselineData } from "@/app/_lib/valuation";

export default async function ValuationPage({
  searchParams,
}: {
  searchParams: Promise<{ ticker?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const activeTicker =
    resolvedSearchParams.ticker?.trim().toUpperCase() || "AAPL";
  const baseline = await getDcfBaselineData(activeTicker);

  return (
    <main className="dashboard-shell valuation-page-shell">
      {baseline !== null ? (
        <DcfCalculatorPanel
          activeTicker={activeTicker}
          baseline={baseline}
        />
      ) : (
        <section className="workspace-panel valuation-empty-state">
          <p className="panel-label">Calculator unavailable</p>
          <h2>We couldn&apos;t load a DCF baseline for {activeTicker}.</h2>
          <p className="panel-copy">
            Try one of the featured tickers above or return to the dashboard
            flow to confirm the company can be loaded there first.
          </p>
        </section>
      )}
    </main>
  );
}
