'use client'

import type { GalleryImage } from '@/features/gallery/types/gallery.types'

import { r } from '../hooks/use-lang'
import { useLanguageStore } from '../store/language-store'

type Props = {
  image: GalleryImage
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
}

export function TsabolaGalleryArticle({ image }: Props) {
  const { lang } = useLanguageStore()
  const caption = r(image.caption, lang)
  const description = r(image.description, lang)

  return (
    <article className="max-w-3xl mx-auto px-6 py-16">
      <p className="text-xs uppercase tracking-widest text-wine/70 mb-3">{formatDate(image.createdAt)}</p>
      {caption && (
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-charcoal mb-8">{caption}</h1>
      )}

      <div className="flex justify-center bg-cream/30 rounded mb-10">
        <img src={image.url} alt={caption} className="max-w-full h-auto max-h-screen object-contain" />
      </div>

      {description && (
        <p className="text-charcoal/80 leading-relaxed whitespace-pre-line">{description}</p>
      )}
    </article>
  )
}
