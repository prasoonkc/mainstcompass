import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { CATEGORY_CONFIG } from '../lib/constants';
import { BusinessCard } from '../components/BusinessCard';
import { BusinessMap } from '../components/BusinessMap';
import { ReviewModal } from '../components/ReviewModal';
import { SearchControls } from '../components/SearchControls';

export function DiscoverPage() {
  const { appState, appActions } = useOutletContext();
  const [reviewTarget, setReviewTarget] = useState(null);
  const categoryBreakdown = useMemo(() => {
    return appState.filteredBusinesses.reduce((accumulator, business) => {
      accumulator[business.category] = (accumulator[business.category] || 0) + 1;
      return accumulator;
    }, {});
  }, [appState.filteredBusinesses]);

  return (
    <div className="space-y-6">
      <SearchControls appState={appState} appActions={appActions} />

      {appState.statusMessage ? (
        <div className="rounded-3xl border border-moss/20 bg-moss/10 px-4 py-3 text-sm text-moss">{appState.statusMessage}</div>
      ) : null}
      {appState.errorMessage ? (
        <div className="rounded-3xl border border-clay/20 bg-clay/10 px-4 py-3 text-sm text-clay">{appState.errorMessage}</div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr] xl:items-start">
        <BusinessMap location={appState.location} businesses={appState.filteredBusinesses} />
        <div className="space-y-4 rounded-[2rem] border border-white/60 bg-white/85 p-5 shadow-card backdrop-blur">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-moss">Recommended now</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">Best bets near your search</h2>
          </div>
          {appState.recommendedBusinesses.map((business) => (
            <BusinessCard
              key={business.id}
              business={business}
              onToggleFavorite={appActions.toggleFavorite}
              onReview={setReviewTarget}
            />
          ))}
          <div className="rounded-[1.5rem] bg-mist p-4 text-sm text-ink/70">
            <p className="font-semibold text-ink">Category spread</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {Object.entries(categoryBreakdown).map(([category, count]) => (
                <span key={category} className="rounded-full bg-white px-3 py-2">
                  {CATEGORY_CONFIG[category]?.label || category}: {count}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-moss">Business directory</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">Browse, compare, review, and save</h2>
          </div>
          {appState.isDiscovering ? <p className="text-sm text-ink/60">Refreshing nearby businesses...</p> : null}
        </div>
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {appState.filteredBusinesses.map((business) => (
            <BusinessCard
              key={business.id}
              business={business}
              onToggleFavorite={appActions.toggleFavorite}
              onReview={setReviewTarget}
            />
          ))}
        </div>
      </section>

      {reviewTarget ? (
        <ReviewModal
          business={reviewTarget}
          onClose={() => setReviewTarget(null)}
          onSubmit={appActions.submitReview}
        />
      ) : null}
    </div>
  );
}
