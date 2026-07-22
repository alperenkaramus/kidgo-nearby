import test from 'node:test';
import assert from 'node:assert/strict';

import { handleOsmPlacesRequest, searchNearbyOsmPlaces } from '../server/osmPlacesProxy.mjs';

function makeOverpassFetch(assertRequest) {
  return async (url, options = {}) => {
    assert.match(url, /^https:\/\/overpass/);
    assert.equal(options.method, 'POST');
    assert.match(options.headers['user-agent'], /KidGoNearby/);
    const body = options.body.toString();
    assert.match(body, /40\.1885/);
    assert.match(body, /29\.061/);
    assertRequest?.(body);
    return {
      ok: true,
      status: 200,
      async json() {
        return {
          elements: [
            { type: 'node', id: 0, lat: 40.1841, lon: 29.0564, tags: { leisure: 'playground' } },
            { type: 'node', id: 1, lat: 40.1923, lon: 29.0644, tags: { name: 'Hüdavendigar Kent Parkı Oyun Alanı', leisure: 'playground', fee: 'no' } },
            { type: 'node', id: 2, lat: 40.2522, lon: 29.0575, tags: { name: 'Bursa Bilim ve Teknoloji Merkezi', tourism: 'museum', toilets: 'yes' } },
          ],
        };
      },
    };
  };
}

test('OSM proxy returns real named nearby Bursa places with map coordinates', async () => {
  const places = await searchNearbyOsmPlaces({
    lat: 40.1885,
    lon: 29.061,
    city: 'Bursa',
    radiusKm: 8,
    fetchImpl: makeOverpassFetch(),
  });

  assert.ok(places.length >= 2);
  assert.equal(places[0].source, 'osm');
  assert.ok(places.some((place) => /Hüdavendigar|Bursa Bilim/i.test(place.name)));
  assert.ok(!places.slice(0, 6).some((place) => /nearby$/i.test(place.name)), 'generated unnamed OSM results should not lead Bursa current-location results');
  assert.ok(places.every((place) => place.mapsUrl?.startsWith('https://www.google.com/maps/search/')));
  assert.ok(places.every((place) => Number.isFinite(place.distanceM)));
});

test('OSM serverless handler validates coordinates and emits JSON', async () => {
  const response = await handleOsmPlacesRequest({
    httpMethod: 'POST',
    body: JSON.stringify({ lat: 40.1885, lon: 29.061, city: 'Bursa', radiusKm: 8 }),
  }, { fetchImpl: makeOverpassFetch() });

  assert.equal(response.statusCode, 200);
  const body = JSON.parse(response.body);
  assert.equal(body.enabled, true);
  assert.ok(body.places.some((place) => /Bursa|Hüdavendigar/i.test(place.name)));
});
