import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { availableLocales, localePrefix, splitLocale, type Locale } from '../i18n/locales';

/* ---------- seeded random ---------- */
export function rng(seed = 1) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function gauss(r: () => number) {
  const u = Math.max(1e-9, r());
  const v = r();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
export const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));
export const fmtPct = (v: number, d = 0) => `${(v * 100).toFixed(d)}%`;

/* ---------- path router ---------- */
/** Base path of the site, always ending in "/" (e.g. "/ai-risk-observatory/"). */
export const BASE: string = (import.meta.env?.BASE_URL as string | undefined) ?? '/';

function subscribe(cb: () => void) {
  window.addEventListener('popstate', cb);
  window.addEventListener('routechange', cb);
  return () => {
    window.removeEventListener('popstate', cb);
    window.removeEventListener('routechange', cb);
  };
}
const snapshot = () => window.location.pathname + window.location.search;

function rawParts(pathname: string) {
  const rel = pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname.replace(/^\//, '');
  return rel.split('/').filter(Boolean);
}

/** Split a site path ("/de/model/credit") into parts relative to BASE, without the language prefix. */
export function routeParts(pathname: string) {
  return splitLocale(rawParts(pathname)).rest;
}

/** Language of a path; unpublished languages count as English unless preview mode is on. */
export function localeOfPath(pathname: string): Locale {
  const l = splitLocale(rawParts(pathname)).locale;
  return availableLocales().some((x) => x.code === l) ? l : 'en';
}

/** Language of the page being shown. */
export const currentLocale = (): Locale => (typeof location === 'undefined' ? 'en' : localeOfPath(location.pathname));

export function useRoute() {
  const loc = useSyncExternalStore(subscribe, snapshot, () => '/');
  const [pathname, search = ''] = loc.split('?');
  const parts = routeParts(pathname);
  return { hash: '/' + parts.join('/'), page: parts[0] ?? '', param: parts[1], query: new URLSearchParams(search), locale: localeOfPath(pathname) };
}

/**
 * Full URL for a site path in the current language (or the one given):
 * url('/model/credit') -> '/ai-risk-observatory/model/credit/', or '.../de/model/credit/' on a German page.
 */
export function url(to: string, locale: Locale = currentLocale()) {
  const m = to.match(/^([^?#]*)(.*)$/)!;
  const path = m[1].replace(/^\/+|\/+$/g, '');
  return BASE + localePrefix(locale) + (path ? path + '/' : '') + m[2];
}

export function navigate(to: string, opts: { replace?: boolean } = {}) {
  const target = url(to);
  if (opts.replace) history.replaceState(null, '', target);
  else history.pushState(null, '', target);
  window.dispatchEvent(new Event('routechange'));
  const hashIdx = target.indexOf('#');
  if (hashIdx < 0) window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  else setTimeout(() => document.getElementById(target.slice(hashIdx + 1))?.scrollIntoView({ behavior: 'smooth' }), 120);
}
/** Alias kept for older callers. */
export const go = navigate;

/* ---------- tween ---------- */
export function useTween(target: number, speed = 0.12) {
  const [v, setV] = useState(target);
  const cur = useRef(target);
  useEffect(() => {
    if (prefersReducedMotion()) { cur.current = target; setV(target); return; }
    let raf = 0;
    const tick = () => {
      cur.current += (target - cur.current) * speed;
      if (Math.abs(target - cur.current) < 0.05) cur.current = target;
      setV(cur.current);
      if (cur.current !== target) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, speed]);
  return v;
}
export function useTweenArray(target: number[], speed = 0.12) {
  const [v, setV] = useState(target);
  const cur = useRef(target.slice());
  const key = target.map((x) => x.toFixed(2)).join(',');
  useEffect(() => {
    if (prefersReducedMotion()) { cur.current = target.slice(); setV(target.slice()); return; }
    let raf = 0;
    const tick = () => {
      let done = true;
      cur.current = cur.current.map((c, i) => {
        const n = c + ((target[i] ?? 0) - c) * speed;
        if (Math.abs((target[i] ?? 0) - n) > 0.05) done = false;
        return done ? n : n;
      });
      if (done) cur.current = target.slice();
      setV(cur.current.slice());
      if (!done) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return v;
}

/** frame clock for continuous animations (pauses when tab hidden) */
export function useClock(running = true) {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (!running) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      setT((now - start) / 1000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running]);
  return t;
}

/** in-view hook */
export function useInView<T extends Element>(margin = '-10% 0px') {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setSeen(true)),
      { rootMargin: margin },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [margin]);
  return [ref, seen] as const;
}

/* ---------- progress (localStorage, safe) ---------- */
export interface LabResult { trust: number; value: number; letter: string; at: number }
const KEY = 'aro-progress-v1';
export function loadProgress(): { name?: string; labs: Record<string, LabResult> } {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { labs: {} };
}
export function saveProgress(p: ReturnType<typeof loadProgress>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch { /* ignore */ }
  window.dispatchEvent(new Event('aro-progress'));
}
export function useProgress() {
  const [p, setP] = useState(loadProgress);
  useEffect(() => {
    const h = () => setP(loadProgress());
    window.addEventListener('aro-progress', h);
    return () => window.removeEventListener('aro-progress', h);
  }, []);
  return p;
}
export function recordLab(id: string, r: LabResult) {
  const p = loadProgress();
  const prev = p.labs[id];
  if (!prev || r.trust * 0.65 + r.value * 0.35 >= prev.trust * 0.65 + prev.value * 0.35) p.labs[id] = r;
  saveProgress(p);
}

/** True when the visitor asked the OS for less motion. */
export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
