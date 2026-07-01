import { galleryRepository } from '@/features/gallery/repository/gallery.repository';
import { GalleryImageDocument } from '@/features/gallery/schema/gallery.schema';
import { GalleryImage } from '@/features/gallery/types/gallery.types';
import { UpdateGalleryImageType } from '@/features/gallery/validations/gallery.validation';
import { ServiceResult } from '@/shared/types/common';
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
    caption: { ka: caption.ka ?? '', en: caption.en ?? '' },
    description: { ka: image.description?.ka ?? '', en: image.description?.en ?? '' },
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
  const image = await galleryRepository.updateById(id, data);
  if (!image) return { data: { error: 'NOT_FOUND' }, status: 404 };

  return { data: toGalleryImage(image), status: 200 };
}

export async function deleteGalleryImage(id: string): Promise<ServiceResult<null>> {
  await galleryRepository.deleteById(id);
  return { data: null, status: 200 };
}
