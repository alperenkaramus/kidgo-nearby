const GOOGLE_PLACES_TEXT_SEARCH_URL = 'https://places.googleapis.com/v1/places:searchText';
const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.location',
  'places.rating',
  'places.userRatingCount',
  'places.googleMapsUri',
  'places.businessStatus',
  'places.priceLevel',
  'places.currentOpeningHours.openNow',
].join(',');

const CATEGORY_HINTS = Object.freeze({
  playground: 'playground',
  park: 'park',
  museum: 'museum',
  zoo: 'zoo',
  aquarium: 'aquarium',
  library: 'library',
  'family-cafe': 'family cafe',
  restaurant: 'family restaurant',
  attraction: 'family attraction',
  indoor: 'indoor family attraction',
});

function getGooglePlacesKey() {
  return process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_API_KEY || '';
}

function isGooglePlacesEnabled() {
  return process.env.GOOGLE_PLACES_ENABLED === 'true';
}

function jsonResponse(statusCode, body, headers = {}) {
  return {
    statusCode,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=900, stale-while-revalidate=86400',
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

function makeTextQuery(place = {}) {
  const name = String(place.name || '').trim();
  const address = String(place.address || '').trim();
  const hint = CATEGORY_HINTS[place.category] || 'family place';
  return [name, address, hint].filter(Boolean).join(' ');
}

function toLocationBias(place = {}) {
  const lat = Number(place.lat);
  const lon = Number(place.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return undefined;
  return {
    circle: {
      center: { latitude: lat, longitude: lon },
      radius: 850,
    },
  };
}

function normalizeGooglePlace(result = {}, fallback = {}) {
  const location = result.location || {};
  return {
    id: fallback.id,
    name: result.displayName?.text || fallback.name,
    formattedAddress: result.formattedAddress || fallback.address || '',
    lat: Number.isFinite(Number(location.latitude)) ? Number(location.latitude) : fallback.lat,
    lon: Number.isFinite(Number(location.longitude)) ? Number(location.longitude) : fallback.lon,
    googlePlaceId: result.id || null,
    googleRating: Number.isFinite(Number(result.rating)) ? Number(result.rating) : null,
    googleReviewCount: Number.isFinite(Number(result.userRatingCount)) ? Number(result.userRatingCount) : null,
    googleMapsUri: result.googleMapsUri || null,
    businessStatus: result.businessStatus || null,
    priceLevel: result.priceLevel || null,
    openNow: typeof result.currentOpeningHours?.openNow === 'boolean' ? result.currentOpeningHours.openNow : null,
    source: 'google-live',
  };
}

async function searchOnePlace(place, apiKey, fetchImpl) {
  const textQuery = makeTextQuery(place);
  if (!textQuery) return null;

  const response = await fetchImpl(GOOGLE_PLACES_TEXT_SEARCH_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-goog-api-key': apiKey,
      'x-goog-fieldmask': FIELD_MASK,
    },
    body: JSON.stringify({
      textQuery,
      maxResultCount: 1,
      locationBias: toLocationBias(place),
      languageCode: 'en',
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`Google Places API ${response.status}: ${detail.slice(0, 240)}`);
  }

  const data = await response.json();
  const [first] = Array.isArray(data.places) ? data.places : [];
  return first ? normalizeGooglePlace(first, place) : null;
}

export async function enrichPlacesWithGoogle({ places = [], fetchImpl = globalThis.fetch, apiKey = getGooglePlacesKey() } = {}) {
  if (!isGooglePlacesEnabled()) return { enabled: false, places: [], reason: 'GOOGLE_PLACES_ENABLED is not true' };
  if (!apiKey) return { enabled: false, places: [], reason: 'missing GOOGLE_PLACES_API_KEY' };
  const candidates = places
    .filter((place) => place?.name && Number.isFinite(Number(place.lat)) && Number.isFinite(Number(place.lon)))
    .slice(0, 8);

  const settled = await Promise.allSettled(candidates.map((place) => searchOnePlace(place, apiKey, fetchImpl)));
  const enriched = settled
    .map((result) => (result.status === 'fulfilled' ? result.value : null))
    .filter(Boolean)
    .filter((place) => place.googleRating || place.googleMapsUri);

  return { enabled: true, places: enriched };
}

export async function handleGooglePlacesRequest(event = {}, { fetchImpl = globalThis.fetch } = {}) {
  if (event.httpMethod && event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' }, { allow: 'POST' });
  }

  try {
    const body = parseBody(event);
    const places = Array.isArray(body.places) ? body.places : [];
    if (!places.length) return jsonResponse(400, { error: 'Expected { places: [...] }' });
    const result = await enrichPlacesWithGoogle({ places, fetchImpl });
    return jsonResponse(result.enabled ? 200 : 503, result);
  } catch (error) {
    return jsonResponse(500, { error: error instanceof Error ? error.message : 'Google Places enrichment failed' });
  }
}
