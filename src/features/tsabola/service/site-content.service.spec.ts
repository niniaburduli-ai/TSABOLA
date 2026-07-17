import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/features/tsabola/repository/site-content.repository', () => ({
  siteContentRepository: {
    findOne: vi.fn(),
    upsert: vi.fn(),
  },
}));
vi.mock('@/features/translation-queue/service/translation-queue.service', () => ({
  enqueueTranslation: vi.fn(),
}));
vi.mock('@/shared/utils/resolve-bilingual-field', () => ({
  resolveBilingualField: vi.fn(),
}));

import { enqueueTranslation } from '@/features/translation-queue/service/translation-queue.service';
import { siteContentRepository } from '@/features/tsabola/repository/site-content.repository';
import type { SiteContentDocument } from '@/features/tsabola/schema/site-content.schema';
import type { SiteContent } from '@/features/tsabola/types';
import { resolveBilingualField } from '@/shared/utils/resolve-bilingual-field';

import { getSiteContent, saveSiteContent } from './site-content.service';

describe('saveSiteContent', () => {
  beforeEach(() => {
    vi.mocked(siteContentRepository.findOne).mockReset();
    vi.mocked(siteContentRepository.upsert).mockReset();
    vi.mocked(resolveBilingualField).mockReset();
    vi.mocked(enqueueTranslation).mockReset();
  });

  it('enqueues a background retry for each field left untranslated', async () => {
    vi.mocked(siteContentRepository.findOne).mockResolvedValueOnce(null);
    vi.mocked(resolveBilingualField).mockResolvedValue({
      value: { ka: 'ტესტი', en: '' },
      memory: { sourceKa: '', autoEn: '' },
      pending: true,
    });

    await saveSiteContent({
      content: { hero: { cta: { ka: 'ტესტი', en: '' } } },
      theme: {},
      visibility: {},
    });

    expect(enqueueTranslation).toHaveBeenCalledWith('site-content', 'tsabola', 'hero.cta', 'ტესტი');
  });

  it('does not enqueue anything when nothing is pending', async () => {
    vi.mocked(siteContentRepository.findOne).mockResolvedValueOnce(null);
    vi.mocked(resolveBilingualField).mockResolvedValue({
      value: { ka: 'ტესტი', en: 'Test' },
      memory: { sourceKa: 'ტესტი', autoEn: 'Test' },
      pending: false,
    });

    await saveSiteContent({
      content: { hero: { cta: { ka: 'ტესტი', en: 'Test' } } },
      theme: {},
      visibility: {},
    });

    expect(enqueueTranslation).not.toHaveBeenCalled();
  });
});

describe('getSiteContent', () => {
  beforeEach(() => {
    vi.mocked(siteContentRepository.findOne).mockReset();
  });

  const baseContent = {
    hero: { headline: { ka: '', en: '' }, subline: { ka: '', en: '' }, cta: { ka: '', en: '' }, images: [] as unknown[] },
    news: { title: { ka: '', en: '' }, subtitle: { ka: '', en: '' }, items: [] },
  };

  it('migrates legacy string hero images to objects defaulting to top/top', async () => {
    vi.mocked(siteContentRepository.findOne).mockResolvedValueOnce({
      content: { ...baseContent, hero: { ...baseContent.hero, images: ['/a.jpg', '/b.jpg'] } },
      theme: {},
      visibility: {},
    } as SiteContentDocument);

    const result = await getSiteContent();

    expect((result.data as { content: SiteContent }).content.hero.images).toEqual([
      { src: '/a.jpg', positionMobile: 'top', positionDesktop: 'top' },
      { src: '/b.jpg', positionMobile: 'top', positionDesktop: 'top' },
    ]);
  });

  it('leaves already-migrated hero image objects untouched', async () => {
    const images = [{ src: '/a.jpg', positionMobile: 'center', positionDesktop: 'bottom' }];
    vi.mocked(siteContentRepository.findOne).mockResolvedValueOnce({
      content: { ...baseContent, hero: { ...baseContent.hero, images } },
      theme: {},
      visibility: {},
    } as SiteContentDocument);

    const result = await getSiteContent();

    expect((result.data as { content: SiteContent }).content.hero.images).toEqual(images);
  });
});
