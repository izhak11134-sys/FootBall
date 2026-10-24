import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import 'font-awesome/css/font-awesome.min.css';
import './editor.css';
import siteCss from './styles.css?inline';
import { initSite } from './interactions.js';
import { renderProductCards, normaliseProducts } from './catalog.js';
import { routes, normalisePath } from './content.js';
import { pageMarkup } from './site.js';

const selected = normalisePath(new URLSearchParams(location.search).get('page') || '/');
const path = Object.hasOwn(routes, selected) ? selected : '/';
let draft;
try { draft=JSON.parse(localStorage.getItem(`fr-draft:${path}`)); } catch {}
document.querySelector('#app').innerHTML = `<div class="editor-shell"><header class="editor-toolbar"><span class="editor-brand">FORM & ROAR / STUDIO</span><label for="page-picker">Page</label><select id="page-picker">${Object.entries(routes).map(([url,meta])=>`<option value="${url}" ${url===path?'selected':''}>${meta.title.split(' — ')[0]}</option>`).join('')}</select><button id="save-draft" class="primary">Save draft</button><a id="preview-draft" href="${path}?draft=1" target="_blank" rel="noopener">Preview ↗</a><button id="export-page">Export HTML</button><button id="reset-page">Reset page</button><button id="show-help" aria-expanded="false" aria-controls="editor-help">How to edit</button><a href="${path}">Exit studio</a></header><div class="editor-notice"><p>Private browser drafts · Double-click text to edit. Drag sections using the Layers panel. Saving does not publish.</p><strong id="save-status" role="status">${draft?'Saved browser draft loaded':'Original design loaded'}</strong></div><div class="editor-main"><div id="editor"></div><aside class="editor-help" id="editor-help" hidden><h2>Your visual workspace</h2><ol><li>Click any section, image or text to select it.</li><li>Double-click text to rewrite it.</li><li>Use Layers to select or reorder sections.</li><li>Use Style Manager for spacing, colours and typography.</li><li>Use Blocks to add a text section or two-column layout.</li><li>Save your draft, then Preview to check it.</li></ol><p>Device controls switch between desktop, tablet and phone. Preview navigation is inactive inside the canvas.</p><p>Drafts belong to this browser and address. Export includes the selected page, styles and embedded images; linked pages remain separate.</p><button id="close-help">Got it</button></aside></div></div>`;
const editor = grapesjs.init({
  container:'#editor',height:'100%',width:'auto',storageManager:false,noticeOnUnload:false,
  cssIcons:'',
  canvasCss:siteCss,
  fromElement:false,components:draft?.html || pageMarkup(path),
  style:draft?.css || '',
  canvas:{frameStyle:'body { background-color:#f6f4ee; }'},
  deviceManager:{devices:[{name:'Desktop',width:''},{name:'Tablet',width:'768px',widthMedia:'1000px'},{name:'Mobile',width:'390px',widthMedia:'700px'}]},
  blockManager:{blocks:[
    {id:'editorial-text',label:'Text section',category:'Editorial',content:'<section class="section"><p class="eyebrow">YOUR SECTION LABEL</p><h2 style="font-size:42px;margin:20px 0">A story worth telling.</h2><p style="max-width:600px;line-height:1.8">Double-click to write your own introduction.</p></section>'},
    {id:'two-columns',label:'Two columns',category:'Editorial',content:'<section class="section"><div style="display:flex;gap:24px;flex-wrap:wrap"><div style="flex:1;min-width:220px;padding:30px;background:#e8e9df"><h2>First perspective.</h2><p style="margin-top:18px;line-height:1.8">Write your story here.</p></div><div style="flex:1;min-width:220px;padding:30px;background:#202a25;color:#f6f5f0"><h2>Another angle.</h2><p style="margin-top:18px;line-height:1.8">Add the second part of your story.</p></div></div></section>'},
    {id:'quote',label:'Statement',category:'Editorial',content:'<section class="brand-statement"><p class="eyebrow">YOUR PERSPECTIVE</p><h2>A game we share.<br><em>A feeling we keep.</em></h2></section>'},
  ]},
});
let dirty=false;
const status=document.querySelector('#save-status');
let lastSaved={html:editor.getHtml(),css:editor.getCss()};
editor.on('update',()=>{
  dirty=editor.getHtml()!==lastSaved.html || editor.getCss()!==lastSaved.css;
  if(dirty)status.textContent='Unsaved changes';
});
async function finishTextEdit(){
  // GrapesJS commits rich text asynchronously; finish it before serialising.
  const view=editor.getEditing()?.getView();
  if(view?.disableEditing)await view.disableEditing();
}
async function save(){
  try{
    await finishTextEdit();
    const snapshot={html:editor.getHtml(),css:editor.getCss()};
    localStorage.setItem(`fr-draft:${path}`,JSON.stringify({...snapshot,savedAt:new Date().toISOString()}));
    lastSaved=snapshot;
    dirty=false;status.textContent='Draft saved in this browser';return true;
  }catch{status.textContent='Storage unavailable. Use Export HTML instead.';return false;}
}
document.querySelector('#save-draft').addEventListener('click',save);
document.querySelector('#preview-draft').addEventListener('click',async event=>{
  event.preventDefault();
  const preview=window.open('about:blank','_blank');
  if(preview)preview.opener=null;
  if(await save()){if(preview)preview.location.href=`${path}?draft=1`;else status.textContent='Allow popups to preview the saved draft.';}
  else preview?.close();
});
document.querySelector('#page-picker').addEventListener('change',event=>{
  if(dirty && !confirm('Leave this page without saving your changes?')){event.target.value=path;return;}
  dirty=false;location.href=`/editor.html?page=${encodeURIComponent(event.target.value)}`;
});
document.querySelector('#reset-page').addEventListener('click',()=>{
  if(!confirm('Remove this page’s browser draft and restore the original design?'))return;
  try{localStorage.removeItem(`fr-draft:${path}`);}catch{status.textContent='Cannot access browser storage.';return;}
  dirty=false;location.reload();
});
document.querySelector('#export-page').addEventListener('click',async()=>{
  const button=document.querySelector('#export-page');button.disabled=true;button.textContent='Preparing…';
  try{
    await finishTextEdit();
    const template=document.createElement('template');template.innerHTML=editor.getHtml();
    const assetMap={};
    const sources=new Set([...template.content.querySelectorAll('img')].map(image=>image.getAttribute('src')));
    const dataElement=template.content.querySelector('#catalog-data');
    if(dataElement)for(const product of JSON.parse(dataElement.textContent).products)sources.add(product.image);
    await Promise.all([...sources].map(async source=>{
      const url=new URL(source,location.origin);if(url.origin!==location.origin)return;
      const response=await fetch(url);if(!response.ok)throw new Error('Image unavailable');
      const blob=await response.blob();
      assetMap[source]=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(blob);});
    }));
    for(const image of template.content.querySelectorAll('img')){const data=assetMap[image.getAttribute('src')];if(data)image.src=data;}
    const css=`${siteCss}\n${editor.getCss()}`.replaceAll('</style','<\\/style');
    const assets=JSON.stringify(assetMap).replaceAll('<','\\u003c');
    const script=`const assets=${assets};const renderCards=items=>{let html=(${renderProductCards.toString()})(items);for(const [url,data]of Object.entries(assets))html=html.replaceAll('src="'+url+'"','src="'+data+'"');return html;};const siteActions=(${initSite.toString()})(renderCards,${normaliseProducts.toString()});siteActions.refresh();`;
    const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${routes[path].title}</title><style>${css}</style></head><body>${template.innerHTML}<script>${script}</script></body></html>`;
    const url=URL.createObjectURL(new Blob([html],{type:'text/html'}));const link=document.createElement('a');link.href=url;link.download=`form-and-roar-${path==='/'?'home':path.split('/').filter(Boolean).join('-')}.html`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status.textContent='HTML exported · linked pages are separate';
  }catch{status.textContent='Export failed. Check that site images are available and try again.';}
  finally{button.disabled=false;button.textContent='Export HTML';}
});
const help=document.querySelector('#editor-help'),helpButton=document.querySelector('#show-help');
helpButton.addEventListener('click',()=>{help.hidden=!help.hidden;helpButton.setAttribute('aria-expanded',String(!help.hidden));});
document.querySelector('#close-help').addEventListener('click',()=>{help.hidden=true;helpButton.setAttribute('aria-expanded','false');helpButton.focus();});
window.addEventListener('beforeunload',event=>{if(dirty){event.preventDefault();event.returnValue='';}});
editor.on('load',()=>{
  editor.Panels.addButton('options',[{id:'device-desktop',label:'Desktop',command:()=>editor.setDevice('Desktop'),attributes:{title:'Desktop view'}},{id:'device-mobile',label:'Mobile',command:()=>editor.setDevice('Mobile'),attributes:{title:'Mobile view'}}]);
  dirty=false;
  lastSaved={html:editor.getHtml(),css:editor.getCss()};
});
