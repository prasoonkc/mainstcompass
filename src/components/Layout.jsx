import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { MapPinned, Heart, MessageSquareText, Tag, ChartColumnBig, UserRound, Building2 } from 'lucide-react';
import { APP_NAME, BRAND_LOGO_PATH } from '../lib/constants';
import { useAppAuth } from '../hooks/useAuth.jsx';

const navigationItems = [
  { to: '/', label: 'Discover', icon: MapPinned },
  { to: '/favorites', label: 'Favorites', icon: Heart },
  { to: '/reviews', label: 'Reviews', icon: MessageSquareText },
  { to: '/deals', label: 'Deals', icon: Tag },
  { to: '/analytics', label: 'Analytics', icon: ChartColumnBig },
  { to: '/account', label: 'Account', icon: UserRound },
];

export function Layout({ appState, appActions }) {
  const { isAuthenticated, user } = useAppAuth();
  const [showLogo, setShowLogo] = useState(true);

  return (
    <div className="min-h-screen bg-mist text-ink">
      <div className="pointer-events-none fixed inset-0 bg-grain" aria-hidden="true" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-[1500px] flex-col px-4 pb-10 pt-4 sm:px-6 lg:px-8">
        <header className="mb-6 rounded-[2rem] border border-white/70 bg-white/80 px-5 py-4 shadow-card backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              {showLogo ? (
                <img
                  src={BRAND_LOGO_PATH}
                  alt={`${APP_NAME} logo`}
                  className="h-16 w-16 rounded-[1.35rem] border border-white/70 bg-white object-cover shadow-sm"
                  onError={() => setShowLogo(false)}
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-[1.35rem] border border-white/70 bg-gradient-to-br from-clay/25 to-gold/25 text-xl font-semibold text-ink shadow-sm">
                  MC
                </div>
              )}
              <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-moss">Support local first</p>
              <h1 className="text-3xl font-semibold tracking-tight">{APP_NAME}</h1>
              <p className="max-w-2xl text-sm text-ink/70 sm:text-base">
                Discover neighborhood businesses, compare ratings, save favorites, and explore local deals with a map-first guide.
              </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-full border border-ink/10 bg-mist px-4 py-2 text-sm text-ink/70">
                Search area: <span className="font-semibold text-ink">{appState.location.label}</span>
              </div>
              <div className="rounded-full border border-ink/10 bg-ink px-4 py-2 text-sm font-medium text-white">
                {isAuthenticated ? `Signed in as ${user?.name}` : 'Guest browsing mode'}
              </div>
            </div>
          </div>
          <nav className="mt-5 flex flex-wrap gap-2" aria-label="Primary">
            {navigationItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive ? 'bg-ink text-white' : 'bg-mist text-ink/75 hover:bg-white'
                  }`
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
            {user?.role === 'owner' && (
              <NavLink
                to="/owner-dashboard"
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive ? 'bg-moss text-white' : 'bg-moss/15 text-moss hover:bg-moss/25'
                  }`
                }
              >
                <Building2 size={16} />
                My Business
              </NavLink>
            )}
          </nav>
        </header>
        <main className="flex-1">
          <Outlet context={{ appState, appActions }} />
        </main>
      </div>
    </div>
  );
}
