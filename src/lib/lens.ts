import { useSyncExternalStore } from 'react';
import type { Lens } from '../data/frameworks';

const KEY = 'are-lens';
let current: Lens = (() => {
  try { return (localStorage.getItem(KEY) as Lens) || 'all'; } catch { return 'all'; }
})();
const subs = new Set<() => void>();
export function setLens(l: Lens) {
  current = l;
  try { localStorage.setItem(KEY, l); } catch { /* ignore */ }
  subs.forEach((f) => f());
}
export function useLens() {
  return useSyncExternalStore((cb) => { subs.add(cb); return () => subs.delete(cb); }, () => current);
}
