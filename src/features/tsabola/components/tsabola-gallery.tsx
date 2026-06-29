'use client'

import { useState } from 'react'

import { TsabolaLightbox } from './tsabola-lightbox'
import { useLang } from '../hooks/use-lang'

export function TsabolaGallery() {
  const { t, r } = useLang()
  const validImages = t.gallery.images.filter(Boolean)
  const [activeIndex, setActiveIndex] = useState(-1)

  function openImage(src: string) {
    const idx = validImages.indexOf(src)
    if (idx !== -1) setActiveIndex(idx)
  }

  function close() { setActiveIndex(-1) }
  function prev() { setActiveIndex(i => (i - 1 + validImages.length) % validImages.length) }
  function next() { setActiveIndex(i => (i + 1) % validImages.length) }

  return (
    <section id="gallery" className="bg-white py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold tracking-widest uppercase text-wine/70 mb-3">{r(t.gallery.subtitle)}</p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-charcoal">{r(t.gallery.title)}</h2>
          <div className="w-12 h-0.5 bg-wine mx-auto mt-6" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {t.gallery.images.map((src, i) => (
            <div
              key={i}
              className={`relative group overflow-hidden aspect-square${src ? ' cursor-zoom-in' : ''}`}
              onClick={() => src && openImage(src)}
            >
              {src ? (
                <img
                  src={src}
                  alt=""
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div
                  data-placeholder="true"
                  className="w-full h-full bg-gradient-to-br from-wine/15 via-cream to-charcoal/20"
                />
              )}
              <div className="absolute inset-0 bg-wine/0 group-hover:bg-wine/20 transition-colors duration-300" />
            </div>
          ))}
        </div>
      </div>

      {activeIndex !== -1 && (
        <TsabolaLightbox
          images={validImages}
          index={activeIndex}
          onClose={close}
          onPrev={prev}
          onNext={next}
        />
      )}
    </section>
  )
}
