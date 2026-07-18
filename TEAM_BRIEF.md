# Kids Near Me — Global Geo Product Team Brief

## Product
A global mobile-first web app: parents ask “what can I do nearby with my kid?” and get ranked, family-friendly places/activities around their current location or any city.

## Positioning
Not a generic map. A kid/family decision engine: playgrounds, parks, museums, aquariums, zoos, family cafes, libraries, kid-friendly attractions, rainy-day options, stroller-friendly filters, age fit.

## MVP scope
- Global location search and browser geolocation.
- Nearby POI search using OpenStreetMap/Overpass (free, global, no API key).
- Family score/ranking algorithm.
- Category/age/radius filters.
- Mobile-first UI with place cards, distance, tags, maps links.
- Demo seed/fallback for Istanbul, London, New York if APIs fail.
- No user accounts, payments, or reviews in MVP.

## Team roles
- Backend/geodata: Overpass/Nominatim integration, ranking, API routes, tests.
- Frontend: React/Vite app, state, geolocation, filters, rendering.
- Designer/growth: brand, landing copy, UX, visual system, global positioning.

## Constraints
- Work in `/root/projects/kids-near-me`.
- Avoid paid API dependencies for MVP.
- Keep code simple and shippable.
- Verify with `npm run build` and at least one API smoke test or static data fallback.
