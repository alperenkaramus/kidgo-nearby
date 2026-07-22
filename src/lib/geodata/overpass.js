import { CATEGORY_OVERPASS_FILTERS, normalizeCategory } from './categories.js';

const OVERPASS_ENDPOINTS = Object.freeze([
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
]);

export function buildOverpassQuery({ lat, lon, radius = 2500, category } = {}) {
  const normalizedCategory = normalizeCategory(category);
  const around = `(around:${Math.min(Number(radius) || 2500, 10000)},${lat},${lon})`;
  let body;

  if (!normalizedCategory) {
    body = [
      `nwr["leisure"~"^(playground|park|garden|water_park|sports_centre)$"]${around};`,
      `nwr["tourism"~"^(museum|gallery|zoo|aquarium|attraction|theme_park)$"]${around};`,
      `nwr["amenity"~"^(library|arts_centre|planetarium|science_centre|cinema|food_court|ice_cream)$"]${around};`,
      `nwr["amenity"="cafe"]["kids_area"="yes"]${around};`,
      `nwr["amenity"="cafe"]["playground"="yes"]${around};`,
      `nwr["amenity"="cafe"]["highchair"="yes"]${around};`,
      `nwr["amenity"="restaurant"]["kids_area"="yes"]${around};`,
      `nwr["amenity"="restaurant"]["playground"="yes"]${around};`,
      `nwr["amenity"="restaurant"]["highchair"="yes"]${around};`,
    ].join('\n  ');
  } else {
    const filters = CATEGORY_OVERPASS_FILTERS[normalizedCategory] || [];
    body = filters
      .flatMap((filter) => [`node${filter}${around};`, `way${filter}${around};`, `relation${filter}${around};`])
      .join('\n  ');
  }

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
