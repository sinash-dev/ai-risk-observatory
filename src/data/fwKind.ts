import { SEV } from './palette';
import type { Framework } from './frameworks';

/** Binding type of a framework, used for colour coding (globe markers, lens dot, legends). */
export type FwKind = 'Law' | 'Voluntary framework' | 'Certifiable standard' | 'Security guidance' | 'Principles + existing law';
export const KIND_COLOR: Record<FwKind, string> = {
  Law: SEV.high,
  'Voluntary framework': SEV.info,
  'Certifiable standard': '#6cc5b0',
  'Security guidance': SEV.mid,
  'Principles + existing law': SEV.soft,
};
export function fwKind(f: Pick<Framework, 'type'>): FwKind {
  if (f.type.startsWith('Law')) return 'Law';
  if (f.type in KIND_COLOR) return f.type as FwKind;
  return 'Voluntary framework';
}
export const fwColor = (f: Pick<Framework, 'type'>) => KIND_COLOR[fwKind(f)];
