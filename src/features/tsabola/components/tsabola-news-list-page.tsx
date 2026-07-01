'use client'

import { TsabolaFooter } from './tsabola-footer'
import { TsabolaHeader } from './tsabola-header'
import { TsabolaNewsGrid } from './tsabola-news-grid'
import { useLang } from '../hooks/use-lang'

import type { NewsItem } from '../types'

type Props = {
  items: NewsItem[]
}

export function TsabolaNewsListPage({ items }: Props) {
  const { t, r } = useLang()

  return (
    <div className="flex flex-col min-h-screen">
      <TsabolaHeader />
      <main className="flex-1 max-w-6xl mx-auto px-6 py-16 w-full">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold tracking-widest uppercase text-wine/70 mb-3">{r(t.news.subtitle)}</p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-charcoal">{r(t.news.title)}</h1>
          <div className="w-12 h-0.5 bg-wine mx-auto mt-6" />
        </div>
        <TsabolaNewsGrid items={items} />
      </main>
      <TsabolaFooter />
    </div>
  )
}
