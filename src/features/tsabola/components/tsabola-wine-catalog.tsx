'use client'

import { TsabolaWineCard } from './tsabola-wine-card'
import { useLang } from '../hooks/use-lang'

export function TsabolaWineCatalog() {
  const { t, lang, r } = useLang()

  return (
    <section id="wines" className="bg-cream py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold tracking-widest uppercase text-wine/70 mb-3">
            {r(t.nav.wines)}
          </p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-charcoal">
            {r(t.nav.wines)}
          </h2>
          <div className="w-12 h-0.5 bg-wine mx-auto mt-6" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {t.wines.map((wine) => (
            <TsabolaWineCard key={wine.id} item={wine} lang={lang} />
          ))}
        </div>
      </div>
    </section>
  )
}
