import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { BusinessCard } from '../components/BusinessCard';
import { ReviewModal } from '../components/ReviewModal';

export function FavoritesPage() {
  const { appState, appActions } = useOutletContext();
  const [reviewTarget, setReviewTarget] = useState(null);

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/60 bg-white/85 p-6 shadow-card backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-moss">Favorites</p>
        <h2 className="mt-1 flex items-center gap-2 text-3xl font-semibold tracking-tight"><Heart size={22} /> Saved places to revisit</h2>
        <p className="mt-2 max-w-3xl text-sm text-ink/70">
          Favorite businesses stay connected to your account so you can come back to the best coffee, retail, services, and deals later.
        </p>
      </section>

      {appState.favoriteBusinesses.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-ink/20 bg-white/70 p-10 text-center text-ink/65">
          Save businesses from the Discover page to build your personal shortlist.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {appState.favoriteBusinesses.map((business) => (
            <BusinessCard
              key={business.id}
              business={business}
              onToggleFavorite={appActions.toggleFavorite}
              onReview={setReviewTarget}
            />
          ))}
        </div>
      )}

      {reviewTarget ? (
        <ReviewModal business={reviewTarget} onClose={() => setReviewTarget(null)} onSubmit={appActions.submitReview} />
      ) : null}
    </div>
  );
}
