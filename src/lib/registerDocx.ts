/**
 * Word (.docx) version of the register report. Loaded only when someone asks for it,
 * so the docx library never weighs on the register page itself.
 */
import { AlignmentType, BorderStyle, Document, HeadingLevel, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType } from 'docx';
import { NOT_ASSESSED, REG_LABEL, STATUS_LABEL, actionsOf, categoryOf, deadlines, euCell, progressOf, resultOf, summary, summaryLines, type RegSystem } from './register';

const FONT = 'Calibri';
const p = (text: string, opts: { bold?: boolean; italic?: boolean; size?: number } = {}) =>
  new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text, font: FONT, bold: opts.bold, italics: opts.italic, size: opts.size })] });
const h = (text: string, level: (typeof HeadingLevel)[keyof typeof HeadingLevel]) => new Paragraph({ heading: level, spacing: { before: 240, after: 120 }, children: [new TextRun({ text, font: FONT })] });
const bullet = (text: string) => new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text, font: FONT })] });
const check = (done: boolean, text: string) => new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: `${done ? '☑' : '☐'}  ${text}`, font: FONT })] });

const border = { style: BorderStyle.SINGLE, size: 4, color: 'BFBFBF' };
const cell = (text: string, head = false) => new TableCell({
  borders: { top: border, bottom: border, left: border, right: border },
  shading: head ? { fill: 'EDEFF2' } : undefined,
  margins: { top: 60, bottom: 60, left: 100, right: 100 },
  children: [new Paragraph({ children: [new TextRun({ text, font: FONT, bold: head, size: 20 })] })],
});
const table = (rows: string[][]) => new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  rows: rows.map((r, i) => new TableRow({ tableHeader: i === 0, children: r.map((c) => cell(c, i === 0)) })),
});
const pairs = (rows: [string, string][]) => new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  rows: rows.map(([k, v]) => new TableRow({ children: [cell(k, true), cell(v)] })),
});

function systemSection(s: RegSystem) {
  const r = resultOf(s);
  const acts = actionsOf(s, r);
  const pr = progressOf(s);
  const out: (Paragraph | Table)[] = [
    h(s.name || 'Unnamed system', HeadingLevel.HEADING_2),
    pairs([
      ['Owner', s.owner || '-'],
      ['Purpose', s.purpose || '-'],
      ['Vendor', s.vendor || 'Built in-house'],
      ['Status', STATUS_LABEL[s.status]],
      ['EU AI Act', euCell(s, r)],
      ['Actions done', `${pr.done} of ${pr.total}`],
      ['Next review', s.nextReview || '-'],
    ]),
  ];
  if (!s.assessed) {
    out.push(p(NOT_ASSESSED, { italic: true }));
    if (s.notes.trim()) { out.push(h('Our notes', HeadingLevel.HEADING_3)); for (const line of s.notes.trim().split(/\r?\n/)) out.push(p(line)); }
    return out;
  }
  for (const c of r.cards) {
    out.push(h(`${c.title}: ${c.verdict}`, HeadingLevel.HEADING_3));
    for (const w of c.why) out.push(bullet(w));
    for (const a of acts.filter((x) => x.source === c.title)) out.push(check(!!s.done[a.id], a.text));
  }
  if (r.notes.length) { out.push(h('Notes', HeadingLevel.HEADING_3)); for (const n of r.notes) out.push(bullet(n)); }
  if (s.notes.trim()) { out.push(h('Our notes', HeadingLevel.HEADING_3)); for (const line of s.notes.trim().split(/\r?\n/)) out.push(p(line)); }
  return out;
}

function summarySection(list: RegSystem[], today: Date) {
  const { facts, next, actions } = summaryLines(summary(list, today));
  const out: Paragraph[] = [h('Summary for management', HeadingLevel.HEADING_1), ...facts.map(bullet)];
  out.push(p('Next dates', { bold: true }), ...(next.length ? next.map(bullet) : [bullet('No upcoming EU AI Act or Colorado dates for these systems.')]));
  out.push(p('Top open actions', { bold: true }), ...(actions.length ? actions.map((a, i) => p(`${i + 1}. ${a}`)) : [bullet('None. Every listed action is ticked off.')]));
  return out;
}

export function registerDocument(list: RegSystem[], org: string, today = new Date()) {
  const date = today.toISOString().slice(0, 10);
  const dl = deadlines(list, today);
  const children: (Paragraph | Table)[] = [
    new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun({ text: `AI register${org.trim() ? `: ${org.trim()}` : ''}`, font: FONT })] }),
    p(`Exported ${date} from AI Risk Explorer. Indicative self-assessment for internal use; not legal advice.`, { italic: true }),
    ...summarySection(list, today),
    h('Systems at a glance', HeadingLevel.HEADING_1),
    table([
      ['System', 'Owner', 'Status', 'EU AI Act', 'Actions done'],
      ...list.map((s) => { const pr = progressOf(s); return [s.name || 'Unnamed', s.owner || '-', STATUS_LABEL[s.status], REG_LABEL[categoryOf(s)], `${pr.done}/${pr.total}`]; }),
    ]),
  ];
  if (dl.length) {
    children.push(h('Upcoming dates', HeadingLevel.HEADING_1));
    for (const d of dl) children.push(bullet(`${d.date.toISOString().slice(0, 10)}: ${d.system || 'Unnamed system'}. ${d.label}`));
  }
  children.push(h('Systems', HeadingLevel.HEADING_1));
  for (const s of list) children.push(...systemSection(s));
  children.push(new Paragraph({ alignment: AlignmentType.LEFT, spacing: { before: 360 }, children: [new TextRun({ text: 'Classification follows the questions answered in AI Risk Explorer (https://sinash-dev.github.io/ai-risk-observatory/). Check the official texts before relying on it.', font: FONT, italics: true, size: 18 })] }));
  return new Document({
    creator: 'AI Risk Explorer',
    title: `AI register${org.trim() ? `: ${org.trim()}` : ''}`,
    styles: { default: { document: { run: { font: FONT, size: 22 } } } },
    sections: [{ children }],
  });
}

export function registerDocxBlob(list: RegSystem[], org: string, today = new Date()) {
  return Packer.toBlob(registerDocument(list, org, today));
}
