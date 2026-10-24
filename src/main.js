import './styles.css';
import { initSite } from './interactions.js';
import { renderProductCards, normaliseProducts } from './catalog.js';
const path=location.pathname.replace(/\/index\.html$/,'').replace(/\.html$/,'').replace(/\/$/,'')||'/';
let draft;try{draft=JSON.parse(localStorage.getItem(`fr-draft:${path}`));}catch{}
const preview=new URLSearchParams(location.search).get('draft')==='1';
if(preview&&draft?.html)document.querySelector('#app').innerHTML=draft.html;
if(preview&&draft?.css){const style=document.createElement('style');style.textContent=draft.css;document.head.append(style);}
initSite(renderProductCards,normaliseProducts).refresh();
