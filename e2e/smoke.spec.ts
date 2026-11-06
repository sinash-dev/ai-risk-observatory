import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { routes } from './routes';

const BASE = process.env.E2E_BASE ?? '/ai-risk-observatory/';

for (const r of routes()) {
  test(`route ${r.path}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (m) => { if (m.type() === 'error' && !/goatcounter|gc\.zgo\.at|Failed to load resource/.test(m.text())) errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push(e.message));
    const res = await page.goto(BASE + r.path.replace(/^\//, ''));
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1').first()).toBeVisible();
    if (r.title) await expect(page).toHaveTitle(r.title);
    await page.waitForTimeout(400);
    const axe = await new AxeBuilder({ page }).disableRules(['color-contrast-enhanced']).analyze();
    const serious = axe.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(serious.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test('credit simulation reacts to problem and safeguard', async ({ page }) => {
  await page.goto(BASE + 'model/credit/');
  const summary = page.getByTestId('sim-summary');
  const before = await summary.innerText();
  await page.locator('.toggle.problem').first().click();
  await expect(summary).not.toHaveText(before);
  const mid = await summary.innerText();
  await page.locator('.toggle.fix').first().click();
  await expect(summary).not.toHaveText(mid);
});
