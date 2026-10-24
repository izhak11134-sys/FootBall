import { categories } from './catalog.js';
export const routes={
 '/':{title:'Form & Roar — Football finds. Chosen with feeling.',description:'A curated football shopping concept for the UK and Europe. Shirts, retro, fanwear, collectibles and gifts.'},
 '/catalog':{title:'All Selections — Form & Roar',description:'Explore the football selection by category and delivery destination.'},
 ...Object.fromEntries(categories.map(c=>[c.path,{title:`${c.name} — Form & Roar`,description:c.description}])),
 '/about':{title:'About Form & Roar',description:'A football-first product discovery concept for the UK and Europe.'},
 '/how-we-choose':{title:'How We Choose — Form & Roar',description:'Our approach to product selection, seller information and availability.'},
 '/affiliate-disclosure':{title:'Affiliate Disclosure — Form & Roar',description:'How future affiliate links work and what is currently connected.'},
 '/contact':{title:'Contact — Form & Roar',description:'Contact and publisher information before launch.'},
 '/privacy':{title:'Privacy — Form & Roar',description:'Data and local draft storage in this prototype.'},
 '/accessibility':{title:'Accessibility — Form & Roar',description:'Our accessibility approach and motion controls.'},
};
export const normalisePath=path=>path.replace(/\/index\.html$/,'').replace(/\.html$/,'').replace(/\/$/,'')||'/';
