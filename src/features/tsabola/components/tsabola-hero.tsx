'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

import { HERO_ZOOM_CLASS } from '@/shared/const/hero-image.const'
import { useMediaQuery } from '@/shared/hooks/use-media-query'

import { TsabolaLightbox } from './tsabola-lightbox'
import { useLang } from '../hooks/use-lang'
import { useTextStyle } from '../hooks/use-text-style'
import { useSequentialTypewriter } from '../hooks/use-typewriter'

import type { HeroImage } from '../types'

const SLIDE_DURATION = 6000

const FALLBACK_IMAGES: HeroImage[] = [
  { src: '/TSABO WHITE.png', positionMobile: { x: 50, y: 50 }, positionDesktop: { x: 50, y: 50 }, size: 'md' },
  { src: '/TSABO RED.png', positionMobile: { x: 50, y: 50 }, positionDesktop: { x: 50, y: 50 }, size: 'md' },
]

export function TsabolaHero() {
  const { t, r } = useLang()
  const siteNameRef = useTextStyle<HTMLParagraphElement>('hero', 'siteName')
  const sloganRef = useTextStyle<HTMLParagraphElement>('hero', 'slogan')
  const headlineRef = useTextStyle<HTMLHeadingElement>('hero', 'headline')
  const sublineRef = useTextStyle<HTMLParagraphElement>('hero', 'subline')
  const ctaRef = useTextStyle<HTMLAnchorElement>('hero', 'cta')
  const siteName = r(t.site.name)
  const headline = r(t.hero.headline)
  const [active, setActive] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const isDesktop = useMediaQuery('(min-width: 640px)')
  const [siteNameTyped, headlineTyped] = useSequentialTypewriter([siteName, headline], active)

  const images: HeroImage[] = (() => {
    const filtered = (t.hero.images ?? []).filter((image): image is HeroImage => Boolean(image?.src))
    return filtered.length >= 1 ? filtered : FALLBACK_IMAGES
  })()

  useEffect(() => {
    if (lightboxOpen) return
    const id = setInterval(() => {
      setActive(prev => (prev + 1) % images.length)
    }, SLIDE_DURATION)
    return () => clearInterval(id)
  }, [images.length, lightboxOpen])

  return (
    <section id="hero" className="relative w-full aspect-hero-mobile sm:h-hero overflow-hidden bg-charcoal">
      {/* Image slides — crossfade */}
      {images.map((image, i) => {
        const position = isDesktop ? image.positionDesktop : image.positionMobile
        return (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              i === active ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={image.src}
              alt=""
              fill
              priority={i === 0}
              sizes="100vw"
              className={['object-cover', HERO_ZOOM_CLASS[image.size]].join(' ')}
              // Continuous focal point (0-100%) has no static Tailwind utility — inline style is the only way to express it.
              style={{ objectPosition: `${position.x}% ${position.y}%` }}
            />
          </div>
        )
      })}

      {/* Click-to-expand overlay for the currently visible slide */}
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        aria-label="ფოტოს სრულად ნახვა"
        className="absolute inset-0 cursor-zoom-in"
      />

      {/* Bottom vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />

      {/* Text content — bottom center, compact */}
      <div className="absolute bottom-0 left-0 right-0 z-10 flex flex-col items-center text-center px-6 pb-6 pointer-events-none">
        <p
          ref={siteNameRef}
          aria-label={siteName}
          className="animate-rise text-cream text-2xl sm:text-3xl tracking-widest uppercase mb-1 font-heading font-bold"
        >
          <span aria-hidden="true">
            {siteNameTyped.display}
            <span
              className={[
                'inline-block w-px h-6 sm:h-7 ml-0.5 -mb-1 bg-cream/70 align-middle',
                siteNameTyped.typing ? 'animate-pulse' : 'opacity-0',
              ].join(' ')}
            />
          </span>
        </p>
        <p ref={sloganRef} className="animate-rise text-cream/60 text-base tracking-wide uppercase mb-3 font-sans">
          {r(t.site.slogan)}
        </p>
        <h1
          ref={headlineRef}
          aria-label={headline}
          className={[
            'animate-rise animate-rise-1 text-cream text-2xl sm:text-3xl',
            'font-heading font-bold leading-snug mb-1',
            'max-w-2xl text-balance',
          ].join(' ')}
        >
          <span aria-hidden="true">
            {headlineTyped.display}
            <span
              className={[
                'inline-block w-px h-6 sm:h-7 ml-0.5 -mb-1 bg-cream/70 align-middle',
                headlineTyped.typing ? 'animate-pulse' : 'opacity-0',
              ].join(' ')}
            />
          </span>
        </h1>
        <p ref={sublineRef} className="animate-rise animate-rise-2 text-cream/55 text-base font-sans leading-relaxed mb-4 max-w-xs">
          {r(t.hero.subline)}
        </p>
        <a
          ref={ctaRef}
          href="#wines"
          className={[
            'hero-cta animate-rise animate-rise-3 px-5 py-2 border border-cream/35',
            'text-cream text-base font-heading tracking-wide pointer-events-auto',
            'hover:bg-cream transition-colors duration-300',
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

      {lightboxOpen && (
        <TsabolaLightbox
          images={images.map(image => image.src)}
          index={active}
          onClose={() => setLightboxOpen(false)}
          onPrev={() => setActive(prev => (prev - 1 + images.length) % images.length)}
          onNext={() => setActive(prev => (prev + 1) % images.length)}
        />
      )}
    </section>
  )
}
