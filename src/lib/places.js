import { CATEGORY_LABELS } from './geodata/categories.js';
import { searchFamilyPlaces } from './geodata/places.js';

export const DEFAULT_LANGUAGE = 'en';
export const DEFAULT_COUNTRY = 'TR';

export const LANGUAGES = [
  { id: 'en', label: 'EN', name: 'English' },
  { id: 'tr', label: 'TR', name: 'Türkçe' },
  { id: 'ru', label: 'RU', name: 'Русский' },
  { id: 'de', label: 'DE', name: 'Deutsch' },
];

export const COUNTRIES = [
  { id: 'TR', labels: { en: 'Turkey', tr: 'Türkiye', ru: 'Турция', de: 'Türkei' }, defaultCity: 'Istanbul', mode: 'turkey-81', cities: ['Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Antalya', 'Muğla', 'Eskişehir', 'Gaziantep', 'Trabzon', 'Kayseri', 'Konya', 'Mersin'] },
  { id: 'GB', labels: { en: 'United Kingdom', tr: 'Birleşik Krallık', ru: 'Великобритания', de: 'Vereinigtes Königreich' }, defaultCity: 'London', mode: 'global', cities: ['London', 'Manchester', 'Edinburgh', 'Birmingham', 'Liverpool', 'Bristol'] },
  { id: 'US', labels: { en: 'United States', tr: 'ABD', ru: 'США', de: 'USA' }, defaultCity: 'New York', mode: 'global', cities: ['New York', 'Los Angeles', 'Chicago', 'Miami', 'San Francisco', 'Orlando'] },
  { id: 'DE', labels: { en: 'Germany', tr: 'Almanya', ru: 'Германия', de: 'Deutschland' }, defaultCity: 'Berlin', mode: 'global', cities: ['Berlin', 'Munich', 'Hamburg', 'Cologne', 'Frankfurt', 'Düsseldorf'] },
  { id: 'RU', labels: { en: 'Russia', tr: 'Rusya', ru: 'Россия', de: 'Russland' }, defaultCity: 'Moscow', mode: 'global', cities: ['Moscow', 'Saint Petersburg', 'Kazan', 'Sochi', 'Yekaterinburg', 'Novosibirsk'] },
];

export const DEFAULT_CITY_BY_COUNTRY = Object.freeze(Object.fromEntries(COUNTRIES.map((item) => [item.id, item.defaultCity])));

export const CATEGORIES = [
  { id: 'all', emoji: '✨', labels: { en: 'All', tr: 'Tümü', ru: 'Все', de: 'Alle' } },
  { id: 'playground', emoji: '🛝', labels: { en: 'Playgrounds', tr: 'Oyun alanları', ru: 'Площадки', de: 'Spielplätze' } },
  { id: 'park', emoji: '🌳', labels: { en: 'Parks', tr: 'Parklar', ru: 'Парки', de: 'Parks' } },
  { id: 'museum', emoji: '🏛️', labels: { en: 'Museums', tr: 'Müzeler', ru: 'Музеи', de: 'Museen' } },
  { id: 'zoo', emoji: '🦁', labels: { en: 'Zoos', tr: 'Hayvanat bahçeleri', ru: 'Зоопарки', de: 'Zoos' } },
  { id: 'aquarium', emoji: '🐠', labels: { en: 'Aquariums', tr: 'Akvaryumlar', ru: 'Аквариумы', de: 'Aquarien' } },
  { id: 'library', emoji: '📚', labels: { en: 'Libraries', tr: 'Kütüphaneler', ru: 'Библиотеки', de: 'Bibliotheken' } },
  { id: 'family-cafe', emoji: '☕', labels: { en: 'Family cafés', tr: 'Çocuk dostu kafe', ru: 'Семейные кафе', de: 'Familiencafés' } },
  { id: 'indoor', emoji: '☔', labels: { en: 'Indoor / rainy day', tr: 'Kapalı alan', ru: 'В помещении', de: 'Drinnen' } },
];

export const AGE_GROUPS = [
  { id: '1', label: '0–2', helpers: { en: 'stroller + naps', tr: 'bebek arabası + uyku', ru: 'коляска + сон', de: 'Kinderwagen + Schlaf' } },
  { id: '4', label: '3–5', helpers: { en: 'play + discovery', tr: 'oyun + keşif', ru: 'игра + открытие', de: 'Spiel + Entdecken' } },
  { id: '7', label: '6–9', helpers: { en: 'hands-on + active', tr: 'deneyim + hareket', ru: 'активно + интересно', de: 'aktiv + praktisch' } },
  { id: '11', label: '10–12', helpers: { en: 'bigger adventures', tr: 'daha büyük macera', ru: 'больше приключений', de: 'größere Abenteuer' } },
];

export const TRENDING_TURKEY_SEARCHES = [
  { labels: { en: 'Istanbul with kids', tr: 'İstanbul çocukla gezilecek yerler', ru: 'Стамбул с детьми', de: 'Istanbul mit Kindern' }, location: 'Istanbul', category: 'all', insight: { en: 'Google Suggest: Istanbul, Asian/European side and school-break searches are strong.', tr: 'Google Suggest: İstanbul, Anadolu/Avrupa yakası ve ara tatil aramaları güçlü.', ru: 'Google Suggest: сильный спрос на Стамбул, районы и каникулы.', de: 'Google Suggest: Istanbul, Stadtseiten und Ferien-Suchen sind stark.' } },
  { labels: { en: 'Ankara with kids', tr: 'Ankara çocukla gidilecek yerler', ru: 'Анкара с детьми', de: 'Ankara mit Kindern' }, location: 'Ankara', category: 'all', insight: { en: 'Google Suggest: Ankara appears in both “places to go” and “things to do” variants.', tr: 'Google Suggest: Ankara hem “gidilecek” hem “gezilecek” varyantıyla çıkıyor.', ru: 'Анкара появляется в вариантах “куда пойти” и “что посмотреть”.', de: 'Ankara erscheint bei “hingehen” und “Sehenswürdigkeiten” Varianten.' } },
  { labels: { en: 'Izmir with kids', tr: 'İzmir çocukla gezilecek yerler', ru: 'Измир с детьми', de: 'Izmir mit Kindern' }, location: 'Izmir', category: 'all', insight: { en: 'Google Suggest: Izmir has kid-trip and breakfast venue intent.', tr: 'Google Suggest: İzmir + çocuk gezisi ve kahvaltı niyeti görünüyor.', ru: 'Измир показывает спрос на прогулки с детьми и завтраки.', de: 'Izmir zeigt Suchintention für Kinder-Ausflüge und Frühstücksorte.' } },
  { labels: { en: 'Bursa with kids', tr: 'Bursa çocukla gezilecek yerler', ru: 'Бурса с детьми', de: 'Bursa mit Kindern' }, location: 'Bursa', category: 'all', insight: { en: 'Google Suggest: Bursa appears as a city-level family outing query.', tr: 'Google Suggest: Bursa şehir bazlı çocuk gezisi taleplerinde çıkıyor.', ru: 'Бурса появляется как городской запрос для семейных прогулок.', de: 'Bursa erscheint als Stadt-Suche für Familienausflüge.' } },
  { labels: { en: 'Antalya with kids', tr: 'Antalya çocukla gezilecek yerler', ru: 'Анталья с детьми', de: 'Antalya mit Kindern' }, location: 'Antalya', category: 'all', insight: { en: 'Google Suggest: Antalya captures family trip and holiday intent.', tr: 'Google Suggest: Antalya çocukla gezi/tatil niyetinde yakalanıyor.', ru: 'Анталья ловит спрос на семейные поездки и отдых.', de: 'Antalya deckt Familienausflug- und Urlaubsintention ab.' } },
  { labels: { en: 'Kid-friendly breakfast places', tr: 'Çocuk dostu kahvaltı mekanları', ru: 'Завтраки для семей', de: 'Kinderfreundliche Frühstücksorte' }, location: 'Istanbul', category: 'family-cafe', insight: { en: 'Google Suggest: kid-friendly breakfast places show booking/paid intent.', tr: 'Google Suggest: çocuk dostu kahvaltı mekanları ayrı bir para/rezervasyon niyeti.', ru: 'Запрос про семейные завтраки — отдельное намерение бронирования.', de: 'Kinderfreundliche Frühstücksorte zeigen eigene Buchungsintention.' } },
  { labels: { en: 'Indoor / rainy day', tr: 'Kapalı alan / yağmurlu gün', ru: 'В помещении / дождь', de: 'Drinnen / Regentag' }, location: 'Istanbul', category: 'indoor', insight: { en: 'School-break and indoor searches are seasonal SEO opportunities.', tr: 'Ara tatil ve kapalı alan aramaları sezonluk SEO fırsatı.', ru: 'Каникулы и помещения — сезонная SEO-возможность.', de: 'Ferien- und Indoor-Suchen sind saisonale SEO-Chancen.' } },
];

export const TURKEY_CITIES = [
  'Adana','Adıyaman','Afyonkarahisar','Ağrı','Amasya','Ankara','Antalya','Artvin','Aydın','Balıkesir','Bilecik','Bingöl','Bitlis','Bolu','Burdur','Bursa','Çanakkale','Çankırı','Çorum','Denizli','Diyarbakır','Edirne','Elazığ','Erzincan','Erzurum','Eskişehir','Gaziantep','Giresun','Gümüşhane','Hakkari','Hatay','Isparta','Mersin','Istanbul','Izmir','Kars','Kastamonu','Kayseri','Kırklareli','Kırşehir','Kocaeli','Konya','Kütahya','Malatya','Manisa','Kahramanmaraş','Mardin','Muğla','Muş','Nevşehir','Niğde','Ordu','Rize','Sakarya','Samsun','Siirt','Sinop','Sivas','Tekirdağ','Tokat','Trabzon','Tunceli','Şanlıurfa','Uşak','Van','Yozgat','Zonguldak','Aksaray','Bayburt','Karaman','Kırıkkale','Batman','Şırnak','Bartın','Ardahan','Iğdır','Yalova','Karabük','Kilis','Osmaniye','Düzce'
];

const SUMMARY_BY_CATEGORY = {
  playground: 'High-energy play stop. Best when you need an easy win nearby.',
  park: 'Low-pressure outdoor option for walks, snacks and flexible play.',
  museum: 'Good discovery option, especially when weather or heat makes indoor time easier.',
  zoo: 'Animal-focused outing with strong kid appeal and clear structure.',
  aquarium: 'Reliable indoor animal experience for curious kids and rainy days.',
  library: 'Quiet, low-cost reset spot for reading, toilets and calmer time.',
  'family-cafe': 'Parent-friendly snack/reset option; amenities depend on local data.',
  restaurant: 'Food-first stop ranked when family signals look useful.',
  attraction: 'Kid-friendly attraction candidate; check age fit and opening hours before going.',
  indoor: 'Indoor/rainy-day candidate for backup plans.',
};

function categoryLabel(category) {
  return CATEGORY_LABELS[category] || 'Family place';
}

function prettyTags(place) {
  const tags = place.familyTags || [];
  const extras = [];
  if (place.tags?.openingHours) extras.push('hours listed');
  if (place.tags?.website) extras.push('website');
  if (place.googleRating) extras.push('google-rated');
  return [...tags, ...extras]
    .map((tag) => String(tag).replace(/-/g, ' '))
    .map((tag) => tag.charAt(0).toUpperCase() + tag.slice(1))
    .slice(0, 6);
}

function formatReviewCount(count) {
  const reviews = Number(count);
  if (!Number.isFinite(reviews) || reviews <= 0) return '';
  if (reviews >= 1000) return `${Math.round(reviews / 100) / 10}k`;
  return String(reviews);
}

function evidenceVerdict(place) {
  const parts = place.scoreParts || {};
  const lines = [];
  if (place.googleRating) lines.push(`Google ${place.googleRating} (${formatReviewCount(place.googleReviewCount)} reviews)`);
  if ((parts.familySignals || 0) >= 14) lines.push('strong family amenities');
  if ((parts.distance || 0) >= 15) lines.push('nearby enough for a low-friction trip');
  if ((parts.ageFit || 0) >= 5) lines.push('good age fit');
  if (place.familyTags?.includes('rainy-day')) lines.push('works as an indoor backup');
  return lines.slice(0, 3);
}

function confidenceLevel(place) {
  if (place.googleRating && place.googleReviewCount >= 10000) return 'high';
  if (place.googleRating || place.source === 'osm') return 'medium';
  return 'starter';
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
    tags: prettyTags(place),
    rainyDay: place.familyTags?.includes('rainy-day') || place.category === 'indoor',
    summary: SUMMARY_BY_CATEGORY[place.category] || 'Family-friendly candidate ranked from open map signals.',
    source: place.source === 'osm' ? 'Live OpenStreetMap' : (place.source === 'seed-google-rated' ? 'Curated + Google rating seed' : 'fallback seed'),
    googleRating: place.googleRating || null,
    googleReviewCount: place.googleReviewCount || null,
    googleReviewLabel: formatReviewCount(place.googleReviewCount),
    confidence: confidenceLevel(place),
    scoreParts: place.scoreParts || {},
    evidence: evidenceVerdict(place),
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

export function getGoogleSearchUrl(place) {
  const query = encodeURIComponent(`${place.name} ${place.address || ''} Google Maps`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}
