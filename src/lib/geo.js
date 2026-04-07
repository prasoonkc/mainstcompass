import { DEFAULT_CENTER } from './constants';

function uniqueParts(parts) {
  return parts.filter((part, index) => part && parts.indexOf(part) === index);
}

function formatLocationLabel(result) {
  const address = result.address || {};
  const placeName =
    address.city ||
    address.town ||
    address.village ||
    address.suburb ||
    address.hamlet ||
    address.municipality ||
    address.county ||
    result.name;

  const streetAddress = uniqueParts([
    address.house_number,
    address.road,
  ]).join(' ');

  const locality = uniqueParts([
    placeName,
    address.state,
    address.country,
  ]).join(', ');

  if (streetAddress && placeName) {
    return uniqueParts([streetAddress, placeName, address.state, address.country]).join(', ');
  }

  return locality || result.display_name;
}

export async function geocodeLocation(query) {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    throw new Error('Enter an address, city, ZIP code, or landmark to search.');
  }

  const params = new URLSearchParams({
    q: trimmedQuery,
    format: 'jsonv2',
    addressdetails: '1',
    limit: '5',
  });

  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Location search is temporarily unavailable.');
  }

  const results = await response.json();

  if (!Array.isArray(results) || results.length === 0) {
    throw new Error('No matching location was found. Try a broader search.');
  }

  return results.map((result) => ({
    lat: Number(result.lat),
    lng: Number(result.lon),
    label: formatLocationLabel(result),
  }));
}

export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported on this device.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        resolve({
          lat: coords.latitude,
          lng: coords.longitude,
          label: 'Your current location',
        });
      },
      () => {
        reject(new Error('Location permission was denied.'));
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 300000 },
    );
  });
}

export function calculateDistanceMiles(origin, target) {
  if (!origin || !target) {
    return null;
  }

  const toRadians = (value) => (value * Math.PI) / 180;
  const earthRadiusMiles = 3958.8;
  const dLat = toRadians(target.lat - origin.lat);
  const dLng = toRadians(target.lng - origin.lng);
  const latitude1 = toRadians(origin.lat);
  const latitude2 = toRadians(target.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(latitude1) * Math.cos(latitude2);

  return Number((2 * earthRadiusMiles * Math.asin(Math.sqrt(a))).toFixed(1));
}

export function isNearLittleRock(location) {
  const distance = calculateDistanceMiles(location, DEFAULT_CENTER);
  return distance !== null && distance <= 20;
}
