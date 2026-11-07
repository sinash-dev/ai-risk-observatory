import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { routes } from './routes';

const BASE = process.env.E2E_BASE ?? '/ai-risk-observatory/';

// The main smoke test runs in the light theme (browsers report a light system preference by default).
// This file checks contrast in the dark theme and the theme switch itself.
test.describe('dark theme', () => {
  test.use({ colorScheme: 'dark' });
  for (const r of routes()) {
    test(`contrast ${r.path}`, async ({ page }, info) => {
      test.skip(info.project.name !== 'desktop', 'one width is enough for colour contrast');
      await page.goto(BASE + r.path.replace(/^\//, ''));
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
      await page.waitForTimeout(900);
      const axe = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
      expect(axe.violations.flatMap((v) => v.nodes.slice(0, 3).map((n) => `${n.target.join(' ')} ${(n.any[0]?.message ?? '').slice(0, 80)}`))).toEqual([]);
    });
  }
});

test('theme follows the system until the visitor chooses, then remembers the choice', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto(BASE);
  const html = page.locator('html');
  await expect(html).toHaveAttribute('data-theme', 'light');
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(html).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'Switch to light theme' }).click();
  await expect(html).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#f5f4f0');
  await page.reload();
  await expect(html).toHaveAttribute('data-theme', 'light'); // saved choice beats the dark system setting
  await expect(page.getByRole('button', { name: 'Switch to dark theme' })).toBeVisible();
});

test('simulations stay on a dark panel in the light theme', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto(BASE + 'model/credit/');
  const bg = await page.locator('.figure').first().evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(bg).toBe('rgb(16, 19, 23)');
  const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bodyBg).not.toBe('rgb(12, 14, 17)');
});
