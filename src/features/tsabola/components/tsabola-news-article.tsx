'use client'

import { r } from '../hooks/use-lang'
import { useLanguageStore } from '../store/language-store'

import type { NewsItem } from '../types'

type Props = {
  item: NewsItem
}

export function TsabolaNewsArticle({ item }: Props) {
  const { lang } = useLanguageStore()

  return (
    <article className="max-w-3xl mx-auto px-6 py-16">
      <p className="text-xs uppercase tracking-widest text-wine/70 mb-3">{item.date}</p>
      <h1 className="font-display text-4xl sm:text-5xl font-bold text-charcoal mb-8">{r(item.title, lang)}</h1>

      {item.image && (
        <div className="rounded overflow-hidden bg-charcoal/5 mb-10">
          <img src={item.image} alt={r(item.title, lang)} className="w-full h-auto" />
        </div>
      )}

      <p className="text-charcoal/80 leading-relaxed whitespace-pre-line">{r(item.body, lang)}</p>
    </article>
  )
}
