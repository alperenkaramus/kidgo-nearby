export const CATEGORIES = Object.freeze([
  'playground',
  'park',
  'museum',
  'zoo',
  'aquarium',
  'library',
  'family-cafe',
  'restaurant',
  'attraction',
  'indoor',
]);

export const CATEGORY_LABELS = Object.freeze({
  playground: 'Playground',
  park: 'Park',
  museum: 'Museum',
  zoo: 'Zoo',
  aquarium: 'Aquarium',
  library: 'Library',
  'family-cafe': 'Family cafe',
  restaurant: 'Family restaurant',
  attraction: 'Kid-friendly attraction',
  indoor: 'Indoor / rainy-day',
});

export const CATEGORY_OVERPASS_FILTERS = Object.freeze({
  playground: ['["leisure"="playground"]'],
  park: ['["leisure"="park"]', '["leisure"="garden"]'],
  museum: ['["tourism"="museum"]'],
  zoo: ['["tourism"="zoo"]'],
  aquarium: ['["tourism"="aquarium"]'],
  library: ['["amenity"="library"]'],
  'family-cafe': ['["amenity"="cafe"]', '["amenity"="ice_cream"]'],
  restaurant: ['["amenity"="restaurant"]', '["amenity"="fast_food"]', '["amenity"="food_court"]'],
  attraction: ['["tourism"="attraction"]', '["tourism"="theme_park"]', '["leisure"="water_park"]'],
  indoor: ['["tourism"="museum"]', '["amenity"="library"]', '["amenity"="cinema"]', '["leisure"="sports_centre"]'],
});

export function normalizeCategory(category) {
  if (!category) return undefined;
  const normalized = String(category).trim().toLowerCase().replace(/_/g, '-');
  if (normalized === 'cafe' || normalized === 'family cafe') return 'family-cafe';
  if (normalized === 'rainy-day' || normalized === 'rainy' || normalized === 'inside') return 'indoor';
  return CATEGORIES.includes(normalized) ? normalized : undefined;
}
