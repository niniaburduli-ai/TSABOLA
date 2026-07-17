import { galleryRepository } from '@/features/gallery/repository/gallery.repository';
import { GalleryImageDocument } from '@/features/gallery/schema/gallery.schema';
import { GalleryImage } from '@/features/gallery/types/gallery.types';
import { UpdateGalleryImageType } from '@/features/gallery/validations/gallery.validation';
import { enqueueTranslation } from '@/features/translation-queue/service/translation-queue.service';
import { ServiceResult } from '@/shared/types/common';
import { resolveBilingualField } from '@/shared/utils/resolve-bilingual-field';
import { slugify } from '@/shared/utils/slugify';

function toGalleryImage(image: GalleryImageDocument): GalleryImage {
  const caption = image.caption ?? { ka: '', en: '' };
  const fallbackSlug = slugify(caption.en ?? '') || slugify(caption.ka ?? '') || image._id.toString();

  return {
    _id: image._id.toString(),
    url: image.url,
    publicId: image.publicId,
    slug: image.slug || fallbackSlug,
    published: image.published ?? true,
    imageSize: image.imageSize ?? 'md',
    caption: { ka: caption.ka ?? '', en: caption.en ?? '' },
    description: { ka: image.description?.ka ?? '', en: image.description?.en ?? '' },
    date: new Date(image.date ?? image.createdAt ?? Date.now()).toISOString(),
    createdAt: new Date(image.createdAt ?? Date.now()).toISOString(),
  };
}

export async function listGalleryImages(): Promise<ServiceResult<GalleryImage[]>> {
  const images = await galleryRepository.findAll();
  return { data: images.map(toGalleryImage), status: 200 };
}

export async function listPublishedGalleryImages(): Promise<ServiceResult<GalleryImage[]>> {
  const result = await listGalleryImages();
  if ('error' in result.data) return { data: [], status: result.status };

  return { data: result.data.filter((image) => image.published), status: 200 };
}

export async function getGalleryImageBySlugService(slug: string): Promise<ServiceResult<GalleryImage>> {
  const result = await listPublishedGalleryImages();
  if ('error' in result.data) return { data: { error: 'NOT_FOUND' }, status: 404 };

  const image = result.data.find((img) => img.slug === slug);
  if (!image) return { data: { error: 'NOT_FOUND' }, status: 404 };

  return { data: image, status: 200 };
}

export async function addGalleryImage(
  url: string,
  publicId: string
): Promise<ServiceResult<GalleryImage>> {
  const image = await galleryRepository.create({ url, publicId });
  return { data: toGalleryImage(image), status: 201 };
}

export async function updateGalleryImage(
  id: string,
  data: UpdateGalleryImageType
): Promise<ServiceResult<GalleryImage>> {
  const existing = await galleryRepository.findById(id);
  if (!existing) return { data: { error: 'NOT_FOUND' }, status: 404 };

  const { date, ...rest } = data;
  const updates: Partial<GalleryImageDocument> = { ...rest };
  if (date) updates.date = new Date(date);

  if (data.caption) {
    const resolved = await resolveBilingualField(data.caption, existing.captionTranslation ?? undefined);
    updates.caption = resolved.value;
    updates.captionTranslation = resolved.memory;
    if (resolved.pending) await enqueueTranslation('gallery', id, 'caption', resolved.value.ka);
  }

  if (data.description) {
    const resolved = await resolveBilingualField(data.description, existing.descriptionTranslation ?? undefined);
    updates.description = resolved.value;
    updates.descriptionTranslation = resolved.memory;
    if (resolved.pending) await enqueueTranslation('gallery', id, 'description', resolved.value.ka);
  }

  const image = await galleryRepository.updateById(id, updates);
  if (!image) return { data: { error: 'NOT_FOUND' }, status: 404 };

  return { data: toGalleryImage(image), status: 200 };
}

export async function deleteGalleryImage(id: string): Promise<ServiceResult<null>> {
  await galleryRepository.deleteById(id);
  return { data: null, status: 200 };
}
