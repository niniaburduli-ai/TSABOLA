import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/features/wine-likes/service/wine-like.service', () => ({
  getWineLikeCountsService: vi.fn(),
}));

import { getWineLikeCountsService } from '@/features/wine-likes/service/wine-like.service';

import { GET } from './route';

const mockGetCounts = vi.mocked(getWineLikeCountsService);

describe('GET /api/wines/likes', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns the counts map', async () => {
    mockGetCounts.mockResolvedValueOnce({ data: { 'wine-1': 3 }, status: 200 });
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ counts: { 'wine-1': 3 } });
  });

  it('returns 500 when the service throws', async () => {
    mockGetCounts.mockRejectedValueOnce(new Error('DB error'));
    const res = await GET();
    expect(res.status).toBe(500);
  });
});
