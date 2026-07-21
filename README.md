# KidGo Nearby / Geo Adviser

Global, mobile-first family geo adviser for answering: “where can we go nearby with kids?”

Recommended public domain: `kidgonearby.com`.

The app ranks kid-friendly parks, museums, indoor backups, aquariums, libraries, family cafés, attractions, and quick family stops across international cities, while keeping Turkey’s 81-city coverage mode.

## Current product scope

- English default UI with Turkish, Russian, and German switcher.
- Abroad-first country selector: US, UK, Germany, France, Italy, Spain, Netherlands, UAE, Japan, Singapore, Turkey, Russia.
- Turkey 81-city mode remains available.
- Activity mood ranking: quick win, rainy/hot day, free/cheap, learning, active, snack break.
- Result cards include distance, source/confidence, Google-style rating/review fields for curated data, score breakdown, rationale, map, Google, and directions links.
- Live OpenStreetMap/Overpass is attempted first; deterministic city-aware fallback keeps demos and production UX usable when live APIs are slow.

## Tech stack

- React 19
- Vite 8
- Node built-in test runner
- Static hosting friendly: Netlify, Vercel, Cloudflare Pages, S3/CDN

## Local development

```bash
npm install
npm run dev
```

Default dev server binds to `0.0.0.0` for remote preview/tunnel workflows.

## Verification

Run the full publish-readiness gate:

```bash
npm run check
```

Equivalent individual checks:

```bash
npm test
npm run smoke
npm run smoke:geodata
npm run build
```

## Deployment

### Netlify

- Build command: `npm run build`
- Publish directory: `dist`
- Config file: `netlify.toml`

### Vercel

- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Config file: `vercel.json`

### Cloudflare Pages

- Build command: `npm run build`
- Build output directory: `dist`

## Environment variables

Live Google Places enrichment is optional but supported through serverless proxy functions. It is deliberately off by default so launch traffic cannot create accidental Google API spend.

Set one of these on the deploy platform, preferably `GOOGLE_PLACES_API_KEY`:

```bash
GOOGLE_PLACES_API_KEY=your_google_places_api_key
# also accepted: GOOGLE_MAPS_API_KEY or GOOGLE_API_KEY
```

Then enable it explicitly only when you want paid Google Places calls:

```bash
GOOGLE_PLACES_ENABLED=true
VITE_ENABLE_GOOGLE_PLACES=true
```

For the first low-cost launch, leave both enable flags unset/false. The app will use OpenStreetMap + curated/city fallback data with zero Google Places calls.

Live browser Overpass/OpenStreetMap calls are also off by default on production to avoid third-party CORS noise and flaky public API dependency during launch. Enable only if you intentionally want direct browser OSM calls:

```bash
VITE_ENABLE_LIVE_OSM=true
```

The key is read only by the serverless proxy:

- Vercel: `/api/google-places`
- Netlify: `/.netlify/functions/google-places`, with `/api/google-places` redirected there

The browser never receives the API key. If no key is configured or the enable flags are not true, the app silently keeps using OpenStreetMap + curated/city fallback ratings.

Google Cloud requirements:

1. Enable Places API / Places API (New) for the project.
2. Add billing as required by Google.
3. Restrict the API key by server/platform where possible.
4. Do not put the key in Vite `VITE_*` variables; that would expose it to users.

## Release checklist

1. `npm run check` passes.
2. Browser smoke: load app, change language, change country, select a city, change activity mood, verify cards update.
3. Deploy static `dist` to Netlify/Vercel/Cloudflare Pages.
4. Verify public URL returns `200 OK` and the page body contains `Geo Adviser`.
