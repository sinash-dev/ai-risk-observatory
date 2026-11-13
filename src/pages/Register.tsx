import { SEV } from '../data/palette';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Multi, Radio } from '../components/Choice';
import { Ring } from '../components/model/Panels';
import { ActionMenu } from '../components/ActionMenu';
import { Breadcrumbs } from '../components/Nav';
import { copyText, toast } from '../components/Toast';
import { LAB_BY_ID } from '../data/labs';
import type { Answers } from '../lib/classify';
import { AREAS, BANNED, INTERACT, ROLE, SERVICES, WHERE } from '../lib/classifyOptions';
import { REG_LABEL, STATUS_LABEL, actionsOf, categoryOf, deadlines, euCell, loadRegister, newSystem, parseImport, progressOf, registerCsv, registerMarkdown, resultOf, saveRegister, systemMarkdown, type RegCat, type RegSystem, type RegisterData, type Status } from '../lib/register';
import { CategoryBar, DeadlineChart } from '../components/RegisterCharts';
import { PyramidMini } from '../components/RiskPyramid';
import { tierOfCategory } from '../data/euTiers';
import { track } from '../lib/track';
import { url } from '../lib/util';
import { exportFile, textBlob } from '../lib/exportFile';
import { PremiumSlot } from '../components/Premium';
import { hasFeature } from '../lib/entitlements';

const TONE: Record<RegCat, string> = { unassessed: SEV.soft, banned: SEV.severe, high: SEV.high, 'gpai-systemic': SEV.info, gpai: SEV.info, limited: SEV.mid, minimal: SEV.low, outside: SEV.neutral };

function Editor({ s, onChange, onDelete }: { s: RegSystem; onChange: (s: RegSystem) => void; onDelete: () => void }) {
  const [tab, setTab] = useState<'details' | 'questions' | 'actions'>(s.name ? 'actions' : 'details');
  const set = (p: Partial<RegSystem>) => onChange({ ...s, ...p, updated: new Date().toISOString().slice(0, 10) });
  // answering any question counts as assessing the system
  const setA = (p: Partial<Answers>) => set({ answers: { ...s.answers, ...p }, assessed: true });
  const r = resultOf(s);
  const cat = categoryOf(s);
  const acts = actionsOf(s, r);
  const p = progressOf(s);
  const n = `sys-${s.id}`;
  return (
    <div className="card reg-editor">
      <div className="reg-ed-head">
        <div>
          <h2 style={{ fontSize: 22 }}>{s.name || 'New system'}</h2>
          <span className="reg-tier">{s.assessed && <PyramidMini tier={tierOfCategory(r.eu)} />}<span className="tag"><span className="swatch" style={{ background: TONE[cat] }} />EU AI Act: {euCell(s, r)}</span><span className="small muted">{s.assessed ? 'Indicative, not legal advice.' : 'Answer the questions to see the category.'}</span></span>
        </div>
        <Ring n={p.done} total={p.total} size={54} />
      </div>
      <div className="tabs" role="tablist" aria-label="System sections">
        {(['details', 'questions', 'actions'] as const).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>
            {t === 'details' ? '1. Details' : t === 'questions' ? '2. Questions' : `3. Actions (${p.done}/${p.total})`}
          </button>
        ))}
      </div>
      <div className="reg-ed-body" role="tabpanel">
        {tab === 'details' && (
          <div className="reg-form">
            <label>Name of the system<input value={s.name} onChange={(e) => set({ name: e.target.value })} placeholder="e.g. CV screening tool" maxLength={200} /></label>
            <label>Owner<input value={s.owner} onChange={(e) => set({ owner: e.target.value })} placeholder="Person or team accountable for it" maxLength={200} /></label>
            <label className="wide">What it is used for<textarea value={s.purpose} onChange={(e) => set({ purpose: e.target.value })} rows={3} maxLength={1000} placeholder="One or two sentences" /></label>
            <label>Vendor<input value={s.vendor} onChange={(e) => set({ vendor: e.target.value })} placeholder="Leave empty if built in-house" maxLength={200} /></label>
            <label>Status
              <select value={s.status} onChange={(e) => set({ status: e.target.value as Status })}>
                {(Object.keys(STATUS_LABEL) as Status[]).map((k) => <option key={k} value={k}>{STATUS_LABEL[k]}</option>)}
              </select>
            </label>
            <label>Next review<input type="date" value={s.nextReview} onChange={(e) => set({ nextReview: e.target.value })} /></label>
            <label className="wide">Notes<textarea value={s.notes} onChange={(e) => set({ notes: e.target.value })} rows={3} maxLength={5000} placeholder="Decisions, evidence, links to documents" /></label>
            <div className="wide" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => setTab('questions')}>Next: answer the questions</button>
              <button className="btn" onClick={() => { if (confirm(`Delete “${s.name || 'this system'}” from your register? This cannot be undone.`)) onDelete(); }}>Delete system</button>
            </div>
          </div>
        )}
        {tab === 'questions' && (
          <div className="reg-q">
            <p className="small muted">The same questions as the <a href={url('/classify')}>classification wizard</a>, on one page. The category updates as you answer.</p>
            <fieldset><legend>Where will it be used or offered?</legend><Multi opts={WHERE} value={s.answers.where} set={(v) => setA({ where: v })} /></fieldset>
            <fieldset><legend>What is your role?</legend><Radio name={`${n}-role`} opts={ROLE} value={s.answers.role} set={(v) => setA({ role: v })} /></fieldset>
            <fieldset><legend>Does it do any of the practices the EU AI Act bans?</legend><Multi opts={BANNED} value={s.answers.banned} set={(v) => setA({ banned: v })} none="None of these" /></fieldset>
            <fieldset><legend>Is it, or a safety part of, a product under EU product law that needs a third-party check?</legend><Radio name={`${n}-product`} opts={[{ v: 'yes', l: 'Yes' }, { v: 'no', l: 'No' }, { v: 'unsure', l: 'Not sure' }]} value={s.answers.product} set={(v) => setA({ product: v as Answers['product'] })} /></fieldset>
            <fieldset><legend>Which area does it make or support decisions in?</legend>
              <Radio name={`${n}-area`} opts={AREAS} value={s.answers.area} set={(v) => setA({ area: v, service: v === 'services' ? s.answers.service : undefined, narrow: v === 'none' ? undefined : s.answers.narrow })} />
              {s.answers.area === 'services' && <div className="sub"><Radio name={`${n}-service`} opts={SERVICES} value={s.answers.service} set={(v) => setA({ service: v })} /></div>}
            </fieldset>
            {s.answers.area !== 'none' && s.answers.product !== 'yes' && s.answers.service !== 'fraud' && (
              <fieldset><legend>Does it only do a narrow procedural or preparatory task, without profiling people (Art. 6(3))?</legend><Radio name={`${n}-narrow`} opts={[{ v: 'yes', l: 'Yes, all of that applies' }, { v: 'no', l: 'No' }]} value={s.answers.narrow} set={(v) => setA({ narrow: v as 'yes' | 'no' })} /></fieldset>
            )}
            <fieldset><legend>Is it a general-purpose AI model that you develop and place on the market?</legend><Radio name={`${n}-gpai`} opts={[{ v: 'no', l: 'No' }, { v: 'yes', l: 'Yes' }, { v: 'systemic', l: 'Yes, trained with more than 10²⁵ floating-point operations' }]} value={s.answers.gpai} set={(v) => setA({ gpai: v as Answers['gpai'] })} /></fieldset>
            <fieldset><legend>Does it do any of these?</legend><Multi opts={INTERACT} value={s.answers.interact} set={(v) => setA({ interact: v })} none="None of these" /></fieldset>
            <fieldset><legend>Does it process personal data?</legend><Radio name={`${n}-personal`} opts={[{ v: 'yes', l: 'Yes' }, { v: 'no', l: 'No' }]} value={s.answers.personal} set={(v) => setA({ personal: v as 'yes' | 'no' })} /></fieldset>
            <fieldset><legend>Does it make decisions with legal or similarly significant effects without meaningful human involvement?</legend><Radio name={`${n}-auto`} opts={[{ v: 'yes', l: 'Yes' }, { v: 'no', l: 'No' }]} value={s.answers.automated} set={(v) => setA({ automated: v as 'yes' | 'no' })} /></fieldset>
            <fieldset><legend>Does it act on its own with tools, such as payments, email, code or a browser?</legend><Radio name={`${n}-agent`} opts={[{ v: 'yes', l: 'Yes' }, { v: 'no', l: 'No' }]} value={s.answers.agent} set={(v) => setA({ agent: v as 'yes' | 'no' })} /></fieldset>
            {/* the answers shown are accepted as they are, even if none was changed */}
            <button className="btn btn-primary" onClick={() => { if (!s.assessed) set({ assessed: true }); setTab('actions'); }}>See what to do</button>
          </div>
        )}
        {tab === 'actions' && !s.assessed && (
          <div className="reg-actions">
            <div className="reg-card">
              <h3>Not yet assessed</h3>
              <p>Answer the questions first. Until then this system has no category, actions or dates, and reports list it as not yet assessed.</p>
              <button className="btn btn-primary" onClick={() => setTab('questions')}>Answer the questions</button>
            </div>
          </div>
        )}
        {tab === 'actions' && s.assessed && (
          <div className="reg-actions">
            {r.cards.map((c) => (
              <div key={c.id} className="reg-card">
                <div className="res-h"><h3>{c.title}</h3><span className="res-v" style={{ fontSize: 15 }}>{c.verdict}</span></div>
                <ul className="reg-why">{c.why.map((w) => <li key={w}>{w}</li>)}</ul>
                <fieldset>
                  <legend className="sr-only">Actions for {c.title}</legend>
                  {acts.filter((a) => a.source === c.title).map((a) => (
                    <label key={a.id} className={`check ${s.done[a.id] ? 'on' : ''}`}>
                      <input type="checkbox" checked={!!s.done[a.id]} onChange={() => set({ done: { ...s.done, [a.id]: !s.done[a.id] } })} />
                      <span>{a.text}</span>
                    </label>
                  ))}
                </fieldset>
                <p className="small"><a href={url(c.link)}>Read the guide →</a></p>
              </div>
            ))}
            {r.notes.length > 0 && <div className="reg-card"><h3>Notes</h3><ul className="reg-why">{r.notes.map((x) => <li key={x}>{x}</li>)}</ul></div>}
            <div className="reg-card">
              <h3>Closest examples on this site</h3>
              <p className="small muted">See how similar systems fail and which safeguards help.</p>
              <ul className="reg-why">{r.examples.map((id) => <li key={id}><a href={url(`/model/${id}`)}>{LAB_BY_ID[id].app}</a> <span className="muted small">· {LAB_BY_ID[id].model}</span></li>)}</ul>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn" onClick={async () => { if (await copyText(systemMarkdown(s))) { toast('Copied as Markdown'); track('register-copy-system'); } }}>Copy this system as Markdown</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Register() {
  const [data, setData] = useState<RegisterData>(loadRegister);
  // ?open=<id> opens that system, e.g. right after "Add to my register" on the Classify result
  const [open, setOpen] = useState<string | null>(() => {
    const id = new URLSearchParams(location.search).get('open');
    return id && data.systems.some((s) => s.id === id) ? id : null;
  });
  useEffect(() => {
    if (!open || !location.search.includes('open=')) return;
    history.replaceState(history.state, '', location.pathname);
    setTimeout(() => document.getElementById('reg-editor')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  }, []); // first load only
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { saveRegister(data); }, [data]);
  const systems = data.systems;
  const sel = systems.find((s) => s.id === open) ?? null;
  const dl = useMemo(() => deadlines(systems), [systems]);
  const counts = useMemo(() => {
    const c: Partial<Record<RegCat, number>> = {};
    for (const s of systems) { const e = categoryOf(s); c[e] = (c[e] ?? 0) + 1; }
    return c;
  }, [systems]);
  const totals = systems.reduce((a, s) => { const p = progressOf(s); return { done: a.done + p.done, total: a.total + p.total }; }, { done: 0, total: 0 });

  const update = (s: RegSystem) => setData((d) => ({ ...d, systems: d.systems.map((x) => (x.id === s.id ? s : x)) }));
  const add = () => { const s = newSystem(); setData((d) => ({ ...d, systems: [...d.systems, s] })); setOpen(s.id); track('register-add'); setTimeout(() => document.getElementById('reg-editor')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60); };
  const remove = (id: string) => { setData((d) => ({ ...d, systems: d.systems.filter((x) => x.id !== id) })); setOpen(null); toast('System deleted'); };
  const stamp = new Date().toISOString().slice(0, 10);
  const exportMd = () => { exportFile('markdown', textBlob(registerMarkdown(systems, data.org), 'text/markdown;charset=utf-8'), `ai-register-${stamp}.md`); track('register-export-md'); };
  const exportDocx = async () => {
    setBusy(true);
    try {
      const { registerDocxBlob } = await import('../lib/registerDocx');
      exportFile('word', await registerDocxBlob(systems, data.org), `ai-register-${stamp}.docx`);
      track('register-export-docx');
    } catch { toast('The Word file could not be created. Try the Markdown export instead.'); }
    setBusy(false);
  };
  const exportCsv = () => { exportFile('csv', textBlob(registerCsv(systems), 'text/csv;charset=utf-8'), `ai-register-${stamp}.csv`); track('register-export-csv'); };
  const exportJson = () => { exportFile('json', textBlob(JSON.stringify({ format: 'ai-risk-explorer-register', version: 1, ...data }, null, 2), 'application/json'), `ai-register-${stamp}.json`); track('register-export-json'); };
  const onImport = async (f: File) => {
    try {
      const { systems: imp, skipped } = parseImport(await f.text());
      if (!imp.length) { toast('No systems found in that file'); return; }
      const ids = new Set(systems.map((s) => s.id));
      const fresh = imp.filter((s) => !ids.has(s.id));
      setData((d) => ({ ...d, systems: [...d.systems, ...fresh] }));
      toast(`Imported ${fresh.length} system${fresh.length === 1 ? '' : 's'}${imp.length - fresh.length ? `, ${imp.length - fresh.length} already in the register` : ''}${skipped ? `, ${skipped} skipped` : ''}`);
      track('register-import');
    } catch (e) { toast((e as Error).message); }
  };

  return (
    <div className="wrap" style={{ padding: '30px 0 44px' }}>
      <div className="narrow stack no-print">
        <Breadcrumbs trail={[{ label: 'Tools' }, { label: 'My AI register' }]} />
        {/* insertion point: several registers, e.g. one per business unit */}
        <PremiumSlot feature="register.multi-register"><h1>My AI register</h1></PremiumSlot>
        <p className="lead">This is your inventory of AI systems and the starting point for an audit. Add each tool, answer a few questions, and the register shows its risk level under the EU AI Act and what to do next.</p>
        <p className="small muted reg-privacy">Stored in this browser only. Nothing is sent anywhere. Use Backup to keep a copy or move it to another computer.</p>
      </div>

      <div className="reg-top no-print">
        <label className="reg-org">Organisation<input value={data.org} onChange={(e) => setData((d) => ({ ...d, org: e.target.value }))} placeholder="Optional, appears on exports" maxLength={120} /></label>
        {systems.length > 0 && (
          <div className="reg-tools">
            <button className="btn btn-primary" onClick={add}>Add a system</button>
            <ActionMenu label={busy ? 'Preparing…' : 'Export'} items={[
              { label: 'Markdown report', onSelect: exportMd },
              ...(hasFeature('export.word') ? [{ label: 'Word report', onSelect: exportDocx, disabled: busy }] : []),
              { label: 'CSV', onSelect: exportCsv },
              { label: 'Print', onSelect: () => window.print() },
            ]} />
            <ActionMenu label="Backup" items={[
              { label: 'Back up (JSON)', onSelect: exportJson },
              { label: 'Import JSON', onSelect: () => fileRef.current?.click() },
            ]} />
          </div>
        )}
        <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) onImport(f); e.target.value = ''; }} />
      </div>

      {systems.length === 0 ? (
        <div className="card card-pad raised reg-empty">
          <h2 style={{ fontSize: 20 }}>No systems yet</h2>
          <p className="muted">Begin with what people already use: a chatbot, a CV screener, a sales forecast. Ask around. There are usually more than you think.</p>
          <button className="btn btn-primary" onClick={add}>Add your first system</button>
          <p className="small muted" style={{ marginTop: 12 }}>Moving from another computer? <button className="link-btn" onClick={() => fileRef.current?.click()}>Restore a backup (JSON)</button></p>
        </div>
      ) : (
        <>
          <div className="reg-summary no-print">
            <div className="card card-pad">
              <div className="label">Systems by EU AI Act category</div>
              <CategoryBar items={(Object.keys(REG_LABEL) as RegCat[]).map((k) => ({ key: k, label: REG_LABEL[k], color: TONE[k], n: counts[k] ?? 0 }))} />
            </div>
            <div className="card card-pad reg-prog">
              <Ring n={totals.done} total={totals.total} size={58} />
              <div><div className="label">Actions done</div><p className="small muted">{systems.length === 1 ? 'For your one system.' : `Across your ${systems.length} systems.`}</p></div>
            </div>
            <div className="card card-pad reg-dl">
              <div className="label">Coming up</div>
              <DeadlineChart items={dl} />
              {dl.length ? <ul className="reg-why">{dl.slice(0, 4).map((d, i) => <li key={i}><span className="mono small accent">{d.date.toISOString().slice(0, 10)}</span> <b>{d.system || 'Unnamed system'}</b><span className="small muted" style={{ display: 'block' }}>{d.label}</span></li>)}</ul> : <p className="small muted">No upcoming dates for these systems.</p>}
            </div>
          </div>

          <div className="card reg-list no-print" role="region" aria-label="Your AI systems">
            <table className="ex-table" style={{ minWidth: 640 }}>
              <thead><tr><th>System</th><th>Owner</th><th>Status</th><th>EU AI Act</th><th>Actions</th></tr></thead>
              <tbody>
                {systems.map((s) => {
                  const c = categoryOf(s);
                  const p = progressOf(s);
                  return (
                    <tr key={s.id} className={open === s.id ? 'reg-row on' : 'reg-row'}>
                      <td><button className="reg-open" onClick={() => setOpen(open === s.id ? null : s.id)} aria-expanded={open === s.id}>{s.name || 'Unnamed system'}</button><div className="muted small">{s.purpose.slice(0, 80)}</div></td>
                      <td className="small">{s.owner || '-'}</td>
                      <td className="small">{STATUS_LABEL[s.status]}</td>
                      <td><span className="tag"><span className="swatch" style={{ background: TONE[c] }} />{REG_LABEL[c]}</span></td>
                      <td className="mono small">{p.done}/{p.total}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      <AnimatePresence mode="wait">
        {sel && (
          <motion.div key={sel.id} id="reg-editor" className="no-print" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
            <Editor s={sel} onChange={update} onDelete={() => remove(sel.id)} />
          </motion.div>
        )}
      </AnimatePresence>

      {systems.length > 0 && (
        <section className="print-only reg-print">
          <h1>AI register{data.org ? `: ${data.org}` : ''}</h1>
          <p>Printed {stamp} from AI Risk Explorer. Indicative self-assessment; not legal advice.</p>
          {systems.map((s) => {
            const r = resultOf(s);
            const acts = actionsOf(s, r);
            return (
              <div key={s.id} className="reg-print-sys">
                <h2>{s.name || 'Unnamed system'}</h2>
                <p>Owner: {s.owner || '-'} · Status: {STATUS_LABEL[s.status]} · EU AI Act: {euCell(s, r)}</p>
                {s.purpose && <p>{s.purpose}</p>}
                <ul>{acts.map((a) => <li key={a.id}>{s.done[a.id] ? '☑' : '☐'} {a.source}: {a.text}</li>)}</ul>
              </div>
            );
          })}
        </section>
      )}

    </div>
  );
}
