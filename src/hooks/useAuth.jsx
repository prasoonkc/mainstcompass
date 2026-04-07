import { createContext, useContext, useMemo } from 'react';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { STORAGE_KEYS } from '../lib/constants';
import { useLocalStorageState } from './useLocalStorageState';

const AuthContext = createContext(null);

function LocalAuthProvider({ children }) {
  const [user, setUser] = useLocalStorageState(STORAGE_KEYS.authUser, null);
  const [accounts, setAccounts] = useLocalStorageState(STORAGE_KEYS.authAccounts, []);

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(user),
      user,
      isLoading: false,
      login: ({ email, password }) => {
        const normalizedEmail = email.trim().toLowerCase();
        const account = accounts.find((item) => item.email === normalizedEmail && item.password === password);

        if (!account) {
          return { ok: false, message: 'Email or password did not match.' };
        }

        setUser({
          id: normalizedEmail,
          name: account.name,
          email: normalizedEmail,
          mode: 'local',
        });
        return { ok: true, message: 'Signed in successfully.' };
      },
      register: ({ name, email, password, confirmPassword }) => {
        const trimmedName = name.trim();
        const normalizedEmail = email.trim().toLowerCase();
        const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

        if (!trimmedName) {
          return { ok: false, message: 'Enter your name.' };
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
          return { ok: false, message: 'Enter a valid email address.' };
        }

        if (password.length < 8) {
          return { ok: false, message: 'Passwords must be at least 8 characters.' };
        }

        if (!passwordPattern.test(password)) {
          return {
            ok: false,
            message: 'Password must include at least one number, one uppercase letter, and one lowercase letter.',
          };
        }

        if (password !== confirmPassword) {
          return { ok: false, message: 'Passwords do not match.' };
        }

        if (accounts.some((item) => item.email === normalizedEmail)) {
          return { ok: false, message: 'An account with that email already exists.' };
        }

        const nextAccount = {
          id: normalizedEmail,
          name: trimmedName,
          email: normalizedEmail,
          password,
        };

        setAccounts([...accounts, nextAccount]);

        return {
          ok: true,
          message: 'We sent a verification link to your email. Please verify your email before signing in.',
        };
      },
      logout: () => setUser(null),
      authMode: 'local',
    }),
    [accounts, setAccounts, setUser, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function Auth0Bridge({ children }) {
  const {
    isAuthenticated,
    isLoading,
    user,
    loginWithRedirect,
    logout: auth0Logout,
  } = useAuth0();

  const value = useMemo(
    () => ({
      isAuthenticated,
      user: user
        ? {
            id: user.sub,
            name: user.name || user.nickname || user.email,
            email: user.email,
            picture: user.picture,
            mode: 'auth0',
          }
        : null,
      isLoading,
      login: () => loginWithRedirect(),
      register: () => loginWithRedirect(),
      logout: () => auth0Logout({ logoutParams: { returnTo: window.location.origin } }),
      authMode: 'auth0',
    }),
    [auth0Logout, isAuthenticated, isLoading, loginWithRedirect, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AppAuthProvider({ children }) {
  const domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
  const audience = import.meta.env.VITE_AUTH0_AUDIENCE;

  if (!domain || !clientId) {
    return <LocalAuthProvider>{children}</LocalAuthProvider>;
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        ...(audience ? { audience } : {}),
      }}
      cacheLocation="localstorage"
    >
      <Auth0Bridge>{children}</Auth0Bridge>
    </Auth0Provider>
  );
}

export function useAppAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAppAuth must be used inside AppAuthProvider.');
  }

  return context;
}
