import { CATEGORIES, searchFamilyPlaces } from '../src/lib/geodata/index.js';

const places = await searchFamilyPlaces({
  location: { lat: 41.0082, lon: 28.9784 },
  city: 'istanbul',
  category: 'park',
  limit: 3,
  fetchImpl: async () => {
    throw new Error('smoke test intentionally uses fallback seed data');
  },
});

if (!places.length) {
  throw new Error('Expected fallback places from Istanbul seed data');
}

console.log(JSON.stringify({
  categories: CATEGORIES.length,
  first: {
    name: places[0].name,
    category: places[0].category,
    distanceM: places[0].distanceM,
    familyScore: places[0].familyScore,
    source: places[0].source,
  },
}, null, 2));
