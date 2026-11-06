import { test,expect } from '@playwright/test';
import { renderOwnerShortcut } from '../src/owner-shortcut.js';
import owner from '../src/owner-config.json' with { type: 'json' };

test('management shortcut is absent for visitors and shown only for the owner session',async({page})=>{
 await page.goto('/');await expect(page.locator('#owner-shortcut')).toHaveCount(0);await expect(page.locator('a[href="/admin.html"]')).toHaveCount(0);
 const render=async user=>page.evaluate(({fn,user,uid})=>{const apply=new Function('return ('+fn+')')();apply(user,uid);},{fn:renderOwnerShortcut.toString(),user,uid:owner.primaryUid});
 await render(null);await expect(page.locator('#owner-shortcut')).toHaveCount(0);
 await render({uid:'someone-else'});await expect(page.locator('#owner-shortcut')).toHaveCount(0);
 await render({uid:owner.primaryUid});await expect(page.getByRole('link',{name:'Manage website — owner access'})).toBeVisible();await expect(page.locator('#owner-shortcut')).toHaveAttribute('href','/admin');
 await render(null);await expect(page.locator('#owner-shortcut')).toHaveCount(0);
});
