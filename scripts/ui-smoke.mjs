import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  COUNTRIES,
  DEFAULT_COUNTRY,
  DEFAULT_LANGUAGE,
  LANGUAGES,
  TURKEY_CITIES,
  TRENDING_TURKEY_SEARCHES,
  searchPlaces,
  getMapUrl,
  getDirectionsUrl,
  getGoogleSearchUrl,
} from '../src/lib/places.js';
import { getFallbackPlaces } from '../src/lib/geodata/index.js';

assert.equal(DEFAULT_LANGUAGE, 'en', 'app default language is English');
assert.equal(DEFAULT_COUNTRY, 'TR', 'Turkey remains the default coverage country');
assert.deepEqual(LANGUAGES.map((item) => item.id), ['en', 'tr', 'ru', 'de'], 'English default + Turkish/Russian/German switch exists');
assert.ok(LANGUAGES.every((item) => item.label && item.name), 'all languages have UI labels');
assert.equal(TURKEY_CITIES.length, 81, 'all 81 Turkish cities are available');
assert.ok(COUNTRIES.length >= 5, 'country selector has Turkey plus global options');
assert.deepEqual(COUNTRIES.map((item) => item.id), ['TR', 'GB', 'US', 'DE', 'RU'], 'country selector exposes expected countries');
assert.ok(COUNTRIES.every((item) => item.labels.en && item.labels.tr && item.labels.ru && item.labels.de && item.defaultCity), 'countries have coherent four-language labels and default cities');
assert.equal(COUNTRIES.find((item) => item.id === 'TR')?.mode, 'turkey-81', 'Turkey keeps 81-city mode');
assert.ok(TRENDING_TURKEY_SEARCHES.length >= 7, 'Turkey search radar includes researched demand chips');
assert.ok(TRENDING_TURKEY_SEARCHES.every((item) => item.labels.tr && item.labels.en && item.labels.ru && item.labels.de), 'trend chips have four-language labels');

const appSource = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8');
assert.match(appSource, /useState\(DEFAULT_LANGUAGE\)/, 'React app initializes language from English default constant');
assert.match(appSource, /<select id="country"/, 'React app renders a country selector');
assert.ok(!appSource.includes("useState('tr')"), 'React app no longer hardcodes Turkish default');

const results = await searchPlaces({
  location: 'Diyarbakır',
  age: '4',
  category: 'all',
  radiusKm: 20,
});

assert.ok(Array.isArray(results), 'searchPlaces returns an array');
assert.ok(results.length > 0, 'any Turkey city search returns live or fallback places');
assert.ok(results.every((place) => place.name && place.category && typeof place.score === 'number'), 'places include card data');
assert.ok(results.every((place) => place.scoreParts && typeof place.scoreParts.familySignals === 'number'), 'places include score breakdown for deeper analysis');
const fallbackResults = getFallbackPlaces('Diyarbakır');
assert.ok(fallbackResults.some((place) => /diyarbak/i.test(place.name.normalize('NFD').replace(/[\u0300-\u036f]/g, ''))), 'non-Istanbul Turkish city fallback is city-labeled');
assert.ok(fallbackResults.every((place) => !/istanbul/i.test(place.name.normalize('NFD').replace(/[\u0300-\u036f]/g, ''))), 'non-Istanbul fallback does not silently show Istanbul');
assert.ok(results[0].score >= results.at(-1).score, 'places are ranked by family score');
assert.match(getMapUrl(results[0]), /^https:\/\/www\.openstreetmap\.org\//, 'map link uses OSM');
assert.match(getDirectionsUrl(results[0]), /^https:\/\/www\.google\.com\/maps\/dir\//, 'directions link uses Google Maps');
assert.match(getGoogleSearchUrl(results[0]), /^https:\/\/www\.google\.com\/maps\/search\//, 'Google rating/search CTA opens Google Maps search');

const istanbulRated = await searchPlaces({ location: 'Istanbul', age: '4', category: 'all', radiusKm: 20 });
assert.ok(istanbulRated.some((place) => place.googleRating && place.googleReviewCount), 'curated major-city fallback cards include Google ratings/review counts');
assert.ok(istanbulRated.some((place) => place.evidence?.length), 'cards include recommendation rationale');

const globalResults = await searchPlaces({ location: 'Berlin', age: '7', category: 'all', radiusKm: 10 });
assert.ok(globalResults.length > 0, 'non-Turkey country city fallback/search returns places');
assert.ok(globalResults.some((place) => /berlin/i.test(place.name)), 'global country seed data is city-relevant');

console.log(`ui-smoke ok: ${results.length} Diyarbakır places, ${globalResults.length} Berlin places, ${TURKEY_CITIES.length} cities, ${LANGUAGES.length} languages, ${COUNTRIES.length} countries`);
