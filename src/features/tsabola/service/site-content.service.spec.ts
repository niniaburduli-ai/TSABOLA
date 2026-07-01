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
import { resolveBilingualField } from '@/shared/utils/resolve-bilingual-field';

import { saveSiteContent } from './site-content.service';

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
