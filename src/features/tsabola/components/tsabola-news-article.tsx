'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { useLang } from '../hooks/use-lang'

import type { L, NewsItem } from '../types'

export type NewsNavTarget = { slug: string; title: L }

const PREV_LABEL = { ka: 'წინა სიახლე', en: 'Previous' }
const NEXT_LABEL = { ka: 'შემდეგი სიახლე', en: 'Next' }

type Props = {
  item: NewsItem
  prev: NewsNavTarget | null
  next: NewsNavTarget | null
}

export function TsabolaNewsArticle({ item, prev, next }: Props) {
  const { r } = useLang()
  const router = useRouter()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && next) router.push(`/news/${next.slug}`)
      if (e.key === 'ArrowLeft' && prev) router.push(`/news/${prev.slug}`)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [prev, next, router])

  return (
    <article className="max-w-3xl mx-auto px-6 py-16">
      <p className="text-xs uppercase tracking-widest text-wine mb-3">{r(item.date)}</p>
      <h1 className="font-display text-4xl sm:text-5xl font-bold text-charcoal dark:text-cream mb-8">{r(item.title)}</h1>

      {item.image && (
        <div className="rounded overflow-hidden bg-charcoal/5 mb-10">
          <img src={item.image} alt={r(item.title)} className="w-full h-auto" />
        </div>
      )}

      <p className="text-charcoal/80 dark:text-cream/80 leading-relaxed whitespace-pre-line">{r(item.body)}</p>

      {(prev || next) && (
        <div className="flex items-center justify-between gap-4 mt-16 pt-8 border-t border-charcoal/10 dark:border-cream/10">
          {prev ? (
            <Link href={`/news/${prev.slug}`} className="group flex flex-col text-left">
              <span className="text-xs uppercase tracking-widest text-wine mb-1">← {r(PREV_LABEL)}</span>
              <span className="text-sm text-charcoal/70 dark:text-cream/70 group-hover:text-wine transition-colors">
                {r(prev.title)}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/news/${next.slug}`} className="group flex flex-col text-right">
              <span className="text-xs uppercase tracking-widest text-wine mb-1">{r(NEXT_LABEL)} →</span>
              <span className="text-sm text-charcoal/70 dark:text-cream/70 group-hover:text-wine transition-colors">
                {r(next.title)}
              </span>
            </Link>
          ) : (
            <span />
          )}
        </div>
      )}
    </article>
  )
}
