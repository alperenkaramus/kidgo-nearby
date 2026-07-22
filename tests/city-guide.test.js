import test from 'node:test';
import assert from 'node:assert/strict';

import { applyCityGuideSignals, parseWikivoyageListings } from '../server/cityGuide.mjs';

test('Wikivoyage listings are parsed with source and freshness metadata', () => {
  const listings = parseWikivoyageListings(`
{{see| name=Science Museum | lat=51.4978 | long=-0.1745 | content=Hands-on galleries }}
{{do| name=[[Diana Memorial Playground]] | content=Popular family stop }}
{{eat| name=Family Kitchen | content=High chairs }}
`, { city: 'London', updatedAt: '2026-07-20T10:00:00Z' });

  assert.equal(listings.length, 3);
  assert.equal(listings[0].name, 'Science Museum');
  assert.equal(listings[0].source, 'Wikivoyage');
  assert.equal(listings[0].updatedAt, '2026-07-20T10:00:00Z');
  assert.match(listings[0].guideUrl, /London/);
});

test('city-guide mentions add transparent evidence and a bounded ranking boost', () => {
  const places = [
    { id: 'one', name: 'Science Museum', familyScore: 72, scoreParts: { familySignals: 5 }, distanceM: 1200 },
    { id: 'two', name: 'Other Playground', familyScore: 75, scoreParts: {}, distanceM: 300 },
  ];
  const listings = [{ name: 'Science Museum', source: 'Wikivoyage', section: 'see', guideUrl: 'https://en.wikivoyage.org/wiki/London', updatedAt: '2026-07-20T10:00:00Z' }];

  const enriched = applyCityGuideSignals(places, listings);
  assert.equal(enriched[0].id, 'one');
  assert.equal(enriched[0].guideMention, true);
  assert.equal(enriched[0].scoreParts.guide, 7);
  assert.equal(enriched[0].familyScore, 79);
  assert.equal(enriched[1].guideMention, undefined);
});
