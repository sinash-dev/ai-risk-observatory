import { describe, expect, it } from 'vitest';
import { LOCALES, LOCALE_BY_CODE, availableLocales, isLocale, localePrefix, splitLocale } from '../../i18n/locales';

describe('languages', () => {
  it('English is the published default and the only language without a prefix', () => {
    expect(LOCALES[0].code).toBe('en');
    expect(LOCALE_BY_CODE.en.published).toBe(true);
    expect(localePrefix('en')).toBe('');
    expect(localePrefix('fa')).toBe('fa/');
  });
  it('Arabic and Persian are right-to-left; Chinese is Simplified', () => {
    expect(LOCALES.filter((l) => l.dir === 'rtl').map((l) => l.code).sort()).toEqual(['ar', 'fa']);
    expect(LOCALE_BY_CODE.zh.tag).toBe('zh-Hans');
  });
  it('splits the language prefix off a path', () => {
    expect(splitLocale(['de', 'model', 'credit'])).toEqual({ locale: 'de', rest: ['model', 'credit'] });
    expect(splitLocale(['model', 'credit'])).toEqual({ locale: 'en', rest: ['model', 'credit'] });
    expect(splitLocale(['en', 'model'])).toEqual({ locale: 'en', rest: ['en', 'model'] }); // English has no prefix
    expect(splitLocale([])).toEqual({ locale: 'en', rest: [] });
  });
  it('no page id clashes with a language code', async () => {
    const { REGISTRY } = await import('../../pages/registry').catch(() => ({ REGISTRY: {} as Record<string, unknown> }));
    for (const k of [...Object.keys(REGISTRY), 'model', 'rules', 'compare', 'basics', 'lab']) expect(isLocale(k), k).toBe(false);
  });
  it('unpublished languages are only available in preview mode', () => {
    const published = LOCALES.filter((l) => l.published).map((l) => l.code);
    expect(availableLocales(false).map((l) => l.code)).toEqual(published);
    expect(availableLocales(true)).toHaveLength(LOCALES.length);
  });
});
