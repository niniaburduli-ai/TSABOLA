'use client'

import { useLang } from '../hooks/use-lang'

export function TsabolaGallery() {
  const { t, r } = useLang()

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
            <div key={i} className="relative group overflow-hidden aspect-square">
              {src ? (
                <img src={src} alt="" className="w-full h-full object-cover" />
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
    </section>
  )
}
