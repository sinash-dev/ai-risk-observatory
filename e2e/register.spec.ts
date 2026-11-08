import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';

const BASE = process.env.E2E_BASE ?? '/ai-risk-observatory/';

// E1: the home persona links became one "Start here" link, and other roles are collapsed cards on /start
test('start here: the home link leads to /start, and old role links open the right card', async ({ page }) => {
  await page.goto(BASE);
  await page.getByRole('link', { name: 'Teaching, building or studying AI? Start here' }).click();
  await expect(page).toHaveURL(/\/start\/$/);
  await page.goto(BASE + 'start/#trainers');
  await expect(page.locator('details#trainers')).toHaveAttribute('open', '');
  await expect(page.locator('#trainers .start-step')).toHaveCount(5);
});

test('register: add, classify, tick, export, reload and import', async ({ page }) => {
  await page.goto(BASE + 'register/');
  await expect(page.getByRole('heading', { name: 'No systems yet' })).toBeVisible();
  await page.getByRole('button', { name: 'Add your first system' }).click();

  await page.getByLabel('Name of the system').fill('CV screening tool');
  await page.getByLabel('Owner').fill('HR, team "talent"');
  await page.getByRole('tab', { name: '2. Questions' }).click();
  await page.getByLabel(/Employment and management of workers/).check();
  await page.locator('fieldset', { hasText: 'narrow procedural' }).getByLabel('No', { exact: true }).check();
  await page.getByRole('button', { name: 'See what to do' }).click();

  const editor = page.locator('.reg-editor');
  await expect(editor).toContainText('EU AI Act: High-risk (from 2 December 2027)');
  const boxes = editor.locator('.check input');
  const total = await boxes.count();
  expect(total).toBeGreaterThan(2);
  await boxes.first().check();
  await expect(page.getByRole('tab', { name: `3. Actions (1/${total})` })).toBeVisible();
  await expect(page.locator('.reg-summary .cat-legend')).toContainText(/High-risk\s*1/);

  // the register survives a reload
  await page.waitForTimeout(200);
  await page.reload();
  await expect(page.locator('.reg-row')).toHaveCount(1);
  await expect(page.locator('.reg-row')).toContainText(`1/${total}`);

  // Markdown export
  const [md] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Export report (Markdown)' }).click()]);
  const text = readFileSync((await md.path())!, 'utf8');
  expect(text).toContain('| CV screening tool | HR, team "talent" | Idea or procurement | High-risk | 1/');
  expect(text).toContain('- [x] ');

  // JSON backup, then import it into an empty register
  const [js] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Back up (JSON)' }).click()]);
  const backup = readFileSync((await js.path())!, 'utf8');
  await page.evaluate(() => localStorage.removeItem('are-register-v1'));
  await page.reload();
  await expect(page.getByRole('heading', { name: 'No systems yet' })).toBeVisible();
  await page.locator('input[type=file]').setInputFiles({ name: 'backup.json', mimeType: 'application/json', buffer: Buffer.from(backup) });
  await expect(page.locator('.reg-row')).toHaveCount(1);
  await expect(page.locator('.reg-row')).toContainText(`1/${total}`);

  // a bad file is refused with a message
  await page.locator('input[type=file]').setInputFiles({ name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('not json') });
  await expect(page.locator('.toast-host')).toContainText('This file is not valid JSON.');
  await expect(page.locator('.reg-row')).toHaveCount(1);

  // delete asks first
  await page.locator('.reg-open').click();
  await page.getByRole('tab', { name: '1. Details' }).click();
  page.once('dialog', (d) => d.accept());
  await page.getByRole('button', { name: 'Delete system' }).click();
  await expect(page.getByRole('heading', { name: 'No systems yet' })).toBeVisible();
});
