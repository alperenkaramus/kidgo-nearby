import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const root = new URL('../', import.meta.url).pathname;
const publicDir = join(root, 'public');
const site = 'https://kidgonearby.com';
const expectedLangs = ['en', 'tr', 'ru', 'de'];

async function walk(dir) {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full));
    else files.push(full);
  }
  return files;
}

const files = await walk(publicDir);
const htmlFiles = files.filter((file) => file.endsWith('/index.html'));
assert.equal(files.some((file) => file === join(publicDir, 'index.html')), false, 'public/index.html conflicts with Vite root index');

const canonicals = new Map();
const languageCounts = Object.fromEntries(expectedLangs.map((lang) => [lang, 0]));
for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  const lang = html.match(/<html lang="([^"]+)"/)?.[1];
  if (lang in languageCounts) languageCounts[lang] += 1;
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  assert.ok(canonical?.startsWith(`${site}/`), `Missing/wrong canonical: ${relative(root, file)}`);
  assert.equal(canonicals.has(canonical), false, `Duplicate canonical: ${canonical}`);
  canonicals.set(canonical, file);
  assert.match(html, /<title>[^<]{10,}[^<]*<\/title>/, `Weak title: ${relative(root, file)}`);
  assert.match(html, /<meta name="description" content="[^"]{50,}"/, `Weak description: ${relative(root, file)}`);
  assert.match(html, /<h1>[^<]+<\/h1>/, `Missing H1: ${relative(root, file)}`);
}

for (const lang of expectedLangs) assert.ok(languageCounts[lang] >= 40, `Insufficient ${lang} pages: ${languageCounts[lang]}`);

const rootIndex = await readFile(join(root, 'index.html'), 'utf8');
assert.equal(/<link[^>]+hreflang=/.test(rootIndex), false, 'SPA root must not claim non-reciprocal language variants');

const hubPaths = {
  'things-to-do-with-kids/index.html': 'London',
  'cocukla-gezilecek-yerler/index.html': 'Londra',
  'ru/kuda-poiti-s-detmi/index.html': 'Лондон',
  'de/aktivitaeten-mit-kindern/index.html': 'London',
};
for (const [path, expectedCity] of Object.entries(hubPaths)) {
  const html = await readFile(join(publicDir, path), 'utf8');
  for (const code of [...expectedLangs, 'x-default']) assert.match(html, new RegExp(`hreflang="${code}"`), `${path} lacks reciprocal ${code}`);
  assert.ok(html.includes(`<h2>${expectedCity}</h2>`), `${path} must use standalone city names in headings`);
  assert.ok(html.includes(`"name":"${expectedCity}"`), `${path} must use standalone city names in ItemList schema`);
}
assert.equal((await readFile(join(publicDir, 'ru/kuda-poiti-s-detmi/index.html'), 'utf8')).includes('<h2>Лондоне</h2>'), false, 'Russian hub must not use prepositional city forms as headings');
assert.equal((await readFile(join(publicDir, 'cocukla-gezilecek-yerler/index.html'), 'utf8')).includes("<h2>Londra'da</h2>"), false, 'Turkish hub must not use contextual city forms as headings');

const representatives = {
  en: 'things-to-do-with-kids/london/index.html',
  tr: 'cocukla-gezilecek-yerler/london/index.html',
  ru: 'ru/kuda-poiti-s-detmi/london/index.html',
  de: 'de/aktivitaeten-mit-kindern/london/index.html',
};
for (const [lang, path] of Object.entries(representatives)) {
  const html = await readFile(join(publicDir, path), 'utf8');
  assert.match(html, new RegExp(`<html lang="${lang}"`));
  assert.ok(html.includes(`/?city=London&lang=${lang}`), `${path} must pass the stable app city key`);
  for (const code of [...expectedLangs, 'x-default']) assert.match(html, new RegExp(`hreflang="${code}"`), `${path} lacks ${code}`);
  for (const type of ['FAQPage', 'BreadcrumbList', 'ItemList']) assert.ok(html.includes(`"@type":"${type}"`), `${path} lacks ${type}`);
  assert.ok((html.match(/application\/ld\+json/g) || []).length >= 4, `${path} needs four JSON-LD blocks`);
  if (lang === 'ru') {
    assert.ok(html.includes('в Лондоне'), 'Russian sentence copy must use the contextual city form');
    assert.equal(html.includes('в Лондон:'), false, 'Russian sentence copy must not use the standalone city form after в');
  }
}

const sitemap = await readFile(join(publicDir, 'sitemap.xml'), 'utf8');
assert.ok(!sitemap.includes('kidgo-nearby.vercel.app'), 'Sitemap contains legacy Vercel host');
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
assert.ok(locs.length >= 400, `Sitemap unexpectedly small: ${locs.length}`);
assert.equal(new Set(locs).size, locs.length, 'Sitemap contains duplicate URLs');
for (const canonical of canonicals.keys()) assert.ok(locs.includes(canonical), `Sitemap misses ${canonical}`);
for (const fragment of ['/things-to-do-with-kids/', '/cocukla-gezilecek-yerler/', '/ru/kuda-poiti-s-detmi/', '/de/aktivitaeten-mit-kindern/']) assert.ok(locs.some((url) => url.includes(fragment)), `Sitemap lacks ${fragment}`);
const today = new Date().toISOString().slice(0, 10);
for (const date of sitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)) assert.ok(date[1] <= today, `Future lastmod: ${date[1]}`);

const robots = await readFile(join(publicDir, 'robots.txt'), 'utf8');
assert.ok(robots.includes(`Sitemap: ${site}/sitemap.xml`));
const llms = await readFile(join(publicDir, 'llms.txt'), 'utf8');
for (const marker of ['English', 'Türkçe', 'Русский', 'Deutsch']) assert.ok(llms.includes(marker), `llms.txt lacks ${marker}`);

const vercelConfig = JSON.parse(await readFile(join(root, 'vercel.json'), 'utf8'));
assert.equal(vercelConfig.rewrites, undefined, 'Catch-all SPA rewrites create SEO soft-404 responses');
assert.equal(vercelConfig.redirects?.length, 4, 'Legacy language roots need four permanent redirects');
const netlifyConfig = await readFile(join(root, 'netlify.toml'), 'utf8');
assert.equal(netlifyConfig.includes('from = "/*"'), false, 'Netlify catch-all would create SEO soft-404 responses');
for (const path of ['/en', '/tr', '/ru', '/de']) assert.ok(netlifyConfig.includes(`from = "${path}"`), `Netlify lacks legacy redirect ${path}`);

console.log(JSON.stringify({ htmlPages: htmlFiles.length, canonicals: canonicals.size, sitemapUrls: locs.length, languageCounts }, null, 2));
console.log('SEO verification passed.');
