'use client'

import { useLang } from '../hooks/use-lang'

export function TsabolaHero() {
  const { t, r } = useLang()

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-charcoal"
    >
      {/* Placeholder background */}
      <div
        data-placeholder="true"
        className="absolute inset-0 bg-gradient-to-br from-wine/30 via-charcoal to-charcoal/95"
      />

      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        <div className="w-16 h-px bg-wine mx-auto mb-8" />
        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight">
          {r(t.hero.headline)}
        </h1>
        <div className="w-24 h-0.5 bg-wine mx-auto my-8" />
        <p className="text-cream/80 text-lg sm:text-xl max-w-xl mx-auto leading-relaxed">
          {r(t.hero.subline)}
        </p>
        <a
          href="#wines"
          className={
            'inline-block mt-10 px-8 py-3 border border-wine text-cream ' +
            'text-sm font-medium tracking-widest uppercase ' +
            'hover:bg-wine hover:text-white transition-colors duration-300'
          }
        >
          {r(t.hero.cta)}
        </a>
      </div>
    </section>
  )
}
