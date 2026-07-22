import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  COUNTRIES,
  DEFAULT_COUNTRY,
  DEFAULT_LANGUAGE,
  INTENTS,
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
assert.equal(DEFAULT_COUNTRY, 'US', 'default country is abroad-first/global');
assert.deepEqual(LANGUAGES.map((item) => item.id), ['en', 'tr', 'ru', 'de'], 'English default + Turkish/Russian/German switch exists');
assert.deepEqual(INTENTS.map((item) => item.id), ['quick', 'rainy', 'free', 'learning', 'active', 'foodBreak'], 'activity mood selector covers practical parent contexts');
assert.ok(INTENTS.every((item) => item.labels.en && item.labels.tr && item.helpers.en && item.helpers.tr), 'activity moods have translated labels and helper copy');
assert.ok(LANGUAGES.every((item) => item.label && item.name), 'all languages have UI labels');
assert.equal(TURKEY_CITIES.length, 81, 'all 81 Turkish cities are available');
assert.ok(COUNTRIES.length >= 10, 'country selector has broad abroad-first coverage plus Turkey');
assert.deepEqual(COUNTRIES.map((item) => item.id), ['US', 'GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'AE', 'JP', 'SG', 'TR', 'RU'], 'country selector exposes abroad-first countries before Turkey');
assert.ok(COUNTRIES.every((item) => item.labels.en && item.labels.tr && item.labels.ru && item.labels.de && item.defaultCity), 'countries have coherent four-language labels and default cities');
assert.equal(COUNTRIES.find((item) => item.id === 'TR')?.mode, 'turkey-81', 'Turkey keeps 81-city mode');
assert.ok(TRENDING_TURKEY_SEARCHES.length >= 8, 'global city radar includes international demand chips');
assert.ok(TRENDING_TURKEY_SEARCHES.every((item) => item.labels.tr && item.labels.en && item.labels.ru && item.labels.de), 'global trend chips have four-language labels');

const appSource = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8');
const placesSource = await readFile(new URL('../src/lib/places.js', import.meta.url), 'utf8');
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
assert.ok(results.every((place) => typeof place.scoreParts.intentFit === 'number'), 'places include activity mood fit in score breakdown');
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

const globalResults = await searchPlaces({ location: 'Paris', age: '7', category: 'all', radiusKm: 10 });
assert.ok(globalResults.length >= 5, 'international seed cities return more than a thin 3-card demo');
assert.ok(globalResults.some((place) => /paris|luxembourg|sciences|acclimatation/i.test(place.name)), 'global country seed data is city-relevant');

const genericGlobal = getFallbackPlaces('Lisbon');
assert.ok(genericGlobal.length >= 8, 'generic abroad fallback produces a richer option set');
assert.ok(genericGlobal.every((place) => /lisbon/i.test(place.name)), 'generic global fallback is city-labeled');

const currentLocationFallback = getFallbackPlaces('nearby', { lat: 41.0082, lon: 28.9784 });
assert.ok(currentLocationFallback.length >= 8, 'current-location fallback produces nearby cards around browser coordinates');
assert.ok(currentLocationFallback.every((place) => /nearby/i.test(place.name)), 'current-location fallback uses nearby labels, not the literal Current location field value');
assert.ok(currentLocationFallback.every((place) => Number.isFinite(place.distanceM) && place.distanceM < 2500), 'current-location fallback cards are close to provided coordinates');
assert.match(placesSource, /city: coords \? 'nearby' : undefined/, 'browser geolocation searches use a stable nearby fallback key instead of localized Current location text');
assert.match(appSource, /noticeGeoReady/, 'browser geolocation success has a clear ready notice instead of staying on permission-waiting copy');

console.log(`ui-smoke ok: ${results.length} Diyarbakır places, ${globalResults.length} Paris places, ${genericGlobal.length} Lisbon fallback places, ${currentLocationFallback.length} current-location fallback places, ${TURKEY_CITIES.length} TR cities, ${LANGUAGES.length} languages, ${COUNTRIES.length} countries`);
