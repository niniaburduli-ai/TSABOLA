'use client'

import Link from 'next/link'

import type { GalleryImage } from '@/features/gallery/types/gallery.types'

import { r } from '../hooks/use-lang'
import { useLanguageStore } from '../store/language-store'

type Props = {
  image: GalleryImage
}

export function TsabolaGalleryCard({ image }: Props) {
  const { lang } = useLanguageStore()
  const caption = r(image.caption, lang)

  return (
    <Link href={`/gallery/${image.slug}`} className="group relative block aspect-square overflow-hidden bg-charcoal/5">
      <img
        src={image.url}
        alt={caption}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-wine/0 group-hover:bg-wine/20 transition-colors duration-300" />
      {caption && (
        <p className="absolute bottom-0 left-0 right-0 p-3 text-xs text-white bg-gradient-to-t from-black/70 to-transparent">
          {caption}
        </p>
      )}
    </Link>
  )
}
