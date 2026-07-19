'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'

import { r } from '../hooks/use-lang'
import { useTextStyle } from '../hooks/use-text-style'

import type { WineItem } from '../types'

type Props = {
  wine: WineItem | null
  lang: 'ka' | 'en'
  open: boolean
  onClose: () => void
}

export function TsabolaWineLightbox({ wine, lang, open, onClose }: Props) {
  const badgeRef = useTextStyle<HTMLSpanElement>('wines', 'badge')
  const nameRef = useTextStyle<HTMLHeadingElement>('wines', 'lightboxName')
  const detailsRef = useTextStyle<HTMLParagraphElement>('wines', 'details')
  const longDescriptionRef = useTextStyle<HTMLParagraphElement>('wines', 'longDescription')
  const metaRef = useTextStyle<HTMLSpanElement>('wines', 'meta')

  useEffect(() => {
    if (!open) return
    document.body.classList.add('overflow-hidden')
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => {
      document.body.classList.remove('overflow-hidden')
      window.removeEventListener('keydown', handler)
    }
  }, [open, onClose])

  if (!open || !wine) return null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={r(wine.name, lang)}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-modal-fade"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className={[
          'relative bg-cream dark:bg-charcoal text-charcoal dark:text-cream w-full max-w-3xl',
          'max-h-screen overflow-y-auto shadow-2xl animate-modal-slide',
        ].join(' ')}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className={[
            'absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center',
            'text-charcoal/40 dark:text-cream/40 hover:text-charcoal dark:hover:text-cream transition-colors',
          ].join(' ')}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        <div className="flex flex-col md:flex-row">
          <div className="md:w-2/5 min-h-64 flex items-center justify-center p-8 bg-white dark:bg-charcoal/60">
            {wine.image ? (
              <img
                src={wine.image}
                alt={r(wine.name, lang)}
                className="max-h-80 w-auto object-contain"
              />
            ) : (
              <div className="w-32 h-64 bg-wine/20 rounded" />
            )}
          </div>

          <div className="md:w-3/5 p-8 flex flex-col gap-4">
            <span ref={badgeRef} className="inline-block self-start px-3 py-1 text-sm font-semibold tracking-widest uppercase border border-wine/40 text-wine">
              {r(wine.typeBadge, lang)}
            </span>

            <h2 ref={nameRef} className="font-display text-3xl font-bold text-charcoal dark:text-cream">
              {r(wine.name, lang)}
            </h2>

            <div className="w-8 h-px bg-wine/60" />

            {wine.details && (
              <div className="flex flex-col gap-1">
                {r(wine.details, lang).split('\n').map((line, i) => (
                  <p key={i} ref={detailsRef} className="text-xs text-charcoal/60 dark:text-cream/60 tracking-wide">
                    {line}
                  </p>
                ))}
              </div>
            )}

            {wine.longDescription && (
              <p ref={longDescriptionRef} className="text-sm text-charcoal/70 dark:text-cream/70 leading-relaxed italic">
                {r(wine.longDescription, lang)}
              </p>
            )}

            {(wine.serveTemp || wine.alcohol || wine.volume) && (
              <div className="flex flex-wrap gap-6 mt-auto pt-4 border-t border-charcoal/10 dark:border-cream/10">
                {wine.serveTemp && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-charcoal/40 dark:text-cream/40 tracking-widest uppercase">
                      {lang === 'ka' ? 'მიირთვით' : 'Serve'}
                    </span>
                    <span ref={metaRef} className="text-sm font-semibold text-charcoal dark:text-cream">{wine.serveTemp}</span>
                  </div>
                )}
                {wine.alcohol && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-charcoal/40 dark:text-cream/40 tracking-widest uppercase">
                      {lang === 'ka' ? 'ალკ' : 'Alc'}
                    </span>
                    <span ref={metaRef} className="text-sm font-semibold text-charcoal dark:text-cream">{wine.alcohol}</span>
                  </div>
                )}
                {wine.volume && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-charcoal/40 dark:text-cream/40 tracking-widest uppercase">
                      {lang === 'ka' ? 'მოცულობა' : 'Volume'}
                    </span>
                    <span ref={metaRef} className="text-sm font-semibold text-charcoal dark:text-cream">{wine.volume}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
