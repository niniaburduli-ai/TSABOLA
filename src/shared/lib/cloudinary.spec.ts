import { v2 as cloudinary } from 'cloudinary';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('cloudinary', () => ({
  v2: {
    config: vi.fn(),
    uploader: {
      destroy: vi.fn(),
    },
  },
}));

import { CloudinaryManager } from './cloudinary';

describe('CloudinaryManager', () => {
  let manager: CloudinaryManager;

  beforeEach(() => {
    vi.clearAllMocks();
    manager = new CloudinaryManager();
  });

  it('configures cloudinary before destroying an asset', async () => {
    vi.mocked(cloudinary.uploader.destroy).mockResolvedValueOnce({ result: 'ok' } as never);
    await manager.destroy('tsabola/gallery/abc123');
    expect(cloudinary.config).toHaveBeenCalledOnce();
    expect(cloudinary.uploader.destroy).toHaveBeenCalledWith('tsabola/gallery/abc123');
  });

  it('only configures once across multiple calls', async () => {
    vi.mocked(cloudinary.uploader.destroy).mockResolvedValue({ result: 'ok' } as never);
    await manager.destroy('a');
    await manager.destroy('b');
    expect(cloudinary.config).toHaveBeenCalledOnce();
  });
});
