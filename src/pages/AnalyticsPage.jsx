import { useOutletContext } from 'react-router-dom';
import { BarChart3, Download, Sparkles } from 'lucide-react';
import { CATEGORY_CONFIG } from '../lib/constants';

export function AnalyticsPage() {
  const { appState } = useOutletContext();
  const report = appState.analyticsReport;

  function downloadReport() {
    const reportBlob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(reportBlob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'mainstreet-compass-report.json';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-[2rem] border border-white/60 bg-white/85 p-6 shadow-card backdrop-blur lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-moss">Analytics dashboard</p>
          <h2 className="mt-1 flex items-center gap-2 text-3xl font-semibold tracking-tight"><BarChart3 size={22} /> Local business insight snapshot</h2>
          <p className="mt-2 max-w-3xl text-sm text-ink/70">
            See how many businesses are nearby, compare category mix, and spot the places earning the strongest ratings and engagement.
          </p>
        </div>
        <button type="button" onClick={downloadReport} className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white">
          <Download size={16} />
          Download report
        </button>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Businesses tracked" value={report.totalBusinesses} />
        <MetricCard label="Active deals" value={report.activeDeals} />
        <MetricCard label="Average rating" value={report.averageRating} />
        <MetricCard label="Reviews stored" value={report.totalReviews} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-[2rem] border border-white/60 bg-white/85 p-6 shadow-card backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-moss">Category distribution</p>
          <div className="mt-5 space-y-4">
            {Object.entries(report.categoryTotals).map(([category, total]) => (
              <div key={category}>
                <div className="mb-2 flex items-center justify-between text-sm text-ink/70">
                  <span>{CATEGORY_CONFIG[category]?.label || category}</span>
                  <span>{total}</span>
                </div>
                <div className="h-3 rounded-full bg-mist">
                  <div
                    className="h-3 rounded-full"
                    style={{
                      width: `${Math.max((total / Math.max(report.totalBusinesses, 1)) * 100, 8)}%`,
                      backgroundColor: CATEGORY_CONFIG[category]?.color || '#1f7a5c',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/60 bg-ink p-6 text-white shadow-card">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold">Top performers</p>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {report.topRated.map((business, index) => (
              <article key={business.id} className="rounded-[1.6rem] bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-white/60">Rank #{index + 1}</p>
                <h3 className="mt-1 text-xl font-semibold">{business.name}</h3>
                <p className="mt-2 text-sm text-white/70">{business.rating} stars • {business.reviewCount} reviews</p>
                <p className="mt-2 text-sm text-white/70">{business.address}</p>
              </article>
            ))}
          </div>
          <div className="mt-5 rounded-[1.6rem] bg-white/10 p-4 text-sm text-white/75">
            <p className="flex items-center gap-2 font-semibold text-white"><Sparkles size={16} /> What stands out</p>
            <p className="mt-1">Recommendations favor businesses with strong ratings, active offers, and close proximity so helpful results rise to the top quickly.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="rounded-[1.6rem] border border-white/60 bg-white/85 px-5 py-6 shadow-card backdrop-blur">
      <p className="text-3xl font-semibold">{value}</p>
      <p className="mt-2 text-sm text-ink/65">{label}</p>
    </div>
  );
}
