import { normalizeCategory } from './categories.js';

const CATEGORY_BASE = Object.freeze({
  playground: 38,
  park: 32,
  museum: 30,
  zoo: 35,
  aquarium: 35,
  library: 28,
  'family-cafe': 24,
  restaurant: 18,
  attraction: 24,
  indoor: 26,
});

const TAG_WEIGHTS = Object.freeze({
  playground: 9,
  'rainy-day': 8,
  toilets: 7,
  'changing table': 8,
  'stroller-friendly': 7,
  free: 5,
  'kids area': 9,
  'high chairs': 5,
  'outdoor seating': 3,
  'treat stop': 2,
});

const INTENT_WEIGHTS = Object.freeze({
  quick: { playground: 8, park: 7, 'family-cafe': 6, library: 4 },
  rainy: { museum: 8, aquarium: 9, library: 7, indoor: 10, 'family-cafe': 5 },
  free: { park: 8, playground: 8, library: 8, museum: 3 },
  learning: { museum: 10, aquarium: 7, zoo: 7, library: 8, attraction: 5 },
  active: { playground: 10, park: 8, zoo: 5, attraction: 6 },
  foodBreak: { 'family-cafe': 10, restaurant: 8, park: 3 },
});

function distanceScore(distanceM = 5000) {
  if (distanceM <= 300) return 25;
  if (distanceM <= 800) return 20;
  if (distanceM <= 1500) return 15;
  if (distanceM <= 3000) return 9;
  if (distanceM <= 6000) return 4;
  return 0;
}

export function ratingScore(place = {}) {
  const rating = Number(place.googleRating ?? place.rating);
  const reviews = Number(place.googleReviewCount ?? place.reviewCount ?? 0);
  if (!Number.isFinite(rating) || rating <= 0) return 0;
  const ratingBoost = Math.max(0, (rating - 3.8) * 14);
  const reviewTrust = Math.min(10, Math.log10(Math.max(1, reviews)) * 3.2);
  return Math.round(ratingBoost + reviewTrust);
}

export function evidenceBreakdown(place = {}, filters = {}) {
  const wantedCategory = normalizeCategory(filters.category);
  return {
    category: CATEGORY_BASE[place.category] ?? 15,
    categoryMatch: wantedCategory && wantedCategory === place.category ? 25 : 0,
    familySignals: (place.familyTags || []).reduce((sum, tag) => sum + (TAG_WEIGHTS[tag] || 1), 0),
    distance: distanceScore(place.distanceM),
    ageFit: ageScore(place, filters.age),
    intentFit: intentScore(place, filters.intent),
    google: ratingScore(place),
  };
}

function ageScore(place, age) {
  if (!Number.isFinite(Number(age))) return 0;
  const years = Number(age);
  if (place.category === 'playground' && years <= 10) return 8;
  if (['zoo', 'aquarium', 'park'].includes(place.category) && years <= 12) return 6;
  if (['museum', 'library', 'indoor'].includes(place.category) && years >= 4) return 5;
  if (['family-cafe', 'restaurant'].includes(place.category) && years <= 8) return 4;
  return 1;
}

function intentScore(place = {}, intent) {
  if (!intent || !INTENT_WEIGHTS[intent]) return 0;
  const categoryBoost = INTENT_WEIGHTS[intent][place.category] || 0;
  const tags = place.familyTags || [];
  const tagBoost = [
    intent === 'rainy' && tags.includes('rainy-day') ? 6 : 0,
    intent === 'free' && tags.includes('free') ? 6 : 0,
    intent === 'active' && tags.includes('playground') ? 5 : 0,
    intent === 'quick' && Number(place.distanceM) <= 1500 ? 4 : 0,
    intent === 'foodBreak' && (tags.includes('high chairs') || tags.includes('outdoor seating')) ? 4 : 0,
  ].reduce((sum, value) => sum + value, 0);
  return categoryBoost + tagBoost;
}

export function scorePlace(place, filters = {}) {
  const parts = evidenceBreakdown(place, filters);
  const score = Object.values(parts).reduce((sum, value) => sum + value, 0);
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function rankPlaces(places = [], filters = {}) {
  return places
    .map((place) => ({ ...place, scoreParts: evidenceBreakdown(place, filters), familyScore: scorePlace(place, filters) }))
    .sort((a, b) =>
      b.familyScore - a.familyScore
      || (b.googleRating ?? 0) - (a.googleRating ?? 0)
      || (b.googleReviewCount ?? 0) - (a.googleReviewCount ?? 0)
      || (a.distanceM ?? Infinity) - (b.distanceM ?? Infinity)
      || a.name.localeCompare(b.name)
    );
}

export function filterPlacesByCategory(places = [], category) {
  const wantedCategory = normalizeCategory(category);
  if (!wantedCategory) return places;
  return places.filter((place) => place.category === wantedCategory || (wantedCategory === 'indoor' && place.familyTags?.includes('rainy-day')));
}
