'use client'

import Link from 'next/link'

import { IMAGE_SIZE_SCALE_CLASS } from '@/shared/const/image-size.const'

import { useLang } from '../hooks/use-lang'
import { useTextStyle } from '../hooks/use-text-style'

import type { NewsItem } from '../types'

type Props = {
  item: NewsItem
}

export function TsabolaNewsCard({ item }: Props) {
  const { r } = useLang()
  const dateStyle = useTextStyle('news', 'cardDate')
  const titleStyle = useTextStyle('news', 'cardTitle')
  const bodyStyle = useTextStyle('news', 'cardBody')

  return (
    <Link
      href={`/news/${item.slug}`}
      className={[
        'flex flex-col h-full border border-charcoal/10 dark:border-cream/10 rounded overflow-hidden',
        'bg-gradient-to-b from-white to-charcoal/5 dark:from-charcoal dark:to-black/40',
        'shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl',
      ].join(' ')}
    >
      <div className="aspect-video overflow-hidden shrink-0">
        {item.image ? (
          <img
            src={item.image}
            alt={r(item.title)}
            className={`w-full h-full object-cover ${IMAGE_SIZE_SCALE_CLASS[item.imageSize]}`}
            // Continuous focal point (0-100%) has no static Tailwind utility — inline style is the only way to express it.
            style={{ objectPosition: `${item.position.x}% ${item.position.y}%` }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-wine/15 via-cream to-charcoal/20" />
        )}
      </div>
      <div className="flex flex-col flex-1 p-6 space-y-3">
        <p style={dateStyle.style} suppressHydrationWarning className={`uppercase tracking-widest text-wine ${dateStyle.className}`}>{r(item.date)}</p>
        <h3
          style={titleStyle.style} suppressHydrationWarning
          className={`font-display font-bold text-charcoal dark:text-cream line-clamp-2 ${titleStyle.className}`}
        >
          {r(item.title)}
        </h3>
        <p
          style={bodyStyle.style}
          suppressHydrationWarning
          className={`text-charcoal/70 dark:text-cream/70 line-clamp-3 flex-1 ${bodyStyle.className}`}
        >
          {r(item.body)}
        </p>
      </div>
    </Link>
  )
}
