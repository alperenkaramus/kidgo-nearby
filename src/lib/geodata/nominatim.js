const NOMINATIM_ENDPOINT = 'https://nominatim.openstreetmap.org/search';

export async function geocodeLocation(query, { fetchImpl = globalThis.fetch, limit = 1 } = {}) {
  if (!query || !String(query).trim()) throw new Error('query is required');
  if (typeof fetchImpl !== 'function') throw new Error('fetch is not available in this runtime');

  const params = new URLSearchParams({
    q: String(query),
    format: 'jsonv2',
    addressdetails: '1',
    limit: String(limit),
  });
  const response = await fetchImpl(`${NOMINATIM_ENDPOINT}?${params.toString()}`, {
    headers: { accept: 'application/json' },
  });
  if (!response.ok) throw new Error(`Nominatim ${response.status}: ${await response.text()}`);
  const results = await response.json();
  return results.map((result) => ({
    lat: Number(result.lat),
    lon: Number(result.lon),
    displayName: result.display_name,
    type: result.type,
    importance: result.importance,
    boundingBox: result.boundingbox?.map(Number),
  }));
}
