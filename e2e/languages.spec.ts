import { expect, test } from '@playwright/test';

const BASE = process.env.E2E_BASE ?? '/ai-risk-observatory/';

test('an unpublished language falls back to the English page', async ({ page }) => {
  await page.goto(BASE + 'de/rules/eu/');
  await expect(page).toHaveURL(new RegExp(`${BASE}rules/eu/$`));
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('.lang-switch')).toHaveCount(0); // hidden while English is the only published language
});

test.describe('preview mode', () => {
  test.beforeEach(async ({ page }) => { await page.addInitScript(() => localStorage.setItem('are-preview-locales', '1')); });

  test('Arabic pages are right-to-left, keep their language in links, and do not overflow', async ({ page }) => {
    for (const p of ['ar/', 'ar/rules/eu/', 'ar/register/', 'ar/toolkit/', 'fa/sectors/', 'ar/model/credit/']) {
      await page.goto(BASE + p);
      await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
      await expect(page.locator('h1').first()).toBeVisible();
      const hrefs = await page.locator('header a[href]').evaluateAll((as) => as.map((a) => a.getAttribute('href')!));
      for (const h of hrefs.filter((h) => h.startsWith(BASE) && h.length > BASE.length)) expect(h, p).toMatch(new RegExp(`^${BASE}(ar|fa)/`));
      const over = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      expect(over, p).toBeLessThanOrEqual(1);
    }
  });

  test('in-page navigation stays in the language; the switch changes it', async ({ page }) => {
    await page.goto(BASE + 'fr/rules/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    await page.locator('a[href$="/fr/rules/eu/"]').first().click();
    await expect(page).toHaveURL(new RegExp(`${BASE}fr/rules/eu/$`));
    // on phones the switch lives in the menu panel
    if (await page.locator('.burger').isVisible()) await page.locator('.burger').click();
    await page.locator('.lang-switch select:visible').first().selectOption('zh');
    await expect(page).toHaveURL(new RegExp(`${BASE}zh/rules/eu/$`));
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-Hans');
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  });
});
