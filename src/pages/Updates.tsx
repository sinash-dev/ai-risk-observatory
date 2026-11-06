import { motion } from 'framer-motion';
import { Breadcrumbs } from '../components/Nav';
import { FW_BY_ID } from '../data/frameworks';
import { fmtDate } from '../data/site';
import { UPDATES } from '../data/updates';
import { BASE, url } from '../lib/util';

export default function Updates() {
  return (
    <div className="wrap" style={{ padding: '30px 0 44px' }}>
      <div className="narrow stack">
        <Breadcrumbs trail={[{ label: 'About' }, { label: 'Updates' }]} />
        <h1>Updates</h1>
        <p className="lead">What changed on the site, and which legal developments it reflects. Follow along with the <a href={`${BASE}updates.xml`}>RSS feed</a>.</p>
      </div>
      <ol className="upd">
        {UPDATES.map((u, i) => (
          <motion.li key={u.title} initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
            <span className="upd-dot" aria-hidden />
            <time className="mono small accent" dateTime={u.date}>{fmtDate(u.date)}</time>
            <h2 className="upd-t">{u.title}</h2>
            <p className="muted">{u.body}</p>
            <p className="small upd-links">
              {u.fw?.map((f) => <span key={f} className="tag">{FW_BY_ID[f].short}</span>)}
              {u.links?.map((l) => <a key={l.to} href={url(l.to)}>{l.label} →</a>)}
            </p>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}
