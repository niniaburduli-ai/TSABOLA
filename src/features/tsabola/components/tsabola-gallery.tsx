'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import type { GalleryImage } from '@/features/gallery/types/gallery.types'

import { TsabolaGalleryCard } from './tsabola-gallery-card'
import { TsabolaLightbox } from './tsabola-lightbox'
import { useLang } from '../hooks/use-lang'
import { useTextStyle } from '../hooks/use-text-style'

const ALL_GALLERY_LABEL = { ka: 'სრული გალერეა', en: 'All Gallery' }

type Props = {
  initialImages: GalleryImage[]
}

export function TsabolaGallery({ initialImages }: Props) {
  const { t, r } = useLang()
  const eyebrowStyle = useTextStyle('gallery', 'eyebrow')
  const headingStyle = useTextStyle('gallery', 'heading')
  const staticImages = t.gallery.images.filter((image) => Boolean(image.src))
  const [dbImages, setDbImages] = useState<GalleryImage[]>(initialImages)
  const [activeIndex, setActiveIndex] = useState(-1)

  useEffect(() => {
    fetch('/api/gallery')
      .then((res) => res.json())
      .then((data: GalleryImage[]) => {
        if (Array.isArray(data)) setDbImages(data)
      })
      .catch(() => {})
  }, [])

  const publishedImages = dbImages.filter((img) => img.published)
  const durationClass = `gallery-carousel-dur-${Math.min(Math.max(publishedImages.length, 1), 10)}`

  function close() { setActiveIndex(-1) }
  function prev() { setActiveIndex((i) => (i - 1 + staticImages.length) % staticImages.length) }
  function next() { setActiveIndex((i) => (i + 1) % staticImages.length) }

  return (
    <section id="gallery" className="bg-white dark:bg-charcoal py-16 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-10">
          <p style={eyebrowStyle.style} className={`font-semibold tracking-widest uppercase text-wine mb-3 ${eyebrowStyle.className}`}>
            {r(t.gallery.subtitle)}
          </p>
          <h2 style={headingStyle.style} className={`font-display font-bold text-charcoal dark:text-cream ${headingStyle.className}`}>
            {r(t.gallery.title)}
          </h2>
          <div className="w-12 h-0.5 bg-wine mx-auto mt-6" />
        </div>

        {publishedImages.length > 0 && (
          <div className="flex justify-center mb-12">
            <Link
              href="/gallery"
              className={[
                'px-5 py-2 border border-wine text-wine text-sm font-heading tracking-wide',
                'hover:bg-wine hover:text-white transition-colors duration-300',
              ].join(' ')}
            >
              {r(ALL_GALLERY_LABEL)}
            </Link>
          </div>
        )}

        {publishedImages.length === 0 && (
          <div className="grid grid-cols-3 gap-2">
            {staticImages.map((image, i) => (
              <div
                key={i}
                className="relative aspect-square overflow-hidden cursor-zoom-in group"
                onClick={() => setActiveIndex(i)}
              >
                <img
                  src={image.src}
                  alt=""
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  // Continuous focal point (0-100%) has no static Tailwind utility — inline style is the only way to express it.
                  style={{ objectPosition: `${image.position.x}% ${image.position.y}%` }}
                />
                <div className="absolute inset-0 bg-wine/0 group-hover:bg-wine/20 transition-colors duration-300" />
              </div>
            ))}
          </div>
        )}
      </div>

      {publishedImages.length > 0 && (
        <div className="relative">
          <div className="absolute inset-y-0 left-0 w-16 sm:w-24 z-10 bg-gradient-to-r from-white dark:from-charcoal to-transparent pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-16 sm:w-24 z-10 bg-gradient-to-l from-white dark:from-charcoal to-transparent pointer-events-none" />

          <div className="overflow-hidden">
            <div className={`flex gap-2 w-max animate-gallery-scroll ${durationClass}`}>
              {[...publishedImages, ...publishedImages].map((image, i) => (
                <div key={`${image._id}-${i}`} className="flex-shrink-0 w-64 sm:w-80">
                  <TsabolaGalleryCard image={image} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeIndex !== -1 && (
        <TsabolaLightbox
          images={staticImages.map((image) => image.src)}
          index={activeIndex}
          onClose={close}
          onPrev={prev}
          onNext={next}
        />
      )}
    </section>
  )
}
