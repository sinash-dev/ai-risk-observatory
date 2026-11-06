import '@fontsource-variable/manrope';
import '@fontsource-variable/sora';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

// Old shared links used hash routes (#/model/credit). Move them to real paths before rendering.
const BASE = import.meta.env.BASE_URL;
if (location.hash.startsWith('#/')) {
  const path = location.hash.slice(2).replace(/^\/+/, '').replace(/\/?$/, '/');
  history.replaceState(null, '', BASE + (path === '/' ? '' : path));
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
