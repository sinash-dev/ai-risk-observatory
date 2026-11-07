/**
 * Top-level pages added in WS9, keyed by the first path segment.
 * Their titles and descriptions live in STATIC_PAGES (data/routes.ts), which drives
 * the nav, search, sitemap and postbuild.
 */
import { lazy, type ComponentType } from 'react';

export interface PageProps { param?: string; query?: URLSearchParams }
const L = (f: () => Promise<{ default: ComponentType<PageProps> }>) => lazy(f);

export const REGISTRY: Record<string, ComponentType<PageProps>> = {
  glossary: L(() => import('./Glossary')),
  updates: L(() => import('./Updates')),
  about: L(() => import('./About')),
  cases: L(() => import('./Cases')),
  classify: L(() => import('./Classify')),
  crosswalk: L(() => import('./Crosswalk')),
  toolkit: L(() => import('./Toolkit')),
  tracks: L(() => import('./Tracks')),
  quiz: L(() => import('./Quiz')),
  certificate: L(() => import('./Certificate')),
  start: L(() => import('./Start')),
  register: L(() => import('./Register')),
  sectors: L(() => import('./Sectors')),
  team: L(() => import('./Team')),
  workshop: L(() => import('./Workshop')),
};
