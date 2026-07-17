'use client'

import { TsabolaNewsCard } from './tsabola-news-card'
import { useLang } from '../hooks/use-lang'

import type { NewsItem } from '../types'

const NO_NEWS_LABEL = { ka: 'სიახლეები ჯერ არ არის.', en: 'No news yet.' }

type Props = {
  items: NewsItem[]
}

export function TsabolaNewsGrid({ items }: Props) {
  const { r } = useLang()

  if (items.length === 0) {
    return <p className="text-center text-charcoal/50 dark:text-cream/50 py-24">{r(NO_NEWS_LABEL)}</p>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <TsabolaNewsCard key={item.id} item={item} />
      ))}
    </div>
  )
}
