const EARTH_RADIUS_M = 6371008.8;

function toRadians(degrees) {
  return (Number(degrees) * Math.PI) / 180;
}

export function distanceMeters(lat1, lon1, lat2, lon2) {
  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δφ = toRadians(Number(lat2) - Number(lat1));
  const Δλ = toRadians(Number(lon2) - Number(lon1));

  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return Math.round(EARTH_RADIUS_M * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export function buildGoogleMapsUrl({ lat, lon, name }) {
  const params = new URLSearchParams({ api: '1', query: `${lat},${lon}` });
  if (name) params.set('query_place_id', name);
  return `https://www.google.com/maps/search/?${params.toString()}`;
}

export function buildDirectionsUrl({ origin, destination, travelMode = 'walking' }) {
  const params = new URLSearchParams({
    api: '1',
    origin: `${origin.lat},${origin.lon}`,
    destination: `${destination.lat},${destination.lon}`,
    travelmode: travelMode,
  });
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export function withDistanceAndUrls(place, origin) {
  const distanceM = origin ? distanceMeters(origin.lat, origin.lon, place.lat, place.lon) : undefined;
  return {
    ...place,
    distanceM,
    distanceKm: typeof distanceM === 'number' ? Number((distanceM / 1000).toFixed(1)) : undefined,
    mapsUrl: buildGoogleMapsUrl(place),
    directionsUrl: origin ? buildDirectionsUrl({ origin, destination: place }) : undefined,
  };
}
