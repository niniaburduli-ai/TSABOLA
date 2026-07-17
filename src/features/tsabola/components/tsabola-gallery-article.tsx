'use client'

import type { GalleryImage } from '@/features/gallery/types/gallery.types'

import { useLang } from '../hooks/use-lang'

type Props = {
  image: GalleryImage
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
}

export function TsabolaGalleryArticle({ image }: Props) {
  const { r } = useLang()
  const caption = r(image.caption)
  const description = r(image.description)

  return (
    <article className="max-w-3xl mx-auto px-6 py-16">
      <p className="text-xs uppercase tracking-widest text-wine mb-3">{formatDate(image.date)}</p>
      {caption && (
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-charcoal dark:text-cream mb-8">{caption}</h1>
      )}

      <div className="flex justify-center bg-cream/30 dark:bg-charcoal/50 rounded mb-10">
        <img src={image.url} alt={caption} className="max-w-full h-auto max-h-screen object-contain" />
      </div>

      {description && (
        <p className="text-charcoal/80 dark:text-cream/80 leading-relaxed whitespace-pre-line">{description}</p>
      )}
    </article>
  )
}
