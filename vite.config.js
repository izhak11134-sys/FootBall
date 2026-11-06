import { defineConfig } from 'vite';
import { resolve,extname } from 'node:path';
import { readFile } from 'node:fs/promises';
import { normalisePath } from './src/content.js';
import { routes } from './src/content.js';

const pages = ['editor', 'manage', 'admin', '404', ...Object.keys(routes).map(path => path === '/' ? 'index' : path.slice(1))];
const known=new Set([...Object.keys(routes),'/editor','/manage','/admin','/404']);
function notFound(preview,server){return async(req,res,next)=>{
  if(!['GET','HEAD'].includes(req.method))return next();
  const path=new URL(req.url,'http://localhost').pathname;
  if(path.startsWith('/@')||path.startsWith('/src/')||path.startsWith('/node_modules/')||path.startsWith('/assets/')||known.has(normalisePath(path))||(extname(path)&&extname(path)!=='.html'))return next();
  try{let html=await readFile(resolve(import.meta.dirname,preview?`${server.config.build.outDir}/404.html`:'404.html'),'utf8');if(!preview)html=await server.transformIndexHtml('/404.html',html);res.statusCode=404;res.setHeader('Content-Type','text/html; charset=utf-8');res.end(req.method==='HEAD'?'':html);}catch{next();}
};}
export default defineConfig({
  plugins:[{name:'real-not-found',configureServer(server){server.middlewares.use(notFound(false,server));},configurePreviewServer(server){server.middlewares.use(notFound(true,server));}}],
  build: { outDir:process.env.FORM_ROAR_DIST||'dist', rollupOptions: { input: Object.fromEntries(pages.map(p => [p, resolve(import.meta.dirname, `${p}.html`)])) } },
});
