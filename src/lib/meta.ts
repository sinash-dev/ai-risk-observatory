import { useEffect } from 'react';
import { SITE } from '../data/site';

/** Keep <title> and the meta description in step with client-side navigation. */
export function useDocumentMeta(title: string, description?: string) {
  useEffect(() => {
    document.title = title === SITE.name ? title : `${title} · ${SITE.name}`;
    if (description) document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  }, [title, description]);
}
