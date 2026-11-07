/**
 * Category colours, theme-aware.
 * Each colour is a CSS variable with its dark-theme hex as the fallback, e.g. var(--c-severe, #e0716b).
 * The light theme overrides the variables in styles.css with deeper shades that pass WCAG contrast on white;
 * dark "stages" (simulations, 3D scenes) reset them so the fallback (dark) hex applies.
 */
export const themed = (name: string, dark: string) => `var(--c-${name}, ${dark})`;

export const SEV = {
  severe: themed('severe', '#e0716b'), high: themed('high', '#e09a5c'), mid: themed('mid', '#d6c06a'), low: themed('low', '#6fb59d'),
  info: themed('info', '#86a7d6'), neutral: themed('neutral', '#7c838e'), soft: themed('soft', '#a9b0ba'),
};

/** the literal dark hex inside a themed colour: for WebGL and canvas, which cannot read CSS variables */
export function solid(c: string) {
  const m = c.match(/#[0-9a-fA-F]{6}\b/);
  return m ? m[0] : c;
}

/** the colour at a given opacity; works for hex and for themed CSS variables */
export const alpha = (c: string, a: number) => `color-mix(in srgb, ${c} ${Math.round(a * 100)}%, transparent)`;
