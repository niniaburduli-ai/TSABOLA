import { z } from 'zod';

export const SaveSiteContentSchema = z.object({
  content: z.record(z.string(), z.unknown()),
  theme: z.record(z.string(), z.unknown()),
  visibility: z.record(z.string(), z.unknown()),
});

export type SaveSiteContentType = z.infer<typeof SaveSiteContentSchema>;
