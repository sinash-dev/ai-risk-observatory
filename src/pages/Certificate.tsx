import { useEffect, useState } from 'react';
import { Breadcrumbs } from '../components/Nav';
import { Logo } from '../components/ui';
import { QUIZZES } from '../data/quizzes';
import { SITE } from '../data/site';
import { passed, useQuizResults } from '../lib/quizStore';
import { url } from '../lib/util';

const NAME_KEY = 'are-quiz-name';

export default function Certificate() {
  const results = useQuizResults();
  const [name, setName] = useState(() => { try { return localStorage.getItem(NAME_KEY) ?? ''; } catch { return ''; } });
  useEffect(() => { try { localStorage.setItem(NAME_KEY, name); } catch { /* ignore */ } }, [name]);
  const done = QUIZZES.filter((q) => passed(results[q.id]));
  const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="wrap" style={{ padding: '30px 0 44px' }}>
      <div className="narrow stack no-print">
        <Breadcrumbs trail={[{ to: '/quiz', label: 'Quizzes' }, { label: 'Certificate' }]} />
        <h1>Your certificate</h1>
        <p className="lead">Modules where you scored 80% or more appear below. Type your name and print the page; it fits one A4 landscape sheet. Nothing leaves your browser.</p>
        <p className="small muted">Useful as evidence of AI-literacy activities (EU AI Act Art. 4) together with your organisation’s own training records.</p>
        <label className="cert-name-in">
          <span className="label">Name on the certificate</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" maxLength={80} />
        </label>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => window.print()} disabled={!done.length}>Print or save as PDF</button>
          <a className="btn" href={url('/quiz')}>Take more quizzes</a>
        </div>
        {!done.length && <p className="muted">No modules passed yet. <a href={url('/quiz')}>Start with a quiz</a>.</p>}
      </div>

      {done.length > 0 && (
        <section className="cert" aria-label="Certificate preview">
          <div className="cert-in">
            <div className="cert-brand"><Logo /> AI Risk Explorer</div>
            <div className="cert-kicker">Certificate of completion</div>
            <div className="cert-name">{name || '[Your name]'}</div>
            <p className="cert-line">has completed the following AI Risk Explorer modules:</p>
            <table className="cert-table">
              <thead><tr><th>Module</th><th>Score</th><th>Completed</th></tr></thead>
              <tbody>
                {done.map((q) => {
                  const r = results[q.id];
                  return <tr key={q.id}><td>{q.title}</td><td>{r.score}/{r.total}</td><td>{new Date(r.at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td></tr>;
                })}
              </tbody>
            </table>
            <div className="cert-foot">
              <span>Issued {date}</span>
              <span>{SITE.url}</span>
            </div>
            <p className="cert-note">Self-assessed completion of AI Risk Explorer modules. Not an accredited qualification.</p>
          </div>
        </section>
      )}
    </div>
  );
}
