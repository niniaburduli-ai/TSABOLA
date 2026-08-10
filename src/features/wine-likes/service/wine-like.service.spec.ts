import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/features/wine-likes/repository/wine-like.repository', () => ({
  wineLikeRepository: {
    incrementLike: vi.fn(),
    decrementLike: vi.fn(),
    getCounts: vi.fn(),
    getAllSorted: vi.fn(),
  },
}));

import { wineLikeRepository } from '@/features/wine-likes/repository/wine-like.repository';

import {
  toggleWineLikeService,
  getWineLikeCountsService,
  getAllLikedWinesSortedService,
} from './wine-like.service';

describe('toggleWineLikeService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('increments when liked is true and returns the new count', async () => {
    vi.mocked(wineLikeRepository.incrementLike).mockResolvedValueOnce({ wineId: 'wine-1', count: 4 } as never);
    const result = await toggleWineLikeService('wine-1', true);
    expect(wineLikeRepository.incrementLike).toHaveBeenCalledWith('wine-1');
    expect(result).toEqual({ data: { count: 4 }, status: 200 });
  });

  it('decrements when liked is false and returns the new count', async () => {
    vi.mocked(wineLikeRepository.decrementLike).mockResolvedValueOnce({ wineId: 'wine-1', count: 2 } as never);
    const result = await toggleWineLikeService('wine-1', false);
    expect(wineLikeRepository.decrementLike).toHaveBeenCalledWith('wine-1');
    expect(result).toEqual({ data: { count: 2 }, status: 200 });
  });

  it('returns 0 when decrementing a wine already at 0', async () => {
    vi.mocked(wineLikeRepository.decrementLike).mockResolvedValueOnce(null);
    const result = await toggleWineLikeService('wine-1', false);
    expect(result).toEqual({ data: { count: 0 }, status: 200 });
  });
});

describe('getWineLikeCountsService', () => {
  it('reduces the doc list into a wineId -> count map', async () => {
    vi.mocked(wineLikeRepository.getCounts).mockResolvedValueOnce([
      { wineId: 'wine-1', count: 3 },
      { wineId: 'wine-2', count: 0 },
    ] as never);
    const result = await getWineLikeCountsService();
    expect(result).toEqual({ data: { 'wine-1': 3, 'wine-2': 0 }, status: 200 });
  });
});

describe('getAllLikedWinesSortedService', () => {
  it('maps docs to plain wineId/count pairs, already sorted by the repo', async () => {
    vi.mocked(wineLikeRepository.getAllSorted).mockResolvedValueOnce([
      { wineId: 'wine-2', count: 5 },
      { wineId: 'wine-1', count: 1 },
    ] as never);
    const result = await getAllLikedWinesSortedService();
    expect(result).toEqual({
      data: [{ wineId: 'wine-2', count: 5 }, { wineId: 'wine-1', count: 1 }],
      status: 200,
    });
  });
});
