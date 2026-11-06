/** Builds the site search index. Loaded lazily with the search dialog. */
import { TOPICS } from '../data/compare';
import { FRAMEWORKS } from '../data/frameworks';
import { FW_DATA, LABS } from '../data/labs';
import { liveNav } from '../data/routes';

export type HitType = 'Page' | 'Model' | 'Framework' | 'Requirement' | 'Topic' | 'Term' | 'Case';
export interface SearchItem { type: HitType; title: string; snippet: string; to: string; keys: string; body?: string }

const clip = (s: string, n = 110) => (s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : s);

/** Extra sources register themselves here (glossary, cases) so this file has no hard dependency on them. */
const extra: (() => SearchItem[])[] = [];
export function registerSearchSource(f: () => SearchItem[]) { extra.push(f); }

export function buildIndex(): SearchItem[] {
  const items: SearchItem[] = [];
  for (const n of liveNav()) items.push({ type: 'Page', title: n.label, snippet: n.desc, to: n.path, keys: '' });
  for (const l of LABS) {
    items.push({
      type: 'Model',
      title: `${l.model}: ${l.app}`,
      snippet: clip(l.primer),
      to: `/model/${l.id}`,
      keys: [l.short, l.org, ...l.stressors.map((s) => s.label), ...l.mitigations.map((m) => m.label), ...l.stressors.flatMap((s) => s.codes ?? [])].join(' · '),
      body: l.stressors.map((s) => s.desc).join(' '),
    });
  }
  for (const f of FRAMEWORKS) {
    items.push({ type: 'Framework', title: f.name, snippet: clip(f.intro), to: `/rules/${f.id}`, keys: [f.short, f.where, f.type, ...f.keyReqs.map((k) => k.t), ...f.cats.map((c) => c.label)].join(' · ') });
    // one entry per legal reference, e.g. "EU AI Act Art. 27"
    const seen = new Map<string, string>();
    for (const e of Object.values(FW_DATA[f.id])) for (const [text, ref] of e.reqs) if (ref && !seen.has(ref)) seen.set(ref, text);
    for (const [ref, text] of seen) items.push({ type: 'Requirement', title: `${f.short} ${ref}`, snippet: clip(text), to: `/rules/${f.id}`, keys: ref });
  }
  for (const t of TOPICS) items.push({ type: 'Topic', title: `Compare: ${t.label}`, snippet: clip(t.q), to: `/compare?topic=${t.id}`, keys: '' });
  for (const f of extra) items.push(...f());
  return items;
}

export const POPULAR: { title: string; to: string }[] = [
  { title: 'Logistic Regression: Credit scoring', to: '/model/credit' },
  { title: 'EU AI Act guide', to: '/rules/eu' },
  { title: 'Chatbot and prompt injection', to: '/model/chatbot' },
  { title: 'Compare frameworks', to: '/compare' },
  { title: 'The basics', to: '/basics' },
];
