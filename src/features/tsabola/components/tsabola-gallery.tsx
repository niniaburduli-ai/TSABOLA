'use client'

import { useEffect, useState } from 'react'

import { TsabolaLightbox } from './tsabola-lightbox'
import { useLang } from '../hooks/use-lang'

export function TsabolaGallery() {
  const { t, r } = useLang()
  const staticImages = t.gallery.images.filter(Boolean)
  const [images, setImages] = useState<string[]>(staticImages)
  const [activeIndex, setActiveIndex] = useState(-1)

  useEffect(() => {
    fetch('/api/gallery')
      .then((res) => res.json())
      .then((data: { url: string }[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setImages(data.map((d) => d.url))
        }
      })
      .catch(() => {})
  }, [])

  const looped = [...images, ...images]

  function openImage(src: string) {
    const idx = images.indexOf(src)
    if (idx !== -1) setActiveIndex(idx)
  }

  function close() { setActiveIndex(-1) }
  function prev() { setActiveIndex(i => (i - 1 + images.length) % images.length) }
  function next() { setActiveIndex(i => (i + 1) % images.length) }

  return (
    <section id="gallery" className="bg-white py-24 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold tracking-widest uppercase text-wine/70 mb-3">{r(t.gallery.subtitle)}</p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-charcoal">{r(t.gallery.title)}</h2>
          <div className="w-12 h-0.5 bg-wine mx-auto mt-6" />
        </div>
      </div>

      <div className="overflow-hidden">
        <div className="flex animate-hero-scroll hero-carousel-dur-4">
          {looped.map((src, i) => (
            <div
              key={i}
              className="flex-shrink-0 relative h-72 w-72 sm:h-80 sm:w-80 mr-4 overflow-hidden cursor-zoom-in group"
              onClick={() => openImage(src)}
            >
              <img
                src={src}
                alt=""
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-wine/0 group-hover:bg-wine/20 transition-colors duration-300" />
            </div>
          ))}
        </div>
      </div>

      {activeIndex !== -1 && (
        <TsabolaLightbox
          images={images}
          index={activeIndex}
          onClose={close}
          onPrev={prev}
          onNext={next}
        />
      )}
    </section>
  )
}
