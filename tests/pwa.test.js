import { test, eq, ok } from './harness.js';
import { APP_VERSION } from '../js/config.js';

test('pwa: sw.js VERSION equals APP_VERSION', async () => {
  const text = await (await fetch('./sw.js', { cache: 'no-store' })).text();
  ok(text.includes(`VERSION = '${APP_VERSION}'`), `sw.js VERSION must be '${APP_VERSION}'`);
});
test('pwa: every ASSETS file loads', async () => {
  const text = await (await fetch('./sw.js', { cache: 'no-store' })).text();
  const m = text.match(/const ASSETS = \[([\s\S]*?)\];/);
  ok(m, 'ASSETS array found');
  const urls = [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]);
  ok(urls.length > 30, 'ASSETS has entries');
  const bad = [];
  for (const u of urls) { const r = await fetch(u, { cache: 'no-store' }); if (!r.ok) bad.push(u + ' → ' + r.status); }
  eq(bad, []);
});
test('pwa: every js module on disk that the app imports is in ASSETS', async () => {
  const sw = await (await fetch('./sw.js', { cache: 'no-store' })).text();
  const html = await (await fetch('./index.html', { cache: 'no-store' })).text();
  const root = new URL('./', location.href).pathname;
  const seen = new Set(); const queue = ['./js/main.js'];
  ok(html.includes('js/main.js'), 'index loads main.js');
  while (queue.length) {
    const u = queue.pop(); if (seen.has(u)) continue; seen.add(u);
    const src = await (await fetch(u, { cache: 'no-store' })).text();
    for (const [, spec] of src.matchAll(/(?:import|from)\s*['"](\.[^'"]+)['"]/g)) {
      queue.push('./' + new URL(spec, new URL(u, location.href)).pathname.slice(root.length));
    }
  }
  const missing = [...seen].filter((u) => !sw.includes(`'${u}'`));
  eq(missing, []);
});
test('pwa: manifest is valid', async () => {
  const m = await (await fetch('./manifest.webmanifest', { cache: 'no-store' })).json();
  eq([m.start_url, m.scope, m.display, m.name], ['./', './', 'standalone', 'Plank Pals']);
});
