/**
 * Prints candidate references per framework, collected from the requirement data,
 * mitigation refs and compare texts. Used to seed src/data/crosswalk.ts, which is then
 * curated by hand. Run: npx tsx scripts/crosswalk-seed.ts
 */
import { COMPARE } from '../src/data/compare';
import { FRAMEWORKS } from '../src/data/frameworks';
import { FW_DATA, LABS } from '../src/data/labs';

for (const f of FRAMEWORKS) {
  const refs = new Map<string, Set<string>>();
  const add = (ref: string, text: string) => { if (!ref) return; if (!refs.has(ref)) refs.set(ref, new Set()); refs.get(ref)!.add(text.slice(0, 70)); };
  for (const e of Object.values(FW_DATA[f.id])) for (const [text, ref] of e.reqs) add(ref, text);
  for (const k of f.keyReqs) { const m = k.t.match(/\(([^)]+)\)/); if (m) add(m[1], k.t); }
  for (const t of Object.values(COMPARE)) for (const m of t[f.id][1].matchAll(/\b(Arts?\.\s?[\d–\-, ()a-z]+|A\.\d+(\.\d+)*|LLM\d\d:2026|ASI\d\d|(GOVERN|MAP|MEASURE|MANAGE|Govern|Map|Measure|Manage) \d(\.\d+)?)/g)) add(m[0].trim(), t[f.id][1]);
  for (const l of LABS) for (const mit of l.mitigations) for (const r of mit.refs) if (r.startsWith(f.short) || (f.id === 'nist' && r.startsWith('NIST AI RMF')) || (f.id === 'iso' && r.startsWith('ISO/IEC 42001')) || (f.id === 'owasp' && r.startsWith('OWASP'))) add(r, mit.label);
  console.log(`\n## ${f.id}`);
  for (const [ref, texts] of [...refs].sort()) console.log(`  ${ref} :: ${[...texts].slice(0, 2).join(' | ')}`);
}
