import { useSyncExternalStore } from 'react';

let open = false;
let opener: HTMLElement | null = null;
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());

export function openSearch() {
  opener = document.activeElement as HTMLElement | null;
  open = true;
  emit();
}
export function closeSearch() {
  open = false;
  emit();
  // return focus to whatever opened the dialog
  setTimeout(() => opener?.focus?.(), 0);
}
export function useSearchOpen() {
  return useSyncExternalStore((cb) => { subs.add(cb); return () => subs.delete(cb); }, () => open);
}
export const isMac = () => typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

/** Ctrl/⌘ K, or "/" when focus is not in a field, opens search. Attached once at load. */
export function installSearchShortcut() {
  if (typeof document === 'undefined' || (window as unknown as { __searchKeys?: boolean }).__searchKeys) return;
  (window as unknown as { __searchKeys?: boolean }).__searchKeys = true;
  document.addEventListener('keydown', (e) => {
    const t = e.target as HTMLElement | null;
    const typing = !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable);
    if (e.key === 'Escape' && open) { e.preventDefault(); closeSearch(); return; }
    if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey) && !e.altKey) { e.preventDefault(); if (!open) openSearch(); }
    else if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey && !e.altKey && !open) { e.preventDefault(); openSearch(); }
  });
}
