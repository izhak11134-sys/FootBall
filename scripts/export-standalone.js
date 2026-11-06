import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { routes } from '../src/content.js';
import { pageMarkup } from '../src/site.js';
import { initSite } from '../src/interactions.js';
import { renderProductCards, normaliseProducts } from '../src/catalog.js';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'downloads/form-and-roar.html');
const css = await readFile(resolve(root, 'src/styles.css'), 'utf8');
const assets = new Map();
for (const name of ['shirt', 'archive', 'style', 'football', 'stadium']) {
  const bytes = await readFile(resolve(root, `public/images/${name}.svg`));
  assets.set(`/images/${name}.svg`, `data:image/svg+xml;base64,${bytes.toString('base64')}`);
}
const favicon = `data:image/svg+xml;base64,${(await readFile(resolve(root, 'public/favicon.svg'))).toString('base64')}`;

function inlineMarkup(path) {
  let html = pageMarkup(path);
  for (const [url, data] of assets) html = html.replaceAll(`src="${url}"`, `src="${data}"`);
  return html.replace(/href="(\/[^"]*)"/g, (_, path) => `href="#${path}"`);
}
const pages = Object.fromEntries(Object.entries(routes).map(([path, meta]) => [path, { ...meta, html: inlineMarkup(path) }]));
pages['/404'] = { title: 'Page not found — Form & Roar', description: 'Find your next football favourite.', html: inlineMarkup('/404') };
const payload = JSON.stringify(pages).replaceAll('<', '\\u003c');
const script = `
const pages = JSON.parse(document.getElementById('site-pages').textContent);
const app = document.getElementById('app');
function render(first) {
  if (location.hash && !location.hash.startsWith('#/')) return;
  const path = location.hash.slice(1).replace(/\\/$/, '') || '/';
  const page = pages[path] || pages['/404'];
  app.innerHTML = page.html;
  siteActions.refresh();
  document.title = page.title;
  document.querySelector('meta[name="description"]').content = page.description;
  if (!first) {
    window.scrollTo(0, 0);
    const heading = app.querySelector('h1');
    heading?.setAttribute('tabindex', '-1');
    heading?.focus({preventScroll:true});
  }
}
const offlineAssets = ${JSON.stringify(Object.fromEntries(assets))};
const offlineRenderer = items => {
  let markup = (${renderProductCards.toString()})(items);
  for (const [url, data] of Object.entries(offlineAssets)) markup = markup.replaceAll('src="'+url+'"', 'src="'+data+'"');
  return markup;
};
const siteActions = (${initSite.toString()})(offlineRenderer, ${normaliseProducts.toString()});
window.addEventListener('hashchange', () => render(false));
render(true);
`;
const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="A football product discovery concept for the UK and Europe.">
<meta name="robots" content="noindex,nofollow">
<meta name="theme-color" content="#1f342b">
<title>Form &amp; Roar — Football finds. Chosen with feeling.</title>
<link rel="icon" href="${favicon}">
<style>${css.replaceAll('</style', '<\\/style')}</style>
</head>
<body>
<div id="app">${pages['/'].html}</div>
<noscript><p style="padding:20px">The homepage is available without JavaScript. Enable JavaScript to browse the other included pages.</p></noscript>
<script id="site-pages" type="application/json">${payload}</script>
<script>${script}</script>
</body>
</html>
`;
await mkdir(resolve(root, 'downloads'), { recursive: true });
await writeFile(output, html);
await writeFile(resolve(root, 'downloads/form-and-roar-football.html'), html);
console.log(`Exported ${Object.keys(routes).length} pages and embedded illustrations to ${output} (${Buffer.byteLength(html)} bytes).`);
