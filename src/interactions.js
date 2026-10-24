// Deliberately self-contained: this same function is embedded in the offline HTML.
export function initSite(renderCards,validateProducts){
 const states=new WeakMap();const media=matchMedia('(prefers-reduced-motion: reduce)');let activeTilt=null,frame=0,lastPoint=null,returnFocus=null;
 const paused=()=>media.matches||document.querySelector('#pause-motion')?.checked;
 function resetTilt(){
  if(frame)cancelAnimationFrame(frame);frame=0;lastPoint=null;
  if(activeTilt){for(const prop of ['--tilt-x','--tilt-y','--glare-x','--glare-y'])activeTilt.style.removeProperty(prop);activeTilt.removeAttribute('data-tilt-active');activeTilt=null;}
 }
 function moveTilt(event){
  const card=event.target.closest?.('[data-tilt]');
  if(!card||paused()||event.isPrimary===false)return;
  if(event.pointerType==='touch'&&event.type!=='pointerdown'&&!event.buttons)return;
  activeTilt=card;lastPoint={x:event.clientX,y:event.clientY};
  if(frame)return;
  frame=requestAnimationFrame(()=>{
   frame=0;if(!activeTilt?.isConnected||paused()||!lastPoint){resetTilt();return;}
   const bounds=(activeTilt.closest('.showcase-stage')||activeTilt).getBoundingClientRect();
   const x=Math.max(0,Math.min(1,(lastPoint.x-bounds.left)/bounds.width)),y=Math.max(0,Math.min(1,(lastPoint.y-bounds.top)/bounds.height));
   activeTilt.style.setProperty('--tilt-x',`${((.5-y)*10).toFixed(2)}deg`);
   activeTilt.style.setProperty('--tilt-y',`${((x-.5)*12).toFixed(2)}deg`);
   activeTilt.style.setProperty('--glare-x',`${(x*100).toFixed(1)}%`);activeTilt.style.setProperty('--glare-y',`${(y*100).toFixed(1)}%`);activeTilt.setAttribute('data-tilt-active','true');
  });
 }
 function getState(shell){
  if(states.has(shell))return states.get(shell);
  const config=JSON.parse(shell.querySelector('#catalog-data').textContent);let items=validateProducts(config.products);
  if(new URLSearchParams(location.search).get('catalog')==='draft'){
   const note=document.createElement('p');note.className='local-draft-banner';note.setAttribute('role','status');
   try{const raw=localStorage.getItem('fr-catalog-v1');if(raw){items=validateProducts(JSON.parse(raw));note.textContent='Local catalogue preview · Saved in this browser only. Not published.';}else note.textContent='No local catalogue draft found. Showing the original concepts.';}
   catch{note.textContent='The local draft could not be loaded. Showing the original concepts.';}
   shell.prepend(note);
  }
  try{const country=sessionStorage.getItem('fr-delivery-country');const select=shell.querySelector('#delivery-country');if([...select.options].some(o=>o.value===country))select.value=country;}catch{}
  if(items.some(p=>p.status==='active')){
   const notice=shell.querySelector('.catalog-disclosure');notice.querySelector('strong').textContent='Affiliate links';notice.querySelector('p').textContent='We may earn a commission from qualifying purchases through labelled seller links. Prices, stock, delivery and returns are confirmed by the seller. Any design previews are not offers for sale.';
  }
  const state={...config,products:items};states.set(shell,state);return state;
 }
 function filter(shell){
  const state=getState(shell),query=shell.querySelector('#product-search').value.trim().toLowerCase(),category=shell.querySelector('#product-category').value,country=shell.querySelector('#delivery-country').value;
  let items=state.products.filter(p=>(category==='all'||p.category===category)&&(!query||`${p.name} ${p.description} ${p.retailer}`.toLowerCase().includes(query))&&(p.status!=='active'||p.markets.includes(country)));
  if(shell.querySelector('#product-sort').value==='name')items=[...items].sort((a,b)=>a.name.localeCompare(b.name,'en'));
  shell.querySelector('.catalog-grid').innerHTML=renderCards(items);
  const live=items.filter(p=>p.status==='active').length,previews=items.length-live;
  shell.querySelector('.catalog-count').textContent=`${live} live ${live===1?'listing':'listings'}${previews?` · ${previews} design ${previews===1?'preview':'previews'}`:''}`;
 }
 function refresh(){resetTilt();document.querySelectorAll('.catalog-shell').forEach(filter);}
 document.addEventListener('input',event=>{if(event.target.id==='product-search')filter(event.target.closest('.catalog-shell'));});
 document.addEventListener('change',event=>{
  if(event.target.id==='pause-motion')resetTilt();
  if(['product-category','delivery-country','product-sort'].includes(event.target.id)){
   if(event.target.id==='delivery-country'){try{sessionStorage.setItem('fr-delivery-country',event.target.value);}catch{}}
   filter(event.target.closest('.catalog-shell'));
  }
 });
 document.addEventListener('click',event=>{
  const toggle=event.target.closest('.menu-toggle');if(toggle)toggle.setAttribute('aria-expanded',String(toggle.getAttribute('aria-expanded')!=='true'));
  const close=event.target.closest('.close-dialog');if(close)close.closest('dialog').close();
  const view=event.target.closest('[data-quick-view]');if(!view)return;
  const shell=view.closest('.catalog-shell');if(!shell)return;
  const product=getState(shell).products.find(p=>p.id===view.dataset.quickView);if(!product)return;
  const dialog=shell.querySelector('dialog');const holder=dialog.querySelector('.dialog-content');holder.innerHTML=renderCards([product]);
  holder.querySelector('h3').id='quick-view-title';
  if(!dialog.open){returnFocus=view;dialog.showModal();}
 });
 document.addEventListener('close',event=>{if(event.target.matches('.product-dialog'))returnFocus?.focus();},true);
 document.addEventListener('click',event=>{if(event.target.matches('.product-dialog')){const b=event.target.getBoundingClientRect();if(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom)event.target.close();}});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'){const toggle=document.querySelector('.menu-toggle');if(toggle?.getAttribute('aria-expanded')==='true'){toggle.setAttribute('aria-expanded','false');toggle.focus();}resetTilt();}});
 document.addEventListener('pointermove',moveTilt,{passive:true});document.addEventListener('pointerdown',moveTilt,{passive:true});
 document.addEventListener('pointerout',event=>{if(activeTilt&&!activeTilt.contains(event.relatedTarget))resetTilt();},{passive:true});
 for(const name of ['pointerup','pointercancel'])document.addEventListener(name,event=>{if(event.pointerType!=='mouse')resetTilt();},{passive:true});
 window.addEventListener('blur',resetTilt);media.addEventListener('change',resetTilt);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)resetTilt();});
 return {refresh};
}
