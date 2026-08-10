import { getUserCountsService } from '@/features/auth/service/auth.service';
import { listGalleryImages } from '@/features/gallery/service/gallery.service';
import { getSiteContent } from '@/features/tsabola/service/site-content.service';
import type { SiteContent } from '@/features/tsabola/types';
import { getAllLikedWinesSortedService } from '@/features/wine-likes/service/wine-like.service';
import { ServiceResult } from '@/shared/types/common';

export type AdminDashboardStats = {
  wines: number;
  news: { total: number; published: number };
  gallery: { total: number; published: number };
  users: { total: number; admins: number };
  contentUpdatedAt: string | null;
  topLikedWines: { wineId: string; name: string; count: number }[];
};

export async function getAdminDashboardStats(): Promise<ServiceResult<AdminDashboardStats>> {
  const [siteContentResult, galleryResult, usersResult, likedWinesResult] = await Promise.all([
    getSiteContent(),
    listGalleryImages(),
    getUserCountsService(),
    getAllLikedWinesSortedService(),
  ]);

  const siteContentData = siteContentResult.data;
  const content: SiteContent | null = 'error' in siteContentData ? null : (siteContentData.content as SiteContent);
  const contentUpdatedAt = 'error' in siteContentData ? null : siteContentData.updatedAt;

  const galleryImages = 'error' in galleryResult.data ? [] : galleryResult.data;
  const users = 'error' in usersResult.data ? { total: 0, admins: 0 } : usersResult.data;
  const likeCounts = 'error' in likedWinesResult.data ? [] : likedWinesResult.data;
  const countByWineId = new Map(likeCounts.map((entry) => [entry.wineId, entry.count]));

  const topLikedWines = (content?.wines.items ?? [])
    .map((wine) => ({
      wineId: wine.id,
      name: wine.name.ka || wine.name.en,
      count: countByWineId.get(wine.id) ?? 0,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    data: {
      wines: content?.wines.items.length ?? 0,
      news: {
        total: content?.news.items.length ?? 0,
        published: content?.news.items.filter((item) => item.published).length ?? 0,
      },
      gallery: {
        total: galleryImages.length,
        published: galleryImages.filter((image) => image.published).length,
      },
      users,
      contentUpdatedAt,
      topLikedWines,
    },
    status: 200,
  };
}
