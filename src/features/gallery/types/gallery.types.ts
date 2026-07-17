import type { ImageSize } from '@/shared/types/common'

export type GalleryImage = {
  _id: string
  url: string
  publicId: string
  slug: string
  published: boolean
  imageSize: ImageSize
  caption: { ka: string; en: string }
  description: { ka: string; en: string }
  date: string
  createdAt: string
}
