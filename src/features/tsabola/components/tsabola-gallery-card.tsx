'use client'

import Link from 'next/link'

import type { GalleryImage } from '@/features/gallery/types/gallery.types'
import { IMAGE_SIZE_SCALE_CLASS } from '@/shared/const/image-size.const'

import { useLang } from '../hooks/use-lang'
import { useTextStyle } from '../hooks/use-text-style'

type Props = {
  image: GalleryImage
}

export function TsabolaGalleryCard({ image }: Props) {
  const { r } = useLang()
  const captionStyle = useTextStyle('gallery', 'caption')
  const caption = r(image.caption)

  return (
    <Link href={`/gallery/${image.slug}`} className="group relative block aspect-square overflow-hidden bg-charcoal/5">
      <img
        src={image.url}
        alt={caption}
        className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${IMAGE_SIZE_SCALE_CLASS[image.imageSize]}`}
        // Continuous focal point (0-100%) has no static Tailwind utility — inline style is the only way to express it.
        style={{ objectPosition: `${image.position.x}% ${image.position.y}%` }}
      />
      <div className="absolute inset-0 bg-wine/0 group-hover:bg-wine/20 transition-colors duration-300" />
      {caption && (
        <p
          style={captionStyle.style} suppressHydrationWarning
          className={`absolute bottom-0 left-0 right-0 p-3 text-white bg-gradient-to-t from-black/70 to-transparent ${captionStyle.className}`}
        >
          {caption}
        </p>
      )}
    </Link>
  )
}
