import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { COMPARE, TOPICS } from '../compare';
import { FRAMEWORKS } from '../frameworks';
import { FW_DATA, LABS } from '../labs';
import { SHORT_NAME } from '../shortNames';

function walk(dir: string, out: string[] = []) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) { if (f !== '__tests__') walk(p, out); }
    else if (/\.(ts|tsx)$/.test(f)) out.push(p);
  }
  return out;
}

describe('data integrity', () => {
  it('lab ids are unique', () => {
    const ids = LABS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every framework has an entry for every lab, with a valid category', () => {
    for (const f of FRAMEWORKS) {
      for (const l of LABS) {
        const e = FW_DATA[f.id][l.id];
        expect(e, `${f.id}/${l.id} missing`).toBeTruthy();
        expect(f.cats.some((c) => c.id === e.cat), `${f.id}/${l.id} bad cat ${e.cat}`).toBe(true);
      }
    }
  });

  it('requirement safeguard ids exist in the lab', () => {
    for (const f of FRAMEWORKS) for (const l of LABS) for (const r of FW_DATA[f.id][l.id].reqs)
      for (const sg of r[2] ?? []) expect(l.mitigations.some((m) => m.id === sg), `${f.id}/${l.id} -> ${sg}`).toBe(true);
  });

  it('mitigations counter existing stressors, and every stressor is countered unless unmitigable', () => {
    for (const l of LABS) {
      for (const m of l.mitigations) for (const c of m.counters) expect(l.stressors.some((s) => s.id === c), `${l.id}: ${m.id} -> ${c}`).toBe(true);
      for (const s of l.stressors) if (!s.unmitigable) expect(l.mitigations.some((m) => m.counters.includes(s.id)), `${l.id}: ${s.id} uncountered`).toBe(true);
    }
  });

  it('learning paths point to existing labs', () => {
    for (const f of FRAMEWORKS) for (const [id] of f.learn ?? []) expect(LABS.some((l) => l.id === id), `${f.id} learn -> ${id}`).toBe(true);
  });

  it('compare has a cell for every topic and framework', () => {
    for (const t of TOPICS) for (const f of FRAMEWORKS) expect(COMPARE[t.id]?.[f.id], `${t.id}/${f.id}`).toBeTruthy();
  });

  it('every lab has a short name', () => {
    for (const l of LABS) expect(SHORT_NAME[l.id], l.id).toBeTruthy();
  });

  it('every url is https', () => {
    const urls = [
      ...FRAMEWORKS.flatMap((f) => f.sources.map((s) => s.url)),
      ...LABS.flatMap((l) => l.incidents.map((i) => i.url).filter(Boolean) as string[]),
    ];
    for (const u of urls) expect(u.startsWith('https://'), u).toBe(true);
  });

  it('no OWASP LLM code without a year suffix', () => {
    const bad: string[] = [];
    for (const file of walk(join(process.cwd(), 'src'))) {
      readFileSync(file, 'utf8').split('\n').forEach((line: string, i: number) => {
        if (/LLM(0[1-9]|10)(?!:20\d\d)/.test(line)) bad.push(`${file}:${i + 1}`);
      });
    }
    expect(bad).toEqual([]);
  });

  it('every example has a residual-risk line, at least two workshop prompts and a checklist', () => {
    for (const l of LABS) {
      expect(l.residual, l.id).toBeTruthy();
      expect((l.discuss ?? []).length, l.id).toBeGreaterThanOrEqual(2);
      expect(l.checklist.length, l.id).toBeGreaterThanOrEqual(3);
    }
  });

  it('problem codes are valid OWASP 2026 codes', () => {
    for (const l of LABS) for (const st of l.stressors) for (const c of st.codes ?? []) expect(c, `${l.id}/${st.id}`).toMatch(/^(LLM(0[1-9]|10):2026|ASI(0[1-9]|10))$/);
  });
});
