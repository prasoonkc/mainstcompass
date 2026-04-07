import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { LockKeyhole, UserRound } from 'lucide-react';
import { useAppAuth } from '../hooks/useAuth.jsx';

export function AccountPage() {
  const { appState } = useOutletContext();
  const { authMode, isAuthenticated, user, login, register, logout, isLoading } = useAppAuth();
  const [mode, setMode] = useState('signin');
  const [signInValues, setSignInValues] = useState({ email: '', password: '' });
  const [registerValues, setRegisterValues] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [feedback, setFeedback] = useState('');

  function handleSignIn(event) {
    event.preventDefault();
    const result = login(signInValues);
    setFeedback(result.message);
  }

  function handleRegister(event) {
    event.preventDefault();
    const result = register(registerValues);
    setFeedback(result.message);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
      <section className="rounded-[2rem] border border-white/60 bg-white/85 p-6 shadow-card backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-moss">Account access</p>
        <h2 className="mt-1 flex items-center gap-2 text-3xl font-semibold tracking-tight"><LockKeyhole size={22} /> Sign in to save and review</h2>
        <p className="mt-2 text-sm text-ink/70">
          Create an account to save favorites, keep your reviews connected to your profile, and personalize your experience.
        </p>

        {isAuthenticated ? (
          <div className="mt-6 space-y-4 rounded-[1.6rem] bg-mist p-5">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-ink text-white">
                <UserRound size={20} />
              </div>
              <div>
                <p className="font-semibold text-ink">{user?.name}</p>
                <p className="text-sm text-ink/70">{user?.email || 'Auth0 profile'}</p>
              </div>
            </div>
            <p className="text-sm text-ink/70">Every review you post is connected to this account.</p>
            <button type="button" onClick={logout} className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white">
              Sign out
            </button>
          </div>
        ) : authMode === 'auth0' ? (
          <button type="button" disabled={isLoading} onClick={() => login()} className="mt-6 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white">
            {isLoading ? 'Loading...' : 'Continue securely'}
          </button>
        ) : (
          <div className="mt-6 space-y-4">
            <div className="inline-flex rounded-full bg-mist p-1">
              <button
                type="button"
                onClick={() => setMode('signin')}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${mode === 'signin' ? 'bg-ink text-white' : 'text-ink/70'}`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => setMode('create')}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${mode === 'create' ? 'bg-ink text-white' : 'text-ink/70'}`}
              >
                Create account
              </button>
            </div>

            {mode === 'signin' ? (
              <form className="space-y-4" onSubmit={handleSignIn}>
                <label className="block text-sm">
                  <span className="mb-2 block font-medium text-ink">Email</span>
                  <input
                    type="email"
                    value={signInValues.email}
                    onChange={(event) => setSignInValues((current) => ({ ...current, email: event.target.value }))}
                    className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none"
                    placeholder="jordan@example.com"
                    required
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-2 block font-medium text-ink">Password</span>
                  <input
                    type="password"
                    value={signInValues.password}
                    onChange={(event) => setSignInValues((current) => ({ ...current, password: event.target.value }))}
                    className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none"
                    placeholder="Enter your password"
                    required
                  />
                </label>
                <button type="submit" className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white">
                  Sign in
                </button>
              </form>
            ) : (
              <form className="space-y-4" onSubmit={handleRegister}>
                <label className="block text-sm">
                  <span className="mb-2 block font-medium text-ink">Name</span>
                  <input
                    type="text"
                    value={registerValues.name}
                    onChange={(event) => setRegisterValues((current) => ({ ...current, name: event.target.value }))}
                    className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none"
                    placeholder="Jordan Parker"
                    required
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-2 block font-medium text-ink">Email</span>
                  <input
                    type="email"
                    value={registerValues.email}
                    onChange={(event) => setRegisterValues((current) => ({ ...current, email: event.target.value }))}
                    className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none"
                    placeholder="jordan@example.com"
                    required
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-2 block font-medium text-ink">Password</span>
                  <input
                    type="password"
                    value={registerValues.password}
                    onChange={(event) => setRegisterValues((current) => ({ ...current, password: event.target.value }))}
                    className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none"
                    placeholder="At least 8 characters"
                    required
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-2 block font-medium text-ink">Confirm password</span>
                  <input
                    type="password"
                    value={registerValues.confirmPassword}
                    onChange={(event) => setRegisterValues((current) => ({ ...current, confirmPassword: event.target.value }))}
                    className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none"
                    placeholder="Re-enter your password"
                    required
                  />
                </label>
                <button type="submit" className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white">
                  Create account
                </button>
              </form>
            )}
            {feedback ? <p className="text-sm text-clay">{feedback}</p> : null}
          </div>
        )}
      </section>

      <section className="rounded-[2rem] border border-white/60 bg-ink p-6 text-white shadow-card">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold">User summary</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <SummaryCard label="Saved favorites" value={appState.businesses.filter((business) => business.isFavorite).length} />
          <SummaryCard label="Reviews submitted" value={appState.reviewHistory.length} />
          <SummaryCard label="Copied deals" value={appState.copiedDeals.length} />
        </div>
      </section>
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-[1.6rem] bg-white/10 px-4 py-5">
      <p className="text-3xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm text-white/70">{label}</p>
    </div>
  );
}
