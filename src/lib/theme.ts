/**
 * Light and dark theme. index.html sets data-theme before the first paint
 * (saved choice, otherwise the system setting); this module keeps it in sync.
 */
import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';
const KEY = 'are-theme';
const META = { light: '#f5f4f0', dark: '#0c0e11' };

const current = (): Theme => (document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');
function saved(): Theme | null {
  try { const t = localStorage.getItem(KEY); return t === 'light' || t === 'dark' ? t : null; } catch { return null; }
}

function apply(t: Theme) {
  document.documentElement.dataset.theme = t;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', META[t]);
  window.dispatchEvent(new Event('are-theme'));
}

export function setTheme(t: Theme) {
  try { localStorage.setItem(KEY, t); } catch { /* the choice just will not be remembered */ }
  apply(t);
}

export function useTheme() {
  const [t, setT] = useState<Theme>(() => (typeof document === 'undefined' ? 'dark' : current()));
  useEffect(() => {
    const h = () => setT(current());
    window.addEventListener('are-theme', h);
    // follow the system setting until the visitor makes a choice
    const mq = matchMedia('(prefers-color-scheme: light)');
    const sys = () => { if (!saved()) apply(mq.matches ? 'light' : 'dark'); };
    mq.addEventListener?.('change', sys);
    apply(current()); // also syncs the theme-color meta tag
    return () => { window.removeEventListener('are-theme', h); mq.removeEventListener?.('change', sys); };
  }, []);
  return t;
}

/** inline script for index.html: runs before the page paints, so there is no flash of the wrong theme */
export const THEME_BOOT = `(function(){var t;try{t=localStorage.getItem('${KEY}')}catch(e){}if(t!=='light'&&t!=='dark'){t=window.matchMedia&&matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}document.documentElement.setAttribute('data-theme',t)})();`;
