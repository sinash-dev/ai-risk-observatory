import { COMPARE, TOPICS } from '../data/compare';
import { FRAMEWORKS, type FwId } from '../data/frameworks';

/** Topics where framework A is at least two levels firmer than framework B. */
export function gaps(a: FwId, b: FwId) {
  return TOPICS.filter((t) => COMPARE[t.id][a][0] - COMPARE[t.id][b][0] >= 2).map((t) => ({ t, a: COMPARE[t.id][a], b: COMPARE[t.id][b] }));
}

const csvCell = (s: string) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
export function compareCsv() {
  const head = ['Topic', ...FRAMEWORKS.map((f) => f.short)];
  const scores = TOPICS.map((t) => [t.label, ...FRAMEWORKS.map((f) => String(COMPARE[t.id][f.id][0]))]);
  const notes = TOPICS.map((t) => [t.label, ...FRAMEWORKS.map((f) => COMPARE[t.id][f.id][1])]);
  const lines = [['Scores: 0 not addressed, 1 guidance only, 2 required in some cases, 3 detailed binding rule'], head, ...scores, [], ['Summaries'], head, ...notes];
  // byte-order mark so spreadsheet apps read the file as UTF-8
  return '﻿' + lines.map((r) => r.map(csvCell).join(',')).join('\r\n') + '\r\n';
}
