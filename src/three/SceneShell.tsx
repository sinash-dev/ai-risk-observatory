/** Wraps a 3D scene: lazy-loads it, falls back to 2D on any error, and stops rendering when off-screen. */
import { Component, Suspense, useEffect, useState, type ComponentType, type ReactNode } from 'react';
import { useWebGL } from './useWebGL';

class Boundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(e: unknown) { console.warn('3D scene failed, showing the 2D version instead.', e); }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

/** True while the element is at least partly on screen. Returns a callback ref. */
export function useOnScreen<T extends Element>(margin = '120px') {
  const [el, setEl] = useState<T | null>(null);
  const [on, setOn] = useState(true);
  useEffect(() => {
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [el, margin]);
  return [setEl, on] as const;
}

export interface SceneProps { active: boolean }

/**
 * `load` returns the scene module (code-split so three.js only loads when used).
 * The scene receives `active` (on screen) and should set `frameloop` accordingly.
 */
export function SceneShell<P extends object>({ load, props, fallback, className, height }: {
  load: () => Promise<{ default: ComponentType<P & SceneProps> }>;
  props: P;
  fallback: ReactNode;
  className?: string;
  height: number | string;
}) {
  const allowed = useWebGL();
  const [Scene, setScene] = useState<ComponentType<P & SceneProps> | null>(null);
  const [ref, on] = useOnScreen<HTMLDivElement>();

  // Load with a plain state update (not React.lazy) so busy pages cannot starve the load.
  useEffect(() => {
    if (!allowed || Scene) return;
    let live = true;
    load().then((m) => { if (live) setScene(() => m.default); }).catch((e) => console.warn('3D scene could not load.', e));
    return () => { live = false; };
  }, [allowed, Scene, load]);

  if (!allowed) return <>{fallback}</>;
  return (
    <div ref={ref} className={className} style={{ position: 'relative', height }} aria-hidden="true">
      {Scene ? (
        <Boundary fallback={fallback}>
          <Suspense fallback={null}>
            <Scene {...props} active={on} />
          </Suspense>
        </Boundary>
      ) : (
        <div className="scene-loading" />
      )}
    </div>
  );
}
