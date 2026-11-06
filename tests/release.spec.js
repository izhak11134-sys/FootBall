import { test,expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { parseFirebaseConfig } from '../src/firebase-config.js';
import { getPublishingConfig,makeSitemap } from '../scripts/publishing.js';
import { routes } from '../src/content.js';

test('publishing metadata requires a real HTTPS origin and leaves previews unindexed',()=>{
 expect(getPublishingConfig({})).toEqual({origin:'',indexable:false});
 expect(()=>getPublishingConfig({SITE_INDEXABLE:'true'})).toThrow(/SITE_URL/);
 expect(()=>getPublishingConfig({SITE_URL:'https://user:password@example.test/'})).toThrow(/credentials/);
 const config=getPublishingConfig({SITE_URL:'https://example.test',SITE_INDEXABLE:'true'});expect(makeSitemap(config,routes)).toContain('https://example.test/catalog');expect(makeSitemap(config,routes)).not.toContain('/admin');
 expect(parseFirebaseConfig({})).toBeNull();expect(()=>parseFirebaseConfig({projectId:'FormAndRoar'})).toThrow(/four/);
 expect(parseFirebaseConfig({apiKey:'AIza'+'x'.repeat(35),authDomain:'formandroar-ae8f9.firebaseapp.com',projectId:'formandroar-ae8f9',appId:'1:123456:web:abc123'}).projectId).toBe('formandroar-ae8f9');
});
test('unknown pages return a real 404 with working navigation',async({page})=>{const response=await page.goto('/this-page-does-not-exist');expect(response.status()).toBe(404);await expect(page.locator('h1')).toHaveText('A different direction.');await page.getByRole('link',{name:'Explore the catalogue'}).click();await expect(page.locator('h1')).toHaveText('All Selections.');});
test('the owner area remains locked and explains missing Firebase setup',async({page})=>{await page.goto('/admin.html');await expect(page.getByRole('status')).toContainText('Management is not connected');await expect(page.getByRole('button',{name:'Sign in',exact:true})).toBeDisabled();await expect(page.locator('#cloud-workspace')).toBeHidden();});
test('automated accessibility checks pass for home, catalogue, product details and owner sign-in',async({page})=>{
 for(const path of ['/','/catalog','/contact','/admin.html']){
  await page.goto(path);await page.emulateMedia({reducedMotion:'reduce'});
  const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(results.violations,`Accessibility on ${path}`).toEqual([]);
 }
 await page.goto('/catalog');await page.locator('.product-image').first().click();const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(result.violations).toEqual([]);
});
