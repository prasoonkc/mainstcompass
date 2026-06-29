export const APP_NAME = 'MainStreet Compass';

export const CATEGORY_CONFIG = {
  'food-drink': {
    label: 'Food & Drink',
    color: '#dd8d7a',
  },
  retail: {
    label: 'Retail',
    color: '#73957a',
  },
  services: {
    label: 'Services',
    color: '#7ca6b8',
  },
  'health-beauty': {
    label: 'Health & Beauty',
    color: '#d8b77d',
  },
  education: {
    label: 'Education',
    color: '#b36c86',
  },
  entertainment: {
    label: 'Entertainment',
    color: '#8f8ac0',
  },
  community: {
    label: 'Community',
    color: '#8d847d',
  },
  other: {
    label: 'Other',
    color: '#9da4a8',
  },
};

export const CATEGORY_OPTIONS = Object.entries(CATEGORY_CONFIG).map(([value, config]) => ({
  value,
  ...config,
}));

export const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'reviews', label: 'Most Reviewed' },
  { value: 'distance', label: 'Nearest First' },
  { value: 'deals', label: 'Best Deals' },
];

export const STORAGE_KEYS = {
  authUser: 'msc.auth-user',
  authAccounts: 'msc.auth-accounts',
  favorites: 'msc.favorites',
  reviews: 'msc.reviews',
  copiedDeals: 'msc.copied-deals',
  location: 'msc.last-location',
  dealRedemptions: 'msc.deal-redemptions',
};

export const BRAND_LOGO_PATH = '/brand-logo.png';

export const DEFAULT_CENTER = {
  lat: 34.7465,
  lng: -92.2896,
  label: 'Little Rock, Arkansas',
};
