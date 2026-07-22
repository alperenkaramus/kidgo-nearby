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

test('OSM proxy geocodes a selected city and returns a richer named set without GPS', async () => {
  const fetchImpl = async (url, options = {}) => {
    if (String(url).startsWith('https://nominatim.openstreetmap.org/search')) {
      assert.match(String(url), /q=Berlin/);
      return { ok: true, async json() { return [{ lat: '52.5200', lon: '13.4050', display_name: 'Berlin, Deutschland' }]; } };
    }
    assert.match(String(url), /^https:\/\/overpass/);
    assert.equal(options.method, 'POST');
    return {
      ok: true,
      async json() {
        return { elements: Array.from({ length: 9 }, (_, index) => ({
          type: 'node', id: 100 + index, lat: 52.52 + index * 0.001, lon: 13.405 + index * 0.001,
          tags: index % 3 === 0
            ? { name: `Berlin Playground ${index}`, leisure: 'playground' }
            : index % 3 === 1
              ? { name: `Berlin Art Space ${index}`, tourism: 'gallery' }
              : { name: `Berlin Family Cafe ${index}`, amenity: 'cafe', highchair: 'yes' },
        })) };
      },
    };
  };

  const places = await searchNearbyOsmPlaces({ city: 'Berlin', limit: 30, fetchImpl });
  assert.ok(places.length >= 9);
  assert.ok(places.some((place) => place.category === 'art-gallery'));
  assert.ok(places.some((place) => place.category === 'family-cafe'));
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
