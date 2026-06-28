'use client'

import { useLang } from '../hooks/use-lang'

export function TsabolaAbout() {
  const { t, r } = useLang()
  const paragraphs = r(t.about.body).split('\n\n').filter(Boolean)

  return (
    <section id="about" className="bg-cream py-24 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-wine/70 mb-6">
            {r(t.nav.about)}
          </p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-charcoal mb-8">
            {r(t.about.title)}
          </h2>
          {paragraphs.map((p, i) => (
            <p
              key={i}
              className={`text-charcoal/70 leading-relaxed mb-4 ${i === 0 ? 'border-l-2 border-wine pl-4' : ''}`}
            >
              {p}
            </p>
          ))}
        </div>

        <div className="aspect-[3/4] overflow-hidden">
          {t.about.image ? (
            <img
              src={t.about.image}
              alt={r(t.about.imageAlt)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              data-placeholder="true"
              className="w-full h-full bg-gradient-to-b from-wine/20 via-charcoal/10 to-charcoal/30"
            />
          )}
        </div>
      </div>
    </section>
  )
}
