import { describe, it, expect } from 'vitest';

import { getAtPath, setAtPath } from './json-path';

describe('getAtPath', () => {
  it('reads a top-level object path', () => {
    expect(getAtPath({ hero: { cta: { ka: 'a', en: 'b' } } }, 'hero.cta')).toEqual({ ka: 'a', en: 'b' });
  });

  it('reads through an array matched by id', () => {
    const root = { news: { items: [{ id: 'x', title: { ka: 'a', en: 'b' } }] } };
    expect(getAtPath(root, 'news.items.x.title')).toEqual({ ka: 'a', en: 'b' });
  });

  it('returns undefined for a missing path', () => {
    expect(getAtPath({ hero: {} }, 'hero.missing.leaf')).toBeUndefined();
  });

  it('returns root when path is empty', () => {
    const root = { a: 1 };
    expect(getAtPath(root, '')).toBe(root);
  });
});

describe('setAtPath', () => {
  it('sets a top-level object path', () => {
    const root = { hero: { cta: { ka: 'a', en: 'b' } } };
    const ok = setAtPath(root, 'hero.cta', { ka: 'a', en: 'new' });
    expect(ok).toBe(true);
    expect(root.hero.cta).toEqual({ ka: 'a', en: 'new' });
  });

  it('sets through an array matched by id', () => {
    const root = { news: { items: [{ id: 'x', title: { ka: 'a', en: 'b' } }] } };
    const ok = setAtPath(root, 'news.items.x.title', { ka: 'a', en: 'new' });
    expect(ok).toBe(true);
    expect(root.news.items[0].title).toEqual({ ka: 'a', en: 'new' });
  });

  it('returns false for an unresolvable parent path', () => {
    const root = { hero: {} };
    expect(setAtPath(root, 'hero.missing.leaf', { ka: 'a', en: 'b' })).toBe(false);
  });
});
