import { CATEGORY_LABELS } from './geodata/categories.js';
import { searchFamilyPlaces } from './geodata/places.js';

export const LANGUAGES = [
  { id: 'tr', label: 'TR', name: 'Türkçe' },
  { id: 'en', label: 'EN', name: 'English' },
  { id: 'ru', label: 'RU', name: 'Русский' },
  { id: 'de', label: 'DE', name: 'Deutsch' },
];

export const CATEGORIES = [
  { id: 'all', emoji: '✨', labels: { tr: 'Tümü', en: 'All', ru: 'Все', de: 'Alle' } },
  { id: 'playground', emoji: '🛝', labels: { tr: 'Oyun alanları', en: 'Playgrounds', ru: 'Площадки', de: 'Spielplätze' } },
  { id: 'park', emoji: '🌳', labels: { tr: 'Parklar', en: 'Parks', ru: 'Парки', de: 'Parks' } },
  { id: 'museum', emoji: '🏛️', labels: { tr: 'Müzeler', en: 'Museums', ru: 'Музеи', de: 'Museen' } },
  { id: 'zoo', emoji: '🦁', labels: { tr: 'Hayvanat bahçeleri', en: 'Zoos', ru: 'Зоопарки', de: 'Zoos' } },
  { id: 'aquarium', emoji: '🐠', labels: { tr: 'Akvaryumlar', en: 'Aquariums', ru: 'Аквариумы', de: 'Aquarien' } },
  { id: 'library', emoji: '📚', labels: { tr: 'Kütüphaneler', en: 'Libraries', ru: 'Библиотеки', de: 'Bibliotheken' } },
  { id: 'family-cafe', emoji: '☕', labels: { tr: 'Çocuk dostu kafe', en: 'Family cafes', ru: 'Семейные кафе', de: 'Familiencafés' } },
  { id: 'indoor', emoji: '☔', labels: { tr: 'Kapalı alan', en: 'Rainy day', ru: 'В помещении', de: 'Drinnen' } },
];

export const AGE_GROUPS = [
  { id: '1', label: '0–2', helpers: { tr: 'bebek arabası + uyku', en: 'stroller + naps', ru: 'коляска + сон', de: 'Kinderwagen + Schlaf' } },
  { id: '4', label: '3–5', helpers: { tr: 'oyun + keşif', en: 'play + discovery', ru: 'игра + открытие', de: 'Spiel + Entdecken' } },
  { id: '7', label: '6–9', helpers: { tr: 'deneyim + hareket', en: 'hands-on', ru: 'активно + интересно', de: 'aktiv + praktisch' } },
  { id: '11', label: '10–12', helpers: { tr: 'daha büyük macera', en: 'bigger adventures', ru: 'больше приключений', de: 'größere Abenteuer' } },
];

export const TRENDING_TURKEY_SEARCHES = [
  { labels: { tr: 'İstanbul çocukla gezilecek yerler', en: 'Istanbul with kids', ru: 'Стамбул с детьми', de: 'Istanbul mit Kindern' }, location: 'Istanbul', category: 'all', insight: { tr: 'Google Suggest: İstanbul, Anadolu/Avrupa yakası ve ara tatil aramaları güçlü.', en: 'Google Suggest: Istanbul, Asian/European side and school-break searches are strong.', ru: 'Google Suggest: сильный спрос на Стамбул, районы и каникулы.', de: 'Google Suggest: Istanbul, Stadtseiten und Ferien-Suchen sind stark.' } },
  { labels: { tr: 'Ankara çocukla gidilecek yerler', en: 'Ankara with kids', ru: 'Анкара с детьми', de: 'Ankara mit Kindern' }, location: 'Ankara', category: 'all', insight: { tr: 'Google Suggest: Ankara hem “gidilecek” hem “gezilecek” varyantıyla çıkıyor.', en: 'Google Suggest: Ankara appears in both “places to go” and “things to do” variants.', ru: 'Анкара появляется в вариантах “куда пойти” и “что посмотреть”.', de: 'Ankara erscheint bei “hingehen” und “Sehenswürdigkeiten” Varianten.' } },
  { labels: { tr: 'İzmir çocukla gezilecek yerler', en: 'Izmir with kids', ru: 'Измир с детьми', de: 'Izmir mit Kindern' }, location: 'Izmir', category: 'all', insight: { tr: 'Google Suggest: İzmir + çocuk gezisi ve kahvaltı niyeti görünüyor.', en: 'Google Suggest: Izmir has kid-trip and breakfast venue intent.', ru: 'Измир показывает спрос на прогулки с детьми и завтраки.', de: 'Izmir zeigt Suchintention für Kinder-Ausflüge und Frühstücksorte.' } },
  { labels: { tr: 'Bursa çocukla gezilecek yerler', en: 'Bursa with kids', ru: 'Бурса с детьми', de: 'Bursa mit Kindern' }, location: 'Bursa', category: 'all', insight: { tr: 'Google Suggest: Bursa şehir bazlı çocuk gezisi taleplerinde çıkıyor.', en: 'Google Suggest: Bursa appears as a city-level family outing query.', ru: 'Бурса появляется как городской запрос для семейных прогулок.', de: 'Bursa erscheint als Stadt-Suche für Familienausflüge.' } },
  { labels: { tr: 'Antalya çocukla gezilecek yerler', en: 'Antalya with kids', ru: 'Анталья с детьми', de: 'Antalya mit Kindern' }, location: 'Antalya', category: 'all', insight: { tr: 'Google Suggest: Antalya çocukla gezi/tatil niyetinde yakalanıyor.', en: 'Google Suggest: Antalya captures family trip and holiday intent.', ru: 'Анталья ловит спрос на семейные поездки и отдых.', de: 'Antalya deckt Familienausflug- und Urlaubsintention ab.' } },
  { labels: { tr: 'Çocuk dostu kahvaltı mekanları', en: 'Kid-friendly breakfast places', ru: 'Завтраки для семей', de: 'Kinderfreundliche Frühstücksorte' }, location: 'Istanbul', category: 'family-cafe', insight: { tr: 'Google Suggest: “çocuk dostu kahvaltı mekanları” ayrı bir para/rezervasyon niyeti.', en: 'Google Suggest: “kid-friendly breakfast places” is a separate booking/paid intent.', ru: 'Запрос про семейные завтраки — отдельное намерение бронирования.', de: 'Kinderfreundliche Frühstücksorte zeigen eigene Buchungsintention.' } },
  { labels: { tr: 'Kapalı alan / yağmurlu gün', en: 'Indoor / rainy day', ru: 'В помещении / дождь', de: 'Drinnen / Regentag' }, location: 'Istanbul', category: 'indoor', insight: { tr: 'Ara tatil ve kapalı alan aramaları sezonluk SEO fırsatı.', en: 'School-break and indoor searches are seasonal SEO opportunities.', ru: 'Каникулы и помещения — сезонная SEO-возможность.', de: 'Ferien- und Indoor-Suchen sind saisonale SEO-Chancen.' } },
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
