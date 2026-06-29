'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'

import { useLang } from '../hooks/use-lang'

const SLIDE_DURATION = 6000

export function TsabolaHero() {
  const { t } = useLang()
  const [active, setActive] = useState(0)

  const images = t.hero.images?.length >= 2
    ? t.hero.images
    : ['/TSABO WHITE.png', '/TSABO RED.png']

  useEffect(() => {
    const id = setInterval(() => {
      setActive(prev => (prev + 1) % images.length)
    }, SLIDE_DURATION)
    return () => clearInterval(id)
  }, [images.length])

  return (
    <section id="hero" className="relative w-full h-screen overflow-hidden">
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
            className="object-cover object-top"
          />
        </div>
      ))}

      {/* Bottom vignette — dot indicators */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 z-10 flex flex-col items-center pb-10 gap-4">
        {/* Slide progress indicators */}
        <div className="flex items-center gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`rounded-full transition-all duration-500 ease-in-out ${
                i === active
                  ? 'w-7 h-1.5 bg-white'
                  : 'w-1.5 h-1.5 bg-white/35 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Scroll cue */}
        <a
          href="#wines"
          className="flex flex-col items-center text-white/40 hover:text-white/70 transition-colors duration-300"
          aria-label="Scroll to wines"
        >
          <svg width="14" height="22" viewBox="0 0 14 22" fill="none" className="animate-bounce">
            <path
              d="M7 0v18M1 12l6 6 6-6"
              stroke="currentColor"
              strokeWidth="1.1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </div>
    </section>
  )
}
