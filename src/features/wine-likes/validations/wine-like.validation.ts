import { z } from 'zod';

export const ToggleLikeSchema = z.object({ liked: z.boolean() });
export type ToggleLikeType = z.infer<typeof ToggleLikeSchema>;
