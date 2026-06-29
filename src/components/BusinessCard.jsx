import { useState } from 'react';
import { Heart, MapPin, Star, Tag, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { CATEGORY_CONFIG } from '../lib/constants';
import { DAY_KEYS, DAY_LABELS, getTodayKey, isOpenNow } from '../lib/hours';

export function BusinessCard({ business, onToggleFavorite, onReview }) {
  const [hoursExpanded, setHoursExpanded] = useState(false);
  const todayKey = getTodayKey();
  const openStatus = isOpenNow(business.hours);
  const todayHours = business.hours?.[todayKey];

  return (
    <article className="rounded-[1.6rem] border border-ink/10 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div
            className="mb-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white"
            style={{ backgroundColor: CATEGORY_CONFIG[business.category]?.color || '#1f7a5c' }}
          >
            {CATEGORY_CONFIG[business.category]?.label || 'Business'}
          </div>
          <h3 className="text-lg font-semibold">{business.name}</h3>
          {business.description && (
            <p className="mt-1 text-sm leading-relaxed text-ink/65">{business.description}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => onToggleFavorite(business.id)}
          className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition ${
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
        <p>{business.distance ? `${business.distance} miles away` : 'Distance unavailable'} • {business.price}</p>
      </div>

      {/* Hours */}
      {business.hours ? (
        <div className="mt-4 rounded-2xl bg-mist px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm">
              <Clock size={14} className="text-ink/50" />
              <span className="font-medium text-ink">
                {todayHours === 'Closed' || !todayHours ? 'Closed today' : `Today: ${todayHours}`}
              </span>
              {openStatus === true && (
                <span className="rounded-full bg-moss/20 px-2 py-0.5 text-xs font-semibold text-moss">Open now</span>
              )}
              {openStatus === false && todayHours !== 'Closed' && (
                <span className="rounded-full bg-clay/15 px-2 py-0.5 text-xs font-semibold text-clay">Closed now</span>
              )}
              {todayHours === 'Closed' && (
                <span className="rounded-full bg-clay/15 px-2 py-0.5 text-xs font-semibold text-clay">Closed</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setHoursExpanded((v) => !v)}
              className="flex items-center gap-1 text-xs text-ink/50 hover:text-ink"
            >
              {hoursExpanded ? <><ChevronUp size={13} /> Less</> : <><ChevronDown size={13} /> All hours</>}
            </button>
          </div>

          {hoursExpanded && (
            <div className="mt-3 space-y-1.5 border-t border-ink/8 pt-3">
              {DAY_KEYS.map((key) => (
                <div
                  key={key}
                  className={`flex justify-between text-xs ${key === todayKey ? 'font-semibold text-ink' : 'text-ink/60'}`}
                >
                  <span>{DAY_LABELS[key]}</span>
                  <span>{business.hours[key] || '—'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {/* Deal */}
      {business.deal ? (
        <div className="mt-3 rounded-3xl bg-mist px-4 py-3 text-sm text-ink">
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
