const WIKIVOYAGE_API = 'https://en.wikivoyage.org/w/api.php';
const GUIDE_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const guideCache = new Map();

function cleanWikiText(value = '') {
  return String(value)
    .replace(/<!--.*?-->/gs, '')
    .replace(/\[\[(?:[^|\]]+\|)?([^\]]+)\]\]/g, '$1')
    .replace(/\[https?:\/\/\S+\s+([^\]]+)\]/g, '$1')
    .replace(/''+/g, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}

function field(template, key) {
  const match = template.match(new RegExp(`(?:^|\\|)\\s*${key}\\s*=\\s*([^|}]+)`, 'i'));
  return cleanWikiText(match?.[1] || '');
}

export function parseWikivoyageListings(wikitext = '', { city = '', updatedAt = '' } = {}) {
  const listings = [];
  const pattern = /\{\{\s*(see|do|eat|drink)\s*\|([\s\S]*?)\}\}/gi;
  for (const match of String(wikitext).matchAll(pattern)) {
    const section = match[1].toLowerCase();
    const template = match[2];
    const name = field(template, 'name') || cleanWikiText(template.split('|')[0]);
    if (!name || name.length < 3) continue;
    listings.push({
      name,
      section,
      city,
      updatedAt,
      source: 'Wikivoyage',
      guideUrl: `https://en.wikivoyage.org/wiki/${encodeURIComponent(city.replace(/ /g, '_'))}`,
    });
  }
  return listings.slice(0, 100);
}

export async function fetchCityGuide(city, { fetchImpl = globalThis.fetch } = {}) {
  const normalizedCity = String(city || '').trim();
  if (!normalizedCity || normalizedCity === 'nearby' || typeof fetchImpl !== 'function') return [];
  const cached = guideCache.get(normalizedCity.toLowerCase());
  if (cached && Date.now() - cached.cachedAt < GUIDE_CACHE_TTL_MS) return cached.listings;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);
  try {
    const params = new URLSearchParams({
      action: 'query',
      prop: 'revisions',
      rvprop: 'timestamp|content',
      rvslots: 'main',
      redirects: '1',
      format: 'json',
      formatversion: '2',
      origin: '*',
      titles: normalizedCity,
    });
    const response = await fetchImpl(`${WIKIVOYAGE_API}?${params}`, {
      signal: controller.signal,
      headers: { accept: 'application/json', 'user-agent': 'KidGoNearby/0.2 (https://kidgonearby.com)' },
    });
    if (!response.ok) return [];
    const payload = await response.json();
    const page = payload?.query?.pages?.[0];
    if (!page || page.missing) return [];
    const revision = page.revisions?.[0];
    const wikitext = revision?.slots?.main?.content || revision?.content || '';
    const listings = parseWikivoyageListings(wikitext, { city: page.title || normalizedCity, updatedAt: revision?.timestamp || '' });
    guideCache.set(normalizedCity.toLowerCase(), { cachedAt: Date.now(), listings });
    return listings;
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

function normalizedName(value = '') {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\b(the|museum|park|cafe|gallery|centre|center|city|of|and)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function namesMatch(placeName, listingName) {
  const place = normalizedName(placeName);
  const listing = normalizedName(listingName);
  if (place.length < 5 || listing.length < 5) return false;
  if (place === listing || place.includes(listing) || listing.includes(place)) return true;
  const placeTokens = new Set(place.split(' ').filter((token) => token.length >= 3));
  const listingTokens = new Set(listing.split(' ').filter((token) => token.length >= 3));
  if (!placeTokens.size || !listingTokens.size) return false;
  const overlap = [...placeTokens].filter((token) => listingTokens.has(token)).length;
  return overlap / Math.min(placeTokens.size, listingTokens.size) >= 0.75;
}

export function applyCityGuideSignals(places = [], listings = []) {
  return places
    .map((place) => {
      const listing = listings.find((candidate) => namesMatch(place.name, candidate.name));
      if (!listing) return place;
      const guideBoost = 7;
      return {
        ...place,
        guideMention: true,
        guideSource: listing.source,
        guideSection: listing.section,
        guideUrl: listing.guideUrl,
        guideUpdatedAt: listing.updatedAt,
        scoreParts: { ...(place.scoreParts || {}), guide: guideBoost },
        familyScore: Math.min(100, Number(place.familyScore || 0) + guideBoost),
      };
    })
    .sort((a, b) =>
      Number(b.familyScore || 0) - Number(a.familyScore || 0)
      || Number(b.googleRating || 0) - Number(a.googleRating || 0)
      || Number(a.distanceM ?? Infinity) - Number(b.distanceM ?? Infinity),
    );
}
