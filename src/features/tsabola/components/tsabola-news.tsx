'use client'

import Link from 'next/link'
import { useRef } from 'react'

import { TsabolaNewsCard } from './tsabola-news-card'
import { useLang } from '../hooks/use-lang'

const ALL_NEWS_LABEL = { ka: 'ყველა სიახლე', en: 'All News' }
const NO_NEWS_LABEL = { ka: 'სიახლეები ჯერ არ არის.', en: 'No news yet.' }

export function TsabolaNews() {
  const { t, r } = useLang()
  const items = t.news.items.filter((item) => item.published)
  const scrollerRef = useRef<HTMLDivElement>(null)

  const scrollByCards = (direction: number) => {
    const scroller = scrollerRef.current
    if (!scroller) return
    scroller.scrollBy({ left: direction * (scroller.clientWidth / 3), behavior: 'smooth' })
  }

  return (
    <section id="news" className="bg-white py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold tracking-widest uppercase text-wine/70 mb-3">{r(t.news.subtitle)}</p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-charcoal">{r(t.news.title)}</h2>
          <div className="w-12 h-0.5 bg-wine mx-auto mt-6" />
        </div>

        <div className="flex justify-center mb-12">
          <Link
            href="/news"
            className="px-5 py-2 border border-wine text-wine text-sm font-heading tracking-wide hover:bg-wine hover:text-white transition-colors duration-300"
          >
            {r(ALL_NEWS_LABEL)}
          </Link>
        </div>

        {items.length === 0 ? (
          <p className="text-center text-charcoal/50">{r(NO_NEWS_LABEL)}</p>
        ) : (
          <div className="relative px-10">
            <div
              ref={scrollerRef}
              className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth pb-2 -mx-3"
            >
              {items.map((item) => (
                <div key={item.id} className="snap-start shrink-0 w-1/3 box-border px-3">
                  <TsabolaNewsCard item={item} />
                </div>
              ))}
            </div>

            {items.length > 3 && (
              <>
                <button
                  type="button"
                  onClick={() => scrollByCards(-1)}
                  aria-label="Scroll news left"
                  className={[
                    'absolute left-0 top-1/2 -translate-y-1/2 z-10',
                    'w-10 h-10 rounded-full border border-charcoal/20 bg-white text-charcoal',
                    'flex items-center justify-center',
                    'hover:bg-wine hover:text-white hover:border-wine transition-colors duration-300',
                  ].join(' ')}
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => scrollByCards(1)}
                  aria-label="Scroll news right"
                  className={[
                    'absolute right-0 top-1/2 -translate-y-1/2 z-10',
                    'w-10 h-10 rounded-full border border-charcoal/20 bg-white text-charcoal',
                    'flex items-center justify-center',
                    'hover:bg-wine hover:text-white hover:border-wine transition-colors duration-300',
                  ].join(' ')}
                >
                  →
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
