'use client'

import { TsabolaNewsCard } from './tsabola-news-card'

import type { NewsItem } from '../types'

type Props = {
  items: NewsItem[]
}

export function TsabolaNewsGrid({ items }: Props) {
  if (items.length === 0) {
    return <p className="text-center text-charcoal/50 py-24">No news yet.</p>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <TsabolaNewsCard key={item.id} item={item} />
      ))}
    </div>
  )
}
