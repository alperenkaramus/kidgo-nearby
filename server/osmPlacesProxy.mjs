import { getFallbackPlaces } from '../src/lib/geodata/seedData.js';
import { searchFamilyPlaces } from '../src/lib/geodata/places.js';

const DEFAULT_RADIUS_M = 5000;
const MAX_RADIUS_M = 20000;
const USER_AGENT = 'KidGoNearby/0.1 (https://kidgonearby.com; family place search)';

function jsonResponse(statusCode, body, headers = {}) {
  return {
    statusCode,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=300, stale-while-revalidate=3600',
      ...headers,
    },
    body: JSON.stringify(body),
  };
}

function parseBody(event = {}) {
  if (!event.body) return {};
  const raw = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body;
  return JSON.parse(raw);
}

function clampRadius(radiusKm) {
  const km = Number(radiusKm);
  if (!Number.isFinite(km) || km <= 0) return DEFAULT_RADIUS_M;
  return Math.min(Math.round(km * 1000), MAX_RADIUS_M);
}

function makeOverpassFetch(fetchImpl) {
  return async (url, options = {}) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      return await fetchImpl(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...(options.headers || {}),
          'user-agent': USER_AGENT,
          'accept': 'application/json',
        },
      });
    } finally {
      clearTimeout(timeout);
    }
  };
}

function parseCoordinate(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function isGeneratedOsmName(name = '') {
  return /^(playground|park|museum|family cafe|family restaurant|kid-friendly attraction|indoor place|family place) nearby$/i.test(String(name).trim());
}

function mergeByLocationAndName(primary = [], secondary = []) {
  const seen = new Set();
  return [...primary, ...secondary].filter((place) => {
    const key = `${String(place.name || '').toLowerCase()}|${Number(place.lat).toFixed(4)}|${Number(place.lon).toFixed(4)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function searchNearbyOsmPlaces({ lat, lon, city = 'nearby', category = 'all', age = '4', intent = 'quick', radiusKm = 5, limit = 18, fetchImpl = globalThis.fetch } = {}) {
  const latitude = parseCoordinate(lat);
  const longitude = parseCoordinate(lon);
  if (latitude === null || longitude === null) throw new Error('Expected numeric lat and lon');
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) throw new Error('Invalid coordinates');

  const places = await searchFamilyPlaces({
    location: { lat: latitude, lon: longitude, label: city || 'nearby' },
    city: city || 'nearby',
    category: category === 'all' ? undefined : category,
    age: Number(age),
    intent,
    radius: clampRadius(radiusKm),
    limit: Math.min(Number(limit) || 18, 36),
    fetchImpl: makeOverpassFetch(fetchImpl),
    useFallback: true,
  });

  const namedLivePlaces = places.filter((place) => place.source === 'osm' && !isGeneratedOsmName(place.name));
  const cityFallbackPlaces = city && city !== 'nearby'
    ? getFallbackPlaces(city, { lat: latitude, lon: longitude }, { category: category === 'all' ? undefined : category, age: Number(age), intent })
    : [];
  const curatedResult = mergeByLocationAndName(namedLivePlaces, cityFallbackPlaces);

  return (curatedResult.length >= 4 ? curatedResult : places).slice(0, Math.min(Number(limit) || 18, 36));
}

export async function handleOsmPlacesRequest(event = {}, { fetchImpl = globalThis.fetch } = {}) {
  if (event.httpMethod && event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' }, { allow: 'POST' });
  }

  try {
    const body = parseBody(event);
    const places = await searchNearbyOsmPlaces({ ...body, fetchImpl });
    return jsonResponse(200, { enabled: true, places });
  } catch (error) {
    return jsonResponse(500, { enabled: false, error: error instanceof Error ? error.message : 'OSM nearby search failed' });
  }
}
