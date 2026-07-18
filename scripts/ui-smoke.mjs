import assert from 'node:assert/strict';
import { TRENDING_TURKEY_SEARCHES, searchPlaces, getMapUrl, getDirectionsUrl } from '../src/lib/places.js';

assert.ok(TRENDING_TURKEY_SEARCHES.length >= 7, 'Turkey search radar includes researched demand chips');
assert.ok(TRENDING_TURKEY_SEARCHES.some((item) => item.label.includes('İstanbul')), 'Istanbul demand chip exists');
assert.ok(TRENDING_TURKEY_SEARCHES.some((item) => item.label.includes('Ankara')), 'Ankara demand chip exists');

const results = await searchPlaces({
  location: 'Ankara',
  age: '4',
  category: 'all',
  radiusKm: 20,
});

assert.ok(Array.isArray(results), 'searchPlaces returns an array');
assert.ok(results.length > 0, 'Turkey fallback/live search returns places');
assert.ok(results.every((place) => place.name && place.category && typeof place.score === 'number'), 'places include card data');
assert.ok(results[0].score >= results.at(-1).score, 'places are ranked by family score');
assert.match(getMapUrl(results[0]), /^https:\/\/www\.openstreetmap\.org\//, 'map link uses OSM');
assert.match(getDirectionsUrl(results[0]), /^https:\/\/www\.google\.com\/maps\/dir\//, 'directions link uses Google Maps');

console.log(`ui-smoke ok: ${results.length} places, ${TRENDING_TURKEY_SEARCHES.length} Turkey radar chips`);
