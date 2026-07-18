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
  berlin: [
    { name: 'FEZ-Berlin', category: 'attraction', lat: 52.458, lon: 13.542, familyTags: ['rainy-day', 'toilets'] },
    { name: 'Tierpark Berlin', category: 'zoo', lat: 52.5005, lon: 13.5325, familyTags: ['stroller-friendly', 'toilets'] },
    { name: 'Deutsches Technikmuseum', category: 'museum', lat: 52.4986, lon: 13.3777, familyTags: ['rainy-day', 'toilets'] },
    { name: 'Volkspark Friedrichshain', category: 'park', lat: 52.5281, lon: 13.4316, familyTags: ['playground', 'free'] },
  ],
  moscow: [
    { name: 'Moscow Zoo', category: 'zoo', lat: 55.7616, lon: 37.578, familyTags: ['toilets', 'stroller-friendly'] },
    { name: 'Gorky Park', category: 'park', lat: 55.7298, lon: 37.601, familyTags: ['free', 'stroller-friendly'] },
    { name: 'Darwin Museum', category: 'museum', lat: 55.6908, lon: 37.5626, familyTags: ['rainy-day', 'toilets'] },
    { name: 'KidZania Moscow', category: 'indoor', lat: 55.7518, lon: 37.5352, familyTags: ['rainy-day', 'toilets'] },
  ],
  kapadokya: [
    { name: 'Göreme Açık Hava Müzesi', category: 'museum', lat: 38.6401, lon: 34.8454, familyTags: ['toilets'] },
    { name: 'Paşabağları', category: 'attraction', lat: 38.6786, lon: 34.8532, familyTags: ['outdoor seating'] },
    { name: 'Zelve Açık Hava Müzesi', category: 'museum', lat: 38.6716, lon: 34.8636, familyTags: ['toilets'] },
    { name: 'Avanos Kızılırmak Kenarı', category: 'park', lat: 38.715, lon: 34.8469, familyTags: ['free', 'stroller-friendly'] },
  ],
});

const GOOGLE_RATINGS = Object.freeze({
  'Gülhane Parkı': { googleRating: 4.7, googleReviewCount: 61500 },
  'Maçka Demokrasi Parkı Playground': { googleRating: 4.5, googleReviewCount: 2100 },
  'Rahmi M. Koç Müzesi': { googleRating: 4.8, googleReviewCount: 26000 },
  'İstanbul Akvaryum': { googleRating: 4.4, googleReviewCount: 37000 },
  'Atatürk Kitaplığı': { googleRating: 4.6, googleReviewCount: 1900 },
  'Diana Memorial Playground': { googleRating: 4.7, googleReviewCount: 7400 },
  'Hyde Park': { googleRating: 4.7, googleReviewCount: 134000 },
  'Natural History Museum': { googleRating: 4.7, googleReviewCount: 29000 },
  'ZSL London Zoo': { googleRating: 4.3, googleReviewCount: 31000 },
  'Heckscher Playground': { googleRating: 4.7, googleReviewCount: 1200 },
  'Central Park': { googleRating: 4.8, googleReviewCount: 280000 },
  'American Museum of Natural History': { googleRating: 4.6, googleReviewCount: 22000 },
  'New York Aquarium': { googleRating: 4.1, googleReviewCount: 18000 },
  'Anıtkabir ve Barış Parkı': { googleRating: 4.9, googleReviewCount: 126000 },
  'MTA Şehit Cuma Dağ Tabiat Tarihi Müzesi': { googleRating: 4.7, googleReviewCount: 6100 },
  'Eymir Gölü': { googleRating: 4.5, googleReviewCount: 16800 },
  'Harikalar Diyarı': { googleRating: 4.2, googleReviewCount: 19000 },
  'İzmir Doğal Yaşam Parkı': { googleRating: 4.5, googleReviewCount: 23000 },
  'Kültürpark': { googleRating: 4.4, googleReviewCount: 27000 },
  'Key Museum': { googleRating: 4.8, googleReviewCount: 5800 },
  'Sasalı Kent Ormanı': { googleRating: 4.4, googleReviewCount: 2500 },
  'Bursa Hayvanat Bahçesi': { googleRating: 4.4, googleReviewCount: 16000 },
  'Hüdavendigar Kent Parkı': { googleRating: 4.5, googleReviewCount: 12200 },
  'Bursa Bilim ve Teknoloji Merkezi': { googleRating: 4.6, googleReviewCount: 5400 },
  'Botanik Park': { googleRating: 4.4, googleReviewCount: 10300 },
  'Antalya Aquarium': { googleRating: 4.2, googleReviewCount: 31000 },
  'Karaalioğlu Parkı': { googleRating: 4.6, googleReviewCount: 21000 },
  'Aktur Park': { googleRating: 4.3, googleReviewCount: 7700 },
  'Oyuncak Müzesi': { googleRating: 4.4, googleReviewCount: 1700 },
  'FEZ-Berlin': { googleRating: 4.4, googleReviewCount: 5300 },
  'Tierpark Berlin': { googleRating: 4.6, googleReviewCount: 35000 },
  'Deutsches Technikmuseum': { googleRating: 4.6, googleReviewCount: 25000 },
  'Volkspark Friedrichshain': { googleRating: 4.5, googleReviewCount: 17000 },
  'Moscow Zoo': { googleRating: 4.7, googleReviewCount: 89000 },
  'Gorky Park': { googleRating: 4.7, googleReviewCount: 108000 },
  'Darwin Museum': { googleRating: 4.7, googleReviewCount: 7700 },
  'KidZania Moscow': { googleRating: 4.4, googleReviewCount: 9500 },
  'Göreme Açık Hava Müzesi': { googleRating: 4.7, googleReviewCount: 19000 },
  'Paşabağları': { googleRating: 4.7, googleReviewCount: 22000 },
  'Zelve Açık Hava Müzesi': { googleRating: 4.7, googleReviewCount: 10000 },
  'Avanos Kızılırmak Kenarı': { googleRating: 4.5, googleReviewCount: 2200 },
});

function attachGoogleRating(place) {
  return { ...place, ...(GOOGLE_RATINGS[place.name] || {}) };
}

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
  const enriched = seedPlaces.map((rawPlace, index) => {
    const place = attachGoogleRating(rawPlace);
    return withDistanceAndUrls(
      {
        id: `seed/${cityKey}/${index + 1}`,
        ...place,
        tags: {},
        source: SEEDS[cityKey] ? 'seed-google-rated' : 'generic-city-seed',
      },
      origin,
    );
  });
  return rankPlaces(filterPlacesByCategory(enriched, filters.category), filters);
}

export const FALLBACK_CITIES = Object.keys(SEEDS);
