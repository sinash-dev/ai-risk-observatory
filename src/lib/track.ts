/**
 * Anonymous feature counts through GoatCounter (cookieless, no personal data).
 * Only the event name is sent, never anything the user typed.
 */
export function track(name: string) {
  try {
    const gc = (window as unknown as { goatcounter?: { count?: (o: object) => void } }).goatcounter;
    gc?.count?.({ path: `event-${name}`, title: name, event: true });
  } catch { /* analytics must never break the page */ }
}
