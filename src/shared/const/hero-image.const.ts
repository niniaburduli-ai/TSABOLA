import type { ImageSize } from '@/shared/types/common'

export type HeroPosition = { x: number; y: number }

export const DEFAULT_HERO_POSITION: HeroPosition = { x: 50, y: 50 }

// Legacy discrete positions, kept only so previously-saved content (which stored
// one of these 9 keywords) migrates to an equivalent continuous x/y on read.
export const LEGACY_HERO_POSITION: Record<string, HeroPosition> = {
  top: { x: 50, y: 0 },
  bottom: { x: 50, y: 100 },
  left: { x: 0, y: 50 },
  right: { x: 100, y: 50 },
  center: { x: 50, y: 50 },
  'top-left': { x: 0, y: 0 },
  'top-right': { x: 100, y: 0 },
  'bottom-left': { x: 0, y: 100 },
  'bottom-right': { x: 100, y: 100 },
}

// Zoom must never go below 100 — an object-cover image already fills its box,
// so shrinking it (e.g. scale-90) pulls it away from the edges and reveals gaps.
export const HERO_ZOOM_CLASS: Record<ImageSize, string> = {
  sm: 'scale-100',
  md: 'scale-110',
  lg: 'scale-125',
}

export const HERO_ZOOM_LABEL: Record<ImageSize, string> = {
  sm: 'ორიგინალი (100%)',
  md: 'გადიდებული (110%)',
  lg: 'მაქსიმალური (125%)',
}
