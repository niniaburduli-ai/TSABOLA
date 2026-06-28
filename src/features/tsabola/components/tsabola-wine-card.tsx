'use client'

import { r } from '../hooks/use-lang'

import type { WineItem } from '../types'

interface Props {
  item: WineItem
  lang: 'ka' | 'en'
}

export function TsabolaWineCard({ item, lang }: Props) {
  return (
    <article className="group flex flex-col bg-white border border-border-wine hover:border-wine/60 transition-colors duration-300">
      {/* Image */}
      {item.image ? (
        <img src={item.image} alt={r(item.name, lang)} className="w-full aspect-[4/3] object-cover" />
      ) : (
        <div
          data-placeholder="true"
          className="w-full aspect-[4/3] bg-gradient-to-br from-wine/10 via-cream to-charcoal/10"
        />
      )}

      <div className="p-6 flex flex-col gap-3 flex-1">
        <span className="inline-block self-start px-2.5 py-0.5 text-xs font-semibold tracking-widest uppercase border border-wine/40 text-wine">
          {r(item.typeBadge, lang)}
        </span>
        <h3 className="font-display text-2xl font-bold text-charcoal">{r(item.name, lang)}</h3>
        <p className="text-sm text-charcoal/60 leading-relaxed flex-1">{r(item.description, lang)}</p>
        <p className="font-display text-xl font-bold text-wine mt-auto">{item.price}</p>
      </div>
    </article>
  )
}
