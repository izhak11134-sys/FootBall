import catalogData from './products.json' with { type: 'json' };
export const categories=[
 {id:'shirts',path:'/shirts-style',name:'Shirts & Style',description:'Football shirts with a place in your everyday wardrobe.',image:'/images/shirt.svg'},
 {id:'retro',path:'/retro',name:'Retro Shirts',description:'Past-season character. A considered approach to the classics.',image:'/images/archive.svg'},
 {id:'fanwear',path:'/fanwear',name:'Fanwear & Accessories',description:'The layers and finishing touches around the game.',image:'/images/style.svg'},
 {id:'collectibles',path:'/collectibles',name:'Collectibles',description:'Objects for the space you make for football.',image:'/images/stadium.svg'},
 {id:'gifts',path:'/gifts',name:'Football Gifts',description:'A little thought for someone who lives the game.',image:'/images/football.svg'},
];
export const markets=[['GB','United Kingdom'],['AT','Austria'],['BE','Belgium'],['BG','Bulgaria'],['HR','Croatia'],['CY','Cyprus'],['CZ','Czechia'],['DK','Denmark'],['EE','Estonia'],['FI','Finland'],['FR','France'],['DE','Germany'],['GR','Greece'],['HU','Hungary'],['IS','Iceland'],['IE','Ireland'],['IT','Italy'],['LV','Latvia'],['LI','Liechtenstein'],['LT','Lithuania'],['LU','Luxembourg'],['MT','Malta'],['NL','Netherlands'],['NO','Norway'],['PL','Poland'],['PT','Portugal'],['RO','Romania'],['SK','Slovakia'],['SI','Slovenia'],['ES','Spain'],['SE','Sweden'],['CH','Switzerland'],['AL','Albania'],['AD','Andorra'],['BA','Bosnia and Herzegovina'],['MC','Monaco'],['ME','Montenegro'],['MK','North Macedonia'],['SM','San Marino'],['RS','Serbia'],['UA','Ukraine'],['MD','Moldova'],['TR','Türkiye'],['XK','Kosovo']];
export const products=normaliseProducts(catalogData);

// Shared by the local manager and the standalone reader. No HTML or executable URLs are accepted.
export function normaliseProducts(input){
 const list=Array.isArray(input)?input:input?.products;
 if(!Array.isArray(list)||list.length>200)throw new Error('Import a product array containing at most 200 items.');
 const ids=new Set();const countries=new Set(['GB','AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IS','IE','IT','LV','LI','LT','LU','MT','NL','NO','PL','PT','RO','SK','SI','ES','SE','CH','AL','AD','BA','MC','ME','MK','SM','RS','UA','MD','TR','XK']);
 return list.map((p,i)=>{
  const text=(value,max)=>typeof value==='string'?value.trim().slice(0,max):'';
  const id=text(p?.id,60),name=text(p?.name,100),category=text(p?.category,30),status=p?.status==='active'?'active':'preview';
  if(!/^[a-z0-9][a-z0-9-]*$/.test(id)||ids.has(id))throw new Error(`Item ${i+1}: use a unique lowercase ID, with letters, numbers and hyphens.`);
  ids.add(id);if(!name||!['shirts','retro','fanwear','collectibles','gifts'].includes(category))throw new Error(`Item ${i+1}: name and a valid category are required.`);
  const image=text(p.image,2048)||'/images/shirt.svg';
  if(!/^\/images\/[a-z0-9-]+\.svg$/.test(image)&&!/^https:\/\//i.test(image))throw new Error(`Item ${i+1}: use a local illustration or HTTPS image URL.`);
  if(/^https:/i.test(image)){const u=new URL(image);if(u.username||u.password)throw new Error('Image URLs must not contain credentials.');}
  const url=text(p.url,4096),retailer=text(p.retailer,100),selected=Array.isArray(p.markets)?[...new Set(p.markets.filter(m=>countries.has(m)))]:[];
  if(url){let u;try{u=new URL(url);}catch{throw new Error(`Item ${i+1}: invalid seller URL.`);}if(u.protocol!=='https:'||u.username||u.password)throw new Error('Seller links must use HTTPS without credentials.');}
  const price=p.price===null||p.price===''||p.price===undefined?null:Number(p.price);
  if(price!==null&&(!Number.isFinite(price)||price<=0))throw new Error(`Item ${i+1}: enter a positive price or leave it blank.`);
  const currency=['GBP','EUR','CHF','SEK','NOK','DKK','PLN','CZK','HUF','RON'].includes(p.currency)?p.currency:'GBP';
  const date=text(p.priceCheckedAt,10);
  if(price!==null&&(!/^\d{4}-\d{2}-\d{2}$/.test(date)||Number.isNaN(Date.parse(date))||date>new Date().toISOString().slice(0,10)))throw new Error(`Item ${i+1}: add a valid past or current price-check date, or remove the price.`);
  if(status==='active'&&(!url||!retailer||!selected.length||p.rightsConfirmed!==true))throw new Error(`Item ${i+1}: active listings need a seller, HTTPS link, delivery countries and confirmed image/link permission.`);
  return {id,name,category,status,image,description:text(p.description,500),retailer,url,markets:selected,price,currency,priceCheckedAt:date,rightsConfirmed:p.rightsConfirmed===true};
 });
}

export function renderProductCards(items){
 const arrow='<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 19 19 5M5 5h14v14"/></svg>';
 const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 if(!items.length)return '<div class="catalog-empty"><h3>No matching selections yet.</h3><p>Try another category or country. We do not have a connected seller for every destination.</p></div>';
 return items.map(p=>{
  const active=p.status==='active';const price=active&&p.price!==null&&p.priceCheckedAt?new Intl.NumberFormat('en-GB',{style:'currency',currency:p.currency}).format(p.price):'';
  return `<article class="product-card"><button class="product-image story-image" type="button" data-quick-view="${escape(p.id)}" aria-label="View details: ${escape(p.name)}"><img src="${escape(p.image)}" alt="${escape(p.name)}${active?'':' — original concept illustration'}" width="1000" height="1050" loading="lazy"><span class="product-badge">${active?'Selected item':'Design preview'}</span><span class="quick-view-label">Quick view ${arrow}</span></button><div class="product-meta"><span>${escape(p.category==='fanwear'?'FANWEAR':p.category.toUpperCase())}</span><span>${active?escape(p.retailer):'ILLUSTRATIVE CONCEPT'}</span></div><h3><button type="button" data-quick-view="${escape(p.id)}">${escape(p.name)}</button></h3><p>${escape(p.description)}</p><div class="product-price">${price?`${escape(price)}<small>Listed price · checked ${escape(p.priceCheckedAt)}</small>`:active?'See current price at seller':'No seller connected'}</div>${active?`<a class="seller-link solid-link" href="${escape(p.url)}" target="_blank" rel="sponsored noopener noreferrer">View at ${escape(p.retailer)} ${arrow}</a><p class="affiliate-label">Affiliate link · Check delivery and final price at the seller.</p>`:'<span class="preview-action">Preview only · Not for sale</span>'}</article>`;
 }).join('');
}
