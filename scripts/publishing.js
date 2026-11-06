import target from '../site-publishing.json' with { type: 'json' };
export function getPublishingConfig(env=process.env){
 const raw=(env.SITE_URL||'').trim();let origin='';
 if(raw){let url;try{url=new URL(raw);}catch{throw new Error('SITE_URL must be an HTTPS origin.');}if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash||url.pathname!=='/')throw new Error('SITE_URL must be an HTTPS origin without a path or credentials.');origin=url.origin;}
 const indexable=env.SITE_INDEXABLE==='true';if(indexable&&!origin)throw new Error('Set SITE_URL before enabling indexing.');return {origin,indexable};
}
export function publishingMeta(path,config){
 if(!config.origin||path==='/404')return '';
 const escape=value=>value.replaceAll('&','&amp;').replaceAll('"','&quot;');const url=escape(config.origin+(path==='/'?'/':path));
 return `<link rel="canonical" href="${url}"><meta property="og:url" content="${url}"><meta property="og:image" content="${escape(config.origin)}/social-preview.png"><meta name="twitter:card" content="summary_large_image">`;
}
export function makeSitemap(config,routes){
 if(!config.origin)return null;
 const escape=value=>value.replaceAll('&','&amp;').replaceAll('<','&lt;');
 return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${Object.keys(routes).map(path=>`<url><loc>${escape(config.origin+(path==='/'?'/':path))}</loc></url>`).join('')}</urlset>\n`;
}

export function publishingEnvironment(env){return {...env,SITE_URL:env.SITE_URL||target.origin,SITE_INDEXABLE:env.SITE_INDEXABLE||String(target.indexable)};}
