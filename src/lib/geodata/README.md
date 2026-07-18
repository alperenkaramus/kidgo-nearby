# Kids Near Me geodata layer

Vite/React can call these modules directly from `src/lib/geodata` for MVP demos. No paid API keys are required.

## Main API

```js
import { searchFamilyPlaces, geocodeLocation, CATEGORIES } from './src/lib/geodata/index.js';

const places = await searchFamilyPlaces({
  location: { lat: 41.0082, lon: 28.9784 }, // or query: 'Istanbul'
  city: 'istanbul',                         // used for seed fallback
  category: 'playground',                   // optional: CATEGORIES value
  age: 5,                                   // optional ranking boost
  radius: 2500,
  limit: 20,
});
```

Returned place cards include:

- `name`, `category`, `lat`, `lon`, `address`
- `distanceM`, `distanceKm`
- `familyTags`, `familyScore`
- `mapsUrl`, `directionsUrl`
- `source`: `osm` or `seed`
- optional OSM tags: `openingHours`, `website`, `phone`, `cuisine`, `wheelchair`

## Data sources

- Nominatim (`geocodeLocation`) for city/address to coordinates.
- Overpass (`searchFamilyPlaces`) for nearby OpenStreetMap POIs.
- Seed fallback for Istanbul, London, New York when network/API calls fail or return no result.

Respect public service limits in production: debounce searches, cache responses, and avoid firing requests on every keystroke.

## Categories

`playground`, `park`, `museum`, `zoo`, `aquarium`, `library`, `family-cafe`, `restaurant`, `attraction`, `indoor`.

## Local verification

```bash
npm test
npm run smoke:geodata
npm run build
```
