import { motion } from 'framer-motion';
import { Breadcrumbs } from '../components/Nav';
import { CASES } from '../data/cases';
import { LAB_BY_ID } from '../data/labs';
import { SECTORS, SECTOR_BY_ID, type Sector } from '../data/sectors';
import { TEMPLATE_BY_FILE } from '../data/templates';
import { BASE, url } from '../lib/util';
import type { PageProps } from './registry';

function Index() {
  return (
    <div className="wrap" style={{ padding: '30px 0 44px' }}>
      <div className="narrow stack">
        <Breadcrumbs trail={[{ label: 'Learn' }, { label: 'Sector guides' }]} />
        <h1>Sector guides</h1>
        <p className="lead">Which rules matter most in your sector, the examples on this site that match your work, real cases, and the templates to start with.</p>
      </div>
      <div className="grid3 sec-grid">
        {SECTORS.map((s, i) => (
          <motion.a key={s.id} href={url(`/sectors/${s.id}`)} className="card card-pad lift sec-card" initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 3) * 0.06 }}>
            <h2 style={{ fontSize: 20 }}>{s.name}</h2>
            <p className="muted small">{s.intro}</p>
            <span className="small accent">Open the guide →</span>
          </motion.a>
        ))}
      </div>
    </div>
  );
}

function Guide({ s }: { s: Sector }) {
  const cases = CASES.filter((c) => s.labs.includes(c.lab.id)).sort((a, b) => b.y - a.y);
  return (
    <div className="wrap" style={{ padding: '30px 0 44px' }}>
      <div className="narrow stack">
        <Breadcrumbs trail={[{ label: 'Sector guides', to: '/sectors' }, { label: s.name }]} />
        <h1>{s.name}</h1>
        <p className="lead">{s.intro}</p>
        <p className="small muted">Typical uses: {s.uses.join('; ')}.</p>
      </div>

      <section className="section sec-sec" aria-labelledby="sec-eu">
        <h2 id="sec-eu">EU AI Act</h2>
        <ul className="sec-rules">{s.eu.map((r) => <li key={r.ref} className="card card-pad"><span className="label">{r.ref}</span><p>{r.text}</p></li>)}</ul>
        <p className="small"><a href={url('/rules/eu')}>Read the full EU AI Act guide →</a></p>
      </section>

      <section className="section sec-sec" aria-labelledby="sec-other">
        <h2 id="sec-other">Other rules that often apply</h2>
        <ul className="sec-rules">{s.other.map((r) => <li key={r.ref} className="card card-pad"><span className="label">{r.ref}</span><p>{r.text}</p></li>)}</ul>
      </section>

      <section className="section sec-sec" aria-labelledby="sec-first">
        <h2 id="sec-first">Where to start</h2>
        <ol className="sec-steps">{s.steps.map((t) => <li key={t}>{t}</li>)}</ol>
        <p className="small">Add your systems to <a href={url('/register')}>My AI register</a> to see which of these rules apply to each one.</p>
      </section>

      <section className="section sec-sec" aria-labelledby="sec-ex">
        <h2 id="sec-ex">Examples to explore</h2>
        <div className="grid3">
          {s.labs.map((id) => { const l = LAB_BY_ID[id]; return (
            <a key={id} href={url(`/model/${id}`)} className="card card-pad lift"><b>{l.app}</b><span className="muted small" style={{ display: 'block', marginTop: 4 }}>{l.model}</span></a>
          ); })}
        </div>
      </section>

      <section className="section sec-sec" aria-labelledby="sec-tpl">
        <h2 id="sec-tpl">Templates</h2>
        <ul className="sec-tpl">
          {s.templates.map((f) => { const t = TEMPLATE_BY_FILE[f]; return (
            <li key={f}><a href={`${BASE}toolkit/${f}`} download>{t.title}</a> <span className="muted small">{t.desc}</span></li>
          ); })}
        </ul>
        <p className="small"><a href={url('/toolkit')}>All templates →</a></p>
      </section>

      {cases.length > 0 && (
        <section className="section sec-sec" aria-labelledby="sec-cases">
          <h2 id="sec-cases">Real cases</h2>
          <ul className="sec-cases">
            {cases.map((c) => (
              <li key={c.title}>
                <span className="mono small accent">{c.year}</span> <b>{c.title}</b>
                <span className="muted small" style={{ display: 'block' }}>{c.text}</span>
                {c.url && <a className="small" href={c.url} target="_blank" rel="noopener noreferrer">Source{c.source ? ` (${c.source})` : ''} ↗</a>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="small muted">A starting point, not legal advice. Each line names its source so you can check the official text. Last checked against the consolidated EU AI Act of 27 July 2026.</p>
    </div>
  );
}

export default function Sectors({ param }: PageProps) {
  if (!param) return <Index />;
  const s = SECTOR_BY_ID[param];
  if (!s) return <div className="wrap section"><h1>Sector guide not found</h1><p><a href={url('/sectors')}>All sector guides</a></p></div>;
  return <Guide s={s} />;
}
