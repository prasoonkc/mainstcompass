import { useOutletContext } from 'react-router-dom';
import { MessageSquareText, Star } from 'lucide-react';

export function ReviewsPage() {
  const { appState } = useOutletContext();

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/60 bg-white/85 p-6 shadow-card backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-moss">Your reviews</p>
        <h2 className="mt-1 flex items-center gap-2 text-3xl font-semibold tracking-tight"><MessageSquareText size={22} /> Ratings and written feedback</h2>
        <p className="mt-2 text-sm text-ink/70">
          Keep track of the places you have rated, revisit your comments, and see how your feedback is tied to your account.
        </p>
      </section>

      {appState.reviewHistory.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-ink/20 bg-white/70 p-10 text-center text-ink/65">
          Leave a review from the Discover or Favorites page to see it here.
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {appState.reviewHistory.map((review) => (
            <article key={review.id} className="rounded-[1.6rem] border border-ink/10 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-moss">{new Date(review.createdAt).toLocaleDateString()}</p>
              <h3 className="mt-2 text-xl font-semibold">{appState.businesses.find((business) => business.id === review.businessId)?.name || 'Business'}</h3>
              <p className="mt-1 text-sm text-ink/55">Posted as {review.userName}</p>
              <p className="mt-2 flex items-center gap-2 text-sm text-ink/70"><Star size={16} className="text-gold" /> {review.rating} star review</p>
              <p className="mt-3 text-sm text-ink/80">{review.comment || 'No comment provided.'}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
