import { motion } from 'framer-motion';
import { Stat } from '../components/ui';
import type { VizProps } from '../data/types';
import { C, Flag, VizHead } from '../viz/kit';
import { Avatar, type Av } from './genaiViz';

/* =====================================================================
   Naive Bayes — email spam filter
   ===================================================================== */
const MAILS = [
  { from: 'deals@sh0p-now.biz', subj: 'Fr€e m0ney!!! Claim your prize', spam: true, words: ['fr€e', 'm0ney', 'prize'], kind: 'obf' },
  { from: 'hr@meridian.example', subj: 'Your payslip for October', spam: false, words: ['payslip', 'october'], kind: '' },
  { from: 'recruiter@newco.example', subj: 'Job offer — please confirm by Friday', spam: false, words: ['offer', 'confirm', 'urgent'], kind: 'fp' },
  { from: 'promo@luckywin.biz', subj: 'Congratulations, you WON a cruise', spam: true, words: ['won', 'congratulations', 'cruise'], kind: '' },
  { from: 'support@c0invault.io', subj: 'Your wallet airdrop is ready', spam: true, words: ['wallet', 'airdrop', 'token'], kind: 'drift' },
  { from: 'clinic@hospital.example', subj: 'Urgent: your test results are available', spam: false, words: ['urgent', 'results', 'click'], kind: 'fp' },
  { from: 'v1agra@pharm4u.biz', subj: 'Ch3ap m3ds, no prescripti0n', spam: true, words: ['ch3ap', 'm3ds'], kind: 'obf' },
  { from: 'news@rivalpaper.example', subj: 'This week’s newsletter', spam: false, words: ['newsletter', 'week'], kind: 'poison' },
];

export function SpamViz({ s, m }: VizProps) {
  const obf = s.has('obfuscate') && !m.has('normalise');
  const over = s.has('overblock') && !m.has('threshold');
  const drift = s.has('drift') && !m.has('retrain');
  const poison = s.has('poison') && !m.has('reportguard');
  const thr = over ? 0.3 : 0.6;
  const rows = MAILS.map((e) => {
    let p = e.spam ? 0.94 : 0.08;
    if (e.kind === 'obf' && obf) p = 0.21;
    if (e.kind === 'drift' && drift) p = 0.18;
    if (e.kind === 'fp') p = 0.36;
    if (e.kind === 'poison' && poison) p = 0.88;
    const toSpam = p >= thr;
    return { ...e, p, toSpam, ok: toSpam === e.spam };
  });
  const missed = rows.filter((r) => r.spam && !r.toSpam).length;
  const lost = rows.filter((r) => !r.spam && r.toSpam).length;
  return (
    <div>
      <VizHead title={`naive Bayes classifier · word probabilities · spam threshold ${thr.toFixed(2)}`}>
        <div className="legend"><span><i className="dot" style={{ background: C.bad }} /> wrong folder</span></div>
      </VizHead>
      <div style={{ display: 'grid', gap: 6 }}>
        {rows.map((r, i) => (
          <motion.div key={i} layout style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 120px 86px', gap: 12, alignItems: 'center', padding: '9px 12px', borderRadius: 8, border: `1px solid ${r.ok ? 'var(--line)' : 'rgba(239,91,107,.6)'}`, background: r.ok ? 'transparent' : 'rgba(239,91,107,.08)' }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.subj}</div>
              <div className="mono dim" style={{ fontSize: 11 }}>{r.from} · {r.words.join(', ')}</div>
            </div>
            <div>
              <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,.08)' }}>
                <motion.div animate={{ width: `${r.p * 100}%` }} style={{ height: 6, borderRadius: 3, background: r.p >= thr ? C.bad : C.good }} />
              </div>
              <div className="mono dim" style={{ fontSize: 10.5, marginTop: 3 }}>P(spam) {r.p.toFixed(2)}</div>
            </div>
            <div style={{ textAlign: 'right' }}><Flag tone={r.ok ? 'info' : 'bad'}>{r.toSpam ? 'Spam' : 'Inbox'}</Flag></div>
          </motion.div>
        ))}
      </div>
      <div className="stats" style={{ marginTop: 12 }}>
        <Stat l="Spam reaching inbox" v={missed} tone={missed ? 'bad' : 'good'} s="of 4 spam emails" />
        <Stat l="Real emails lost" v={lost} tone={lost ? 'bad' : 'good'} s="of 4 genuine emails" />
        <Stat l="Accuracy" v={(rows.filter((r) => r.ok).length / rows.length) * 100} suffix="%" />
      </div>
    </div>
  );
}

/* =====================================================================
   Face recognition — shop entrance watchlist
   ===================================================================== */
const SHOPPERS: (Av & { grp: 'lm' | 'lw' | 'dm' | 'dw'; listed?: boolean })[] = [
  { skin: 0, hair: 'short', hc: '#3a2618', suit: '#2b3a55', bg: '#2a3346', grp: 'lm', listed: true },
  { skin: 4, hair: 'curly', hc: '#1b1410', suit: '#3d2f4f', bg: '#2a3346', grp: 'dw' },
  { skin: 1, hair: 'long', hc: '#6b4a2b', suit: '#1e3b3a', bg: '#2a3346', grp: 'lw' },
  { skin: 5, hair: 'short', hc: '#1b1410', suit: '#4a2d2d', bg: '#2a3346', grp: 'dm' },
  { skin: 3, hair: 'bun', hc: '#2b2b2b', suit: '#1d2747', bg: '#2a3346', grp: 'dw' },
  { skin: 0, hair: 'bald', hc: '#c9c2b8', suit: '#2b3a55', bg: '#2a3346', grp: 'lm', glasses: true },
  { skin: 4, hair: 'short', hc: '#1b1410', suit: '#1e3b3a', bg: '#2a3346', grp: 'dm' },
  { skin: 2, hair: 'long', hc: '#3a2618', suit: '#3d2f4f', bg: '#2a3346', grp: 'lw' },
];

export function FaceViz({ s, m }: VizProps) {
  const low = s.has('lowthr') && !m.has('threshold');
  const skew = s.has('skewdata') && !m.has('demotest');
  const poor = s.has('poorwatch') && !m.has('watchquality');
  const review = m.has('tworeview');
  const store = s.has('noconsent') && !m.has('dpia');
  const fmr = { lm: 0.002, lw: 0.004, dm: 0.004, dw: 0.006 };
  if (skew) { fmr.dm = 0.03; fmr.dw = 0.06; }
  const mult = (low ? 4 : 1) * (poor ? 2.5 : 1);
  const matches = SHOPPERS.map((p, i) => {
    if (p.listed) return { hit: true, score: 0.93, wrong: false };
    let falseHit = false;
    if (skew && (i === 1 || i === 4)) falseHit = true;
    if (low && (i === 3 || i === 7)) falseHit = true;
    if (poor && i === 6) falseHit = true;
    return { hit: falseHit, score: falseHit ? 0.62 + (i % 3) * 0.04 : 0.2, wrong: falseHit };
  });
  const wrongHits = matches.filter((x) => x.wrong).length;
  const perDay = Math.round(SHOPPERS.length * 0 + (fmr.lm + fmr.lw + fmr.dm + fmr.dw) / 4 * 2000 * mult);
  const groups: [keyof typeof fmr, string][] = [['lm', 'Lighter-skinned men'], ['lw', 'Lighter-skinned women'], ['dm', 'Darker-skinned men'], ['dw', 'Darker-skinned women']];
  return (
    <div>
      <VizHead title="face matching at a shop entrance · 2,000 visitors a day · watchlist of 40 people" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {SHOPPERS.map((p, i) => {
          const mt = matches[i];
          const col = !mt.hit ? 'var(--line)' : mt.wrong ? C.bad : C.warn;
          return (
            <div key={i} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: `2px solid ${col}` }}>
              <Avatar a={p} i={100 + i} />
              {mt.hit && (
                <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '5px 7px', background: 'rgba(10,12,18,.85)', fontSize: 10.5, fontFamily: 'var(--mono)' }}>
                  <div style={{ color: mt.wrong ? '#f39aa4' : '#f0c27a' }}>MATCH {mt.score.toFixed(2)} · list #{(i * 7) % 40}</div>
                  <div style={{ color: review ? C.good : mt.wrong ? '#f39aa4' : '#f0c27a' }}>{review ? 'sent for 2-person check' : mt.wrong ? 'innocent person stopped' : 'stopped by security'}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 16, marginTop: 14 }}>
        <div>
          <div className="mono dim" style={{ fontSize: 10.5, marginBottom: 8 }}>FALSE MATCH RATE BY GROUP</div>
          {groups.map(([k, l]) => (
            <div key={k} style={{ display: 'grid', gridTemplateColumns: '150px 1fr 48px', gap: 8, alignItems: 'center', marginBottom: 5, fontSize: 12 }}>
              <span className="muted">{l}</span>
              <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,.07)' }}>
                <motion.div animate={{ width: `${Math.min(100, fmr[k] * mult * 600)}%` }} style={{ height: 8, borderRadius: 4, background: fmr[k] * mult > 0.02 ? C.bad : C.good }} />
              </div>
              <span className="mono" style={{ fontSize: 11 }}>{(fmr[k] * mult * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--muted)', display: 'grid', gap: 6, alignContent: 'start' }}>
          {store && <Flag tone="bad">Every visitor’s face template stored for 2 years</Flag>}
          {review && <Flag tone="good">No action without two trained staff confirming</Flag>}
          <span>One genuine watchlist match (top left). Every other red frame is an innocent shopper.</span>
        </div>
      </div>
      <div className="stats" style={{ marginTop: 12 }}>
        <Stat l="False matches a day" v={perDay} tone={perDay > 10 ? 'bad' : ''} s="of 2,000 visitors" />
        <Stat l="Innocent people stopped" v={review ? 0 : wrongHits} tone={!review && wrongHits ? 'bad' : 'good'} s="in this sample" />
        <Stat l="Faces stored" v={store ? 2000 : 0} tone={store ? 'bad' : 'good'} s="per day" />
      </div>
    </div>
  );
}

/* =====================================================================
   Emotion recognition — call centre
   ===================================================================== */
const AGENTS = [
  { n: 'Ana', accent: false, self: 'calm', tone: 'calm' },
  { n: 'Kofi', accent: true, self: 'calm', tone: 'calm' },
  { n: 'Mei', accent: true, self: 'friendly', tone: 'soft' },
  { n: 'Tom', accent: false, self: 'frustrated', tone: 'tense' },
  { n: 'Priya', accent: true, self: 'friendly', tone: 'lively' },
  { n: 'Lars', accent: false, self: 'calm', tone: 'flat' },
];

export function EmotionViz({ s, m }: VizProps) {
  const stopped = m.has('stop');
  const accentBias = s.has('accent') && !m.has('validate') && !stopped;
  const culture = s.has('validity') && !m.has('validate');
  const rank = s.has('rank') && !stopped;
  const customers = s.has('customers') && !m.has('notice');
  const rows = AGENTS.map((a, i) => {
    let label = a.self === 'frustrated' ? 'angry' : a.self === 'friendly' ? 'happy' : 'neutral';
    if (accentBias && a.accent) label = i % 2 ? 'angry' : 'disengaged';
    if (culture && (a.tone === 'lively' || a.tone === 'flat')) label = a.tone === 'lively' ? 'aggressive' : 'disengaged';
    const wrong = !(label === 'neutral' && a.self === 'calm') && !(label === 'happy' && a.self === 'friendly') && !(label === 'angry' && a.self === 'frustrated');
    const score = wrong ? 32 + i * 3 : 70 + i * 3;
    return { ...a, label, wrong, score };
  });
  const wrongN = rows.filter((r) => r.wrong).length;
  const accN = rows.filter((r) => r.accent && r.wrong).length;
  return (
    <div>
      <VizHead title="voice emotion classifier · live calls · 'empathy score' per agent" />
      {stopped && <div style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(60,198,173,.5)', background: 'rgba(60,198,173,.08)', fontSize: 13, marginBottom: 10 }}>Emotion scoring of staff is switched off. In the EU this use has been banned since February 2025.</div>}
      <div style={{ display: 'grid', gap: 6, opacity: stopped ? 0.35 : 1 }}>
        {rows.map((r, i) => (
          <div key={r.n} style={{ display: 'grid', gridTemplateColumns: '90px minmax(0,1fr) 110px 110px 120px', gap: 12, alignItems: 'center', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--line)' }}>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{r.n}{r.accent && <span className="dim" style={{ fontSize: 11 }}> · accent</span>}</div>
            <svg viewBox="0 0 200 30" className="viz-svg" style={{ height: 30 }}>
              <path d={Array.from({ length: 50 }, (_, k) => `${k ? 'L' : 'M'}${k * 4},${15 + Math.sin(k * (0.6 + i * 0.13)) * (r.tone === 'lively' ? 12 : r.tone === 'flat' ? 3 : r.tone === 'tense' ? 10 : 6) * Math.abs(Math.cos(k * 0.21 + i))}`).join(' ')} stroke="#8fb3d9" strokeWidth="1.4" fill="none" />
            </svg>
            <div style={{ fontSize: 12 }}><span className="dim">model: </span><b style={{ color: r.wrong ? '#f39aa4' : 'inherit' }}>{r.label}</b></div>
            <div style={{ fontSize: 12 }}><span className="dim">agent says: </span>{r.self}</div>
            <div>
              {rank ? (r.score < 50 ? <Flag tone="bad">flagged for review</Flag> : <span className="mono" style={{ fontSize: 12 }}>score {r.score}</span>) : <span className="mono dim" style={{ fontSize: 11 }}>not used for reviews</span>}
            </div>
          </div>
        ))}
      </div>
      {customers && <div style={{ marginTop: 10 }}><Flag tone="bad">Customers’ voices analysed too, without being told</Flag></div>}
      <div className="stats" style={{ marginTop: 12 }}>
        <Stat l="Misread emotions" v={stopped ? 0 : (wrongN / rows.length) * 100} suffix="%" tone={!stopped && wrongN > 1 ? 'bad' : ''} />
        <Stat l="Misreads: accented speakers" v={stopped ? 0 : accN} tone={!stopped && accN ? 'bad' : ''} s="of 3" />
        <Stat l="Staff flagged by AI" v={rank ? rows.filter((r) => r.score < 50).length : 0} tone={rank ? 'bad' : 'good'} />
      </div>
    </div>
  );
}

/* =====================================================================
   Foundation model — training a general-purpose model
   ===================================================================== */
export function FoundationViz({ s, m }: VizProps) {
  const scrape = s.has('scrape') && !m.has('optout');
  const pii = s.has('pii') && !m.has('piifilter');
  const scale = s.has('scale');
  const frontier = m.has('frontier');
  const noeval = s.has('noeval') && !m.has('evals');
  const mix = scrape
    ? [['Licensed and public domain', 18, C.good], ['Web crawl, opt-outs ignored', 62, C.bad], ['Synthetic', 20, '#8fb3d9']]
    : [['Licensed and public domain', 34, C.good], ['Web crawl, opt-outs respected', 44, C.warn], ['Synthetic', 22, '#8fb3d9']];
  const flops = scale ? 3e25 : 4e24;
  const lx = (v: number) => ((Math.log10(v) - 23) / 4) * 100;
  const evals = [
    { n: 'Cyber-attack assistance', st: noeval ? 'not tested' : scale ? 'moderate uplift, mitigated' : 'low' },
    { n: 'Biological weapons information', st: noeval ? 'not tested' : 'low, refusals in place' },
    { n: 'Repeats personal data from training', st: pii ? '41 per 10k prompts' : '0.3 per 10k prompts' },
    { n: 'Reproduces copyrighted text verbatim', st: scrape ? 'frequent' : 'rare' },
  ];
  const bad = (t: string) => /not tested|41|frequent/.test(t);
  return (
    <div>
      <VizHead title="pre-training run · 15 trillion tokens · release checklist" />
      <div className="mono dim" style={{ fontSize: 10.5, marginBottom: 6 }}>TRAINING DATA MIX</div>
      <div style={{ display: 'flex', height: 26, borderRadius: 6, overflow: 'hidden' }}>
        {mix.map(([l, v, c]) => (
          <motion.div key={l as string} animate={{ width: `${v}%` }} style={{ background: c as string, display: 'flex', alignItems: 'center', paddingLeft: 8, fontSize: 11, color: '#111', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden' }}>{v as number}% {l as string}</motion.div>
        ))}
      </div>
      <div className="mono dim" style={{ fontSize: 10.5, margin: '18px 0 6px' }}>TRAINING COMPUTE (operations, log scale) · dashed lines = legal thresholds</div>
      <div style={{ position: 'relative', height: 46 }}>
        <div style={{ position: 'absolute', top: 12, left: 0, right: 0, height: 10, borderRadius: 5, background: 'rgba(255,255,255,.07)' }} />
        <motion.div animate={{ width: `${lx(flops)}%` }} style={{ position: 'absolute', top: 12, left: 0, height: 10, borderRadius: 5, background: scale ? C.warn : '#8fb3d9' }} />
        {[[1e25, 'EU: 10²⁵'], [1e26, 'California SB 53: 10²⁶']].map(([v, l]) => (
          <div key={l as string} style={{ position: 'absolute', left: `${lx(v as number)}%`, top: 4, bottom: 0, borderLeft: '2px dashed rgba(255,255,255,.5)' }}>
            <span className="mono" style={{ position: 'absolute', top: 26, left: 4, fontSize: 10, whiteSpace: 'nowrap', color: 'var(--muted)' }}>{l as string}</span>
          </div>
        ))}
      </div>
      <div className="mono dim" style={{ fontSize: 10.5, margin: '22px 0 6px' }}>PRE-RELEASE EVALUATIONS</div>
      <div style={{ display: 'grid', gap: 5 }}>
        {evals.map((e) => (
          <div key={e.n} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '7px 12px', borderRadius: 8, border: `1px solid ${bad(e.st) ? 'rgba(239,91,107,.5)' : 'var(--line)'}`, fontSize: 12.5 }}>
            <span>{e.n}</span>
            <span className="mono" style={{ color: bad(e.st) ? '#f39aa4' : 'var(--muted)' }}>{e.st}</span>
          </div>
        ))}
      </div>
      <div className="stats" style={{ marginTop: 12 }}>
        <Stat l="Data with unclear rights" v={scrape ? 62 : 12} suffix="%" tone={scrape ? 'bad' : ''} />
        <div className="stat"><div className="stat-l">EU category</div><div style={{ fontSize: 14, fontWeight: 600, marginTop: 6 }}>{scale ? 'General-purpose model with systemic risk' : 'General-purpose model'}</div></div>
        <Stat l="Open safety gaps" v={(noeval ? 2 : 0) + (pii ? 1 : 0) + (scale && !frontier ? 1 : 0)} tone={noeval || pii || (scale && !frontier) ? 'bad' : 'good'} />
      </div>
    </div>
  );
}
