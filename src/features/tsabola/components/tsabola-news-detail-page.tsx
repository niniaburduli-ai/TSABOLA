'use client'

import Link from 'next/link'

import { TsabolaFooter } from './tsabola-footer'
import { TsabolaHeader } from './tsabola-header'
import { TsabolaNewsArticle } from './tsabola-news-article'
import { useLang } from '../hooks/use-lang'

import type { NewsItem } from '../types'

type Props = {
  item: NewsItem
}

export function TsabolaNewsDetailPage({ item }: Props) {
  const { t, r } = useLang()

  return (
    <div className="flex flex-col min-h-screen">
      <TsabolaHeader />
      <main className="flex-1 w-full">
        <div className="max-w-3xl mx-auto px-6 pt-10">
          <Link href="/news" className="text-sm text-wine hover:underline">
            ← {r(t.nav.news)}
          </Link>
        </div>
        <TsabolaNewsArticle item={item} />
      </main>
      <TsabolaFooter />
    </div>
  )
}
