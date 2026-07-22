import { normalizeCategory } from './categories.js';
import { geocodeLocation } from './nominatim.js';
import { normalizeOsmElements } from './normalize.js';
import { fetchOverpassPlaces } from './overpass.js';
import { filterPlacesByCategory, rankPlaces } from './scoring.js';
import { fallbackCityForCoords, getFallbackPlaces } from './seedData.js';

function shouldUseLiveOsm() {
  if (typeof window === 'undefined') return true;
  return import.meta.env?.VITE_ENABLE_LIVE_OSM === 'true';
}

export async function resolveLocation({ location, query, fetchImpl } = {}) {
  if (location?.lat && location?.lon) return { lat: Number(location.lat), lon: Number(location.lon), label: location.label };
  if (!query) throw new Error('Provide location coordinates or a query/city string');
  const [first] = await geocodeLocation(query, { fetchImpl });
  if (!first) throw new Error(`No geocoding result for ${query}`);
  return { lat: first.lat, lon: first.lon, label: first.displayName };
}

export async function searchFamilyPlaces({
  location,
  query,
  city,
  category,
  age,
  intent,
  radius = 2500,
  limit = 30,
  fetchImpl = globalThis.fetch,
  useFallback = true,
} = {}) {
  const filters = { category: normalizeCategory(category), age, intent };
  const fallbackOrigin = location?.lat && location?.lon ? { lat: Number(location.lat), lon: Number(location.lon) } : undefined;
  const fallbackCity = fallbackOrigin ? fallbackCityForCoords(fallbackOrigin) : (city || query || 'istanbul');
  if (!shouldUseLiveOsm()) {
    return getFallbackPlaces(fallbackCity, fallbackOrigin, filters).slice(0, limit);
  }
  try {
    const origin = await resolveLocation({ location, query: query || city, fetchImpl });
    const elements = await fetchOverpassPlaces({ location: origin, radius, category: filters.category, fetchImpl });
    const normalized = filterPlacesByCategory(normalizeOsmElements(elements, { origin }), filters.category);
    const ranked = rankPlaces(normalized, filters).slice(0, limit);
    if (ranked.length > 0) return ranked;
    if (!useFallback) return [];
    return getFallbackPlaces(fallbackCity, origin, filters).slice(0, limit);
  } catch (error) {
    if (!useFallback) throw error;
    return getFallbackPlaces(fallbackCity, fallbackOrigin, filters).slice(0, limit);
  }
}
