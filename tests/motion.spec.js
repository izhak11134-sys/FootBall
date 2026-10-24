import { test, expect } from '@playwright/test';

test('reading sizes, whole-card motion, shine and accessible motion controls work together',async({page})=>{
  await page.goto('/');
  expect(await page.locator('.hero-description').evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(17);
  expect(await page.locator('.solid-link').evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(16);
  const floating=page.locator('.hero-visual');
  const initial=await floating.evaluate(el=>getComputedStyle(el).transform);
  await expect.poll(()=>floating.evaluate(el=>getComputedStyle(el).transform)).not.toBe(initial);
  // The caption and artwork share the animated card, rather than animating independently.
  await expect(floating.locator('.hero-art-footer')).toBeVisible();
  await expect.poll(()=>page.locator('.marquee-track').evaluate(el=>el.getAnimations().some(a=>a.playState==='running'))).toBe(true);
  await page.getByRole('checkbox',{name:'Pause motion'}).check();
  await expect.poll(()=>page.locator('.marquee-track').evaluate(el=>el.getAnimations().every(a=>a.playState==='paused'))).toBe(true);
  await expect.poll(()=>floating.evaluate(el=>el.getAnimations().every(a=>a.playState==='paused'))).toBe(true);
  await page.getByRole('checkbox',{name:'Pause motion'}).uncheck();
  await page.locator('.solid-link').hover();
  expect(await page.locator('.solid-link').evaluate(el=>getComputedStyle(el,'::before').animationName)).toBe('card-shine');
  await page.locator('.category-card').first().hover();
  expect(await page.locator('.category-card').first().evaluate(el=>getComputedStyle(el,'::before').animationName)).toBe('card-shine');
  await page.emulateMedia({reducedMotion:'reduce'});
  expect(await floating.evaluate(el=>getComputedStyle(el).animationName)).toBe('none');
  expect(await page.locator('.marquee-track').evaluate(el=>getComputedStyle(el).animationName)).toBe('none');
  await expect(page.locator('.marquee-group[aria-hidden=true]')).toBeHidden();
  await expect(page.locator('.marquee-group').first()).toContainText('FOOTBALL, EVERY DAY');
});
