import { Breadcrumbs } from '../components/Nav';
import { copyText, toast } from '../components/Toast';
import { FRAMEWORKS } from '../data/frameworks';
import { LABS } from '../data/labs';
import { SITE, fmtDate } from '../data/site';
import { url } from '../lib/util';

const CITATION = `Shafaei, S. (2026). AI Risk Explorer. ${SITE.url}`;

/** Everything this site stores in the browser. */
export function resetProgress() {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && /^(aro-progress|are-check-|are-quiz|are-track|tour-done|are-recent-searches)/.test(k)) keys.push(k);
    }
    keys.forEach((k) => localStorage.removeItem(k));
  } catch { /* ignore */ }
  window.dispatchEvent(new Event('aro-progress'));
}

export default function About() {
  return (
    <div className="wrap" style={{ padding: '30px 0 44px' }}>
      <div className="narrow stack about">
        <Breadcrumbs trail={[{ label: 'About' }]} />
        <h1>About AI Risk Explorer</h1>
        <p className="lead">A free training resource that shows, with working examples, how AI systems fail and what {FRAMEWORKS.length} governance frameworks expect organisations to do about it.</p>

        <h2>Purpose</h2>
        <p>Most AI governance training is either abstract or legal. This site starts from the system instead: {LABS.length} realistic uses of AI, from a spam filter to a team of purchasing agents, each with problems you can switch on and safeguards you can test. The rules are then mapped onto the same examples, so the link between a legal duty and a practical control is visible.</p>

        <h2>Who built it</h2>
        {/* TODO(owner): replace with the author's name, role, short bio and link. Do not invent details. */}
        <div className="card card-pad placeholder">
          <p><b>[Author name]</b>, [role]</p>
          <p className="muted small">[Short bio, two or three sentences.] [Link]</p>
        </div>

        <h2>How it works</h2>
        <ul>
          <li>All data is synthetic. The organisation “Meridian”, its people and the news headlines in the simulations are fictional.</li>
          <li>The classical models (for example, logistic regression for credit scoring) are trained live in your browser on that synthetic data.</li>
          <li>Generative AI and agent behaviour is scripted to show realistic failure patterns; no language model runs on the site.</li>
          <li>Risk scores, the trade-off gauges and the Compare strength scores are indicative and meant for teaching.</li>
        </ul>

        <h2>Methodology</h2>
        <p>Each example is classified under each framework from the framework’s own categories, with the requirements that apply and the safeguards in the simulation that meet them. Compare scores follow a published <a href={url('/compare')}>four-level rubric</a>. Real cases are chosen because they are well documented in public reporting, court decisions or regulators’ publications, and show the failure the example teaches; they are summarised, not quoted.</p>

        <h2>Sources and review</h2>
        <p>Every guide lists its official sources. The content was last reviewed on {fmtDate(SITE.reviewed)} and is reviewed at least quarterly and after major legal changes. Changes are listed on the <a href={url('/updates')}>updates page</a>. Legal summaries are simplified and are not legal advice.</p>

        <h2>Report an error</h2>
        <p>Spotted something wrong or out of date? <a href={`${SITE.repo}/issues/new?template=content-error.md`} target="_blank" rel="noopener noreferrer">Open an issue on GitHub ↗</a> with the page, what is wrong and a source.</p>

        <h2>Licence</h2>
        <p>Content is licensed under <a href={`${SITE.repo}/blob/main/CONTENT_LICENSE.md`} target="_blank" rel="noopener noreferrer">CC BY 4.0</a> and code under the <a href={`${SITE.repo}/blob/main/LICENSE`} target="_blank" rel="noopener noreferrer">MIT licence</a>. The templates in the toolkit are free to adapt.</p>

        <h2>How to cite</h2>
        <div className="cite">
          <code>{CITATION}</code>
          <button className="btn btn-sm" onClick={async () => { if (await copyText(CITATION)) toast('Citation copied'); }}>Copy</button>
        </div>

        <h2>Privacy</h2>
        <ul>
          <li>No cookies, no advertising and no tracking of individuals.</li>
          <li>A cookieless visit counter (GoatCounter) records page views without personal data, to show how often the site is used. It also counts, anonymously, when a feature is used (for example a template download, a finished quiz or an export from the AI register). Only the name of the feature is sent, never anything you type.</li>
          <li>Fonts are served from this site; no other third-party requests are made.</li>
          <li>Your progress, checklists, quiz results, certificate name, AI register and team training records are kept in your browser’s local storage only. Nothing is sent anywhere.</li>
        </ul>
        <div>
          <button className="btn" onClick={() => { resetProgress(); toast('Progress reset'); }}>Reset my progress</button>
          <p className="dim small" style={{ marginTop: 6 }}>Clears explored examples, checklists, quiz results, learning-track progress and recent searches in this browser. Your AI register is kept; delete systems on the register page if you want to remove it.</p>
        </div>
      </div>
    </div>
  );
}
