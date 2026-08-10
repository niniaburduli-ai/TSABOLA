import mongoose, { Schema, InferSchemaType } from 'mongoose';

const WineLikeSchema = new Schema(
  {
    wineId: { type: String, required: true, unique: true },
    count: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

export type WineLikeDocument = InferSchemaType<typeof WineLikeSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const WineLikeModel =
  mongoose.models.WineLike || mongoose.model('WineLike', WineLikeSchema);
