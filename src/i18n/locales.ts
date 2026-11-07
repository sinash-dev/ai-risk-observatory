/**
 * Languages of the site. English is the source and lives at the root;
 * other languages live under a prefix (/de/, /fr/, /ar/, /fa/, /zh/).
 *
 * A language is `published` only when its translation is complete and checked
 * (see docs/TRANSLATION_PLAN.md). Unpublished languages are not built as pages,
 * not shown in the language switch, and their addresses fall back to English,
 * unless preview mode is on (localStorage 'are-preview-locales' = '1').
 */
export type Locale = 'en' | 'de' | 'fr' | 'ar' | 'fa' | 'zh';

export interface LocaleInfo {
  code: Locale;
  /** name in its own language, for the language switch */
  native: string;
  english: string;
  /** BCP 47 tag for the html lang attribute and hreflang */
  tag: string;
  dir: 'ltr' | 'rtl';
  published: boolean;
}

export const LOCALES: LocaleInfo[] = [
  { code: 'en', native: 'English', english: 'English', tag: 'en', dir: 'ltr', published: true },
  { code: 'de', native: 'Deutsch', english: 'German', tag: 'de', dir: 'ltr', published: false },
  { code: 'fr', native: 'Français', english: 'French', tag: 'fr', dir: 'ltr', published: false },
  { code: 'ar', native: 'العربية', english: 'Arabic', tag: 'ar', dir: 'rtl', published: false },
  { code: 'fa', native: 'فارسی', english: 'Persian', tag: 'fa', dir: 'rtl', published: false },
  { code: 'zh', native: '简体中文', english: 'Chinese (Simplified)', tag: 'zh-Hans', dir: 'ltr', published: false },
];

export const LOCALE_BY_CODE = Object.fromEntries(LOCALES.map((l) => [l.code, l])) as Record<Locale, LocaleInfo>;
export const DEFAULT_LOCALE: Locale = 'en';
const PREFIXED = LOCALES.filter((l) => l.code !== DEFAULT_LOCALE).map((l) => l.code) as Locale[];

export const isLocale = (s: string | undefined): s is Locale => !!s && LOCALES.some((l) => l.code === s);

/** Languages a visitor can use: published ones, or all of them in preview mode. */
export function availableLocales(preview = previewMode()): LocaleInfo[] {
  return LOCALES.filter((l) => l.published || preview);
}

export function previewMode() {
  try { return typeof localStorage !== 'undefined' && localStorage.getItem('are-preview-locales') === '1'; } catch { return false; }
}

/**
 * Split path parts (already relative to the site base) into language and the rest.
 * ['de', 'model', 'credit'] -> { locale: 'de', rest: ['model', 'credit'] }; ['model'] -> { locale: 'en', rest: ['model'] }
 */
export function splitLocale(parts: string[]): { locale: Locale; rest: string[] } {
  const first = parts[0];
  if (first && (PREFIXED as string[]).includes(first)) return { locale: first as Locale, rest: parts.slice(1) };
  return { locale: DEFAULT_LOCALE, rest: parts };
}

/** Site-relative prefix for a language: '' for English, 'de/' for German. */
export const localePrefix = (l: Locale) => (l === DEFAULT_LOCALE ? '' : `${l}/`);
