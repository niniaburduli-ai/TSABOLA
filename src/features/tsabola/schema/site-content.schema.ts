import mongoose, { Schema, InferSchemaType } from 'mongoose';

const SiteContentDocSchema = new Schema(
  {
    siteName: { type: String, required: true, unique: true, default: 'tsabola' },
    content: { type: Schema.Types.Mixed, required: true },
    theme: { type: Schema.Types.Mixed, required: true },
    visibility: { type: Schema.Types.Mixed, required: true },
    translationMemory: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export type SiteContentDocument = InferSchemaType<typeof SiteContentDocSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const SiteContentModel =
  mongoose.models.SiteContent ||
  mongoose.model('SiteContent', SiteContentDocSchema);
