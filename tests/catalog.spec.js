import { test, expect } from '@playwright/test';
import { normaliseProducts } from '../src/catalog.js';

test('unsafe and incomplete seller configurations are rejected',()=>{
 const base={id:'test-item',name:'Test shirt',category:'shirts',status:'active',image:'/images/shirt.svg',url:'https://retailer.example/shirt',retailer:'Test retailer',markets:['GB'],rightsConfirmed:true};
 expect(()=>normaliseProducts([{...base,url:'javascript:alert(1)'}])).toThrow(/HTTPS/);
 expect(()=>normaliseProducts([{...base,markets:[]}])).toThrow(/delivery countries/);
 expect(()=>normaliseProducts([{...base,rightsConfirmed:false}])).toThrow(/permission/);
 expect(()=>normaliseProducts([{...base,image:'data:text/html,unsafe'}])).toThrow(/image/);
 expect(normaliseProducts([base])[0].url).toBe(base.url);
});

test('catalogue filters and quick view expose previews honestly',async({page})=>{
 await page.goto('/catalog');await expect(page.locator('.catalog-grid .product-card')).toHaveCount(6);await expect(page.locator('.catalog-grid .seller-link')).toHaveCount(0);
 await page.getByLabel('Category',{exact:true}).selectOption('shirts');await expect(page.locator('.catalog-grid .product-card')).toHaveCount(2);
 await page.getByLabel('Delivery destination').selectOption('FR');await expect(page.locator('.catalog-grid .product-card')).toHaveCount(2);
 await page.getByLabel('Find a piece').fill('no-such-shirt');await expect(page.locator('.catalog-empty')).toBeVisible();
 await page.getByLabel('Find a piece').fill('heritage');await page.locator('.catalog-grid .product-image').click();
 await expect(page.getByRole('dialog')).toBeVisible();await expect(page.getByRole('dialog')).toContainText('Preview only');await page.getByRole('button',{name:'Close product details'}).click();await expect(page.getByRole('dialog')).not.toBeVisible();
});

test('the local manager saves, exports and previews a configured listing without publishing it',async({page})=>{
 const name='<img src=x onerror=alert(1)> Test shirt';await page.goto('/manage.html');await page.getByRole('button',{name:'Add item',exact:true}).click();
 await page.getByLabel('Name',{exact:true}).fill(name);await page.getByLabel('Listing status').selectOption('active');await page.getByLabel('Seller name').fill('Test retailer');await page.getByLabel('Seller / affiliate URL').fill('https://retailer.example/shirt?ref=test');await page.getByLabel('Delivery countries').selectOption('GB');
 await page.getByLabel('I have permission').check();await page.getByRole('button',{name:'Save item & browser draft'}).click();await expect(page.getByRole('status')).toContainText('Item saved');
 const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Export catalogue JSON'}).click();const file=await downloadPromise;const stream=await file.createReadStream();let json='';for await(const chunk of stream)json+=chunk.toString();expect(JSON.parse(json).products).toHaveLength(7);
 const popupPromise=page.waitForEvent('popup');await page.getByRole('link',{name:'Preview saved draft'}).click();const preview=await popupPromise;await expect(preview.locator('.local-draft-banner')).toContainText('Not published');
 await preview.getByLabel('Find a piece').fill('Test shirt');await expect(preview.locator('.catalog-grid .product-card')).toHaveCount(1);await expect(preview.locator('.catalog-grid h3')).toHaveText(name);await expect(preview.locator('img[src="x"]')).toHaveCount(0);
 const link=preview.getByRole('link',{name:'View at Test retailer'});await expect(link).toHaveAttribute('href','https://retailer.example/shirt?ref=test');await expect(link).toHaveAttribute('rel',/sponsored/);
 await preview.getByLabel('Delivery destination').selectOption('DE');await expect(preview.locator('.catalog-empty')).toBeVisible();await preview.close();
 await page.goto('/catalog');await expect(page.locator('.catalog-grid .product-card')).toHaveCount(6);await expect(page.locator('.catalog-grid .seller-link')).toHaveCount(0);
});
