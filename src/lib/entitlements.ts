/**
 * Where paid features could go later. Today everything is free and nothing is gated.
 *
 * A static site on GitHub Pages cannot enforce paid features by itself: all code runs in the
 * visitor's browser, so any check here could be switched off. Real gating needs an authenticated
 * backend (planned for Phase 4, the move to Hostinger). Until then these are only markers that
 * show one place to change for each feature.
 */
export type Feature =
  | 'export.word'
  | 'export.board-pack'
  | 'register.multi-register'
  | 'team.shared-workspace'
  | 'toolkit.prefilled'
  | 'workshop.white-label';

/** while true, every feature is available to everyone */
export const FREE_FOR_NOW = true;

/** a later preview mode could label future paid features; off, and nothing reads it yet */
export const SHOW_PREMIUM_HINTS = false;

export function hasFeature(_f: Feature): boolean {
  return FREE_FOR_NOW;
}

/** each insertion point: where it is in the code, and what could be paid later */
export const PREMIUM_SLOTS: Record<Feature, { file: string; place: string; later: string }> = {
  'export.word': { file: 'src/pages/Register.tsx', place: 'Register Export menu: Word report', later: 'branded or templated Word output' },
  'export.board-pack': { file: 'src/lib/register.ts', place: 'Summary for management in the reports', later: 'board-ready PDF or Word pack with charts' },
  'register.multi-register': { file: 'src/pages/Register.tsx', place: 'Register header', later: 'several registers, for example one per business unit' },
  'team.shared-workspace': { file: 'src/pages/Team.tsx', place: 'Team page', later: 'a shared record across devices and people' },
  'toolkit.prefilled': { file: 'src/pages/Toolkit.tsx', place: 'Toolkit downloads', later: 'templates prefilled from the register' },
  'workshop.white-label': { file: 'src/pages/Workshop.tsx', place: 'Workshop slides', later: 'logo and colours for in-house sessions' },
};
