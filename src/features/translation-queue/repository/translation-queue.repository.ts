import {
  TranslationQueueDocument,
  TranslationQueueModel,
} from '@/features/translation-queue/schema/translation-queue.schema';
import { mongo } from '@/shared/lib/mongo';

export const translationQueueRepository = {
  async upsertPending(data: {
    feature: string;
    targetId: string;
    path: string;
    sourceKa: string;
  }): Promise<void> {
    await mongo.connect();
    const existing = await TranslationQueueModel.findOne({
      feature: data.feature,
      targetId: data.targetId,
      path: data.path,
    }).lean();

    if (existing && (existing as { sourceKa: string }).sourceKa === data.sourceKa) return;

    await TranslationQueueModel.findOneAndUpdate(
      { feature: data.feature, targetId: data.targetId, path: data.path },
      { $set: { sourceKa: data.sourceKa, attempts: 0, nextAttemptAt: new Date() } },
      { upsert: true }
    );
  },

  async findDue(now: Date): Promise<TranslationQueueDocument[]> {
    await mongo.connect();
    return TranslationQueueModel.find({ nextAttemptAt: { $lte: now } }).lean() as Promise<
      TranslationQueueDocument[]
    >;
  },

  async reschedule(id: string, attempts: number, nextAttemptAt: Date): Promise<void> {
    await mongo.connect();
    await TranslationQueueModel.findByIdAndUpdate(id, { $set: { attempts, nextAttemptAt } });
  },

  async deleteById(id: string): Promise<void> {
    await mongo.connect();
    await TranslationQueueModel.findByIdAndDelete(id);
  },
};
