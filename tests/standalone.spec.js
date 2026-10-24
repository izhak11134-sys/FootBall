import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { routes } from '../src/content.js';

test('the complete product catalogue works offline, including filters, details, images and history',async({page,context})=>{
 const errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url());});
 await context.setOffline(true);await page.setContent(await readFile(new URL('../downloads/form-and-roar.html',import.meta.url),'utf8'));
 for(const [path,meta] of Object.entries(routes)){
  await page.evaluate(path=>{location.hash=`#${path}`;},path);await expect(page).toHaveTitle(meta.title);await expect(page.locator('main h1')).toBeVisible();
  await page.locator('img').evaluateAll(images=>images.forEach(i=>i.loading='eager'));
  await expect.poll(()=>page.locator('img').evaluateAll(images=>images.every(i=>i.complete&&i.naturalWidth>0))).toBe(true);
 }
 await page.evaluate(()=>{location.hash='#/';});await expect(page.locator('h1')).toContainText('More than');
 await expect(page.locator('.catalog-grid .product-card')).toHaveCount(6);
 await page.getByLabel('Find a piece').fill('retro');await expect(page.locator('.catalog-grid .product-card')).toHaveCount(1);
 await page.locator('.product-image').click();await expect(page.getByRole('dialog')).toBeVisible();await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).not.toBeVisible();
 await page.getByRole('link',{name:'Explore shirts & style',exact:true}).click();await expect(page.locator('h1')).toHaveText('Shirts & Style.');await expect(page.locator('.catalog-grid .product-card')).toHaveCount(2);
 await page.goBack();await expect(page.locator('h1')).toContainText('More than');
 await page.setViewportSize({width:390,height:844});await page.getByRole('button',{name:'Menu'}).click();await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Retro',exact:true}).click();
 await expect(page.locator('h1')).toHaveText('Retro Shirts.');await page.getByLabel('Delivery destination').selectOption('DE');await expect(page.locator('.catalog-grid .product-card')).toHaveCount(1);
 expect(requests).toEqual([]);expect(errors).toEqual([]);
});
