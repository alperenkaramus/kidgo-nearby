import { normalizeCategory } from './categories.js';
import { withDistanceAndUrls } from './geo.js';

const CATEGORY_FRIENDLY_NAME = Object.freeze({
  playground: 'Playground',
  park: 'Park',
  museum: 'Museum',
  'art-gallery': 'Art gallery',
  'science-center': 'Science centre',
  zoo: 'Zoo',
  aquarium: 'Aquarium',
  library: 'Library',
  'family-cafe': 'Family cafe',
  restaurant: 'Family restaurant',
  attraction: 'Kid-friendly attraction',
  indoor: 'Indoor place',
});

function center(element) {
  if (Number.isFinite(element.lat) && Number.isFinite(element.lon)) return { lat: element.lat, lon: element.lon };
  if (element.center) return { lat: element.center.lat, lon: element.center.lon };
  if (element.bounds) {
    return {
      lat: (Number(element.bounds.minlat) + Number(element.bounds.maxlat)) / 2,
      lon: (Number(element.bounds.minlon) + Number(element.bounds.maxlon)) / 2,
    };
  }
  return undefined;
}

export function inferCategory(tags = {}) {
  if (tags.leisure === 'playground') return 'playground';
  if (tags.leisure === 'park' || tags.leisure === 'garden') return 'park';
  if (tags.tourism === 'gallery' || tags.amenity === 'arts_centre') return 'art-gallery';
  if ((tags.tourism === 'museum' && ['science', 'technology', 'children'].includes(tags.museum)) || ['planetarium', 'science_centre'].includes(tags.amenity)) return 'science-center';
  if (tags.tourism === 'museum') return 'museum';
  if (tags.tourism === 'zoo') return 'zoo';
  if (tags.tourism === 'aquarium') return 'aquarium';
  if (tags.amenity === 'library') return 'library';
  if (tags.amenity === 'cafe' || tags.amenity === 'ice_cream') return 'family-cafe';
  if (['restaurant', 'fast_food', 'food_court'].includes(tags.amenity)) return 'restaurant';
  if (['attraction', 'theme_park'].includes(tags.tourism) || tags.leisure === 'water_park') return 'attraction';
  if (tags.indoor === 'yes' || tags.covered === 'yes' || tags.amenity === 'cinema') return 'indoor';
  return normalizeCategory(tags.category) || 'attraction';
}

export function familyTagsFromOsm(tags = {}, category) {
  const familyTags = new Set();
  if (category === 'playground') familyTags.add('playground');
  if (['museum', 'art-gallery', 'science-center', 'library', 'aquarium', 'indoor', 'family-cafe'].includes(category)) familyTags.add('rainy-day');
  if (['art-gallery', 'science-center'].includes(category)) familyTags.add('learning');
  if (tags.changing_table === 'yes') familyTags.add('changing table');
  if (tags.toilets === 'yes' || tags.amenity === 'toilets') familyTags.add('toilets');
  if (tags.wheelchair === 'yes' || tags.stroller === 'yes') familyTags.add('stroller-friendly');
  if (tags.fee === 'no') familyTags.add('free');
  if (tags.outdoor_seating === 'yes') familyTags.add('outdoor seating');
  if (tags.indoor === 'yes' || tags.covered === 'yes') familyTags.add('rainy-day');
  if (tags['kids_area'] === 'yes' || tags.playground === 'yes') familyTags.add('kids area');
  if (tags.highchair === 'yes') familyTags.add('high chairs');
  if (tags.cuisine === 'ice_cream') familyTags.add('treat stop');
  return [...familyTags];
}

function compactAddress(tags = {}) {
  return [tags['addr:housenumber'], tags['addr:street'], tags['addr:suburb'] || tags['addr:city']]
    .filter(Boolean)
    .join(' ');
}

export function normalizeOsmElement(element, { origin } = {}) {
  const tags = element.tags || {};
  const point = center(element);
  if (!point) return undefined;
  const category = inferCategory(tags);
  const name = tags.name || tags['name:en'] || tags.brand || `${CATEGORY_FRIENDLY_NAME[category] || 'Family place'} nearby`;

  return withDistanceAndUrls(
    {
      id: `${element.type}/${element.id}`,
      osmType: element.type,
      osmId: element.id,
      name,
      category,
      lat: Number(point.lat),
      lon: Number(point.lon),
      address: compactAddress(tags),
      familyTags: familyTagsFromOsm(tags, category),
      tags: {
        openingHours: tags.opening_hours,
        website: tags.website || tags['contact:website'],
        phone: tags.phone || tags['contact:phone'],
        cuisine: tags.cuisine,
        wheelchair: tags.wheelchair,
      },
      source: 'osm',
    },
    origin,
  );
}

export function normalizeOsmElements(elements = [], options = {}) {
  const seen = new Set();
  return elements
    .map((element) => normalizeOsmElement(element, options))
    .filter(Boolean)
    .filter((place) => {
      const key = `${place.name}|${place.lat.toFixed(5)}|${place.lon.toFixed(5)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}
