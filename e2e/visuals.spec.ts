import { expect, test } from '@playwright/test';

const BASE = process.env.E2E_BASE ?? '/ai-risk-observatory/';

test('EU risk pyramid: levels switch the explanation', async ({ page }) => {
  await page.goto(BASE + 'rules/eu/');
  const pyr = page.locator('.pyr');
  await expect(pyr.locator('.pyr-detail h3')).toContainText('High-risk');
  await pyr.getByRole('button', { name: 'Banned' }).click();
  await expect(pyr.locator('.pyr-detail')).toContainText('Since 2 February 2025');
  await expect(pyr.getByRole('button', { name: 'Banned' })).toHaveAttribute('aria-pressed', 'true');
});

test.describe('3D pyramid', () => {
  test.use({ reducedMotion: 'no-preference', viewport: { width: 1440, height: 900 } });
  test('loads without errors on a WebGL screen', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error' || /3D scene/.test(m.text())) errors.push(m.text()); });
    await page.goto(BASE + 'rules/eu/');
    await page.locator('.pyr').scrollIntoViewIfNeeded();
    await expect(page.locator('.pyr canvas')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('.pyr-tag')).toHaveCount(4);
    expect(errors).toEqual([]);
  });
});

test('classifier result shows where the system sits on the pyramid', async ({ page }) => {
  await page.goto(BASE + 'register/');
  await page.getByRole('button', { name: 'Add your first system' }).click();
  await page.getByRole('tab', { name: '2. Questions' }).click();
  await page.getByLabel(/Employment and management of workers/).check();
  await page.locator('fieldset', { hasText: 'narrow procedural' }).getByLabel('No', { exact: true }).check();
  await expect(page.locator('.reg-editor .pyr-mini')).toHaveAttribute('aria-label', 'EU AI Act risk level: High-risk');
  await expect(page.locator('.cat-bar')).toHaveAttribute('aria-label', 'High-risk: 1');
  await expect(page.locator('.dl-mark')).not.toHaveCount(0);
});

test('toolkit map opens a template preview', async ({ page }) => {
  await page.goto(BASE + 'toolkit/');
  await expect(page.locator('.tk-stage')).toHaveCount(5);
  await page.locator('.tk-chip', { hasText: 'Post-market monitoring plan' }).click();
  await expect(page.getByRole('dialog')).toContainText('Art. 72');
});

test('sector matrix compares all sectors', async ({ page }) => {
  await page.goto(BASE + 'sectors/');
  await expect(page.locator('.sec-matrix tbody tr')).toHaveCount(6);
  await expect(page.locator('.sec-matrix')).toContainText('Life and health only, 5(c)');
});

test('workshop agenda jumps to an activity', async ({ page }) => {
  await page.goto(BASE + 'workshop/');
  await page.locator('.ws-agenda').getByRole('button', { name: /Hard case/ }).click();
  await expect(page.locator('.ws-title')).toContainText('When no safeguard works');
  await expect(page.locator('.ws-agenda li.on')).toContainText('Hard case');
});
