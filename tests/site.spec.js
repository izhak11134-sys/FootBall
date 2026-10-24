import { test, expect } from '@playwright/test';
import { routes } from '../src/content.js';

test('every catalogue and information page renders, assets load and internal links resolve',async({page,request})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const links=new Set();
  for(const path of Object.keys(routes)){
    const response=await page.goto(path);expect(response.status()).toBe(200);
    await expect(page.locator('main h1')).toHaveCount(1);
    await expect(page.locator('main h1')).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang','en');
    const images=await page.locator('img').evaluateAll(images=>images.map(i=>i.getAttribute('src')));
    for(const image of new Set(images))expect((await request.get(image)).status()).toBe(200);
    for(const href of await page.locator('a[href^="/"]').evaluateAll(a=>a.map(a=>a.getAttribute('href'))))links.add(href);
  }
  for(const link of links)expect(Object.hasOwn(routes,link),`Known link ${link}`).toBe(true);
  expect(errors).toEqual([]);
});

test('mobile layout fits and navigation works by keyboard',async({page})=>{
  for(const width of [320,390,768]){
    await page.setViewportSize({width,height:844});
    for(const path of Object.keys(routes)){
      await page.goto(path);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),path).toBe(true);
      expect(await page.locator('h1,h2,h3').evaluateAll(headings=>headings.every(h=>h.scrollWidth<=h.clientWidth+1)),`Unclipped headings on ${path}`).toBe(true);
    }
  }
  await page.setViewportSize({width:390,height:844});
  await page.goto('/');
  const menu=page.getByRole('button',{name:'Menu'});
  await menu.click();await expect(menu).toHaveAttribute('aria-expanded','true');
  await page.keyboard.press('Escape');await expect(menu).toHaveAttribute('aria-expanded','false');
  await menu.click();await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Shirts & Style',exact:true}).click();
  await expect(page).toHaveURL(/\/shirts-style$/);await expect(page.locator('h1')).toContainText('Shirts & Style');
});

test('visual editor saves browser drafts, previews changes and exports a self-contained page',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/editor.html');
  const canvas=page.frameLocator('.gjs-frame');
  await expect(canvas.locator('h1')).toBeVisible({timeout:30000});
  expect(await canvas.locator('h1').evaluate(h=>parseFloat(getComputedStyle(h).fontSize))).toBeGreaterThan(70);
  // Double-click uses the editor’s actual rich text editing flow.
  const title=canvas.locator('h1');await title.dblclick();
  await expect(canvas.locator('[contenteditable="true"]')).toBeVisible();
  await page.keyboard.press('ControlOrMeta+A');await page.keyboard.type('Movement with meaning.');
  await page.getByRole('button',{name:'Save draft',exact:true}).click();
  await expect(page.getByRole('status')).toHaveText('Draft saved in this browser');
  await page.reload();await expect(page.frameLocator('.gjs-frame').locator('h1')).toHaveText('Movement with meaning.');
  const previewPromise=page.waitForEvent('popup');await page.getByRole('link',{name:'Preview'}).click();
  const preview=await previewPromise;await expect(preview.locator('h1')).toHaveText('Movement with meaning.');await expect(preview.locator('.catalog-grid .product-card')).toHaveCount(6);await preview.close();
  const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Export HTML'}).click();
  const download=await downloadPromise;expect(download.suggestedFilename()).toBe('form-and-roar-home.html');
  const stream=await download.createReadStream();let content='';for await(const chunk of stream)content+=chunk.toString();
  expect(content).toContain('Movement with meaning.');expect(content).toContain('data:image/svg+xml;base64,');expect(content).toContain('<style>');
  const offline=await page.context().newPage();await offline.route('**/*',route=>route.abort());await offline.setContent(content);await expect(offline.locator('.catalog-grid .product-card')).toHaveCount(6);await offline.getByLabel('Category',{exact:true}).selectOption('retro');await offline.locator('img').evaluateAll(images=>images.forEach(i=>i.loading='eager'));await expect.poll(()=>offline.locator('img').evaluateAll(images=>images.every(i=>i.complete&&i.naturalWidth>0))).toBe(true);await offline.close();
  await page.goto('/');await expect(page.locator('h1')).toContainText('More than');
  expect(errors).toEqual([]);
});
