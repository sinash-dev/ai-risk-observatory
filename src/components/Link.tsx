import type { AnchorHTMLAttributes } from 'react';
import { url } from '../lib/util';

/** Internal link. Clicks are turned into client-side navigation by the global handler in App. */
export function Link({ to, ...rest }: { to: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>) {
  return <a href={url(to)} {...rest} />;
}
