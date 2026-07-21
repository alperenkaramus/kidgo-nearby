import test from 'node:test';
import assert from 'node:assert/strict';

import { enrichPlacesWithGoogle, handleGooglePlacesRequest } from '../server/googlePlacesProxy.mjs';
import { enrichUiPlacesWithGoogle } from '../src/lib/googlePlaces.js';

const fakeApiKey = 'unit-test-key-not-real';

const googleResponse = {
  places: [
    {
      id: 'places/google-central-park',
      displayName: { text: 'Central Park' },
      formattedAddress: 'New York, NY, USA',
      location: { latitude: 40.7829, longitude: -73.9654 },
      rating: 4.8,
      userRatingCount: 280000,
      googleMapsUri: 'https://maps.google.com/?cid=centralpark',
      businessStatus: 'OPERATIONAL',
      currentOpeningHours: { openNow: true },
    },
  ],
};

function makeGoogleFetch(assertRequest) {
  return async (url, options = {}) => {
    assert.equal(url, 'https://places.googleapis.com/v1/places:searchText');
    assert.equal(options.method, 'POST');
    assert.equal(options.headers['x-goog-api-key'], fakeApiKey);
    assert.ok(options.headers['x-goog-fieldmask'].includes('places.rating'));
    const body = JSON.parse(options.body);
    assert.match(body.textQuery, /Central Park/);
    assert.equal(body.maxResultCount, 1);
    assertRequest?.(body);
    return {
      ok: true,
      status: 200,
      async json() { return googleResponse; },
    };
  };
}

test('server proxy enriches places through Google Places without exposing the key to the client', async () => {
  const previousEnabled = process.env.GOOGLE_PLACES_ENABLED;
  process.env.GOOGLE_PLACES_ENABLED = 'true';

  const result = await enrichPlacesWithGoogle({
    apiKey: fakeApiKey,
    fetchImpl: makeGoogleFetch((body) => {
      assert.equal(body.locationBias.circle.center.latitude, 40.7829);
      assert.equal(body.locationBias.circle.radius, 850);
    }),
    places: [{ id: 'ui/1', name: 'Central Park', category: 'park', lat: 40.7829, lon: -73.9654, address: 'New York' }],
  });

  if (previousEnabled === undefined) delete process.env.GOOGLE_PLACES_ENABLED;
  else process.env.GOOGLE_PLACES_ENABLED = previousEnabled;
  assert.equal(result.enabled, true);
  assert.equal(result.places[0].id, 'ui/1');
  assert.equal(result.places[0].googleRating, 4.8);
  assert.equal(result.places[0].googleReviewCount, 280000);
  assert.equal(result.places[0].source, 'google-live');
});

test('serverless handler returns disabled response when Google Places key is missing', async () => {
  const previous = process.env.GOOGLE_PLACES_API_KEY;
  const previousEnabled = process.env.GOOGLE_PLACES_ENABLED;
  process.env.GOOGLE_PLACES_ENABLED = 'true';
  delete process.env.GOOGLE_PLACES_API_KEY;
  delete process.env.GOOGLE_MAPS_API_KEY;
  delete process.env.GOOGLE_API_KEY;

  const response = await handleGooglePlacesRequest({
    httpMethod: 'POST',
    body: JSON.stringify({ places: [{ id: 'ui/1', name: 'Central Park', lat: 40.7, lon: -73.9 }] }),
  });

  if (previous) process.env.GOOGLE_PLACES_API_KEY = previous;
  if (previousEnabled === undefined) delete process.env.GOOGLE_PLACES_ENABLED;
  else process.env.GOOGLE_PLACES_ENABLED = previousEnabled;
  assert.equal(response.statusCode, 503);
  assert.equal(JSON.parse(response.body).enabled, false);
});

test('server proxy stays off by default to prevent accidental Google Places spend', async () => {
  const previousEnabled = process.env.GOOGLE_PLACES_ENABLED;
  delete process.env.GOOGLE_PLACES_ENABLED;
  let called = false;

  const result = await enrichPlacesWithGoogle({
    apiKey: fakeApiKey,
    fetchImpl: async () => {
      called = true;
      throw new Error('should not call Google when disabled');
    },
    places: [{ id: 'ui/1', name: 'Central Park', category: 'park', lat: 40.7829, lon: -73.9654 }],
  });

  if (previousEnabled === undefined) delete process.env.GOOGLE_PLACES_ENABLED;
  else process.env.GOOGLE_PLACES_ENABLED = previousEnabled;
  assert.equal(result.enabled, false);
  assert.equal(called, false);
  assert.match(result.reason, /GOOGLE_PLACES_ENABLED/);
});

test('client merger prefers live Google rating and Maps URI when proxy responds', async () => {
  const oldFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    assert.equal(url, '/api/google-places');
    return {
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      async json() {
        return {
          enabled: true,
          places: [{ id: 'ui/1', googleRating: 4.8, googleReviewCount: 280000, googleMapsUri: 'https://maps.google.com/?cid=centralpark', openNow: true }],
        };
      },
    };
  };

  const [place] = await enrichUiPlacesWithGoogle([
    { id: 'ui/1', name: 'Central Park', category: 'park', lat: 40.7829, lon: -73.9654, address: 'New York', scoreParts: {}, evidence: [] },
  ]);
  globalThis.fetch = oldFetch;

  assert.equal(place.source, 'Live Google Places');
  assert.equal(place.googleLive, true);
  assert.equal(place.googleReviewLabel, '280k');
  assert.equal(place.openNow, true);
  assert.match(place.evidence[0], /Live Google 4.8/);
});
