import { CATEGORY_OVERPASS_FILTERS, CATEGORIES, normalizeCategory } from './categories.js';

const OVERPASS_ENDPOINTS = Object.freeze([
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
]);

export function buildOverpassQuery({ lat, lon, radius = 2500, category } = {}) {
  const categories = normalizeCategory(category) ? [normalizeCategory(category)] : CATEGORIES;
  const filters = categories.flatMap((item) => CATEGORY_OVERPASS_FILTERS[item] || []);
  const around = `(around:${Math.min(Number(radius) || 2500, 10000)},${lat},${lon})`;
  const body = filters
    .flatMap((filter) => [`node${filter}${around};`, `way${filter}${around};`, `relation${filter}${around};`])
    .join('\n  ');

  return `[out:json][timeout:20];\n(\n  ${body}\n);\nout center tags;`;
}

export async function fetchOverpassPlaces({ location, radius, category, fetchImpl = globalThis.fetch, endpoints = OVERPASS_ENDPOINTS } = {}) {
  if (!location?.lat || !location?.lon) throw new Error('location.lat and location.lon are required');
  if (typeof fetchImpl !== 'function') throw new Error('fetch is not available in this runtime');

  const query = buildOverpassQuery({ lat: location.lat, lon: location.lon, radius, category });
  let lastError;
  for (const endpoint of endpoints) {
    try {
      const response = await fetchImpl(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: new URLSearchParams({ data: query }),
      });
      if (!response.ok) throw new Error(`Overpass ${response.status}: ${await response.text()}`);
      const payload = await response.json();
      return payload.elements || [];
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error('Overpass request failed');
}
