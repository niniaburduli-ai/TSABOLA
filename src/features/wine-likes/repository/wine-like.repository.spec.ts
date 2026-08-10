import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/shared/lib/mongo', () => ({
  mongo: { connect: vi.fn() },
}));

vi.mock('@/features/wine-likes/schema/wine-like.schema', () => ({
  WineLikeModel: {
    findOneAndUpdate: vi.fn(),
    find: vi.fn(),
  },
}));

import { WineLikeModel } from '@/features/wine-likes/schema/wine-like.schema';
import { mongo } from '@/shared/lib/mongo';

import { wineLikeRepository } from './wine-like.repository';

const mockMongo = vi.mocked(mongo);
const mockModel = vi.mocked(WineLikeModel);

function makeLeanQuery<T>(result: T) {
  return { lean: () => Promise.resolve(result) };
}

describe('wineLikeRepository', () => {
  beforeEach(() => vi.clearAllMocks());

  it('incrementLike connects and upserts with $inc', async () => {
    (mockModel.findOneAndUpdate as ReturnType<typeof vi.fn>).mockReturnValueOnce(
      makeLeanQuery({ wineId: 'wine-1', count: 1 })
    );
    const result = await wineLikeRepository.incrementLike('wine-1');
    expect(mockMongo.connect).toHaveBeenCalled();
    expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(
      { wineId: 'wine-1' },
      { $inc: { count: 1 } },
      { upsert: true, new: true }
    );
    expect(result).toEqual({ wineId: 'wine-1', count: 1 });
  });

  it('decrementLike only matches docs with count > 0', async () => {
    (mockModel.findOneAndUpdate as ReturnType<typeof vi.fn>).mockReturnValueOnce(
      makeLeanQuery({ wineId: 'wine-1', count: 0 })
    );
    const result = await wineLikeRepository.decrementLike('wine-1');
    expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(
      { wineId: 'wine-1', count: { $gt: 0 } },
      { $inc: { count: -1 } },
      { new: true }
    );
    expect(result).toEqual({ wineId: 'wine-1', count: 0 });
  });

  it('decrementLike returns null when the wine has no likes yet', async () => {
    (mockModel.findOneAndUpdate as ReturnType<typeof vi.fn>).mockReturnValueOnce(makeLeanQuery(null));
    const result = await wineLikeRepository.decrementLike('wine-2');
    expect(result).toBeNull();
  });

  it('getCounts returns all like docs', async () => {
    (mockModel.find as ReturnType<typeof vi.fn>).mockReturnValueOnce(
      makeLeanQuery([{ wineId: 'wine-1', count: 3 }])
    );
    const result = await wineLikeRepository.getCounts();
    expect(result).toEqual([{ wineId: 'wine-1', count: 3 }]);
  });

  it('getAllSorted sorts by count descending', async () => {
    const sort = vi.fn().mockReturnValue(makeLeanQuery([{ wineId: 'wine-2', count: 5 }]));
    (mockModel.find as ReturnType<typeof vi.fn>).mockReturnValueOnce({ sort });
    const result = await wineLikeRepository.getAllSorted();
    expect(sort).toHaveBeenCalledWith({ count: -1 });
    expect(result).toEqual([{ wineId: 'wine-2', count: 5 }]);
  });
});
