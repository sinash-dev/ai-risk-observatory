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
    await page.waitForTimeout(1200);
    const axe = await new AxeBuilder({ page }).disableRules(['color-contrast-enhanced']).analyze();
    const serious = axe.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(serious.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(' ') + (v.id === 'color-contrast' ? ' [' + (n.any[0]?.message ?? '').slice(0, 90) + ']' : '')).join(' | ')}`)).toEqual([]);
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

test('old hash links redirect to real paths', async ({ page }) => {
  await page.goto(BASE + '#/model/credit');
  await expect(page).toHaveURL(new RegExp(BASE + 'model/credit/$'));
  await expect(page.locator('h1').first()).toContainText('Logistic Regression');
});

test('client-side navigation and back/forward', async ({ page }) => {
  await page.goto(BASE);
  await page.waitForLoadState('networkidle');
  await page.locator(`a[href="${BASE}rules/"]:visible`).first().click();
  await expect(page).toHaveURL(new RegExp(BASE + 'rules/$'));
  await page.goBack();
  await expect(page).toHaveURL(new RegExp(BASE + '$'));
  await page.goForward();
  await expect(page).toHaveURL(new RegExp(BASE + 'rules/$'));
  await expect(page.locator('h1').first()).toBeVisible();
});

test('unknown path shows not found page', async ({ page }) => {
  await page.goto(BASE + 'no-such-page/');
  await expect(page.locator('h1').first()).toContainText(/not found|doesn.t exist|no page/i);
});
