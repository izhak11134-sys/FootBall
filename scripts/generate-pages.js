import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { routes } from '../src/content.js';
import { pageMarkup } from '../src/site.js';

const root=resolve(import.meta.dirname,'..');
for(const [route,meta] of Object.entries(routes)){
  const file=resolve(root,route==='/'?'index.html':`${route.slice(1)}.html`);
  await mkdir(dirname(file),{recursive:true});
  const escape=value=>value.replaceAll('&','&amp;').replaceAll('"','&quot;');
  const html=`<!doctype html>\n<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${escape(meta.description)}"><meta name="robots" content="noindex,nofollow"><meta name="theme-color" content="#1f342b"><meta property="og:title" content="${escape(meta.title)}"><meta property="og:description" content="${escape(meta.description)}"><meta property="og:type" content="website"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><title>${meta.title.replaceAll('&','&amp;')}</title><link rel="stylesheet" href="/src/styles.css"></head><body><div id="app">${pageMarkup(route)}</div><script type="module" src="/src/main.js"></script></body></html>\n`;
  await writeFile(file,html);
}
console.log(`Generated ${Object.keys(routes).length} pre-rendered pages. Prototype indexing is disabled until launch.`);
