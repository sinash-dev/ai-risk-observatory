import { Link } from '../components/Link';
import { LABS } from '../data/labs';
import { openSearch } from '../lib/searchStore';

export function NotFound() {
  const popular = ['credit', 'chatbot', 'face', 'travel-agent'];
  return (
    <div className="wrap section narrow stack">
      <div className="label accent">404</div>
      <h1>Page not found</h1>
      <p className="lead">This address does not exist, or it has moved. Try one of these instead.</p>
      <button className="search-btn" style={{ width: '100%', maxWidth: 520, minHeight: 48 }} onClick={openSearch}>
        <span aria-hidden>⌕</span><span>Search models, frameworks and terms…</span>
      </button>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Link className="btn btn-primary" to="/">All examples</Link>
        <Link className="btn" to="/rules">Frameworks</Link>
        <Link className="btn" to="/basics">The basics</Link>
      </div>
      <ul className="muted">
        {popular.map((id) => { const l = LABS.find((x) => x.id === id)!; return <li key={id}><Link to={`/model/${id}`}>{l.model}: {l.app}</Link></li>; })}
      </ul>
    </div>
  );
}
