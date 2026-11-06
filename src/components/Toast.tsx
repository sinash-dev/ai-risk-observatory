import { AnimatePresence, motion } from 'framer-motion';
import { useSyncExternalStore } from 'react';

let msg: { text: string; id: number } | null = null;
let timer = 0;
const subs = new Set<() => void>();

/** Show a short confirmation, e.g. "Link copied". */
export function toast(text: string) {
  msg = { text, id: Date.now() };
  subs.forEach((f) => f());
  clearTimeout(timer);
  timer = window.setTimeout(() => { msg = null; subs.forEach((f) => f()); }, 2400);
}

export function ToastHost() {
  const m = useSyncExternalStore((cb) => { subs.add(cb); return () => subs.delete(cb); }, () => msg);
  return (
    <div className="toast-host" role="status" aria-live="polite">
      <AnimatePresence>
        {m && (
          <motion.div key={m.id} className="toast" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} transition={{ duration: 0.2 }}>
            {m.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Copy text to the clipboard, with a fallback for older browsers. */
export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
}
