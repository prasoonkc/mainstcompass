import { Heart, MapPin, Star, Tag } from 'lucide-react';
import { CATEGORY_CONFIG } from '../lib/constants';

export function BusinessCard({ business, onToggleFavorite, onReview }) {
  return (
    <article className="rounded-[1.6rem] border border-ink/10 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white"
            style={{ backgroundColor: CATEGORY_CONFIG[business.category]?.color || '#1f7a5c' }}
          >
            {CATEGORY_CONFIG[business.category]?.label || 'Business'}
          </div>
          <h3 className="text-lg font-semibold">{business.name}</h3>
          <p className="mt-1 text-sm text-ink/65">{business.description}</p>
        </div>
        <button
          type="button"
          onClick={() => onToggleFavorite(business.id)}
          className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition ${
            business.isFavorite ? 'border-clay bg-clay text-white' : 'border-ink/10 bg-mist text-ink'
          }`}
          aria-label={business.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart size={18} fill={business.isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="mt-4 space-y-2 text-sm text-ink/70">
        <p className="flex items-center gap-2"><MapPin size={15} /> {business.address}</p>
        <p className="flex items-center gap-2"><Star size={15} className="text-gold" /> {business.rating} stars • {business.reviewCount} reviews</p>
        <p>{business.distance ? `${business.distance} miles away` : 'Distance unavailable'} • Source: {business.source}</p>
      </div>

      {business.deal ? (
        <div className="mt-4 rounded-3xl bg-mist px-4 py-3 text-sm text-ink">
          <p className="flex items-center gap-2 font-semibold text-clay"><Tag size={15} /> {business.deal.title}</p>
          <p className="mt-1 text-ink/70">{business.deal.description}</p>
          <p className="mt-2 font-mono text-xs uppercase tracking-[0.2em] text-ink">{business.deal.code}</p>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onReview(business)}
          className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-moss"
        >
          Leave review
        </button>
      </div>
    </article>
  );
}
