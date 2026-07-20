'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import type { GalleryImage } from '@/features/gallery/types/gallery.types'

import { useLang } from '../hooks/use-lang'
import { useTextStyle } from '../hooks/use-text-style'

export type GalleryNavTarget = { slug: string; caption: GalleryImage['caption'] }

type Props = {
  image: GalleryImage
  prev: GalleryNavTarget | null
  next: GalleryNavTarget | null
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
}

export function TsabolaGalleryArticle({ image, prev, next }: Props) {
  const { r } = useLang()
  const router = useRouter()
  const dateStyle = useTextStyle('gallery', 'date')
  const captionStyle = useTextStyle('gallery', 'articleCaption')
  const descriptionStyle = useTextStyle('gallery', 'articleDescription')
  const caption = r(image.caption)
  const description = r(image.description)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && next) router.push(`/gallery/${next.slug}`)
      if (e.key === 'ArrowLeft' && prev) router.push(`/gallery/${prev.slug}`)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [prev, next, router])

  return (
    <article className="max-w-3xl mx-auto px-6 py-16">
      <p
        style={dateStyle.style}
        suppressHydrationWarning
        className={`uppercase tracking-widest text-wine mb-3 ${dateStyle.className}`}
      >
        {formatDate(image.date)}
      </p>
      {caption && (
        <h1
          style={captionStyle.style} suppressHydrationWarning
          className={`font-display font-bold text-charcoal dark:text-cream mb-8 ${captionStyle.className}`}
        >
          {caption}
        </h1>
      )}

      <div className="relative flex justify-center bg-cream/30 dark:bg-charcoal/50 rounded mb-10">
        <img src={image.url} alt={caption} className="max-w-full h-auto max-h-screen object-contain" />
        {prev && (
          <Link
            href={`/gallery/${prev.slug}`}
            aria-label={r(prev.caption) || 'Previous photo'}
            className={[
              'absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full border',
              'border-charcoal/20 dark:border-cream/20 bg-white/90 dark:bg-charcoal/90',
              'text-charcoal dark:text-cream flex items-center justify-center',
              'hover:bg-wine hover:text-white hover:border-wine transition-colors duration-300',
            ].join(' ')}
          >
            ←
          </Link>
        )}
        {next && (
          <Link
            href={`/gallery/${next.slug}`}
            aria-label={r(next.caption) || 'Next photo'}
            className={[
              'absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full border',
              'border-charcoal/20 dark:border-cream/20 bg-white/90 dark:bg-charcoal/90',
              'text-charcoal dark:text-cream flex items-center justify-center',
              'hover:bg-wine hover:text-white hover:border-wine transition-colors duration-300',
            ].join(' ')}
          >
            →
          </Link>
        )}
      </div>

      {description && (
        <p
          style={descriptionStyle.style} suppressHydrationWarning
          className={`text-charcoal/80 dark:text-cream/80 leading-relaxed whitespace-pre-line ${descriptionStyle.className}`}
        >
          {description}
        </p>
      )}
    </article>
  )
}
