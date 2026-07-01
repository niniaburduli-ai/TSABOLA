'use client'

import type { GalleryImage } from '@/features/gallery/types/gallery.types'

import { TsabolaGalleryCard } from './tsabola-gallery-card'

type Props = {
  images: GalleryImage[]
}

export function TsabolaGalleryGrid({ images }: Props) {
  if (images.length === 0) {
    return <p className="text-center text-charcoal/50 py-24">No gallery images yet.</p>
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {images.map((image) => (
        <TsabolaGalleryCard key={image._id} image={image} />
      ))}
    </div>
  )
}
