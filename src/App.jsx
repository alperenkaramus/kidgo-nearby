import { useEffect, useMemo, useRef, useState } from 'react';
import { Baby, Compass, ExternalLink, Globe2, MapPin, Navigation, Search, Sparkles, Telescope, TrendingUp, Umbrella } from 'lucide-react';
import useDebounce from './hooks/useDebounce';
import SkeletonLoader from './components/SkeletonLoader';
import { AGE_GROUPS, CATEGORIES, COUNTRIES, INTENTS, LANGUAGES, TRENDING_TURKEY_SEARCHES, TURKEY_CITIES, getDirectionsUrl, getGoogleSearchUrl, getMapUrl, nearestSupportedCityForCoords, resolveInitialSearchSelection, searchPlaces } from './lib/places.js';
import './styles.css';

const radiusOptions = [2, 5, 10, 20];
const MAX_TRUSTED_LOCATION_ACCURACY_M = 1500;
const featuredCityNames = ['Istanbul', 'Bursa', 'Ankara', 'Izmir', 'Antalya', 'Muğla', 'Eskişehir', 'Gaziantep', 'Trabzon', 'New York', 'London', 'Paris', 'Dubai', 'Tokyo'];

const COPY = {
  tr: {
    eyebrow: 'KidGo Nearby · aileyle dışarı çıkma asistanı',
    title: 'Çocukla gidilecek güzel yerleri 30 saniyede bul.',
    hero: 'Şehir, yaş ve bugünkü moda göre park, oyun alanı, müze, akvaryum, indoor alternatif ve aile molalarını daha keyifli bir rota listesine çevirir.',
    language: 'Dil', country: 'Ülke', countryHelp: 'Öncelik yurtdışı şehirler; Türkiye 81 şehir modu ayrı kapsam olarak duruyor.', locationLabel: 'Şehir veya mevcut konum', placeholder: 'New York, London, Paris, Dubai, Tokyo...', search: 'Yerleri bul', current: 'Mevcut konumu kullan',
    pageTitle: 'KidGo Nearby — Çocuk Dostu Yerleri Bul', mobileDockLabel: 'Hızlı arama', filtersLabel: 'Arama filtreleri', categoriesLabel: 'Kategoriler',
    bestNow: 'Bugünün seçimi', cityPick: 'Şehir önerisi', score: 'puan', demandTitle: 'Popüler aile planları', allCitiesTitle: 'Nereye gidiyorsunuz?', allCitiesHelp: 'Önce ülke ve şehir seç, sonra yaş ve ruh haline göre listeyi daralt. Başlangıçta popüler şehir önerileri ve güvenli yedek liste kullanılır.', citiesDefault: 'Şehir seç',
    filtersTitle: 'Çocuk profili', intentTitle: 'Bugünkü mod', radius: 'Arama yarıçapı', resultsTitle: 'Sıralı aile önerileri', searching: 'Aranıyor…', ideas: 'öneri',
    noticeLive: 'Canlı OpenStreetMap sonuçları çocuk uyumu, mesafe ve aile sinyallerine göre sıralandı.',
    noticeFallback: 'Seçili şehir için hazırlanmış güvenli aile önerileri gösteriliyor. Harita linkinden son kontrolü yapabilirsin.',
    noticeGeoNo: 'Tarayıcı konumu yok; şehir araması aktif kalıyor.', noticeGeoUse: 'Konum izni bekleniyor… Yakınındaki öneriler izin verilirse hazırlanacak.', noticeGeoReady: 'Konum alındı. Yakın çevren için gerçek isimli yerler ve şehir yedekleri hazırlanıyor.', noticeGeoLowAccuracy: 'Tarayıcı konumu yeterince hassas değil. Precise Location aç veya şehir seçerek daha doğru sonuç al.',
    noticeGeoErr: 'Konum alınamadı; şehir yazarak devam edebilirsin.', emptyTitle: 'Net eşleşme yok', emptyBody: 'Tümü seç veya başka bir şehir dene.', loadingTitle: 'Aile planı hazırlanıyor…', loadingBody: 'Şehir, yaş, mod ve kategori sinyallerine göre en uygun duraklar sıralanıyor.', map: 'Haritada aç', directions: 'Yol tarifi al', google: 'Google’da aç', rainy: 'Kapalı alan', whyPick: 'Neden uygun', confidence: 'Güven', scoreMix: 'Skor', liveGoogle: 'Canlı Google', openNow: 'Şu an açık', showResults: 'öneriyi göster', practical: 'Pratik notlar', ratingPending: 'Google puanı bekleniyor', reviews: 'yorum', points: 'puan', checkMap: 'Konumu haritada kontrol et', currentLocationLabel: 'Mevcut konum', confidenceHigh: 'yüksek', confidenceMedium: 'orta', confidenceStarter: 'başlangıç',
  },
  en: {
    eyebrow: 'KidGo Nearby · family day-out assistant', title: 'Find better kid-friendly places in 30 seconds.', hero: 'Pick a city, age and mood. KidGo turns parks, playgrounds, museums, aquariums, indoor backups and snack stops into a clearer family plan.',
    language: 'Language', country: 'Country', countryHelp: 'International cities are prioritized; Turkey keeps a separate 81-city coverage mode.', locationLabel: 'City or current location', placeholder: 'New York, London, Paris, Dubai, Tokyo...', search: 'Find places', current: 'Use current location',
    pageTitle: 'KidGo Nearby — Kid-Friendly Places Near You', mobileDockLabel: 'Quick search', filtersLabel: 'Search filters', categoriesLabel: 'Categories',
    bestNow: 'Today’s pick', cityPick: 'City pick', score: 'score', demandTitle: 'Popular family plans', allCitiesTitle: 'Where are you going?', allCitiesHelp: 'Choose a country and city, then tune the list by age and mood. Launch mode uses curated popular-city data plus safe fallback.', citiesDefault: 'Pick a city', filtersTitle: 'Kid profile', intentTitle: 'Today’s mood', radius: 'Search radius', resultsTitle: 'Family picks ranked for today', searching: 'Planning…', ideas: 'ideas',
    noticeLive: 'Live OpenStreetMap results ranked by kid fit, distance and family-friendly signals.', noticeFallback: 'Showing prepared family-safe city picks. Open the map link for the final local check.', noticeGeoNo: 'Browser geolocation is unavailable; city search stays active.', noticeGeoUse: 'Waiting for location permission… nearby picks will load if access is allowed.', noticeGeoReady: 'Location received. Preparing named nearby places and city backups.', noticeGeoLowAccuracy: 'Browser location is not precise enough. Turn on Precise Location or choose a city for better results.', noticeGeoErr: 'Location was unavailable; type a city to continue.', emptyTitle: 'No exact matches yet', emptyBody: 'Try All categories or another global city.', loadingTitle: 'Preparing a family plan…', loadingBody: 'Ranking places by city, age, mood and category fit.', map: 'Open map', directions: 'Get directions', google: 'Open in Google', rainy: 'Rainy day', whyPick: 'Why it fits', confidence: 'Confidence', scoreMix: 'Score', liveGoogle: 'Live Google', openNow: 'Open now', showResults: 'show picks', practical: 'Practical notes', ratingPending: 'Google rating pending', reviews: 'reviews', points: 'pts', checkMap: 'Check location on map', currentLocationLabel: 'Current location', confidenceHigh: 'high', confidenceMedium: 'medium', confidenceStarter: 'starter',
  },
  ru: {
    eyebrow: 'Глобальный семейный geo-adviser → больше городов и вариантов', title: 'Куда пойти рядом с детьми?', hero: 'Мобильный сервис, который превращает семейные поисковые запросы в гео-рекомендации. Работает по всем городам Турции и готов к росту на английском, русском и немецком.',
    language: 'Язык', country: 'Страна', countryHelp: 'Для Турции доступен режим 81 города; другие страны используют глобальные подборки городов.', locationLabel: 'Город или текущее место', placeholder: 'New York, London, Paris, Dubai, Tokyo...', search: 'Найти места', current: 'Моя геолокация', pageTitle: 'KidGo Nearby — места для детей рядом', mobileDockLabel: 'Быстрый поиск', filtersLabel: 'Фильтры поиска', categoriesLabel: 'Категории', bestNow: 'Лучшее сейчас', cityPick: 'Выбор города', score: 'балл', demandTitle: 'Глобальный радар семейных городов', allCitiesTitle: 'Страна и город', allCitiesHelp: 'Турция покрывает 81 город; другие страны используют стартовые глобальные города. Сначала пробуем OSM, затем городской fallback.', citiesDefault: 'Выберите город', filtersTitle: 'Профиль ребёнка', intentTitle: 'Настроение дня', radius: 'Радиус поиска', resultsTitle: 'Семейные места по рейтингу', searching: 'Поиск…', ideas: 'идеи',
    noticeLive: 'Результаты OpenStreetMap ранжированы по возрасту, расстоянию и семейным сигналам.', noticeFallback: 'Показаны подготовленные семейные варианты для выбранного города. Финально проверьте точку на карте.', noticeGeoNo: 'Геолокация недоступна; используйте поиск по городу.', noticeGeoUse: 'Ожидаем разрешение на геолокацию…', noticeGeoReady: 'Геолокация получена. Готовим именованные места рядом и городские запасные варианты.', noticeGeoLowAccuracy: 'Геолокация недостаточно точная. Включите точное местоположение или выберите город.', noticeGeoErr: 'Геолокация недоступна. Введите город.', emptyTitle: 'Точных совпадений нет', emptyBody: 'Увеличьте радиус, выберите Все или город из списка.', loadingTitle: 'Ищем места для детей…', loadingBody: 'Проверяем город, фильтры и локальные варианты.', map: 'Открыть карту', directions: 'Маршрут', google: 'Открыть в Google', rainy: 'В помещении', whyPick: 'Почему подходит', confidence: 'Надёжность', scoreMix: 'Оценка', liveGoogle: 'Live Google', openNow: 'Открыто сейчас', showResults: 'показать', practical: 'Практично', ratingPending: 'Рейтинг Google ожидается', reviews: 'отзывов', points: 'балл', checkMap: 'Проверьте место на карте', currentLocationLabel: 'Текущее место', confidenceHigh: 'высокая', confidenceMedium: 'средняя', confidenceStarter: 'стартовая',
  },
  de: {
    eyebrow: 'Globaler Familien-Geo-Adviser → mehr Städte, mehr Optionen', title: 'Wohin in der Nähe mit Kindern?', hero: 'Eine mobile Entscheidungs-App, die Familiensuchen in Geo-Empfehlungen verwandelt. Funktioniert in allen türkischen Städten und ist mit Englisch, Russisch und Deutsch global skalierbar.',
    language: 'Sprache', country: 'Land', countryHelp: 'Für die Türkei bleibt der 81-Städte-Modus aktiv; andere Länder nutzen globale Stadtvorschläge.', locationLabel: 'Stadt oder aktueller Standort', placeholder: 'New York, London, Paris, Dubai, Tokyo...', search: 'Orte finden', current: 'Aktuellen Standort nutzen', pageTitle: 'KidGo Nearby — kinderfreundliche Orte finden', mobileDockLabel: 'Schnellsuche', filtersLabel: 'Suchfilter', categoriesLabel: 'Kategorien', bestNow: 'Jetzt am besten', cityPick: 'Stadt-Tipp', score: 'Score', demandTitle: 'Globaler Familienstadt-Radar', allCitiesTitle: 'Land und Stadt', allCitiesHelp: 'Die Türkei hat 81-Städte-Abdeckung; andere Länder nutzen globale Startstädte. Zuerst OSM, dann Stadt-Fallback.', citiesDefault: 'Stadt wählen', filtersTitle: 'Kinderprofil', intentTitle: 'Stimmung heute', radius: 'Suchradius', resultsTitle: 'Sortierte Familien-Tipps', searching: 'Suche…', ideas: 'Ideen',
    noticeLive: 'Live-OpenStreetMap-Ergebnisse nach Kinderfit, Entfernung und Familiensignalen sortiert.', noticeFallback: 'Vorbereitete familienfreundliche Tipps für die gewählte Stadt. Bitte den Standort final auf der Karte prüfen.', noticeGeoNo: 'Browser-Geolocation nicht verfügbar; Stadtsuche bleibt aktiv.', noticeGeoUse: 'Warten auf Standortfreigabe…', noticeGeoReady: 'Standort erhalten. Benannte Orte in der Nähe und Stadt-Backups werden vorbereitet.', noticeGeoLowAccuracy: 'Browser-Standort ist nicht genau genug. Präzisen Standort aktivieren oder Stadt wählen.', noticeGeoErr: 'Standort nicht verfügbar. Bitte Stadt eingeben.', emptyTitle: 'Noch keine genauen Treffer', emptyBody: 'Radius erweitern, Alle wählen oder eine Stadt nutzen.', loadingTitle: 'Kinderfreundliche Orte werden gesucht…', loadingBody: 'Stadt, Filter und lokale Vorschläge werden geprüft.', map: 'Karte öffnen', directions: 'Route starten', google: 'In Google öffnen', rainy: 'Drinnen', whyPick: 'Warum passend', confidence: 'Vertrauen', scoreMix: 'Score', liveGoogle: 'Live Google', openNow: 'Jetzt geöffnet', showResults: 'Tipps zeigen', practical: 'Praktische Hinweise', ratingPending: 'Google-Bewertung ausstehend', reviews: 'Bewertungen', points: 'Pkt.', checkMap: 'Standort auf Karte prüfen', currentLocationLabel: 'Aktueller Standort', confidenceHigh: 'hoch', confidenceMedium: 'mittel', confidenceStarter: 'Startwert',
  },
};

const CATEGORY_SUMMARIES = {
  tr: { playground: 'Enerji atmalık oyun durağı. Yakında hızlı çözüm gerektiğinde iyi.', park: 'Yürüyüş, atıştırma ve esnek oyun için düşük stresli açık alan.', museum: 'Hava sıcak/yağmurluysa iyi keşif ve kapalı alan seçeneği.', zoo: 'Hayvan odaklı, çocuk ilgisi yüksek ve planı kolay gezi.', aquarium: 'Yağmurlu günler ve meraklı çocuklar için güvenilir kapalı deneyim.', library: 'Okuma, tuvalet ve sakin mola için düşük maliyetli reset noktası.', 'family-cafe': 'Ebeveyn kahvesi, atıştırma ve kısa mola için pratik seçenek.', restaurant: 'Aile sinyali güçlüyse yemek odaklı durak.', attraction: 'Çocukla denenebilir cazibe noktası; saatleri kontrol et.', indoor: 'Yağmurlu/sıcak günler için kapalı alan adayı.' },
  en: {}, ru: {}, de: {}
};
CATEGORY_SUMMARIES.en = {
  playground: 'High-energy play stop. Best when you need an easy win nearby.', park: 'Low-pressure outdoor option for walks, snacks and flexible play.', museum: 'Good discovery option when weather makes indoor time easier.', zoo: 'Animal-focused outing with strong kid appeal.', aquarium: 'Reliable indoor animal experience for curious kids.', library: 'Quiet, low-cost reset spot for reading and calmer time.', 'family-cafe': 'Parent-friendly snack/reset option.', restaurant: 'Food-first stop ranked when family signals look useful.', attraction: 'Kid-friendly attraction candidate; check opening hours.', indoor: 'Indoor/rainy-day candidate for backup plans.'
};
CATEGORY_SUMMARIES.ru = {
  playground: 'Активная игровая площадка рядом — хороший быстрый вариант.', park: 'Спокойное открытое место для прогулки, перекуса и свободной игры.', museum: 'Хороший вариант для познания, особенно в жару или дождь.', zoo: 'Поездка с животными, понятная детям и простая для планирования.', aquarium: 'Надёжный крытый опыт для любопытных детей и дождливых дней.', library: 'Тихая недорогая пауза для чтения, туалета и спокойного времени.', 'family-cafe': 'Удобное место для перекуса и отдыха родителей.', restaurant: 'Остановка для еды, если видны семейные сигналы.', attraction: 'Кандидат для семейного развлечения; проверьте часы работы.', indoor: 'Крытый вариант для дождя или жары.'
};
CATEGORY_SUMMARIES.de = {
  playground: 'Aktiver Spielstopp in der Nähe — gut für einen schnellen Gewinn.', park: 'Entspannter Outdoor-Ort für Spaziergang, Snacks und flexibles Spielen.', museum: 'Gute Entdeckungsoption, besonders bei Hitze oder Regen.', zoo: 'Tierfokussierter Ausflug mit starker Kinderwirkung.', aquarium: 'Verlässliches Indoor-Erlebnis für neugierige Kinder und Regentage.', library: 'Ruhiger, günstiger Reset-Ort für Lesen, Toiletten und Pausen.', 'family-cafe': 'Praktische Snack- und Pausenoption für Eltern.', restaurant: 'Essensstopp, wenn Familiensignale nützlich wirken.', attraction: 'Familienfreundlicher Ausflugskandidat; Öffnungszeiten prüfen.', indoor: 'Indoor-Kandidat für Regen oder Hitze.'
};

function App() {
  const initialSelection = useMemo(
    () => resolveInitialSearchSelection(typeof window === 'undefined' ? '' : window.location.search),
    [],
  );
  const defaultCountry = COUNTRIES.find((item) => item.id === initialSelection.country) || COUNTRIES[0];
  const [lang, setLang] = useState(initialSelection.language);
  const [country, setCountry] = useState(defaultCountry.id);
  const [location, setLocation] = useState(initialSelection.city);
  const [submittedLocation, setSubmittedLocation] = useState(initialSelection.city);
  const [debouncedLocation, setDebouncedLocation] = useState(initialSelection.city);
  const [coords, setCoords] = useState(null);
  const [age, setAge] = useState('4');
  const [intent, setIntent] = useState('quick');
  const [category, setCategory] = useState('all');
  const [radiusKm, setRadiusKm] = useState(5);
  const [places, setPlaces] = useState([]);
  const [status, setStatus] = useState('idle');
  const [activeTrendIndex, setActiveTrendIndex] = useState(0);
  const [notice, setNotice] = useState(COPY[initialSelection.language].noticeFallback);
  const [geoNoticeOverride, setGeoNoticeOverride] = useState('');

  const t = COPY[lang];
  const selectedCountry = useMemo(() => COUNTRIES.find((item) => item.id === country) || COUNTRIES[0], [country]);
  const countryCities = selectedCountry.id === 'TR' ? TURKEY_CITIES : selectedCountry.cities;
  const selectedAge = useMemo(() => AGE_GROUPS.find((item) => item.id === age), [age]);
  const selectedIntent = INTENTS.find((item) => item.id === intent) || INTENTS[0];
  const resultsRef = useRef(null);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = t.pageTitle;
  }, [lang, t.pageTitle]);
  const selectedCategory = useMemo(() => CATEGORIES.find((item) => item.id === category), [category]);
  const activeInsight = TRENDING_TURKEY_SEARCHES[activeTrendIndex]?.insight[lang] || TRENDING_TURKEY_SEARCHES[0].insight.en;
  const practicalNotes = [
    selectedAge?.helpers[lang] || selectedAge?.helpers.en,
    selectedIntent?.helpers[lang] || selectedIntent?.helpers.en,
    selectedCategory?.labels[lang] || selectedCategory?.labels.en,
  ];
  const tagLabels = {
    tr: { Playground: 'Oyun alanı', Toilets: 'Tuvalet', Free: 'Ücretsiz', 'Google rated': 'Google puanlı', 'Stroller friendly': 'Bebek arabasına uygun', 'Rainy day': 'Kapalı alan', Website: 'Web sitesi', 'Hours listed': 'Saat bilgisi', 'High chairs': 'Mama sandalyesi', 'Outdoor seating': 'Dış oturma' },
    ru: { Playground: 'Площадка', Toilets: 'Туалет', Free: 'Бесплатно', 'Google rated': 'С рейтингом Google', 'Stroller friendly': 'Для коляски', 'Rainy day': 'В помещении', Website: 'Сайт', 'Hours listed': 'Есть часы', 'High chairs': 'Детские стулья', 'Outdoor seating': 'На улице' },
    de: { Playground: 'Spielplatz', Toilets: 'Toilette', Free: 'Kostenlos', 'Google rated': 'Google-bewertet', 'Stroller friendly': 'Kinderwagenfreundlich', 'Rainy day': 'Drinnen', Website: 'Website', 'Hours listed': 'Öffnungszeiten', 'High chairs': 'Hochstühle', 'Outdoor seating': 'Außenplätze' },
  };
  const tagLabel = (tag) => tagLabels[lang]?.[tag] || tag;

  const evidenceCopy = {
    'matches today’s activity mood': lang === 'tr' ? 'bugünkü ihtiyaca uyuyor' : (lang === 'ru' ? 'подходит под сегодняшнюю задачу' : (lang === 'de' ? 'passt zur heutigen Stimmung' : 'matches today’s activity mood')),
    'strong family amenities': lang === 'tr' ? 'aile için güçlü imkan sinyali var' : (lang === 'ru' ? 'есть семейные удобства' : (lang === 'de' ? 'gute Familiensignale' : 'strong family amenities')),
    'nearby enough for a low-friction trip': lang === 'tr' ? 'zahmetsiz plan için yeterince yakın' : (lang === 'ru' ? 'достаточно близко для простого плана' : (lang === 'de' ? 'nah genug für einen einfachen Ausflug' : 'nearby enough for a low-friction trip')),
    'good age fit': lang === 'tr' ? 'yaşa uygun görünüyor' : (lang === 'ru' ? 'подходит по возрасту' : (lang === 'de' ? 'passt zum Alter' : 'good age fit')),
    'works as an indoor backup': lang === 'tr' ? 'kapalı alan yedeği olarak uygun' : (lang === 'ru' ? 'подходит как крытый запасной вариант' : (lang === 'de' ? 'funktioniert als Indoor-Backup' : 'works as an indoor backup')),
  };
  const renderEvidence = (item) => {
    if (item.startsWith('Google ')) return item.replace('reviews', t.reviews);
    if (item.startsWith('Live Google ')) return item.replace('reviews', t.reviews);
    return evidenceCopy[item] || item;
  };
  const confidenceLabel = (level) => ({ high: t.confidenceHigh, medium: t.confidenceMedium, starter: t.confidenceStarter }[level] || level);
  const distanceLabel = (place) => (place.distanceKm === null ? t.cityPick : place.distanceLabel);

  useEffect(() => {
    setDebouncedLocation(location);
  }, [location]);

  useEffect(() => {
    let cancelled = false;
    async function runSearch() {
      setStatus('loading');
      try {
        const results = await searchPlaces({ location: debouncedLocation, coords, age, intent, category, radiusKm });
        if (cancelled) return;
        setPlaces(results);
        setStatus(results.length ? 'success' : 'empty');
        if (geoNoticeOverride) setNotice(geoNoticeOverride);
        else setNotice(coords ? t.noticeGeoReady : (results.some((place) => place.source?.toLowerCase().includes('fallback') || place.source?.toLowerCase().includes('seed')) ? t.noticeFallback : t.noticeLive));
      } catch (error) {
        if (cancelled) return;
        setStatus('error');
        setNotice(error instanceof Error ? error.message : t.noticeGeoErr);
      }
    }
    runSearch();
    return () => { cancelled = true; };
  }, [age, intent, category, coords, radiusKm, debouncedLocation, geoNoticeOverride, t.noticeFallback, t.noticeLive, t.noticeGeoReady, t.noticeGeoErr]);

  function submitSearch() {
    const nextLocation = location.trim() || selectedCountry.defaultCity || defaultCountry.defaultCity;
    const matchedCountry = COUNTRIES.find((item) => item.cities.some((city) => city.toLowerCase() === nextLocation.toLowerCase()) || item.defaultCity.toLowerCase() === nextLocation.toLowerCase());
    if (matchedCountry) setCountry(matchedCountry.id);
    setDebouncedLocation(nextLocation);
    setGeoNoticeOverride('');
    setCoords(null);
    setSubmittedLocation(nextLocation);
    window.setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  }
  function handleSubmit(event) { event.preventDefault(); submitSearch(); }
  function pickCity(city) { if (!city) return; setGeoNoticeOverride(''); setLocation(city); setSubmittedLocation(city); setCoords(null); }
  function changeCountry(nextCountryId) {
    const nextCountry = COUNTRIES.find((item) => item.id === nextCountryId) || COUNTRIES[0];
    setCountry(nextCountry.id);
    pickCity(nextCountry.defaultCity);
  }
  function applyTrend(item) {
    const index = TRENDING_TURKEY_SEARCHES.indexOf(item);
    if (index >= 0) setActiveTrendIndex(index);
    const trendCountry = COUNTRIES.find((countryItem) => countryItem.cities.includes(item.location) || countryItem.defaultCity === item.location);
    if (trendCountry) setCountry(trendCountry.id);
    pickCity(item.location);
    setCategory(item.category);
  }
  function useCurrentLocation() {
    if (!navigator.geolocation) { setNotice(t.noticeGeoNo); return; }
    setStatus('loading');
    setGeoNoticeOverride('');
    setNotice(t.noticeGeoUse);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const accuracy = Number(position.coords.accuracy);
        if (Number.isFinite(accuracy) && accuracy > MAX_TRUSTED_LOCATION_ACCURACY_M) {
          const approximateCoords = { lat: Number(position.coords.latitude.toFixed(5)), lon: Number(position.coords.longitude.toFixed(5)) };
          const cityFallback = nearestSupportedCityForCoords(approximateCoords);
          setStatus('loading');
          setCoords(null);
          if (cityFallback !== 'nearby') {
            setLocation(cityFallback);
            setSubmittedLocation(cityFallback);
            const matchedCountry = COUNTRIES.find((item) => item.cities.includes(cityFallback) || item.defaultCity === cityFallback);
            if (matchedCountry) setCountry(matchedCountry.id);
          }
          const lowAccuracyNotice = `${t.noticeGeoLowAccuracy} (±${Math.round(accuracy)} m${cityFallback !== 'nearby' ? ` · ${cityFallback}` : ''})`;
          setGeoNoticeOverride(lowAccuracyNotice);
          setNotice(lowAccuracyNotice);
          return;
        }
        const nextCoords = {
          lat: Number(position.coords.latitude.toFixed(5)),
          lon: Number(position.coords.longitude.toFixed(5)),
          accuracy: Number.isFinite(accuracy) ? Math.round(accuracy) : null,
        };
        setCoords(nextCoords); setSubmittedLocation(t.currentLocationLabel); setLocation(t.currentLocationLabel); setNotice(t.noticeGeoReady);
      },
      () => { setStatus('error'); setNotice(t.noticeGeoErr); },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 },
    );
  }

  const isLoading = status === 'loading';

  return (
    <main className="app-shell">
      <div className="topbar">
        <div className="brand-mark"><Globe2 size={17} /> KidGo Nearby</div>
        <div className="language-switcher" aria-label={t.language}>
          {LANGUAGES.map((item) => <button key={item.id} className={item.id === lang ? 'active' : ''} onClick={() => setLang(item.id)}>{item.label}</button>)}
        </div>
      </div>

      <div className="mobile-action-dock" aria-label={t.mobileDockLabel}>
        <span>{location || selectedCountry.defaultCity}</span>
        <button type="button" onClick={submitSearch}>{places.length} {t.showResults || t.search}</button>
      </div>

      <section className="planner-card">
        <div className="planner-copy">
          <div className="eyebrow"><Sparkles size={16} /> {t.eyebrow}</div>
          <h1>{t.title}</h1>
          <p className="hero-copy">{t.hero}</p>
        </div>
        <form className="search-panel" onSubmit={handleSubmit}>
          <label htmlFor="location">{t.locationLabel}</label>
          <div className="input-wrap"><Search size={18} /><input id="location" value={location} onChange={(event) => setLocation(event.target.value)} placeholder={t.placeholder} /></div>
          <div className="search-actions">
            <button className="ghost-button" type="button" onClick={useCurrentLocation}><Navigation size={17} /> {t.current}</button>
            <button className="primary-button" type="submit">{t.search}</button>
          </div>
        </form>
      </section>

      <section className="quick-layout">
        <section className="cities-card">
          <div className="section-heading"><MapPin size={20} /><div><h2>{t.allCitiesTitle}</h2><p>{t.allCitiesHelp}</p></div></div>
          <div className="two-field-grid">
            <div>
              <label className="field-label" htmlFor="country">{t.country}</label>
              <select id="country" className="city-select" value={country} onChange={(event) => changeCountry(event.target.value)}>
                {COUNTRIES.map((item) => <option key={item.id} value={item.id}>{item.labels[lang] || item.labels.en}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label" htmlFor="city-select">{selectedCountry.id === 'TR' ? t.allCitiesTitle : t.cityPick}</label>
              <select id="city-select" className="city-select" value={countryCities.includes(location) ? location : ''} onChange={(event) => pickCity(event.target.value)}>
                <option value="">{t.citiesDefault}</option>{countryCities.map((city) => <option key={city} value={city}>{city}</option>)}
              </select>
            </div>
          </div>
          <div className="city-rail">{(selectedCountry.id === 'TR' ? featuredCityNames : selectedCountry.cities).map((city) => <button key={city} type="button" onClick={() => pickCity(city)} className={submittedLocation === city ? 'active' : ''}>{city}</button>)}</div>
        </section>

        <section className="filter-card" aria-label={t.filtersLabel}>
          <div className="section-heading"><Baby size={20} /><div><h2>{t.filtersTitle}</h2><p>{selectedAge?.helpers[lang]} · {selectedIntent?.labels[lang]} · {selectedCategory?.labels[lang]}</p></div></div>
          <div className="segmented-grid age-grid">{AGE_GROUPS.map((item) => <button key={item.id} type="button" className={item.id === age ? 'segment active' : 'segment'} onClick={() => setAge(item.id)}><strong>{item.label}</strong><span>{item.helpers[lang]}</span></button>)}</div>
          <h3 className="subfilter-title">{t.intentTitle}</h3>
          <div className="segmented-grid intent-grid">{INTENTS.map((item) => <button key={item.id} type="button" className={item.id === intent ? 'segment active' : 'segment'} onClick={() => setIntent(item.id)}><strong>{item.emoji} {item.labels[lang]}</strong><span>{item.helpers[lang]}</span></button>)}</div>
          <div className="chips" aria-label={t.categoriesLabel}>{CATEGORIES.map((item) => <button key={item.id} type="button" aria-pressed={item.id === category} className={item.id === category ? 'chip active' : 'chip'} onClick={() => setCategory(item.id)}><span>{item.emoji}</span> {item.labels[lang]}</button>)}</div>
        </section>
      </section>

      <section className="trend-card">
        <div className="section-heading"><TrendingUp size={20} /><div><h2>{t.demandTitle}</h2><p>{activeInsight}</p></div></div>
        <div className="trend-chips">{TRENDING_TURKEY_SEARCHES.map((item, index) => <button key={item.location + item.category} type="button" aria-pressed={index === activeTrendIndex} className={index === activeTrendIndex ? 'active' : ''} onClick={() => applyTrend(item)}>{item.labels[lang] || item.labels.en}</button>)}</div>
      </section>

      <section className="results-section" ref={resultsRef}>
        <div className="results-heading"><div><p className="kicker">{coords ? `${coords.lat}, ${coords.lon}${coords.accuracy ? ` · ±${coords.accuracy} m` : ''}` : submittedLocation}</p><h2>{t.resultsTitle}</h2></div><span className="result-count">{isLoading ? t.searching : `${places.length} ${t.ideas}`}</span></div>
        <div className="notice" role={status === 'error' ? 'alert' : 'status'}>{status === 'error' ? <Umbrella size={18} /> : <Compass size={18} />}<span>{notice}</span></div>
        {isLoading && <SkeletonLoader />}
        {status === 'empty' && <div className="state-card"><Telescope size={28} /><h3>{t.emptyTitle}</h3><p>{t.emptyBody}</p></div>}
        {!isLoading && places.length > 0 && <div className="cards-grid">{places.map((place, index) => {
          const cat = CATEGORIES.find((item) => item.id === place.category);
          return (
            <article className="place-card" key={place.id}>
              <div className="image-panel">
                <span className="floating-rank">#{index + 1}</span>
                <span className="floating-score"><b>{place.score}</b><small>{` ${t.points}`}</small></span>
                {place.googleRating && <span className="floating-google">★ {place.googleRating} <small>{place.googleReviewLabel}</small></span>}
                <div className={`category-illustration ${place.category}`}>{cat?.emoji || '✨'}</div>
              </div>
              <div className="place-body">
                <div className="card-topline"><span className="category-tag">{cat?.labels[lang] || place.categoryLabel}</span>{place.googleLive && <span className="google-live-tag">{t.liveGoogle}</span>}{place.openNow && <span className="open-tag">{t.openNow}</span>}{place.rainyDay && <span className="rain-tag">{t.rainy}</span>}</div>
                <h3>{place.name}</h3>
                <p className="summary">{CATEGORY_SUMMARIES[lang][place.category] || CATEGORY_SUMMARIES.en[place.category]}</p>
                <div className="rating-row">
                  <span>{place.googleRating ? `★ ${place.googleRating} Google` : t.ratingPending}</span>
                  <span>{place.googleReviewLabel ? `${place.googleReviewLabel} ${t.reviews}` : t.checkMap}</span>
                  <span>{t.confidence}: {confidenceLabel(place.confidence)}</span>
                </div>
                <div className="meta-row"><MapPin size={16} /> {distanceLabel(place)} · {place.address || t.checkMap}</div>
                <div className="evidence-box">
                  <strong>{t.whyPick}</strong>
                  <ul>{place.evidence.map((item) => <li key={item}>{renderEvidence(item)}</li>)}</ul>
                  <p>{t.practical}: {practicalNotes.filter(Boolean).slice(0, 3).join(' · ')}</p>
                </div>
                <div className="tag-row">{place.tags.map((tag) => <span key={tag}>{tagLabel(tag)}</span>)}</div>
                <div className="card-actions"><a className="directions-primary" href={getDirectionsUrl(place)} target="_blank" rel="noreferrer">{t.directions} <Navigation size={15} /></a><a href={getMapUrl(place)} target="_blank" rel="noreferrer">{t.map} <ExternalLink size={15} /></a><a href={getGoogleSearchUrl(place)} target="_blank" rel="noreferrer">{t.google} <ExternalLink size={15} /></a></div>
              </div>
            </article>
          );
        })}</div>}
      </section>
    </main>
  );
}

export default App;


