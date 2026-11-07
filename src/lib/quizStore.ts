import { useEffect, useState } from 'react';

const KEY = 'are-quiz';
export interface QuizResult { score: number; total: number; at: number }

export function loadQuizResults(): Record<string, QuizResult> {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '{}'); } catch { return {}; }
}
/** keeps the best score per quiz */
export function saveQuizResult(id: string, r: QuizResult) {
  const all = loadQuizResults();
  if (!all[id] || r.score / r.total >= all[id].score / all[id].total) all[id] = r;
  try { localStorage.setItem(KEY, JSON.stringify(all)); } catch { /* ignore */ }
  window.dispatchEvent(new Event('are-quiz'));
}
export function useQuizResults() {
  const [r, setR] = useState(loadQuizResults);
  useEffect(() => {
    const h = () => setR(loadQuizResults());
    window.addEventListener('are-quiz', h);
    window.addEventListener('aro-progress', h);
    // results saved in another tab, e.g. a quiz opened from a team plan
    const s = (e: StorageEvent) => { if (e.key === KEY) h(); };
    window.addEventListener('storage', s);
    return () => { window.removeEventListener('are-quiz', h); window.removeEventListener('aro-progress', h); window.removeEventListener('storage', s); };
  }, []);
  return r;
}
export const passed = (r?: QuizResult) => !!r && r.score / r.total >= 0.8;

/** deterministic shuffle of option order per question, so the right answer is not always in the same place */
export function order(seed: string, n = 4) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  const idx = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) { h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0; const j = h % (i + 1); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  return idx;
}
