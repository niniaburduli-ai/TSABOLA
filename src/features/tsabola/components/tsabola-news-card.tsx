'use client'

import Link from 'next/link'

import { r } from '../hooks/use-lang'
import { useLanguageStore } from '../store/language-store'

import type { NewsItem } from '../types'

type Props = {
  item: NewsItem
}

export function TsabolaNewsCard({ item }: Props) {
  const { lang } = useLanguageStore()

  return (
    <Link
      href={`/news/${item.slug}`}
      className="block border border-charcoal/10 rounded overflow-hidden bg-white transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="aspect-video overflow-hidden">
        {item.image ? (
          <img src={item.image} alt={r(item.title, lang)} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-wine/15 via-cream to-charcoal/20" />
        )}
      </div>
      <div className="p-5 space-y-2">
        <p className="text-xs uppercase tracking-widest text-wine/70">{item.date}</p>
        <h3 className="font-display font-bold text-charcoal">{r(item.title, lang)}</h3>
        <p className="text-sm text-charcoal/70 line-clamp-2">{r(item.body, lang)}</p>
      </div>
    </Link>
  )
}
