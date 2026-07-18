import assert from 'node:assert/strict';
import { searchPlaces, getMapUrl, getDirectionsUrl } from '../src/lib/places.js';

const results = await searchPlaces({
  location: 'Istanbul',
  age: '3-5',
  category: 'parks',
  radiusKm: 5,
});

assert.ok(Array.isArray(results), 'searchPlaces returns an array');
assert.ok(results.length > 0, 'fallback search returns places');
assert.ok(results.every((place) => place.name && place.category && typeof place.score === 'number'), 'places include card data');
assert.ok(results[0].score >= results.at(-1).score, 'places are ranked by family score');
assert.match(getMapUrl(results[0]), /^https:\/\/www\.openstreetmap\.org\//, 'map link uses OSM');
assert.match(getDirectionsUrl(results[0]), /^https:\/\/www\.google\.com\/maps\/dir\//, 'directions link uses Google Maps');

console.log(`ui-smoke ok: ${results.length} places`);
