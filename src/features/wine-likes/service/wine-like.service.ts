import { wineLikeRepository } from '@/features/wine-likes/repository/wine-like.repository';
import { ServiceResult } from '@/shared/types/common';

export async function toggleWineLikeService(
  wineId: string,
  liked: boolean
): Promise<ServiceResult<{ count: number }>> {
  const doc = liked
    ? await wineLikeRepository.incrementLike(wineId)
    : await wineLikeRepository.decrementLike(wineId);
  return { data: { count: doc?.count ?? 0 }, status: 200 };
}

export async function getWineLikeCountsService(): Promise<ServiceResult<Record<string, number>>> {
  const docs = await wineLikeRepository.getCounts();
  const counts = docs.reduce<Record<string, number>>((acc, doc) => {
    acc[doc.wineId] = doc.count;
    return acc;
  }, {});
  return { data: counts, status: 200 };
}

export async function getAllLikedWinesSortedService(): Promise<ServiceResult<{ wineId: string; count: number }[]>> {
  const docs = await wineLikeRepository.getAllSorted();
  return { data: docs.map((doc) => ({ wineId: doc.wineId, count: doc.count })), status: 200 };
}
