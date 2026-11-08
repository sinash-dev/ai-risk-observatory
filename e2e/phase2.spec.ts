import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';

const BASE = process.env.E2E_BASE ?? '/ai-risk-observatory/';

test('sector guides: index links to a guide with rules, examples and templates', async ({ page, request }) => {
  await page.goto(BASE + 'sectors/');
  await expect(page.locator('.sec-card')).toHaveCount(6);
  await page.locator('.sec-card', { hasText: 'Insurance' }).click();
  await expect(page).toHaveURL(/\/sectors\/insurance\/$/);
  await expect(page.locator('.sec-rules').first()).toContainText('Annex III, point 5(c)');
  const tpl = page.locator('.sec-tpl a').first();
  expect((await request.get((await tpl.getAttribute('href'))!)).status()).toBe(200);
  await page.goto(BASE + 'sectors/nope/');
  await expect(page.getByRole('heading', { name: 'Sector guide not found' })).toBeVisible();
});

test('toolkit: framework packs preview with clause references', async ({ page }) => {
  await page.goto(BASE + 'toolkit/');
  await expect(page.getByRole('heading', { name: 'Framework packs' })).toBeVisible();
  await page.locator('.tk', { hasText: 'Deployer pack (Art. 26)' }).getByRole('button', { name: 'Preview' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.locator('table').first()).toContainText('Human oversight assigned');
  await page.keyboard.press('Escape');
  await page.locator('.tk', { hasText: 'Statement of Applicability' }).getByRole('button', { name: 'Preview' }).click();
  await expect(page.getByRole('dialog')).toContainText('Third-party and customer relationships');
});

test('register: Word report downloads as a .docx', async ({ page }) => {
  await page.goto(BASE + 'register/');
  await page.getByRole('button', { name: 'Add your first system' }).click();
  await page.getByLabel('Name of the system').fill('Claims triage');
  await page.getByRole('button', { name: 'Export', exact: true }).click();
  const [dl] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Word report' }).click()]);
  expect(dl.suggestedFilename()).toMatch(/^ai-register-\d{4}-\d{2}-\d{2}\.docx$/);
  const buf = readFileSync((await dl.path())!);
  expect(buf.subarray(0, 2).toString()).toBe('PK'); // a .docx is a zip file
});
