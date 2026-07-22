const OSM_ENDPOINTS = ['/api/osm-places'];

function shouldAttemptNearbyOsm() {
  if (typeof window === 'undefined') return false;
  return true;
}

export async function fetchNearbyOsmPlaces({ coords, city = 'nearby', age = '4', intent = 'quick', category = 'all', radiusKm = 5 } = {}) {
  if (!shouldAttemptNearbyOsm()) return [];
  if (!coords?.lat || !coords?.lon) return [];

  const payload = {
    lat: coords.lat,
    lon: coords.lon,
    city,
    age,
    intent,
    category,
    radiusKm,
    limit: 18,
  };

  for (const endpoint of OSM_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) continue;
      const data = await response.json();
      const places = Array.isArray(data.places) ? data.places : [];
      if (places.length) return places;
    } catch {
      // Serverless OSM proxy is best-effort. Caller keeps a local fallback.
    }
  }

  return [];
}
