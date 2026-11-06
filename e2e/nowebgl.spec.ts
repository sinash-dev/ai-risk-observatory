import { expect, test } from '@playwright/test';

const BASE = process.env.E2E_BASE ?? '/ai-risk-observatory/';

test.use({ launchOptions: { args: ['--disable-webgl', '--disable-webgl2', '--disable-3d-apis'] }, reducedMotion: 'no-preference', viewport: { width: 1440, height: 900 } });
test('home and frameworks fall back to 2D without errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/goatcounter|Failed to load resource/.test(m.text())) errors.push(m.text()); });
  await page.goto(BASE);
  await expect(page.getByRole('img', { name: /All models orbiting/ })).toBeVisible();
  await expect(page.locator('canvas')).toHaveCount(0);
  await page.goto(BASE + 'rules/');
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(page.locator('.globe-section')).toHaveCount(0);
  expect(errors).toEqual([]);
});
