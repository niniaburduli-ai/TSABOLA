'use client'

import { useLang } from '../hooks/use-lang'

export function TsabolaNews() {
  const { t, r } = useLang()

  return (
    <section id="news" className="bg-white py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold tracking-widest uppercase text-wine/70 mb-3">{r(t.news.subtitle)}</p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-charcoal">{r(t.news.title)}</h2>
          <div className="w-12 h-0.5 bg-wine mx-auto mt-6" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {t.news.items.map((item) => (
            <div key={item.id} className="border border-charcoal/10 rounded overflow-hidden">
              <div className="aspect-video overflow-hidden">
                {item.image ? (
                  <img src={item.image} alt={r(item.title)} className="w-full h-full object-cover" />
                ) : (
                  <div
                    data-placeholder="true"
                    className="w-full h-full bg-gradient-to-br from-wine/15 via-cream to-charcoal/20"
                  />
                )}
              </div>
              <div className="p-5 space-y-2">
                <p className="text-xs uppercase tracking-widest text-wine/70">{item.date}</p>
                <h3 className="font-display font-bold text-charcoal">{r(item.title)}</h3>
                <p className="text-sm text-charcoal/70">{r(item.body)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
