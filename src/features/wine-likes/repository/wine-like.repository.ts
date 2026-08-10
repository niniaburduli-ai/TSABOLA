import { WineLikeDocument, WineLikeModel } from '@/features/wine-likes/schema/wine-like.schema';
import { mongo } from '@/shared/lib/mongo';

export const wineLikeRepository = {
  async incrementLike(wineId: string): Promise<WineLikeDocument> {
    await mongo.connect();
    return WineLikeModel.findOneAndUpdate(
      { wineId },
      { $inc: { count: 1 } },
      { upsert: true, new: true }
    ).lean() as Promise<WineLikeDocument>;
  },

  async decrementLike(wineId: string): Promise<WineLikeDocument | null> {
    await mongo.connect();
    return WineLikeModel.findOneAndUpdate(
      { wineId, count: { $gt: 0 } },
      { $inc: { count: -1 } },
      { new: true }
    ).lean() as Promise<WineLikeDocument | null>;
  },

  async getCounts(): Promise<WineLikeDocument[]> {
    await mongo.connect();
    return WineLikeModel.find().lean() as Promise<WineLikeDocument[]>;
  },

  async getAllSorted(): Promise<WineLikeDocument[]> {
    await mongo.connect();
    return WineLikeModel.find().sort({ count: -1 }).lean() as Promise<WineLikeDocument[]>;
  },
};
