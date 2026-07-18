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
  ankara: [
    { name: 'Anıtkabir ve Barış Parkı', category: 'attraction', lat: 39.925, lon: 32.8369, familyTags: ['free', 'stroller-friendly'] },
    { name: 'MTA Şehit Cuma Dağ Tabiat Tarihi Müzesi', category: 'museum', lat: 39.8997, lon: 32.7739, familyTags: ['rainy-day', 'toilets'] },
    { name: 'Eymir Gölü', category: 'park', lat: 39.8124, lon: 32.8284, familyTags: ['stroller-friendly', 'free'] },
    { name: 'Harikalar Diyarı', category: 'park', lat: 39.9837, lon: 32.6182, familyTags: ['playground', 'free', 'toilets'] },
  ],
  izmir: [
    { name: 'İzmir Doğal Yaşam Parkı', category: 'zoo', lat: 38.4948, lon: 26.9424, familyTags: ['toilets', 'stroller-friendly'] },
    { name: 'Kültürpark', category: 'park', lat: 38.4326, lon: 27.1454, familyTags: ['free', 'stroller-friendly'] },
    { name: 'Key Museum', category: 'museum', lat: 38.2038, lon: 27.323, familyTags: ['rainy-day', 'toilets'] },
    { name: 'Sasalı Kent Ormanı', category: 'park', lat: 38.4979, lon: 26.9579, familyTags: ['free', 'outdoor seating'] },
  ],
  bursa: [
    { name: 'Bursa Hayvanat Bahçesi', category: 'zoo', lat: 40.2114, lon: 29.0342, familyTags: ['toilets', 'stroller-friendly'] },
    { name: 'Hüdavendigar Kent Parkı', category: 'park', lat: 40.2051, lon: 28.9992, familyTags: ['playground', 'free'] },
    { name: 'Bursa Bilim ve Teknoloji Merkezi', category: 'museum', lat: 40.2522, lon: 29.0575, familyTags: ['rainy-day', 'toilets'] },
    { name: 'Botanik Park', category: 'park', lat: 40.2085, lon: 29.0362, familyTags: ['stroller-friendly', 'free'] },
  ],
  antalya: [
    { name: 'Antalya Aquarium', category: 'aquarium', lat: 36.8791, lon: 30.6588, familyTags: ['rainy-day', 'toilets', 'stroller-friendly'] },
    { name: 'Karaalioğlu Parkı', category: 'park', lat: 36.8808, lon: 30.7085, familyTags: ['free', 'stroller-friendly'] },
    { name: 'Aktur Park', category: 'attraction', lat: 36.8846, lon: 30.6636, familyTags: ['toilets'] },
    { name: 'Oyuncak Müzesi', category: 'museum', lat: 36.8841, lon: 30.7041, familyTags: ['rainy-day'] },
  ],
  kapadokya: [
    { name: 'Göreme Açık Hava Müzesi', category: 'museum', lat: 38.6401, lon: 34.8454, familyTags: ['toilets'] },
    { name: 'Paşabağları', category: 'attraction', lat: 38.6786, lon: 34.8532, familyTags: ['outdoor seating'] },
    { name: 'Zelve Açık Hava Müzesi', category: 'museum', lat: 38.6716, lon: 34.8636, familyTags: ['toilets'] },
    { name: 'Avanos Kızılırmak Kenarı', category: 'park', lat: 38.715, lon: 34.8469, familyTags: ['free', 'stroller-friendly'] },
  ],
});

function titleCaseCity(city = 'City') {
  return String(city).replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function genericPlaces(cityKey, origin) {
  const base = origin || { lat: 39.0, lon: 35.0 };
  const city = titleCaseCity(cityKey);
  return [
    { name: `${city} çocuk dostu park`, category: 'park', lat: base.lat + 0.006, lon: base.lon + 0.006, familyTags: ['free', 'stroller-friendly'] },
    { name: `${city} oyun alanı`, category: 'playground', lat: base.lat - 0.005, lon: base.lon + 0.004, familyTags: ['playground', 'free'] },
    { name: `${city} müze / kapalı alan`, category: 'museum', lat: base.lat + 0.004, lon: base.lon - 0.006, familyTags: ['rainy-day', 'toilets'] },
    { name: `${city} çocuk dostu kafe`, category: 'family-cafe', lat: base.lat - 0.004, lon: base.lon - 0.004, familyTags: ['rainy-day', 'high chairs'] },
  ];
}

export function normalizeCityKey(city = '') {
  return String(city)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'i')
    .replace(/\s+/g, '-')
    .replace(/^nyc$/, 'new-york')
    .replace(/^cappadocia$/, 'kapadokya');
}

export function getFallbackPlaces(city = 'istanbul', originOrFilters = {}, maybeFilters = {}) {
  const origin = originOrFilters?.lat ? originOrFilters : originOrFilters?.origin;
  const filters = originOrFilters?.lat ? maybeFilters : originOrFilters;
  const cityKey = normalizeCityKey(city);
  const seedPlaces = SEEDS[cityKey] || genericPlaces(cityKey, origin);
  const enriched = seedPlaces.map((place, index) =>
    withDistanceAndUrls(
      {
        id: `seed/${cityKey}/${index + 1}`,
        ...place,
        tags: {},
        source: SEEDS[cityKey] ? 'seed' : 'generic-city-seed',
      },
      origin,
    ),
  );
  return rankPlaces(filterPlacesByCategory(enriched, filters.category), filters);
}

export const FALLBACK_CITIES = Object.keys(SEEDS);
