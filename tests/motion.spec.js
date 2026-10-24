import { test, expect } from '@playwright/test';

test('the whole showcase floats and tilts with pointer position, while pause and reduced motion disable it',async({page})=>{
 await page.goto('/');
 expect(await page.locator('.hero-description').evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(17);
 const stage=page.locator('.showcase-stage'),card=page.locator('[data-tilt]');
 const initial=await stage.evaluate(el=>getComputedStyle(el).transform);await expect.poll(()=>stage.evaluate(el=>getComputedStyle(el).transform)).not.toBe(initial);
 const bounds=await card.boundingBox();await page.mouse.move(bounds.x+bounds.width*.8,bounds.y+bounds.height*.25);
 await expect(card).toHaveAttribute('data-tilt-active','true');
 const first=await card.evaluate(el=>el.style.getPropertyValue('--tilt-y'));await page.mouse.move(bounds.x+bounds.width*.2,bounds.y+bounds.height*.7);
 await expect.poll(()=>card.evaluate(el=>el.style.getPropertyValue('--tilt-y'))).not.toBe(first);
 await page.getByRole('checkbox',{name:'Pause motion'}).check();await expect(card).not.toHaveAttribute('data-tilt-active');
 await expect.poll(()=>stage.evaluate(el=>el.getAnimations().every(a=>a.playState==='paused'))).toBe(true);
 await page.getByRole('checkbox',{name:'Pause motion'}).uncheck();await page.locator('.solid-link').first().hover();
 expect(await page.locator('.solid-link').first().evaluate(el=>getComputedStyle(el,'::before').animationName)).toBe('card-shine');
 await page.locator('.category-card').first().hover();expect(await page.locator('.category-card').first().evaluate(el=>getComputedStyle(el,'::before').animationName)).toBe('card-shine');
 await page.emulateMedia({reducedMotion:'reduce'});await page.mouse.move(bounds.x+bounds.width*.8,bounds.y+bounds.height*.25);
 await expect(card).not.toHaveAttribute('data-tilt-active');expect(await card.evaluate(el=>getComputedStyle(el).transform)).toBe('none');
 expect(await page.locator('.marquee-track').evaluate(el=>getComputedStyle(el).animationName)).toBe('none');await expect(page.locator('.marquee-group[aria-hidden=true]')).toBeHidden();
});

test('touch tilt follows a drag and cancels without preventing vertical scrolling',async({browser})=>{
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const page=await context.newPage();await page.goto('http://127.0.0.1:4173/');
 const card=page.locator('[data-tilt]');await card.evaluate(el=>el.scrollIntoView({block:'center'}));const b=await card.boundingBox();
 await card.dispatchEvent('pointerdown',{pointerType:'touch',isPrimary:true,buttons:1,clientX:b.x+b.width*.2,clientY:b.y+b.height*.4});
 await expect(card).toHaveAttribute('data-tilt-active','true');const initial=await card.evaluate(el=>el.style.getPropertyValue('--tilt-y'));
 await card.dispatchEvent('pointermove',{pointerType:'touch',isPrimary:true,buttons:1,clientX:b.x+b.width*.8,clientY:b.y+b.height*.6});
 await expect.poll(()=>card.evaluate(el=>el.style.getPropertyValue('--tilt-y'))).not.toBe(initial);
 await card.dispatchEvent('pointercancel',{pointerType:'touch'});await expect(card).not.toHaveAttribute('data-tilt-active');
 expect(await card.evaluate(el=>getComputedStyle(el).touchAction)).toBe('pan-y');
 const session=await context.newCDPSession(page);const y=b.y+b.height*.7,x=b.x+b.width*.5,before=await page.evaluate(()=>scrollY);
 await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
 for(const distance of [30,70,120,170])await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y-distance}]});
 await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(before);await context.close();
});
