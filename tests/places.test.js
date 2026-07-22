import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  CATEGORIES,
  COUNTRIES,
  DEFAULT_COUNTRY,
  DEFAULT_LANGUAGE,
  INTENTS,
  LANGUAGES,
  resolveInitialSearchSelection,
  searchPlaces,
} from '../src/lib/places.js';

const localeIds = LANGUAGES.map((language) => language.id);

describe('places library', () => {
  it('uses the intended Turkish launch defaults', () => {
    assert.equal(DEFAULT_LANGUAGE, 'tr');
    assert.equal(DEFAULT_COUNTRY, 'TR');
  });

  it('opens localized SEO landing-page CTAs with the requested city and language', () => {
    assert.deepEqual(resolveInitialSearchSelection('?city=London&lang=ru'), { language: 'ru', country: 'GB', city: 'London' });
    assert.deepEqual(resolveInitialSearchSelection('?city=munich&lang=de'), { language: 'de', country: 'DE', city: 'Munich' });
    assert.deepEqual(resolveInitialSearchSelection('?city=unknown&lang=xx'), { language: 'tr', country: 'TR', city: 'Istanbul' });
  });

  it('provides complete EN/TR/RU/DE labels for countries, categories and intents', () => {
    assert.deepEqual(localeIds, ['en', 'tr', 'ru', 'de']);
    for (const item of [...COUNTRIES, ...CATEGORIES, ...INTENTS]) {
      for (const locale of localeIds) {
        assert.equal(typeof item.labels?.[locale], 'string', `${item.id} lacks ${locale}`);
        assert.ok(item.labels[locale].trim().length > 0, `${item.id} has an empty ${locale} label`);
      }
    }
  });

  it('contains the default city inside every country city list', () => {
    for (const country of COUNTRIES) {
      assert.ok(country.cities.includes(country.defaultCity), `${country.id} lacks default city ${country.defaultCity}`);
    }
  });

  it('returns deterministic city fallback results without paid API flags', async () => {
    const results = await searchPlaces({
      location: 'Istanbul',
      coords: null,
      age: '4',
      category: 'park',
      radiusKm: 5,
      intent: 'quick',
    });
    assert.ok(results.length > 0);
    assert.ok(results.every((place) => place.category === 'park'));
    assert.ok(results.every((place) => typeof place.name === 'string' && place.name.length > 0));
  });

  it('applies category, age and radius inputs to real fallback results', async () => {
    const museumResults = await searchPlaces({
      location: 'London',
      age: '7',
      category: 'museum',
      radiusKm: 10,
      intent: 'learning',
    });
    assert.ok(museumResults.length > 0);
    assert.ok(museumResults.every((place) => place.category === 'museum'));
    assert.ok(museumResults.every((place) => Number.isFinite(place.score)));
  });
});
