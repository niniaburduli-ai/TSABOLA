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
    news: { title: { ka: '', en: '' }, subtitle: { ka: '', en: '' }, items: [] as unknown[] },
  };

  it('migrates legacy string hero images to objects defaulting to a centered focal point', async () => {
    vi.mocked(siteContentRepository.findOne).mockResolvedValueOnce({
      content: { ...baseContent, hero: { ...baseContent.hero, images: ['/a.jpg', '/b.jpg'] } },
      theme: {},
      visibility: {},
    } as SiteContentDocument);

    const result = await getSiteContent();

    expect((result.data as { content: SiteContent }).content.hero.images).toEqual([
      { src: '/a.jpg', positionMobile: { x: 50, y: 50 }, positionDesktop: { x: 50, y: 50 }, size: 'md' },
      { src: '/b.jpg', positionMobile: { x: 50, y: 50 }, positionDesktop: { x: 50, y: 50 }, size: 'md' },
    ]);
  });

  it('migrates legacy keyword positions to equivalent x/y coordinates', async () => {
    const images = [{ src: '/a.jpg', positionMobile: 'center', positionDesktop: 'bottom', size: 'lg' }];
    vi.mocked(siteContentRepository.findOne).mockResolvedValueOnce({
      content: { ...baseContent, hero: { ...baseContent.hero, images } },
      theme: {},
      visibility: {},
    } as SiteContentDocument);

    const result = await getSiteContent();

    expect((result.data as { content: SiteContent }).content.hero.images).toEqual([
      { src: '/a.jpg', positionMobile: { x: 50, y: 50 }, positionDesktop: { x: 50, y: 100 }, size: 'lg' },
    ]);
  });

  it('leaves already-migrated x/y hero image objects untouched', async () => {
    const images = [
      { src: '/a.jpg', positionMobile: { x: 20, y: 80 }, positionDesktop: { x: 60, y: 10 }, size: 'lg' },
    ];
    vi.mocked(siteContentRepository.findOne).mockResolvedValueOnce({
      content: { ...baseContent, hero: { ...baseContent.hero, images } },
      theme: {},
      visibility: {},
    } as SiteContentDocument);

    const result = await getSiteContent();

    expect((result.data as { content: SiteContent }).content.hero.images).toEqual(images);
  });

  it('defaults size to md when migrating a hero image object missing it', async () => {
    const images = [{ src: '/a.jpg', positionMobile: { x: 30, y: 40 }, positionDesktop: { x: 70, y: 60 } }];
    vi.mocked(siteContentRepository.findOne).mockResolvedValueOnce({
      content: { ...baseContent, hero: { ...baseContent.hero, images } },
      theme: {},
      visibility: {},
    } as SiteContentDocument);

    const result = await getSiteContent();

    expect((result.data as { content: SiteContent }).content.hero.images).toEqual([
      { src: '/a.jpg', positionMobile: { x: 30, y: 40 }, positionDesktop: { x: 70, y: 60 }, size: 'md' },
    ]);
  });

  it('defaults a centered focal point and md size for a wine item missing them', async () => {
    const wine = { id: 'red', name: { ka: '', en: '' }, image: '/red.jpg' };
    vi.mocked(siteContentRepository.findOne).mockResolvedValueOnce({
      content: { ...baseContent, wines: { items: [wine] } },
      theme: {},
      visibility: {},
    } as SiteContentDocument);

    const result = await getSiteContent();

    const item = (result.data as { content: SiteContent }).content.wines.items[0];
    expect(item.imageSize).toBe('md');
    expect(item.position).toEqual({ x: 50, y: 50 });
  });

  it('defaults a centered focal point and md size for a news item missing them', async () => {
    const item = { id: 'news-1', title: { ka: '', en: '' }, image: '/n.jpg' };
    vi.mocked(siteContentRepository.findOne).mockResolvedValueOnce({
      content: { ...baseContent, news: { ...baseContent.news, items: [item] } },
      theme: {},
      visibility: {},
    } as SiteContentDocument);

    const result = await getSiteContent();

    const normalized = (result.data as { content: SiteContent }).content.news.items[0];
    expect(normalized.imageSize).toBe('md');
    expect(normalized.position).toEqual({ x: 50, y: 50 });
  });

  it('defaults a centered focal point for the about section when missing', async () => {
    vi.mocked(siteContentRepository.findOne).mockResolvedValueOnce({
      content: { ...baseContent, about: { image: '/about.jpg' } },
      theme: {},
      visibility: {},
    } as SiteContentDocument);

    const result = await getSiteContent();

    expect((result.data as { content: SiteContent }).content.about.position).toEqual({ x: 50, y: 50 });
  });

  it('migrates legacy string gallery images to objects defaulting to a centered focal point', async () => {
    vi.mocked(siteContentRepository.findOne).mockResolvedValueOnce({
      content: { ...baseContent, gallery: { images: ['/g1.jpg', '/g2.jpg'] } },
      theme: {},
      visibility: {},
    } as SiteContentDocument);

    const result = await getSiteContent();

    expect((result.data as { content: SiteContent }).content.gallery.images).toEqual([
      { src: '/g1.jpg', position: { x: 50, y: 50 } },
      { src: '/g2.jpg', position: { x: 50, y: 50 } },
    ]);
  });
});
