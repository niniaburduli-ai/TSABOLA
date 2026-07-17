import type { ImageSize } from '@/shared/types/common'

export const IMAGE_SIZE_SCALE_CLASS: Record<ImageSize, string> = {
  sm: 'scale-90',
  md: 'scale-100',
  lg: 'scale-110',
}

export const IMAGE_SIZE_LABEL: Record<ImageSize, string> = {
  sm: 'პატარა',
  md: 'საშუალო',
  lg: 'დიდი',
}

export const IMAGE_SIZE_OPTIONS: ImageSize[] = ['sm', 'md', 'lg']
