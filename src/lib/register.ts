/**
 * "My AI register": a list of the organisation's AI systems, kept only in this browser.
 * Pure functions here (classification, actions, reports, import); storage helpers at the end.
 */
import { EMPTY, classify, type Answers, type EuCat, type Result } from './classify';

export type Status = 'idea' | 'pilot' | 'live' | 'retired';
export const STATUS_LABEL: Record<Status, string> = { idea: 'Idea or procurement', pilot: 'Pilot', live: 'In use', retired: 'Retired' };
export const EU_LABEL: Record<EuCat, string> = { banned: 'Banned', high: 'High-risk', 'gpai-systemic': 'GPAI model, systemic risk', gpai: 'GPAI model', limited: 'Transparency duties', minimal: 'Minimal risk', outside: 'EU not selected' };
/** what the register shows for a system: its EU category, or "not yet assessed" until the questions are answered */
export type RegCat = EuCat | 'unassessed';
export const REG_LABEL: Record<RegCat, string> = { unassessed: 'Not yet assessed', ...EU_LABEL };

export interface RegSystem {
  id: string;
  name: string;
  owner: string;
  purpose: string;
  vendor: string;
  status: Status;
  answers: Answers;
  /** false until the questions have been answered; until then the system has no category, actions or dates */
  assessed: boolean;
  /** action id → done */
  done: Record<string, boolean>;
  notes: string;
  created: string; // ISO date
  updated: string; // ISO date
  nextReview: string; // ISO date or ''
}

export interface Action { id: string; source: string; text: string }

/** small stable hash so an action keeps its tick when the list is rebuilt */
export function hash(s: string) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (h * 33) ^ s.charCodeAt(i);
  return (h >>> 0).toString(36);
}

export function resultOf(s: RegSystem): Result { return classify(s.answers); }

/** the category to show: the EU AI Act category once assessed, otherwise "unassessed" (never a default "Minimal risk") */
export function categoryOf(s: RegSystem): RegCat { return s.assessed ? resultOf(s).eu : 'unassessed'; }

/** what to do for this system, taken from every framework card of its classification; none until it is assessed */
export function actionsOf(s: RegSystem, r: Result = resultOf(s)): Action[] {
  if (!s.assessed) return [];
  return r.cards.flatMap((c) => c.next.map((text) => ({ id: hash(c.id + '|' + text), source: c.title, text })));
}

/** the answers a new system starts with */
const START: Answers = { ...EMPTY, where: ['eu'] };
const canon = (a: Answers) => JSON.stringify(Object.keys(a).sort().filter((k) => a[k as keyof Answers] !== undefined).map((k) => [k, a[k as keyof Answers]]));
/** true if the answers are still exactly those of a new system (used for registers saved before "assessed" existed) */
export function untouched(a: Answers) { return canon({ ...EMPTY, ...a }) === canon(START); }

export function progressOf(s: RegSystem) {
  const a = actionsOf(s);
  const done = a.filter((x) => s.done[x.id]).length;
  return { done, total: a.length };
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
/** "2 December 2027" -> Date (UTC noon) */
export function parseLongDate(d: string): Date | null {
  const m = d.match(/^(\d{1,2}) ([A-Z][a-z]+) (\d{4})$/);
  if (!m) return null;
  const mi = MONTHS.indexOf(m[2]);
  return mi < 0 ? null : new Date(Date.UTC(+m[3], mi, +m[1], 12));
}

const DUE: Record<EuCat, string> = { banned: 'the ban applies', high: 'high-risk rules apply', 'gpai-systemic': 'duties for GPAI models with systemic risk apply', gpai: 'duties for GPAI models apply', limited: 'transparency duties apply', minimal: 'no specific duties', outside: '' };

export interface Deadline { system: string; date: Date; label: string }
/** EU AI Act dates for the registered systems that are still in the future */
export function deadlines(list: RegSystem[], today = new Date()): Deadline[] {
  const out: Deadline[] = [];
  for (const s of list) {
    if (s.status === 'retired' || !s.assessed) continue;
    const r = resultOf(s);
    const d = r.euFrom ? parseLongDate(r.euFrom) : null;
    if (d && d > today) out.push({ system: s.name, date: d, label: `EU AI Act: ${DUE[r.eu]} from ${r.euFrom}` });
    if (s.answers.where.includes('us') && ['education', 'employment', 'services'].includes(s.answers.area)) {
      const co = new Date(Date.UTC(2027, 0, 1, 12));
      if (co > today) out.push({ system: s.name, date: co, label: 'Colorado SB 26-189 applies from 1 January 2027 if it influences consequential decisions about Colorado residents' });
    }
  }
  return out.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function newSystem(now = new Date()): RegSystem {
  const d = now.toISOString().slice(0, 10);
  return { id: hash(now.toISOString() + Math.random()), name: '', owner: '', purpose: '', vendor: '', status: 'idea', answers: { ...START }, assessed: false, done: {}, notes: '', created: d, updated: d, nextReview: '' };
}

/* ---------- management summary (top of the Markdown and Word reports) ---------- */

/** most severe EU category first; used to rank systems and their open actions */
const SEVERITY: EuCat[] = ['banned', 'high', 'gpai-systemic', 'gpai', 'limited', 'minimal', 'outside'];

export interface Summary {
  /** systems in the register, including retired ones */
  systems: number;
  retired: number;
  /** systems whose questions are not answered yet; they have no category, actions or dates */
  unassessed: number;
  /** EU AI Act categories that occur among assessed systems, most severe first */
  byCategory: { cat: EuCat; label: string; n: number }[];
  /** systems still in use or planned with at least one open action */
  withOpenActions: number;
  /** the next three dates from deadlines() */
  next: Deadline[];
  /** up to five open actions, from the most severe systems first */
  topActions: { system: string; source: string; text: string }[];
}

export function summary(list: RegSystem[], today = new Date()): Summary {
  const active = list.filter((s) => s.status !== 'retired');
  const cats = new Map<EuCat, number>();
  for (const s of list) { if (!s.assessed) continue; const e = resultOf(s).eu; cats.set(e, (cats.get(e) ?? 0) + 1); }
  const open = active
    .map((s) => { const r = resultOf(s); return { s, r, acts: actionsOf(s, r).filter((a) => !s.done[a.id]) }; })
    .filter((x) => x.acts.length > 0);
  const ranked = [...open].sort((a, b) => SEVERITY.indexOf(a.r.eu) - SEVERITY.indexOf(b.r.eu));
  const topActions: Summary['topActions'] = [];
  // one action per system in turn, so a single large system does not fill the list
  for (let round = 0; topActions.length < 5 && ranked.some((x) => x.acts.length > round); round++) {
    for (const x of ranked) {
      if (topActions.length >= 5) break;
      const a = x.acts[round];
      if (a) topActions.push({ system: x.s.name || 'Unnamed system', source: a.source, text: a.text });
    }
  }
  return {
    systems: list.length,
    retired: list.length - active.length,
    unassessed: list.filter((s) => !s.assessed).length,
    byCategory: SEVERITY.filter((c) => cats.has(c)).map((c) => ({ cat: c, label: EU_LABEL[c], n: cats.get(c)! })),
    withOpenActions: open.length,
    next: deadlines(list, today).slice(0, 3),
    topActions,
  };
}

/** the summary as lines of Markdown; the Word report renders the same content */
export function summaryLines(m: Summary): { facts: string[]; next: string[]; actions: string[] } {
  const facts = [
    `Systems in the register: ${m.systems}${m.retired ? ` (${m.retired} retired)` : ''}`,
    `EU AI Act categories: ${m.byCategory.length ? m.byCategory.map((c) => `${c.label} ${c.n}`).join(', ') : 'none yet'}`,
    ...(m.unassessed ? [`Not yet assessed: ${m.unassessed}. Their questions are not answered, so they have no category, actions or dates in this report.`] : []),
    `Systems with open actions: ${m.withOpenActions} of ${m.systems - m.retired}`,
  ];
  const next = m.next.map((d) => `${d.date.toISOString().slice(0, 10)}: ${line(d.system) || 'Unnamed system'}. ${d.label}`);
  const actions = m.topActions.map((a) => `${line(a.system)} (${a.source}): ${a.text}`);
  return { facts, next, actions };
}

/* ---------- reports ---------- */

const line = (s: string) => s.replace(/\r?\n/g, ' ').trim();
/** shown in reports for a system whose questions are not answered yet */
export const NOT_ASSESSED = 'Not yet assessed: the questions for this system are not answered, so it has no category, actions or dates yet. Answer them in the register before relying on this report.';
/** "High-risk (from 2 December 2027)", or "Not yet assessed" */
export function euCell(s: RegSystem, r: Result = resultOf(s)) { return s.assessed ? `${EU_LABEL[r.eu]}${r.euFrom ? ` (from ${r.euFrom})` : ''}` : REG_LABEL.unassessed; }

export function systemMarkdown(s: RegSystem, today = new Date()) {
  const r = resultOf(s);
  const acts = actionsOf(s, r);
  const p = progressOf(s);
  const out = [
    `## ${line(s.name) || 'Unnamed system'}`,
    '',
    `| | |`,
    `|---|---|`,
    `| Owner | ${line(s.owner) || '-'} |`,
    `| Purpose | ${line(s.purpose) || '-'} |`,
    `| Vendor | ${line(s.vendor) || 'Built in-house'} |`,
    `| Status | ${STATUS_LABEL[s.status]} |`,
    `| EU AI Act | ${euCell(s, r)} |`,
    `| Actions done | ${p.done} of ${p.total} |`,
    `| Next review | ${s.nextReview || '-'} |`,
    '',
  ];
  if (!s.assessed) {
    out.push(NOT_ASSESSED, '');
    if (s.notes.trim()) out.push('### Our notes', '', s.notes.trim(), '');
    return out.join('\n');
  }
  for (const c of r.cards) {
    out.push(`### ${c.title}: ${c.verdict}`, '');
    for (const w of c.why) out.push(`- ${w}`);
    out.push('');
    for (const a of acts.filter((x) => x.source === c.title)) out.push(`- [${s.done[a.id] ? 'x' : ' '}] ${a.text}`);
    out.push('');
  }
  if (r.notes.length) { out.push('### Notes', ''); for (const n of r.notes) out.push(`- ${n}`); out.push(''); }
  if (s.notes.trim()) out.push('### Our notes', '', s.notes.trim(), '');
  void today;
  return out.join('\n');
}

/** Insertion point 'export.board-pack' (see entitlements.ts): a board-ready pack with charts would build on this summary. */
function summaryMarkdown(list: RegSystem[], today: Date) {
  const { facts, next, actions } = summaryLines(summary(list, today));
  const out = ['## Summary for management', '', ...facts.map((f) => `- ${f}`), ''];
  out.push('Next dates:', '', ...(next.length ? next.map((n) => `- ${n}`) : ['- No upcoming EU AI Act or Colorado dates for these systems.']), '');
  out.push('Top open actions:', '', ...(actions.length ? actions.map((a, i) => `${i + 1}. ${a}`) : ['- None. Every listed action is ticked off.']), '');
  return out;
}

export function registerMarkdown(list: RegSystem[], org: string, today = new Date()) {
  const date = today.toISOString().slice(0, 10);
  const dl = deadlines(list, today);
  const head = [
    `# AI register${org.trim() ? `: ${line(org)}` : ''}`,
    '',
    `Exported ${date} from AI Risk Explorer. Indicative self-assessment for internal use; not legal advice.`,
    '',
    ...summaryMarkdown(list, today),
    '## Systems at a glance',
    '',
    '| System | Owner | Status | EU AI Act | Actions done |',
    '|---|---|---|---|---|',
    ...list.map((s) => { const p = progressOf(s); return `| ${line(s.name) || 'Unnamed'} | ${line(s.owner) || '-'} | ${STATUS_LABEL[s.status]} | ${REG_LABEL[categoryOf(s)]} | ${p.done}/${p.total} |`; }),
    '',
  ];
  if (dl.length) { head.push('## Upcoming dates', ''); for (const d of dl) head.push(`- ${d.date.toISOString().slice(0, 10)}: ${line(d.system)}. ${d.label}`); head.push(''); }
  return [...head, ...list.map((s) => systemMarkdown(s, today))].join('\n');
}

const csvCell = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
/** CSV in the same columns as the toolkit's inventory template, plus progress */
export function registerCsv(list: RegSystem[]) {
  const head = ['id', 'name', 'owner', 'purpose', 'vendor', 'status', 'where used', 'role', 'EU category', 'EU date', 'actions done', 'actions total', 'next review', 'last updated'];
  const rows = list.map((s) => {
    const r = resultOf(s);
    const p = progressOf(s);
    return [s.id, s.name, s.owner, s.purpose, s.vendor, STATUS_LABEL[s.status], s.answers.where.join(' '), s.answers.role, REG_LABEL[categoryOf(s)], s.assessed ? r.euFrom ?? '' : '', String(p.done), String(p.total), s.nextReview, s.updated];
  });
  return '﻿' + [head, ...rows].map((r) => r.map((v) => csvCell(line(v))).join(',')).join('\r\n') + '\r\n';
}

/* ---------- import ---------- */

const isStr = (v: unknown): v is string => typeof v === 'string';
const STATUSES: Status[] = ['idea', 'pilot', 'live', 'retired'];
/** Validate a JSON export. Unknown or malformed entries are dropped, never trusted. */
export function parseImport(text: string): { systems: RegSystem[]; skipped: number } {
  let data: unknown;
  try { data = JSON.parse(text); } catch { throw new Error('This file is not valid JSON.'); }
  const arr = (data && typeof data === 'object' && Array.isArray((data as { systems?: unknown }).systems)) ? (data as { systems: unknown[] }).systems : Array.isArray(data) ? data : null;
  if (!arr) throw new Error('No systems found in this file.');
  const systems: RegSystem[] = [];
  let skipped = 0;
  for (const x of arr) {
    const o = x as Partial<RegSystem>;
    if (!o || typeof o !== 'object' || !isStr(o.id) || !isStr(o.name) || !o.answers || typeof o.answers !== 'object') { skipped++; continue; }
    const ans = { ...EMPTY, ...(o.answers as Answers) };
    if (!Array.isArray(ans.where) || !Array.isArray(ans.banned) || !Array.isArray(ans.interact)) { skipped++; continue; }
    systems.push({
      id: o.id.slice(0, 40), name: o.name.slice(0, 200), owner: isStr(o.owner) ? o.owner.slice(0, 200) : '', purpose: isStr(o.purpose) ? o.purpose.slice(0, 1000) : '',
      vendor: isStr(o.vendor) ? o.vendor.slice(0, 200) : '', status: STATUSES.includes(o.status as Status) ? (o.status as Status) : 'idea', answers: ans,
      // registers saved before "assessed" existed: count a system as assessed only if its answers were changed from the start values
      assessed: typeof o.assessed === 'boolean' ? o.assessed : !untouched(ans),
      done: o.done && typeof o.done === 'object' ? Object.fromEntries(Object.entries(o.done).filter(([, v]) => v === true)) : {},
      notes: isStr(o.notes) ? o.notes.slice(0, 5000) : '', created: isStr(o.created) ? o.created.slice(0, 10) : '', updated: isStr(o.updated) ? o.updated.slice(0, 10) : '',
      nextReview: isStr(o.nextReview) && /^\d{4}-\d{2}-\d{2}$/.test(o.nextReview) ? o.nextReview : '',
    });
  }
  return { systems, skipped };
}

/* ---------- storage (this browser only) ---------- */

const KEY = 'are-register-v1';
export interface RegisterData { org: string; systems: RegSystem[] }
export function loadRegister(): RegisterData {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { const d = JSON.parse(raw); return { org: isStr(d.org) ? d.org : '', systems: parseImport(JSON.stringify(d.systems ?? [])).systems }; }
  } catch { /* ignore */ }
  return { org: '', systems: [] };
}
export function saveRegister(d: RegisterData) {
  try { localStorage.setItem(KEY, JSON.stringify(d)); } catch { /* storage full or blocked */ }
}
