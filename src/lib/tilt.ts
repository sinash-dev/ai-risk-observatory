import { useEffect } from 'react';
import { prefersReducedMotion } from './util';

/**
 * Subtle 3D tilt (max 4°) and a cursor-following highlight on `.card.lift`.
 * One delegated listener for the whole page; off for touch devices and reduced motion.
 */
export function useTilt() {
  useEffect(() => {
    if (typeof window === 'undefined' || prefersReducedMotion() || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    let cur: HTMLElement | null = null;
    let raf = 0;
    const reset = (el: HTMLElement) => { el.style.removeProperty('--rx'); el.style.removeProperty('--ry'); el.classList.remove('tilting'); };
    const onMove = (e: PointerEvent) => {
      // only cards that are links tilt; static cards stay still
      const el = (e.target as Element | null)?.closest?.('a.card.lift') as HTMLElement | null;
      if (cur && cur !== el) reset(cur);
      cur = el;
      if (!el) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        el.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
        el.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
        el.style.setProperty('--rx', `${((0.5 - py) * 8).toFixed(2)}deg`);
        el.style.setProperty('--ry', `${((px - 0.5) * 8).toFixed(2)}deg`);
        el.classList.add('tilting');
      });
    };
    const onLeave = () => { if (cur) reset(cur); cur = null; };
    document.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    window.addEventListener('blur', onLeave);
    return () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('blur', onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);
}
