import { useEffect, useState } from 'react';

let cached: boolean | null = null;
function hasWebGL() {
  if (cached !== null) return cached;
  try {
    const c = document.createElement('canvas');
    cached = !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch {
    cached = false;
  }
  return cached;
}

/**
 * Whether a 3D scene should render. False (use the 2D version) when WebGL is missing,
 * the visitor prefers reduced motion, data saver is on, or the screen is under 640 px wide.
 * Starts false so the first paint is always the light 2D version.
 */
export function useWebGL() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const mqMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const mqWide = matchMedia('(min-width: 640px)');
    const saveData = !!(navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    const check = () => setOk(hasWebGL() && !mqMotion.matches && mqWide.matches && !saveData);
    check();
    mqMotion.addEventListener?.('change', check);
    mqWide.addEventListener?.('change', check);
    return () => { mqMotion.removeEventListener?.('change', check); mqWide.removeEventListener?.('change', check); };
  }, []);
  return ok;
}
