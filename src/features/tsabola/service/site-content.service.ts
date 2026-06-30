import { DEFAULT_CONTENT, DEFAULT_THEME, DEFAULT_VISIBILITY } from '@/features/tsabola/content/site-content';
import { siteContentRepository } from '@/features/tsabola/repository/site-content.repository';
import { ServiceResult } from '@/shared/types/common';

type SiteContentPayload = { content: unknown; theme: unknown; visibility: unknown };

export async function getSiteContent(): Promise<ServiceResult<SiteContentPayload>> {
  const doc = await siteContentRepository.findOne();
  if (!doc) {
    return {
      data: { content: DEFAULT_CONTENT, theme: DEFAULT_THEME, visibility: DEFAULT_VISIBILITY },
      status: 200,
    };
  }
  return { data: { content: doc.content, theme: doc.theme, visibility: doc.visibility }, status: 200 };
}

export async function saveSiteContent(
  data: SiteContentPayload
): Promise<ServiceResult<SiteContentPayload>> {
  await siteContentRepository.upsert(data);
  return { data, status: 200 };
}
