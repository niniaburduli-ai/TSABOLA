import { GalleryImageDocument, GalleryImageModel } from '@/features/gallery/schema/gallery.schema';
import { mongo } from '@/shared/lib/mongo';

export const galleryRepository = {
  async findAll(): Promise<GalleryImageDocument[]> {
    await mongo.connect();
    return GalleryImageModel.find().sort({ createdAt: -1 }).lean() as Promise<GalleryImageDocument[]>;
  },

  async create(data: { url: string; publicId: string }): Promise<GalleryImageDocument> {
    await mongo.connect();
    const doc = await GalleryImageModel.create(data);
    return doc;
  },

  async deleteById(id: string): Promise<void> {
    await mongo.connect();
    await GalleryImageModel.findByIdAndDelete(id);
  },
};
