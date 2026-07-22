import test from 'node:test';
import assert from 'node:assert/strict';

import {
  CATEGORIES,
  buildGoogleMapsUrl,
  buildDirectionsUrl,
  distanceMeters,
  fallbackCityForCoords,
  getFallbackPlaces,
  normalizeOsmElement,
  rankPlaces,
  searchFamilyPlaces,
} from '../src/lib/geodata/index.js';

test('distanceMeters computes realistic straight-line distance', () => {
  const meters = distanceMeters(41.0082, 28.9784, 41.0138, 28.9497);
  assert.ok(meters > 2400 && meters < 2600, `expected ~2.5km, got ${meters}`);
});

test('map URL helpers create browser-friendly links', () => {
  assert.equal(
    buildGoogleMapsUrl({ lat: 41.0082, lon: 28.9784, name: 'Sultanahmet Parkı' }),
    'https://www.google.com/maps/search/?api=1&query=41.0082%2C28.9784&query_place_id=Sultanahmet+Park%C4%B1',
  );
  assert.equal(
    buildDirectionsUrl({ origin: { lat: 41, lon: 29 }, destination: { lat: 41.1, lon: 29.1 } }),
    'https://www.google.com/maps/dir/?api=1&origin=41%2C29&destination=41.1%2C29.1&travelmode=walking',
  );
});

test('normalizeOsmElement categorizes and enriches OSM tags', () => {
  const place = normalizeOsmElement(
    {
      type: 'node',
      id: 123,
      lat: 41.01,
      lon: 28.98,
      tags: {
        name: 'Happy Kids Cafe',
        amenity: 'cafe',
        cuisine: 'ice_cream',
        changing_table: 'yes',
        indoor: 'yes',
        opening_hours: 'Mo-Su 10:00-20:00',
      },
    },
    { origin: { lat: 41.0082, lon: 28.9784 } },
  );

  assert.equal(place.id, 'node/123');
  assert.equal(place.category, 'family-cafe');
  assert.ok(place.distanceM > 0);
  assert.ok(place.familyTags.includes('changing table'));
  assert.ok(place.familyTags.includes('rainy-day'));
  assert.equal(place.mapsUrl.startsWith('https://www.google.com/maps/search/'), true);
});

test('rankPlaces prefers close places with family tags and category match', () => {
  const ranked = rankPlaces(
    [
      { id: 'far', name: 'Far Museum', category: 'museum', distanceM: 3000, familyTags: ['rainy-day'], tags: {} },
      { id: 'near', name: 'Near Playground', category: 'playground', distanceM: 400, familyTags: ['playground', 'stroller-friendly', 'toilets'], tags: {} },
    ],
    { category: 'playground', age: 4 },
  );

  assert.equal(ranked[0].id, 'near');
  assert.ok(ranked[0].familyScore > ranked[1].familyScore);
});

test('rankPlaces uses activity mood intent as a real recommendation signal', () => {
  const rainyRanked = rankPlaces(
    [
      { id: 'outdoor', name: 'Sunny Park', category: 'park', distanceM: 350, familyTags: ['free', 'stroller-friendly'], tags: {} },
      { id: 'indoor', name: 'Indoor Museum', category: 'museum', distanceM: 1800, familyTags: ['rainy-day', 'toilets'], tags: {} },
    ],
    { intent: 'rainy', age: 4 },
  );
  assert.equal(rainyRanked[0].id, 'indoor');
  assert.ok(rainyRanked[0].scoreParts.intentFit > rainyRanked[1].scoreParts.intentFit);

  const activeRanked = rankPlaces(rainyRanked, { intent: 'active', age: 4 });
  assert.equal(activeRanked[0].id, 'outdoor');
});

test('fallback data covers required demo cities and categories', () => {
  assert.ok(CATEGORIES.includes('indoor'));
  assert.ok(CATEGORIES.includes('attraction'));
  assert.ok(CATEGORIES.includes('art-gallery'));
  assert.ok(CATEGORIES.includes('science-center'));
  const generic = getFallbackPlaces('Lisbon');
  assert.ok(generic.length >= 12);
  assert.ok(generic.some((place) => place.category === 'art-gallery'));
  assert.ok(generic.some((place) => place.category === 'science-center'));
  for (const city of ['istanbul', 'london', 'new-york']) {
    const places = getFallbackPlaces(city, { lat: 41.0082, lon: 28.9784 });
    assert.ok(places.length >= 3, `${city} should have seed places`);
    assert.ok(places.every((place) => place.mapsUrl && Number.isFinite(place.distanceM)));
  }
});

test('current coordinates select the nearest credible curated city instead of a translated display label', async () => {
  const bursaCoords = { lat: 40.1885, lon: 29.0610 };
  assert.equal(fallbackCityForCoords(bursaCoords), 'bursa');

  const places = await searchFamilyPlaces({
    location: { ...bursaCoords, label: 'Mevcut konum' },
    city: 'Mevcut konum',
    age: 4,
    fetchImpl: async () => { throw new Error('offline'); },
  });

  assert.ok(places.length >= 4);
  assert.ok(places.some((place) => /bursa|hüdavendigar|botanik|bilim/i.test(place.name)));
  assert.ok(places.every((place) => Number.isFinite(place.distanceM)));
  assert.ok(places.every((place) => place.directionsUrl?.includes('origin=40.1885%2C29.061')));
});

test('searchFamilyPlaces falls back to local seed data when fetch fails', async () => {
  const places = await searchFamilyPlaces({
    location: { lat: 41.0082, lon: 28.9784 },
    city: 'istanbul',
    category: 'park',
    fetchImpl: async () => {
      throw new Error('network unavailable');
    },
  });

  assert.ok(places.length > 0);
  assert.equal(places[0].source, 'seed-google-rated');
  assert.ok(places[0].googleRating > 0);
  assert.ok(places[0].scoreParts.google > 0);
  assert.ok(places[0].familyScore >= places.at(-1).familyScore);
});
