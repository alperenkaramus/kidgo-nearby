# KidGo Nearby SEO launch plan

Recommended launch domain: `kidgonearby.com`.

Why this name:

- Shorter and more brandable than `familygeoadviser.com`.
- Clear product promise: kids + nearby.
- Better for app/PWA/store expansion than a purely generic SEO domain.
- Still close to search intent phrases like “kids near me”, “kid-friendly places nearby”, and “things to do with kids nearby”.

Production is live at `https://kidgonearby.com`; use it as the only canonical host.

## Domain candidates checked

Likely available / no DNS resolution at check time:

- kidgonearby.com — recommended
- kidgo.app — shorter, app-like, but `.app` is usually more expensive and requires HTTPS
- geoadviser.app — descriptive, less kid/family-specific
- geoadviser.co — descriptive, less kid/family-specific
- kidsnearme.app — very SEO-intent aligned, but may sound generic
- familygeoadviser.com — clear but long
- nearbywithkids.com — clear long-tail SEO, less brandable
- kidplacesnearby.com — SEO-ish, less elegant
- kidgo.world — global feel, weaker trust than `.com`
- childfriendlynearby.com — SEO-ish, too long
- kidfriendlynearby.com — clear but long
- kidnearby.com — short but slightly awkward
- kidsnearby.app — good app name, less natural than KidGo

Resolved / likely taken:

- gowithkids.app
- gowithkids.com

## SEO baseline added

- Crawlable landing content in `index.html` before React loads.
- SEO title and meta description.
- Canonical URL: `https://kidgonearby.com/`.
- OpenGraph/Twitter preview metadata.
- `WebApplication` JSON-LD structured data.
- `public/robots.txt`.
- `public/sitemap.xml`.
- Deterministic multilingual page generation and validation via `npm run seo:check`.
- English, Turkish, Russian and German hubs with reciprocal `hreflang` and `x-default`.
- Four intent families (general, indoor, rainy-day and free) for priority global cities.
- Localized `WebPage`, `FAQPage`, `BreadcrumbList` and `ItemList` structured data.
- Permanent redirects from legacy `/en`, `/tr`, `/ru` and `/de` roots.
- Real 404 behavior instead of catch-all SPA soft-404 responses.

## Next operational SEO steps

1. Add real public URL to Google Search Console.
2. Submit sitemap: `https://kidgonearby.com/sitemap.xml`.
3. Add analytics events for:
   - city search
   - country switch
   - activity mood switch
   - Google Maps click
   - directions click
4. Monitor indexing, duplicate-canonical and hreflang reports after each page expansion.
5. Expand city coverage only with useful, city-specific planning guidance; avoid thin doorway pages.
6. Add a privacy policy before broader ads/app-store launch because location is involved.
