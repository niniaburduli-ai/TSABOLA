import { NextRequest, NextResponse } from 'next/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/features/wine-likes/service/wine-like.service', () => ({
  toggleWineLikeService: vi.fn(),
}));
vi.mock('@/shared/middleware/validate-body', () => ({
  validateBody: vi.fn(),
}));

import { toggleWineLikeService } from '@/features/wine-likes/service/wine-like.service';
import { validateBody } from '@/shared/middleware/validate-body';

import { POST } from './route';

const mockToggle = vi.mocked(toggleWineLikeService);
const mockValidate = vi.mocked(validateBody);

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/wines/wine-1/like', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/wines/[wineId]/like', () => {
  beforeEach(() => vi.clearAllMocks());

  it('toggles the like and returns the new count', async () => {
    mockValidate.mockResolvedValueOnce({ data: { liked: true } } as never);
    mockToggle.mockResolvedValueOnce({ data: { count: 1 }, status: 200 });
    const res = await POST(makeRequest({ liked: true }), { params: Promise.resolve({ wineId: 'wine-1' }) });
    expect(mockToggle).toHaveBeenCalledWith('wine-1', true);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ count: 1 });
  });

  it('returns validation error when body is invalid', async () => {
    mockValidate.mockResolvedValueOnce(NextResponse.json({ error: 'VALIDATION_ERROR' }, { status: 400 }));
    const res = await POST(makeRequest({}), { params: Promise.resolve({ wineId: 'wine-1' }) });
    expect(res.status).toBe(400);
  });

  it('returns 500 when the service throws', async () => {
    mockValidate.mockResolvedValueOnce({ data: { liked: true } } as never);
    mockToggle.mockRejectedValueOnce(new Error('DB error'));
    const res = await POST(makeRequest({ liked: true }), { params: Promise.resolve({ wineId: 'wine-1' }) });
    expect(res.status).toBe(500);
  });
});
