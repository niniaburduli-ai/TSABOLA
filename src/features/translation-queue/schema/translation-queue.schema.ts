import mongoose, { Schema, InferSchemaType } from 'mongoose';

const TranslationQueueSchema = new Schema(
  {
    feature: { type: String, required: true },
    targetId: { type: String, required: true },
    path: { type: String, required: true },
    sourceKa: { type: String, required: true },
    attempts: { type: Number, required: true, default: 0 },
    nextAttemptAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true }
);

export type TranslationQueueDocument = InferSchemaType<typeof TranslationQueueSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const TranslationQueueModel =
  mongoose.models.TranslationQueue ||
  mongoose.model('TranslationQueue', TranslationQueueSchema);
