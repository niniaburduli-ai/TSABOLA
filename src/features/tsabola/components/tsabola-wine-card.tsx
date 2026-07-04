'use client'

import { formatWinePrice } from '@/shared/utils/format'

import { r } from '../hooks/use-lang'
import { getWineDiscount } from '../hooks/use-wine-discount'

import type { WineItem } from '../types'

type Props = {
  item: WineItem
  lang: 'ka' | 'en'
  onOpen: (wine: WineItem) => void
}

export function TsabolaWineCard({ item, lang, onOpen }: Props) {
  const discount = getWineDiscount(item.price, item.discountPrice)

  return (
    <article className="group flex flex-col bg-white border border-border-wine hover:border-wine/60 transition-colors duration-300">
      {/* Image */}
      {item.image ? (
        <button
          type="button"
          onClick={() => onOpen(item)}
          aria-label={r(item.name, lang)}
          className={
            'w-full h-80 bg-cream/20 flex items-center justify-center p-4 ' +
            'overflow-hidden cursor-pointer focus:outline-none ' +
            'focus-visible:ring-2 focus-visible:ring-wine/50'
          }
        >
          <div className="h-full w-full flex items-center justify-center group-hover:animate-wine-float">
            <img
              src={item.image}
              alt={r(item.name, lang)}
              className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </button>
      ) : (
        <div
          data-placeholder="true"
          className="w-full h-80 bg-gradient-to-br from-wine/10 via-cream to-charcoal/10"
        />
      )}

      <div className="p-6 flex flex-col gap-3 flex-1">
        <span className="inline-block self-start px-2.5 py-0.5 text-xs font-semibold tracking-widest uppercase border border-wine/40 text-wine">
          {r(item.typeBadge, lang)}
        </span>
        <h3 className="font-display text-2xl font-bold text-charcoal">{r(item.name, lang)}</h3>
        {item.details && (
          <div className="border-t border-wine/10 pt-3">
            {r(item.details, lang).split('\n').map((line, i) => (
              <p key={i} className="text-xs text-charcoal/50 leading-relaxed">
                {line}
              </p>
            ))}
          </div>
        )}
        {discount ? (
          <div className="flex flex-wrap items-center gap-2 mt-auto">
            <span className="font-display text-base text-charcoal line-through">
              {formatWinePrice(item.price)}
            </span>
            <span className="font-display text-xl font-bold text-red-600">
              {formatWinePrice(item.discountPrice as string)}
            </span>
            <span className="inline-block px-2 py-0.5 text-xs font-semibold text-white bg-red-600 rounded">
              {lang === 'ka' ? `ფასდაკლება -${discount.percent}%` : `Discount -${discount.percent}%`}
            </span>
          </div>
        ) : (
          <p className="font-display text-xl font-bold text-wine mt-auto">
            {formatWinePrice(item.price)}
          </p>
        )}
      </div>
    </article>
  )
}
