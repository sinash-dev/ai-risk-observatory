import { motion } from 'framer-motion';
import { Gauge, Num, Starfield } from '../components/ui';
import { LABS } from '../data/labs';
import { RISKS, TIERS, exposure } from '../data/risks';
import { go, useClock, useInView } from '../lib/util';

const fade = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-60px' }, transition: { duration: 0.6 } };

function HeroOrbit() {
  return (
    <svg viewBox="0 0 520 520" className="viz-svg" style={{ maxWidth: 560, margin: '0 auto' }}>
      <defs>
        <radialGradient id="hcore"><stop offset="0" stopColor="#fff" /><stop offset=".3" stopColor="#7cf7e4" /><stop offset="1" stopColor="#2b6cff" stopOpacity="0" /></radialGradient>
      </defs>
      <circle cx="260" cy="260" r="90" fill="url(#hcore)" opacity=".45"><animate attributeName="r" values="80;100;80" dur="6s" repeatCount="indefinite" /></circle>
      {TIERS.map((t, i) => {
        const r = 70 + i * 52;
        const labs = LABS.filter((l) => l.tier === t.id);
        return (
          <g key={t.id}>
            <circle cx="260" cy="260" r={r} fill="none" stroke={t.color} strokeOpacity=".25" strokeDasharray={i % 2 ? '3 7' : undefined} />
            <g style={{ transformOrigin: '260px 260px', animation: `spin ${30 + i * 16}s linear infinite ${i % 2 ? 'reverse' : ''}` }}>
              {labs.map((l, k) => {
                const a = (k / labs.length) * Math.PI * 2 + i;
                return (
                  <g key={l.id}>
                    <circle cx={260 + Math.cos(a) * r} cy={260 + Math.sin(a) * r} r="15" fill="#0b1230" stroke={t.color} strokeWidth="2" />
                    <circle cx={260 + Math.cos(a) * r} cy={260 + Math.sin(a) * r} r="22" fill={t.color} opacity=".12" />
                    <text x={260 + Math.cos(a) * r} y={260 + Math.sin(a) * r + 4} textAnchor="middle" fontSize="9.5" fontWeight={700} fill="#fff" fontFamily="Space Grotesk">{l.glyph}</text>
                  </g>
                );
              })}
            </g>
          </g>
        );
      })}
      <circle cx="260" cy="260" r="8" fill="#fff" />
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
    </svg>
  );
}

function TensionDemo() {
  const t = useClock();
  const p = (Math.sin(t * 0.7) + 1) / 2;
  return (
    <div className="panel" style={{ padding: 24 }}>
      <div className="mono dim" style={{ fontSize: 11, marginBottom: 8 }}>THE TRADE-OFF YOU WILL MANAGE</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Gauge v={40 + p * 50} label="Value" color="#ffc857" size={170} />
        <Gauge v={88 - p * 58} label="Trust" color="#2ee6c5" size={170} />
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12, justifyContent: 'center' }}>
        {['+ postcode feature', '+ auto-reject', '+ full card access', '+ no human review'].map((x, i) => (
          <motion.span key={x} className="chip" animate={{ opacity: p > i * 0.22 ? 1 : 0.25, color: p > i * 0.22 ? '#ffc857' : '#66729c' }}>{x}</motion.span>
        ))}
      </div>
      <p className="muted" style={{ fontSize: 13.5, textAlign: 'center', marginTop: 14 }}>Every shortcut buys value and spends trust. Controls buy trust back — at a price.</p>
    </div>
  );
}

function Ladder() {
  const [ref, seen] = useInView<HTMLDivElement>();
  const avg = TIERS.map((t) => {
    const labs = LABS.filter((l) => l.tier === t.id);
    const vals = labs.map((l) => Object.values(exposure(l)));
    return vals.reduce((a, v) => a + v.filter((x) => x >= 25).length, 0) / vals.length;
  });
  const W = 1000, H = 420;
  const stepW = 220;
  const py = (i: number) => H - 20 - (70 + i * 62) - 34;
  return (
    <div ref={ref}>
      <svg viewBox={`0 0 ${W} ${H}`} className="viz-svg">
        <defs>
          <linearGradient id="riskline" x1="0" x2="1"><stop offset="0" stopColor="#2ee6c5" /><stop offset=".5" stopColor="#ffc857" /><stop offset="1" stopColor="#ff5a6e" /></linearGradient>
        </defs>
        {TIERS.map((t, i) => {
          const x = 40 + i * (stepW + 20);
          const h = 70 + i * 62;
          return (
            <g key={t.id}>
              <motion.rect x={x} width={stepW} rx="14" fill={t.color} fillOpacity=".12" stroke={t.color} strokeOpacity=".5" initial={{ y: H - 20, height: 0 }} animate={seen ? { y: H - 20 - h, height: h } : {}} transition={{ delay: i * 0.18, duration: 0.7, ease: 'easeOut' }} />
              <motion.g initial={{ opacity: 0 }} animate={seen ? { opacity: 1 } : {}} transition={{ delay: 0.5 + i * 0.18 }}>
                <text x={x + 16} y={H - 20 - h + 28} fontSize="17" fontWeight={600} fill="#fff" fontFamily="Space Grotesk">{t.label}</text>
                <text x={x + 16} y={H - 20 - h + 48} fontSize="12" fill={t.color} fontFamily="JetBrains Mono">{t.autonomy}</text>
                {LABS.filter((l) => l.tier === t.id).slice(0, Math.floor((h - 60) / 20)).map((l, k) => (
                  <text key={l.id} x={x + 16} y={H - 20 - h + 74 + k * 20} fontSize="12" fill="#9aa6cf">· {l.model.replace(/ \(.*\)/, '')}</text>
                ))}
              </motion.g>
            </g>
          );
        })}
        <motion.path
          d={avg.map((v, i) => `${i ? 'L' : 'M'}${40 + i * (stepW + 20) + stepW / 2},${py(i)}`).join(' ')}
          stroke="url(#riskline)" strokeWidth="4" fill="none" strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={seen ? { pathLength: 1 } : {}} transition={{ delay: 0.9, duration: 1.2 }}
        />
        {avg.map((v, i) => (
          <motion.g key={i} initial={{ opacity: 0, scale: 0 }} animate={seen ? { opacity: 1, scale: 1 } : {}} transition={{ delay: 1 + i * 0.25 }}>
            <circle cx={40 + i * (stepW + 20) + stepW / 2} cy={py(i)} r="7" fill="#050816" stroke="#fff" strokeWidth="2.5" />
            <text x={40 + i * (stepW + 20) + stepW / 2} y={py(i) - 14} textAnchor="middle" fontSize="12" fill="#fff" fontFamily="JetBrains Mono">{v.toFixed(1)} lenses</text>
          </motion.g>
        ))}
        <text x={W - 20} y={24} textAnchor="end" fontSize="12" fill="#ff8796" fontFamily="JetBrains Mono">risk lenses materially exposed per model (score ≥ 25) ↗</text>
      </svg>
    </div>
  );
}

export function Landing() {
  const nStress = LABS.reduce((a, l) => a + l.stressors.length, 0);
  const nMit = LABS.reduce((a, l) => a + l.mitigations.length, 0);
  return (
    <div>
      {/* hero */}
      <section style={{ position: 'relative', overflow: 'hidden', minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center' }}>
        <Starfield />
        <div className="wrap" style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'minmax(0,1.05fr) minmax(0,1fr)', gap: 30, alignItems: 'center', padding: '50px 0' }} >
          <div className="hero-text">
            <motion.div className="eyebrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>AI governance training lab</motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.7 }} style={{ fontSize: 'clamp(40px, 6.2vw, 80px)', fontWeight: 600, marginTop: 18 }}>
              Every model fails differently.
              <br />
              <span className="grad-text">See how — before it ships.</span>
            </motion.h1>
            <motion.p className="lead" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} style={{ marginTop: 22 }}>
              Pick a model, from linear regression to multi-agent systems. Put it to work on a real application, break it with shortcuts, drift and attacks, fix it with governance controls — then ship it and live with the consequences.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} style={{ display: 'flex', gap: 12, marginTop: 30, flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => go('/observatory')}>Enter the Observatory →</button>
              <button className="btn" onClick={() => go('/lab/credit')}>Try a lab: credit scoring</button>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} style={{ display: 'flex', gap: 30, marginTop: 44, flexWrap: 'wrap' }}>
              {[
                [LABS.length, 'interactive labs'],
                [4, 'tiers of autonomy'],
                [nStress, 'risk scenarios'],
                [nMit, 'governance controls'],
              ].map(([v, l]) => (
                <div key={l as string}>
                  <div style={{ fontFamily: 'var(--display)', fontSize: 34, fontWeight: 600 }}><Num v={v as number} /></div>
                  <div className="mono dim" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.1em' }}>{l}</div>
                </div>
              ))}
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }}>
            <HeroOrbit />
          </motion.div>
        </div>
      </section>

      {/* story */}
      <section className="section">
        <div className="wrap" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 40, alignItems: 'center' }}>
          <motion.div {...fade}>
            <div className="eyebrow">Your role</div>
            <h2 className="h2" style={{ marginTop: 12 }}>Welcome to Meridian Group.</h2>
            <p className="lead" style={{ marginTop: 16 }}>
              You are the new <b style={{ color: '#fff' }}>AI Product Lead</b> at a fictional conglomerate — a bank, a hospital, a retailer, an airline, a media platform. Every executive wants AI shipped yesterday.
            </p>
            <div className="panel" style={{ marginTop: 24, padding: 18, display: 'flex', gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#ffc857,#ff7a59)', display: 'grid', placeItems: 'center', fontWeight: 700, color: '#1a0700', flex: 'none' }}>CEO</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Meridian Group CEO <span className="dim mono" style={{ fontSize: 11 }}>· 07:42</span></div>
                <div style={{ fontSize: 14.5, marginTop: 4 }}>“Our competitors are automating everything. I need {LABS.length} AI launches this year. Make them fast — and don’t put us in the newspaper.”</div>
              </div>
            </div>
          </motion.div>
          <motion.div {...fade} transition={{ duration: 0.6, delay: 0.15 }}>
            <TensionDemo />
          </motion.div>
        </div>
      </section>

      {/* ladder */}
      <section className="section" style={{ paddingTop: 20 }}>
        <div className="wrap">
          <motion.div {...fade} style={{ textAlign: 'center', marginBottom: 30 }}>
            <div className="eyebrow">The autonomy ladder</div>
            <h2 className="h2" style={{ marginTop: 12 }}>More autonomy, more ways to fail.</h2>
            <p className="lead" style={{ margin: '14px auto 0' }}>Risks don’t disappear as models get smarter — they accumulate. A biased score becomes a biased decision, then a biased action taken on its own.</p>
          </motion.div>
          <Ladder />
        </div>
      </section>

      {/* how */}
      <section className="section" style={{ paddingTop: 20 }}>
        <div className="wrap">
          <motion.div {...fade}>
            <div className="eyebrow">How a lab works</div>
            <h2 className="h2" style={{ marginTop: 12 }}>Brief. Break. Fix. Ship.</h2>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16, marginTop: 30 }}>
            {[
              { n: '01', t: 'Get the brief', d: 'An executive gives you a KPI and a deadline. You see who will be affected.', c: '#6b8cff', icon: '✉' },
              { n: '02', t: 'Break it', d: 'Take tempting shortcuts, trigger real-world drift and launch attacks. Watch a live model fail.', c: '#ff5a6e', icon: '⚡' },
              { n: '03', t: 'Fix it', d: 'Apply governance controls across the lifecycle. Every control has a cost in value.', c: '#2ee6c5', icon: '🛡' },
              { n: '04', t: 'Ship it', d: 'Fast-forward six months: headlines, affected people, regulators — and the Board’s verdict.', c: '#ffc857', icon: '🚀' },
            ].map((s, i) => (
              <motion.div key={s.n} {...fade} transition={{ duration: 0.5, delay: i * 0.1 }} className="panel" style={{ padding: 22, overflow: 'hidden' }}>
                <div style={{ position: 'absolute', right: -20, top: -20, width: 110, height: 110, borderRadius: '50%', background: s.c, opacity: 0.1, filter: 'blur(10px)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="mono" style={{ color: s.c, fontSize: 13 }}>{s.n}</span>
                  <span style={{ fontSize: 22 }}>{s.icon}</span>
                </div>
                <h3 style={{ fontSize: 21, marginTop: 18 }}>{s.t}</h3>
                <p className="muted" style={{ fontSize: 14, marginTop: 8 }}>{s.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* lenses & frameworks */}
      <section className="section" style={{ paddingTop: 20 }}>
        <div className="wrap" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 40 }}>
          <motion.div {...fade}>
            <div className="eyebrow">Eight risk lenses</div>
            <h2 className="h2" style={{ marginTop: 12, fontSize: 36 }}>One vocabulary for every model.</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 22 }}>
              {RISKS.map((r, i) => (
                <motion.div key={r.key} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid var(--line)', borderLeft: `3px solid ${r.color}`, background: 'rgba(255,255,255,.02)' }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{r.label}</div>
                  <div className="muted" style={{ fontSize: 12.5 }}>{r.desc}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
          <motion.div {...fade} transition={{ duration: 0.6, delay: 0.1 }}>
            <div className="eyebrow">Grounded in real frameworks</div>
            <h2 className="h2" style={{ marginTop: 12, fontSize: 36 }}>Every control maps to the rules.</h2>
            <div style={{ display: 'grid', gap: 10, marginTop: 22 }}>
              {[
                ['EU AI Act', 'Risk tiers, Annex III high-risk uses, Art. 9–15 duties, Art. 50 transparency.'],
                ['NIST AI RMF', 'Govern · Map · Measure · Manage, plus the Generative AI profile (AI 600-1).'],
                ['ISO/IEC 42001', 'AI management system controls across the AI life cycle.'],
                ['OWASP LLM Top 10 (2025)', 'Prompt injection, excessive agency, data leakage, supply chain.'],
                ['Sector law', 'GDPR, DSA, equality, consumer and competition law.'],
              ].map(([t, d]) => (
                <div key={t} style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--line)' }}>
                  <b style={{ fontFamily: 'var(--display)' }}>{t}</b>
                  <span className="muted" style={{ fontSize: 13.5 }}>{d}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section" style={{ textAlign: 'center' }}>
        <motion.div {...fade} className="wrap">
          <h2 className="h2">Ready for your first launch?</h2>
          <p className="lead" style={{ margin: '14px auto 28px' }}>Start anywhere. Most teams begin at the core and work outwards — the risks you learn early come back, amplified, at the edge.</p>
          <button className="btn btn-primary" onClick={() => go('/observatory')}>Enter the Observatory →</button>
        </motion.div>
      </section>
      <style>{'@media (max-width: 900px){.wrap[style*="grid-template-columns"]{grid-template-columns:minmax(0,1fr) !important}}'}</style>
    </div>
  );
}
