import { expect, test } from '@playwright/test';
import { LAB_BY_ID } from '../src/data/labs';

const BASE = process.env.E2E_BASE ?? '/ai-risk-observatory/';

for (const id of ['insurance', 'exam', 'voice', 'browser-agent']) {
  test(`${id}: every problem and safeguard changes the simulation`, async ({ page }, info) => {
    test.skip(info.project.name === 'mobile', 'covered on desktop');
    const lab = LAB_BY_ID[id];
    const fig = page.locator('.figure');
    const snap = () => fig.evaluate((el) => el.innerHTML);
    for (const st of lab.stressors) {
      await page.goto(BASE + `model/${id}/`);
      await fig.locator('svg, .stats').first().waitFor();
      await page.waitForTimeout(300);
      const before = await snap();
      await page.goto(BASE + `model/${id}/?p=${st.id}`);
      await page.waitForTimeout(900);
      const withProblem = await snap();
      expect(withProblem, `problem ${st.id}`).not.toBe(before);
      const fixer = lab.mitigations.find((m) => m.counters.includes(st.id))!;
      await page.goto(BASE + `model/${id}/?p=${st.id}&s=${fixer.id}`);
      await page.waitForTimeout(900);
      expect(await snap(), `safeguard ${fixer.id} for ${st.id}`).not.toBe(withProblem);
    }
  });
}
