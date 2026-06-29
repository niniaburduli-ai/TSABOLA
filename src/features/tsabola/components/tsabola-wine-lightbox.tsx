'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'

import { r } from '../hooks/use-lang'

import type { WineItem } from '../types'

type Props = {
  wine: WineItem | null
  lang: 'ka' | 'en'
  open: boolean
  onClose: () => void
}

export function TsabolaWineLightbox({ wine, lang, open, onClose }: Props) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => {
      document.body.style.overflow = prev
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
      <div className="relative bg-charcoal text-cream w-full max-w-3xl max-h-screen overflow-y-auto shadow-2xl animate-modal-slide">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center text-cream/60 hover:text-cream transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        <div className="flex flex-col md:flex-row">
          <div className="md:w-2/5 min-h-64 flex items-center justify-center p-8 bg-charcoal/60">
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
            <span className="inline-block self-start px-2.5 py-0.5 text-xs font-semibold tracking-widest uppercase border border-wine/40 text-wine">
              {r(wine.typeBadge, lang)}
            </span>

            <h2 className="font-display text-3xl font-bold text-cream">
              {r(wine.name, lang)}
            </h2>

            <div className="w-8 h-px bg-wine/60" />

            {wine.details && (
              <div className="flex flex-col gap-1">
                {r(wine.details, lang).split('\n').map((line, i) => (
                  <p key={i} className="text-xs text-cream/60 tracking-wide">
                    {line}
                  </p>
                ))}
              </div>
            )}

            {wine.longDescription && (
              <p className="text-sm text-cream/80 leading-relaxed italic">
                {r(wine.longDescription, lang)}
              </p>
            )}

            {(wine.serveTemp || wine.alcohol || wine.volume) && (
              <div className="flex flex-wrap gap-6 mt-auto pt-4 border-t border-cream/10">
                {wine.serveTemp && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-cream/40 tracking-widest uppercase">
                      {lang === 'ka' ? 'მიირთვით' : 'Serve'}
                    </span>
                    <span className="text-sm font-semibold text-cream">{wine.serveTemp}</span>
                  </div>
                )}
                {wine.alcohol && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-cream/40 tracking-widest uppercase">
                      {lang === 'ka' ? 'ალკ' : 'Alc'}
                    </span>
                    <span className="text-sm font-semibold text-cream">{wine.alcohol}</span>
                  </div>
                )}
                {wine.volume && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-cream/40 tracking-widest uppercase">
                      {lang === 'ka' ? 'მოცულობა' : 'Volume'}
                    </span>
                    <span className="text-sm font-semibold text-cream">{wine.volume}</span>
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
