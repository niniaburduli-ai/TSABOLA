'use client'

import type { GalleryImage } from '@/features/gallery/types/gallery.types'

import { TsabolaGalleryCard } from './tsabola-gallery-card'
import { useLang } from '../hooks/use-lang'

const NO_GALLERY_LABEL = { ka: 'გალერეის სურათები ჯერ არ არის.', en: 'No gallery images yet.' }

type Props = {
  images: GalleryImage[]
}

export function TsabolaGalleryGrid({ images }: Props) {
  const { r } = useLang()

  if (images.length === 0) {
    return <p className="text-center text-charcoal/50 dark:text-cream/50 py-24">{r(NO_GALLERY_LABEL)}</p>
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {images.map((image) => (
        <TsabolaGalleryCard key={image._id} image={image} />
      ))}
    </div>
  )
}
