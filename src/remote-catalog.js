import { getFirebaseConfig } from './firebase-config.js';
import { normaliseProducts } from './catalog.js';
export async function connectPublishedCatalog(actions){
 let config;
 try{config=getFirebaseConfig();}catch{document.querySelectorAll('.catalog-count').forEach(el=>{el.textContent='Catalogue connection is not configured correctly.';});return;}
 if(!config||new URLSearchParams(location.search).get('catalog')==='draft')return;
 if(!document.querySelector('.catalog-shell'))return;
 const shells=[...document.querySelectorAll('.catalog-shell')];
 for(const shell of shells){shell.setAttribute('aria-busy','true');shell.querySelector('.catalog-count').textContent='Loading the selection…';shell.querySelector('.catalog-grid').replaceChildren();}
 function fail(){for(const shell of shells){shell.removeAttribute('aria-busy');shell.querySelector('.catalog-count').textContent='Selection temporarily unavailable';shell.querySelector('.catalog-grid').innerHTML='<div class="catalog-empty"><h3>We couldn’t load the selection.</h3><p>Please try again in a moment.</p><button type="button" class="reset-filters" data-reload-catalog>Try again</button></div>';}}
 const timer=setTimeout(fail,12000);
 try{
  const [{getFirebaseServices},{collection,query,where,onSnapshot}]=await Promise.all([import('./firebase-client.js'),import('firebase/firestore')]);
  const {db}=getFirebaseServices();
  const unsubscribe=onSnapshot(query(collection(db,'catalogProducts'),where('published','==',true)),{includeMetadataChanges:true},snapshot=>{
   try{
    if(snapshot.metadata.fromCache&&snapshot.empty)return;clearTimeout(timer);
    const records=snapshot.docs.map(doc=>({id:doc.id,...doc.data()})).sort((a,b)=>(a.position??0)-(b.position??0)||a.id.localeCompare(b.id));
    const products=normaliseProducts(records.map(row=>({...row.product,id:row.id})));
    if(products.some(product=>product.status!=='active'))throw new Error('Invalid published listing.');
    actions.refresh(products);for(const shell of shells){shell.removeAttribute('aria-busy');shell.querySelector('.market-note').textContent='The selection is filtered by configured delivery countries. Confirm shipping, stock, taxes and the final price with the seller.';const notice=shell.querySelector('.catalog-disclosure');notice.querySelector('strong').textContent='Affiliate links';notice.querySelector('p').textContent='We may earn a commission from qualifying purchases through labelled seller links. You buy directly from the retailer. Final prices, availability, delivery and returns are confirmed there.';}
    const footnote=document.querySelector('.hero-footnote p>span');if(footnote)footnote.textContent='Discover by category and delivery destination.';
   }catch{clearTimeout(timer);fail();}
  },()=>{clearTimeout(timer);fail();});
  window.addEventListener('pagehide',()=>{clearTimeout(timer);unsubscribe();},{once:true});return unsubscribe;
 }catch{clearTimeout(timer);fail();}
}
