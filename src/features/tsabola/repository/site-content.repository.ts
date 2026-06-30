import {
  SiteContentDocument,
  SiteContentModel,
} from '@/features/tsabola/schema/site-content.schema';
import { mongo } from '@/shared/lib/mongo';

type UpsertPayload = { content: unknown; theme: unknown; visibility: unknown };

export const siteContentRepository = {
  async findOne(): Promise<SiteContentDocument | null> {
    await mongo.connect();
    return SiteContentModel.findOne({ siteName: 'tsabola' }).lean() as Promise<SiteContentDocument | null>;
  },

  async upsert(data: UpsertPayload): Promise<SiteContentDocument> {
    await mongo.connect();
    const doc = await SiteContentModel.findOneAndUpdate(
      { siteName: 'tsabola' },
      { $set: { ...data, siteName: 'tsabola' } },
      { upsert: true, new: true }
    );
    return doc;
  },
};
