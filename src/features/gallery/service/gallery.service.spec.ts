import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/features/gallery/repository/gallery.repository', () => ({
  galleryRepository: {
    findById: vi.fn(),
    updateById: vi.fn(),
  },
}));
vi.mock('@/shared/utils/resolve-bilingual-field', () => ({
  resolveBilingualField: vi.fn(),
}));
vi.mock('@/features/translation-queue/service/translation-queue.service', () => ({
  enqueueTranslation: vi.fn(),
}));

import { galleryRepository } from '@/features/gallery/repository/gallery.repository';
import { enqueueTranslation } from '@/features/translation-queue/service/translation-queue.service';
import { resolveBilingualField } from '@/shared/utils/resolve-bilingual-field';

import { updateGalleryImage } from './gallery.service';

const BASE_DOC = {
  _id: { toString: () => 'abc123' },
  url: 'https://example.com/a.jpg',
  publicId: 'pub-1',
  slug: 'a',
  published: true,
  caption: { ka: 'ka-old', en: 'en-old' },
  description: { ka: 'd-ka', en: 'd-en' },
  captionTranslation: { sourceKa: 'ka-old', autoEn: 'en-old' },
  descriptionTranslation: { sourceKa: 'd-ka', autoEn: 'd-en' },
  createdAt: new Date(),
};

describe('updateGalleryImage', () => {
  beforeEach(() => {
    vi.mocked(galleryRepository.findById).mockReset();
    vi.mocked(galleryRepository.updateById).mockReset();
    vi.mocked(resolveBilingualField).mockReset();
    vi.mocked(enqueueTranslation).mockReset();
  });

  it('resolves caption and description translation before saving', async () => {
    vi.mocked(galleryRepository.findById).mockResolvedValueOnce(BASE_DOC as never);
    vi.mocked(resolveBilingualField)
      .mockResolvedValueOnce({
        value: { ka: 'ka-new', en: 'en-new' },
        memory: { sourceKa: 'ka-new', autoEn: 'en-new' },
        pending: false,
      })
      .mockResolvedValueOnce({
        value: { ka: 'd-ka', en: 'd-en' },
        memory: { sourceKa: 'd-ka', autoEn: 'd-en' },
        pending: false,
      });
    vi.mocked(galleryRepository.updateById).mockResolvedValueOnce({
      ...BASE_DOC,
      caption: { ka: 'ka-new', en: 'en-new' },
    } as never);

    await updateGalleryImage('abc123', { caption: { ka: 'ka-new', en: 'en-old' } });

    expect(resolveBilingualField).toHaveBeenCalledWith(
      { ka: 'ka-new', en: 'en-old' },
      { sourceKa: 'ka-old', autoEn: 'en-old' }
    );
    const updatePayload = vi.mocked(galleryRepository.updateById).mock.calls[0][1];
    expect(updatePayload.caption).toEqual({ ka: 'ka-new', en: 'en-new' });
    expect(updatePayload.captionTranslation).toEqual({ sourceKa: 'ka-new', autoEn: 'en-new' });
  });

  it('enqueues a background retry when translation fails', async () => {
    vi.mocked(galleryRepository.findById).mockResolvedValueOnce(BASE_DOC as never);
    vi.mocked(resolveBilingualField).mockResolvedValueOnce({
      value: { ka: 'ka-new', en: 'en-old' },
      memory: { sourceKa: 'ka-old', autoEn: 'en-old' },
      pending: true,
    });
    vi.mocked(galleryRepository.updateById).mockResolvedValueOnce(BASE_DOC as never);

    await updateGalleryImage('abc123', { caption: { ka: 'ka-new', en: 'en-old' } });

    expect(enqueueTranslation).toHaveBeenCalledWith('gallery', 'abc123', 'caption', 'ka-new');
  });

  it('returns NOT_FOUND when image does not exist', async () => {
    vi.mocked(galleryRepository.findById).mockResolvedValueOnce(null);
    const result = await updateGalleryImage('missing', { slug: 'x' });
    expect(result.status).toBe(404);
  });
});
