import mongoose, { Schema, InferSchemaType } from 'mongoose';

const GalleryImageSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    slug: { type: String, default: '' },
    published: { type: Boolean, required: true, default: true },
    date: { type: Date, default: null },
    caption: {
      ka: { type: String, default: '' },
      en: { type: String, default: '' },
    },
    description: {
      ka: { type: String, default: '' },
      en: { type: String, default: '' },
    },
    captionTranslation: {
      sourceKa: { type: String, default: '' },
      autoEn: { type: String, default: '' },
    },
    descriptionTranslation: {
      sourceKa: { type: String, default: '' },
      autoEn: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

export type GalleryImageDocument = InferSchemaType<typeof GalleryImageSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const GalleryImageModel =
  mongoose.models.GalleryImage ||
  mongoose.model('GalleryImage', GalleryImageSchema);
