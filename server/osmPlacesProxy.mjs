import { getFallbackPlaces } from '../src/lib/geodata/seedData.js';
import { searchFamilyPlaces } from '../src/lib/geodata/places.js';
import { geocodeLocation } from '../src/lib/geodata/nominatim.js';
import { applyCityGuideSignals, fetchCityGuide } from './cityGuide.mjs';
import { fetchWikipediaFamilyPlaces } from './wikipediaNearby.mjs';

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

function makeOverpassFetch(fetchImpl, timeoutMs = 6000) {
  return async (url, options = {}) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
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

export async function searchNearbyOsmPlaces({ lat, lon, city = 'nearby', category = 'all', age = '4', intent = 'quick', radiusKm = 5, limit = 30, fetchImpl = globalThis.fetch } = {}) {
  const latitude = parseCoordinate(lat);
  const longitude = parseCoordinate(lon);
  const hasCoordinates = latitude !== null && longitude !== null;
  if (!hasCoordinates && (!city || city === 'nearby')) throw new Error('Expected coordinates or a city');
  if (hasCoordinates && (Math.abs(latitude) > 90 || Math.abs(longitude) > 180)) throw new Error('Invalid coordinates');

  let origin = hasCoordinates ? { lat: latitude, lon: longitude, label: city || 'nearby' } : undefined;
  const requestedRadius = clampRadius(radiusKm);
  const overpassTimeoutMs = !hasCoordinates && category === 'all' ? 2500 : 6000;
  const safeFetch = makeOverpassFetch(fetchImpl, overpassTimeoutMs);
  if (!origin) {
    const [geocoded] = await geocodeLocation(city, { fetchImpl: safeFetch });
    if (!geocoded) throw new Error(`Could not geocode city: ${city}`);
    origin = { lat: geocoded.lat, lon: geocoded.lon, label: geocoded.displayName || city };
  }
  const filters = { category: category === 'all' ? undefined : category, age: Number(age), intent };
  const guidePromise = fetchCityGuide(city, { fetchImpl });
  const wikipediaPromise = fetchWikipediaFamilyPlaces({ city, origin, radiusM: Math.max(requestedRadius, 10000), fetchImpl, filters });
  const places = await searchFamilyPlaces({
    location: origin,
    city: city || 'nearby',
    category: filters.category,
    age: filters.age,
    intent,
    radius: hasCoordinates ? requestedRadius : Math.max(requestedRadius, 10000),
    limit: Math.min(Number(limit) || 30, 36),
    fetchImpl: safeFetch,
    useFallback: true,
  });

  const namedLivePlaces = places.filter((place) => place.source === 'osm' && !isGeneratedOsmName(place.name));
  const [guideListings, wikipediaPlaces] = await Promise.all([guidePromise, wikipediaPromise]);
  const cityFallbackPlaces = city && city !== 'nearby'
    ? getFallbackPlaces(city, origin, filters)
    : [];
  const sourcedResult = mergeByLocationAndName(namedLivePlaces, wikipediaPlaces);
  const curatedResult = mergeByLocationAndName(sourcedResult, cityFallbackPlaces);
  const maxResults = Math.min(Number(limit) || 30, 36);
  const selectedPlaces = (curatedResult.length >= 4 ? curatedResult : places).slice(0, maxResults);

  return applyCityGuideSignals(selectedPlaces, guideListings);
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
