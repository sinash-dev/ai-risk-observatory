import { expect, test } from '@playwright/test';
import JSZip from 'jszip';
import { readFileSync } from 'node:fs';

const BASE = process.env.E2E_BASE ?? '/ai-risk-observatory/';

test('SCORM package talks to a SCORM 1.2 LMS correctly', async ({ page, browser }) => {
  await page.goto(BASE + 'quiz/');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.locator('#lms').getByRole('button', { name: /^EU AI Act/ }).click()]);
  expect(dl.suggestedFilename()).toBe('ai-risk-explorer-quiz-eu-scorm12.zip');
  const z = await JSZip.loadAsync(readFileSync((await dl.path())!));
  const html = await z.file('index.html')!.async('string');

  // a stand-in LMS: records every call and keeps the data model
  const ctx = await browser.newContext();
  const sco = await ctx.newPage();
  await sco.addInitScript(() => {
    const store: Record<string, string> = { 'cmi.core.lesson_status': 'not attempted', 'cmi.core.score.raw': '' };
    const calls: string[] = [];
    (window as unknown as { API: object; calls: string[]; store: object }).calls = calls;
    (window as unknown as { store: object }).store = store;
    (window as unknown as { API: object }).API = {
      LMSInitialize: (a: string) => { calls.push(`init(${a})`); return 'true'; },
      LMSGetValue: (k: string) => store[k] ?? '',
      LMSSetValue: (k: string, v: string) => { calls.push(`set ${k}=${v}`); store[k] = v; return 'true'; },
      LMSCommit: () => { calls.push('commit'); return 'true'; },
      LMSFinish: () => { calls.push('finish'); return 'true'; },
      LMSGetLastError: () => '0', LMSGetErrorString: () => '', LMSGetDiagnostic: () => '',
    };
  });
  await sco.route('https://lms.test/sco/index.html', (r) => r.fulfill({ contentType: 'text/html', body: html }));
  await sco.goto('https://lms.test/sco/index.html');
  await expect(sco.getByRole('heading', { name: 'EU AI Act' })).toBeVisible();
  const store = () => sco.evaluate(() => (window as unknown as { store: Record<string, string> }).store);
  expect((await store())['cmi.core.lesson_status']).toBe('incomplete');

  // first attempt: all wrong
  const answers: number[] = await sco.evaluate(() => (window as unknown as { QUIZ: { questions: { answer: number }[] } }).QUIZ.questions.map((q) => q.answer));
  await sco.getByRole('button', { name: 'Start the quiz' }).click();
  for (const a of answers) {
    await sco.locator('.opt').nth(a === 0 ? 1 : 0).click();
    await expect(sco.locator('.feedback')).toContainText('Not quite');
    await sco.getByRole('button', { name: /Next question|See my result/ }).click();
  }
  await expect(sco.getByRole('heading', { level: 1 })).toContainText('You scored 0 out of 5');
  expect(await store()).toMatchObject({ 'cmi.core.lesson_status': 'failed', 'cmi.core.score.raw': '0', 'cmi.core.score.max': '100' });

  // second attempt: all right, best score counts
  await sco.getByRole('button', { name: 'Try again' }).click();
  for (const a of answers) {
    await sco.locator('.opt').nth(a).click();
    await expect(sco.locator('.feedback')).toContainText('Correct.');
    await sco.getByRole('button', { name: /Next question|See my result/ }).click();
  }
  expect(await store()).toMatchObject({ 'cmi.core.lesson_status': 'passed', 'cmi.core.score.raw': '100' });

  // leaving the page ends the session properly
  const calls = await sco.evaluate(() => (window as unknown as { calls: string[] }).calls);
  expect(calls[0]).toBe('init()');
  await sco.evaluate(() => window.dispatchEvent(new Event('pagehide')));
  const after = await sco.evaluate(() => (window as unknown as { calls: string[] }).calls);
  expect(after.slice(-1)[0]).toBe('finish');
  expect(after.some((c) => /^set cmi\.core\.session_time=\d{2,4}:\d{2}:\d{2}$/.test(c))).toBe(true);
  await ctx.close();
});

test('team training: plan link, learner record, team record', async ({ page }) => {
  await page.goto(BASE + 'team/');
  await page.getByLabel('Team or group').fill('Claims');
  await page.locator('.team-opts .opt', { hasText: 'Executives and board' }).click();
  await page.locator('.team-quiz-grid label', { hasText: 'EU AI Act' }).click();
  const link = await page.getByLabel('Team link').inputValue();
  expect(link).toContain('/team/?plan=');

  await page.goto(link);
  await expect(page.getByRole('heading', { name: 'Your training plan' })).toBeVisible();
  await expect(page.locator('.track-goals').first()).toContainText('By the end you will be able to');
  await page.locator('.team-steps input').first().check();
  await expect(page.locator('.team-brief')).toContainText('1 of 5');
  await page.getByLabel('Your name').fill('Ana');
  await page.getByLabel('One thing I will do differently at work').fill('Check our chatbot discloses it is AI');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Download my record' }).click()]);
  const rec = JSON.parse(readFileSync((await dl.path())!, 'utf8'));
  expect(rec).toMatchObject({ format: 'ai-risk-explorer-learning-record', name: 'Ana', plan: { team: 'Claims' } });

  await page.goto(BASE + 'team/');
  await page.getByRole('tab', { name: '2. Team record' }).click();
  await page.locator('.team-record input[type=file]').setInputFiles({ name: 'ana.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(rec)) });
  await expect(page.locator('.team-record tbody tr')).toHaveCount(1);
  await expect(page.locator('.team-record tbody tr')).toContainText('1/5');
  const [md] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Export record (Markdown)' }).click()]);
  expect(readFileSync((await md.path())!, 'utf8')).toContain('Check our chatbot discloses it is AI');

  await page.goto(BASE + 'team/?plan=broken');
  await expect(page.getByRole('alert')).toContainText('incomplete or damaged');
});

test('workshop slides: keyboard, notes and deep link', async ({ page }) => {
  await page.goto(BASE + 'workshop/');
  await expect(page.locator('.ws-title')).toContainText('When AI gets it wrong');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.ws-title')).toContainText('By the end of the hour');
  await expect(page).toHaveURL(/#2$/);
  await page.keyboard.press('n');
  await expect(page.locator('.ws-notes')).toContainText('Notes for the facilitator');
  await page.goto(BASE + 'workshop/#6');
  await expect(page.locator('.ws-title')).toContainText('Credit scoring with postcodes');
});
