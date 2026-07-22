import test from 'node:test';
import assert from 'node:assert/strict';

import { searchPlaces } from '../src/lib/places.js';

test('current location uses server OSM proxy before generic fallback', async () => {
  const oldFetch = globalThis.fetch;
  const oldWindow = globalThis.window;
  globalThis.window = {};
  const calls = [];
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url, options });
    if (url === '/api/osm-places') {
      const body = JSON.parse(options.body);
      assert.equal(body.city, 'Bursa');
      assert.equal(body.lat, 40.1885);
      assert.equal(body.lon, 29.061);
      return {
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        async json() {
          return {
            enabled: true,
            places: [
              {
                id: 'node/1',
                name: 'Hüdavendigar Kent Parkı Oyun Alanı',
                category: 'playground',
                lat: 40.1923,
                lon: 29.0644,
                distanceM: 510,
                distanceKm: 0.5,
                familyTags: ['playground', 'free'],
                tags: {},
                source: 'osm',
                mapsUrl: 'https://www.google.com/maps/search/?api=1&query=40.1923%2C29.0644',
                directionsUrl: 'https://www.google.com/maps/dir/?api=1&origin=40.1885%2C29.061&destination=40.1923%2C29.0644&travelmode=walking',
                scoreParts: { familySignals: 20, intentFit: 12, distance: 20, ageFit: 6 },
                familyScore: 95,
              },
            ],
          };
        },
      };
    }
    if (url === '/api/google-places') {
      return {
        ok: false,
        status: 503,
        headers: new Headers({ 'content-type': 'application/json' }),
        async json() { return { enabled: false, places: [] }; },
      };
    }
    throw new Error(`unexpected fetch ${url}`);
  };

  try {
    const [first] = await searchPlaces({ coords: { lat: 40.1885, lon: 29.061 }, age: '4', category: 'all', radiusKm: 5 });
    assert.equal(first.name, 'Hüdavendigar Kent Parkı Oyun Alanı');
    assert.equal(first.source, 'Live OpenStreetMap');
    assert.match(first.mapsUrl, /^https:\/\/www\.google\.com\/maps\/search/);
    assert.ok(calls.some((call) => call.url === '/api/osm-places'));
  } finally {
    globalThis.fetch = oldFetch;
    if (oldWindow === undefined) delete globalThis.window;
    else globalThis.window = oldWindow;
  }
});
