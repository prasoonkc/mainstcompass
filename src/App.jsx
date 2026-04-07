import { useEffect, useMemo, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { VoiceAssistant } from './components/VoiceAssistant';
import { useLocalStorageState } from './hooks/useLocalStorageState';
import { AppAuthProvider, useAppAuth } from './hooks/useAuth.jsx';
import { DealsPage } from './pages/DealsPage';
import { DiscoverPage } from './pages/DiscoverPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AccountPage } from './pages/AccountPage';
import { DEFAULT_CENTER, STORAGE_KEYS } from './lib/constants';
import { buildAnalyticsReport, combineBusinessData, fetchNearbyBusinesses, filterAndSortBusinesses, getFeaturedBusinesses, getRecommendedBusinesses, mergeBusinesses } from './lib/businesses';
import { geocodeLocation, getCurrentPosition } from './lib/geo';

const defaultFilters = {
  searchText: '',
  category: 'all',
  minimumRating: 0,
  sortBy: 'recommended',
};

function AppShell() {
  const { isAuthenticated, user } = useAppAuth();
  // These local stores keep the demo self-contained while still behaving like a real app.
  const [storedLocation, setStoredLocation] = useLocalStorageState(STORAGE_KEYS.location, DEFAULT_CENTER);
  const [favoritesByUser, setFavoritesByUser] = useLocalStorageState(STORAGE_KEYS.favorites, {});
  const [reviews, setReviews] = useLocalStorageState(STORAGE_KEYS.reviews, []);
  const [copiedDeals, setCopiedDeals] = useLocalStorageState(STORAGE_KEYS.copiedDeals, []);
  const [location, setLocation] = useState(storedLocation || DEFAULT_CENTER);
  const [locationMatches, setLocationMatches] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [businesses, setBusinesses] = useState(getFeaturedBusinesses(DEFAULT_CENTER));
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const currentUserId = user?.id || 'guest';

  useEffect(() => {
    setLocation(storedLocation || DEFAULT_CENTER);
  }, [storedLocation]);

  useEffect(() => {
    let isActive = true;

    async function discoverBusinesses() {
      // Pull nearby businesses whenever the user changes the search area.
      setIsDiscovering(true);
      setErrorMessage('');

      try {
        const remoteBusinesses = await fetchNearbyBusinesses(location);
        if (!isActive) {
          return;
        }
        setBusinesses(mergeBusinesses(location, remoteBusinesses));
      } catch (error) {
        if (!isActive) {
          return;
        }
        setBusinesses(mergeBusinesses(location, []));
        setErrorMessage(error.message || 'Unable to load nearby businesses right now.');
      } finally {
        if (isActive) {
          setIsDiscovering(false);
        }
      }
    }

    discoverBusinesses();

    return () => {
      isActive = false;
    };
  }, [location]);

  useEffect(() => {
    if (storedLocation) {
      return;
    }

    requestCurrentLocation();
  }, []);

  const enrichedBusinesses = useMemo(
    () => combineBusinessData(businesses, reviews, favoritesByUser, currentUserId),
    [businesses, reviews, favoritesByUser, currentUserId],
  );

  const filteredBusinesses = useMemo(
    () => filterAndSortBusinesses(enrichedBusinesses, filters),
    [enrichedBusinesses, filters],
  );

  const recommendedBusinesses = useMemo(
    () => getRecommendedBusinesses(filteredBusinesses),
    [filteredBusinesses],
  );

  const favoriteBusinesses = enrichedBusinesses.filter((business) => business.isFavorite);
  const reviewHistory = reviews.filter((review) => review.userId === currentUserId);
  const analyticsReport = useMemo(
    () => buildAnalyticsReport(enrichedBusinesses, reviews),
    [enrichedBusinesses, reviews],
  );

  async function requestCurrentLocation() {
    try {
      const currentLocation = await getCurrentPosition();
      setStoredLocation(currentLocation);
      setErrorMessage('');
      setStatusMessage('Using your current location to surface nearby businesses.');
    } catch (error) {
      setErrorMessage(error.message || 'Unable to use your current location.');
    }
  }

  async function searchLocation(query) {
    try {
      const matches = await geocodeLocation(query);
      setLocationMatches(matches);
      setStoredLocation(matches[0]);
      setErrorMessage('');
      setStatusMessage(`Showing businesses near ${matches[0].label}.`);
    } catch (error) {
      setErrorMessage(error.message || 'Could not search that location.');
    }
  }

  function selectLocation(match) {
    setStoredLocation(match);
    setErrorMessage('');
    setStatusMessage(`Updated the map to ${match.label}.`);
  }

  function toggleFavorite(businessId) {
    if (!isAuthenticated) {
      setErrorMessage('Sign in to save favorites to your account.');
      return false;
    }

    const currentFavorites = favoritesByUser[currentUserId] || [];
    const nextFavorites = currentFavorites.includes(businessId)
      ? currentFavorites.filter((id) => id !== businessId)
      : [...currentFavorites, businessId];

    setFavoritesByUser({
      ...favoritesByUser,
      [currentUserId]: nextFavorites,
    });
    setStatusMessage(currentFavorites.includes(businessId) ? 'Removed from favorites.' : 'Saved to favorites.');
    return true;
  }

  function submitReview({ businessId, rating, comment, verificationAnswer, expectedAnswer, honeypot, startedAt }) {
    if (!isAuthenticated) {
      setErrorMessage('Sign in before posting a review.');
      return { ok: false, message: 'Sign in before posting a review.' };
    }

    if (honeypot) {
      return { ok: false, message: 'Bot verification failed.' };
    }

    if (Date.now() - startedAt < 1500) {
      return { ok: false, message: 'Please take a moment to review before submitting.' };
    }

    if (Number(verificationAnswer) !== Number(expectedAnswer)) {
      return { ok: false, message: 'Verification answer did not match.' };
    }

    if (rating < 1 || rating > 5) {
      return { ok: false, message: 'Ratings must be between 1 and 5 stars.' };
    }

    if (comment && comment.trim().length > 280) {
      return { ok: false, message: 'Comments must stay under 280 characters.' };
    }

    const review = {
      id: `${businessId}-${currentUserId}-${Date.now()}`,
      businessId,
      userId: currentUserId,
      userName: user?.name || 'Local User',
      rating,
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
    };

    setReviews([review, ...reviews]);
    setStatusMessage('Review submitted successfully.');
    return { ok: true, message: 'Review submitted successfully.' };
  }

  async function copyDeal(code, businessId) {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedDeals([...new Set([...copiedDeals, businessId])]);
      setStatusMessage(`Copied ${code} to your clipboard.`);
    } catch {
      setErrorMessage('Could not copy the deal code on this browser.');
    }
  }

  function updateFilters(partialFilters) {
    setFilters((currentFilters) => ({
      ...currentFilters,
      ...partialFilters,
    }));
  }

  // Pages read from appState; child components trigger work through appActions.
  const appState = {
    location,
    locationMatches,
    filters,
    businesses: enrichedBusinesses,
    filteredBusinesses,
    recommendedBusinesses,
    favoriteBusinesses,
    reviewHistory,
    reviews,
    analyticsReport,
    isDiscovering,
    errorMessage,
    statusMessage,
    copiedDeals,
  };

  const appActions = {
    requestCurrentLocation,
    searchLocation,
    selectLocation,
    updateFilters,
    toggleFavorite,
    submitReview,
    copyDeal,
    clearError: () => setErrorMessage(''),
    clearStatus: () => setStatusMessage(''),
  };

  return (
    <>
      <Routes>
        <Route element={<Layout appState={appState} appActions={appActions} />}>
          <Route index element={<DiscoverPage />} />
          <Route path="favorites" element={<FavoritesPage />} />
          <Route path="reviews" element={<ReviewsPage />} />
          <Route path="deals" element={<DealsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="account" element={<AccountPage />} />
        </Route>
      </Routes>
      <VoiceAssistant appState={appState} appActions={appActions} />
    </>
  );
}

export default function App() {
  return (
    <AppAuthProvider>
      <AppShell />
    </AppAuthProvider>
  );
}
