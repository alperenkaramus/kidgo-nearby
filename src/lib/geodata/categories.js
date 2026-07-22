export const CATEGORIES = Object.freeze([
  'playground',
  'park',
  'museum',
  'art-gallery',
  'science-center',
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
  'art-gallery': 'Art gallery / arts centre',
  'science-center': 'Science centre',
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
  'art-gallery': ['["tourism"="gallery"]', '["amenity"="arts_centre"]'],
  'science-center': ['["tourism"="museum"]["museum"="science"]', '["amenity"="planetarium"]', '["amenity"="science_centre"]'],
  zoo: ['["tourism"="zoo"]'],
  aquarium: ['["tourism"="aquarium"]'],
  library: ['["amenity"="library"]'],
  'family-cafe': ['["amenity"="cafe"]["kids_area"="yes"]', '["amenity"="cafe"]["playground"="yes"]', '["amenity"="cafe"]["highchair"="yes"]', '["amenity"="ice_cream"]'],
  restaurant: ['["amenity"="restaurant"]["kids_area"="yes"]', '["amenity"="restaurant"]["playground"="yes"]', '["amenity"="restaurant"]["highchair"="yes"]', '["amenity"="food_court"]'],
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
