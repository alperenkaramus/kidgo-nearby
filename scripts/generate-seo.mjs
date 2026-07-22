import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const ROOT = new URL('../', import.meta.url).pathname;
const PUBLIC = join(ROOT, 'public');
const SITE = 'https://kidgonearby.com';
const LASTMOD = process.env.SEO_LASTMOD || '2026-07-22';

const locales = {
  en: {
    label: 'English', languageHeading: 'Language', hub: 'things-to-do-with-kids', app: 'Open KidGo Nearby', finder: 'Family place finder',
    eyebrow: 'Practical family city guide', guide: 'Things to Do with Kids',
    intro: ({ display }) => `Plan a realistic family day in ${display}: compare outdoor stops, hands-on learning, indoor backups and low-cost ideas without building an exhausting itinerary.`,
    choose: ({ display }) => `How to choose a family activity in ${display}`,
    tips: ['Match the plan to your child’s age, energy and nap routine.', 'Choose one main stop and one nearby backup.', 'Check current opening hours, tickets, weather, toilets and stroller access.', 'Use recent official information and map reviews before leaving.'],
    note: 'KidGo Nearby is a planning aid, not a safety or availability guarantee. Verify current details with the venue.',
    faqTitle: 'Frequently asked questions', related: 'Explore another family plan',
    faq: ({ display }) => [
      [`What can families do with kids in ${display}?`, `Start with parks, playgrounds, hands-on museums, libraries, aquariums and short attractions that fit the child’s age and energy.`],
      [`How should I plan a day with kids in ${display}?`, 'Pick one main activity, keep travel short, and save one indoor or low-cost alternative nearby.'],
      [`Are these details always current?`, 'No. Opening hours, prices, access and local conditions change. Check the venue and recent sources before going.'],
    ],
  },
  tr: {
    label: 'Türkçe', languageHeading: 'Dil', hub: 'cocukla-gezilecek-yerler', app: 'KidGo Nearby’de aç', finder: 'Aile aktivitesi bul',
    eyebrow: 'Pratik aile şehir rehberi', guide: 'Çocukla Gezilecek Yerler',
    intro: ({ contextual }) => `${contextual} çocukla gerçekçi bir gün planla: yorucu bir liste yerine açık hava, öğrenme, kapalı alan yedeği ve düşük bütçeli seçenekleri karşılaştır.`,
    choose: ({ contextual }) => `${contextual} çocukla aktivite seçerken`,
    tips: ['Planı çocuğun yaşına, enerjisine ve uyku düzenine göre seç.', 'Bir ana durak ve yakında bir yedek plan belirle.', 'Güncel saat, bilet, hava, tuvalet ve bebek arabası erişimini kontrol et.', 'Çıkmadan önce resmî bilgileri ve yakın tarihli harita yorumlarını incele.'],
    note: 'KidGo Nearby bir planlama yardımcısıdır; güvenlik veya müsaitlik garantisi değildir. Güncel bilgileri işletmeden doğrula.',
    faqTitle: 'Sık sorulan sorular', related: 'Başka bir aile planına bak',
    faq: ({ contextual }) => [
      [`${contextual} çocukla ne yapılır?`, 'Park, oyun alanı, uygulamalı müze, kütüphane, akvaryum ve yaşa uygun kısa etkinliklerle başla.'],
      [`${contextual} çocukla bir gün nasıl planlanır?`, 'Bir ana etkinlik seç, ulaşımı kısa tut ve yakında bir kapalı alan veya düşük bütçeli yedek belirle.'],
      ['Bu bilgiler her zaman güncel mi?', 'Hayır. Saatler, fiyatlar, erişim ve yerel koşullar değişebilir. Gitmeden işletmeyi ve güncel kaynakları kontrol et.'],
    ],
  },
  ru: {
    label: 'Русский', languageHeading: 'Язык', hub: 'ru/kuda-poiti-s-detmi', app: 'Открыть KidGo Nearby', finder: 'Найти семейные места',
    eyebrow: 'Практичный семейный путеводитель', guide: 'Куда пойти с детьми',
    intro: ({ contextual }) => `Спланируйте удобный день с детьми в ${contextual}: сравните прогулки, познавательные места, варианты в помещении и бесплатные идеи без перегруженного маршрута.`,
    choose: ({ contextual }) => `Как выбрать занятие с детьми в ${contextual}`,
    tips: ['Учитывайте возраст ребёнка, уровень энергии и дневной сон.', 'Выберите одно главное место и один запасной вариант поблизости.', 'Проверьте часы работы, билеты, погоду, туалеты и доступ с коляской.', 'Перед выходом сверьтесь с официальным сайтом и свежими отзывами.'],
    note: 'KidGo Nearby помогает планировать, но не гарантирует безопасность или доступность. Уточняйте актуальные сведения у площадки.',
    faqTitle: 'Частые вопросы', related: 'Другие семейные планы',
    faq: ({ contextual }) => [
      [`Куда сходить с детьми в ${contextual}?`, 'Начните с парков, игровых площадок, интерактивных музеев, библиотек, аквариумов и недолгих занятий по возрасту.'],
      [`Как спланировать день с ребёнком в ${contextual}?`, 'Выберите одно главное занятие, сократите переезды и сохраните крытый или бесплатный запасной вариант поблизости.'],
      ['Всегда ли информация актуальна?', 'Нет. Часы работы, цены и условия меняются. Перед поездкой проверьте официальный источник и свежие данные.'],
    ],
  },
  de: {
    label: 'Deutsch', languageHeading: 'Sprache', hub: 'de/aktivitaeten-mit-kindern', app: 'KidGo Nearby öffnen', finder: 'Familienorte finden',
    eyebrow: 'Praktischer Familien-Stadtführer', guide: 'Aktivitäten mit Kindern',
    intro: ({ display }) => `Plane einen entspannten Familientag in ${display}: Vergleiche Ausflüge im Freien, Lernorte, Indoor-Alternativen und kostenlose Ideen, ohne den Tag zu überladen.`,
    choose: ({ display }) => `So wählst du eine Familienaktivität in ${display}`,
    tips: ['Stimme den Plan auf Alter, Energie und Schlafrhythmus des Kindes ab.', 'Wähle ein Hauptziel und eine Alternative in der Nähe.', 'Prüfe Öffnungszeiten, Tickets, Wetter, Toiletten und Kinderwagen-Zugang.', 'Nutze vor dem Start offizielle Angaben und aktuelle Bewertungen.'],
    note: 'KidGo Nearby ist eine Planungshilfe und keine Sicherheits- oder Verfügbarkeitsgarantie. Prüfe aktuelle Angaben direkt beim Anbieter.',
    faqTitle: 'Häufige Fragen', related: 'Weitere Familienpläne',
    faq: ({ display }) => [
      [`Was kann man mit Kindern in ${display} unternehmen?`, 'Beginne mit Parks, Spielplätzen, Mitmachmuseen, Bibliotheken, Aquarien und kurzen altersgerechten Ausflügen.'],
      [`Wie plane ich einen Tag mit Kindern in ${display}?`, 'Wähle eine Hauptaktivität, halte Wege kurz und merke dir eine Indoor- oder kostenlose Alternative in der Nähe.'],
      ['Sind alle Angaben immer aktuell?', 'Nein. Öffnungszeiten, Preise und Bedingungen ändern sich. Prüfe vor dem Besuch offizielle und aktuelle Quellen.'],
    ],
  },
};

const intents = {
  general: {
    routes: { en: 'things-to-do-with-kids', tr: 'cocukla-gezilecek-yerler', ru: 'ru/kuda-poiti-s-detmi', de: 'de/aktivitaeten-mit-kindern' },
    names: { en: 'Things to Do with Kids', tr: 'Çocukla Gezilecek Yerler', ru: 'Куда пойти с детьми', de: 'Aktivitäten mit Kindern' },
    focus: {
      en: 'Mix active play, culture and an easy food or rest stop.', tr: 'Aktif oyun, kültür ve kolay bir yemek veya mola durağını birleştir.',
      ru: 'Сочетайте активную игру, познавательное место и удобную паузу на еду.', de: 'Verbinde Bewegung, Kultur und eine unkomplizierte Essens- oder Ruhepause.',
    },
  },
  indoor: {
    routes: { en: 'indoor-activities-with-kids', tr: 'kapali-alan-cocuk-aktiviteleri', ru: 'ru/krytye-razvlecheniya-dlya-detei', de: 'de/indoor-aktivitaeten-mit-kindern' },
    names: { en: 'Indoor Activities with Kids', tr: 'Kapalı Alan Çocuk Aktiviteleri', ru: 'Крытые развлечения для детей', de: 'Indoor-Aktivitäten mit Kindern' },
    focus: {
      en: 'Prioritize museums, science centres, aquariums, libraries and covered play.', tr: 'Müze, bilim merkezi, akvaryum, kütüphane ve kapalı oyun alanlarını öne al.',
      ru: 'Выбирайте музеи, научные центры, аквариумы, библиотеки и крытые игровые пространства.', de: 'Setze auf Museen, Science Center, Aquarien, Bibliotheken und überdachte Spielorte.',
    },
  },
  rainy: {
    routes: { en: 'rainy-day-activities-with-kids', tr: 'yagmurlu-havada-cocukla-ne-yapilir', ru: 'ru/kuda-poiti-s-rebenkom-v-dozhd', de: 'de/aktivitaeten-bei-regen-mit-kindern' },
    names: { en: 'Rainy-Day Activities with Kids', tr: 'Yağmurlu Havada Çocukla Ne Yapılır', ru: 'Куда пойти с ребёнком в дождь', de: 'Aktivitäten bei Regen mit Kindern' },
    focus: {
      en: 'Keep transfers short and choose bookable indoor options with a nearby meal stop.', tr: 'Ulaşımı kısa tut; rezervasyon yapılabilen kapalı alanı yakındaki yemek molasıyla eşleştir.',
      ru: 'Сократите переезды и выберите крытое место с бронированием и кафе поблизости.', de: 'Halte Wege kurz und kombiniere buchbare Indoor-Ziele mit einer Essenspause in der Nähe.',
    },
  },
  free: {
    routes: { en: 'free-things-to-do-with-kids', tr: 'ucretsiz-cocukla-gezilecek-yerler', ru: 'ru/besplatno-s-detmi', de: 'de/kostenlose-aktivitaeten-mit-kindern' },
    names: { en: 'Free Things to Do with Kids', tr: 'Ücretsiz Çocukla Gezilecek Yerler', ru: 'Бесплатно с детьми', de: 'Kostenlose Aktivitäten mit Kindern' },
    focus: {
      en: 'Start with parks, playgrounds, libraries, public gardens and verified free museum times.', tr: 'Park, oyun alanı, kütüphane, kamusal bahçe ve doğrulanmış ücretsiz müze saatleriyle başla.',
      ru: 'Начните с парков, площадок, библиотек, общественных садов и подтверждённых бесплатных часов музеев.', de: 'Beginne mit Parks, Spielplätzen, Bibliotheken, öffentlichen Gärten und bestätigten Gratiszeiten von Museen.',
    },
  },
};

const cityName = (display, contextual = display) => ({ display, contextual });

const cities = [
  ['new-york', { en: cityName('New York'), tr: cityName('New York', "New York'ta"), ru: cityName('Нью-Йорк', 'Нью-Йорке'), de: cityName('New York') }, { en: 'United States', tr: 'Amerika Birleşik Devletleri', ru: 'США', de: 'USA' }],
  ['london', { en: cityName('London'), tr: cityName('Londra', "Londra'da"), ru: cityName('Лондон', 'Лондоне'), de: cityName('London') }, { en: 'United Kingdom', tr: 'Birleşik Krallık', ru: 'Великобритания', de: 'Vereinigtes Königreich' }],
  ['paris', { en: cityName('Paris'), tr: cityName('Paris', "Paris'te"), ru: cityName('Париж', 'Париже'), de: cityName('Paris') }, { en: 'France', tr: 'Fransa', ru: 'Франция', de: 'Frankreich' }],
  ['berlin', { en: cityName('Berlin'), tr: cityName('Berlin', "Berlin'de"), ru: cityName('Берлин', 'Берлине'), de: cityName('Berlin') }, { en: 'Germany', tr: 'Almanya', ru: 'Германия', de: 'Deutschland' }],
  ['dubai', { en: cityName('Dubai'), tr: cityName('Dubai', "Dubai'de"), ru: cityName('Дубай', 'Дубае'), de: cityName('Dubai') }, { en: 'United Arab Emirates', tr: 'Birleşik Arap Emirlikleri', ru: 'ОАЭ', de: 'Vereinigte Arabische Emirate' }],
  ['istanbul', { en: cityName('Istanbul'), tr: cityName('İstanbul', "İstanbul'da"), ru: cityName('Стамбул', 'Стамбуле'), de: cityName('Istanbul') }, { en: 'Türkiye', tr: 'Türkiye', ru: 'Турция', de: 'Türkei' }],
  ['barcelona', { en: cityName('Barcelona'), tr: cityName('Barselona', "Barselona'da"), ru: cityName('Барселона', 'Барселоне'), de: cityName('Barcelona') }, { en: 'Spain', tr: 'İspanya', ru: 'Испания', de: 'Spanien' }],
  ['rome', { en: cityName('Rome'), tr: cityName('Roma', "Roma'da"), ru: cityName('Рим', 'Риме'), de: cityName('Rom') }, { en: 'Italy', tr: 'İtalya', ru: 'Италия', de: 'Italien' }],
  ['amsterdam', { en: cityName('Amsterdam'), tr: cityName('Amsterdam', "Amsterdam'da"), ru: cityName('Амстердам', 'Амстердаме'), de: cityName('Amsterdam') }, { en: 'Netherlands', tr: 'Hollanda', ru: 'Нидерланды', de: 'Niederlande' }],
  ['singapore', { en: cityName('Singapore'), tr: cityName('Singapur', "Singapur'da"), ru: cityName('Сингапур', 'Сингапуре'), de: cityName('Singapur') }, { en: 'Singapore', tr: 'Singapur', ru: 'Сингапур', de: 'Singapur' }],
  ['tokyo', { en: cityName('Tokyo'), tr: cityName('Tokyo', "Tokyo'da"), ru: cityName('Токио'), de: cityName('Tokio') }, { en: 'Japan', tr: 'Japonya', ru: 'Япония', de: 'Japan' }],
  ['munich', { en: cityName('Munich'), tr: cityName('Münih', "Münih'te"), ru: cityName('Мюнхен', 'Мюнхене'), de: cityName('München') }, { en: 'Germany', tr: 'Almanya', ru: 'Германия', de: 'Deutschland' }],
];

const cityInsights = {
  'new-york': {
    en: 'Use neighborhood clusters to avoid long cross-city transfers; Central Park, museum areas and waterfront routes work best as separate plans.',
    tr: 'Uzun şehir geçişlerinden kaçınmak için mahalle kümeleriyle plan yap; Central Park, müze bölgeleri ve sahil rotalarını ayrı günlere böl.',
    ru: 'Планируйте по районам, чтобы не тратить день на переезды; Центральный парк, музейные кварталы и набережные лучше разделить.',
    de: 'Plane nach Vierteln, um lange Wege zu vermeiden; Central Park, Museumsviertel und Uferziele funktionieren besser als getrennte Pläne.',
  },
  london: {
    en: 'Free museums, large parks and strong public transport make it easy to pair one booked attraction with a flexible backup.',
    tr: 'Ücretsiz müzeler, büyük parklar ve güçlü toplu taşıma sayesinde rezervasyonlu bir durağı esnek bir yedekle eşleştirmek kolaydır.',
    ru: 'Бесплатные музеи, большие парки и удобный транспорт позволяют сочетать одно забронированное место с гибким запасным планом.',
    de: 'Kostenlose Museen, große Parks und guter Nahverkehr verbinden ein gebuchtes Ziel leicht mit einem flexiblen Ersatzplan.',
  },
  paris: {
    en: 'Balance major museums with gardens, carousels and short food breaks; children usually enjoy a slower neighborhood-scale route.',
    tr: 'Büyük müzeleri bahçe, atlıkarınca ve kısa yemek molalarıyla dengele; çocuklarla mahalle ölçeğinde yavaş rota daha iyi işler.',
    ru: 'Чередуйте крупные музеи с садами, каруселями и короткими паузами на еду; с детьми удобнее маршрут в одном районе.',
    de: 'Kombiniere große Museen mit Gärten, Karussells und kurzen Essenspausen; mit Kindern ist eine Route in einem Viertel meist entspannter.',
  },
  berlin: {
    en: 'Wide parks, interactive museums and family-friendly transit favor spacious plans with one indoor weather backup.',
    tr: 'Geniş parklar, etkileşimli müzeler ve aile dostu ulaşım; yanında tek bir kapalı hava yedeği olan ferah planları destekler.',
    ru: 'Большие парки, интерактивные музеи и удобный транспорт подходят для свободного плана с одним крытым запасным вариантом.',
    de: 'Große Parks, interaktive Museen und familienfreundlicher Nahverkehr eignen sich für lockere Pläne mit einer Indoor-Alternative.',
  },
  dubai: {
    en: 'Heat changes the route: use indoor attractions during the hottest hours and keep outdoor waterfront or park time for cooler periods.',
    tr: 'Sıcak rotayı belirler: en sıcak saatlerde kapalı alanları, serin zamanlarda sahil veya park planını kullan.',
    ru: 'Жара определяет маршрут: в самые жаркие часы выбирайте крытые места, а набережные и парки оставляйте на прохладное время.',
    de: 'Die Hitze bestimmt den Tagesplan: Indoor-Ziele für heiße Stunden, Ufer und Parks für kühlere Zeiten.',
  },
  istanbul: {
    en: 'Traffic, hills and ferry crossings matter more than distance; plan one side of the city and confirm stroller access before leaving.',
    tr: 'Trafik, yokuş ve vapur geçişi kilometreden daha önemlidir; şehrin tek yakasında plan yap ve bebek arabası erişimini doğrula.',
    ru: 'Пробки, холмы и паромные переправы важнее расстояния; планируйте одну часть города и заранее проверяйте доступ с коляской.',
    de: 'Verkehr, Hügel und Fähren zählen mehr als Kilometer; plane auf einer Stadtseite und prüfe den Zugang mit Kinderwagen.',
  },
  barcelona: {
    en: 'Combine shaded parks or beach time with one architecture or science stop, and avoid the strongest midday heat in summer.',
    tr: 'Gölgeli park veya sahil zamanını bir mimari ya da bilim durağıyla birleştir; yazın öğle sıcağından kaçın.',
    ru: 'Сочетайте тенистый парк или пляж с одним архитектурным или научным местом и избегайте полуденной жары летом.',
    de: 'Verbinde schattige Parks oder Strandzeit mit einem Architektur- oder Wissenschaftsziel und meide im Sommer die Mittagshitze.',
  },
  rome: {
    en: 'Cobblestones, queues and heat reward short routes; pair one historic sight with a shaded square, park or gelato break.',
    tr: 'Arnavut kaldırımı, kuyruk ve sıcak kısa rotayı ödüllendirir; tek bir tarihî durağı gölgeli meydan, park veya dondurma molasıyla eşleştir.',
    ru: 'Брусчатка, очереди и жара требуют короткого маршрута; сочетайте одну достопримечательность с тенистой площадью, парком или мороженым.',
    de: 'Kopfsteinpflaster, Warteschlangen und Hitze sprechen für kurze Wege; kombiniere eine Sehenswürdigkeit mit Schatten, Park oder Gelato-Pause.',
  },
  amsterdam: {
    en: 'Trams, ferries and compact neighborhoods support low-transfer days; check bike traffic carefully when walking with young children.',
    tr: 'Tramvay, vapur ve kompakt mahalleler az aktarmalı gün sağlar; küçük çocuklarla yürürken bisiklet trafiğine dikkat et.',
    ru: 'Трамваи, паромы и компактные районы сокращают переезды; с маленькими детьми особенно следите за велосипедным движением.',
    de: 'Straßenbahnen, Fähren und kompakte Viertel ermöglichen kurze Wege; achte mit kleinen Kindern besonders auf den Radverkehr.',
  },
  singapore: {
    en: 'Reliable transit and many sheltered links make mixed indoor-outdoor plans practical; schedule shade and hydration around humidity.',
    tr: 'Güvenilir ulaşım ve kapalı geçişler karma iç-dış mekân planını kolaylaştırır; nem için gölge ve su molası planla.',
    ru: 'Надёжный транспорт и крытые переходы упрощают смешанный маршрут; из-за влажности заранее планируйте тень и воду.',
    de: 'Zuverlässiger Nahverkehr und viele überdachte Wege erleichtern Indoor-Outdoor-Pläne; bei hoher Luftfeuchte Schatten und Trinkpausen einplanen.',
  },
  tokyo: {
    en: 'Choose one rail corridor or district, allow time for stations, and use department stores or museums as weather and rest backups.',
    tr: 'Tek bir tren hattı veya bölge seç; istasyonlara zaman ayır ve mağaza ya da müzeleri hava ve mola yedeği olarak kullan.',
    ru: 'Выберите одну железнодорожную линию или район, заложите время на станции и используйте универмаги или музеи как запасной вариант.',
    de: 'Wähle eine Bahnlinie oder ein Viertel, plane Zeit für Bahnhöfe ein und nutze Kaufhäuser oder Museen als Wetter- und Pausenoption.',
  },
  munich: {
    en: 'Large parks, science museums and efficient transit make a strong one-major-stop day with an easy outdoor backup.',
    tr: 'Büyük parklar, bilim müzeleri ve verimli ulaşım; tek ana duraklı ve kolay açık hava yedekli planı güçlendirir.',
    ru: 'Большие парки, научные музеи и удобный транспорт подходят для дня с одним главным местом и простой прогулкой в запасе.',
    de: 'Große Parks, Wissenschaftsmuseen und guter Nahverkehr eignen sich für einen Hauptstopp mit einfacher Outdoor-Alternative.',
  },
};

const esc = (s) => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const json = (value) => JSON.stringify(value).replaceAll('<', '\\u003c');
const urlFor = (lang, intent, slug) => `${SITE}/${intents[intent].routes[lang]}/${slug}/`;
const titleFor = (lang, intent, city) => `${intents[intent].names[lang]} ${lang === 'en' ? `in ${city}` : lang === 'tr' ? city : lang === 'ru' ? `в ${city}` : `in ${city}`} | KidGo Nearby`;

function alternates(intent, slug) {
  const tags = Object.keys(locales).map((lang) => `<link rel="alternate" hreflang="${lang}" href="${urlFor(lang, intent, slug)}" />`);
  tags.push(`<link rel="alternate" hreflang="x-default" href="${urlFor('en', intent, slug)}" />`);
  return tags.join('');
}

function shell({ lang, title, description, canonical, alternateTags, body, schemas }) {
  return `<!doctype html>\n<html lang="${lang}"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /><title>${esc(title)}</title><meta name="description" content="${esc(description)}" /><meta name="robots" content="index,follow,max-image-preview:large" /><link rel="canonical" href="${canonical}" />${alternateTags}<link rel="icon" href="/favicon.svg" /><meta property="og:type" content="article" /><meta property="og:url" content="${canonical}" /><meta property="og:title" content="${esc(title)}" /><meta property="og:description" content="${esc(description)}" /><meta property="og:image" content="${SITE}/og-image.svg" /><meta property="og:site_name" content="KidGo Nearby" /><meta property="og:locale" content="${{ en: 'en_US', tr: 'tr_TR', ru: 'ru_RU', de: 'de_DE' }[lang]}" /><meta name="twitter:card" content="summary_large_image" /><style>${CSS}</style>${schemas.map((s) => `<script type="application/ld+json">${json(s)}</script>`).join('')}</head><body>${body}</body></html>\n`;
}

const CSS = `:root{--ink:#172033;--muted:#566277;--brand:#c2410c;--teal:#0f766e;--soft:#fff7ed;--line:#fed7aa}*{box-sizing:border-box}body{margin:0;font:16px/1.65 Inter,system-ui,sans-serif;color:var(--ink);background:linear-gradient(180deg,#fff7ed,#fff 36%)}a{color:var(--teal)}.wrap{max-width:1000px;margin:auto;padding:24px 18px 64px}.nav{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:24px}.brand{font-weight:900;color:var(--brand);text-decoration:none}.pill,.cta a{display:inline-block;border:1px solid var(--line);border-radius:999px;padding:10px 14px;text-decoration:none}.hero{background:#fff;border:1px solid var(--line);border-radius:24px;padding:clamp(24px,5vw,48px);box-shadow:0 18px 50px #9a341214}.eyebrow{font-weight:800;color:var(--brand);text-transform:uppercase;font-size:13px;letter-spacing:.08em}h1{font-size:clamp(32px,7vw,58px);line-height:1.05;margin:12px 0 18px}h2{margin-top:38px;line-height:1.2}.lead{font-size:19px;color:var(--muted);max-width:760px}.cta{display:flex;flex-wrap:wrap;gap:10px;margin:22px 0}.cta .primary{background:var(--brand);color:#fff;border-color:var(--brand)}.note{font-size:14px;color:var(--muted)}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px}.card{background:#fff;border:1px solid #e5e7eb;border-radius:18px;padding:18px}.checklist li{margin:9px 0}.langs,.related{display:flex;flex-wrap:wrap;gap:8px}.langs a,.related a{background:var(--soft);border-radius:999px;padding:6px 10px}footer{margin-top:46px;border-top:1px solid #e5e7eb;padding-top:20px;color:var(--muted)}`;

async function put(path, content) {
  const full = join(PUBLIC, path, 'index.html');
  await mkdir(dirname(full), { recursive: true });
  await writeFile(full, content);
}

const generated = [];
for (const [slug, names, country] of cities) {
  for (const [intentKey, intent] of Object.entries(intents)) {
    for (const [lang, l] of Object.entries(locales)) {
      const { display, contextual } = names[lang];
      const canonical = urlFor(lang, intentKey, slug);
      const title = titleFor(lang, intentKey, contextual);
      const description = `${intent.names[lang]} ${lang === 'en' ? `in ${display}` : lang === 'tr' ? contextual : lang === 'ru' ? `в ${contextual}` : `in ${contextual}`}. ${intent.focus[lang]}`;
      const cityContext = { display, contextual };
      const faq = l.faq(cityContext);
      const siblingLinks = Object.entries(intents).map(([key, item]) => `<a href="/${item.routes[lang]}/${slug}/">${esc(item.names[lang])}</a>`).join('');
      const langLinks = Object.keys(locales).map((code) => `<a hreflang="${code}" href="${urlFor(code, intentKey, slug)}">${locales[code].label}</a>`).join('');
      const body = `<div class="wrap"><nav class="nav"><a class="brand" href="/">KidGo Nearby</a><a class="pill" href="/">${esc(l.finder)}</a></nav><main><section class="hero"><div class="eyebrow">${esc(l.eyebrow)} · ${esc(country[lang])}</div><h1>${esc(title.replace(' | KidGo Nearby', ''))}</h1><p class="lead">${esc(l.intro(cityContext))} ${esc(cityInsights[slug][lang])} ${esc(intent.focus[lang])}</p><div class="cta"><a class="primary" href="/?city=${encodeURIComponent(names.en.display)}&lang=${lang}">${esc(l.app)}</a><a href="/${l.hub}/">${esc(l.guide)}</a></div><p class="note">${esc(l.note)}</p></section><h2>${esc(l.choose(cityContext))}</h2><ul class="checklist">${l.tips.map((x) => `<li>${esc(x)}</li>`).join('')}</ul><div class="grid"><article class="card"><h2>${esc(intent.names[lang])}</h2><p>${esc(intent.focus[lang])}</p></article><article class="card"><h2>${esc(l.related)}</h2><div class="related">${siblingLinks}</div></article></div><h2>${esc(l.faqTitle)}</h2>${faq.map(([q, a]) => `<section><h3>${esc(q)}</h3><p>${esc(a)}</p></section>`).join('')}<h2>${esc(l.languageHeading)}</h2><div class="langs">${langLinks}</div></main><footer>© KidGo Nearby · <a href="/">${esc(l.finder)}</a></footer></div>`;
      const schemas = [
        { '@context': 'https://schema.org', '@type': 'WebPage', name: title, description, url: canonical, inLanguage: lang, isPartOf: { '@id': `${SITE}/#website` } },
        { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
        { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'KidGo Nearby', item: `${SITE}/` }, { '@type': 'ListItem', position: 2, name: l.guide, item: `${SITE}/${l.hub}/` }, { '@type': 'ListItem', position: 3, name: display, item: canonical }] },
        { '@context': 'https://schema.org', '@type': 'ItemList', name: title, itemListElement: l.tips.slice(0, 3).map((name, i) => ({ '@type': 'ListItem', position: i + 1, name })) },
      ];
      await put(`${intent.routes[lang]}/${slug}`, shell({ lang, title, description, canonical, alternateTags: alternates(intentKey, slug), body, schemas }));
      generated.push({ canonical, lang, intent: intentKey, slug });
    }
  }
}

for (const [lang, l] of Object.entries(locales)) {
  const canonical = `${SITE}/${l.hub}/`;
  const title = `${l.guide} | KidGo Nearby`;
  const description = lang === 'en' ? 'Practical city guides for family activities, indoor backups, rainy days and free things to do with kids.' : lang === 'tr' ? 'Çocukla gezilecek yerler, kapalı alanlar, yağmurlu gün ve ücretsiz aile aktiviteleri için pratik şehir rehberleri.' : lang === 'ru' ? 'Практичные городские гиды: куда пойти с детьми, крытые места, планы на дождь и бесплатные занятия.' : 'Praktische Stadtführer für Familienaktivitäten, Indoor-Ziele, Regentage und kostenlose Unternehmungen mit Kindern.';
  const cards = cities.map(([slug, names]) => `<article class="card"><h2>${esc(names[lang].display)}</h2><p>${esc(cityInsights[slug][lang])}</p><a href="/${intents.general.routes[lang]}/${slug}/">${esc(l.guide)} →</a></article>`).join('');
  const hubAlternates = Object.entries(locales).map(([code, x]) => `<link rel="alternate" hreflang="${code}" href="${SITE}/${x.hub}/" />`).join('') + `<link rel="alternate" hreflang="x-default" href="${SITE}/${locales.en.hub}/" />`;
  const body = `<div class="wrap"><nav class="nav"><a class="brand" href="/">KidGo Nearby</a><a class="pill" href="/">${esc(l.finder)}</a></nav><main><section class="hero"><div class="eyebrow">${esc(l.eyebrow)}</div><h1>${esc(l.guide)}</h1><p class="lead">${esc(description)}</p><div class="cta"><a class="primary" href="/">${esc(l.app)}</a></div><p class="note">${esc(l.note)}</p></section><div class="grid">${cards}</div></main><footer>© KidGo Nearby</footer></div>`;
  const schemas = [{ '@context': 'https://schema.org', '@type': 'CollectionPage', name: title, description, url: canonical, inLanguage: lang }, { '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: cities.map(([slug, names], i) => ({ '@type': 'ListItem', position: i + 1, name: names[lang].display, url: urlFor(lang, 'general', slug) })) }];
  await put(l.hub, shell({ lang, title, description, canonical, alternateTags: hubAlternates, body, schemas }));
  generated.push({ canonical, lang, intent: 'hub', slug: '' });
}

// Remove the obsolete public/index.html: Vite uses the repository-root index.html.
await rm(join(PUBLIC, 'index.html'), { force: true });
await rm(join(PUBLIC, 'structured-data.json'), { force: true });

async function collectHtml(dir) {
  const { readdir } = await import('node:fs/promises');
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await collectHtml(full));
    else if (entry.name === 'index.html') out.push(full);
  }
  return out;
}

const urls = new Map([[`${SITE}/`, { loc: `${SITE}/`, lang: 'x-default' }]]);
for (const file of await collectHtml(PUBLIC)) {
  const html = await readFile(file, 'utf8');
  const match = html.match(/<link rel="canonical" href="([^"]+)"/);
  if (!match || !match[1].startsWith(`${SITE}/`)) continue;
  urls.set(match[1], { loc: match[1] });
}
const generatedByUrl = new Map(generated.map((x) => [x.canonical, x]));
const sitemapRows = [...urls.keys()].sort().map((loc) => {
  const item = generatedByUrl.get(loc);
  let alt = '';
  if (item?.intent === 'hub') {
    alt = Object.entries(locales).map(([lang, locale]) => `\n    <xhtml:link rel="alternate" hreflang="${lang}" href="${SITE}/${locale.hub}/" />`).join('') + `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/${locales.en.hub}/" />`;
  } else if (item?.slug) {
    alt = Object.keys(locales).map((lang) => `\n    <xhtml:link rel="alternate" hreflang="${lang}" href="${urlFor(lang, item.intent, item.slug)}" />`).join('') + `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${urlFor('en', item.intent, item.slug)}" />`;
  }
  return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${LASTMOD}</lastmod>${alt}\n  </url>`;
}).join('\n');
await writeFile(join(PUBLIC, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${sitemapRows}\n</urlset>\n`);
await writeFile(join(PUBLIC, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
await writeFile(join(PUBLIC, 'llms.txt'), `# KidGo Nearby\n\nKidGo Nearby is a multilingual family activity planner for finding kid-friendly places, indoor backups, rainy-day options and free ideas.\n\nPrimary URL: ${SITE}/\nSitemap: ${SITE}/sitemap.xml\nRobots: ${SITE}/robots.txt\nLanguages: English, Türkçe, Русский, Deutsch\n\n## Language hubs\n- English: ${SITE}/${locales.en.hub}/\n- Türkçe: ${SITE}/${locales.tr.hub}/\n- Русский: ${SITE}/${locales.ru.hub}/\n- Deutsch: ${SITE}/${locales.de.hub}/\n\n## Guidance\nKidGo Nearby is a planning aid. Families should verify current opening hours, prices, routes, age suitability and venue information before visiting.\n\nSuggested citation: KidGo Nearby — practical family activity and city guides. ${SITE}/\n`);
console.log(`Generated ${generated.length} localized pages; sitemap contains ${urls.size} canonical URLs.`);
