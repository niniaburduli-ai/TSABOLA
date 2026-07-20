'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { TsabolaLightbox } from './tsabola-lightbox'
import { useLang } from '../hooks/use-lang'
import { useTextStyle } from '../hooks/use-text-style'

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
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const dateStyle = useTextStyle('news', 'cardDate')
  const titleStyle = useTextStyle('news', 'articleTitle')
  const bodyStyle = useTextStyle('news', 'articleBody')
  const navLabelStyle = useTextStyle('news', 'cardDate')

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && next) router.push(`/news/${next.slug}`)
      if (e.key === 'ArrowLeft' && prev) router.push(`/news/${prev.slug}`)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [prev, next, router])

  return (
    <article className="max-w-4xl mx-auto px-6 py-16">
      <p
        style={dateStyle.style}
        suppressHydrationWarning
        className={`uppercase tracking-widest text-wine mb-3 ${dateStyle.className}`}
      >
        {r(item.date)}
      </p>
      <h1
        style={titleStyle.style}
        suppressHydrationWarning
        className={`font-display font-bold text-charcoal dark:text-cream mb-8 ${titleStyle.className}`}
      >
        {r(item.title)}
      </h1>

      {item.image && (
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          aria-label="ფოტოს სრულად ნახვა"
          className="block max-w-md mx-auto mb-10 cursor-zoom-in"
        >
          <img src={item.image} alt={r(item.title)} className="w-full h-auto" />
        </button>
      )}

      {lightboxOpen && (
        <TsabolaLightbox
          images={[item.image]}
          index={0}
          onClose={() => setLightboxOpen(false)}
          onPrev={() => {}}
          onNext={() => {}}
        />
      )}

      <p
        style={bodyStyle.style}
        suppressHydrationWarning
        className={`text-charcoal/80 dark:text-cream/80 leading-relaxed whitespace-pre-line ${bodyStyle.className}`}
      >
        {r(item.body)}
      </p>

      {(prev || next) && (
        <div className="flex items-center justify-between gap-4 mt-16 pt-8 border-t border-charcoal/10 dark:border-cream/10">
          {prev ? (
            <div className="flex flex-col text-left">
              <Link href={`/news/${prev.slug}`} className="mb-1 hover:opacity-70 transition-opacity">
                <span
                  style={navLabelStyle.style}
                  suppressHydrationWarning
                  className={`uppercase tracking-widest text-wine ${navLabelStyle.className}`}
                >
                  ← {r(PREV_LABEL)}
                </span>
              </Link>
              <span className="text-base font-semibold text-charcoal dark:text-cream">
                {r(prev.title)}
              </span>
            </div>
          ) : (
            <span />
          )}
          {next ? (
            <div className="flex flex-col text-right">
              <Link href={`/news/${next.slug}`} className="mb-1 hover:opacity-70 transition-opacity">
                <span
                  style={navLabelStyle.style}
                  suppressHydrationWarning
                  className={`uppercase tracking-widest text-wine ${navLabelStyle.className}`}
                >
                  {r(NEXT_LABEL)} →
                </span>
              </Link>
              <span className="text-base font-semibold text-charcoal dark:text-cream">
                {r(next.title)}
              </span>
            </div>
          ) : (
            <span />
          )}
        </div>
      )}
    </article>
  )
}
