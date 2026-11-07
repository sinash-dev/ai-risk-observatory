import { useEffect, useMemo, useRef, useState } from 'react';
import { Breadcrumbs } from '../components/Nav';
import { copyText, toast } from '../components/Toast';
import { QUIZZES, QUIZ_BY_ID } from '../data/quizzes';
import { TRACKS, TRACK_BY_ID, TRACK_KEY, loadTrackProgress } from '../data/tracks';
import { passed, useQuizResults } from '../lib/quizStore';
import { EMPTY_PLAN, RECORD_NOTE, buildRecord, decodePlan, encodePlan, loadTeam, mergeRecords, parseRecord, planId, progressOfRecord, saveTeam, teamCsv, teamMarkdown, type LearnerRecord, type TeamPlan } from '../lib/team';
import { track } from '../lib/track';
import { BASE, url } from '../lib/util';
import type { PageProps } from './registry';

function download(name: string, text: string, type: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
const stamp = () => new Date().toISOString().slice(0, 10);
const minutes = (p: TeamPlan) => p.tracks.reduce((a, id) => a + TRACK_BY_ID[id].steps.reduce((b, s) => b + s.min, 0), 0) + p.quizzes.length * 4;

/* ---------- manager: build a plan ---------- */
function PlanBuilder() {
  const [p, setP] = useState<TeamPlan>(EMPTY_PLAN);
  const set = (x: Partial<TeamPlan>) => setP((o) => ({ ...o, ...x }));
  const toggle = (k: 'tracks' | 'quizzes', id: string) => set({ [k]: p[k].includes(id) ? p[k].filter((x) => x !== id) : [...p[k], id] } as Partial<TeamPlan>);
  const ready = p.tracks.length + p.quizzes.length > 0;
  const link = ready ? `${location.origin}${BASE}team/?plan=${encodePlan(p)}` : '';
  return (
    <div className="team-builder">
      <div className="reg-form">
        <label>Organisation<input value={p.org} onChange={(e) => set({ org: e.target.value })} maxLength={120} placeholder="Optional" /></label>
        <label>Team or group<input value={p.team} onChange={(e) => set({ team: e.target.value })} maxLength={120} placeholder="e.g. Claims handling, spring intake" /></label>
        <label>Complete by<input type="date" value={p.due} onChange={(e) => set({ due: e.target.value })} /></label>
        <label className="wide">Message to the team<textarea rows={3} value={p.note} onChange={(e) => set({ note: e.target.value })} maxLength={600} placeholder="Why this matters for your work, and who to ask for help" /></label>
      </div>
      <fieldset className="team-pick">
        <legend>Learning tracks</legend>
        <p className="small muted">Pick the routes that match people's jobs. Each one is a set of short, hands-on steps that ends with a quiz.</p>
        <div className="opts team-opts">
          {TRACKS.map((t) => (
            <label key={t.id} className={`opt ${p.tracks.includes(t.id) ? 'on' : ''}`}>
              <input type="checkbox" checked={p.tracks.includes(t.id)} onChange={() => toggle('tracks', t.id)} />
              <span><b>{t.title}</b><span className="muted small" style={{ display: 'block' }}>{t.who} About {t.steps.reduce((a, s) => a + s.min, 0)} minutes.</span></span>
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className="team-pick">
        <legend>Quizzes</legend>
        <p className="small muted">Five scenario questions each, with an explanation for every answer. A score of 80% counts as passed.</p>
        <div className="team-quiz-grid">
          {QUIZZES.map((q) => (
            <label key={q.id} className={`check ${p.quizzes.includes(q.id) ? 'on-q' : ''}`}>
              <input type="checkbox" checked={p.quizzes.includes(q.id)} onChange={() => toggle('quizzes', q.id)} />
              <span>{q.title}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="card card-pad team-share">
        <div className="label">Your team link</div>
        {ready ? (
          <>
            <p className="small muted">About {minutes(p)} minutes in total. The whole plan is stored in the link itself, so nothing is saved on a server. Anyone with the link can open it.</p>
            <input className="team-link" readOnly value={link} aria-label="Team link" onFocus={(e) => e.currentTarget.select()} />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={async () => { if (await copyText(link)) { toast('Link copied'); track('team-plan-link'); } }}>Copy link</button>
              <a className="btn" href={link}>Open it as a learner would</a>
            </div>
          </>
        ) : <p className="small muted">Choose at least one track or quiz.</p>}
      </div>
    </div>
  );
}

/** a small bar with the numbers next to it; the numbers carry the meaning */
function Meter({ n, of }: { n: number; of: number }) {
  if (!of) return <span className="muted small">-</span>;
  return <span className="meter"><span className="meter-bar" aria-hidden="true"><span style={{ width: `${(n / of) * 100}%` }} /></span><span className="mono small">{n}/{of}</span></span>;
}

/* ---------- manager: team record ---------- */
function TeamRecord() {
  const [records, setRecords] = useState<LearnerRecord[]>(loadTeam);
  const fileRef = useRef<HTMLInputElement>(null);
  useEffect(() => { saveTeam(records); }, [records]);
  const onFiles = async (files: FileList) => {
    const ok: LearnerRecord[] = [];
    const bad: string[] = [];
    for (const f of Array.from(files)) { try { ok.push(parseRecord(await f.text())); } catch (e) { bad.push(`${f.name}: ${(e as Error).message}`); } }
    if (ok.length) { setRecords((r) => mergeRecords(r, ok)); track('team-import'); }
    toast(`${ok.length} record${ok.length === 1 ? '' : 's'} added${bad.length ? `, ${bad.length} not read` : ''}`);
    if (bad.length) console.warn(bad.join('\n'));
  };
  const plans = useMemo(() => [...new Set(records.map((r) => r.planId))].length, [records]);
  return (
    <div className="team-record">
      <p className="muted">Ask each person to send you the record file they download at the end of their plan. Add the files here to see the whole team, then export the record for your files.</p>
      <div className="reg-tools">
        <button className="btn btn-primary" onClick={() => fileRef.current?.click()}>Add record files</button>
        <button className="btn" disabled={!records.length} onClick={() => { download(`ai-literacy-record-${stamp()}.md`, teamMarkdown(records), 'text/markdown;charset=utf-8'); track('team-export-md'); }}>Export record (Markdown)</button>
        <button className="btn" disabled={!records.length} onClick={() => { download(`ai-literacy-record-${stamp()}.csv`, teamCsv(records), 'text/csv;charset=utf-8'); track('team-export-csv'); }}>Export CSV</button>
        <button className="btn" disabled={!records.length} onClick={() => { if (confirm('Remove all records from this browser? Export them first if you need them.')) setRecords([]); }}>Clear</button>
        <input ref={fileRef} type="file" accept="application/json,.json" multiple hidden onChange={(e) => { if (e.target.files?.length) onFiles(e.target.files); e.target.value = ''; }} />
      </div>
      {records.length > 0 && (
        <div className="card reg-list" role="region" aria-label="Team record">
          <table className="ex-table" style={{ minWidth: 640 }}>
            <thead><tr><th>Name</th><th>Team</th><th>Track steps</th><th>Quizzes passed</th><th>Complete</th><th>Record date</th></tr></thead>
            <tbody>
              {records.map((r) => { const p = progressOfRecord(r); return (
                <tr key={r.planId + r.name}>
                  <td><b>{r.name}</b>{r.role && <div className="muted small">{r.role}</div>}</td>
                  <td className="small">{r.plan.team || '-'}</td>
                  <td><Meter n={p.steps} of={p.stepsTotal} /></td>
                  <td><Meter n={p.passed} of={p.quizzes} /></td>
                  <td className="small">{p.complete ? 'Yes' : 'Not yet'}</td>
                  <td className="small">{r.exported.slice(0, 10)}</td>
                </tr>
              ); })}
            </tbody>
          </table>
        </div>
      )}
      {plans > 1 && <p className="small muted">These records come from {plans} different plans; the export groups them by plan.</p>}
      <p className="small muted">{RECORD_NOTE}</p>
    </div>
  );
}

/* ---------- learner ---------- */
function Learner({ plan }: { plan: TeamPlan }) {
  const quiz = useQuizResults();
  const [done, setDone] = useState<Record<string, number[]>>(loadTrackProgress);
  const [name, setName] = useState(() => { try { return localStorage.getItem('are-quiz-name') ?? ''; } catch { return ''; } });
  const [role, setRole] = useState('');
  const [reflection, setReflection] = useState('');
  useEffect(() => { try { localStorage.setItem(TRACK_KEY, JSON.stringify(done)); } catch { /* ignore */ } }, [done]);
  useEffect(() => { try { localStorage.setItem('are-quiz-name', name); } catch { /* ignore */ } }, [name]);
  const toggle = (t: string, i: number) => setDone((d) => { const cur = d[t] ?? []; return { ...d, [t]: cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i] }; });
  const record = buildRecord(plan, name, role, reflection, done, quiz);
  const pr = progressOfRecord(record);

  return (
    <>
      <div className="card card-pad team-brief">
        <div className="label">Your plan{plan.team ? ` · ${plan.team}` : ''}{plan.org ? ` · ${plan.org}` : ''}</div>
        {plan.note && <p className="team-note">{plan.note}</p>}
        <p className="small muted">About {minutes(plan)} minutes{plan.due ? `, to finish by ${plan.due}` : ''}. Your progress is saved in this browser as you go, so you can stop and come back on the same device.</p>
        <p className="small">{pr.stepsTotal > 0 && <><b>{pr.steps} of {pr.stepsTotal}</b> steps done</>}{pr.stepsTotal > 0 && pr.quizzes > 0 && ' · '}{pr.quizzes > 0 && <><b>{pr.passed} of {pr.quizzes}</b> quizzes passed</>}</p>
      </div>

      <section className="team-sec" aria-labelledby="how-h">
        <h2 id="how-h">How to get the most from this</h2>
        <ol className="sec-steps">
          <li>Before each example, guess what will go wrong. Then switch the problem on and see if you were right. Being wrong first is how the lesson sticks.</li>
          <li>Do the steps in order. Each one builds on the last, and the quiz at the end checks the whole track.</li>
          <li>Read the explanation after every quiz answer, including the ones you got right.</li>
          <li>Take the quizzes again in a week or two. Recalling something after a gap is one of the most reliable ways to remember it.</li>
          <li>Finish by writing down one thing you will do differently at work.</li>
        </ol>
      </section>

      {plan.tracks.map((id) => { const t = TRACK_BY_ID[id]; const d = done[id] ?? []; return (
        <section key={id} className="team-sec" aria-labelledby={`t-${id}`}>
          <h2 id={`t-${id}`}>{t.title} <span className="tag">{d.length}/{t.steps.length}</span></h2>
          <div className="track-goals"><span className="label">By the end you will be able to</span><ul>{t.goals.map((g) => <li key={g}>{g}</li>)}</ul></div>
          <ol className="team-steps">
            {t.steps.map((s, i) => (
              <li key={i} className={d.includes(i) ? 'on' : ''}>
                <label className="step-check"><input type="checkbox" checked={d.includes(i)} onChange={() => toggle(id, i)} /><span className="sr-only">Mark step {i + 1} of {t.title} as done</span></label>
                <div><a href={url(s.to)} target="_blank" rel="noopener"><b>{i + 1}. {s.t}</b></a><span className="muted small"> · {s.min} min · opens in a new tab</span></div>
              </li>
            ))}
          </ol>
        </section>
      ); })}

      {plan.quizzes.length > 0 && (
        <section className="team-sec" aria-labelledby="q-h">
          <h2 id="q-h">Quizzes</h2>
          <ul className="team-quizzes">
            {plan.quizzes.map((id) => { const r = quiz[id]; return (
              <li key={id}>
                <a href={url(`/quiz/${id}`)} target="_blank" rel="noopener"><b>{QUIZ_BY_ID[id].title}</b></a>
                <span className={`tag ${passed(r) ? 'explored' : ''}`}>{r ? `${passed(r) ? 'Passed' : 'Best'} ${r.score}/${r.total}` : 'Not taken'}</span>
              </li>
            ); })}
          </ul>
          <p className="small muted">Scores appear here as soon as you finish a quiz in the other tab.</p>
        </section>
      )}

      <section className="team-sec" aria-labelledby="rec-h">
        <h2 id="rec-h">Your record</h2>
        <div className="reg-form">
          <label>Your name<input value={name} onChange={(e) => setName(e.target.value)} maxLength={120} /></label>
          <label>Job title or role<input value={role} onChange={(e) => setRole(e.target.value)} maxLength={120} placeholder="Optional" /></label>
          <label className="wide">One thing I will do differently at work<textarea rows={3} value={reflection} onChange={(e) => setReflection(e.target.value)} maxLength={1000} placeholder="For example: ask our CV-screening vendor for results by group before we renew" /></label>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
          <button className="btn btn-primary" disabled={!name.trim()} onClick={() => { download(`learning-record-${name.trim().replace(/[^\p{L}\p{N}]+/gu, '-').toLowerCase()}-${stamp()}.json`, JSON.stringify(record, null, 2), 'application/json'); track('team-record-download'); }}>Download my record</button>
        </div>
        <p className="small muted" style={{ marginTop: 8 }}>{name.trim() ? 'Send the file to the person who shared this plan with you.' : 'Add your name to download your record.'} The file contains your name, role, progress, scores and reflection. Nothing is sent anywhere until you send it yourself.</p>
      </section>
    </>
  );
}

export default function Team({ query }: PageProps) {
  const raw = query?.get('plan');
  const plan = useMemo(() => decodePlan(raw), [raw]);
  const [tab, setTab] = useState<'plan' | 'record'>('plan');
  return (
    <div className="wrap" style={{ padding: '30px 0 44px' }}>
      <div className="narrow stack">
        <Breadcrumbs trail={[{ label: 'Learn' }, { label: 'Team training' }]} />
        <h1>{plan ? 'Your training plan' : 'Team training'}</h1>
        {plan ? (
          <p className="lead">Your organisation has picked these tracks and quizzes for you. Work through them at your own pace, then download your record and send it back.</p>
        ) : (
          <>
            <p className="lead">Set up AI literacy training for a team in a few minutes. Choose tracks and quizzes, send one link, and collect a record of who completed what.</p>
            <p className="small muted">Under EU AI Act Art. 4, providers and deployers must take measures to support their staff's AI literacy. The Commission's Q&A says there is no need for a certificate, that the law does not oblige you to measure your staff's knowledge, and that you can keep an internal record of training. Since the 2026 Omnibus, no particular level of literacy is required. <a href="https://digital-strategy.ec.europa.eu/en/faqs/ai-literacy-questions-answers" target="_blank" rel="noopener noreferrer">Read the Q&A ↗</a></p>
          </>
        )}
        {raw && !plan && <div className="banner" role="alert">This plan link is incomplete or damaged. Ask for the link again, or set up a new plan below.</div>}
      </div>
      {plan ? <Learner key={planId(plan)} plan={plan} /> : (
        <>
          <div className="tabs" role="tablist" aria-label="Team training" style={{ marginTop: 22 }}>
            <button role="tab" aria-selected={tab === 'plan'} className={tab === 'plan' ? 'on' : ''} onClick={() => setTab('plan')}>1. Set up a plan</button>
            <button role="tab" aria-selected={tab === 'record'} className={tab === 'record' ? 'on' : ''} onClick={() => setTab('record')}>2. Team record</button>
          </div>
          <div role="tabpanel" style={{ marginTop: 18 }}>{tab === 'plan' ? <PlanBuilder /> : <TeamRecord />}</div>
          <p className="small muted" style={{ marginTop: 22 }}>Running a live session instead? Use the <a href={url('/workshop')}>workshop slides</a>.</p>
        </>
      )}
    </div>
  );
}
