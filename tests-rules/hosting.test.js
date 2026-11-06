import { test } from 'node:test';
import assert from 'node:assert/strict';
const base='http://127.0.0.1:5006';
test('Firebase Hosting serves clean catalogue paths, 404s and owner security headers',async()=>{
 const home=await fetch(base+'/');assert.equal(home.status,200);assert.match(await home.text(),/Form &amp; Roar/);
 const catalogue=await fetch(base+'/catalog');assert.equal(catalogue.status,200);assert.match(await catalogue.text(),/All Selections/);
 const missing=await fetch(base+'/no-such-page');assert.equal(missing.status,404);assert.match(await missing.text(),/A different direction/);
 const admin=await fetch(base+'/admin');assert.equal(admin.status,200);assert.match(admin.headers.get('content-security-policy')||'',/frame-ancestors 'none'/);assert.match(admin.headers.get('cache-control')||'',/no-store/);assert.match(admin.headers.get('x-robots-tag')||'',/noindex/);
 assert.equal(home.headers.get('x-content-type-options'),'nosniff');
});
