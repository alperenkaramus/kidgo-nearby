# KidGo Nearby agent brief

KidGo Nearby is a family/kids nearby-place web/PWA. The user is unhappy with generic recommendations, mixed translations, alignment problems, and search CTA placement.

## Product posture

Primary surface: Explore / Decide.
This is not a marketing landing page. A parent should quickly answer:
- Where are we?
- How old is the child?
- What do we need today?
- Which place should we choose?
- How do we get directions?

## Hard constraints

- Default launch must not spend money.
- Google Places must remain off unless BOTH flags are explicitly true:
  - GOOGLE_PLACES_ENABLED=true
  - VITE_ENABLE_GOOGLE_PLACES=true
- Live OSM/Overpass browser calls must remain off unless VITE_ENABLE_LIVE_OSM=true.
- Keep fallback/curated data working.
- Do not expose secrets or API keys.

## UX bar

Mobile first, 390x844 must pass:
- no horizontal overflow
- sticky bottom CTA visible
- search/filters/results are coherent
- buttons are at least 44px high
- language switcher aligns
- category chips do not disappear offscreen
- card primary action is directions

## I18n bar

Languages: EN/TR/RU/DE.
- When TR is selected, visible core UI should not show accidental English labels like “fit”, “City pick”, “Address not confirmed”.
- document.documentElement.lang must update with selected language.
- Brand names can remain English.
- User-facing technical/cost/debug messages should be hidden or softened.

## Verification command

Always run:

```bash
npm run check
```

Browser checks should include:

```js
({
  scrollWidth: document.body.scrollWidth,
  innerWidth: window.innerWidth,
  dock: document.querySelector('.mobile-action-dock')?.textContent.trim(),
  htmlLang: document.documentElement.lang,
  categories: Array.from(document.querySelectorAll('.place-card .category-tag')).map(e => e.textContent.trim())
})
```

## Current known live URL

https://kidgo-nearby.vercel.app/
