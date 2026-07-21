const GOOGLE_ENDPOINTS = ['/api/google-places', '/.netlify/functions/google-places'];

function formatReviewCount(count) {
  const reviews = Number(count);
  if (!Number.isFinite(reviews) || reviews <= 0) return '';
  if (reviews >= 1000) return `${Math.round(reviews / 100) / 10}k`;
  return String(reviews);
}

function googleScore(rating, reviews) {
  const numericRating = Number(rating);
  const numericReviews = Number(reviews || 0);
  if (!Number.isFinite(numericRating) || numericRating <= 0) return 0;
  return Math.round(Math.max(0, (numericRating - 3.8) * 14) + Math.min(10, Math.log10(Math.max(1, numericReviews)) * 3.2));
}

function isLocalStatic404(response) {
  const contentType = response.headers.get('content-type') || '';
  return response.status === 404 || (response.ok && contentType.includes('text/html'));
}

async function postWithTimeout(url, payload, timeoutMs = 2800) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (isLocalStatic404(response)) return null;
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function mergeGooglePlace(place, googlePlace) {
  if (!googlePlace) return place;
  const next = { ...place };
  if (googlePlace.name) next.name = googlePlace.name;
  if (googlePlace.formattedAddress) next.address = googlePlace.formattedAddress;
  if (Number.isFinite(Number(googlePlace.lat))) next.lat = Number(googlePlace.lat);
  if (Number.isFinite(Number(googlePlace.lon))) next.lon = Number(googlePlace.lon);
  if (Number.isFinite(Number(googlePlace.googleRating))) next.googleRating = Number(googlePlace.googleRating);
  if (Number.isFinite(Number(googlePlace.googleReviewCount))) next.googleReviewCount = Number(googlePlace.googleReviewCount);
  next.googleReviewLabel = formatReviewCount(next.googleReviewCount);
  if (googlePlace.googleMapsUri) next.googleMapsUri = googlePlace.googleMapsUri;
  if (googlePlace.googlePlaceId) next.googlePlaceId = googlePlace.googlePlaceId;
  if (googlePlace.openNow !== null && googlePlace.openNow !== undefined) next.openNow = Boolean(googlePlace.openNow);
  if (googlePlace.priceLevel) next.priceLevel = googlePlace.priceLevel;
  next.source = 'Live Google Places';
  next.googleLive = true;
  next.confidence = Number(next.googleReviewCount || 0) >= 1000 ? 'high' : 'medium';
  next.scoreParts = { ...(next.scoreParts || {}), google: googleScore(next.googleRating, next.googleReviewCount) };
  const googleEvidence = next.googleRating ? `Live Google ${next.googleRating} (${next.googleReviewLabel || next.googleReviewCount || 0} reviews)` : null;
  next.evidence = [googleEvidence, ...(next.evidence || []).filter((item) => !/^Google\s|^Live Google/.test(item))].filter(Boolean).slice(0, 3);
  return next;
}

function shouldAttemptGooglePlaces() {
  if (typeof window === 'undefined') return true;
  return import.meta.env?.VITE_ENABLE_GOOGLE_PLACES === 'true';
}

export async function enrichUiPlacesWithGoogle(places = []) {
  if (!shouldAttemptGooglePlaces()) return places;
  const payload = {
    places: places.slice(0, 8).map((place) => ({
      id: place.id,
      name: place.name,
      address: place.address,
      category: place.category,
      lat: place.lat,
      lon: place.lon,
    })),
  };

  for (const endpoint of GOOGLE_ENDPOINTS) {
    const data = await postWithTimeout(endpoint, payload);
    if (!data?.enabled || !Array.isArray(data.places) || data.places.length === 0) continue;
    const byId = new Map(data.places.map((place) => [place.id, place]));
    return places.map((place) => mergeGooglePlace(place, byId.get(place.id)));
  }

  return places;
}
