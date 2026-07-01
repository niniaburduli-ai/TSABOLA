'use client'

import Link from 'next/link'
import { useRef } from 'react'

import { TsabolaNewsCard } from './tsabola-news-card'
import { useLang } from '../hooks/use-lang'

export function TsabolaNews() {
  const { t, r } = useLang()
  const items = t.news.items.filter((item) => item.published)
  const scrollerRef = useRef<HTMLDivElement>(null)

  const scrollByCards = (direction: number) => {
    scrollerRef.current?.scrollBy({ left: direction * 320, behavior: 'smooth' })
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
            All News
          </Link>
        </div>

        {items.length === 0 ? (
          <p className="text-center text-charcoal/50">No news yet.</p>
        ) : (
          <div>
            <div
              ref={scrollerRef}
              className="flex gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth pb-2"
            >
              {items.map((item) => (
                <div key={item.id} className="snap-start flex-shrink-0 w-72 sm:w-80">
                  <TsabolaNewsCard item={item} />
                </div>
              ))}
            </div>

            {items.length > 1 && (
              <div className="flex justify-center gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => scrollByCards(-1)}
                  aria-label="Scroll news left"
                  className={[
                    'w-10 h-10 rounded-full border border-charcoal/20 text-charcoal',
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
                    'w-10 h-10 rounded-full border border-charcoal/20 text-charcoal',
                    'flex items-center justify-center',
                    'hover:bg-wine hover:text-white hover:border-wine transition-colors duration-300',
                  ].join(' ')}
                >
                  →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
