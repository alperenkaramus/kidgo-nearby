import { withDistanceAndUrls } from './geo.js';
import { filterPlacesByCategory, rankPlaces } from './scoring.js';

const SEEDS = Object.freeze({
  istanbul: [
    { name: 'Gülhane Parkı', category: 'park', lat: 41.0138, lon: 28.9813, familyTags: ['stroller-friendly', 'free', 'outdoor seating'] },
    { name: 'Maçka Demokrasi Parkı Playground', category: 'playground', lat: 41.0468, lon: 28.994, familyTags: ['playground', 'free'] },
    { name: 'Rahmi M. Koç Müzesi', category: 'museum', lat: 41.0422, lon: 28.9492, familyTags: ['rainy-day', 'toilets'] },
    { name: 'İstanbul Akvaryum', category: 'aquarium', lat: 40.9642, lon: 28.7986, familyTags: ['rainy-day', 'toilets', 'stroller-friendly'] },
    { name: 'Atatürk Kitaplığı', category: 'library', lat: 41.0371, lon: 28.9873, familyTags: ['rainy-day', 'free'] },
  ],
  london: [
    { name: 'Diana Memorial Playground', category: 'playground', lat: 51.5082, lon: -0.1862, familyTags: ['playground', 'toilets', 'free'] },
    { name: 'Hyde Park', category: 'park', lat: 51.5073, lon: -0.1657, familyTags: ['stroller-friendly', 'free'] },
    { name: 'Natural History Museum', category: 'museum', lat: 51.4967, lon: -0.1764, familyTags: ['rainy-day', 'toilets', 'free'] },
    { name: 'ZSL London Zoo', category: 'zoo', lat: 51.5353, lon: -0.1534, familyTags: ['toilets', 'stroller-friendly'] },
  ],
  'new-york': [
    { name: 'Heckscher Playground', category: 'playground', lat: 40.7677, lon: -73.9787, familyTags: ['playground', 'toilets', 'free'] },
    { name: 'Central Park', category: 'park', lat: 40.7829, lon: -73.9654, familyTags: ['stroller-friendly', 'free'] },
    { name: 'American Museum of Natural History', category: 'museum', lat: 40.7813, lon: -73.9739, familyTags: ['rainy-day', 'toilets'] },
    { name: 'New York Aquarium', category: 'aquarium', lat: 40.5743, lon: -73.9757, familyTags: ['rainy-day', 'toilets'] },
  ],
});

export function normalizeCityKey(city = '') {
  return String(city).trim().toLowerCase().replace(/\s+/g, '-').replace(/^nyc$/, 'new-york');
}

export function getFallbackPlaces(city = 'istanbul', originOrFilters = {}, maybeFilters = {}) {
  const origin = originOrFilters?.lat ? originOrFilters : originOrFilters?.origin;
  const filters = originOrFilters?.lat ? maybeFilters : originOrFilters;
  const cityKey = normalizeCityKey(city);
  const seedPlaces = SEEDS[cityKey] || SEEDS.istanbul;
  const enriched = seedPlaces.map((place, index) =>
    withDistanceAndUrls(
      {
        id: `seed/${cityKey}/${index + 1}`,
        ...place,
        tags: {},
        source: 'seed',
      },
      origin,
    ),
  );
  return rankPlaces(filterPlacesByCategory(enriched, filters.category), filters);
}

export const FALLBACK_CITIES = Object.keys(SEEDS);
