import { STORAGE_KEYS } from './constants';

function parse(key, fallback) {
  try {
    const rawValue = window.localStorage.getItem(key);
    return rawValue ? JSON.parse(rawValue) : fallback;
  } catch {
    return fallback;
  }
}

export function getStoredFavorites() {
  return parse(STORAGE_KEYS.favorites, {});
}

export function getStoredReviews() {
  return parse(STORAGE_KEYS.reviews, []);
}

export function getStoredCopiedDeals() {
  return parse(STORAGE_KEYS.copiedDeals, []);
}

export function getStoredLocation() {
  return parse(STORAGE_KEYS.location, null);
}

export function getStoredAuthUser() {
  return parse(STORAGE_KEYS.authUser, null);
}

export function saveToStorage(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}
