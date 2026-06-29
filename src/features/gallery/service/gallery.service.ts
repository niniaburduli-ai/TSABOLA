import { galleryRepository } from '@/features/gallery/repository/gallery.repository';
import { GalleryImageDocument } from '@/features/gallery/schema/gallery.schema';
import { ServiceResult } from '@/shared/types/common';

export async function listGalleryImages(): Promise<ServiceResult<GalleryImageDocument[]>> {
  const images = await galleryRepository.findAll();
  return { data: images, status: 200 };
}

export async function addGalleryImage(
  url: string,
  publicId: string
): Promise<ServiceResult<GalleryImageDocument>> {
  const image = await galleryRepository.create({ url, publicId });
  return { data: image, status: 201 };
}

export async function deleteGalleryImage(id: string): Promise<ServiceResult<null>> {
  await galleryRepository.deleteById(id);
  return { data: null, status: 200 };
}
