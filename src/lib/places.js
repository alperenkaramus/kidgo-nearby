import { CATEGORY_LABELS } from './geodata/categories.js';
import { distanceMeters } from './geodata/geo.js';
import { searchFamilyPlaces } from './geodata/places.js';
import { enrichUiPlacesWithGoogle } from './googlePlaces.js';
import { fetchNearbyOsmPlaces } from './nearbyOsm.js';

export const DEFAULT_LANGUAGE = 'tr';
export const DEFAULT_COUNTRY = 'TR';

export function resolveInitialSearchSelection(search = '') {
  const params = new URLSearchParams(search);
  const requestedLanguage = params.get('lang');
  const language = ['en', 'tr', 'ru', 'de'].includes(requestedLanguage) ? requestedLanguage : DEFAULT_LANGUAGE;
  const requestedCity = params.get('city')?.trim();
  const matchedCountry = requestedCity
    ? COUNTRIES.find((item) => item.cities.some((city) => city.toLocaleLowerCase('en') === requestedCity.toLocaleLowerCase('en')))
    : null;
  const country = matchedCountry || COUNTRIES.find((item) => item.id === DEFAULT_COUNTRY) || COUNTRIES[0];
  const city = matchedCountry
    ? matchedCountry.cities.find((item) => item.toLocaleLowerCase('en') === requestedCity.toLocaleLowerCase('en'))
    : country.defaultCity;
  return { language, country: country.id, city };
}

export const LANGUAGES = [
  { id: 'en', label: 'EN', name: 'English' },
  { id: 'tr', label: 'TR', name: 'Türkçe' },
  { id: 'ru', label: 'RU', name: 'Русский' },
  { id: 'de', label: 'DE', name: 'Deutsch' },
];

export const COUNTRIES = [
  { id: 'US', labels: { en: 'United States', tr: 'ABD', ru: 'США', de: 'USA' }, defaultCity: 'New York', mode: 'global', cities: ['New York', 'Los Angeles', 'Chicago', 'Miami', 'San Francisco', 'Orlando', 'Boston', 'Washington DC', 'Seattle', 'Austin'] },
  { id: 'GB', labels: { en: 'United Kingdom', tr: 'Birleşik Krallık', ru: 'Великобритания', de: 'Vereinigtes Königreich' }, defaultCity: 'London', mode: 'global', cities: ['London', 'Manchester', 'Edinburgh', 'Birmingham', 'Liverpool', 'Bristol', 'Cambridge', 'Oxford'] },
  { id: 'DE', labels: { en: 'Germany', tr: 'Almanya', ru: 'Германия', de: 'Deutschland' }, defaultCity: 'Berlin', mode: 'global', cities: ['Berlin', 'Munich', 'Hamburg', 'Cologne', 'Frankfurt', 'Düsseldorf', 'Stuttgart', 'Nuremberg'] },
  { id: 'FR', labels: { en: 'France', tr: 'Fransa', ru: 'Франция', de: 'Frankreich' }, defaultCity: 'Paris', mode: 'global', cities: ['Paris', 'Lyon', 'Nice', 'Marseille', 'Bordeaux', 'Toulouse', 'Strasbourg', 'Lille'] },
  { id: 'IT', labels: { en: 'Italy', tr: 'İtalya', ru: 'Италия', de: 'Italien' }, defaultCity: 'Rome', mode: 'global', cities: ['Rome', 'Milan', 'Florence', 'Venice', 'Naples', 'Bologna', 'Turin', 'Verona'] },
  { id: 'ES', labels: { en: 'Spain', tr: 'İspanya', ru: 'Испания', de: 'Spanien' }, defaultCity: 'Barcelona', mode: 'global', cities: ['Barcelona', 'Madrid', 'Valencia', 'Seville', 'Malaga', 'Palma', 'Bilbao', 'Granada'] },
  { id: 'NL', labels: { en: 'Netherlands', tr: 'Hollanda', ru: 'Нидерланды', de: 'Niederlande' }, defaultCity: 'Amsterdam', mode: 'global', cities: ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven', 'Haarlem'] },
  { id: 'AE', labels: { en: 'United Arab Emirates', tr: 'BAE', ru: 'ОАЭ', de: 'VAE' }, defaultCity: 'Dubai', mode: 'global', cities: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ras Al Khaimah'] },
  { id: 'JP', labels: { en: 'Japan', tr: 'Japonya', ru: 'Япония', de: 'Japan' }, defaultCity: 'Tokyo', mode: 'global', cities: ['Tokyo', 'Osaka', 'Kyoto', 'Yokohama', 'Fukuoka', 'Sapporo'] },
  { id: 'SG', labels: { en: 'Singapore', tr: 'Singapur', ru: 'Сингапур', de: 'Singapur' }, defaultCity: 'Singapore', mode: 'global', cities: ['Singapore'] },
  { id: 'TR', labels: { en: 'Turkey', tr: 'Türkiye', ru: 'Турция', de: 'Türkei' }, defaultCity: 'Istanbul', mode: 'turkey-81', cities: ['Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Antalya', 'Muğla', 'Eskişehir', 'Gaziantep', 'Trabzon', 'Kayseri', 'Konya', 'Mersin'] },
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
  { id: 'attraction', emoji: '🎡', labels: { en: 'Attractions', tr: 'Aktiviteler', ru: 'Аттракционы', de: 'Attraktionen' } },
  { id: 'restaurant', emoji: '🍽️', labels: { en: 'Food stops', tr: 'Yemek molası', ru: 'Еда', de: 'Essensstopps' } },
  { id: 'indoor', emoji: '☔', labels: { en: 'Indoor / rainy day', tr: 'Kapalı alan', ru: 'В помещении', de: 'Drinnen' } },
];

export const AGE_GROUPS = [
  { id: '1', label: '0–2', helpers: { en: 'stroller + naps', tr: 'bebek arabası + uyku', ru: 'коляска + сон', de: 'Kinderwagen + Schlaf' } },
  { id: '4', label: '3–5', helpers: { en: 'play + discovery', tr: 'oyun + keşif', ru: 'игра + открытие', de: 'Spiel + Entdecken' } },
  { id: '7', label: '6–9', helpers: { en: 'hands-on + active', tr: 'deneyim + hareket', ru: 'активно + интересно', de: 'aktiv + praktisch' } },
  { id: '11', label: '10–12', helpers: { en: 'bigger adventures', tr: 'daha büyük macera', ru: 'больше приключений', de: 'größere Abenteuer' } },
];

export const INTENTS = [
  { id: 'quick', emoji: '⚡', labels: { en: 'Quick win', tr: 'Hızlı çözüm', ru: 'Быстро', de: 'Schnell' }, helpers: { en: 'near + low friction', tr: 'yakın + zahmetsiz', ru: 'рядом + просто', de: 'nah + einfach' } },
  { id: 'rainy', emoji: '☔', labels: { en: 'Rainy / hot day', tr: 'Yağmur / sıcak', ru: 'Дождь / жара', de: 'Regen / Hitze' }, helpers: { en: 'indoor backup', tr: 'kapalı alan yedeği', ru: 'в помещении', de: 'Indoor-Plan' } },
  { id: 'free', emoji: '₺0', labels: { en: 'Free / cheap', tr: 'Ücretsiz / ucuz', ru: 'Бесплатно', de: 'Kostenlos' }, helpers: { en: 'parks + libraries', tr: 'park + kütüphane', ru: 'парки + библиотеки', de: 'Parks + Bibliotheken' } },
  { id: 'learning', emoji: '🧠', labels: { en: 'Learn something', tr: 'Bir şey öğrensin', ru: 'Учиться', de: 'Lernen' }, helpers: { en: 'museum + science', tr: 'müze + bilim', ru: 'музей + наука', de: 'Museum + Wissen' } },
  { id: 'active', emoji: '🏃', labels: { en: 'Burn energy', tr: 'Enerji atsın', ru: 'Активно', de: 'Austoben' }, helpers: { en: 'play + outdoor', tr: 'oyun + açık alan', ru: 'игра + улица', de: 'Spiel + draußen' } },
  { id: 'foodBreak', emoji: '☕', labels: { en: 'Snack break', tr: 'Mola / atıştırma', ru: 'Перекус', de: 'Snackpause' }, helpers: { en: 'parent reset', tr: 'ebeveyn reseti', ru: 'пауза родителям', de: 'Elternpause' } },
];

export const TRENDING_TURKEY_SEARCHES = [
  { labels: { en: 'New York with kids', tr: 'New York çocukla', ru: 'Нью-Йорк с детьми', de: 'New York mit Kindern' }, location: 'New York', category: 'all', insight: { en: 'Global city mode: mix iconic attractions, parks and indoor backups for family trips.', tr: 'Global şehir modu: aile gezisi için ikon yerler, parklar ve kapalı alanları karıştır.', ru: 'Глобальный режим: достопримечательности, парки и запасные крытые варианты.', de: 'Globaler Stadtmodus: Highlights, Parks und Indoor-Backups kombinieren.' } },
  { labels: { en: 'London rainy-day plan', tr: 'Londra yağmur planı', ru: 'Лондон в дождь', de: 'London Regentag' }, location: 'London', category: 'indoor', insight: { en: 'London is ideal for museum-heavy, rainy-day family planning.', tr: 'Londra müze ağırlıklı yağmurlu gün aile planı için güçlü.', ru: 'Лондон силён для музейных семейных планов в дождь.', de: 'London eignet sich stark für Museums- und Regentagspläne.' } },
  { labels: { en: 'Paris family culture', tr: 'Paris aile kültür turu', ru: 'Париж семейная культура', de: 'Paris Familienkultur' }, location: 'Paris', category: 'museum', insight: { en: 'Paris demand is culture-first; mix big museums with parks and snack breaks.', tr: 'Paris kültür odaklı; müze, park ve mola seçeneklerini karıştır.', ru: 'Париж культурный: музеи, парки и паузы.', de: 'Paris ist kulturstark: Museen, Parks und Pausen mixen.' } },
  { labels: { en: 'Barcelona outdoor day', tr: 'Barcelona açık hava', ru: 'Барселона на улице', de: 'Barcelona draußen' }, location: 'Barcelona', category: 'park', insight: { en: 'Barcelona works well for outdoor, beach-adjacent and architecture discovery days.', tr: 'Barcelona açık hava, sahil yakını ve mimari keşif için iyi.', ru: 'Барселона хороша для улицы, моря и архитектуры.', de: 'Barcelona passt zu Outdoor, Küste und Architektur.' } },
  { labels: { en: 'Dubai heat-proof options', tr: 'Dubai sıcak havaya uygun', ru: 'Дубай в жару', de: 'Dubai hitzesicher' }, location: 'Dubai', category: 'indoor', insight: { en: 'Dubai needs heat-proof indoor, aquarium and mall-based family options.', tr: 'Dubai için sıcak havaya dayanıklı indoor, akvaryum ve AVM temelli seçenekler gerekir.', ru: 'Дубай требует крытых вариантов из-за жары.', de: 'Dubai braucht hitzesichere Indoor-Optionen.' } },
  { labels: { en: 'Tokyo discovery day', tr: 'Tokyo keşif günü', ru: 'Токио день открытий', de: 'Tokyo Entdeckungstag' }, location: 'Tokyo', category: 'all', insight: { en: 'Tokyo benefits from compact transit-friendly clusters and themed discoveries.', tr: 'Tokyo toplu taşımaya uygun kompakt kümeler ve temalı keşiflerle güçlü.', ru: 'Токио силён компактными маршрутами и темами.', de: 'Tokyo funktioniert mit kompakten, transitnahen Clustern.' } },
  { labels: { en: 'Singapore easy family day', tr: 'Singapur kolay aile günü', ru: 'Сингапур семейный день', de: 'Singapur einfacher Familientag' }, location: 'Singapore', category: 'all', insight: { en: 'Singapore is a strong benchmark for clean, safe, stroller-friendly family routing.', tr: 'Singapur temiz, güvenli, bebek arabası dostu rota için güçlü benchmark.', ru: 'Сингапур — эталон безопасного семейного маршрута.', de: 'Singapur ist ein starker Benchmark für saubere, sichere Familienrouten.' } },
  { labels: { en: 'Istanbul with kids', tr: 'İstanbul çocukla', ru: 'Стамбул с детьми', de: 'Istanbul mit Kindern' }, location: 'Istanbul', category: 'all', insight: { en: 'Turkey remains covered, but the product now leads with international city advice.', tr: 'Türkiye kapsamı duruyor; ürün artık yurtdışı şehir danışmanı olarak öne çıkıyor.', ru: 'Турция остаётся, но фокус теперь международный.', de: 'Türkei bleibt abgedeckt, Fokus ist international.' } },
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
  if ((parts.intentFit || 0) >= 10) lines.push('matches today’s activity mood');
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
    distanceLabel: typeof place.distanceKm === 'number' ? `${place.distanceKm} km` : '',
    score,
    lat: place.lat,
    lon: place.lon,
    address: place.address || '',
    tags: prettyTags(place),
    rainyDay: place.familyTags?.includes('rainy-day') || place.category === 'indoor',
    summary: SUMMARY_BY_CATEGORY[place.category] || 'Family-friendly candidate ranked from open map signals.',
    source: place.source === 'google-live' ? 'Live Google Places' : (place.source === 'osm' ? 'Live OpenStreetMap' : (place.source === 'seed-google-rated' ? 'Curated + Google rating seed' : 'fallback seed')),
    googleRating: place.googleRating || null,
    googleReviewCount: place.googleReviewCount || null,
    googleReviewLabel: formatReviewCount(place.googleReviewCount),
    googleMapsUri: place.googleMapsUri || null,
    googlePlaceId: place.googlePlaceId || null,
    googleLive: place.source === 'google-live' || Boolean(place.googleLive),
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

const CURRENT_LOCATION_FALLBACK_CITIES = Object.freeze([
  { city: 'Bursa', lat: 40.1885, lon: 29.0610 },
  { city: 'Istanbul', lat: 41.0082, lon: 28.9784 },
  { city: 'Ankara', lat: 39.9334, lon: 32.8597 },
  { city: 'Izmir', lat: 38.4237, lon: 27.1428 },
  { city: 'Antalya', lat: 36.8969, lon: 30.7133 },
  { city: 'London', lat: 51.5072, lon: -0.1276 },
  { city: 'New York', lat: 40.7128, lon: -74.0060 },
  { city: 'Paris', lat: 48.8566, lon: 2.3522 },
  { city: 'Berlin', lat: 52.52, lon: 13.405 },
  { city: 'Dubai', lat: 25.2048, lon: 55.2708 },
]);

export function nearestSupportedCityForCoords(coords) {
  if (!coords?.lat || !coords?.lon) return 'nearby';
  const nearest = CURRENT_LOCATION_FALLBACK_CITIES
    .map((item) => ({ ...item, distanceM: distanceMeters(coords.lat, coords.lon, item.lat, item.lon) }))
    .sort((a, b) => a.distanceM - b.distanceM)[0];
  return nearest && nearest.distanceM <= 50000 ? nearest.city : 'nearby';
}

export async function searchPlaces({ location = 'Istanbul', coords = null, age = '4', category = 'all', radiusKm = 5, intent = 'quick' } = {}) {
  const fallbackCity = coords ? nearestSupportedCityForCoords(coords) : location;
  const liveNearbyPlaces = coords ? await fetchNearbyOsmPlaces({ coords, city: fallbackCity, age, intent, category, radiusKm }) : [];
  const places = liveNearbyPlaces.length ? liveNearbyPlaces : await searchFamilyPlaces({
    location: coords ? { lat: coords.lat, lon: coords.lon, label: 'Current location' } : undefined,
    query: coords ? undefined : location,
    city: coords ? fallbackCity : undefined,
    category: category === 'all' ? undefined : category,
    age: Number(age),
    intent,
    radius: Number(radiusKm) * 1000,
    limit: 36,
    fetchImpl: timeoutFetch,
    useFallback: true,
  });

  const uiPlaces = places.map(toUiPlace).slice(0, 18);
  return enrichUiPlacesWithGoogle(uiPlaces);
}

export function getMapUrl(place) {
  return `https://www.openstreetmap.org/?mlat=${place.lat}&mlon=${place.lon}#map=16/${place.lat}/${place.lon}`;
}

export function getDirectionsUrl(place) {
  return place.directionsUrl || `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}`;
}

export function getGoogleSearchUrl(place) {
  if (place.googleMapsUri) return place.googleMapsUri;
  const query = encodeURIComponent(`${place.name} ${place.address || ''} Google Maps`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}
