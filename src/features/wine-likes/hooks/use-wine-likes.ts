'use client';

import { useEffect } from 'react';

import { useWineLikesStore } from '@/features/wine-likes/store/wine-likes-store';
import { http } from '@/shared/lib/http';

const STORAGE_KEY = 'tsabola-liked-wines';

function readLikedIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeLikedIds(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // storage unavailable (private mode, quota) - not worth failing the click over
  }
}

export function useHydrateWineLikes() {
  const setCounts = useWineLikesStore((state) => state.setCounts);
  const setLikedWineIds = useWineLikesStore((state) => state.setLikedWineIds);

  useEffect(() => {
    setLikedWineIds(readLikedIds());
    http
      .get<{ counts: Record<string, number> }>('/wines/likes')
      .then(({ counts }) => setCounts(counts))
      .catch(() => {});
  }, [setCounts, setLikedWineIds]);
}

export function useToggleWineLike() {
  const likedWineIds = useWineLikesStore((state) => state.likedWineIds);
  const toggle = useWineLikesStore((state) => state.toggle);

  return (wineId: string) => {
    const wasLiked = likedWineIds.includes(wineId);
    toggle(wineId);
    writeLikedIds(wasLiked ? likedWineIds.filter((id) => id !== wineId) : [...likedWineIds, wineId]);
    http.post(`/wines/${wineId}/like`, { liked: !wasLiked }).catch(() => {});
  };
}
