import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { SEV, alpha, solid } from '../../data/palette';
import { THEME_BOOT } from '../theme';

describe('theme', () => {
  it('index.html sets the theme before first paint with the same script as the app', () => {
    const html = readFileSync(join(__dirname, '../../../index.html'), 'utf8');
    expect(html).toContain(`<script>${THEME_BOOT}</script>`);
    expect(html.indexOf(THEME_BOOT)).toBeLessThan(html.indexOf('<title>'));
  });
  it('themed colours keep a literal dark hex for WebGL', () => {
    expect(SEV.severe).toBe('var(--c-severe, #e0716b)');
    expect(solid(SEV.severe)).toBe('#e0716b');
    expect(solid('#123456')).toBe('#123456');
    expect(alpha(SEV.high, 0.33)).toBe('color-mix(in srgb, var(--c-high, #e09a5c) 33%, transparent)');
  });
  it('every themed colour has a light value and a dark-stage reset', () => {
    const css = readFileSync(join(__dirname, '../../styles.css'), 'utf8');
    const names = [...new Set([...readFileSync(join(__dirname, '../../data/risks.ts'), 'utf8').matchAll(/themed\('([a-z0-9-]+)'/g), ...readFileSync(join(__dirname, '../../data/palette.ts'), 'utf8').matchAll(/themed\('([a-z0-9-]+)'/g), ...readFileSync(join(__dirname, '../../pages/Compare.tsx'), 'utf8').matchAll(/themed\('([a-z0-9-]+)'/g)].map((m) => m[1]))];
    expect(names.length).toBeGreaterThan(20);
    for (const n of names) {
      expect(css, n).toMatch(new RegExp(`--c-${n}: #[0-9a-f]{6}`));
      expect(css, n).toContain(`--c-${n}: initial`);
    }
  });
});
