import { useState } from 'react';
import { Crosshair, Search, SlidersHorizontal } from 'lucide-react';
import { CATEGORY_OPTIONS, SORT_OPTIONS } from '../lib/constants';

export function SearchControls({ appState, appActions }) {
  const [query, setQuery] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    appActions.searchLocation(query);
  }

  return (
    <section className="rounded-[2rem] border border-white/60 bg-white/85 p-5 shadow-card backdrop-blur">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-moss">Location-first discovery</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Search any address, city, ZIP code, or neighborhood</h2>
        </div>
        <div className="grid gap-3 text-sm sm:grid-cols-3">
          <div className="rounded-3xl bg-mist px-4 py-3">
            <p className="text-2xl font-semibold">{appState.filteredBusinesses.length}</p>
            <p className="text-ink/65">Nearby matches</p>
          </div>
          <div className="rounded-3xl bg-mist px-4 py-3">
            <p className="text-2xl font-semibold">{appState.businesses.filter((business) => business.deal).length}</p>
            <p className="text-ink/65">Active deals</p>
          </div>
          <div className="rounded-3xl bg-mist px-4 py-3">
            <p className="text-2xl font-semibold">{appState.businesses.filter((business) => business.isFavorite).length}</p>
            <p className="text-ink/65">Saved favorites</p>
          </div>
        </div>
      </div>

      <form className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,2fr)_auto]" onSubmit={handleSubmit}>
        <label className="flex items-center gap-3 rounded-full border border-ink/10 bg-mist px-4 py-3">
          <Search size={18} className="text-ink/45" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full bg-transparent text-sm outline-none placeholder:text-ink/40"
            placeholder="Enter an address, ZIP code, city, or landmark"
            aria-label="Search for a location"
          />
        </label>
        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-moss"
          >
            Search area
          </button>
          <button
            type="button"
            onClick={appActions.requestCurrentLocation}
            className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-mist"
          >
            <Crosshair size={16} />
            Use my location
          </button>
        </div>
      </form>

      {appState.locationMatches.length > 1 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {appState.locationMatches.map((match) => (
            <button
              key={`${match.lat}-${match.lng}`}
              type="button"
              onClick={() => appActions.selectLocation(match)}
              className="rounded-full border border-ink/10 bg-white px-4 py-2 text-left text-sm text-ink/70 transition hover:border-moss hover:text-ink"
            >
              {match.label}
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-5 grid gap-3 lg:grid-cols-4">
        <label className="rounded-3xl border border-ink/10 bg-mist px-4 py-3 text-sm">
          <span className="mb-2 flex items-center gap-2 font-medium text-ink"><SlidersHorizontal size={16} /> Search businesses</span>
          <input
            type="text"
            value={appState.filters.searchText}
            onChange={(event) => appActions.updateFilters({ searchText: event.target.value })}
            className="w-full bg-transparent outline-none placeholder:text-ink/40"
            placeholder="Business name or keyword"
          />
        </label>

        <label className="rounded-3xl border border-ink/10 bg-mist px-4 py-3 text-sm">
          <span className="mb-2 block font-medium text-ink">Category</span>
          <select
            value={appState.filters.category}
            onChange={(event) => appActions.updateFilters({ category: event.target.value })}
            className="w-full bg-transparent outline-none"
          >
            <option value="all">All categories</option>
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="rounded-3xl border border-ink/10 bg-mist px-4 py-3 text-sm">
          <span className="mb-2 block font-medium text-ink">Minimum rating</span>
          <select
            value={appState.filters.minimumRating}
            onChange={(event) => appActions.updateFilters({ minimumRating: Number(event.target.value) })}
            className="w-full bg-transparent outline-none"
          >
            <option value="0">Any rating</option>
            <option value="3.5">3.5+</option>
            <option value="4">4.0+</option>
            <option value="4.5">4.5+</option>
          </select>
        </label>

        <label className="rounded-3xl border border-ink/10 bg-mist px-4 py-3 text-sm">
          <span className="mb-2 block font-medium text-ink">Sort results</span>
          <select
            value={appState.filters.sortBy}
            onChange={(event) => appActions.updateFilters({ sortBy: event.target.value })}
            className="w-full bg-transparent outline-none"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
