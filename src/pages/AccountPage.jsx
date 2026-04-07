import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { LockKeyhole, MailCheck, UserRound, X } from 'lucide-react';
import { useAppAuth } from '../hooks/useAuth.jsx';

export function AccountPage() {
  const { appState } = useOutletContext();
  const { authMode, isAuthenticated, user, login, register, logout, isLoading } = useAppAuth();
  const [mode, setMode] = useState('signin');
  const [signInValues, setSignInValues] = useState({ email: '', password: '' });
  const [registerValues, setRegisterValues] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [feedback, setFeedback] = useState('');
  const [verificationNotice, setVerificationNotice] = useState('');

  function handleSignIn(event) {
    event.preventDefault();
    const result = login(signInValues);
    setFeedback(result.message);
  }

  function handleRegister(event) {
    event.preventDefault();
    const result = register(registerValues);
    if (result.ok) {
      setFeedback('');
      setVerificationNotice(result.message);
      setMode('signin');
      setRegisterValues({ name: '', email: '', password: '', confirmPassword: '' });
      setSignInValues((current) => ({ ...current, email: registerValues.email }));
      return;
    }

    setFeedback(result.message);
  }

  function handleGoogleProofOfConcept() {
    setFeedback('Continue with Google is shown as a proof of concept and can be connected through Auth0 or Supabase Auth later.');
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
          <div className="mt-6 space-y-3">
            <button type="button" disabled={isLoading} onClick={() => login()} className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white">
              {isLoading ? 'Loading...' : 'Continue securely'}
            </button>
            <button
              type="button"
              onClick={handleGoogleProofOfConcept}
              className="inline-flex items-center justify-center gap-3 rounded-full border border-ink/10 bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-mist"
            >
              <GoogleMark />
              Continue with Google
            </button>
          </div>
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
                <p className="text-xs text-ink/55">Use at least 8 characters with one uppercase letter, one lowercase letter, and one number.</p>
                <button type="submit" className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white">
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={handleGoogleProofOfConcept}
                  className="inline-flex w-full items-center justify-center gap-3 rounded-full border border-ink/10 bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-mist"
                >
                  <GoogleMark />
                  Continue with Google
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
                <p className="text-xs text-ink/55">Use at least 8 characters with one uppercase letter, one lowercase letter, and one number.</p>
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

      {verificationNotice ? (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-ink/45 p-4">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-moss">Email verification</p>
                <h3 className="mt-1 flex items-center gap-2 text-2xl font-semibold text-ink"><MailCheck size={22} /> Check your inbox</h3>
              </div>
              <button
                type="button"
                onClick={() => setVerificationNotice('')}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-mist text-ink"
                aria-label="Close verification notice"
              >
                <X size={18} />
              </button>
            </div>
            <p className="mt-4 text-sm text-ink/70">{verificationNotice}</p>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setVerificationNotice('')}
                className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white"
              >
                Back to sign in
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.8-5.5 3.8-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.4 14.6 2.5 12 2.5 6.8 2.5 2.5 6.8 2.5 12S6.8 21.5 12 21.5c6.9 0 9.1-4.8 9.1-7.3 0-.5-.1-.8-.1-1.1H12Z" />
      <path fill="#34A853" d="M2.5 7.3l3.2 2.4C6.6 7.3 9.1 5.6 12 5.6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.4 14.6 2.5 12 2.5c-3.7 0-6.9 2.1-8.5 4.8Z" opacity="0.85" />
      <path fill="#FBBC05" d="M2.5 16.7 6 14c.8 2.5 3.1 4 6 4 3.8 0 5.1-2.6 5.4-3.8H12v-3.9h9c.1.3.1.7.1 1.1 0 2.5-2.2 7.3-9.1 7.3-4.7 0-8.7-3.8-9.5-8.8Z" opacity="0.9" />
      <path fill="#4285F4" d="M2.5 7.3C1.9 8.6 1.5 10.3 1.5 12s.4 3.4 1 4.7L6 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2l-3.5-2.7Z" />
    </svg>
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
