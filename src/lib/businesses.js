import { featuredBusinesses } from '../data/featuredBusinesses';
import { CATEGORY_CONFIG } from './constants';
import { calculateDistanceMiles, isNearLittleRock } from './geo';

const GEOAPIFY_KEY = import.meta.env.VITE_GEOAPIFY_KEY;

const CATEGORY_LOOKUPS = {
  cafe: 'food-drink',
  restaurant: 'food-drink',
  fast_food: 'food-drink',
  food_court: 'food-drink',
  biergarten: 'food-drink',
  coffee: 'food-drink',
  bar: 'food-drink',
  pub: 'food-drink',
  bakery: 'food-drink',
  ice_cream: 'food-drink',
  marketplace: 'retail',
  mall: 'retail',
  supermarket: 'retail',
  convenience: 'retail',
  clothes: 'retail',
  books: 'retail',
  florist: 'retail',
  gift: 'retail',
  bicycle: 'retail',
  department_store: 'retail',
  boutique: 'retail',
  beauty: 'health-beauty',
  hairdresser: 'health-beauty',
  spa: 'health-beauty',
  dentist: 'health-beauty',
  pharmacy: 'health-beauty',
  clinic: 'health-beauty',
  doctors: 'health-beauty',
  optician: 'health-beauty',
  school: 'education',
  college: 'education',
  library: 'education',
  kindergarten: 'education',
  university: 'education',
  cinema: 'entertainment',
  theatre: 'entertainment',
  music_venue: 'entertainment',
  arts_centre: 'entertainment',
  nightclub: 'entertainment',
  bowling_alley: 'entertainment',
  escape_game: 'entertainment',
  gym: 'services',
  bank: 'services',
  repair: 'services',
  car_repair: 'services',
  laundry: 'services',
  coworking_space: 'services',
  travel_agency: 'services',
  estate_agent: 'services',
  tailor: 'services',
  locksmith: 'services',
  post_office: 'community',
  community_centre: 'community',
  place_of_worship: 'community',
  museum: 'community',
  park: 'community',
  government: 'community',
  social_facility: 'community',
};

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
];

const GEOAPIFY_CATEGORY_GROUPS = [
  'catering',
  'commercial',
  'healthcare',
  'leisure',
  'tourism',
  'education',
  'service',
  'entertainment',
].join(',');

const geoapifyCache = new Map();

function geoapifyCacheKey(location, radius) {
  return `${location.lat.toFixed(3)},${location.lng.toFixed(3)},${radius}`;
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 12000) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function numberFromHash(value, min, max) {
  const hash = value.split('').reduce((total, char) => total + char.charCodeAt(0), 0);
  const range = max - min;
  return Number((min + (hash % (range * 10)) / 10).toFixed(1));
}

function getCategoryFromTags(tags = {}) {
  const rawType = tags.shop || tags.amenity || tags.office || tags.leisure || tags.tourism || tags.craft;
  return CATEGORY_LOOKUPS[rawType] || 'other';
}

function getCategoryFromGeoapifyCategories(categories = []) {
  const joined = categories.join(',');

  if (/catering|restaurant|cafe|coffee|bakery|bar|pub|fast_food|food_court/i.test(joined)) {
    return 'food-drink';
  }

  if (/commercial|shop|mall|marketplace|supermarket|gift|clothing|books|florist|retail/i.test(joined)) {
    return 'retail';
  }

  if (/service|bank|repair|car|laundry|agency|office|tailor|locksmith|coworking/i.test(joined)) {
    return 'services';
  }

  if (/healthcare|beauty|spa|hairdresser|dentist|clinic|doctor|pharmacy|optician/i.test(joined)) {
    return 'health-beauty';
  }

  if (/education|school|college|university|library|kindergarten/i.test(joined)) {
    return 'education';
  }

  if (/entertainment|cinema|theatre|nightclub|music|arts|bowling|escape/i.test(joined)) {
    return 'entertainment';
  }

  if (/community|religion|museum|park|government|social|post/i.test(joined)) {
    return 'community';
  }

  return 'other';
}

function buildOverpassQuery({ lat, lng, radius }) {
  return `
    [out:json][timeout:25];
    (
      node(around:${radius},${lat},${lng})["amenity"]["name"];
      node(around:${radius},${lat},${lng})["shop"]["name"];
      node(around:${radius},${lat},${lng})["office"]["name"];
      node(around:${radius},${lat},${lng})["tourism"]["name"];
      node(around:${radius},${lat},${lng})["leisure"]["name"];
      node(around:${radius},${lat},${lng})["craft"]["name"];
      way(around:${radius},${lat},${lng})["amenity"]["name"];
      way(around:${radius},${lat},${lng})["shop"]["name"];
      way(around:${radius},${lat},${lng})["office"]["name"];
      way(around:${radius},${lat},${lng})["tourism"]["name"];
      way(around:${radius},${lat},${lng})["leisure"]["name"];
      relation(around:${radius},${lat},${lng})["amenity"]["name"];
      relation(around:${radius},${lat},${lng})["shop"]["name"];
    );
    out center tags qt 200;
  `;
}

async function fetchFromOverpass(endpoint, query) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=UTF-8',
      Accept: 'application/json',
    },
    body: query,
  });

  if (!response.ok) {
    throw new Error(`Overpass request failed with status ${response.status}`);
  }

  return response.json();
}

async function fetchFromGeoapify(location, radius) {
  if (!GEOAPIFY_KEY) {
    return [];
  }

  const cacheKey = geoapifyCacheKey(location, radius);
  if (geoapifyCache.has(cacheKey)) {
    return geoapifyCache.get(cacheKey);
  }

  const params = new URLSearchParams({
    categories: GEOAPIFY_CATEGORY_GROUPS,
    filter: `circle:${location.lng},${location.lat},${radius}`,
    bias: `proximity:${location.lng},${location.lat}`,
    limit: '100',
    apiKey: GEOAPIFY_KEY,
  });

  const response = await fetchWithTimeout(`https://api.geoapify.com/v2/places?${params.toString()}`, {
    headers: {
      Accept: 'application/json',
    },
  }, 12000);

  if (!response.ok) {
    throw new Error(`Geoapify request failed with status ${response.status}`);
  }

  const data = await response.json();
  const features = Array.isArray(data.features) ? data.features : [];
  const seenNames = new Set();

  const businesses = features
    .map((feature) => {
      const properties = feature.properties || {};
      const [longitude, latitude] = feature.geometry?.coordinates || [];

      if (!properties.name || !latitude || !longitude) {
        return null;
      }

      const category = getCategoryFromGeoapifyCategories(properties.categories || []);
      const business = {
        id: `geoapify-${properties.place_id || properties.datasource?.raw?.osm_id || properties.name}`,
        name: properties.name,
        category,
        lat: latitude,
        lng: longitude,
        address: properties.formatted || properties.address_line2 || 'Address available on map',
        description: `Discovered near your search in ${CATEGORY_CONFIG[category].label.toLowerCase()}.`,
        rating: numberFromHash(String(properties.place_id || properties.name), 3.9, 4.9),
        reviewCount: Math.round(numberFromHash(properties.name, 14, 260)),
        price: '$$',
        deal: null,
        distance: calculateDistanceMiles(location, { lat: latitude, lng: longitude }),
        source: 'Geoapify',
      };

      const normalizedName = business.name.toLowerCase();
      if (seenNames.has(normalizedName)) {
        return null;
      }

      seenNames.add(normalizedName);
      return business;
    })
    .filter(Boolean)
    .sort((left, right) => (left.distance ?? 999) - (right.distance ?? 999))
    .slice(0, 60);

  geoapifyCache.set(cacheKey, businesses);
  return businesses;
}

function normalizeOverpassBusiness(element, location) {
  const latitude = element.lat ?? element.center?.lat;
  const longitude = element.lon ?? element.center?.lon;
  const tags = element.tags || {};

  if (!latitude || !longitude || !tags.name) {
    return null;
  }

  const category = getCategoryFromTags(tags);
  const rating = numberFromHash(element.id.toString(), 3.8, 4.9);
  const reviewCount = Math.round(numberFromHash(tags.name, 12, 240));

  return {
    id: `osm-${element.type}-${element.id}`,
    name: tags.name,
    category,
    lat: latitude,
    lng: longitude,
    address: [tags['addr:housenumber'], tags['addr:street'], tags['addr:city']].filter(Boolean).join(' ') || 'Address available on map',
    description: `Discovered near your search using open map business data in ${CATEGORY_CONFIG[category].label.toLowerCase()}.`,
    rating,
    reviewCount,
    price: '$$',
    deal: null,
    distance: calculateDistanceMiles(location, { lat: latitude, lng: longitude }),
    source: 'OpenStreetMap',
  };
}

export async function fetchNearbyBusinesses(location, radius = 12000) {
  if (GEOAPIFY_KEY) {
    try {
      let geoapifyBusinesses = await fetchFromGeoapify(location, radius);
      if (geoapifyBusinesses.length < 5) {
        geoapifyBusinesses = await fetchFromGeoapify(location, radius * 2);
      }
      if (geoapifyBusinesses.length > 0) {
        return geoapifyBusinesses;
      }
    } catch {
      // Fall through to OpenStreetMap-based discovery if Geoapify is unavailable.
    }
  }

  const query = buildOverpassQuery({ lat: location.lat, lng: location.lng, radius });
  let data = null;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      data = await fetchFromOverpass(endpoint, query);
      break;
    } catch {
      data = null;
    }
  }

  if (!data) {
    throw new Error('Nearby business discovery is temporarily unavailable.');
  }

  const items = Array.isArray(data.elements) ? data.elements : [];
  const seenNames = new Set();

  const normalizedBusinesses = items
    .map((element) => normalizeOverpassBusiness(element, location))
    .filter(Boolean)
    .filter((business) => {
      const normalizedName = business.name.toLowerCase();
      if (seenNames.has(normalizedName)) {
        return false;
      }
      seenNames.add(normalizedName);
      return true;
    });

  return normalizedBusinesses
    .sort((left, right) => (left.distance ?? 999) - (right.distance ?? 999))
    .slice(0, 60);
}

export function getFeaturedBusinesses(location) {
  return featuredBusinesses.map((business) => ({
    ...business,
    distance: calculateDistanceMiles(location, business),
    source: 'Featured Partner',
  }));
}

export function mergeBusinesses(location, remoteBusinesses) {
  const featured = isNearLittleRock(location) ? getFeaturedBusinesses(location) : [];
  const byId = new Map();

  [...featured, ...remoteBusinesses].forEach((business) => {
    byId.set(business.id, business);
  });

  return Array.from(byId.values());
}

export function combineBusinessData(businesses, reviews, favoritesByUser, currentUserId) {
  return businesses.map((business) => {
    const businessReviews = reviews.filter((review) => review.businessId === business.id);
    const userFavoriteIds = favoritesByUser[currentUserId] || [];
    const avgReviewRating = businessReviews.length
      ? businessReviews.reduce((total, review) => total + review.rating, 0) / businessReviews.length
      : business.rating;

    return {
      ...business,
      rating: Number(avgReviewRating.toFixed(1)),
      reviewCount: Math.max(business.reviewCount || 0, businessReviews.length),
      reviews: businessReviews,
      isFavorite: userFavoriteIds.includes(business.id),
      hasDeal: Boolean(business.deal),
    };
  });
}

export function filterAndSortBusinesses(businesses, filters) {
  const { searchText, category, minimumRating, sortBy } = filters;
  const query = searchText.trim().toLowerCase();

  const filtered = businesses.filter((business) => {
    const matchesText =
      !query ||
      business.name.toLowerCase().includes(query) ||
      business.address.toLowerCase().includes(query) ||
      business.description.toLowerCase().includes(query);
    const matchesCategory = category === 'all' || business.category === category;
    const matchesRating = business.rating >= minimumRating;

    return matchesText && matchesCategory && matchesRating;
  });

  const sorters = {
    recommended: (left, right) => Number(right.hasDeal) - Number(left.hasDeal) || right.rating - left.rating || (left.distance ?? 999) - (right.distance ?? 999),
    rating: (left, right) => right.rating - left.rating,
    reviews: (left, right) => right.reviewCount - left.reviewCount,
    distance: (left, right) => (left.distance ?? 999) - (right.distance ?? 999),
    deals: (left, right) => Number(right.hasDeal) - Number(left.hasDeal) || right.rating - left.rating,
  };

  return [...filtered].sort(sorters[sortBy] || sorters.recommended);
}

export function getRecommendedBusinesses(businesses) {
  return [...businesses]
    .sort((left, right) => Number(right.hasDeal) - Number(left.hasDeal) || right.rating - left.rating)
    .slice(0, 3);
}

export function buildAnalyticsReport(businesses, reviews) {
  const categoryTotals = businesses.reduce((accumulator, business) => {
    accumulator[business.category] = (accumulator[business.category] || 0) + 1;
    return accumulator;
  }, {});

  const ratingAverage = businesses.length
    ? businesses.reduce((total, business) => total + business.rating, 0) / businesses.length
    : 0;

  return {
    totalBusinesses: businesses.length,
    activeDeals: businesses.filter((business) => business.deal).length,
    topRated: [...businesses].sort((left, right) => right.rating - left.rating).slice(0, 5),
    totalReviews: reviews.length,
    averageRating: Number(ratingAverage.toFixed(1)),
    categoryTotals,
  };
}
