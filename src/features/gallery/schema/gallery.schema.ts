import mongoose, { Schema, InferSchemaType } from 'mongoose';

const GalleryImageSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { timestamps: true }
);

export type GalleryImageDocument = InferSchemaType<typeof GalleryImageSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const GalleryImageModel =
  mongoose.models.GalleryImage ||
  mongoose.model('GalleryImage', GalleryImageSchema);
