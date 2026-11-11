// Renders the social preview image (public/images/og-image.jpg).
// Needs Playwright: `npx playwright install chromium` if it is not already available.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const { chromium } = createRequire(import.meta.url)('playwright');
const file = (p) => pathToFileURL(resolve(p)).href;
const serif = 'node_modules/@fontsource/instrument-serif/files/instrument-serif-latin-400';
const mono = 'node_modules/@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2';

const html = `<!doctype html><html><head><style>
@font-face { font-family: S; src: url(${file(serif + '-normal.woff2')}); }
@font-face { font-family: S; font-style: italic; src: url(${file(serif + '-italic.woff2')}); }
@font-face { font-family: M; src: url(${file(mono)}); }
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 630px; background: #f2eee5; color: #15130f; padding: 64px 72px;
  display: grid; grid-template-columns: 1fr 400px; gap: 56px; align-items: center; }
.m { font: 500 18px M; letter-spacing: .1em; text-transform: uppercase; color: #625d53; }
.m b { color: #d43a17; font-weight: 500; margin-right: 14px; }
h1 { font: 400 150px/0.92 S; letter-spacing: -0.025em; margin: 30px 0 34px; }
em { color: #d43a17; }
img { width: 400px; height: 500px; object-fit: cover; display: block; }
svg { width: 100%; height: 40px; margin-bottom: 26px; }
</style></head><body>
<div>
  <p class="m"><b>Paul Salzman</b></p>
  <h1>Hi, I’m <em>Paul.</em></h1>
  <svg viewBox="0 0 700 40" preserveAspectRatio="none"><path d="M0 20C30 -6 55 44 90 22S150 4 190 24s70 6 110-3 80 3 120-1h280" fill="none" stroke="#d43a17" stroke-width="2.5" stroke-linecap="round"/></svg>
  <p class="m">Founder · Builder · Writer · paulsalzman.com</p>
</div>
<img src="${file('public/images/paul-salzman-1200.webp')}" />
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto(file('scripts/make-og.mjs')); // file origin, so local fonts and images load
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: 'public/images/og-image.jpg', type: 'jpeg', quality: 88 });
await browser.close();
console.log('Wrote public/images/og-image.jpg');
