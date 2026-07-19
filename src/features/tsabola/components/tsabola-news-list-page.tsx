'use client'

import Link from 'next/link'

import { TsabolaFooter } from './tsabola-footer'
import { TsabolaHeader } from './tsabola-header'
import { TsabolaNewsGrid } from './tsabola-news-grid'
import { useLang } from '../hooks/use-lang'
import { useTextStyle } from '../hooks/use-text-style'

import type { NewsItem } from '../types'

const BACK_TO_MAIN_LABEL = { ka: 'მთავარზე დაბრუნება', en: 'Back to Main' }

type Props = {
  items: NewsItem[]
}

export function TsabolaNewsListPage({ items }: Props) {
  const { t, r } = useLang()
  const eyebrowStyle = useTextStyle('news', 'eyebrow')
  const headingStyle = useTextStyle('news', 'heading')

  return (
    <div className="flex flex-col min-h-screen">
      <TsabolaHeader />
      <main className="flex-1 max-w-6xl mx-auto px-6 py-16 w-full">
        <Link href="/" className="inline-flex items-center text-sm text-wine hover:underline mb-10">
          ← {r(BACK_TO_MAIN_LABEL)}
        </Link>
        <div className="text-center mb-16">
          <p style={eyebrowStyle.style} className={`font-semibold tracking-widest uppercase text-wine mb-3 ${eyebrowStyle.className}`}>{r(t.news.subtitle)}</p>
          <h1 style={headingStyle.style} className={`font-display font-bold text-charcoal dark:text-cream ${headingStyle.className}`}>{r(t.news.title)}</h1>
          <div className="w-12 h-0.5 bg-wine mx-auto mt-6" />
        </div>
        <TsabolaNewsGrid items={items} />
      </main>
      <TsabolaFooter />
    </div>
  )
}
