/**
 * Team training without a server. A manager puts the plan in a link; each person
 * downloads a record from their own browser; the manager imports the records.
 * Records are self-reported and not tamper-proof, and the pages say so.
 */
import { QUIZ_BY_ID } from '../data/quizzes';
import { TRACK_BY_ID } from '../data/tracks';
import { hash } from './register';

export interface TeamPlan { org: string; team: string; tracks: string[]; quizzes: string[]; due: string; note: string }
export const EMPTY_PLAN: TeamPlan = { org: '', team: '', tracks: [], quizzes: [], due: '', note: '' };

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const str = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max) : '');
const ids = (v: unknown, known: Record<string, unknown>) => (Array.isArray(v) ? [...new Set(v.filter((x): x is string => typeof x === 'string' && x in known))] : []);

/** keep only known tracks and quizzes and bounded text */
export function cleanPlan(o: unknown): TeamPlan {
  const p = (o && typeof o === 'object' ? o : {}) as Record<string, unknown>;
  return {
    org: str(p.org, 120), team: str(p.team, 120), tracks: ids(p.tracks, TRACK_BY_ID), quizzes: ids(p.quizzes, QUIZ_BY_ID),
    due: typeof p.due === 'string' && DATE.test(p.due) ? p.due : '', note: str(p.note, 600),
  };
}

export const planId = (p: TeamPlan) => hash(JSON.stringify([p.org, p.team, p.tracks, p.quizzes, p.due, p.note]));

/* base64url of UTF-8 JSON, so the plan fits in a link */
function toB64url(s: string) {
  const bytes = new TextEncoder().encode(s);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function fromB64url(s: string) {
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}
export const encodePlan = (p: TeamPlan) => toB64url(JSON.stringify(cleanPlan(p)));
export function decodePlan(s: string | null | undefined): TeamPlan | null {
  if (!s || s.length > 4000) return null;
  try {
    const p = cleanPlan(JSON.parse(fromB64url(s)));
    return p.tracks.length || p.quizzes.length ? p : null;
  } catch { return null; }
}

/* ---------- one person's record ---------- */

export interface QuizLine { id: string; score: number; total: number; passed: boolean; at: string }
export interface TrackLine { id: string; done: number; total: number }
export interface LearnerRecord {
  format: 'ai-risk-explorer-learning-record';
  version: 1;
  planId: string;
  plan: TeamPlan;
  name: string;
  role: string;
  /** what the person will do differently at work */
  reflection: string;
  exported: string;
  tracks: TrackLine[];
  quizzes: QuizLine[];
}

export function buildRecord(
  plan: TeamPlan, name: string, role: string, reflection: string,
  trackDone: Record<string, number[]>, quizResults: Record<string, { score: number; total: number; at: number }>,
  now = new Date(),
): LearnerRecord {
  return {
    format: 'ai-risk-explorer-learning-record', version: 1, planId: planId(plan), plan, name: name.trim().slice(0, 120), role: role.trim().slice(0, 120), reflection: reflection.trim().slice(0, 1000), exported: now.toISOString(),
    tracks: plan.tracks.map((id) => {
      const total = TRACK_BY_ID[id].steps.length;
      return { id, done: new Set((trackDone[id] ?? []).filter((i) => Number.isInteger(i) && i >= 0 && i < total)).size, total };
    }),
    quizzes: plan.quizzes.map((id) => {
      const r = quizResults[id];
      return r ? { id, score: r.score, total: r.total, passed: r.score / r.total >= 0.8, at: new Date(r.at).toISOString() } : { id, score: 0, total: QUIZ_BY_ID[id].questions.length, passed: false, at: '' };
    }),
  };
}

const num = (v: unknown, max: number) => (typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.min(max, Math.round(v))) : 0);
/** Validate an imported record; throws a readable message when it is not one. */
export function parseRecord(text: string): LearnerRecord {
  let o: Record<string, unknown>;
  try { o = JSON.parse(text); } catch { throw new Error('This file is not valid JSON.'); }
  if (!o || o.format !== 'ai-risk-explorer-learning-record') throw new Error('This file is not a learning record from AI Risk Explorer.');
  const plan = cleanPlan(o.plan);
  const tracks = (Array.isArray(o.tracks) ? o.tracks : []).flatMap((t: Record<string, unknown>) => {
    const id = typeof t?.id === 'string' ? t.id : '';
    if (!TRACK_BY_ID[id]) return [];
    const total = TRACK_BY_ID[id].steps.length;
    return [{ id, done: num(t.done, total), total }];
  });
  const quizzes = (Array.isArray(o.quizzes) ? o.quizzes : []).flatMap((q: Record<string, unknown>) => {
    const id = typeof q?.id === 'string' ? q.id : '';
    if (!QUIZ_BY_ID[id]) return [];
    const total = QUIZ_BY_ID[id].questions.length;
    const score = num(q.score, total);
    const at = typeof q.at === 'string' && !Number.isNaN(Date.parse(q.at)) ? q.at : '';
    return [{ id, score, total, passed: !!at && score / total >= 0.8, at }];
  });
  const name = str(o.name, 120).trim();
  if (!name) throw new Error('This record has no name.');
  return {
    format: 'ai-risk-explorer-learning-record', version: 1, planId: str(o.planId, 40), plan, name, role: str(o.role, 120), reflection: str(o.reflection, 1000),
    exported: typeof o.exported === 'string' && !Number.isNaN(Date.parse(o.exported)) ? o.exported : '', tracks, quizzes,
  };
}

/* ---------- team record ---------- */

export const recordKey = (r: LearnerRecord) => `${r.planId}|${r.name.toLowerCase()}`;
/** keep the most recent record per person and plan */
export function mergeRecords(old: LearnerRecord[], add: LearnerRecord[]) {
  const m = new Map(old.map((r) => [recordKey(r), r]));
  for (const r of add) { const k = recordKey(r); const cur = m.get(k); if (!cur || r.exported > cur.exported) m.set(k, r); }
  return [...m.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function progressOfRecord(r: LearnerRecord) {
  const steps = r.tracks.reduce((a, t) => a + t.done, 0);
  const stepsTotal = r.tracks.reduce((a, t) => a + t.total, 0);
  const passed = r.quizzes.filter((q) => q.passed).length;
  const complete = steps === stepsTotal && passed === r.quizzes.length;
  return { steps, stepsTotal, passed, quizzes: r.quizzes.length, complete };
}

const csvCell = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
export function teamCsv(records: LearnerRecord[]) {
  const head = ['name', 'role', 'team', 'organisation', 'plan id', 'record exported', 'track steps done', 'track steps total', 'quizzes passed', 'quizzes in plan', 'complete', 'quiz details', 'reflection'];
  const rows = records.map((r) => {
    const p = progressOfRecord(r);
    const details = r.quizzes.map((q) => `${QUIZ_BY_ID[q.id].title} ${q.score}/${q.total}${q.at ? ` on ${q.at.slice(0, 10)}` : ' (not taken)'}`).join('; ');
    return [r.name, r.role, r.plan.team, r.plan.org, r.planId, r.exported.slice(0, 10), String(p.steps), String(p.stepsTotal), String(p.passed), String(p.quizzes), p.complete ? 'yes' : 'no', details, r.reflection];
  });
  return '﻿' + [head, ...rows].map((r) => r.map((v) => csvCell(v.replace(/\r?\n/g, ' '))).join(',')).join('\r\n') + '\r\n';
}

export const RECORD_NOTE = 'Internal record of AI literacy measures (EU AI Act Art. 4). The European Commission’s AI literacy Q&A says no certificate is needed and organisations can keep an internal record of training. Results are self-reported from each person’s browser and are not tamper-proof.';

export function teamMarkdown(records: LearnerRecord[], today = new Date()) {
  const lines = [`# AI literacy training record`, '', `Prepared ${today.toISOString().slice(0, 10)} with AI Risk Explorer.`, '', `*${RECORD_NOTE}*`, ''];
  const byPlan = new Map<string, LearnerRecord[]>();
  for (const r of records) byPlan.set(r.planId, [...(byPlan.get(r.planId) ?? []), r]);
  for (const [, rs] of byPlan) {
    const plan = rs[0].plan;
    lines.push(`## ${plan.team || 'Team'}${plan.org ? `, ${plan.org}` : ''}`, '');
    lines.push(`- Tracks: ${plan.tracks.map((id) => TRACK_BY_ID[id].title).join(', ') || 'none'}`);
    lines.push(`- Quizzes: ${plan.quizzes.map((id) => QUIZ_BY_ID[id].title).join(', ') || 'none'}`);
    if (plan.due) lines.push(`- Complete by: ${plan.due}`);
    if (plan.note) lines.push(`- Note: ${plan.note.replace(/\r?\n/g, ' ')}`);
    lines.push('', '| Name | Role | Track steps | Quizzes passed (80%+) | Complete | Record date |', '|---|---|---|---|---|---|');
    for (const r of rs) {
      const p = progressOfRecord(r);
      const cell = (s: string) => s.replace(/\|/g, '/').replace(/\r?\n/g, ' ');
      lines.push(`| ${cell(r.name)} | ${cell(r.role) || '-'} | ${p.steps}/${p.stepsTotal} | ${p.passed}/${p.quizzes} | ${p.complete ? 'Yes' : 'No'} | ${r.exported.slice(0, 10)} |`);
    }
    lines.push('');
    const refl = rs.filter((r) => r.reflection.trim());
    if (refl.length) {
      lines.push('### What people will do differently', '');
      for (const r of refl) lines.push(`- **${r.name}:** ${r.reflection.replace(/\r?\n/g, ' ')}`);
      lines.push('');
    }
  }
  return lines.join('\n');
}

/* ---------- storage for the manager's view ---------- */
const KEY = 'are-team-v1';
export function loadTeam(): LearnerRecord[] {
  try { const a = JSON.parse(localStorage.getItem(KEY) ?? '[]'); return Array.isArray(a) ? a.flatMap((r) => { try { return [parseRecord(JSON.stringify(r))]; } catch { return []; } }) : []; } catch { return []; }
}
export function saveTeam(r: LearnerRecord[]) { try { localStorage.setItem(KEY, JSON.stringify(r)); } catch { /* ignore */ } }
