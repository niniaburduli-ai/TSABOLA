import { z } from 'zod';

export const GalleryImageSchema = z.object({
  url: z.string().url(),
  publicId: z.string().min(1),
});

export type GalleryImageType = z.infer<typeof GalleryImageSchema>;
