import { describe, expect, it } from 'vitest';
import { FRAMEWORKS } from '../../data/frameworks';
import { splitOpening } from '../util';

describe('splitOpening', () => {
  it('splits after the first sentence', () => {
    expect(splitOpening('The first sentence is long enough to stand alone. Then more. And more.')).toEqual(['The first sentence is long enough to stand alone.', 'Then more. And more.']);
  });
  it('takes two sentences when the first is short', () => {
    expect(splitOpening('It depends. Sector laws apply to lenders and employers. More here.')).toEqual(['It depends. Sector laws apply to lenders and employers.', 'More here.']);
  });
  it('does not split on article numbers', () => {
    expect(splitOpening('See Art. 3 of the Act for the definition used here. Next.')[0]).toBe('See Art. 3 of the Act for the definition used here.');
  });
  it('returns the whole text when there is one sentence', () => {
    expect(splitOpening('Anyone using AI in the UK and in every sector.')).toEqual(['Anyone using AI in the UK and in every sector.', '']);
  });
  it('loses nothing on any framework intro or scope', () => {
    for (const f of FRAMEWORKS) {
      for (const text of [f.intro, f.who]) {
        const [a, b] = splitOpening(text);
        expect([a, b].filter(Boolean).join(' ')).toBe(text.replace(/\s+/g, ' '));
        expect(a).toMatch(/[.!?]$/);
      }
    }
  });
});
