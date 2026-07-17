import type { HeadingSizeScale } from '@/features/tsabola/types'

export const HEADING_SIZE_LABEL: Record<HeadingSizeScale, string> = {
  xs: 'ძალიან პატარა',
  sm: 'პატარა',
  md: 'საშუალო',
  lg: 'დიდი',
  xl: 'ძალიან დიდი',
}

export const HEADING_SIZE_OPTIONS: HeadingSizeScale[] = ['xs', 'sm', 'md', 'lg', 'xl']

// "md" always reproduces an element's original hardcoded size (multiplier 1) — nothing
// shifts until an admin picks a different tier.
export const HEADING_SIZE_MULTIPLIER: Record<HeadingSizeScale, number> = {
  xs: 0.75,
  sm: 0.875,
  md: 1,
  lg: 1.25,
  xl: 1.5,
}
