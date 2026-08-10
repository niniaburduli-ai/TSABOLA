import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/features/auth/service/auth.service', () => ({
  getUserCountsService: vi.fn(),
}));
vi.mock('@/features/gallery/service/gallery.service', () => ({
  listGalleryImages: vi.fn(),
}));
vi.mock('@/features/tsabola/service/site-content.service', () => ({
  getSiteContent: vi.fn(),
}));

import { getUserCountsService } from '@/features/auth/service/auth.service';
import { listGalleryImages } from '@/features/gallery/service/gallery.service';
import { getSiteContent } from '@/features/tsabola/service/site-content.service';

import { getAdminDashboardStats } from './admin-dashboard.service';

const baseContent = {
  wines: { items: [{ id: '1' }, { id: '2' }] },
  news: { items: [{ id: 'a', published: true }, { id: 'b', published: false }] },
};

describe('getAdminDashboardStats', () => {
  beforeEach(() => {
    vi.mocked(getSiteContent).mockReset();
    vi.mocked(listGalleryImages).mockReset();
    vi.mocked(getUserCountsService).mockReset();
  });

  it('aggregates real counts from content, gallery, and users', async () => {
    vi.mocked(getSiteContent).mockResolvedValueOnce({
      data: { content: baseContent, theme: {}, visibility: {}, updatedAt: '2026-08-01T00:00:00.000Z' },
      status: 200,
    } as never);
    vi.mocked(listGalleryImages).mockResolvedValueOnce({
      data: [{ published: true }, { published: true }, { published: false }],
      status: 200,
    } as never);
    vi.mocked(getUserCountsService).mockResolvedValueOnce({
      data: { total: 5, admins: 2 },
      status: 200,
    } as never);

    const result = await getAdminDashboardStats();

    expect(result.data).toEqual({
      wines: 2,
      news: { total: 2, published: 1 },
      gallery: { total: 3, published: 2 },
      users: { total: 5, admins: 2 },
      contentUpdatedAt: '2026-08-01T00:00:00.000Z',
    });
  });

  it('defaults to zeroed stats when the content lookup errors', async () => {
    vi.mocked(getSiteContent).mockResolvedValueOnce({ data: { error: 'FAILED' }, status: 500 } as never);
    vi.mocked(listGalleryImages).mockResolvedValueOnce({ data: [], status: 200 } as never);
    vi.mocked(getUserCountsService).mockResolvedValueOnce({ data: { total: 0, admins: 0 }, status: 200 } as never);

    const result = await getAdminDashboardStats();

    expect(result.data).toMatchObject({ wines: 0, news: { total: 0, published: 0 }, contentUpdatedAt: null });
  });
});
