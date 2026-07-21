# KidGo Nearby SEO launch plan

Recommended launch domain: `kidgonearby.com`.

Why this name:

- Shorter and more brandable than `familygeoadviser.com`.
- Clear product promise: kids + nearby.
- Better for app/PWA/store expansion than a purely generic SEO domain.
- Still close to search intent phrases like “kids near me”, “kid-friendly places nearby”, and “things to do with kids nearby”.

DNS check from the server showed `kidgonearby.com` currently has no DNS resolution, but this is not a guaranteed registrar availability check. Confirm and buy through a registrar before announcing it.

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

## Next SEO upgrades after deploy

1. Add real public URL to Google Search Console.
2. Submit sitemap: `https://kidgonearby.com/sitemap.xml`.
3. Add analytics events for:
   - city search
   - country switch
   - activity mood switch
   - Google Maps click
   - directions click
4. Add indexable landing pages later, not now:
   - `/things-to-do-with-kids/new-york`
   - `/things-to-do-with-kids/london`
   - `/things-to-do-with-kids/paris`
   - `/cocukla-gezilecek-yerler/istanbul`
5. Add privacy policy before broader ads/app-store launch because location and Google Places are involved.
