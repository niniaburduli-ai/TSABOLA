import { DEFAULT_CONTENT, DEFAULT_THEME, DEFAULT_VISIBILITY } from '@/features/tsabola/content/site-content';
import { siteContentRepository } from '@/features/tsabola/repository/site-content.repository';
import type { NewsItem, SiteContent } from '@/features/tsabola/types';
import { ServiceResult } from '@/shared/types/common';
import { slugify } from '@/shared/utils/slugify';

type SiteContentPayload = { content: unknown; theme: unknown; visibility: unknown };

function normalizeNewsItem(item: NewsItem): NewsItem {
  const fallbackSlug = slugify(item.title?.en ?? '') || slugify(item.title?.ka ?? '') || item.id;
  return { ...item, slug: item.slug || fallbackSlug, published: item.published ?? true };
}

function normalizeContent(content: SiteContent): SiteContent {
  return { ...content, news: { ...content.news, items: content.news.items.map(normalizeNewsItem) } };
}

export async function getSiteContent(): Promise<ServiceResult<SiteContentPayload>> {
  const doc = await siteContentRepository.findOne();
  if (!doc) {
    return {
      data: { content: normalizeContent(DEFAULT_CONTENT), theme: DEFAULT_THEME, visibility: DEFAULT_VISIBILITY },
      status: 200,
    };
  }
  return {
    data: {
      content: normalizeContent(doc.content as SiteContent),
      theme: doc.theme,
      visibility: doc.visibility,
    },
    status: 200,
  };
}

export async function saveSiteContent(
  data: SiteContentPayload
): Promise<ServiceResult<SiteContentPayload>> {
  await siteContentRepository.upsert(data);
  return { data, status: 200 };
}
