import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/features/translation-queue/repository/translation-queue.repository', () => ({
  translationQueueRepository: {
    upsertPending: vi.fn(),
    findDue: vi.fn(),
    reschedule: vi.fn(),
    deleteById: vi.fn(),
  },
}));
vi.mock('@/features/gallery/repository/gallery.repository', () => ({
  galleryRepository: {
    findById: vi.fn(),
    updateById: vi.fn(),
  },
}));
vi.mock('@/features/tsabola/repository/site-content.repository', () => ({
  siteContentRepository: {
    findOne: vi.fn(),
    upsert: vi.fn(),
  },
}));
vi.mock('@/shared/lib/ai-translator', () => ({
  aiTranslator: { translate: vi.fn() },
}));

import { galleryRepository } from '@/features/gallery/repository/gallery.repository';
import { translationQueueRepository } from '@/features/translation-queue/repository/translation-queue.repository';
import { siteContentRepository } from '@/features/tsabola/repository/site-content.repository';
import { aiTranslator } from '@/shared/lib/ai-translator';

import { enqueueTranslation, processTranslationQueue } from './translation-queue.service';

describe('enqueueTranslation', () => {
  it('upserts a pending queue item', async () => {
    await enqueueTranslation('gallery', 'img1', 'caption', 'ტესტი');
    expect(translationQueueRepository.upsertPending).toHaveBeenCalledWith({
      feature: 'gallery',
      targetId: 'img1',
      path: 'caption',
      sourceKa: 'ტესტი',
    });
  });
});

describe('processTranslationQueue', () => {
  beforeEach(() => {
    vi.mocked(translationQueueRepository.findDue).mockReset();
    vi.mocked(translationQueueRepository.reschedule).mockReset();
    vi.mocked(translationQueueRepository.deleteById).mockReset();
    vi.mocked(galleryRepository.findById).mockReset();
    vi.mocked(galleryRepository.updateById).mockReset();
    vi.mocked(siteContentRepository.findOne).mockReset();
    vi.mocked(siteContentRepository.upsert).mockReset();
    vi.mocked(aiTranslator.translate).mockReset();
  });

  it('applies a gallery translation and removes it from the queue', async () => {
    vi.mocked(translationQueueRepository.findDue).mockResolvedValueOnce([
      { _id: { toString: () => 'q1' }, feature: 'gallery', targetId: 'img1', path: 'caption', sourceKa: 'ტესტი', attempts: 0 },
    ] as never);
    vi.mocked(galleryRepository.findById).mockResolvedValueOnce({ caption: { ka: 'ტესტი', en: '' } } as never);
    vi.mocked(aiTranslator.translate).mockResolvedValueOnce('Test');

    const result = await processTranslationQueue();

    expect(galleryRepository.updateById).toHaveBeenCalledWith('img1', {
      caption: { ka: 'ტესტი', en: 'Test' },
      captionTranslation: { sourceKa: 'ტესტი', autoEn: 'Test' },
    });
    expect(translationQueueRepository.deleteById).toHaveBeenCalledWith('q1');
    expect(result).toEqual({ processed: 1, succeeded: 1, rescheduled: 0, dropped: 0 });
  });

  it('drops a gallery item whose source text moved on since it was queued', async () => {
    vi.mocked(translationQueueRepository.findDue).mockResolvedValueOnce([
      { _id: { toString: () => 'q1' }, feature: 'gallery', targetId: 'img1', path: 'caption', sourceKa: 'ძველი', attempts: 0 },
    ] as never);
    vi.mocked(galleryRepository.findById).mockResolvedValueOnce({ caption: { ka: 'ახალი', en: 'New' } } as never);
    vi.mocked(aiTranslator.translate).mockResolvedValueOnce('Old translated');

    const result = await processTranslationQueue();

    expect(galleryRepository.updateById).not.toHaveBeenCalled();
    expect(translationQueueRepository.deleteById).toHaveBeenCalledWith('q1');
    expect(result.dropped).toBe(1);
  });

  it('reschedules with exponential backoff when translation still fails', async () => {
    vi.mocked(translationQueueRepository.findDue).mockResolvedValueOnce([
      { _id: { toString: () => 'q1' }, feature: 'gallery', targetId: 'img1', path: 'caption', sourceKa: 'ტესტი', attempts: 2 },
    ] as never);
    vi.mocked(aiTranslator.translate).mockResolvedValueOnce(null);

    const result = await processTranslationQueue();

    expect(translationQueueRepository.deleteById).not.toHaveBeenCalled();
    expect(translationQueueRepository.reschedule).toHaveBeenCalledWith('q1', 3, expect.any(Date));
    expect(result).toEqual({ processed: 1, succeeded: 0, rescheduled: 1, dropped: 0 });
  });

  it('applies a site-content translation at a nested path', async () => {
    vi.mocked(translationQueueRepository.findDue).mockResolvedValueOnce([
      { _id: { toString: () => 'q2' }, feature: 'site-content', targetId: 'tsabola', path: 'hero.cta', sourceKa: 'ტესტი', attempts: 0 },
    ] as never);
    vi.mocked(siteContentRepository.findOne).mockResolvedValueOnce({
      content: { hero: { cta: { ka: 'ტესტი', en: '' } } },
      theme: {},
      visibility: {},
      translationMemory: {},
    } as never);
    vi.mocked(aiTranslator.translate).mockResolvedValueOnce('Test');

    const result = await processTranslationQueue();

    expect(siteContentRepository.upsert).toHaveBeenCalledWith({
      content: { hero: { cta: { ka: 'ტესტი', en: 'Test' } } },
      theme: {},
      visibility: {},
      translationMemory: { 'hero.cta': { sourceKa: 'ტესტი', autoEn: 'Test' } },
    });
    expect(translationQueueRepository.deleteById).toHaveBeenCalledWith('q2');
    expect(result.succeeded).toBe(1);
  });
});
