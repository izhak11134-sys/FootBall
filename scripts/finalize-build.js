import { writeFile,rm } from 'node:fs/promises';
import { routes } from '../src/content.js';
import { getPublishingConfig,makeSitemap,publishingEnvironment } from './publishing.js';
import { loadEnv } from 'vite';
const out=process.env.FORM_ROAR_DIST||'dist';if(!['dist','dist-test'].includes(out))throw new Error('Unsupported build output directory.');
const config=getPublishingConfig(publishingEnvironment({...loadEnv('production',process.cwd(),''),...process.env})),sitemap=makeSitemap(config,routes);
await writeFile(`${out}/robots.txt`,config.indexable?`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /manage\nDisallow: /editor\nSitemap: ${config.origin}/sitemap.xml\n`:'User-agent: *\nDisallow: /\n');
if(sitemap)await writeFile(`${out}/sitemap.xml`,sitemap);else await rm(`${out}/sitemap.xml`,{force:true});
console.log(`Prepared Firebase Hosting output. Indexing: ${config.indexable?'enabled':'disabled'}.`);
