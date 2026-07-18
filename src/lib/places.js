import { CATEGORY_LABELS } from './geodata/categories.js';
import { searchFamilyPlaces } from './geodata/places.js';

export const CATEGORIES = [
  { id: 'all', label: 'All', emoji: '✨' },
  { id: 'playground', label: 'Playgrounds', emoji: '🛝' },
  { id: 'park', label: 'Parks', emoji: '🌳' },
  { id: 'museum', label: 'Museums', emoji: '🏛️' },
  { id: 'zoo', label: 'Zoos', emoji: '🦁' },
  { id: 'aquarium', label: 'Aquariums', emoji: '🐠' },
  { id: 'library', label: 'Libraries', emoji: '📚' },
  { id: 'family-cafe', label: 'Family cafes', emoji: '☕' },
  { id: 'indoor', label: 'Rainy day', emoji: '☔' },
];

export const AGE_GROUPS = [
  { id: '1', label: '0–2', helper: 'stroller + naps' },
  { id: '4', label: '3–5', helper: 'play + discovery' },
  { id: '7', label: '6–9', helper: 'hands-on' },
  { id: '11', label: '10–12', helper: 'bigger adventures' },
];

export const TRENDING_TURKEY_SEARCHES = [
  { label: 'İstanbul çocukla gezilecek yerler', location: 'Istanbul', category: 'all', insight: 'Google Suggest: İstanbul, Anadolu/Avrupa yakası ve ara tatil aramaları güçlü.' },
  { label: 'Ankara çocukla gidilecek yerler', location: 'Ankara', category: 'all', insight: 'Google Suggest: Ankara hem “gidilecek” hem “gezilecek” varyantıyla çıkıyor.' },
  { label: 'İzmir çocukla gezilecek yerler', location: 'Izmir', category: 'all', insight: 'Google Suggest: İzmir + çocuk gezisi ve kahvaltı niyeti görünüyor.' },
  { label: 'Bursa çocukla gezilecek yerler', location: 'Bursa', category: 'all', insight: 'Google Suggest: Bursa şehir bazlı çocuk gezisi taleplerinde çıkıyor.' },
  { label: 'Antalya çocukla gezilecek yerler', location: 'Antalya', category: 'all', insight: 'Google Suggest: Antalya çocukla gezi/tatil niyetinde yakalanıyor.' },
  { label: 'Çocuk dostu kahvaltı mekanları', location: 'Istanbul', category: 'family-cafe', insight: 'Google Suggest: “çocuk dostu kahvaltı mekanları” ayrı bir para/rezervasyon niyeti.' },
  { label: 'Kapalı alan / yağmurlu gün', location: 'Istanbul', category: 'indoor', insight: 'Ara tatil ve kapalı alan aramaları sezonluk SEO fırsatı.' },
];

const SUMMARY_BY_CATEGORY = {
  playground: 'High-energy play stop. Best when you need an easy win nearby.',
  park: 'Low-pressure outdoor option for walks, snacks and flexible play.',
  museum: 'Good discovery option, especially when weather or heat makes indoor time easier.',
  zoo: 'Animal-focused outing with strong kid appeal and clear structure.',
  aquarium: 'Reliable indoor animal experience for curious kids and rainy days.',
  library: 'Quiet, low-cost reset spot for reading, toilets and calmer time.',
  'family-cafe': 'Parent-friendly snack/reset option; amenities depend on local data.',
  restaurant: 'Food-first stop ranked only when family signals look useful.',
  attraction: 'Kid-friendly attraction candidate; check age fit and opening hours before going.',
  indoor: 'Indoor/rainy-day candidate for backup plans.',
};

function categoryLabel(category) {
  return CATEGORY_LABELS[category] || 'Family place';
}

function prettyTags(place) {
  const tags = place.familyTags || [];
  const extras = [];
  if (place.tags?.openingHours) extras.push('Hours listed');
  if (place.tags?.website) extras.push('Website');
  return [...tags, ...extras]
    .map((tag) => String(tag).replace(/-/g, ' '))
    .map((tag) => tag.charAt(0).toUpperCase() + tag.slice(1))
    .slice(0, 5);
}

function toUiPlace(place) {
  const score = Math.min(100, place.familyScore || place.score || 50);
  return {
    id: place.id,
    name: place.name,
    category: place.category,
    categoryLabel: categoryLabel(place.category),
    distanceKm: typeof place.distanceKm === 'number' ? place.distanceKm : null,
    distanceLabel: typeof place.distanceKm === 'number' ? `${place.distanceKm} km` : 'City pick',
    score,
    lat: place.lat,
    lon: place.lon,
    address: place.address || 'Address not confirmed',
    ageTags: [],
    tags: prettyTags(place),
    rainyDay: place.familyTags?.includes('rainy-day') || place.category === 'indoor',
    summary: SUMMARY_BY_CATEGORY[place.category] || 'Family-friendly candidate ranked from open map signals.',
    source: place.source === 'osm' ? 'Live OpenStreetMap' : 'fallback seed',
    mapsUrl: place.mapsUrl,
    directionsUrl: place.directionsUrl,
  };
}

function timeoutFetch(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3500);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timeout));
}

export async function searchPlaces({ location = 'Istanbul', coords = null, age = '4', category = 'all', radiusKm = 5 } = {}) {
  const places = await searchFamilyPlaces({
    location: coords ? { lat: coords.lat, lon: coords.lon, label: 'Current location' } : undefined,
    query: coords ? undefined : location,
    city: coords ? location : undefined,
    category: category === 'all' ? undefined : category,
    age: Number(age),
    radius: Number(radiusKm) * 1000,
    limit: 24,
    fetchImpl: timeoutFetch,
    useFallback: true,
  });

  return places.map(toUiPlace).slice(0, 12);
}

export function getMapUrl(place) {
  return `https://www.openstreetmap.org/?mlat=${place.lat}&mlon=${place.lon}#map=16/${place.lat}/${place.lon}`;
}

export function getDirectionsUrl(place) {
  return place.directionsUrl || `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}`;
}
