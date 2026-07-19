'use client'

import { IMAGE_SIZE_SCALE_CLASS } from '@/shared/const/image-size.const'
import { formatWinePrice } from '@/shared/utils/format'

import { r } from '../hooks/use-lang'
import { useTextStyle } from '../hooks/use-text-style'
import { getWineDiscount } from '../hooks/use-wine-discount'

import type { WineItem } from '../types'

type Props = {
  item: WineItem
  lang: 'ka' | 'en'
  onOpen: (wine: WineItem) => void
}

export function TsabolaWineCard({ item, lang, onOpen }: Props) {
  const discount = getWineDiscount(item.price, item.discountPrice)
  const badgeRef = useTextStyle<HTMLSpanElement>('wines', 'badge')
  const nameRef = useTextStyle<HTMLHeadingElement>('wines', 'name')
  const detailsRef = useTextStyle<HTMLParagraphElement>('wines', 'details')
  const priceRef = useTextStyle<HTMLParagraphElement>('wines', 'price')

  return (
    <article
      className={[
        'group flex flex-col sm:flex-row bg-white dark:bg-charcoal border border-border-wine dark:border-cream/10',
        'hover:border-wine/60 transition-colors duration-300',
      ].join(' ')}
    >
      {/* Image */}
      {item.image ? (
        <button
          type="button"
          onClick={() => onOpen(item)}
          aria-label={r(item.name, lang)}
          className={
            'w-full h-80 sm:h-auto sm:w-2/5 sm:order-2 sm:self-stretch bg-cream/20 block ' +
            'overflow-hidden cursor-pointer focus:outline-none ' +
            'focus-visible:ring-2 focus-visible:ring-wine/50'
          }
        >
          <div className="h-full w-full group-hover:animate-wine-float">
            <img
              src={item.image}
              alt={r(item.name, lang)}
              className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${IMAGE_SIZE_SCALE_CLASS[item.imageSize]}`}
              // Continuous focal point (0-100%) has no static Tailwind utility — inline style is the only way to express it.
              style={{ objectPosition: `${item.position.x}% ${item.position.y}%` }}
            />
          </div>
        </button>
      ) : (
        <div
          data-placeholder="true"
          className="w-full h-80 sm:h-auto sm:w-2/5 sm:order-2 sm:self-stretch bg-gradient-to-br from-wine/10 via-cream to-charcoal/10"
        />
      )}

      <div className="p-6 flex flex-col justify-center gap-3 flex-1 sm:order-1 sm:w-3/5">
        <span ref={badgeRef} className="inline-block self-start px-3 py-1 text-sm font-semibold tracking-widest uppercase border border-wine/40 text-wine">
          {r(item.typeBadge, lang)}
        </span>
        <h3 ref={nameRef} className="font-display text-2xl font-bold text-charcoal dark:text-cream">{r(item.name, lang)}</h3>
        {item.details && (
          <div className="border-t border-wine/10 pt-3">
            {r(item.details, lang).split('\n').map((line, i) => (
              <p key={i} ref={detailsRef} className="text-xs text-charcoal/50 dark:text-cream/50 leading-relaxed">
                {line}
              </p>
            ))}
          </div>
        )}
        {discount ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display text-base text-charcoal dark:text-cream line-through">
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
          <p ref={priceRef} className="font-display text-xl font-bold text-wine">
            {formatWinePrice(item.price)}
          </p>
        )}
      </div>
    </article>
  )
}
