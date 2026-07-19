import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { useMediaQuery } from './use-media-query';

function mockMatchMedia(initialMatches: boolean) {
  const listeners: Array<(e: MediaQueryListEvent) => void> = [];
  const mql = {
    matches: initialMatches,
    addEventListener: (_: string, handler: (e: MediaQueryListEvent) => void) => {
      listeners.push(handler);
    },
    removeEventListener: vi.fn(),
  };
  window.matchMedia = vi.fn().mockReturnValue(mql);
  return {
    emit: (matches: boolean) => {
      mql.matches = matches;
      listeners.forEach((handler) => handler({ matches } as MediaQueryListEvent));
    },
  };
}

describe('useMediaQuery', () => {
  it('returns the initial match state', () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useMediaQuery('(min-width: 640px)'));
    expect(result.current).toBe(true);
  });

  it('updates when the media query match state changes', () => {
    const { emit } = mockMatchMedia(false);
    const { result } = renderHook(() => useMediaQuery('(min-width: 640px)'));
    expect(result.current).toBe(false);

    act(() => {
      emit(true);
    });

    expect(result.current).toBe(true);
  });
});
