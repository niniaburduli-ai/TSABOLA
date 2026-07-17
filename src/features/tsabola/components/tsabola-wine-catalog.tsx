'use client'

import { useCallback, useState } from 'react'

import { TsabolaWineCard } from './tsabola-wine-card'
import { TsabolaWineLightbox } from './tsabola-wine-lightbox'
import { useLang } from '../hooks/use-lang'
import { useTextStyle } from '../hooks/use-text-style'

import type { WineItem } from '../types'

export function TsabolaWineCatalog() {
  const { t, lang, r } = useLang()
  const eyebrowRef = useTextStyle<HTMLParagraphElement>('wines', 'eyebrow')
  const headingRef = useTextStyle<HTMLHeadingElement>('wines', 'heading')
  const [activeWine, setActiveWine] = useState<WineItem | null>(null)
  const handleClose = useCallback(() => setActiveWine(null), [])

  return (
    <section id="wines" className="bg-cream dark:bg-charcoal py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p ref={eyebrowRef} className="text-xs font-semibold tracking-widest uppercase text-wine mb-3">
            {r(t.wines.subtitle)}
          </p>
          <h2 ref={headingRef} className="font-display text-4xl sm:text-5xl font-bold text-charcoal dark:text-cream">
            {r(t.wines.title)}
          </h2>
          <div className="w-12 h-0.5 bg-wine mx-auto mt-6" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {t.wines.items.map((wine) => (
            <TsabolaWineCard
              key={wine.id}
              item={wine}
              lang={lang}
              onOpen={setActiveWine}
            />
          ))}
        </div>
      </div>

      <TsabolaWineLightbox
        wine={activeWine}
        lang={lang}
        open={activeWine !== null}
        onClose={handleClose}
      />
    </section>
  )
}
