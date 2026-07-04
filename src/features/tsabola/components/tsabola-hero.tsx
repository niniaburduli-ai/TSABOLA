'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'

import { useLang } from '../hooks/use-lang'

const SLIDE_DURATION = 6000

export function TsabolaHero() {
  const { t, r } = useLang()
  const [active, setActive] = useState(0)

  const images = (() => {
    const filtered = (t.hero.images ?? []).filter(Boolean)
    return filtered.length >= 1 ? filtered : ['/TSABO WHITE.png', '/TSABO RED.png']
  })()

  useEffect(() => {
    const id = setInterval(() => {
      setActive(prev => (prev + 1) % images.length)
    }, SLIDE_DURATION)
    return () => clearInterval(id)
  }, [images.length])

  return (
    <section id="hero" className="relative w-full h-96 sm:h-screen overflow-hidden bg-charcoal">
      {/* Image slides — crossfade */}
      {images.map((src, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            i === active ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image
            src={src}
            alt=""
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover hero-img-pos"
          />
        </div>
      ))}

      {/* Bottom vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />

      {/* Text content — bottom center, compact */}
      <div className="absolute bottom-0 left-0 right-0 z-10 flex flex-col items-center text-center px-6 pb-6">
        <p className="animate-rise text-cream/50 text-sm tracking-widest uppercase mb-2 font-heading">
          {r(t.site.name)}
        </p>
        <h1 className="animate-rise animate-rise-1 text-cream text-base sm:text-lg font-heading font-semibold leading-snug mb-1 whitespace-nowrap">
          {r(t.hero.headline)}
        </h1>
        <p className="animate-rise animate-rise-2 text-cream/55 text-xs font-sans leading-relaxed mb-4 max-w-xs">
          {r(t.hero.subline)}
        </p>
        <a
          href="#wines"
          className={[
            'animate-rise animate-rise-3 px-5 py-2 border border-cream/35',
            'text-cream text-xs font-heading tracking-wide pointer-events-auto',
            'hover:bg-cream hover:text-charcoal transition-colors duration-300',
          ].join(' ')}
        >
          {r(t.hero.cta)}
        </a>
      </div>

      {/* Slide indicators — right side, vertical stack */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 z-10 flex flex-col items-center gap-3">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            aria-label={`Go to slide ${i + 1}`}
            className="group flex items-center justify-center px-2 py-1 pointer-events-auto"
          >
            <span
              className={`block w-px transition-all duration-500 ease-in-out ${
                i === active
                  ? 'h-8 bg-white'
                  : 'h-3 bg-white/35 group-hover:bg-white/60'
              }`}
            />
          </button>
        ))}
      </div>

      {/* Scroll cue — bottom-right */}
      <a
        href="#wines"
        className="absolute bottom-6 right-6 z-10 flex flex-col items-center text-white/40 hover:text-white/70 transition-colors duration-300"
        aria-label="Scroll to wines"
      >
        <svg width="12" height="20" viewBox="0 0 14 22" fill="none" className="animate-bounce">
          <path
            d="M7 0v18M1 12l6 6 6-6"
            stroke="currentColor"
            strokeWidth="1.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </a>
    </section>
  )
}
