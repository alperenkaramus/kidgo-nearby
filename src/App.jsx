import { useEffect, useMemo, useState } from 'react';
import { Baby, Compass, ExternalLink, Globe2, Loader2, MapPin, Navigation, Search, Sparkles, Telescope, TrendingUp, Umbrella } from 'lucide-react';
import { AGE_GROUPS, CATEGORIES, COUNTRIES, DEFAULT_COUNTRY, DEFAULT_LANGUAGE, LANGUAGES, TRENDING_TURKEY_SEARCHES, TURKEY_CITIES, getDirectionsUrl, getMapUrl, searchPlaces } from './lib/places.js';
import './styles.css';

const radiusOptions = [2, 5, 10, 20];
const featuredCityNames = COUNTRIES.find((item) => item.id === 'TR')?.cities || ['Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Antalya', 'Muğla', 'Eskişehir', 'Gaziantep', 'Trabzon', 'Kayseri', 'Konya', 'Mersin'];

const COPY = {
  tr: {
    eyebrow: 'Türkiye arama radarı → global aile geo app',
    title: 'Çocukla yakınında nereye gidilir?',
    hero: 'Google’da aranan çocuklu aile gezi niyetlerini canlı geo aramaya çeviren mobil karar motoru. Türkiye’nin 81 şehrinde çalışır; İngilizce, Rusça ve Almanca arayüzle global büyümeye hazır.',
    language: 'Dil', country: 'Ülke', countryHelp: 'Türkiye için 81 şehir modu; diğer ülkeler global şehir önerileriyle çalışır.', locationLabel: 'Şehir veya mevcut konum', placeholder: 'Istanbul, Ankara, Izmir, London...', search: 'Yerleri bul', current: 'Mevcut konumu kullan',
    bestNow: 'Şimdi en iyi', cityPick: 'Şehir önerisi', score: 'puan', demandTitle: 'Türkiye Google talep radarı', allCitiesTitle: 'Ülke ve şehir', allCitiesHelp: 'Türkiye için 81 şehir; diğer ülkeler için global şehir seçenekleri. Şehir seçilince canlı OSM denenir, olmazsa şehir bazlı fallback devreye girer.', citiesDefault: 'Şehir seç',
    filtersTitle: 'Çocuk profili', radius: 'Arama yarıçapı', resultsTitle: 'Sıralı aile önerileri', searching: 'Aranıyor…', ideas: 'öneri',
    noticeLive: 'Canlı OpenStreetMap sonuçları çocuk uyumu, mesafe ve aile sinyallerine göre sıralandı.',
    noticeFallback: 'Şehir bazlı fallback + açık harita hazır veri gösteriliyor. Canlı OSM yavaş olsa bile ürün akışı bozulmuyor.',
    noticeGeoNo: 'Tarayıcı konumu yok; şehir araması aktif kalıyor.', noticeGeoUse: 'Mevcut konum kullanılıyor. Canlı OSM yavaşsa fallback mod arayüzü test edilebilir tutar.',
    noticeGeoErr: 'Konum izni kapalı veya alınamadı. Bir Türkiye şehri seç.', emptyTitle: 'Net eşleşme yok', emptyBody: 'Yarıçapı büyüt, Tümü seç veya 81 şehir modundan bir şehir dene.', loadingTitle: 'Çocuk dostu yerler aranıyor…', loadingBody: 'Şehir, filtreler, canlı OSM ve Türkiye fallback sıralaması kontrol ediliyor.', map: 'Harita', directions: 'Yol tarifi', rainy: 'Kapalı alan',
  },
  en: {
    eyebrow: 'Turkey search radar → global family geo app', title: 'Where can we go nearby with kids?', hero: 'A mobile decision engine that turns family search demand into live geo discovery. Works across all Turkish cities and is ready for global growth with English, Russian and German UI.',
    language: 'Language', country: 'Country', countryHelp: 'Turkey keeps the 81-city mode; other countries use global city picks.', locationLabel: 'City or current location', placeholder: 'Istanbul, Ankara, Izmir, London...', search: 'Find places', current: 'Use current location',
    bestNow: 'Best now', cityPick: 'City pick', score: 'score', demandTitle: 'Turkey Google demand radar', allCitiesTitle: 'Country & city', allCitiesHelp: 'Turkey has full 81-city coverage; other countries use global starter cities. Live OSM is tried first, then a city-aware fallback keeps the app usable.', citiesDefault: 'Pick a city', filtersTitle: 'Kid profile', radius: 'Search radius', resultsTitle: 'Ranked family picks', searching: 'Searching…', ideas: 'ideas',
    noticeLive: 'Live OpenStreetMap results ranked by kid fit, distance and family-friendly signals.', noticeFallback: 'Showing city-ready fallback + open-map data. The product flow stays usable when live OSM is slow.', noticeGeoNo: 'Browser geolocation is unavailable; city search stays active.', noticeGeoUse: 'Using current location. If live OSM is slow, fallback mode keeps the UI testable.', noticeGeoErr: 'Location permission was blocked or unavailable. Pick a city.', emptyTitle: 'No exact matches yet', emptyBody: 'Try a wider radius, All categories, or the 81-city mode.', loadingTitle: 'Finding kid-friendly options…', loadingBody: 'Checking city, filters, live OSM and Turkey fallback ranking.', map: 'Map', directions: 'Directions', rainy: 'Rainy day',
  },
  ru: {
    eyebrow: 'Радар поиска Турции → глобальное семейное geo-приложение', title: 'Куда пойти рядом с детьми?', hero: 'Мобильный сервис, который превращает семейные поисковые запросы в гео-рекомендации. Работает по всем городам Турции и готов к росту на английском, русском и немецком.',
    language: 'Язык', country: 'Страна', countryHelp: 'Для Турции доступен режим 81 города; другие страны используют глобальные подборки городов.', locationLabel: 'Город или текущее место', placeholder: 'Istanbul, Ankara, Izmir, London...', search: 'Найти места', current: 'Моя геолокация', bestNow: 'Лучшее сейчас', cityPick: 'Выбор города', score: 'балл', demandTitle: 'Google-спрос по Турции', allCitiesTitle: 'Страна и город', allCitiesHelp: 'Турция покрывает 81 город; другие страны используют стартовые глобальные города. Сначала пробуем OSM, затем городской fallback.', citiesDefault: 'Выберите город', filtersTitle: 'Профиль ребёнка', radius: 'Радиус поиска', resultsTitle: 'Семейные места по рейтингу', searching: 'Поиск…', ideas: 'идеи',
    noticeLive: 'Результаты OpenStreetMap ранжированы по возрасту, расстоянию и семейным сигналам.', noticeFallback: 'Показан городской fallback + открытые карты; интерфейс работает даже при медленном OSM.', noticeGeoNo: 'Геолокация недоступна; используйте поиск по городу.', noticeGeoUse: 'Используется текущее местоположение. При медленном OSM включится fallback.', noticeGeoErr: 'Доступ к геолокации закрыт. Выберите город.', emptyTitle: 'Точных совпадений нет', emptyBody: 'Увеличьте радиус, выберите Все или город из списка.', loadingTitle: 'Ищем места для детей…', loadingBody: 'Проверяем город, фильтры, OSM и fallback.', map: 'Карта', directions: 'Маршрут', rainy: 'В помещении',
  },
  de: {
    eyebrow: 'Türkei-Suchradar → globale Familien-Geo-App', title: 'Wohin in der Nähe mit Kindern?', hero: 'Eine mobile Entscheidungs-App, die Familiensuchen in Geo-Empfehlungen verwandelt. Funktioniert in allen türkischen Städten und ist mit Englisch, Russisch und Deutsch global skalierbar.',
    language: 'Sprache', country: 'Land', countryHelp: 'Für die Türkei bleibt der 81-Städte-Modus aktiv; andere Länder nutzen globale Stadtvorschläge.', locationLabel: 'Stadt oder aktueller Standort', placeholder: 'Istanbul, Ankara, Izmir, London...', search: 'Orte finden', current: 'Aktuellen Standort nutzen', bestNow: 'Jetzt am besten', cityPick: 'Stadt-Tipp', score: 'Score', demandTitle: 'Google-Nachfrage Türkei', allCitiesTitle: 'Land und Stadt', allCitiesHelp: 'Die Türkei hat 81-Städte-Abdeckung; andere Länder nutzen globale Startstädte. Zuerst OSM, dann Stadt-Fallback.', citiesDefault: 'Stadt wählen', filtersTitle: 'Kinderprofil', radius: 'Suchradius', resultsTitle: 'Sortierte Familien-Tipps', searching: 'Suche…', ideas: 'Ideen',
    noticeLive: 'Live-OpenStreetMap-Ergebnisse nach Kinderfit, Entfernung und Familiensignalen sortiert.', noticeFallback: 'Stadt-Fallback + offene Kartendaten werden angezeigt; der Flow bleibt auch bei langsamem OSM nutzbar.', noticeGeoNo: 'Browser-Geolocation nicht verfügbar; Stadtsuche bleibt aktiv.', noticeGeoUse: 'Aktueller Standort wird verwendet. Bei langsamem OSM bleibt der Fallback nutzbar.', noticeGeoErr: 'Standortzugriff blockiert. Bitte Stadt wählen.', emptyTitle: 'Noch keine genauen Treffer', emptyBody: 'Radius erweitern, Alle wählen oder eine Stadt nutzen.', loadingTitle: 'Kinderfreundliche Orte werden gesucht…', loadingBody: 'Stadt, Filter, OSM und Fallback werden geprüft.', map: 'Karte', directions: 'Route', rainy: 'Drinnen',
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
  const defaultCountry = COUNTRIES.find((item) => item.id === DEFAULT_COUNTRY) || COUNTRIES[0];
  const [lang, setLang] = useState(DEFAULT_LANGUAGE);
  const [country, setCountry] = useState(defaultCountry.id);
  const [location, setLocation] = useState(defaultCountry.defaultCity);
  const [submittedLocation, setSubmittedLocation] = useState(defaultCountry.defaultCity);
  const [coords, setCoords] = useState(null);
  const [age, setAge] = useState('4');
  const [category, setCategory] = useState('all');
  const [radiusKm, setRadiusKm] = useState(5);
  const [places, setPlaces] = useState([]);
  const [status, setStatus] = useState('idle');
  const [activeTrendIndex, setActiveTrendIndex] = useState(0);
  const [notice, setNotice] = useState(COPY[DEFAULT_LANGUAGE].noticeFallback);

  const t = COPY[lang];
  const selectedCountry = useMemo(() => COUNTRIES.find((item) => item.id === country) || COUNTRIES[0], [country]);
  const countryCities = selectedCountry.id === 'TR' ? TURKEY_CITIES : selectedCountry.cities;
  const selectedAge = useMemo(() => AGE_GROUPS.find((item) => item.id === age), [age]);
  const selectedCategory = useMemo(() => CATEGORIES.find((item) => item.id === category), [category]);
  const activeInsight = TRENDING_TURKEY_SEARCHES[activeTrendIndex]?.insight[lang] || TRENDING_TURKEY_SEARCHES[0].insight.en;

  useEffect(() => {
    let cancelled = false;
    async function runSearch() {
      setStatus('loading');
      try {
        const results = await searchPlaces({ location: submittedLocation, coords, age, category, radiusKm });
        if (cancelled) return;
        setPlaces(results);
        setStatus(results.length ? 'success' : 'empty');
        setNotice(results.some((place) => place.source?.includes('fallback')) ? t.noticeFallback : t.noticeLive);
      } catch (error) {
        if (cancelled) return;
        setStatus('error');
        setNotice(error instanceof Error ? error.message : t.noticeGeoErr);
      }
    }
    runSearch();
    return () => { cancelled = true; };
  }, [age, category, coords, radiusKm, submittedLocation, t.noticeFallback, t.noticeLive, t.noticeGeoErr]);

  function handleSubmit(event) {
    event.preventDefault();
    setCoords(null);
    setSubmittedLocation(location.trim() || selectedCountry.defaultCity || defaultCountry.defaultCity);
  }
  function pickCity(city) { if (!city) return; setLocation(city); setSubmittedLocation(city); setCoords(null); }
  function changeCountry(nextCountryId) {
    const nextCountry = COUNTRIES.find((item) => item.id === nextCountryId) || COUNTRIES[0];
    setCountry(nextCountry.id);
    pickCity(nextCountry.defaultCity);
  }
  function applyTrend(item) {
    const index = TRENDING_TURKEY_SEARCHES.indexOf(item);
    if (index >= 0) setActiveTrendIndex(index);
    setCountry('TR');
    pickCity(item.location);
    setCategory(item.category);
  }
  function useCurrentLocation() {
    if (!navigator.geolocation) { setNotice(t.noticeGeoNo); return; }
    setStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextCoords = { lat: Number(position.coords.latitude.toFixed(5)), lon: Number(position.coords.longitude.toFixed(5)) };
        setCoords(nextCoords); setSubmittedLocation('Current location'); setLocation('Current location'); setNotice(t.noticeGeoUse);
      },
      () => { setStatus('error'); setNotice(t.noticeGeoErr); },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 },
    );
  }

  const isLoading = status === 'loading';
  const featured = places.slice(0, 3);

  return (
    <main className="app-shell">
      <div className="topbar">
        <div className="brand-mark"><Globe2 size={17} /> KidGo Nearby</div>
        <div className="language-switcher" aria-label={t.language}>
          {LANGUAGES.map((item) => <button key={item.id} className={item.id === lang ? 'active' : ''} onClick={() => setLang(item.id)}>{item.label}</button>)}
        </div>
      </div>

      <section className="hero-grid">
        <div className="hero-card">
          <div className="eyebrow"><Sparkles size={16} /> {t.eyebrow}</div>
          <h1>{t.title}</h1>
          <p className="hero-copy">{t.hero}</p>
          <form className="search-panel" onSubmit={handleSubmit}>
            <label htmlFor="location">{t.locationLabel}</label>
            <div className="location-row">
              <div className="input-wrap"><Search size={18} /><input id="location" value={location} onChange={(event) => setLocation(event.target.value)} placeholder={t.placeholder} /></div>
              <button className="primary-button" type="submit">{t.search}</button>
            </div>
            <button className="ghost-button" type="button" onClick={useCurrentLocation}><Navigation size={17} /> {t.current}</button>
          </form>
        </div>
        <aside className="map-art-card" aria-label="Product visual map">
          <div className="orbit one">🛝</div><div className="orbit two">☔</div><div className="orbit three">🦁</div><div className="map-path" />
          <div className="pin-card main-pin"><span>{t.bestNow}</span><strong>{featured[0]?.name || t.cityPick}</strong><small>{featured[0]?.distanceLabel || t.cityPick} · {featured[0]?.score || 0} {t.score}</small></div>
          <div className="mini-stack">{featured.map((place, index) => <div className="mini-place" key={place.id}><b>#{index + 1}</b><span>{place.name}</span></div>)}</div>
        </aside>
      </section>

      <section className="trend-card">
        <div className="section-heading"><TrendingUp size={20} /><div><h2>{t.demandTitle}</h2><p>{activeInsight}</p></div></div>
        <div className="trend-chips">{TRENDING_TURKEY_SEARCHES.map((item) => <button key={item.location + item.category} type="button" onClick={() => applyTrend(item)}>{item.labels[lang] || item.labels.en}</button>)}</div>
      </section>

      <section className="cities-card">
        <div className="section-heading"><MapPin size={20} /><div><h2>{t.allCitiesTitle}</h2><p>{t.allCitiesHelp}</p></div></div>
        <label className="field-label" htmlFor="country">{t.country}</label>
        <select id="country" className="city-select" value={country} onChange={(event) => changeCountry(event.target.value)}>
          {COUNTRIES.map((item) => <option key={item.id} value={item.id}>{item.labels[lang] || item.labels.en}</option>)}
        </select>
        <p className="select-help">{t.countryHelp}</p>
        <label className="field-label" htmlFor="city-select">{selectedCountry.id === 'TR' ? t.allCitiesTitle : t.cityPick}</label>
        <select id="city-select" className="city-select" value={countryCities.includes(location) ? location : ''} onChange={(event) => pickCity(event.target.value)}>
          <option value="">{t.citiesDefault}</option>{countryCities.map((city) => <option key={city} value={city}>{city}</option>)}
        </select>
        <div className="city-rail">{(selectedCountry.id === 'TR' ? featuredCityNames : selectedCountry.cities).map((city) => <button key={city} type="button" onClick={() => pickCity(city)} className={submittedLocation === city ? 'active' : ''}>{city}</button>)}</div>
      </section>

      <section className="filter-card" aria-label="Search filters">
        <div className="section-heading"><Baby size={20} /><div><h2>{t.filtersTitle}</h2><p>{selectedAge?.helpers[lang]} · {selectedCategory?.labels[lang]}</p></div></div>
        <div className="segmented-grid age-grid">{AGE_GROUPS.map((item) => <button key={item.id} type="button" className={item.id === age ? 'segment active' : 'segment'} onClick={() => setAge(item.id)}><strong>{item.label}</strong><span>{item.helpers[lang]}</span></button>)}</div>
        <div className="chips" aria-label="Categories">{CATEGORIES.map((item) => <button key={item.id} type="button" className={item.id === category ? 'chip active' : 'chip'} onClick={() => setCategory(item.id)}><span>{item.emoji}</span> {item.labels[lang]}</button>)}</div>
        <label className="radius-label" htmlFor="radius">{t.radius}: <strong>{radiusKm} km</strong></label><input id="radius" type="range" min="2" max="20" step="1" value={radiusKm} onChange={(event) => setRadiusKm(Number(event.target.value))} />
        <div className="radius-pills">{radiusOptions.map((radius) => <button key={radius} type="button" onClick={() => setRadiusKm(radius)} className={radius === radiusKm ? 'tiny active' : 'tiny'}>{radius} km</button>)}</div>
      </section>

      <section className="results-section">
        <div className="results-heading"><div><p className="kicker">{coords ? `${coords.lat}, ${coords.lon}` : submittedLocation}</p><h2>{t.resultsTitle}</h2></div><span className="result-count">{isLoading ? t.searching : `${places.length} ${t.ideas}`}</span></div>
        <div className="notice" role={status === 'error' ? 'alert' : 'status'}>{status === 'error' ? <Umbrella size={18} /> : <Compass size={18} />}<span>{notice}</span></div>
        {isLoading && <div className="state-card"><Loader2 className="spin" size={28} /><h3>{t.loadingTitle}</h3><p>{t.loadingBody}</p></div>}
        {status === 'empty' && <div className="state-card"><Telescope size={28} /><h3>{t.emptyTitle}</h3><p>{t.emptyBody}</p></div>}
        {!isLoading && places.length > 0 && <div className="cards-grid">{places.map((place, index) => {
          const cat = CATEGORIES.find((item) => item.id === place.category);
          return <article className="place-card" key={place.id}><div className="image-panel"><span className="floating-rank">#{index + 1}</span><span className="floating-score">{place.score}</span><div className={`category-illustration ${place.category}`}>{cat?.emoji || '✨'}</div></div><div className="place-body"><div className="card-topline"><span className="category-tag">{cat?.labels[lang] || place.categoryLabel}</span>{place.rainyDay && <span className="rain-tag">{t.rainy}</span>}</div><h3>{place.name}</h3><p className="summary">{CATEGORY_SUMMARIES[lang][place.category] || CATEGORY_SUMMARIES.en[place.category]}</p><div className="meta-row"><MapPin size={16} /> {place.distanceLabel} · {place.address}</div><div className="tag-row">{place.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><div className="card-actions"><a href={getMapUrl(place)} target="_blank" rel="noreferrer">{t.map} <ExternalLink size={15} /></a><a href={getDirectionsUrl(place)} target="_blank" rel="noreferrer">{t.directions} <Navigation size={15} /></a></div></div></article>;
        })}</div>}
      </section>
    </main>
  );
}

export default App;
