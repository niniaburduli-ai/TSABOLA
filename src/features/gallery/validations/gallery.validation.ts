import { z } from 'zod';

export const GalleryImageSchema = z.object({
  url: z.string().url(),
  publicId: z.string().min(1),
});

export type GalleryImageType = z.infer<typeof GalleryImageSchema>;

export const UpdateGalleryImageSchema = z.object({
  slug: z.string().max(120).optional(),
  published: z.boolean().optional(),
  caption: z.object({ ka: z.string(), en: z.string() }).optional(),
  description: z.object({ ka: z.string(), en: z.string() }).optional(),
  date: z.string().optional(),
});

export type UpdateGalleryImageType = z.infer<typeof UpdateGalleryImageSchema>;
