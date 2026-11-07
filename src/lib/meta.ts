import { useEffect } from 'react';
import { SITE } from '../data/site';

/** Keep <title> and the meta description in step with client-side navigation. */
export function useDocumentMeta(title: string, description?: string) {
  useEffect(() => {
    document.title = title === SITE.name ? title : `${title} · ${SITE.name}`;
    if (description) document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  }, [title, description]);
}

/** Same as useDocumentMeta, for callers outside React's render (e.g. after a dynamic import). */
export function setDocumentMeta(title: string, description?: string) {
  document.title = title === SITE.name ? title : `${title} · ${SITE.name}`;
  if (description) document.querySelector('meta[name="description"]')?.setAttribute('content', description);
}
