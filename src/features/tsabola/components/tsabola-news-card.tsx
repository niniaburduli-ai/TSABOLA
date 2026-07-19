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
  const dateRef = useTextStyle<HTMLParagraphElement>('news', 'cardDate')
  const titleRef = useTextStyle<HTMLHeadingElement>('news', 'cardTitle')
  const bodyRef = useTextStyle<HTMLParagraphElement>('news', 'cardBody')

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
      <div className="flex flex-col flex-1 p-5 space-y-2">
        <p ref={dateRef} className="text-xs uppercase tracking-widest text-wine">{r(item.date)}</p>
        <h3 ref={titleRef} className="font-display font-bold text-charcoal dark:text-cream line-clamp-2">{r(item.title)}</h3>
        <p ref={bodyRef} className="text-sm text-charcoal/70 dark:text-cream/70 line-clamp-2 flex-1">{r(item.body)}</p>
      </div>
    </Link>
  )
}
