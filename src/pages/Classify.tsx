import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Breadcrumbs } from '../components/Nav';
import { copyText, toast } from '../components/Toast';
import { LAB_BY_ID, fwEntry } from '../data/labs';
import { AREA_TEXT, EMPTY, classify, type Answers } from '../lib/classify';
import { AREAS, BANNED, INTERACT, ROLE, SERVICES, WHERE, type Opt } from '../lib/classifyOptions';
import { PyramidMini } from '../components/RiskPyramid';
import { tierOfCategory } from '../data/euTiers';
import { track } from '../lib/track';
import { url } from '../lib/util';
import type { PageProps } from './registry';
import { Multi, Radio } from '../components/Choice';

function encode(a: Answers) { try { return btoa(JSON.stringify(a)).replace(/=+$/, ''); } catch { return ''; } }
function decode(s: string | null | undefined): Answers | null {
  if (!s) return null;
  try { return { ...EMPTY, ...JSON.parse(atob(s)) }; } catch { return null; }
}

interface Step { id: string; legend: string; hint?: string; show?: (a: Answers) => boolean; ok?: (a: Answers) => boolean; body: (a: Answers, set: (p: Partial<Answers>) => void) => JSX.Element; summary: (a: Answers) => string }
const STEPS: Step[] = [
  { id: 'where', legend: 'Where will it be used or offered?', hint: 'Select all that apply.', ok: (a) => a.where.length > 0, body: (a, set) => <Multi opts={WHERE} value={a.where} set={(v) => set({ where: v })} />, summary: (a) => a.where.map((w) => WHERE.find((x) => x.v === w)!.l).join(', ') || '—' },
  { id: 'role', legend: 'What is your role?', body: (a, set) => <Radio name="role" opts={ROLE} value={a.role} set={(v) => set({ role: v })} />, summary: (a) => ROLE.find((x) => x.v === a.role)!.d! },
  { id: 'banned', legend: 'Does it do any of the following?', hint: 'The practices the EU AI Act bans, paraphrased.', body: (a, set) => <Multi opts={BANNED} value={a.banned} set={(v) => set({ banned: v })} none="None of these" />, summary: (a) => (a.banned.length ? `${a.banned.length} banned practice(s)` : 'None') },
  { id: 'product', legend: 'Is it a product, or a safety part of a product, covered by EU product law that needs a third-party check?', hint: 'For example medical devices, machinery, toys, lifts or vehicles.', body: (a, set) => <Radio name="product" opts={[{ v: 'yes', l: 'Yes' }, { v: 'no', l: 'No' }, { v: 'unsure', l: 'Not sure' }]} value={a.product} set={(v) => set({ product: v as Answers['product'] })} />, summary: (a) => ({ yes: 'Yes', no: 'No', unsure: 'Not sure' })[a.product] },
  {
    id: 'area', legend: 'Which area does it make or support decisions in?', hint: 'These are the high-risk areas in Annex III of the EU AI Act.',
    ok: (a) => a.area !== 'services' || !!a.service,
    body: (a, set) => (
      <>
        <Radio name="area" opts={AREAS} value={a.area} set={(v) => set({ area: v, service: v === 'services' ? a.service : undefined })} />
        {a.area === 'services' && (
          <fieldset className="sub">
            <legend className="label">What exactly does it do?</legend>
            <Radio name="service" opts={SERVICES} value={a.service} set={(v) => set({ service: v })} />
          </fieldset>
        )}
      </>
    ),
    summary: (a) => (a.area === 'none' ? 'None' : AREA_TEXT[a.area].split(' (')[0] + (a.service ? ` · ${SERVICES.find((x) => x.v === a.service)!.l.toLowerCase()}` : '')),
  },
  {
    id: 'narrow', legend: 'Does it only do a narrow procedural task, improve work a person has already done, spot patterns without replacing human judgement, or do preparatory work, and does it not profile people?',
    hint: 'This is the exception in Art. 6(3). If yes, you must document this assessment and still register the system.',
    show: (a) => a.area !== 'none' && a.product !== 'yes' && a.service !== 'fraud', ok: (a) => !!a.narrow,
    body: (a, set) => <Radio name="narrow" opts={[{ v: 'yes', l: 'Yes, all of that applies' }, { v: 'no', l: 'No' }]} value={a.narrow} set={(v) => set({ narrow: v as 'yes' | 'no' })} />,
    summary: (a) => (a.narrow === 'yes' ? 'Narrow task' : 'No'),
  },
  { id: 'gpai', legend: 'Is it a general-purpose AI model that you develop and place on the market?', body: (a, set) => <Radio name="gpai" opts={[{ v: 'no', l: 'No' }, { v: 'yes', l: 'Yes' }, { v: 'systemic', l: 'Yes, trained with more than 10²⁵ floating-point operations' }]} value={a.gpai} set={(v) => set({ gpai: v as Answers['gpai'] })} />, summary: (a) => ({ no: 'No', yes: 'Yes', systemic: 'Yes, above 10²⁵' })[a.gpai] },
  { id: 'interact', legend: 'Does it do any of these?', hint: 'Select all that apply.', body: (a, set) => <Multi opts={INTERACT} value={a.interact} set={(v) => set({ interact: v })} none="None of these" />, summary: (a) => (a.interact.length ? a.interact.length + ' selected' : 'None') },
  {
    id: 'data', legend: 'Personal data and automated decisions',
    body: (a, set) => (
      <>
        <p className="small muted" style={{ margin: '0 0 6px' }}>Does it process personal data?</p>
        <Radio name="personal" opts={[{ v: 'yes', l: 'Yes' }, { v: 'no', l: 'No' }]} value={a.personal} set={(v) => set({ personal: v as 'yes' | 'no' })} />
        <p className="small muted" style={{ margin: '14px 0 6px' }}>Does it make decisions with legal or similarly significant effects on people without meaningful human involvement?</p>
        <Radio name="automated" opts={[{ v: 'yes', l: 'Yes' }, { v: 'no', l: 'No' }]} value={a.automated} set={(v) => set({ automated: v as 'yes' | 'no' })} />
      </>
    ),
    summary: (a) => `${a.personal === 'yes' ? 'Personal data' : 'No personal data'}${a.automated === 'yes' ? ', automated decisions' : ''}`,
  },
  { id: 'agent', legend: 'Does it act on its own with tools, such as payments, email, code or a web browser?', body: (a, set) => <Radio name="agent" opts={[{ v: 'yes', l: 'Yes' }, { v: 'no', l: 'No' }]} value={a.agent} set={(v) => set({ agent: v as 'yes' | 'no' })} />, summary: (a) => (a.agent === 'yes' ? 'Yes' : 'No') },
];

function resultMarkdown(a: Answers) {
  const r = classify(a);
  const lines = ['# AI system classification (indicative)', '', '> Indicative only. Not legal advice. Check the official text and get legal review.', ''];
  for (const c of r.cards) {
    lines.push(`## ${c.title}: ${c.verdict}`, '', '**Why**', ...c.why.map((w) => `- ${w}`), '', '**What to do next**', ...c.next.map((n) => `- ${n}`), '');
  }
  if (r.notes.length) lines.push('## Notes', ...r.notes.map((n) => `- ${n}`), '');
  lines.push('## Closest examples on AI Risk Explorer', ...r.examples.map((id) => `- ${LAB_BY_ID[id].model}: ${LAB_BY_ID[id].app}`));
  return lines.join('\n') + '\n';
}

export default function Classify({ query }: PageProps) {
  const initial = decode(query?.get('a'));
  const [a, setA] = useState<Answers>(initial ?? EMPTY);
  const [i, setI] = useState(initial && query?.get('r') ? STEPS.length : 0);
  const [dir, setDir] = useState(1);
  const head = useRef<HTMLHeadingElement>(null);
  const steps = STEPS.filter((s) => !s.show || s.show(a));
  const done = i >= steps.length;
  const step = steps[Math.min(i, steps.length - 1)];
  const set = (p: Partial<Answers>) => setA((x) => ({ ...x, ...p }));
  const result = useMemo(() => (done ? classify(a) : null), [done, a]);

  useEffect(() => { if (done) track('classify-result'); }, [done]);
  useEffect(() => {
    const t = setTimeout(() => history.replaceState(history.state, '', location.pathname + `?a=${encode(a)}${done ? '&r=1' : ''}`), 200);
    return () => clearTimeout(t);
  }, [a, done]);
  useEffect(() => { head.current?.focus({ preventScroll: true }); }, [i]);

  const go = (d: number) => { setDir(d); setI((x) => Math.max(0, Math.min(steps.length, x + d))); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const canNext = !step.ok || step.ok(a);

  return (
    <div className="wrap" style={{ padding: '30px 0 44px' }}>
      <div className="narrow stack no-print">
        <Breadcrumbs trail={[{ label: 'Tools' }, { label: 'Classify your system' }]} />
        <h1>Classify your system</h1>
        <p className="lead">Answer a few questions about one AI system. You will see where it falls under the EU AI Act, which other rules apply where you operate, and what to do next.</p>
      </div>
      <p className="card quiet card-pad small classify-note" role="note">This is an indication, not legal advice. For a second opinion on the EU AI Act, try the European Commission’s free <a href="https://ai-act-service-desk.ec.europa.eu/en/eu-ai-act-compliance-checker" target="_blank" rel="noopener noreferrer">AI Act compliance checker ↗</a>.</p>

      <div className="wiz">
        <div className="wiz-main">
          <div className="wiz-progress no-print" aria-hidden><motion.div animate={{ width: `${(Math.min(i, steps.length) / steps.length) * 100}%` }} /></div>
          <p className="small muted no-print">{done ? 'Result' : `Question ${i + 1} of ${steps.length}`}</p>
          <AnimatePresence mode="wait" custom={dir}>
            {!done ? (
              <motion.form key={step.id} onSubmit={(e) => { e.preventDefault(); if (canNext) go(1); }} initial={{ opacity: 0, x: 30 * dir }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 * dir }} transition={{ duration: 0.22 }}>
                <fieldset className="wiz-step">
                  <legend><h2 ref={head} tabIndex={-1} className="wiz-q">{step.legend}</h2></legend>
                  {step.hint && <p className="muted small">{step.hint}</p>}
                  {step.body(a, set)}
                </fieldset>
                {!canNext && <p className="small" style={{ color: 'var(--c-level-medium, #e0b25c)' }}>Please choose an answer to continue.</p>}
                <div className="wiz-nav">
                  <button type="button" className="btn" disabled={i === 0} onClick={() => go(-1)}>Back</button>
                  <button type="submit" className="btn btn-primary" disabled={!canNext}>{i === steps.length - 1 ? 'See the result' : 'Next'}</button>
                </div>
              </motion.form>
            ) : (
              <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="result">
                <h2 ref={head} tabIndex={-1}>Your result</h2>
                {result!.cards.map((c, k) => (
                  <motion.section key={c.id} className={`card card-pad res res-${c.tone}`} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 * k }}>
                    <div className="res-h"><h3>{c.title}</h3><span className="res-v">{c.id === 'eu' && <PyramidMini tier={tierOfCategory(result!.eu)} />}{c.verdict}</span></div>
                    <div className="grid2" style={{ gap: 18, marginTop: 10 }}>
                      <div><div className="label">Why</div><ul>{c.why.map((w) => <li key={w}>{w}</li>)}</ul></div>
                      <div><div className="label">What to do next</div><ul>{c.next.map((n) => <li key={n}>{n}</li>)}</ul></div>
                    </div>
                    <p className="small no-print"><a href={url(c.link)}>Read the guide →</a></p>
                  </motion.section>
                ))}
                {result!.notes.length > 0 && <div className="card card-pad"><div className="label">Notes</div><ul>{result!.notes.map((n) => <li key={n}>{n}</li>)}</ul></div>}
                <div className="card card-pad">
                  <div className="label">Other frameworks</div>
                  <p className="small muted">China’s rules, Singapore’s framework, the UK principles, the NIST AI RMF and ISO/IEC 42001 also apply depending on where and how you work. <a href={url('/rules')}>Open the guides</a> or <a href={url('/compare')}>compare them</a>.</p>
                </div>
                <h3 style={{ marginTop: 10 }}>The closest examples on this site</h3>
                <div className="grid3">
                  {result!.examples.map((id) => {
                    const l = LAB_BY_ID[id];
                    return <a key={id} href={url(`/model/${id}`)} className="card card-pad lift" style={{ color: 'inherit' }}><b>{l.app}</b><span className="muted small" style={{ display: 'block' }}>{l.model}</span><span className="small dim">{fwEntry('eu', id).status}</span></a>;
                  })}
                </div>
                <div className="wiz-nav no-print">
                  <button className="btn" onClick={() => go(-1)}>Change answers</button>
                  <button className="btn" onClick={async () => { if (await copyText(resultMarkdown(a))) toast('Result copied as Markdown'); }}>Copy as Markdown</button>
                  <button className="btn" onClick={async () => { if (await copyText(location.href)) toast('Link copied'); }}>Copy link</button>
                  <button className="btn" onClick={() => window.print()}>Print result</button>
                  <button className="btn" onClick={() => { setA(EMPTY); setDir(-1); setI(0); }}>Start again</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <aside className="wiz-side card card-pad no-print" aria-label="Your answers">
          <div className="label">Your answers</div>
          <ol>
            {steps.map((s, k) => (
              <li key={s.id} className={k === i ? 'on' : k < i ? 'done' : ''}>
                <button type="button" onClick={() => { setDir(k < i ? -1 : 1); setI(k); }} disabled={k > i}>{s.legend.split('?')[0].slice(0, 46)}{s.legend.length > 46 ? '…' : ''}</button>
                {k < i && <span className="small muted">{s.summary(a)}</span>}
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </div>
  );
}
