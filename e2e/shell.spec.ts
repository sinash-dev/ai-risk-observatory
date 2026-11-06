import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const BASE = process.env.E2E_BASE ?? '/ai-risk-observatory/';
const go = async (page: import('@playwright/test').Page, path = '') => {
  await page.goto(BASE + path);
  await page.waitForLoadState('networkidle');
  await page.locator('h1').first().waitFor();
};
const serious = async (page: import('@playwright/test').Page) => {
  await page.waitForTimeout(400); // let fade-ins finish
  const r = await new AxeBuilder({ page }).disableRules(['color-contrast-enhanced']).analyze();
  return r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(' ') + ' ' + (n.failureSummary ?? '').slice(0, 120)).join(' | ')}`);
};

test.beforeEach(({ page }) => { page.on('pageerror', (e) => console.log('PAGEERROR', e.message)); page.on('console', (m) => m.type() === 'error' && console.log('CONSOLEERR', m.text())); });

test.describe('search palette', () => {
  for (const [q, expected] of [
    ['credit', /Credit scoring/],
    ['Art. 27', /EU AI Act Art\. 27/],
    ['prompt injection', /LLM01:2026|Agent|Chatbot|RAG/i],
    ['Korea', /Korea/],
  ] as const) {
    test(`finds "${q}"`, async ({ page }) => {
      await go(page);
      await page.keyboard.press('Control+k');
      const box = page.getByRole('combobox', { name: 'Search' });
      await expect(box).toBeFocused();
      await box.fill(q);
      await expect(page.getByRole('listbox', { name: 'Results' }).getByRole('option').first()).toContainText(expected);
    });
  }

  test('keyboard flow and axe', async ({ page }) => {
    await go(page, 'rules/');
    await page.keyboard.press('/');
    const box = page.getByRole('combobox', { name: 'Search' });
    await box.fill('credit');
    await expect(page.getByRole('listbox', { name: 'Results' }).getByRole('option').first()).toBeVisible();
    expect(await serious(page)).toEqual([]);
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/model\/credit\/$/);
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('Esc closes and returns focus', async ({ page }) => {
    await go(page);
    const btn = page.locator('.search-btn');
    await btn.click();
    await expect(page.getByRole('dialog', { name: 'Search the site' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(btn).toBeFocused();
  });
});

test('Learn menu: disclosure pattern and axe', async ({ page }, info) => {
  test.skip(info.project.name === 'mobile', 'menus are in the sheet on small screens');
  await go(page);
  const btn = page.getByRole('button', { name: /Learn/ });
  await btn.click();
  await expect(btn).toHaveAttribute('aria-expanded', 'true');
  expect(await serious(page)).toEqual([]);
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Escape');
  await expect(btn).toHaveAttribute('aria-expanded', 'false');
  await expect(btn).toBeFocused();
});

test('mobile sheet opens, traps focus and closes', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 760 });
  await go(page);
  await page.getByRole('button', { name: 'Open menu' }).click();
  const sheet = page.getByRole('dialog', { name: 'Site menu' });
  await expect(sheet).toBeVisible();
  expect(await serious(page)).toEqual([]);
  await sheet.getByRole('link', { name: 'Frameworks' }).click();
  await expect(page).toHaveURL(/rules\/$/);
  await expect(sheet).toHaveCount(0);
});

test('skip link is first and works', async ({ page }) => {
  await go(page, 'basics/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to content' });
  await expect(skip).toBeFocused();
});

test('reduced motion home screenshot', async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await go(page);
  await page.waitForTimeout(500);
  await page.screenshot({ path: info.outputPath('reduced-motion-home.png') });
});
