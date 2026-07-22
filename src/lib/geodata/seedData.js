import { distanceMeters, withDistanceAndUrls } from './geo.js';
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
    { name: 'Brooklyn Children’s Museum', category: 'museum', lat: 40.6745, lon: -73.9442, familyTags: ['rainy-day', 'toilets'] },
    { name: 'Bronx Zoo', category: 'zoo', lat: 40.8506, lon: -73.8769, familyTags: ['toilets', 'stroller-friendly'] },
    { name: 'Bryant Park', category: 'park', lat: 40.7536, lon: -73.9832, familyTags: ['free', 'stroller-friendly'] },
    { name: 'Children’s Museum of Manhattan', category: 'museum', lat: 40.7859, lon: -73.9778, familyTags: ['rainy-day', 'toilets'] },
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
  paris: [
    { name: 'Jardin du Luxembourg', category: 'park', lat: 48.8462, lon: 2.3372, familyTags: ['playground', 'free', 'stroller-friendly'] },
    { name: 'Cité des Sciences et de l’Industrie', category: 'museum', lat: 48.8956, lon: 2.3879, familyTags: ['rainy-day', 'toilets'] },
    { name: 'Jardin d’Acclimatation', category: 'attraction', lat: 48.8781, lon: 2.2635, familyTags: ['playground', 'toilets'] },
    { name: 'Aquarium de Paris', category: 'aquarium', lat: 48.8629, lon: 2.2873, familyTags: ['rainy-day', 'toilets'] },
    { name: 'Parc des Buttes-Chaumont', category: 'park', lat: 48.8809, lon: 2.3829, familyTags: ['free', 'playground'] },
    { name: 'Musée en Herbe', category: 'museum', lat: 48.8625, lon: 2.3426, familyTags: ['rainy-day'] },
  ],
  rome: [
    { name: 'Villa Borghese Gardens', category: 'park', lat: 41.9142, lon: 12.4922, familyTags: ['free', 'stroller-friendly', 'playground'] },
    { name: 'Explora Children’s Museum Rome', category: 'museum', lat: 41.9125, lon: 12.4766, familyTags: ['rainy-day', 'toilets'] },
    { name: 'Bioparco di Roma', category: 'zoo', lat: 41.9175, lon: 12.4861, familyTags: ['toilets', 'stroller-friendly'] },
    { name: 'Time Elevator Rome', category: 'indoor', lat: 41.8985, lon: 12.4828, familyTags: ['rainy-day'] },
    { name: 'Parco degli Acquedotti', category: 'park', lat: 41.8509, lon: 12.5612, familyTags: ['free', 'outdoor seating'] },
  ],
  barcelona: [
    { name: 'Parc Güell', category: 'park', lat: 41.4145, lon: 2.1527, familyTags: ['stroller-friendly', 'outdoor seating'] },
    { name: 'CosmoCaixa Barcelona', category: 'museum', lat: 41.4136, lon: 2.1313, familyTags: ['rainy-day', 'toilets'] },
    { name: 'Barcelona Aquarium', category: 'aquarium', lat: 41.3769, lon: 2.1842, familyTags: ['rainy-day', 'toilets'] },
    { name: 'Parc de la Ciutadella', category: 'park', lat: 41.3881, lon: 2.1876, familyTags: ['free', 'playground'] },
    { name: 'Tibidabo Amusement Park', category: 'attraction', lat: 41.4217, lon: 2.1193, familyTags: ['toilets'] },
  ],
  dubai: [
    { name: 'Dubai Aquarium & Underwater Zoo', category: 'aquarium', lat: 25.1974, lon: 55.2790, familyTags: ['rainy-day', 'toilets', 'stroller-friendly'] },
    { name: 'OliOli Children’s Museum', category: 'museum', lat: 25.1667, lon: 55.2464, familyTags: ['rainy-day', 'toilets'] },
    { name: 'Kite Beach Play Area', category: 'playground', lat: 25.1612, lon: 55.2098, familyTags: ['playground', 'outdoor seating'] },
    { name: 'The Green Planet Dubai', category: 'indoor', lat: 25.2075, lon: 55.2608, familyTags: ['rainy-day', 'toilets'] },
    { name: 'Zabeel Park', category: 'park', lat: 25.2354, lon: 55.3003, familyTags: ['playground', 'stroller-friendly'] },
  ],
  tokyo: [
    { name: 'Ueno Zoo', category: 'zoo', lat: 35.7164, lon: 139.7713, familyTags: ['toilets', 'stroller-friendly'] },
    { name: 'Tokyo Toy Museum', category: 'museum', lat: 35.6897, lon: 139.7211, familyTags: ['rainy-day'] },
    { name: 'Shinjuku Gyoen National Garden', category: 'park', lat: 35.6852, lon: 139.7100, familyTags: ['stroller-friendly'] },
    { name: 'Sumida Aquarium', category: 'aquarium', lat: 35.7101, lon: 139.8107, familyTags: ['rainy-day', 'toilets'] },
    { name: 'KidZania Tokyo', category: 'indoor', lat: 35.6556, lon: 139.7929, familyTags: ['rainy-day', 'toilets'] },
  ],
  singapore: [
    { name: 'Gardens by the Bay Children’s Garden', category: 'playground', lat: 1.2816, lon: 103.8636, familyTags: ['playground', 'free', 'stroller-friendly'] },
    { name: 'Singapore Zoo', category: 'zoo', lat: 1.4043, lon: 103.7930, familyTags: ['toilets', 'stroller-friendly'] },
    { name: 'ArtScience Museum', category: 'museum', lat: 1.2863, lon: 103.8593, familyTags: ['rainy-day', 'toilets'] },
    { name: 'S.E.A. Aquarium Singapore', category: 'aquarium', lat: 1.2588, lon: 103.8205, familyTags: ['rainy-day', 'toilets'] },
    { name: 'Jacob Ballas Children’s Garden', category: 'park', lat: 1.3239, lon: 103.8160, familyTags: ['playground', 'free'] },
  ],
  'los-angeles': [
    { name: 'Griffith Park', category: 'park', lat: 34.1366, lon: -118.2942, familyTags: ['free', 'stroller-friendly', 'playground'] },
    { name: 'Natural History Museum of Los Angeles County', category: 'museum', lat: 34.0169, lon: -118.2888, familyTags: ['rainy-day', 'toilets'] },
    { name: 'California Science Center', category: 'museum', lat: 34.0162, lon: -118.2864, familyTags: ['rainy-day', 'toilets', 'free'] },
    { name: 'Santa Monica Pier', category: 'attraction', lat: 34.0094, lon: -118.4973, familyTags: ['playground', 'toilets', 'outdoor seating'] },
    { name: 'Los Angeles Zoo', category: 'zoo', lat: 34.1480, lon: -118.2849, familyTags: ['toilets', 'stroller-friendly'] },
  ],
  chicago: [
    { name: 'Maggie Daley Park', category: 'playground', lat: 41.8827, lon: -87.6194, familyTags: ['playground', 'free', 'toilets'] },
    { name: 'Lincoln Park Zoo', category: 'zoo', lat: 41.9211, lon: -87.6339, familyTags: ['free', 'stroller-friendly', 'toilets'] },
    { name: 'Field Museum', category: 'museum', lat: 41.8663, lon: -87.6170, familyTags: ['rainy-day', 'toilets'] },
    { name: 'Shedd Aquarium', category: 'aquarium', lat: 41.8676, lon: -87.6136, familyTags: ['rainy-day', 'toilets'] },
    { name: 'Navy Pier', category: 'attraction', lat: 41.8917, lon: -87.6078, familyTags: ['toilets', 'outdoor seating'] },
  ],
  miami: [
    { name: 'Miami Children’s Museum', category: 'museum', lat: 25.7849, lon: -80.1764, familyTags: ['rainy-day', 'toilets'] },
    { name: 'Phillip and Patricia Frost Museum of Science', category: 'museum', lat: 25.7850, lon: -80.1870, familyTags: ['rainy-day', 'toilets'] },
    { name: 'Zoo Miami', category: 'zoo', lat: 25.6110, lon: -80.3984, familyTags: ['stroller-friendly', 'toilets'] },
    { name: 'Bayfront Park', category: 'park', lat: 25.7752, lon: -80.1860, familyTags: ['free', 'stroller-friendly'] },
    { name: 'Jungle Island', category: 'attraction', lat: 25.7866, lon: -80.1747, familyTags: ['toilets'] },
  ],
  'san-francisco': [
    { name: 'California Academy of Sciences', category: 'museum', lat: 37.7699, lon: -122.4661, familyTags: ['rainy-day', 'toilets'] },
    { name: 'Exploratorium', category: 'museum', lat: 37.8014, lon: -122.3976, familyTags: ['rainy-day', 'toilets'] },
    { name: 'Golden Gate Park Koret Children’s Quarter', category: 'playground', lat: 37.7682, lon: -122.4577, familyTags: ['playground', 'free'] },
    { name: 'San Francisco Zoo', category: 'zoo', lat: 37.7331, lon: -122.5030, familyTags: ['toilets', 'stroller-friendly'] },
    { name: 'Crissy Field', category: 'park', lat: 37.8036, lon: -122.4650, familyTags: ['free', 'stroller-friendly', 'outdoor seating'] },
  ],
  orlando: [
    { name: 'Lake Eola Park', category: 'park', lat: 28.5436, lon: -81.3738, familyTags: ['free', 'stroller-friendly'] },
    { name: 'Orlando Science Center', category: 'museum', lat: 28.5723, lon: -81.3689, familyTags: ['rainy-day', 'toilets'] },
    { name: 'Crayola Experience Orlando', category: 'indoor', lat: 28.4451, lon: -81.3955, familyTags: ['rainy-day', 'toilets'] },
    { name: 'Gatorland', category: 'attraction', lat: 28.3553, lon: -81.4039, familyTags: ['toilets', 'stroller-friendly'] },
    { name: 'Harry P. Leu Gardens', category: 'park', lat: 28.5680, lon: -81.3550, familyTags: ['stroller-friendly', 'outdoor seating'] },
  ],
  boston: [
    { name: 'Boston Children’s Museum', category: 'museum', lat: 42.3518, lon: -71.0496, familyTags: ['rainy-day', 'toilets'] },
    { name: 'Museum of Science', category: 'museum', lat: 42.3677, lon: -71.0710, familyTags: ['rainy-day', 'toilets'] },
    { name: 'Boston Common Frog Pond', category: 'playground', lat: 42.3551, lon: -71.0656, familyTags: ['playground', 'free'] },
    { name: 'Franklin Park Zoo', category: 'zoo', lat: 42.3032, lon: -71.0869, familyTags: ['toilets', 'stroller-friendly'] },
    { name: 'New England Aquarium', category: 'aquarium', lat: 42.3592, lon: -71.0497, familyTags: ['rainy-day', 'toilets'] },
  ],
  'washington-dc': [
    { name: 'National Air and Space Museum', category: 'museum', lat: 38.8882, lon: -77.0199, familyTags: ['rainy-day', 'free', 'toilets'] },
    { name: 'National Museum of Natural History', category: 'museum', lat: 38.8913, lon: -77.0261, familyTags: ['rainy-day', 'free', 'toilets'] },
    { name: 'Smithsonian National Zoo', category: 'zoo', lat: 38.9305, lon: -77.0559, familyTags: ['free', 'stroller-friendly', 'toilets'] },
    { name: 'National Mall', category: 'park', lat: 38.8896, lon: -77.0230, familyTags: ['free', 'stroller-friendly'] },
    { name: 'Yards Park', category: 'park', lat: 38.8736, lon: -77.0005, familyTags: ['playground', 'free', 'outdoor seating'] },
  ],
  seattle: [
    { name: 'Seattle Children’s Museum', category: 'museum', lat: 47.6226, lon: -122.3515, familyTags: ['rainy-day', 'toilets'] },
    { name: 'Pacific Science Center', category: 'museum', lat: 47.6198, lon: -122.3517, familyTags: ['rainy-day', 'toilets'] },
    { name: 'Woodland Park Zoo', category: 'zoo', lat: 47.6685, lon: -122.3506, familyTags: ['toilets', 'stroller-friendly'] },
    { name: 'Seattle Aquarium', category: 'aquarium', lat: 47.6074, lon: -122.3429, familyTags: ['rainy-day', 'toilets'] },
    { name: 'Gas Works Park', category: 'park', lat: 47.6456, lon: -122.3344, familyTags: ['free', 'stroller-friendly'] },
  ],
  austin: [
    { name: 'Thinkery', category: 'museum', lat: 30.2975, lon: -97.7043, familyTags: ['rainy-day', 'toilets'] },
    { name: 'Zilker Metropolitan Park', category: 'park', lat: 30.2669, lon: -97.7729, familyTags: ['playground', 'free', 'stroller-friendly'] },
    { name: 'Austin Nature & Science Center', category: 'museum', lat: 30.2722, lon: -97.7734, familyTags: ['free', 'toilets'] },
    { name: 'Pease District Park', category: 'park', lat: 30.2819, lon: -97.7524, familyTags: ['playground', 'free'] },
    { name: 'Bullock Texas State History Museum', category: 'museum', lat: 30.2803, lon: -97.7390, familyTags: ['rainy-day', 'toilets'] },
  ],
  amsterdam: [
    { name: 'NEMO Science Museum', category: 'museum', lat: 52.3742, lon: 4.9123, familyTags: ['rainy-day', 'toilets'] },
    { name: 'Vondelpark', category: 'park', lat: 52.3579, lon: 4.8686, familyTags: ['playground', 'free', 'stroller-friendly'] },
    { name: 'ARTIS Amsterdam Royal Zoo', category: 'zoo', lat: 52.3663, lon: 4.9155, familyTags: ['toilets', 'stroller-friendly'] },
    { name: 'TunFun Amsterdam', category: 'indoor', lat: 52.3680, lon: 4.9040, familyTags: ['rainy-day', 'playground'] },
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
  'Brooklyn Children’s Museum': { googleRating: 4.5, googleReviewCount: 5200 },
  'Bronx Zoo': { googleRating: 4.6, googleReviewCount: 36000 },
  'Bryant Park': { googleRating: 4.7, googleReviewCount: 92000 },
  'Children’s Museum of Manhattan': { googleRating: 4.4, googleReviewCount: 3900 },
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
    { name: `${city} family park`, category: 'park', lat: base.lat + 0.006, lon: base.lon + 0.006, familyTags: ['free', 'stroller-friendly'] },
    { name: `${city} playground`, category: 'playground', lat: base.lat - 0.005, lon: base.lon + 0.004, familyTags: ['playground', 'free'] },
    { name: `${city} children’s museum / indoor`, category: 'museum', lat: base.lat + 0.004, lon: base.lon - 0.006, familyTags: ['rainy-day', 'toilets'] },
    { name: `${city} family café`, category: 'family-cafe', lat: base.lat - 0.004, lon: base.lon - 0.004, familyTags: ['rainy-day', 'high chairs'] },
    { name: `${city} science centre`, category: 'museum', lat: base.lat + 0.011, lon: base.lon + 0.002, familyTags: ['rainy-day', 'toilets'] },
    { name: `${city} aquarium / animal experience`, category: 'aquarium', lat: base.lat - 0.010, lon: base.lon + 0.009, familyTags: ['rainy-day', 'toilets'] },
    { name: `${city} stroller-friendly garden`, category: 'park', lat: base.lat + 0.014, lon: base.lon - 0.010, familyTags: ['stroller-friendly', 'free'] },
    { name: `${city} active kids attraction`, category: 'attraction', lat: base.lat - 0.012, lon: base.lon - 0.012, familyTags: ['playground', 'toilets'] },
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

export function fallbackCityForCoords(coords = {}) {
  const lat = Number(coords.lat);
  const lon = Number(coords.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return 'istanbul';

  return Object.entries(SEEDS)
    .map(([city, places]) => {
      const center = places.reduce((acc, place) => ({ lat: acc.lat + place.lat, lon: acc.lon + place.lon }), { lat: 0, lon: 0 });
      center.lat /= places.length;
      center.lon /= places.length;
      return { city, distanceM: distanceMeters(lat, lon, center.lat, center.lon) };
    })
    .sort((a, b) => a.distanceM - b.distanceM)[0]?.city || 'istanbul';
}

export function getFallbackPlaces(city = 'istanbul', originOrFilters = {}, maybeFilters = {}) {
  const origin = originOrFilters?.lat ? originOrFilters : originOrFilters?.origin;
  const filters = originOrFilters?.lat || arguments.length >= 3 ? maybeFilters : originOrFilters;
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

