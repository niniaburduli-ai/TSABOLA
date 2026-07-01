import { getSiteContent } from '@/features/tsabola/service/site-content.service';
import type { NewsItem, SiteContent } from '@/features/tsabola/types';
import { ServiceResult } from '@/shared/types/common';

export async function getPublishedNewsService(): Promise<ServiceResult<NewsItem[]>> {
  const result = await getSiteContent();
  if ('error' in result.data) return { data: [], status: result.status };

  const content = result.data.content as SiteContent;
  return { data: content.news.items.filter((item) => item.published), status: 200 };
}

export async function getNewsItemBySlugService(slug: string): Promise<ServiceResult<NewsItem>> {
  const result = await getPublishedNewsService();
  if ('error' in result.data) return { data: { error: 'NOT_FOUND' }, status: 404 };

  const item = result.data.find((n) => n.slug === slug);
  if (!item) return { data: { error: 'NOT_FOUND' }, status: 404 };

  return { data: item, status: 200 };
}
