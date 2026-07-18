import assert from 'node:assert/strict';
import { LANGUAGES, TURKEY_CITIES, TRENDING_TURKEY_SEARCHES, searchPlaces, getMapUrl, getDirectionsUrl } from '../src/lib/places.js';

assert.deepEqual(LANGUAGES.map((item) => item.id), ['tr', 'en', 'ru', 'de'], 'Turkish + English/Russian/German language switch exists');
assert.equal(TURKEY_CITIES.length, 81, 'all 81 Turkish cities are available');
assert.ok(TRENDING_TURKEY_SEARCHES.length >= 7, 'Turkey search radar includes researched demand chips');
assert.ok(TRENDING_TURKEY_SEARCHES.every((item) => item.labels.tr && item.labels.en && item.labels.ru && item.labels.de), 'trend chips have four-language labels');

const results = await searchPlaces({
  location: 'Diyarbakır',
  age: '4',
  category: 'all',
  radiusKm: 20,
});

assert.ok(Array.isArray(results), 'searchPlaces returns an array');
assert.ok(results.length > 0, 'any Turkey city search returns live or fallback places');
assert.ok(results.every((place) => place.name && place.category && typeof place.score === 'number'), 'places include card data');
assert.ok(results[0].score >= results.at(-1).score, 'places are ranked by family score');
assert.match(getMapUrl(results[0]), /^https:\/\/www\.openstreetmap\.org\//, 'map link uses OSM');
assert.match(getDirectionsUrl(results[0]), /^https:\/\/www\.google\.com\/maps\/dir\//, 'directions link uses Google Maps');

console.log(`ui-smoke ok: ${results.length} places, ${TURKEY_CITIES.length} cities, ${LANGUAGES.length} languages`);
