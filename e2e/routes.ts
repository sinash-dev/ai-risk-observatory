import { existsSync, readFileSync } from 'node:fs';

export interface RouteInfo { path: string; title: string }

/** Routes come from dist/route-manifest.json (written by postbuild); falls back to a short list. */
export function routes(): RouteInfo[] {
  const f = 'dist/route-manifest.json';
  if (existsSync(f)) return JSON.parse(readFileSync(f, 'utf8'));
  return ['/', '/model/credit', '/rules', '/rules/eu', '/compare', '/basics'].map((p) => ({ path: p, title: '' }));
}
