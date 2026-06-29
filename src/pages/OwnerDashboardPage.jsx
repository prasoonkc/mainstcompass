import { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Building2, Star, Tag, Heart, MessageSquare, Download, Settings, Calendar, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { useAppAuth } from '../hooks/useAuth.jsx';
import { CATEGORY_CONFIG } from '../lib/constants';

const SECTION_KEYS = ['overview', 'reviews', 'deals', 'ratings'];
const SECTION_LABELS = {
  overview: 'Overview',
  reviews: 'Customer Reviews',
  deals: 'Deal Performance',
  ratings: 'Rating Breakdown',
};

export function OwnerDashboardPage() {
  const { appState } = useOutletContext();
  const { isAuthenticated, user } = useAppAuth();
  const navigate = useNavigate();

  const [sections, setSections] = useState({ overview: true, reviews: true, deals: true, ratings: true });
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [reviewsExpanded, setReviewsExpanded] = useState(true);

  if (!isAuthenticated) {
    return (
      <EmptyState
        icon={<Building2 size={40} />}
        heading="Sign in to view your dashboard"
        body="Business owners must be signed in to access their report."
        action={<button onClick={() => navigate('/account')} className="mt-6 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white">Go to Account</button>}
      />
    );
  }

  if (user?.role !== 'owner') {
    return (
      <EmptyState
        icon={<Building2 size={40} />}
        heading="Business owners only"
        body="This dashboard is for business owner accounts. Register as a business owner and link your business to get started."
        action={<button onClick={() => navigate('/account')} className="mt-6 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white">Go to Account</button>}
      />
    );
  }

  const business = appState.businesses.find((b) => b.id === user.businessId);

  if (!business) {
    return (
      <EmptyState
        icon={<Building2 size={40} />}
        heading="Business not found in this area"
        body="We couldn't find your linked business in the current search area. Try searching for Little Rock, AR."
      />
    );
  }

  function inRange(isoDate) {
    const d = new Date(isoDate);
    if (dateRange.from && d < new Date(dateRange.from)) return false;
    if (dateRange.to && d > new Date(dateRange.to + 'T23:59:59')) return false;
    return true;
  }

  const allBusinessReviews = appState.reviews.filter((r) => r.businessId === user.businessId);
  const filteredReviews = allBusinessReviews.filter((r) => inRange(r.createdAt));

  const allRedemptions = appState.dealRedemptions.filter((r) => r.businessId === user.businessId);
  const filteredRedemptions = allRedemptions.filter((r) => inRange(r.timestamp));

  const favoritesCount = Object.values(appState.favoritesByUser).filter((ids) =>
    ids.includes(user.businessId),
  ).length;

  const avgRating =
    filteredReviews.length > 0
      ? (filteredReviews.reduce((sum, r) => sum + r.rating, 0) / filteredReviews.length).toFixed(1)
      : business.rating.toFixed(1);

  const ratingBreakdown = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: filteredReviews.filter((r) => r.rating === stars).length,
  }));

  const hasDateFilter = dateRange.from || dateRange.to;

  function toggleSection(key) {
    setSections((cur) => ({ ...cur, [key]: !cur[key] }));
  }

  function downloadJSON() {
    const payload = {
      generatedAt: new Date().toISOString(),
      business: { id: business.id, name: business.name, category: business.category, address: business.address },
      dateRange: hasDateFilter ? dateRange : 'all time',
      overview: { totalReviews: filteredReviews.length, averageRating: Number(avgRating), dealCopies: filteredRedemptions.length, savedToFavorites: favoritesCount },
      reviews: filteredReviews,
      dealRedemptions: filteredRedemptions,
      ratingBreakdown,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${business.id}-report-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadCSV() {
    const rows = [
      ['Date', 'Reviewer', 'Rating', 'Comment'],
      ...filteredReviews.map((r) => [
        new Date(r.createdAt).toLocaleDateString(),
        r.userName,
        r.rating,
        `"${(r.comment || '').replace(/"/g, '""')}"`,
      ]),
    ];
    const csv = rows.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${business.id}-reviews-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-[2rem] border border-white/60 bg-white/85 p-6 shadow-card backdrop-blur">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-moss">Business Owner Report</p>
            <h2 className="mt-1 flex items-center gap-2 text-3xl font-semibold tracking-tight">
              <Building2 size={22} /> {business.name}
            </h2>
            <p className="mt-1 text-sm text-ink/60">{business.address}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-mist px-3 py-1 text-xs font-medium text-ink/70">
                {CATEGORY_CONFIG[business.category]?.label || business.category}
              </span>
              {business.deal && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/20 px-3 py-1 text-xs font-semibold text-ink">
                  <Tag size={11} /> Active deal: {business.deal.code}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:items-end">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={downloadJSON}
                className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink/80"
              >
                <Download size={14} /> JSON Report
              </button>
              <button
                onClick={downloadCSV}
                className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-mist"
              >
                <FileText size={14} /> CSV Reviews
              </button>
            </div>

            {/* Date range filter */}
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Calendar size={14} className="text-ink/40" />
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange((cur) => ({ ...cur, from: e.target.value }))}
                className="rounded-xl border border-ink/10 bg-mist px-3 py-1.5 text-sm outline-none"
              />
              <span className="text-ink/35">to</span>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange((cur) => ({ ...cur, to: e.target.value }))}
                className="rounded-xl border border-ink/10 bg-mist px-3 py-1.5 text-sm outline-none"
              />
              {hasDateFilter && (
                <button onClick={() => setDateRange({ from: '', to: '' })} className="text-xs text-clay underline">
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Section toggles */}
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-ink/8 pt-5">
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-ink/45">
            <Settings size={11} /> Sections
          </span>
          {SECTION_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => toggleSection(key)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                sections[key] ? 'bg-ink text-white' : 'bg-mist text-ink/55 hover:bg-white'
              }`}
            >
              {SECTION_LABELS[key]}
            </button>
          ))}
        </div>
      </section>

      {/* Overview metrics */}
      {sections.overview && (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={<MessageSquare size={18} />}
            value={filteredReviews.length}
            label="Customer Reviews"
            sub={hasDateFilter ? 'in date range' : 'all time'}
          />
          <MetricCard
            icon={<Star size={18} />}
            value={`${avgRating} ★`}
            label="Average Rating"
            sub={`from ${filteredReviews.length} review${filteredReviews.length !== 1 ? 's' : ''}`}
          />
          <MetricCard
            icon={<Tag size={18} />}
            value={filteredRedemptions.length}
            label="Deal Copies"
            sub={business.deal ? `code: ${business.deal.code}` : 'no active deal'}
          />
          <MetricCard
            icon={<Heart size={18} />}
            value={favoritesCount}
            label="Saved to Favorites"
            sub="across all users"
          />
        </section>
      )}

      {/* Customer reviews */}
      {sections.reviews && (
        <section className="rounded-[2rem] border border-white/60 bg-ink p-6 text-white shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold">Customer Reviews</p>
              <p className="mt-0.5 text-sm text-white/55">
                {filteredReviews.length} review{filteredReviews.length !== 1 ? 's' : ''}
                {hasDateFilter ? ' in selected range' : ''}
              </p>
            </div>
            <button
              onClick={() => setReviewsExpanded((v) => !v)}
              className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/70"
            >
              {reviewsExpanded ? <><ChevronUp size={13} /> Collapse</> : <><ChevronDown size={13} /> Expand</>}
            </button>
          </div>

          {reviewsExpanded && (
            filteredReviews.length === 0 ? (
              <p className="mt-6 text-sm text-white/40">No reviews yet{hasDateFilter ? ' in this date range' : ''}.</p>
            ) : (
              <div className="mt-5 space-y-4">
                {filteredReviews.map((review) => (
                  <article key={review.id} className="rounded-[1.6rem] bg-white/10 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{review.userName}</p>
                        <p className="text-xs text-white/50">
                          {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <StarBadge rating={review.rating} />
                    </div>
                    {review.comment && <p className="mt-3 text-sm leading-relaxed text-white/70">{review.comment}</p>}
                  </article>
                ))}
              </div>
            )
          )}
        </section>
      )}

      {/* Deal performance */}
      {sections.deals && (
        <section className="rounded-[2rem] border border-white/60 bg-white/85 p-6 shadow-card backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-moss">Deal Performance</p>
          {!business.deal ? (
            <p className="mt-4 text-sm text-ink/50">No active deal on this business. Add one through the featured business data to start tracking.</p>
          ) : (
            <div className="mt-5 rounded-[1.6rem] border border-ink/8 bg-mist p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-lg font-semibold">{business.deal.title || 'Active Deal'}</p>
                  <p className="mt-1 text-sm text-ink/65">{business.deal.description}</p>
                  <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1 font-mono text-xs font-semibold text-white">
                    {business.deal.code}
                  </div>
                  <p className="mt-2 text-xs text-ink/40">
                    Expires {new Date(business.deal.expiresAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-4xl font-semibold">{filteredRedemptions.length}</p>
                  <p className="text-sm text-ink/55">{hasDateFilter ? 'copies in range' : 'total copies'}</p>
                  <p className="mt-1 text-xs text-ink/40">{allRedemptions.length} all-time</p>
                </div>
              </div>
              {allRedemptions.length > 0 && (
                <div className="mt-5">
                  <div className="mb-1.5 flex justify-between text-xs text-ink/50">
                    <span>Redemption progress toward 50 target</span>
                    <span>{Math.min(Math.round((allRedemptions.length / 50) * 100), 100)}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-white">
                    <div
                      className="h-2.5 rounded-full bg-moss transition-all"
                      style={{ width: `${Math.min((allRedemptions.length / 50) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* Rating breakdown */}
      {sections.ratings && (
        <section className="rounded-[2rem] border border-white/60 bg-white/85 p-6 shadow-card backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-moss">Rating Breakdown</p>
          {filteredReviews.length === 0 ? (
            <p className="mt-4 text-sm text-ink/50">No reviews to break down yet{hasDateFilter ? ' in this date range' : ''}.</p>
          ) : (
            <div className="mt-5 space-y-3">
              {ratingBreakdown.map(({ stars, count }) => {
                const pct = filteredReviews.length > 0 ? (count / filteredReviews.length) * 100 : 0;
                const barColor = stars >= 4 ? '#73957a' : stars === 3 ? '#d8b77d' : '#dd8d7a';
                return (
                  <div key={stars} className="flex items-center gap-3">
                    <span className="w-10 shrink-0 text-right text-sm font-semibold text-ink/70">{stars} ★</span>
                    <div className="h-4 flex-1 overflow-hidden rounded-full bg-mist">
                      <div
                        className="h-4 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(pct, count > 0 ? 3 : 0)}%`, backgroundColor: barColor }}
                      />
                    </div>
                    <span className="w-6 shrink-0 text-right text-sm text-ink/55">{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function MetricCard({ icon, value, label, sub }) {
  return (
    <div className="rounded-[1.6rem] border border-white/60 bg-white/85 px-5 py-6 shadow-card backdrop-blur">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-mist text-ink/55">
        {icon}
      </div>
      <p className="text-3xl font-semibold">{value}</p>
      <p className="mt-1 text-sm text-ink/65">{label}</p>
      {sub && <p className="mt-0.5 text-xs text-ink/40">{sub}</p>}
    </div>
  );
}

function StarBadge({ rating }) {
  return (
    <div className="shrink-0 rounded-full bg-gold/20 px-3 py-1 text-xs font-semibold tracking-wide text-gold">
      {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
    </div>
  );
}

function EmptyState({ icon, heading, body, action }) {
  return (
    <div className="rounded-[2rem] border border-white/60 bg-white/85 p-10 text-center shadow-card backdrop-blur">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-mist text-ink/30">
        {icon}
      </div>
      <h2 className="mt-4 text-2xl font-semibold">{heading}</h2>
      <p className="mt-2 mx-auto max-w-sm text-sm text-ink/55">{body}</p>
      {action}
    </div>
  );
}
