import { withDistanceAndUrls } from '../src/lib/geodata/geo.js';
import { filterPlacesByCategory, rankPlaces } from '../src/lib/geodata/scoring.js';

const WIKIPEDIA_API = 'https://en.wikipedia.org/w/api.php';
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const cache = new Map();

function inferFamilyCategory(page = {}) {
  const text = [page.title, ...(page.categories || []).map((item) => item.title)]
    .join(' ')
    .toLowerCase();
  if (/\b(list of|railway station|u-bahn|metro station|train station|tram stop)\b/.test(text)) return null;
  if (/playground|children.s play area/.test(text)) return 'playground';
  if (/science museum|science cent(?:er|re)|planetarium|technology museum|natural history museum/.test(text)) return 'science-center';
  if (/art gallery|art museum|arts centre|arts center/.test(text)) return 'art-gallery';
  if (/aquarium/.test(text)) return 'aquarium';
  if (/zoo|zoological|animal park/.test(text)) return 'zoo';
  if (/public park|urban park|garden|botanical/.test(text)) return 'park';
  if (/children.s museum|museum/.test(text)) return 'museum';
  if (/library/.test(text)) return 'library';
  if (/theme park|amusement park|water park|family attraction/.test(text)) return 'attraction';
  return null;
}

function familyTags(category) {
  const tags = [];
  if (category === 'playground') tags.push('playground', 'free');
  if (category === 'park') tags.push('stroller-friendly', 'free');
  if (['museum', 'art-gallery', 'science-center', 'aquarium', 'library'].includes(category)) tags.push('rainy-day');
  if (['museum', 'art-gallery', 'science-center', 'library'].includes(category)) tags.push('learning');
  return tags;
}

export async function fetchWikipediaFamilyPlaces({ city, origin, radiusM = 10000, fetchImpl = globalThis.fetch, filters = {} } = {}) {
  if (!origin?.lat || !origin?.lon || typeof fetchImpl !== 'function') return [];
  const key = `${city}|${Number(origin.lat).toFixed(3)}|${Number(origin.lon).toFixed(3)}`.toLowerCase();
  const cached = cache.get(key);
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) return rankPlaces(filterPlacesByCategory(cached.places, filters.category), filters);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);
  try {
    const params = new URLSearchParams({
      action: 'query',
      generator: 'geosearch',
      ggsprimary: 'all',
      ggsnamespace: '0',
      ggscoord: `${origin.lat}|${origin.lon}`,
      ggsradius: String(Math.min(Number(radiusM) || 10000, 10000)),
      ggslimit: '100',
      prop: 'coordinates|categories|revisions',
      colimit: 'max',
      cllimit: 'max',
      rvprop: 'timestamp',
      format: 'json',
      formatversion: '2',
      origin: '*',
    });
    const response = await fetchImpl(`${WIKIPEDIA_API}?${params}`, {
      signal: controller.signal,
      headers: { accept: 'application/json', 'user-agent': 'KidGoNearby/0.2 (https://kidgonearby.com)' },
    });
    if (!response.ok) return [];
    const payload = await response.json();
    const places = (payload?.query?.pages || []).flatMap((page) => {
      const category = inferFamilyCategory(page);
      const point = page.coordinates?.[0];
      if (!category || !point || !page.title) return [];
      const guideUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, '_'))}`;
      return [withDistanceAndUrls({
        id: `wikipedia/${page.pageid}`,
        name: page.title,
        category,
        lat: Number(point.lat),
        lon: Number(point.lon),
        address: '',
        familyTags: familyTags(category),
        tags: { website: guideUrl },
        source: 'wikipedia-guide',
        guideMention: true,
        guideSource: 'Wikipedia',
        guideSection: 'nearby',
        guideUrl,
        guideUpdatedAt: page.revisions?.[0]?.timestamp || '',
      }, origin)];
    });
    cache.set(key, { cachedAt: Date.now(), places });
    return rankPlaces(filterPlacesByCategory(places, filters.category), filters);
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}
