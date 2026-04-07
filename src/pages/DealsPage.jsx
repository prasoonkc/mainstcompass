import { useOutletContext } from 'react-router-dom';
import { Copy, Tag } from 'lucide-react';

export function DealsPage() {
  const { appState, appActions } = useOutletContext();
  const dealBusinesses = appState.businesses.filter((business) => business.deal);
  const copiedCount = appState.copiedDeals.length;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1fr_auto]">
        <div className="rounded-[2rem] border border-white/60 bg-white/85 p-6 shadow-card backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-moss">Deals & coupons</p>
          <h2 className="mt-1 flex items-center gap-2 text-3xl font-semibold tracking-tight"><Tag size={22} /> Active promotions from participating local businesses</h2>
          <p className="mt-2 max-w-3xl text-sm text-ink/70">
            Explore limited-time savings, copy coupon codes, and compare offers from businesses near your chosen location.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 xl:w-[28rem]">
          <div className="rounded-[1.6rem] bg-ink px-4 py-5 text-white shadow-card">
            <p className="text-3xl font-semibold">{dealBusinesses.length}</p>
            <p className="text-sm text-white/70">Active deals</p>
          </div>
          <div className="rounded-[1.6rem] bg-white px-4 py-5 shadow-card">
            <p className="text-3xl font-semibold">{copiedCount}</p>
            <p className="text-sm text-ink/70">Copied codes</p>
          </div>
          <div className="rounded-[1.6rem] bg-white px-4 py-5 shadow-card">
            <p className="text-3xl font-semibold">{new Set(dealBusinesses.map((business) => business.id)).size}</p>
            <p className="text-sm text-ink/70">Participating businesses</p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        {dealBusinesses.map((business) => (
          <article key={business.id} className="rounded-[1.6rem] border border-ink/10 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-moss">{business.source}</p>
                <h3 className="mt-1 text-2xl font-semibold">{business.name}</h3>
                <p className="mt-2 text-sm text-ink/70">{business.deal.description}</p>
              </div>
              <button
                type="button"
                onClick={() => appActions.copyDeal(business.deal.code, business.id)}
                className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white"
              >
                <Copy size={16} />
                Copy code
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-3 text-sm text-ink/70">
              <span className="rounded-full bg-mist px-3 py-2 font-mono uppercase tracking-[0.2em] text-ink">{business.deal.code}</span>
              <span className="rounded-full bg-mist px-3 py-2">Expires {new Date(business.deal.expiresAt).toLocaleDateString()}</span>
              <span className="rounded-full bg-mist px-3 py-2">{business.rating} stars</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
